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

import type { CustomerInfo, TransferReason } from '@/types/chat'
import { chatHandler, type HandlerCandidate } from '@/utils/chatState'
import { WAITING_LATE_MINUTES, elapsedLabel, minutesSince } from './inboxTime'

/** Who the conversation is with, by the best thing we know about them. */
export function customerName(customer?: Partial<CustomerInfo> | null): string {
  return customer?.full_name || customer?.email || customer?.phone || 'Visitor'
}

/** A details panel row (DetailsFacts) */
export interface DetailsFact {
  label: string
  value: string
  /** waiting | ai | a sentiment: colours the value */
  tone?: string
}

export type RowChipKind = 'ai' | 'person' | 'waiting' | 'closed' | 'negative' | 'snoozed'

export interface RowChip {
  kind: RowChipKind
  text: string
  /** A wait past WAITING_LATE_MINUTES */
  late?: boolean
}

export interface RowCandidate extends HandlerCandidate {
  agent?: { name?: string; display_name?: string | null; ai_replies_enabled?: boolean } | null
  handed_over_at?: string | null
  updated_at?: string
  sentiment_label?: string | null
  snoozed_until?: string | null
}

/**
 * The chips under a conversation: who has it (the AI, a person, nobody yet)
 * and whether the customer is unhappy. Red is never used: a wait is amber, a
 * bad mood is neutral with a face.
 */
export function rowChips(conv: RowCandidate, currentUserId: string | null, now: Date = new Date()): RowChip[] {
  const handler = chatHandler(conv, currentUserId)
  const chips: RowChip[] = []
  if (handler.kind === 'ai') {
    chips.push({ kind: 'ai', text: `AI · ${conv.agent?.display_name || conv.agent?.name || 'Agent'}` })
  } else if (handler.kind === 'human') {
    chips.push({ kind: 'person', text: handler.label })
  } else if (handler.kind === 'waiting') {
    const since = conv.handed_over_at || conv.updated_at
    const minutes = since ? minutesSince(since, now) : 0
    const late = minutes >= WAITING_LATE_MINUTES
    const waited = since ? elapsedLabel(since, now) : ''
    chips.push({ kind: 'waiting', late, text: [`Waiting ${waited}`.trim(), late ? 'late' : ''].filter(Boolean).join(' · ') })
  } else {
    chips.push({ kind: 'closed', text: 'Closed' })
  }
  if (conv.sentiment_label === 'negative') chips.push({ kind: 'negative', text: 'Negative' })
  if (conv.snoozed_until && new Date(conv.snoozed_until) > now) {
    const until = new Date(conv.snoozed_until)
    const sameDay = until.toDateString() === now.toDateString()
    const when = until.toLocaleString(undefined, sameDay
      ? { hour: '2-digit', minute: '2-digit' }
      : { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    chips.push({ kind: 'snoozed', text: `Snoozed · ${when}` })
  }
  return chips
}

const AVATAR_TONES = ['var(--teal-bg)', 'var(--purple-bg)', 'var(--coral-bg)', 'var(--o12)']

/** A steady avatar tint per conversation, from its id. */
export function avatarTone(seed: string): string {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_TONES[hash % AVATAR_TONES.length]
}

const TRANSFER_REASONS: Record<TransferReason, string> = {
  UNABLE_TO_ANSWER: "Couldn't answer",
  NEED_MORE_INFO: 'Needed more information',
  KNOWLEDGE_GAP: 'No answer in knowledge',
  NEED_TO_CALL: 'Wants a call',
  NEED_TO_EMAIL: 'Wants an email',
  NEED_TO_MEET: 'Wants a meeting',
  FRUSTRATED: 'Customer is frustrated',
  REPEAT_INSTRUCTIONS: 'Kept repeating themselves',
  DIRECT_REQUEST: 'Asked for a person',
  HIGH_PRIORITY_ISSUE: 'High-priority issue',
  COMPLIANCE_ISSUE: 'Compliance issue',
}

/** Why it was handed over, in words; an unknown reason is shown as stored. */
export function transferReasonLabel(reason?: string | null): string | null {
  if (!reason) return null
  return TRANSFER_REASONS[reason as TransferReason] ?? reason
}
