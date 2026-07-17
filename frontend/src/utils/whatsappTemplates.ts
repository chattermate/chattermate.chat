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

import type { TemplateComponent, WhatsAppTemplate } from '@/services/channels'

const PLACEHOLDER = /\{\{(\d+)\}\}/g

/**
 * Meta supplies an authentication template's verification code as the single
 * body parameter. There is always exactly one, and it never appears as {{n}} in
 * stored text — so it is modelled as variable 1 to reuse the same fill/validate
 * path as an authored template.
 */
const AUTH_CODE_INDEX = 1

/**
 * Authentication copy belongs to Meta and is localised per language — Spanish
 * puts the code mid-sentence, and the button label changes with it — so it is
 * described here, never reproduced. Anything written out in English would be
 * wrong for most templates. The create form fetches the real rendering from
 * Meta's template-previews API.
 */
export const AUTH_DESCRIPTION = 'WhatsApp’s own verification-code message'

export const authSendSummary = (code: string): string =>
  code.trim()
    ? `WhatsApp will send its verification-code message with the code ${code.trim()}.`
    : 'WhatsApp will send its own verification-code message.'

const placeholdersIn = (text: string): number[] => {
  const found = new Set<number>()
  for (const match of text.matchAll(PLACEHOLDER)) found.add(Number(match[1]))
  return [...found].sort((a, b) => a - b)
}

const componentOfType = (template: WhatsAppTemplate, type: string): TemplateComponent | undefined =>
  template.components?.find((c) => c.type?.toUpperCase() === type)

/** The template's message text, which is what the customer actually receives. */
export const templateBody = (template: WhatsAppTemplate): string =>
  componentOfType(template, 'BODY')?.text ?? ''

/**
 * What identifies one template. WhatsApp has no multilingual template: name and
 * language together identify one, so `order_update` in five languages is five
 * templates and Graph returns a row for each.
 *
 * Keying on the name alone therefore treats siblings as the same thing — the
 * list renders duplicate keys, every language of a name highlights as selected
 * at once, and picking a different language is a no-op that silently sends the
 * one already chosen. Meta doesn't return `id` on the list edge (see
 * TEMPLATE_FIELDS in meta_base.py), so the pair is the identity we have.
 */
export const templateKey = (template: WhatsAppTemplate): string =>
  `${template.name}|${template.language ?? ''}`

/** Whether two rows are the same template, not merely same-named. */
export const isSameTemplate = (
  a: WhatsAppTemplate | null | undefined,
  b: WhatsAppTemplate | null | undefined,
): boolean => !!a && !!b && templateKey(a) === templateKey(b)

/**
 * True for an authentication template — a one-time passcode.
 *
 * Meta owns these entirely: the body is its own fixed copy, assembled from
 * add_security_recommendation / code_expiration_minutes, and the verification
 * code is supplied at send time rather than written into the template. So they
 * are read and sent differently from a template we author.
 */
export const isAuthentication = (template: WhatsAppTemplate): boolean =>
  template.category === 'AUTHENTICATION'

/** A placeholder in a non-body text component — a header or footer. */
const hasTextPlaceholderOutsideBody = (component: TemplateComponent): boolean =>
  component.type?.toUpperCase() !== 'BODY' &&
  typeof component.text === 'string' &&
  placeholdersIn(component.text).length > 0

/** A dynamic URL button, e.g. https://example.com/orders/{{1}}. The placeholder
 *  lives in the button's `url`, not in any component `text`. */
const hasUrlPlaceholder = (component: TemplateComponent): boolean =>
  ((component.buttons as { url?: string }[] | undefined) ?? []).some(
    (button) => typeof button.url === 'string' && placeholdersIn(button.url).length > 0,
  )

/** A media header takes an image/video/document parameter at send time. It has
 *  no `text` to scan, so it would otherwise look parameterless. */
