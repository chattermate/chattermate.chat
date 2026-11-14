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

import type { ConversationNote, Message } from '@/types/chat'

/** A reply you sent: stored with your id, or just sent from this tab (no id back yet) */
export function sentByMe(message: Pick<Message, 'message_type' | 'user_id' | 'client_id'>, currentUserId: string | null): boolean {
  if (message.message_type !== 'agent' && message.message_type !== 'agent_message') return false
  return message.user_id ? message.user_id === currentUserId : !!message.client_id
}

/**
 * Whether you can still edit this reply: yours, stored (it has an id), and
 * sent less than \`editMinutes\` ago. editMinutes is null where the channel
 * can't change a sent message.
 */
export function canEditReply(
  message: Pick<Message, 'id' | 'message_type' | 'user_id' | 'client_id' | 'created_at'>,
  currentUserId: string | null, editMinutes: number | null | undefined, now: Date,
): boolean {
  if (editMinutes == null || typeof message.id !== 'number' || !sentByMe(message, currentUserId)) return false
  return now.getTime() - Date.parse(message.created_at) < editMinutes * 60_000
}

/** A help-center question and its answer, drawn from a conversation */
export interface FaqDraft {
  question: string
  answer: string
}

/** The help center editor with a question and its answer filled in. */
export function faqEditorLink(draft: FaqDraft): string {
  return `/faq?${new URLSearchParams({ question: draft.question, answer: draft.answer }).toString()}`
}

/**
 * Where the handover summary goes in the thread: before the first message
 * written after the handover. Without a handover time (handed over before it
 * was recorded), before the first reply from the team; failing that, last.
 */
export function handoverIndex(messages: Pick<Message, 'created_at' | 'message_type'>[], handedOverAt?: string | null): number {
  if (handedOverAt) {
    const at = new Date(handedOverAt).getTime()
    const after = messages.findIndex((m) => new Date(m.created_at).getTime() > at)
    return after === -1 ? messages.length : after
  }
  const firstReply = messages.findIndex((m) => m.message_type === 'agent')
  return firstReply === -1 ? messages.length : firstReply
}

/** "Today", "Yesterday", or the date: the thread's day separators. */
export function dayLabel(at: string | Date, now: Date = new Date()): string {
  const day = new Date(at)
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOf(now) - startOf(day)) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return day.toLocaleDateString(undefined, {
    weekday: days < 7 ? 'long' : undefined,
    day: 'numeric',
    month: 'short',
    year: day.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  })
}

export type TimelineEntry =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'handover'; key: string }
  | { kind: 'message'; key: string; index: number }
  | { kind: 'note'; key: string; note: ConversationNote }

interface TimelineOptions {
  /** handoverIndex() of the messages, when the handover card shows */
  handoverAt: number | null
  /** When it happened: a handover after every message sits among the notes by this */
  handedOverAt?: string | null
  now?: Date
}

/**
 * The thread in reading order: the messages as they came, the team's notes
 * slotted in by time, the handover card before the first message after the
 * handover, and a day separator above the first entry of each day.
 */
export function buildTimeline(
  messages: Pick<Message, 'created_at' | 'id' | 'client_id'>[],
  notes: ConversationNote[],
  { handoverAt, handedOverAt = null, now = new Date() }: TimelineOptions,
): TimelineEntry[] {
  const dated: Array<{ at: string; entry: TimelineEntry }> = []
  const byTime = [...notes].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  let next = 0
  const notesBefore = (at: string | null) => {
    while (next < byTime.length && (at === null || new Date(byTime[next].created_at) <= new Date(at))) {
      const note = byTime[next++]
      dated.push({ at: note.created_at, entry: { kind: 'note', key: `note-${note.id}`, note } })
    }
  }

  messages.forEach((message, index) => {
    notesBefore(message.created_at)
    if (index === handoverAt) dated.push({ at: message.created_at, entry: { kind: 'handover', key: 'handover' } })
    dated.push({
      at: message.created_at,
      entry: { kind: 'message', key: `m-${message.id ?? message.client_id ?? index}`, index },
    })
  })
  if (handoverAt !== null && handoverAt >= messages.length) {
    // After the last message: before the notes written after it
    if (handedOverAt) notesBefore(handedOverAt)
    dated.push({ at: handedOverAt ?? dated[dated.length - 1]?.at ?? now.toISOString(), entry: { kind: 'handover', key: 'handover' } })
  }
  notesBefore(null)

  const timeline: TimelineEntry[] = []
  let day = ''
  for (const { at, entry } of dated) {
    const label = dayLabel(at, now)
    if (label !== day && entry.kind !== 'handover') {
      timeline.push({ kind: 'day', key: `day-${label}`, label })
      day = label
    }
    timeline.push(entry)
  }
  return timeline
}

