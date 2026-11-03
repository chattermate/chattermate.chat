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

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createHostActionsClient, detailsOf, DETAILS_MAX, DETAIL_MAX_CHARS, PAGE_GRACE_MS, SUMMARY_MAX_CHARS, PROMPT_MAX_SUGGESTIONS, toHostPrompt, type ActionOutcome, type ActionRequest,
} from '@/webclient/actions/hostActionsClient'

const request = (overrides: Partial<ActionRequest> = {}): ActionRequest => ({
  call_id: 'call-1',
  name: 'open_page',
  label: 'Go to a page',
  args: { path: '/billing' },
  confirm: 'never',
  timeout_s: 5,
  ...overrides,
})

function setup(origin: string | null = 'https://app.example.com') {
  const posted: Record<string, unknown>[] = []
  const emitted: [string, any][] = []
  const confirm = vi.fn()
  const outcomes: ActionOutcome[] = []
  const client = createHostActionsClient({
    postToHost: (m) => posted.push(m),
    emit: (e, d) => emitted.push([e, d]),
    trustedHostOrigin: () => origin,
    onConfirmChange: confirm,
    onOutcome: (o) => outcomes.push(o),
  })
  return { client, posted, emitted, confirm, outcomes }
}

beforeEach(() => vi.useRealTimers())

describe('announcing', () => {
  it('sends the page actions with its origin', () => {
    const { client, emitted } = setup()
    client.handleHostMessage({ type: 'HOST_ACTIONS', names: ['open_page', 7] })
    expect(emitted).toEqual([['actions_available', { names: ['open_page'], host_origin: 'https://app.example.com' }]])
  })

  it('sends nothing for an untrusted page', () => {
    const { client, emitted } = setup(null)
    client.handleHostMessage({ type: 'HOST_ACTIONS', names: ['open_page'] })
    expect(emitted).toEqual([])
  })

  it('re-announces actions and context on a new connection', () => {
    const { client, emitted } = setup()
    client.handleHostMessage({ type: 'HOST_ACTIONS', names: ['open_page'] })
    client.handleHostMessage({ type: 'HOST_CONTEXT', context: { plan: 'free' } })
    emitted.length = 0
    client.announce()
    expect(emitted.map(([e]) => e)).toEqual(['actions_available', 'set_context'])
  })

  it('ignores a context that is not an object', () => {
    const { client, emitted } = setup()
    client.handleHostMessage({ type: 'HOST_CONTEXT', context: ['x'] })
    expect(emitted).toEqual([])
  })

  it('leaves other messages to the widget', () => {
    const { client } = setup()
    expect(client.handleHostMessage({ type: 'HOST_PAGE' })).toBe(false)
  })
})

describe('running', () => {
  it('runs a never-ask action straight away and reports the result', () => {
    const { client, posted, emitted } = setup()
    client.handleRequest(request())
    expect(posted).toEqual([{ type: 'ACTION_RUN', callId: 'call-1', name: 'open_page', args: { path: '/billing' }, timeoutS: 5 }])
    client.handleHostMessage({ type: 'ACTION_DONE', callId: 'call-1', status: 'ok', result: { ok: true } })
    expect(emitted).toEqual([['action_result', { call_id: 'call-1', status: 'ok', confirmed: undefined, result: { ok: true }, error: undefined }]])
  })

  it('reports a page error and drops a late duplicate', () => {
    const { client, emitted } = setup()
    client.handleRequest(request())
    client.handleHostMessage({ type: 'ACTION_DONE', callId: 'call-1', status: 'error', error: 'No access' })
    client.handleHostMessage({ type: 'ACTION_DONE', callId: 'call-1', status: 'ok' })
    expect(emitted).toHaveLength(1)
    expect(emitted[0][1]).toMatchObject({ status: 'error', error: 'No access' })
  })

  it('treats an unknown status from the page as an error', () => {
    const { client, emitted } = setup()
    client.handleRequest(request())
    client.handleHostMessage({ type: 'ACTION_DONE', callId: 'call-1', status: 'weird' })
    expect(emitted[0][1].status).toBe('error')
  })

  it('gives up on a page that never answers', () => {
    vi.useFakeTimers()
    const { client, emitted } = setup()
    client.handleRequest(request({ timeout_s: 5 }))
    vi.advanceTimersByTime(5000 + PAGE_GRACE_MS)
    expect(emitted).toEqual([['action_result', { call_id: 'call-1', status: 'timeout', confirmed: undefined }]])
  })

  it('ignores a replay of a call already running or on screen', () => {
    const { client, posted, confirm } = setup()
    client.handleRequest(request())
    client.handleRequest(request())
    expect(posted.filter((m) => m.type === 'ACTION_RUN')).toHaveLength(1)
    client.handleRequest(request({ call_id: 'call-2', confirm: 'always' }))
    client.handleRequest(request({ call_id: 'call-2', confirm: 'always' }))
    expect(confirm).toHaveBeenCalledTimes(1)
  })

  it('ignores a malformed request', () => {
    const { client, posted } = setup()
    client.handleRequest({} as ActionRequest)
    expect(posted).toEqual([])
  })
})

