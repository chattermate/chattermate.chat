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

import { describe, it, expect } from 'vitest'
import { confirmWording, describeOutcome } from '@/webclient/actions/receipts'
import type { ActionOutcome } from '@/webclient/actions/hostActionsClient'

const outcome = (o: Partial<ActionOutcome>): ActionOutcome => ({
  label: 'Set default currency', status: 'ok', preview: null, summary: null, error: null, ...o,
})

describe('describeOutcome', () => {
  it("prefers the page's summary", () => {
    expect(describeOutcome(outcome({ summary: 'Added Globex as a client' })))
      .toEqual({ text: 'Added Globex as a client', tone: 'done' })
  })

  it('shows what changed from a preview', () => {
    expect(describeOutcome(outcome({ preview: { before: 'USD', after: 'GBP' } })).text)
      .toBe('Set default currency: USD → GBP')
  })

  it('falls back to the label when nothing short can be quoted', () => {
    expect(describeOutcome(outcome({ preview: { before: { a: 1 }, after: 'x'.repeat(80) } })).text)
      .toBe('Set default currency: done')
  })

  it('says what was kept on a decline', () => {
    expect(describeOutcome(outcome({ status: 'declined', preview: { before: 'USD', after: 'GBP' } })))
      .toEqual({ text: 'Kept USD', tone: 'skipped' })
    expect(describeOutcome(outcome({ status: 'declined', label: 'Send an invoice' })).text)
      .toBe('Send an invoice: not done')
  })

  it("gives the page's error, or a plain one", () => {
    expect(describeOutcome(outcome({ status: 'error', error: 'Exports are a Pro feature', label: 'Export' })))
      .toEqual({ text: 'Export: Exports are a Pro feature', tone: 'failed' })
    expect(describeOutcome(outcome({ status: 'error' })).text).toBe("Set default currency: it didn't work")
    expect(describeOutcome(outcome({ status: 'timeout' })).text).toBe("Set default currency: the page didn't respond")
  })
})

describe('confirmWording', () => {
  it('uses the action as the verb when always asking', () => {
    expect(confirmWording('Send an invoice', null, null, false)).toEqual({ approve: 'Send an invoice', decline: 'Not now' })
  })

  it('names short values, else stays generic', () => {
    expect(confirmWording('Set currency', 'USD', 'GBP', true)).toEqual({ approve: 'Change to GBP', decline: 'Keep USD' })
    expect(confirmWording('Set currency', { a: 1 }, 'line\nbreak', true)).toEqual({ approve: 'Change it', decline: 'Keep current' })
  })
})