const needsMediaParameter = (component: TemplateComponent): boolean =>
  component.type?.toUpperCase() === 'HEADER' &&
  typeof component.format === 'string' &&
  component.format.toUpperCase() !== 'TEXT'

/**
 * True when sending the template would need a parameter we cannot supply.
 *
 * Only body parameters are built here, and Meta rejects a send that doesn't
 * cover every one the template declares — so offering such a template would
 * guarantee a failed send, and it is filtered out rather than shown.
 *
 * Authentication templates are exempt: their one parameter is Meta's own, and
 * buildAuthComponents supplies it, so the rule would wrongly hide every one.
 */
export const hasUnsupportedParameters = (template: WhatsAppTemplate): boolean =>
  !isAuthentication(template) &&
  (template.components ?? []).some(
    (component) =>
      hasTextPlaceholderOutsideBody(component) ||
      hasUrlPlaceholder(component) ||
      needsMediaParameter(component),
  )

/** Meta only lets an APPROVED template be sent; the rest are informational. */
export const isSendable = (template: WhatsAppTemplate): boolean =>
  template.status === 'APPROVED' && !hasUnsupportedParameters(template)

/**
 * The {{n}} placeholders in the body, ascending and de-duplicated.
 *
 * Meta numbers placeholders rather than naming them, and a template may repeat
 * one ({{1}} twice), so the positions are read from the body itself.
 */
export const templateVariables = (template: WhatsAppTemplate): number[] =>
  isAuthentication(template) ? [AUTH_CODE_INDEX] : placeholdersIn(templateBody(template))

/** What to show for a template in a list. An authentication template stores no
 *  body text, and its real copy is Meta's and language-specific, so it is
 *  named rather than quoted. */
export const templatePreviewText = (template: WhatsAppTemplate): string =>
  isAuthentication(template) ? AUTH_DESCRIPTION : templateBody(template)

/** Body text with the agent's values substituted, for previewing before sending. */
export const previewTemplate = (
  template: WhatsAppTemplate,
  values: Record<number, string>,
): string =>
  isAuthentication(template)
    ? authSendSummary(values[AUTH_CODE_INDEX] ?? '')
    : templateBody(template).replace(/\{\{(\d+)\}\}/g, (placeholder, index) =>
        values[Number(index)]?.trim() || placeholder,
      )

/** True once every placeholder has a value — Meta rejects a partial fill. */
export const isTemplateComplete = (
  template: WhatsAppTemplate,
  values: Record<number, string>,
): boolean => templateVariables(template).every((index) => !!values[index]?.trim())

/**
 * Components for sending an authentication template.
 *
 * The code goes in the body *and* in the copy-code button, and Meta requires
 * both: body-only produces a button that copies nothing. The button is
 * addressed as sub_type 'url' at index '0' — that naming is historical, not a
 * mistake; there is no 'otp' sub_type on the send side.
 */
export const buildAuthComponents = (code: string): TemplateComponent[] => {
  // Built twice rather than sharing one array: two components holding the same
  // mutable reference is a trap for whoever edits this next.
  const parameter = () => [{ type: 'text', text: code.trim() }]
  return [
    { type: 'body', parameters: parameter() },
    { type: 'button', sub_type: 'url', index: '0', parameters: parameter() },
  ]
}

/**
 * The `components` payload for a send. Graph matches body parameters strictly by
 * position, so they go in ascending placeholder order; an authored template with
 * no placeholders sends none.
 */
export const buildTemplateComponents = (
  template: WhatsAppTemplate,
  values: Record<number, string>,
): TemplateComponent[] | undefined => {
  if (isAuthentication(template)) {
    return buildAuthComponents(values[AUTH_CODE_INDEX] ?? '')
  }
  const variables = templateVariables(template)
  if (variables.length === 0) return undefined
  return [
    {
      type: 'body',
      parameters: variables.map((index) => ({ type: 'text', text: values[index]?.trim() ?? '' })),
    },
  ]
}
