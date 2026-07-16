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
  isAuthentication,
  hasUnsupportedParameters,
  templateBody,
  templatePreviewText,
  templateVariables,
  previewTemplate,
  isTemplateComplete,
  buildAuthComponents,
  buildTemplateComponents,
  AUTH_DESCRIPTION,
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

describe('hasUnsupportedParameters', () => {
  it('is true for a placeholder in a URL button, which lives in url not text', () => {
    // The BUTTONS component has no `text` at all, so a text-only scan misses it
    // and the send would omit the button parameter.
    expect(hasUnsupportedParameters(template('Hi', {
      components: [
        { type: 'BODY', text: 'Hi' },
        { type: 'BUTTONS', buttons: [{ type: 'URL', text: 'Track', url: 'https://x.com/{{1}}' }] },
      ],
    }))).toBe(true)
  })

  it('is false for a static URL button', () => {
    expect(hasUnsupportedParameters(template('Hi', {
      components: [
        { type: 'BODY', text: 'Hi' },
        { type: 'BUTTONS', buttons: [{ type: 'URL', text: 'Shop', url: 'https://x.com/shop' }] },
      ],
    }))).toBe(false)
  })

  it('is true for a media header, which needs a parameter but has no text', () => {
    expect(hasUnsupportedParameters(template('Hi', {
      components: [{ type: 'HEADER', format: 'IMAGE' }, { type: 'BODY', text: 'Hi' }],
    }))).toBe(true)
  })

  it('is false for a plain text header', () => {
    expect(hasUnsupportedParameters(template('Hi', {
      components: [{ type: 'HEADER', format: 'TEXT', text: 'Welcome' }, { type: 'BODY', text: 'Hi' }],
    }))).toBe(false)
  })

  it('is false when only the body has placeholders', () => {
    expect(hasUnsupportedParameters(template('Hi {{1}}'))).toBe(false)
  })

  it('is true for a placeholder in a header', () => {
    expect(hasUnsupportedParameters(template('Hi', {
      components: [{ type: 'HEADER', text: '{{1}}' }, { type: 'BODY', text: 'Hi' }],
    }))).toBe(true)
  })

  it('ignores non-body components without placeholders', () => {
    expect(hasUnsupportedParameters(template('Hi {{1}}', {
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

/**
 * Authentication templates carry no body text — Meta owns the copy and the code
 * is supplied at send time. Everything below guards the consequences of that.
 */
const authTemplate = (extra: Partial<WhatsAppTemplate> = {}): WhatsAppTemplate => ({
  name: 'verification_code',
  status: 'APPROVED',
  category: 'AUTHENTICATION',
  components: [
    { type: 'BODY', add_security_recommendation: true },
    { type: 'FOOTER', code_expiration_minutes: 5 },
    { type: 'BUTTONS', buttons: [{ type: 'OTP', otp_type: 'COPY_CODE', text: 'Copy Code' }] },
  ],
  ...extra,
})

describe('isAuthentication', () => {
  it('is decided by category, not by shape', () => {
    expect(isAuthentication(authTemplate())).toBe(true)
    expect(isAuthentication(template('hi', { category: 'UTILITY' }))).toBe(false)
    expect(isAuthentication(template('hi'))).toBe(false)
  })
})

describe('authentication templates', () => {
  it('stays sendable despite having no body text', () => {
    // Its placeholders are Meta's own, so the "variable outside the body"
    // rule must not filter it out of the picker.
    expect(hasUnsupportedParameters(authTemplate())).toBe(false)
    expect(isSendable(authTemplate())).toBe(true)
  })

  it('asks for exactly one value — the verification code', () => {
    expect(templateVariables(authTemplate())).toEqual([1])
  })

  it('is incomplete until the code is given', () => {
    expect(isTemplateComplete(authTemplate(), {})).toBe(false)
    expect(isTemplateComplete(authTemplate(), { 1: '  ' })).toBe(false)
    expect(isTemplateComplete(authTemplate(), { 1: '123456' })).toBe(true)
  })

  it('describes the copy rather than fabricating it', () => {
    // Meta writes and localises the real sentence — Spanish puts the code
    // mid-sentence — so anything spelled out here would be wrong for most
    // languages. The create form fetches the real rendering from Meta.
    expect(templatePreviewText(authTemplate())).toBe(AUTH_DESCRIPTION)
    expect(previewTemplate(authTemplate(), { 1: '123456' })).toContain('123456')
    expect(previewTemplate(authTemplate(), { 1: '123456' })).not.toContain(
      'is your verification code',
    )
  })

  it('sends the code in both the body and the copy-code button', () => {
    // Body-only leaves the button copying nothing; Meta requires both.
    expect(buildTemplateComponents(authTemplate(), { 1: '123456' })).toEqual([
      { type: 'body', parameters: [{ type: 'text', text: '123456' }] },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: '123456' }],
      },
    ])
  })

  it('never sends undefined components, which would omit the code entirely', () => {
    expect(buildTemplateComponents(authTemplate(), { 1: '123456' })).toBeDefined()
  })
})

describe('buildAuthComponents', () => {
  it('trims the code', () => {
    const [body, button] = buildAuthComponents('  123456  ')
    expect(body.parameters).toEqual([{ type: 'text', text: '123456' }])
    expect(button.parameters).toEqual([{ type: 'text', text: '123456' }])
  })

  it('addresses the OTP button as sub_type url at index 0', () => {
    const [, button] = buildAuthComponents('1')
    expect(button.sub_type).toBe('url')
    expect(button.index).toBe('0')
  })
})
