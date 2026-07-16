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
import type { WhatsAppTemplate } from '../../services/channels'
import {
  isSendable,
  hasUnsupportedVariables,
  templateBody,
  templateVariables,
  previewTemplate,
  isTemplateComplete,
  buildTemplateComponents,
} from '../../utils/whatsappTemplates'

const template = (text: string, extra: Partial<WhatsAppTemplate> = {}): WhatsAppTemplate => ({
  name: 'order_update',
  status: 'APPROVED',
  components: [
    { type: 'HEADER', text: 'Ignore me' },
    { type: 'BODY', text },
  ],
  ...extra,
})

describe('isSendable', () => {
  it('allows only approved templates', () => {
    expect(isSendable(template('hi'))).toBe(true)
    expect(isSendable(template('hi', { status: 'PENDING' }))).toBe(false)
    expect(isSendable(template('hi', { status: 'REJECTED' }))).toBe(false)
  })

  it('rejects an approved template whose variables we cannot fill', () => {
    const headerVariable = template('Hi there', {
      components: [
        { type: 'HEADER', text: 'Order {{1}}' },
        { type: 'BODY', text: 'Hi there' },
      ],
    })
    // Offering this would guarantee a rejected send: only body params are sent.
    expect(isSendable(headerVariable)).toBe(false)
  })
})

describe('hasUnsupportedVariables', () => {
  it('is false when only the body has placeholders', () => {
    expect(hasUnsupportedVariables(template('Hi {{1}}'))).toBe(false)
  })

  it('is true for a placeholder in a header', () => {
    expect(hasUnsupportedVariables(template('Hi', {
      components: [{ type: 'HEADER', text: '{{1}}' }, { type: 'BODY', text: 'Hi' }],
    }))).toBe(true)
  })

  it('ignores non-body components without placeholders', () => {
    expect(hasUnsupportedVariables(template('Hi {{1}}', {
      components: [{ type: 'FOOTER', text: 'Reply STOP' }, { type: 'BODY', text: 'Hi {{1}}' }],
    }))).toBe(false)
  })
})

describe('templateBody', () => {
  it('reads the body, not the header', () => {
    expect(templateBody(template('Hello there'))).toBe('Hello there')
  })

  it('returns empty string when there is no body', () => {
    expect(templateBody({ name: 'x' })).toBe('')
    expect(templateBody({ name: 'x', components: [{ type: 'HEADER', text: 'h' }] })).toBe('')
  })
})

describe('templateVariables', () => {
  it('finds placeholders in ascending order', () => {
    expect(templateVariables(template('Hi {{2}}, order {{1}} shipped'))).toEqual([1, 2])
  })

  it('de-duplicates a placeholder used twice', () => {
    expect(templateVariables(template('Hi {{1}}, bye {{1}}'))).toEqual([1])
  })

  it('returns nothing for a template without placeholders', () => {
    expect(templateVariables(template('No variables here'))).toEqual([])
  })

  it('handles non-contiguous numbering', () => {
    expect(templateVariables(template('{{1}} and {{3}}'))).toEqual([1, 3])
  })
})

describe('previewTemplate', () => {
  it('substitutes filled values and leaves blanks as placeholders', () => {
    const result = previewTemplate(template('Hi {{1}}, order {{2}} shipped'), { 1: 'Ada' })
    expect(result).toBe('Hi Ada, order {{2}} shipped')
  })

  it('replaces every occurrence of a repeated placeholder', () => {
    expect(previewTemplate(template('{{1}} {{1}}'), { 1: 'x' })).toBe('x x')
  })
})

describe('isTemplateComplete', () => {
  it('requires every placeholder to have a non-blank value', () => {
    const t = template('Hi {{1}}, order {{2}}')
    expect(isTemplateComplete(t, { 1: 'Ada', 2: 'A12' })).toBe(true)
    expect(isTemplateComplete(t, { 1: 'Ada' })).toBe(false)
    expect(isTemplateComplete(t, { 1: 'Ada', 2: '   ' })).toBe(false)
  })

  it('is complete when there are no placeholders', () => {
    expect(isTemplateComplete(template('static'), {})).toBe(true)
  })
})

describe('buildTemplateComponents', () => {
  it('sends parameters in placeholder order, not fill order', () => {
    const result = buildTemplateComponents(template('Hi {{2}}, order {{1}}'), { 2: 'Ada', 1: 'A12' })
    expect(result).toEqual([
      { type: 'body', parameters: [{ type: 'text', text: 'A12' }, { type: 'text', text: 'Ada' }] },
    ])
  })

  it('sends no components when the template has no placeholders', () => {
    expect(buildTemplateComponents(template('static'), {})).toBeUndefined()
  })

  it('trims values', () => {
    const result = buildTemplateComponents(template('Hi {{1}}'), { 1: '  Ada  ' })
    expect(result?.[0].parameters).toEqual([{ type: 'text', text: 'Ada' }])
  })
})
