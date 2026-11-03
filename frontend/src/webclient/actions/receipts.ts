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

/**
 * The one line the chat shows after an in-app action, so the visitor can see
 * what changed on the page (or that nothing did) without hunting for it.
 */

import type { ActionOutcome } from './hostActionsClient'

export type ReceiptTone = 'done' | 'failed' | 'skipped'

export interface ActionReceipt {
  text: string
  tone: ReceiptTone
}

/** A value short enough to quote in one line ("GBP"), else null. */
const QUOTE_MAX_CHARS = 40

function quote(value: unknown): string | null {
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text && text.length <= QUOTE_MAX_CHARS && !text.includes('\n') ? text : null
}

export function describeOutcome(outcome: ActionOutcome): ActionReceipt {
  const before = quote(outcome.preview?.before)
  const after = quote(outcome.preview?.after)
  switch (outcome.status) {
    case 'ok':
      if (outcome.summary) return { text: outcome.summary, tone: 'done' }
      if (before && after) return { text: `${outcome.label}: ${before} → ${after}`, tone: 'done' }
      return { text: `${outcome.label}: done`, tone: 'done' }
    case 'declined':
      return { text: before ? `Kept ${before}` : `${outcome.label}: not done`, tone: 'skipped' }
    case 'timeout':
      return { text: `${outcome.label}: the page didn't respond`, tone: 'failed' }
    default:
      return { text: `${outcome.label}: ${outcome.error || "it didn't work"}`, tone: 'failed' }
  }
}

/** Button wording for the confirm card: what the visitor is agreeing to. */
export function confirmWording(label: string, before: unknown, after: unknown, overwriting: boolean) {
  if (!overwriting) return { approve: label, decline: 'Not now' }
  const from = quote(before)
  const to = quote(after)
  return {
    approve: to ? `Change to ${to}` : 'Change it',
    decline: from ? `Keep ${from}` : 'Keep current',
  }
}
