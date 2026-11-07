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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createHostActions } from '@/webclient/loader/hostActions.js'
import {
  api, bringUp, cleanupPage, flush, fromFrame, handshake, loadLoader, resetPage, spyOnFrame,
} from './loaderHarness'

describe('loader host actions', () => {
  let posted: any[]
  let actions: ReturnType<typeof createHostActions>

  beforeEach(() => {
    sessionStorage.clear()
    posted = []
    actions = createHostActions((m: any) => posted.push(m), sessionStorage)
  })

  it('registers valid handlers and announces them', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    actions.register({ open_page: async () => ({ ok: true }), Bad: () => 1, nope: 'x' })
    expect(posted).toEqual([{ type: 'HOST_ACTIONS', names: ['open_page'] }])
    expect(warn).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })

  it('runs a handler and answers with JSON only', async () => {
    actions.register({ open_page: async (args: any) => ({ path: args.path, fn: () => 1 }) })
    actions.handleFrameMessage({ type: 'ACTION_RUN', callId: 'c1', name: 'open_page', args: { path: '/x' }, timeoutS: 5 })
    await flush()
    expect(posted.at(-1)).toEqual({ type: 'ACTION_DONE', callId: 'c1', status: 'ok', result: { path: '/x' } })
  })

  it('reports a thrown error and an unknown action', async () => {
    actions.register({ fail: () => { throw new Error('No permission') } })
    actions.handleFrameMessage({ type: 'ACTION_RUN', callId: 'c1', name: 'fail', args: {} })
    actions.handleFrameMessage({ type: 'ACTION_RUN', callId: 'c2', name: 'ghost', args: {} })
    await flush()
    const done = (id: string) => posted.find((m) => m.type === 'ACTION_DONE' && m.callId === id)
    expect(done('c1')).toMatchObject({ status: 'error', error: 'No permission' })
    expect(done('c2')).toMatchObject({ status: 'error', error: 'This page has no code for that action.' })
  })

  it('times out a handler that never settles', async () => {
    vi.useFakeTimers()
    actions.register({ slow: () => new Promise(() => {}) })
    actions.handleFrameMessage({ type: 'ACTION_RUN', callId: 'c1', name: 'slow', args: {}, timeoutS: 2 })
    await vi.advanceTimersByTimeAsync(2000)
    expect(posted.at(-1)).toEqual({ type: 'ACTION_DONE', callId: 'c1', status: 'timeout' })
    vi.useRealTimers()
  })

  it('never runs a replayed call twice', async () => {
    const run = vi.fn(async () => 'done')
    actions.register({ send_invoice: run })
    actions.handleFrameMessage({ type: 'ACTION_RUN', callId: 'c1', name: 'send_invoice', args: {} })
    await flush()
    actions.handleFrameMessage({ type: 'ACTION_RUN', callId: 'c1', name: 'send_invoice', args: {} })
    await flush()
    expect(run).toHaveBeenCalledTimes(1)
    const done = posted.filter((m) => m.type === 'ACTION_DONE')
    expect(done).toHaveLength(2)
    expect(done[1]).toEqual(done[0])
  })

  it('does not start a second run of a call still running', async () => {
    let finish: (v: string) => void = () => {}
    const run = vi.fn(() => new Promise<string>((resolve) => { finish = resolve }))
    actions.register({ slow: run })
    actions.handleFrameMessage({ type: 'ACTION_RUN', callId: 'c1', name: 'slow', args: {} })
    actions.handleFrameMessage({ type: 'ACTION_RUN', callId: 'c1', name: 'slow', args: {} })
    await flush() // the handler starts on a microtask
    finish('done')
    await flush()
    expect(run).toHaveBeenCalledTimes(1)
    expect(posted.filter((m) => m.type === 'ACTION_DONE')).toHaveLength(1)
  })

  it('previews with the handler, or null without one', async () => {
    actions.register({
      set_currency: { run: async () => 1, preview: async () => ({ before: 'USD', after: 'GBP' }) },
      open_page: async () => 1,
    })
    actions.handleFrameMessage({ type: 'ACTION_PREVIEW', callId: 'c1', name: 'set_currency', args: {} })
    actions.handleFrameMessage({ type: 'ACTION_PREVIEW', callId: 'c2', name: 'open_page', args: {} })
    await flush()
    const preview = (id: string) => posted.find((m) => m.type === 'ACTION_PREVIEW_DONE' && m.callId === id)
    expect(preview('c1').preview).toEqual({ before: 'USD', after: 'GBP' })
    expect(preview('c2').preview).toBeNull()
  })

  it('passes context as plain JSON', () => {
    actions.setContext({ plan: 'free', when: new Date(0) })
    actions.setContext('nope')
    expect(posted).toEqual([{ type: 'HOST_CONTEXT', context: { plan: 'free', when: '1970-01-01T00:00:00.000Z' } }])
  })

  it('forgets every action and the context on reset', async () => {
    actions.register({ open_page: async () => ({ ok: true }) })
    actions.setContext({ plan: 'free' })
    posted.length = 0
    actions.reset()
    expect(posted).toEqual([{ type: 'HOST_ACTIONS', names: [] }, { type: 'HOST_CONTEXT', context: {} }])
    actions.handleFrameMessage({ type: 'ACTION_RUN', callId: 'c9', name: 'open_page', args: {}, timeoutS: 5 })
    await flush()
    expect(posted.at(-1)).toMatchObject({ type: 'ACTION_DONE', callId: 'c9', status: 'error' })
  })

  it('leaves other frame messages alone', () => {
    expect(actions.handleFrameMessage({ type: 'UNREAD_COUNT' })).toBe(false)
  })
})

