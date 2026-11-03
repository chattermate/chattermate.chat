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
 * The widget frame's side of journeys. The server owns progress: this client
 * reports what changed on the page (journey_sync) and turns each journey_state
 * into what the chat shows: the step's message and chips, its progress, a
 * notice (a "then" message or block), and an idle nudge.
 */

import type { HostPrompt, PageChip } from '../actions/hostActionsClient'

export interface JourneyView {
  journey_key: string
  journey_name: string
  auto_open: boolean
  step_count: number
  /** Every step's title, in order: the plan the chat shows. */
  step_titles?: string[]
  finished: boolean
  waiting?: boolean
  step_id?: string
  step_index?: number
  title?: string
  message?: string | null
  fresh?: boolean
  chips?: PageChip[]
  skippable?: boolean
  nudge?: { after_min: number; message: string } | null
  notice?: { kind: 'message' | 'block'; text: string } | null
}

export interface JourneyProgress {
  name: string
  /** The step the user is on; equal to `titles.length` once finished. */
  index: number
  count: number
  titles: string[]
  title: string
  skippable: boolean
  finished: boolean
}

function progressOf(view: JourneyView, finished: boolean): JourneyProgress {
  const titles = view.step_titles?.length ? view.step_titles : []
  const count = titles.length || view.step_count
  return {
    name: view.journey_name,
    index: finished ? count : view.step_index ?? 0,
    count,
    titles,
    title: view.title ?? titles[view.step_index ?? 0] ?? '',
    skippable: !finished && !view.waiting && !!view.skippable,
    finished,
  }
}

export interface JourneyDeps {
  emit: (event: string, data: unknown) => void
  /** Show (or clear, with null) the step's message and chips, and the plan. */
  showStep: (prompt: HostPrompt | null, progress: JourneyProgress | null) => void
  /** Add a one-off message to the chat (a notice, the finish message, a nudge). */
  addNotice: (text: string, kind: 'message' | 'block') => void
  /** Ask the page to open the chat. */
  openChat: () => void
  setTimer?: (fn: () => void, ms: number) => unknown
  clearTimer?: (handle: unknown) => void
}

const MINUTE_MS = 60_000

export function createJourneyClient(deps: JourneyDeps) {
  const setTimer = deps.setTimer ?? ((fn, ms) => setTimeout(fn, ms))
  const clearTimer = deps.clearTimer ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>))
  let nudgeTimer: unknown = null
  let nudgedStep: string | null = null

  function stopNudge() {
    if (nudgeTimer !== null) clearTimer(nudgeTimer)
    nudgeTimer = null
  }

  // The step the timer counts for, so a re-sync of the same step (every
  // setContext or route change) doesn't restart the countdown.
  let timedStep: string | null = null
  let lastNudge: { stepId: string; nudge: NonNullable<JourneyView['nudge']> } | null = null

  function startTimer() {
    stopNudge()
    const current = lastNudge
    if (!current || nudgedStep === current.stepId) return
    timedStep = current.stepId
    nudgeTimer = setTimer(() => {
      nudgeTimer = null
      nudgedStep = current.stepId // once per step
      deps.addNotice(current.nudge.message, 'message')
    }, current.nudge.after_min * MINUTE_MS)
  }

  function scheduleNudge(view: JourneyView) {
    lastNudge = view.nudge && view.step_id ? { stepId: view.step_id, nudge: view.nudge } : null
    if (!lastNudge) {
      stopNudge()
      timedStep = null
      return
    }
    if (timedStep === lastNudge.stepId && nudgeTimer !== null) return
    startTimer()
  }

  // A finished plan stays, all ticked, until the visitor hides it: the next
  // sync has no journey to report, and must not take it away.
  let finishedPlan = false

  function handleState(payload: { view: JourneyView | null }) {
    const view = payload?.view ?? null
    if (view?.notice?.text) deps.addNotice(view.notice.text, view.notice.kind)
    if (!view && finishedPlan) return
    finishedPlan = !!view?.finished && !!view.journey_name
    if (!view || view.finished || view.waiting) {
      stopNudge()
      lastNudge = null
      timedStep = null
      // One waiting on its next step still shows where the user is.
      const progress = view?.journey_name ? progressOf(view, !!view.finished) : null
      deps.showStep(null, progress)
      if (view?.finished && view.message) deps.addNotice(view.message, 'message')
      return
    }
    const prompt: HostPrompt | null = view.message
      ? { message: view.message, chips: view.chips ?? [], open: false, source: 'journey' }
      : null
    deps.showStep(prompt, progressOf(view, false))
    if (view.fresh && view.auto_open) deps.openChat()
    scheduleNudge(view)
  }

  /** The visitor did something: the nudge's countdown starts over. */
  function activity() {
    if (nudgeTimer !== null) startTimer()
  }

  return {
    handleState,
    activity,
    sync: (signal: { url?: string | null; event?: string; action?: string } = {}) => deps.emit('journey_sync', signal),
    skip: () => deps.emit('journey_skip', {}),
    dismiss: () => {
      finishedPlan = false
      deps.showStep(null, null)
      deps.emit('journey_dismiss', {})
    },
    start: (key: string) => deps.emit('journey_start', { key }),
    dispose: stopNudge,
  }
}

export type JourneyClient = ReturnType<typeof createJourneyClient>
