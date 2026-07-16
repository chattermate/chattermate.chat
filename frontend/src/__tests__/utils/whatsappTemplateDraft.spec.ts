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
import {
  LIMITS,
  emptyDraft,
  buttonNeedsValue,
  draftErrors,
  buildAuthoredComponents,
  groupButtons,
  type DraftButton,
  type TemplateDraft,
} from '../../utils/whatsappTemplateDraft'

const draft = (extra: Partial<TemplateDraft> = {}): TemplateDraft => ({
  ...emptyDraft(),
  body: 'Hi {{1}}, your order shipped.',
  ...extra,
})

const button = (extra: Partial<DraftButton> = {}): DraftButton => ({
  type: 'QUICK_REPLY',
  text: 'Thanks',
  value: '',
  ...extra,
})

describe('draftErrors', () => {
  it('accepts a body-only draft', () => {
    expect(draftErrors(draft())).toEqual([])
  })

  it('requires a body', () => {
    expect(draftErrors(draft({ body: '   ' }))).toContain('Message is required.')
  })

  it('enforces Meta’s length limits', () => {
    expect(draftErrors(draft({ header: 'a'.repeat(LIMITS.header + 1) }))).toContainEqual(
      expect.stringContaining('Header must be'),
    )
    expect(draftErrors(draft({ footer: 'a'.repeat(LIMITS.footer + 1) }))).toContainEqual(
      expect.stringContaining('Footer must be'),
    )
    expect(draftErrors(draft({ body: 'a'.repeat(LIMITS.body + 1) }))).toContainEqual(
      expect.stringContaining('Message must be'),
    )
  })

  it('rejects a variable in the header', () => {
    // A header placeholder needs a send-time parameter the picker doesn't build,
    // so Meta would approve it and every send would then fail.
    expect(draftErrors(draft({ header: 'Order {{1}}' }))).toContainEqual(
      expect.stringContaining('Header cannot contain variables'),
    )
  })

  it('rejects a variable in a URL button', () => {
    expect(
      draftErrors(draft({ buttons: [button({ type: 'URL', value: 'https://x.com/{{1}}' })] })),
    ).toContainEqual(expect.stringContaining('cannot use a variable in its URL'))
  })

  it('allows a static URL button', () => {
    expect(
      draftErrors(draft({ buttons: [button({ type: 'URL', value: 'https://x.com/orders' })] })),
    ).toEqual([])
  })

  it('requires a label on every button', () => {
    expect(draftErrors(draft({ buttons: [button({ text: '' })] }))).toContain('Button 1 needs a label.')
  })

  it('requires a value only where the type takes one', () => {
    expect(draftErrors(draft({ buttons: [button({ type: 'URL', value: '' })] }))).toContain(
      'Button 1 needs a URL.',
    )
    expect(draftErrors(draft({ buttons: [button({ type: 'PHONE_NUMBER', value: '' })] }))).toContain(
      'Button 1 needs a phone number.',
    )
    // A quick reply has nothing but a label
    expect(draftErrors(draft({ buttons: [button({ value: '' })] }))).toEqual([])
  })

  it('enforces the per-type button caps', () => {
    const urls = Array.from({ length: LIMITS.URL + 1 }, () =>
      button({ type: 'URL', value: 'https://x.com' }),
    )
    expect(draftErrors(draft({ buttons: urls }))).toContainEqual(expect.stringContaining('At most 2'))

    const phones = Array.from({ length: LIMITS.PHONE_NUMBER + 1 }, () =>
      button({ type: 'PHONE_NUMBER', value: '+15550001111' }),
    )
    expect(draftErrors(draft({ buttons: phones }))).toContainEqual(expect.stringContaining('At most 1'))
  })

  it('enforces the total button cap', () => {
    const many = Array.from({ length: LIMITS.totalButtons + 1 }, () => button())
    expect(draftErrors(draft({ buttons: many }))).toContainEqual(
      expect.stringContaining('at most 10 buttons'),
    )
  })

  it('reports every problem at once, not just the first', () => {
    const errors = draftErrors(draft({ body: '', header: 'x'.repeat(61) }))
    expect(errors.length).toBeGreaterThan(1)
  })
})

describe('buttonNeedsValue', () => {
  it('is true only for the types that carry one', () => {
    expect(buttonNeedsValue('QUICK_REPLY')).toBe(false)
    expect(buttonNeedsValue('URL')).toBe(true)
    expect(buttonNeedsValue('PHONE_NUMBER')).toBe(true)
  })
})