describe('confirming', () => {
  it('asks first for an always-ask action, then runs it approved', () => {
    const { client, posted, emitted, confirm } = setup()
    client.handleRequest(request({ confirm: 'always' }))
    // Asked for details, but nothing runs until the visitor approves.
    expect(posted).toEqual([{ type: 'ACTION_PREVIEW', callId: 'call-1', name: 'open_page', args: { path: '/billing' } }])
    expect(confirm).toHaveBeenLastCalledWith({ request: expect.objectContaining({ call_id: 'call-1' }), preview: null, details: null })
    client.approve()
    expect(confirm).toHaveBeenLastCalledWith(null)
    client.handleHostMessage({ type: 'ACTION_DONE', callId: 'call-1', status: 'ok' })
    expect(emitted[0][1]).toMatchObject({ status: 'ok', confirmed: true })
  })

  it('reports a decline without running anything', () => {
    const { client, posted, emitted } = setup()
    client.handleRequest(request({ confirm: 'always' }))
    client.decline()
    expect(posted.filter((m) => m.type === 'ACTION_RUN')).toEqual([])
    expect(emitted).toEqual([['action_result', { call_id: 'call-1', status: 'declined', confirmed: false }]])
  })

  it('shows before and after when the page says it would overwrite', () => {
    const { client, posted, confirm } = setup()
    client.handleRequest(request({ confirm: 'when_overwriting' }))
    expect(posted[0]).toMatchObject({ type: 'ACTION_PREVIEW', callId: 'call-1' })
    client.handleHostMessage({ type: 'ACTION_PREVIEW_DONE', callId: 'call-1', preview: { before: 'A', after: 'B' } })
    expect(confirm).toHaveBeenLastCalledWith(expect.objectContaining({ preview: { before: 'A', after: 'B' } }))
  })

  it('runs without asking when nothing would be overwritten', () => {
    const { client, posted, confirm } = setup()
    client.handleRequest(request({ confirm: 'when_overwriting' }))
    client.handleHostMessage({ type: 'ACTION_PREVIEW_DONE', callId: 'call-1', preview: null })
    expect(confirm).not.toHaveBeenCalled()
    expect(posted[1]).toMatchObject({ type: 'ACTION_RUN', callId: 'call-1' })
  })

  it('adds the page\'s details to an always-ask card', () => {
    const { client, confirm } = setup()
    client.handleRequest(request({ confirm: 'always' }))
    client.handleHostMessage({ type: 'ACTION_PREVIEW_DONE', callId: 'call-1', preview: { details: { To: 'billing@acme.example', Amount: 100 } } })
    expect(confirm).toHaveBeenCalledTimes(2)
    expect(confirm).toHaveBeenLastCalledWith(expect.objectContaining({
      preview: null,
      details: [{ key: 'To', value: 'billing@acme.example' }, { key: 'Amount', value: '100' }],
    }))
  })

  it('keeps the card as it is when the page gives no details', () => {
    const { client, confirm } = setup()
    client.handleRequest(request({ confirm: 'always' }))
    client.handleHostMessage({ type: 'ACTION_PREVIEW_DONE', callId: 'call-1', preview: { before: 'A', after: 'B' } })
    client.handleHostMessage({ type: 'ACTION_PREVIEW_DONE', callId: 'call-1', preview: null })
    expect(confirm).toHaveBeenCalledTimes(1)
  })

  it('drops details that arrive after the card was answered', () => {
    const { client, confirm, posted } = setup()
    client.handleRequest(request({ confirm: 'always' }))
    client.approve()
    client.handleHostMessage({ type: 'ACTION_PREVIEW_DONE', callId: 'call-1', preview: { details: { To: 'x' } } })
    expect(confirm).toHaveBeenLastCalledWith(null)
    expect(posted.filter((m) => m.type === 'ACTION_RUN')).toHaveLength(1)
  })

  it('a chip\'s card takes its details without being declined', () => {
    const { client, confirm } = setup()
    const done = vi.fn()
    client.runLocal({ label: 'Send it', kind: 'action', value: 'send_invoice', action: { label: 'Send an invoice', confirm: 'always', timeout_s: 5 } }, done)
    const callId = (confirm.mock.calls[0][0] as { request: ActionRequest }).request.call_id
    client.handleHostMessage({ type: 'ACTION_PREVIEW_DONE', callId, preview: { details: { Invoice: 'INV-001' } } })
    expect(done).not.toHaveBeenCalled()
    expect(confirm).toHaveBeenLastCalledWith(expect.objectContaining({ details: [{ key: 'Invoice', value: 'INV-001' }] }))
  })

  it('approve and decline do nothing without a card', () => {
    const { client, emitted } = setup()
    client.approve()
    client.decline()
    expect(emitted).toEqual([])
  })

  it('dispose clears timers and the card', () => {
    vi.useFakeTimers()
    const { client, emitted, confirm } = setup()
    client.handleRequest(request())
    client.dispose()
    vi.advanceTimersByTime(60_000)
    expect(emitted).toEqual([])
    expect(confirm).toHaveBeenLastCalledWith(null)
  })
})

