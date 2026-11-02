/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * The widget frame's side of in-app actions.
 *
 * The page registers code for its actions through the embed loader
 * (ChatterMate.registerActions). This client tells the server which ones the
 * page has, takes each action_request the server sends, asks the visitor first
 * when the action's policy says so, has the page run it, and reports the outcome
 * as action_result. The server decides what may run; the confirm card is drawn
 * here, by the widget, so the model can never skip it.
 */

export type ConfirmPolicy = 'never' | 'always' | 'when_overwriting'
export type ActionStatus = 'ok' | 'error' | 'declined' | 'timeout'

export interface ActionRequest {
  call_id: string
  name: string
  label: string
  args: Record<string, unknown>
  confirm: ConfirmPolicy
  timeout_s: number
}

export interface ActionPreview {
  before: unknown
  after: unknown
}

/** What the visitor is asked to approve. */
export interface PendingConfirm {
  request: ActionRequest
  /** Set for "asks if overwriting": what changes. */
  preview: ActionPreview | null
}

/** A reply chip: sends its text, or runs one of the page's actions. */
export interface PageChip {
  label: string
  kind: 'text' | 'action'
  value: string
  /** For action chips: how the widget asks and how long the page gets. */
  action?: { label: string; confirm: ConfirmPolicy; timeout_s: number }
}

/** A message shown in the chat on the page's behalf: its prompt(), or a journey step. */
export interface HostPrompt {
  message: string
  chips: PageChip[]
  open: boolean
  source: 'host' | 'journey'
}

/** Longest prompt the widget shows, and how many reply chips it offers. */
export const PROMPT_MAX_CHARS = 2000
export const PROMPT_MAX_SUGGESTIONS = 4

export function toHostPrompt(data: Record<string, unknown>): HostPrompt | null {
  if (typeof data.message !== 'string' || !data.message.trim()) return null
  const chips: PageChip[] = Array.isArray(data.suggestions)
    ? data.suggestions.filter((s): s is string => typeof s === 'string' && !!s.trim())
        .map((s) => ({ label: s.slice(0, 80), kind: 'text' as const, value: s.slice(0, 500) }))
        .slice(0, PROMPT_MAX_SUGGESTIONS)
    : []
  return { message: data.message.slice(0, PROMPT_MAX_CHARS), chips, open: data.open === true, source: 'host' }
}

export interface HostActionsDeps {
  /** Post a message to the embedding page. */
  postToHost: (message: Record<string, unknown>) => void
  /** Send a socket event to the server. */
  emit: (event: string, data: unknown) => void
  /** Origin of the embedding page, or null when it can't be trusted. */
  trustedHostOrigin: () => string | null
  /** Called whenever the card to show changes (null hides it). */
  onConfirmChange: (pending: PendingConfirm | null) => void
  /** The page asked the widget to show a message. */
  onPrompt?: (prompt: HostPrompt) => void
  setTimer?: (fn: () => void, ms: number) => unknown
  clearTimer?: (handle: unknown) => void
}

/** Extra time past an action's own timeout before the widget gives up on the page. */
export const PAGE_GRACE_MS = 2000

