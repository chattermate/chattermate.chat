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

import type { TemplateComponent } from '@/services/channels'

/**
 * Authoring a utility/marketing template: the parts we let people write, and
 * Meta's rules for them. Authentication templates are not drafted here — Meta
 * writes those itself (see whatsappTemplates.ts).
 *
 * Limits are Meta's, from
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/components
 */
export type DraftButtonType = 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'

export interface DraftButton {
  type: DraftButtonType
  text: string
  /** The URL or phone number. Unused for a quick reply. */
  value: string
}

export interface TemplateDraft {
  header: string
  body: string
  footer: string
  buttons: DraftButton[]
}

export const LIMITS = {
  header: 60,
  body: 1024,
  footer: 60,
  buttonText: 25,
  phoneNumber: 20,
  totalButtons: 10,
  QUICK_REPLY: 10,
  URL: 2,
  PHONE_NUMBER: 1,
} as const

export const BUTTON_TYPES: { value: DraftButtonType; label: string; valueLabel: string }[] = [
  { value: 'QUICK_REPLY', label: 'Quick reply', valueLabel: '' },
  { value: 'URL', label: 'Visit website', valueLabel: 'URL' },
  { value: 'PHONE_NUMBER', label: 'Call phone number', valueLabel: 'Phone number' },
]

const PLACEHOLDER = /\{\{\s*\d+\s*\}\}/
/** Meta needs an absolute URL; a bare host is rejected at review. */
const URL_SCHEME = /^https?:\/\/\S+$/i
/** Digits with an optional country code — Meta wants it dialable, not pretty. */
const PHONE_SHAPE = /^\+?[\d\s-]{5,}$/

export const emptyDraft = (): TemplateDraft => ({ header: '', body: '', footer: '', buttons: [] })

export const newButton = (): DraftButton => ({ type: 'QUICK_REPLY', text: '', value: '' })

/** Whether a button carries a URL/phone rather than just a label. */
export const buttonNeedsValue = (type: DraftButtonType): boolean => type !== 'QUICK_REPLY'

const countOf = (buttons: DraftButton[], type: DraftButtonType) =>
  buttons.filter((button) => button.type === type).length

/**
 * Everything wrong with a draft, in the order it appears in the form. Empty
 * means submittable.
 *
 * Variables are rejected outside the body on purpose: a header or URL
 * placeholder needs a matching parameter at send time, which the picker does
 * not build — so Meta would approve the template and every send would then
 * fail. Keeping them out is what lets this ship without touching the send path.
 */
export const draftErrors = (draft: TemplateDraft): string[] => {
  const errors: string[] = []

  if (draft.header.length > LIMITS.header) {
    errors.push(`Header must be ${LIMITS.header} characters or fewer.`)
  }
  if (PLACEHOLDER.test(draft.header)) {
    errors.push('Header cannot contain variables yet — put them in the message instead.')
  }
  if (!draft.body.trim()) {
    errors.push('Message is required.')
  }
  if (draft.body.length > LIMITS.body) {
    errors.push(`Message must be ${LIMITS.body} characters or fewer.`)
  }
  if (draft.footer.length > LIMITS.footer) {
    errors.push(`Footer must be ${LIMITS.footer} characters or fewer.`)
  }

  if (draft.buttons.length > LIMITS.totalButtons) {
    errors.push(`A template can have at most ${LIMITS.totalButtons} buttons.`)
  }
  for (const type of ['QUICK_REPLY', 'URL', 'PHONE_NUMBER'] as DraftButtonType[]) {
    if (countOf(draft.buttons, type) > LIMITS[type]) {
      const label = BUTTON_TYPES.find((b) => b.value === type)?.label ?? type
      errors.push(`At most ${LIMITS[type]} “${label}” button${LIMITS[type] > 1 ? 's' : ''}.`)
    }
  }

  draft.buttons.forEach((button, index) => {
    const position = `Button ${index + 1}`
    if (!button.text.trim()) errors.push(`${position} needs a label.`)
    if (button.text.length > LIMITS.buttonText) {
      errors.push(`${position} label must be ${LIMITS.buttonText} characters or fewer.`)
    }
    if (!buttonNeedsValue(button.type)) return

    // Empty is reported once, as missing — not also as malformed.
    const value = button.value.trim()
    if (!value) {
      errors.push(`${position} needs a ${button.type === 'URL' ? 'URL' : 'phone number'}.`)
      return
    }

    if (button.type === 'URL') {
      if (PLACEHOLDER.test(value)) {
        errors.push(`${position} cannot use a variable in its URL yet.`)
      } else if (!URL_SCHEME.test(value)) {
        errors.push(`${position} URL must start with http:// or https://`)
      }
    }
    if (button.type === 'PHONE_NUMBER') {
      if (value.length > LIMITS.phoneNumber) {
        errors.push(`${position} phone number must be ${LIMITS.phoneNumber} characters or fewer.`)
      } else if (!PHONE_SHAPE.test(value)) {
        errors.push(`${position} needs a valid phone number, with country code.`)
      }
    }
  })

  return errors
}

const toGraphButton = (button: DraftButton): Record<string, unknown> => {
  const base = { type: button.type, text: button.text.trim() }
  if (button.type === 'URL') return { ...base, url: button.value.trim() }
  if (button.type === 'PHONE_NUMBER') return { ...base, phone_number: button.value.trim() }
  return base
}

const TYPE_ORDER: DraftButtonType[] = ['URL', 'PHONE_NUMBER', 'QUICK_REPLY']

/**
 * Meta requires buttons of the same type to be consecutive.
 *
 * Exported so the editor can apply it as the user types: grouping only on the
 * way out would mean the list shows one order and the delivered message has
 * another — baked into a template that is then approved. `filter` is stable, so
 * order within a type is preserved.
 */
export const groupButtons = (buttons: DraftButton[]): DraftButton[] =>
  TYPE_ORDER.flatMap((type) => buttons.filter((button) => button.type === type))

/**
 * The `components` payload for creating the template. Order is Meta's:
 * header, body, footer, buttons — and every optional part is omitted entirely
 * rather than sent empty.
 */
export const buildAuthoredComponents = (draft: TemplateDraft): TemplateComponent[] => {
  const components: TemplateComponent[] = []
  if (draft.header.trim()) {
    components.push({ type: 'HEADER', format: 'TEXT', text: draft.header.trim() })
  }
  components.push({ type: 'BODY', text: draft.body.trim() })
  if (draft.footer.trim()) {
    components.push({ type: 'FOOTER', text: draft.footer.trim() })
  }
  if (draft.buttons.length) {
    components.push({ type: 'BUTTONS', buttons: groupButtons(draft.buttons).map(toGraphButton) })
  }
  return components
}