describe('page prompts', () => {
  it('passes a valid prompt to the widget', () => {
    const onPrompt = vi.fn()
    const client = createHostActionsClient({
      postToHost: () => {}, emit: () => {}, trustedHostOrigin: () => null,
      onConfirmChange: () => {}, onPrompt,
    })
    expect(client.handleHostMessage({ type: 'HOST_PROMPT', message: 'Need help?', suggestions: ['Yes'], open: true })).toBe(true)
    expect(onPrompt).toHaveBeenCalledWith({ message: 'Need help?', chips: [{ label: 'Yes', kind: 'text', value: 'Yes' }], open: true, source: 'host' })
  })

  it('drops empty prompts and trims suggestions', () => {
    expect(toHostPrompt({ message: '  ' })).toBeNull()
    expect(toHostPrompt({ message: 5 })).toBeNull()
    const prompt = toHostPrompt({ message: 'Hi', suggestions: ['a', '', 3, 'b', 'c', 'd', 'e'] })!
    expect(prompt.chips.map((c) => c.label)).toEqual(['a', 'b', 'c', 'd'].slice(0, PROMPT_MAX_SUGGESTIONS))
    expect(prompt.open).toBe(false)
  })
})

describe('local runs (journey action chips)', () => {
  const chip = { label: 'Use GBP', kind: 'action' as const, value: 'set_currency',
                 action: { label: 'Set currency', confirm: 'never' as const, timeout_s: 5 } }

  it('runs on the page and reports to the callback, not the server', () => {
    const { client, posted, emitted } = setup()
    const done = vi.fn()
    client.runLocal(chip, done)
    const run = posted.find((m) => m.type === 'ACTION_RUN')!
    expect(run).toMatchObject({ name: 'set_currency', args: {} })
    client.handleHostMessage({ type: 'ACTION_DONE', callId: run.callId, status: 'ok' })
    expect(done).toHaveBeenCalledWith('ok')
    expect(emitted).toEqual([])
  })

  it('asks first when the action says so, and a no is told to the callback', () => {
    const { client, emitted } = setup()
    const done = vi.fn()
    client.runLocal({ ...chip, action: { ...chip.action, confirm: 'always' } }, done)
    client.decline()
    expect(done).toHaveBeenCalledWith('declined')
    expect(emitted).toEqual([])
  })

  it('runs one at a time: a second click while one runs is refused', () => {
    const { client, posted } = setup()
    expect(client.runLocal(chip, vi.fn())).toBe(true)
    expect(client.runLocal(chip, vi.fn())).toBe(false)
    expect(posted.filter((m) => m.type === 'ACTION_RUN')).toHaveLength(1)
  })

  it("gives way to the agent's confirm: the chip ends declined, the server's card shows", () => {
    const { client, emitted } = setup()
    const done = vi.fn()
    client.runLocal({ ...chip, action: { ...chip.action, confirm: 'always' } }, done)
    client.handleRequest({ call_id: 'call-9', name: 'send_invoice', label: 'Send', args: {}, confirm: 'always', timeout_s: 5 })
    expect(done).toHaveBeenCalledWith('declined')
    client.decline()
    expect(emitted).toEqual([['action_result', { call_id: 'call-9', status: 'declined', confirmed: false }]])
  })

  it('ignores a text chip', () => {
    const { client, posted } = setup()
    client.runLocal({ label: 'Hi', kind: 'text', value: 'Hi' }, vi.fn())
    expect(posted).toEqual([])
  })
})