export function createHostActionsClient(deps: HostActionsDeps) {
  const setTimer = deps.setTimer ?? ((fn, ms) => setTimeout(fn, ms))
  const clearTimer = deps.clearTimer ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>))

  let names: string[] = []
  let context: Record<string, unknown> | null = null
  let pending: PendingConfirm | null = null
  // Calls the page is running: their give-up timer, and whether the visitor approved them.
  const waiting = new Map<string, { timer: unknown; confirmed: boolean | null }>()
  // Calls the widget itself started (a journey's action chip): told to a callback, not the server.
  const local = new Map<string, (status: ActionStatus) => void>()
  const previews = new Map<string, ActionRequest>()

  /** Tell the server what this page offers. Sent again on every connection. */
  function announce() {
    const hostOrigin = deps.trustedHostOrigin()
    if (hostOrigin && names.length) deps.emit('actions_available', { names, host_origin: hostOrigin })
    if (context) deps.emit('set_context', { context })
  }

  function setNames(value: unknown) {
    names = Array.isArray(value) ? value.filter((n): n is string => typeof n === 'string') : []
    announce()
  }

  function setContext(value: unknown) {
    context = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
    if (context) deps.emit('set_context', { context })
  }

  function report(callId: string, status: ActionStatus, extra: Record<string, unknown> = {}) {
    const running = waiting.get(callId)
    if (running) clearTimer(running.timer)
    waiting.delete(callId)
    const done = local.get(callId)
    if (done) {
      local.delete(callId)
      done(status)
      return
    }
    const confirmed = running?.confirmed ?? undefined
    deps.emit('action_result', { call_id: callId, status, confirmed, ...extra })
  }

  function setPending(next: PendingConfirm | null) {
    pending = next
    deps.onConfirmChange(next)
  }

  function runOnPage(request: ActionRequest, confirmed: boolean | null) {
    const ms = Math.max(1, request.timeout_s) * 1000 + PAGE_GRACE_MS
    waiting.set(request.call_id, { timer: setTimer(() => report(request.call_id, 'timeout'), ms), confirmed })
    deps.postToHost({
      type: 'ACTION_RUN',
      callId: request.call_id,
      name: request.name,
      args: request.args,
      timeoutS: request.timeout_s,
    })
  }

  /** The server asks the page to run an action. */
  function handleRequest(request: ActionRequest) {
    if (!request || typeof request.call_id !== 'string') return
    // A replay (after a reconnect) of a call already running, previewing or on screen.
    if (waiting.has(request.call_id) || previews.has(request.call_id)
      || pending?.request.call_id === request.call_id) return
    if (request.confirm === 'always') {
      setPending({ request, preview: null })
      return
    }
    if (request.confirm === 'when_overwriting') {
      previews.set(request.call_id, request)
      deps.postToHost({ type: 'ACTION_PREVIEW', callId: request.call_id, name: request.name, args: request.args })
      return
    }
    runOnPage(request, null)
  }

  /** A message from the embedding page (via the loader). Returns true if it was ours. */
  function handleHostMessage(data: Record<string, unknown>): boolean {
    switch (data.type) {
      case 'HOST_ACTIONS':
        setNames(data.names)
        return true
      case 'HOST_CONTEXT':
        setContext(data.context)
        return true
      case 'HOST_PROMPT': {
        const prompt = toHostPrompt(data)
        if (prompt) deps.onPrompt?.(prompt)
        return true
      }
      case 'ACTION_PREVIEW_DONE': {
        const request = previews.get(String(data.callId))
        if (!request) return true
        previews.delete(request.call_id)
        const preview = data.preview as ActionPreview | null
        if (preview && typeof preview === 'object') setPending({ request, preview })
        else runOnPage(request, null)
        return true
      }
      case 'ACTION_DONE': {
        const callId = String(data.callId)
        if (!waiting.has(callId)) return true
        const status = (['ok', 'error', 'timeout'] as const).includes(data.status as 'ok')
          ? (data.status as ActionStatus)
          : 'error'
        report(callId, status, {
          result: status === 'ok' ? data.result : undefined,
          error: typeof data.error === 'string' ? data.error : undefined,
        })
        return true
      }
      default:
        return false
    }
  }

  /** The visitor approved the card. */
  function approve() {
    if (!pending) return
    const { request } = pending
    setPending(null)
    runOnPage(request, true)
  }

  /** The visitor said no: the action does not run. */
  function decline() {
    if (!pending) return
    const { request } = pending
    setPending(null)
    const done = local.get(request.call_id)
    if (done) {
      local.delete(request.call_id)
      done('declined')
      return
    }
    deps.emit('action_result', { call_id: request.call_id, status: 'declined', confirmed: false })
  }

  /** Run an action the widget itself started (a chip), with the same asking first. */
  function runLocal(chip: PageChip, onDone: (status: ActionStatus) => void) {
    if (chip.kind !== 'action' || !chip.action) return
    const callId = `chip-${chip.value}-${Date.now()}`
    local.set(callId, onDone)
    handleRequest({
      call_id: callId,
      name: chip.value,
      label: chip.action.label,
      args: {},
      confirm: chip.action.confirm,
      timeout_s: chip.action.timeout_s,
    })
  }

  function dispose() {
    for (const running of waiting.values()) clearTimer(running.timer)
    waiting.clear()
    previews.clear()
    local.clear()
    setPending(null)
  }

  return { announce, handleRequest, handleHostMessage, approve, decline, runLocal, dispose }
}

export type HostActionsClient = ReturnType<typeof createHostActionsClient>