describe('buildAuthoredComponents', () => {
  it('sends the body alone when nothing else is filled', () => {
    expect(buildAuthoredComponents(draft())).toEqual([
      { type: 'BODY', text: 'Hi {{1}}, your order shipped.' },
    ])
  })

  it('omits empty optional parts rather than sending them blank', () => {
    const components = buildAuthoredComponents(draft({ header: '  ', footer: '  ', buttons: [] }))
    expect(components.map((c) => c.type)).toEqual(['BODY'])
  })

  it('orders components the way Meta expects', () => {
    const components = buildAuthoredComponents(
      draft({ header: 'Order update', footer: 'Reply STOP to opt out', buttons: [button()] }),
    )
    expect(components.map((c) => c.type)).toEqual(['HEADER', 'BODY', 'FOOTER', 'BUTTONS'])
  })

  it('marks a header as TEXT format', () => {
    const [header] = buildAuthoredComponents(draft({ header: 'Order update' }))
    expect(header).toEqual({ type: 'HEADER', format: 'TEXT', text: 'Order update' })
  })

  it('maps each button type to its Graph shape', () => {
    const components = buildAuthoredComponents(
      draft({
        buttons: [
          button({ type: 'URL', text: 'Track', value: ' https://x.com/t ' }),
          button({ type: 'PHONE_NUMBER', text: 'Call', value: '+15550001111' }),
          button({ type: 'QUICK_REPLY', text: 'Thanks' }),
        ],
      }),
    )
    expect(components.at(-1)).toEqual({
      type: 'BUTTONS',
      buttons: [
        { type: 'URL', text: 'Track', url: 'https://x.com/t' },
        { type: 'PHONE_NUMBER', text: 'Call', phone_number: '+15550001111' },
        { type: 'QUICK_REPLY', text: 'Thanks' },
      ],
    })
  })

  it('groups same-type buttons together, which Meta requires', () => {
    const components = buildAuthoredComponents(
      draft({
        buttons: [
          button({ type: 'QUICK_REPLY', text: 'A' }),
          button({ type: 'URL', text: 'Site', value: 'https://x.com' }),
          button({ type: 'QUICK_REPLY', text: 'B' }),
        ],
      }),
    )
    const types = (components.at(-1)?.buttons as { type: string }[]).map((b) => b.type)
    // Interleaved on the way in; consecutive on the way out.
    expect(types).toEqual(['URL', 'QUICK_REPLY', 'QUICK_REPLY'])
  })

  it('trims a quick reply to a label with no value key', () => {
    const components = buildAuthoredComponents(draft({ buttons: [button({ text: ' Thanks ' })] }))
    expect((components.at(-1)?.buttons as object[])[0]).toEqual({
      type: 'QUICK_REPLY',
      text: 'Thanks',
    })
  })
})

describe('button value format', () => {
  it('requires an absolute URL', () => {
    expect(
      draftErrors(draft({ buttons: [button({ type: 'URL', value: 'example.com/orders' })] })),
    ).toContainEqual(expect.stringContaining('must start with http'))
    expect(
      draftErrors(draft({ buttons: [button({ type: 'URL', value: 'http://example.com' })] })),
    ).toEqual([])
  })

  it('requires a dialable phone number', () => {
    expect(
      draftErrors(draft({ buttons: [button({ type: 'PHONE_NUMBER', value: 'call us' })] })),
    ).toContainEqual(expect.stringContaining('valid phone number'))
    expect(
      draftErrors(draft({ buttons: [button({ type: 'PHONE_NUMBER', value: '+1 555-000-1111' })] })),
    ).toEqual([])
  })

  it('reports the missing-value error once, not alongside a format error', () => {
    const errors = draftErrors(draft({ buttons: [button({ type: 'URL', value: '' })] }))
    expect(errors).toEqual(['Button 1 needs a URL.'])
  })
})

describe('groupButtons', () => {
  it('is what the editor applies so the visible order is the sent order', () => {
    const grouped = groupButtons([
      button({ type: 'QUICK_REPLY', text: 'A' }),
      button({ type: 'URL', text: 'Site', value: 'https://x.com' }),
      button({ type: 'QUICK_REPLY', text: 'B' }),
    ])
    expect(grouped.map((b) => b.text)).toEqual(['Site', 'A', 'B'])
  })

  it('preserves order within a type', () => {
    const grouped = groupButtons([
      button({ type: 'QUICK_REPLY', text: 'first' }),
      button({ type: 'QUICK_REPLY', text: 'second' }),
    ])
    expect(grouped.map((b) => b.text)).toEqual(['first', 'second'])
  })
})