describe('outcomes (the chat\'s line about each action)', () => {
  it('tells how a run ended, with the page\'s own summary', () => {
    const { client, outcomes } = setup()
    client.handleRequest(request())
    client.handleHostMessage({ type: 'ACTION_DONE', callId: 'call-1', status: 'ok', result: { summary: '  Opened billing ' } })
    expect(outcomes).toEqual([{ label: 'Go to a page', status: 'ok', preview: null, summary: 'Opened billing', error: null }])
  })

  it('carries the approved preview and a page error', () => {
    const { client, outcomes } = setup()
    client.handleRequest(request({ confirm: 'when_overwriting', label: 'Set currency' }))
    client.handleHostMessage({ type: 'ACTION_PREVIEW_DONE', callId: 'call-1', preview: { before: 'USD', after: 'GBP' } })
    client.approve()
    client.handleHostMessage({ type: 'ACTION_DONE', callId: 'call-1', status: 'error', error: 'Locked' })
    expect(outcomes).toEqual([{ label: 'Set currency', status: 'error', preview: { before: 'USD', after: 'GBP' }, summary: null, error: 'Locked' }])
  })

  it('tells a decline, and a chip\'s run the same way', () => {
    const { client, outcomes } = setup()
    client.runLocal({ label: 'Send it', kind: 'action', value: 'send', action: { label: 'Send an invoice', confirm: 'always', timeout_s: 5 } }, vi.fn())
    client.decline()
    expect(outcomes.map((o) => [o.label, o.status])).toEqual([['Send an invoice', 'declined']])
  })

  it('tells a timeout', () => {
    vi.useFakeTimers()
    const { client, outcomes } = setup()
    client.handleRequest(request())
    vi.advanceTimersByTime(5000 + PAGE_GRACE_MS)
    expect(outcomes[0].status).toBe('timeout')
  })

  it('ignores a summary that is not text and caps a long one', () => {
    const { client, outcomes } = setup()
    client.handleRequest(request())
    client.handleHostMessage({ type: 'ACTION_DONE', callId: 'call-1', status: 'ok', result: { summary: 42 } })
    client.handleRequest(request({ call_id: 'call-2' }))
    client.handleHostMessage({ type: 'ACTION_DONE', callId: 'call-2', status: 'ok', result: { summary: 'x'.repeat(500) } })
    expect(outcomes[0].summary).toBeNull()
    expect(outcomes[1].summary).toHaveLength(SUMMARY_MAX_CHARS)
  })
})

describe('detailsOf', () => {
  it('keeps short scalar lines only', () => {
    expect(detailsOf(null)).toBeNull()
    expect(detailsOf({ details: ['a'] })).toBeNull()
    expect(detailsOf({ details: { A: {}, B: '  ', ' ': 'x' } })).toBeNull()
    expect(detailsOf({ details: { Paid: true, ' To ': ' a@b.co ' } })).toEqual([{ key: 'Paid', value: 'true' }, { key: 'To', value: 'a@b.co' }])
  })

  it('caps how many lines and how long each value is', () => {
    const many = Object.fromEntries(Array.from({ length: DETAILS_MAX + 3 }, (_, i) => [`K${i}`, 'v']))
    expect(detailsOf({ details: many })).toHaveLength(DETAILS_MAX)
    expect(detailsOf({ details: { Note: 'x'.repeat(DETAIL_MAX_CHARS + 50) } })![0].value).toHaveLength(DETAIL_MAX_CHARS)
  })
})
