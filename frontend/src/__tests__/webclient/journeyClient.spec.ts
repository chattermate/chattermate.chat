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

import { describe, it, expect, vi } from 'vitest'
import { createJourneyClient, type JourneyView } from '@/webclient/journeys/journeyClient'

function setup() {
  const emitted: [string, unknown][] = []
  const showStep = vi.fn()
  const addNotice = vi.fn()
  const openChat = vi.fn()
  vi.useFakeTimers()
  const client = createJourneyClient({ emit: (e, d) => emitted.push([e, d]), showStep, addNotice, openChat })
  return { client, emitted, showStep, addNotice, openChat }
}

const step = (overrides: Partial<JourneyView> = {}): JourneyView => ({
  journey_key: 'first_invoice', journey_name: 'First invoice', auto_open: true, step_count: 3,
  step_titles: ['Set your currency', 'Add a client', 'Send an invoice'],
  finished: false, waiting: false, step_id: 'currency', step_index: 0, title: 'Set your currency',
  message: 'Pick a currency.', fresh: true, chips: [{ label: 'Later', kind: 'text', value: 'Later' }],
  skippable: true, nudge: null, notice: null, ...overrides,
})

describe('journey client', () => {
  it('shows a step with its progress, and opens the chat the first time', () => {
    const { client, showStep, openChat } = setup()
    client.handleState({ view: step() })
    expect(showStep).toHaveBeenCalledWith(
      { message: 'Pick a currency.', chips: [{ label: 'Later', kind: 'text', value: 'Later' }], open: false, source: 'journey' },
      {
        name: 'First invoice', index: 0, count: 3, title: 'Set your currency', skippable: true, finished: false,
        titles: ['Set your currency', 'Add a client', 'Send an invoice'],
      })
    expect(openChat).toHaveBeenCalledTimes(1)
    client.handleState({ view: step({ fresh: false }) })
    expect(openChat).toHaveBeenCalledTimes(1)
  })

  it('does not open the chat for a journey that says not to', () => {
    const { client, openChat } = setup()
    client.handleState({ view: step({ auto_open: false }) })
    expect(openChat).not.toHaveBeenCalled()
  })

  it('clears for nothing, waiting or finished, and shows notices and the finish', () => {
    const { client, showStep, addNotice } = setup()
    client.handleState({ view: null })
    client.handleState({ view: step({ waiting: true, message: null }) })
    client.handleState({ view: step({ finished: true, message: 'All done!', notice: { kind: 'block', text: '`npm i`' } }) })
    expect(showStep.mock.calls.every(([prompt]) => prompt === null)).toBe(true)
    expect(addNotice.mock.calls).toEqual([['`npm i`', 'block'], ['All done!', 'message']])
    // The plan: gone with no journey, kept while waiting, all ticked once finished.
    const plans = showStep.mock.calls.map(([, progress]) => progress)
    expect(plans[0]).toBeNull()
    expect(plans[1]).toMatchObject({ index: 0, finished: false, skippable: false })
    expect(plans[2]).toMatchObject({ index: 3, count: 3, finished: true })
  })

  it('keeps a finished plan through later empty syncs, until hidden', () => {
    const { client, showStep } = setup()
    client.handleState({ view: step({ finished: true, message: null }) })
    client.handleState({ view: null })
    expect(showStep).toHaveBeenCalledTimes(1)
    client.dismiss()
    expect(showStep).toHaveBeenLastCalledWith(null, null)
    client.handleState({ view: null })
    expect(showStep).toHaveBeenLastCalledWith(null, null)
  })

  it('falls back to the step count for a server that sends no titles', () => {
    const { client, showStep } = setup()
    client.handleState({ view: step({ step_titles: undefined }) })
    expect(showStep.mock.calls[0][1]).toMatchObject({ count: 3, titles: [], title: 'Set your currency' })
  })

  it('nudges once per step after the idle time, unless the visitor acts', () => {
    const { client, addNotice } = setup()
    const nudge = { after_min: 3, message: 'Still there?' }
    client.handleState({ view: step({ nudge }) })
    vi.advanceTimersByTime(3 * 60_000)
    expect(addNotice).toHaveBeenCalledWith('Still there?', 'message')
    client.handleState({ view: step({ nudge }) })
    vi.advanceTimersByTime(10 * 60_000)
    expect(addNotice).toHaveBeenCalledTimes(1)

    // Activity starts the countdown over; it doesn't cancel the nudge.
    client.handleState({ view: step({ step_id: 'next', nudge }) })
    vi.advanceTimersByTime(2 * 60_000)
    client.activity()
    vi.advanceTimersByTime(2 * 60_000)
    expect(addNotice).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(60_000)
    expect(addNotice).toHaveBeenCalledTimes(2)
  })

  it('keeps counting when the same step is synced again', () => {
    const { client, addNotice } = setup()
    const nudge = { after_min: 3, message: 'Still there?' }
    client.handleState({ view: step({ nudge }) })
    vi.advanceTimersByTime(2 * 60_000)
    client.handleState({ view: step({ nudge }) }) // a setContext or route change
    vi.advanceTimersByTime(60_000)
    expect(addNotice).toHaveBeenCalledTimes(1)
  })

  it('sends signals', () => {
    const { client, emitted } = setup()
    client.sync({ url: 'https://a/x' })
    client.skip()
    client.dismiss()
    client.start('tour')
    expect(emitted.map(([e]) => e)).toEqual(['journey_sync', 'journey_skip', 'journey_dismiss', 'journey_start'])
    expect(emitted[3][1]).toEqual({ key: 'tour' })
  })
})