describe('ChatterMate.registerActions through the loader', () => {
  beforeEach(resetPage)
  afterEach(cleanupPage)

  it('reaches the frame only once the widget mounts, and runs on request', async () => {
    await loadLoader()
    api().registerActions({ open_page: async () => ({ ok: true }) })
    api().setContext({ plan: 'free' })
    handshake()
    const post = spyOnFrame()
    expect(post.mock.calls.find(([m]: any) => m.type === 'HOST_ACTIONS')).toBeUndefined()

    fromFrame({ type: 'WIDGET_READY' })
    const sent = post.mock.calls.map(([m]: any) => m)
    expect(sent).toContainEqual({ type: 'HOST_ACTIONS', names: ['open_page'] })
    expect(sent).toContainEqual({ type: 'HOST_CONTEXT', context: { plan: 'free' } })

    fromFrame({ type: 'ACTION_RUN', callId: 'c1', name: 'open_page', args: {}, timeoutS: 5 })
    await flush()
    expect(post.mock.calls.map(([m]: any) => m)).toContainEqual(
      { type: 'ACTION_DONE', callId: 'c1', status: 'ok', result: { ok: true } })
  })

  it('ignores ACTION_RUN from anything but the widget frame', async () => {
    await loadLoader()
    const run = vi.fn()
    api().registerActions({ open_page: run })
    bringUp()
    fromFrame({ type: 'ACTION_RUN', callId: 'c1', name: 'open_page', args: {} }, { origin: 'https://evil.example' })
    await flush()
    expect(run).not.toHaveBeenCalled()
  })
})

describe('loader host actions storage', () => {
  it('keeps only the most recent answers', async () => {
    sessionStorage.clear()
    const posted: any[] = []
    const actions = createHostActions((m: any) => posted.push(m), sessionStorage)
    actions.register({ open_page: async () => 1 })
    for (let i = 0; i < 60; i++) {
      actions.handleFrameMessage({ type: 'ACTION_RUN', callId: `c${i}`, name: 'open_page', args: {} })
      await flush()
    }
    const kept = JSON.parse(sessionStorage.getItem('cm_action_results') || '[]')
    expect(kept).toHaveLength(50)
    expect(kept[0][0]).toBe('c10')
  })

  it('does not cache a call the page had no code for', async () => {
    sessionStorage.clear()
    const posted: any[] = []
    const actions = createHostActions((m: any) => posted.push(m), sessionStorage)
    actions.handleFrameMessage({ type: 'ACTION_RUN', callId: 'c1', name: 'late', args: {} })
    actions.register({ late: async () => 'ran' })
    actions.handleFrameMessage({ type: 'ACTION_RUN', callId: 'c1', name: 'late', args: {} })
    await flush()
    const done = posted.filter((m) => m.type === 'ACTION_DONE')
    expect(done.map((m) => m.status)).toEqual(['error', 'ok'])
  })
})

describe('ChatterMate.prompt', () => {
  beforeEach(resetPage)
  afterEach(cleanupPage)

  it('holds a prompt until the widget mounts, then shows it once', async () => {
    await loadLoader()
    api().prompt({ message: 'Need help with billing?', suggestions: ['Yes please'] })
    api().prompt({ message: '' })
    handshake()
    const post = spyOnFrame()
    fromFrame({ type: 'WIDGET_READY' })
    const prompts = post.mock.calls.map(([m]: any) => m).filter((m: any) => m.type === 'HOST_PROMPT')
    expect(prompts).toEqual([{ type: 'HOST_PROMPT', message: 'Need help with billing?', suggestions: ['Yes please'], open: false }])
    fromFrame({ type: 'WIDGET_READY' })
    expect(post.mock.calls.filter(([m]: any) => m.type === 'HOST_PROMPT')).toHaveLength(1)
  })
})

describe('ChatterMate.notify and startJourney', () => {
  beforeEach(resetPage)
  afterEach(cleanupPage)

  it('reach the frame once it mounts, in order; bad names are dropped', async () => {
    await loadLoader()
    api().notify('invoice_sent')
    api().notify('Bad Name')
    api().startJourney('first_invoice')
    handshake()
    const post = spyOnFrame()
    fromFrame({ type: 'WIDGET_READY' })
    const signals = post.mock.calls.map(([m]: any) => m).filter((m: any) => ['HOST_EVENT', 'HOST_JOURNEY_START'].includes(m.type))
    expect(signals).toEqual([{ type: 'HOST_EVENT', event: 'invoice_sent' }, { type: 'HOST_JOURNEY_START', key: 'first_invoice' }])
  })

  it('opens the chat when the frame asks', async () => {
    await loadLoader()
    bringUp()
    expect(api().isOpen()).toBe(false)
    fromFrame({ type: 'WIDGET_OPEN_REQUEST' })
    expect(api().isOpen()).toBe(true)
  })
})