/** Shorter than this is not a question an FAQ can answer ("hi", "ok?") */
export const KNOWLEDGE_QUESTION_MIN = 12
/** Shorter than this is not an answer worth publishing ("done", "looking into it now") */
export const KNOWLEDGE_ANSWER_MIN = 40
const QUESTION_MAX = 300
const ANSWER_MAX = 2000

type Draftable = Pick<Message, 'message' | 'message_type'> & { attributes?: Record<string, any> }

/** The customer's question before \`index\`: their last one that asks something, else their last message. */
function questionAt(messages: Draftable[], index: number): string | null {
  let latest: string | null = null
  for (let i = Math.min(index, messages.length) - 1; i >= 0; i--) {
    const m = messages[i]
    // An earlier exchange the team already answered (their notices, such as
    // "you're now connected", answer nothing)
    if (m.message_type === 'agent' && m.attributes?.source !== 'system') break
    if (m.message_type !== 'user' || !m.message?.trim()) continue
    const text = m.message.trim()
    if (text.includes('?')) return text
    latest ??= text
  }
  return latest
}

/** Where the team first replied from \`index\` on (the end when it hasn't). */
function firstTeamReply(messages: Draftable[], index: number): number {
  for (let i = index; i < messages.length; i++) {
    const m = messages[i]
    if (m.message_type === 'agent' && m.attributes?.source !== 'system' && m.message?.trim()) return i
  }
  return messages.length
}

/** The team's reply from \`index\` on: their messages until the customer writes again. */
function teamAnswerFrom(messages: Draftable[], index: number): string | null {
  const parts: string[] = []
  for (let i = index; i < messages.length; i++) {
    const m = messages[i]
    if (m.message_type === 'user') {
      if (parts.length) break
      continue
    }
    if (m.message_type === 'agent' && m.attributes?.source !== 'system' && m.message?.trim()) parts.push(m.message.trim())
  }
  return parts.length ? parts.join('\n\n') : null
}

/** The pair, trimmed to size, when both are worth publishing */
function draftOf(question: string | null, answer: string | null): FaqDraft | null {
  if (!question || question.length < KNOWLEDGE_QUESTION_MIN) return null
  if (!answer || answer.length < KNOWLEDGE_ANSWER_MIN) return null
  return { question: question.slice(0, QUESTION_MAX), answer: answer.slice(0, ANSWER_MAX) }
}

/**
 * The team's latest full answer from \`index\` on: each time they reply (until
 * the customer writes again) is a candidate, and the last one worth publishing
 * wins. A holding reply ("looking into it now") then the real answer gives the
 * real answer.
 */
function latestTeamDraft(messages: Draftable[], index: number): FaqDraft | null {
  let found: FaqDraft | null = null
  for (let at = firstTeamReply(messages, index); at < messages.length;) {
    found = draftOf(questionAt(messages, at), teamAnswerFrom(messages, at)) ?? found
    let next = at
    while (next < messages.length && messages[next].message_type !== 'user') next++
    at = firstTeamReply(messages, next)
  }
  return found
}

/**
 * A help center draft from the conversation, or null when it doesn't hold
 * enough to be worth one:
 * - 'team': from the handover (\`index\` = handoverIndex), the team's latest full
 *   answer and the question it answers: the customer's last one before that
 *   reply, asked before the handover or after it. Nothing until the team has
 *   answered.
 * - 'this': for the AI answer at \`index\`, its question and that answer, to correct.
 */
export function knowledgeDraft(messages: Draftable[], index: number, source: 'team' | 'this'): FaqDraft | null {
  if (source === 'team') return latestTeamDraft(messages, index)
  return draftOf(questionAt(messages, index), messages[index]?.message?.trim() ?? null)
}
