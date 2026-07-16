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
 * True when a placeholder sits outside the body — in a header, or a button URL.
 *
 * Only body variables are supported here, and Meta rejects a send whose
 * parameters don't cover every placeholder. Offering such a template would
 * guarantee a failed send, so it is filtered out rather than shown.
 */
export const hasUnsupportedVariables = (template: WhatsAppTemplate): boolean =>
  (template.components ?? []).some(
    (component) =>
      component.type?.toUpperCase() !== 'BODY' &&
      typeof component.text === 'string' &&
      placeholdersIn(component.text).length > 0,
  )

/** Meta only lets an APPROVED template be sent; the rest are informational. */
export const isSendable = (template: WhatsAppTemplate): boolean =>
  template.status === 'APPROVED' && !hasUnsupportedVariables(template)

/**
 * The {{n}} placeholders in the body, ascending and de-duplicated.
 *
 * Meta numbers placeholders rather than naming them, and a template may repeat
 * one ({{1}} twice), so the positions are read from the body itself.
 */
export const templateVariables = (template: WhatsAppTemplate): number[] =>
  placeholdersIn(templateBody(template))

/** Body text with the agent's values substituted, for previewing before sending. */
export const previewTemplate = (
  template: WhatsAppTemplate,
  values: Record<number, string>,
): string =>
  templateBody(template).replace(/\{\{(\d+)\}\}/g, (placeholder, index) =>
    values[Number(index)]?.trim() || placeholder,
  )

/** True once every placeholder has a value — Meta rejects a partial fill. */
export const isTemplateComplete = (
  template: WhatsAppTemplate,
  values: Record<number, string>,
): boolean => templateVariables(template).every((index) => !!values[index]?.trim())

/**
 * The `components` payload for a send. Graph matches body parameters strictly by
 * position, so they go in ascending placeholder order; a template with no
 * placeholders sends none.
 */
export const buildTemplateComponents = (
  template: WhatsAppTemplate,
  values: Record<number, string>,
): TemplateComponent[] | undefined => {
  const variables = templateVariables(template)
  if (variables.length === 0) return undefined
  return [
    {
      type: 'body',
      parameters: variables.map((index) => ({ type: 'text', text: values[index]?.trim() ?? '' })),
    },
  ]
}
