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
  DEFAULT_SELECTION,
  defaultSort,
  inboxViewGroups,
  parseSelection,
  selectedViewItem,
  selectionId,
} from '@/components/inbox/inboxViews'
import { avatarTone, customerName, rowChips, transferReasonLabel } from '@/components/inbox/inboxPresentation'
import { elapsedLabel, minutesSince, waitDuration, WAITING_LATE_MINUTES } from '@/components/inbox/inboxTime'
import { buildTimeline, dayLabel, faqEditorLink, handoverIndex, knowledgeDraft } from '@/components/inbox/threadContent'
import { matchMentionables, mentionedIds, mentionParts, mentionQuery } from '@/components/inbox/mentions'
import { channelGlyph, channelLabel } from '@/utils/channelGlyphs'
import type { InboxCounts } from '@/types/chat'

const counts: InboxCounts = {
  open: 27, waiting_for_human: 3, assigned_to_me: 4, ai_handling: 18, mentions: 1, snoozed: 2,
  negative: 2, resolved_by_ai_today: 46, channels: { web: 19, whatsapp: 5, messenger: 2 },
}

const NOW = new Date('2026-11-13T12:00:00Z')
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000).toISOString()

describe('inbox views', () => {
  it('round-trips a selection through its URL id', () => {
    for (const selection of [DEFAULT_SELECTION, { view: 'waiting', channel: null }, { view: 'open', channel: 'whatsapp' }] as const) {
      expect(parseSelection(selectionId(selection))).toEqual(selection)
    }
  })

  it('falls back to All open for anything it does not know', () => {
    expect(parseSelection(undefined)).toEqual(DEFAULT_SELECTION)
    expect(parseSelection('everything')).toEqual(DEFAULT_SELECTION)
    expect(parseSelection('channel:')).toEqual(DEFAULT_SELECTION)
    expect(parseSelection(['mine'])).toEqual(DEFAULT_SELECTION)
  })

  it('lists the waiting queue longest-waiting first, everything else newest first', () => {
    expect(defaultSort({ view: 'waiting', channel: null })).toBe('waiting_longest')
    expect(defaultSort({ view: 'mine', channel: null })).toBe('newest')
    expect(defaultSort({ view: 'open', channel: 'web' })).toBe('newest')
  })

  it('groups the views with their counts, channels busiest first', () => {
    const groups = inboxViewGroups(counts)

    expect(groups.map((g) => g.heading)).toEqual([null, 'AI agents', 'Channels', 'Saved views'])
    expect(groups[0].items.map((i) => [i.label, i.count])).toEqual([
      ['Your inbox', 4], ['Mentions', 1], ['Waiting for a human', 3], ['All open', 27], ['Snoozed', 2],
    ])
    expect(groups[1].items.map((i) => [i.label, i.count])).toEqual([
      ['AI handling now', 18], ['Resolved by AI', 46], ['Closed', null],
    ])
    expect(groups[2].items.map((i) => i.label)).toEqual(['Web chat', 'WhatsApp', 'Messenger'])
    expect(groups[3].items.map((i) => [i.label, i.count])).toEqual([['Negative sentiment', 2]])
  })

  it('keeps a selected channel that just emptied, so the list under it stays put', () => {
    const groups = inboxViewGroups(counts, { view: 'open', channel: 'telegram' })
    const telegram = groups[2].items.find((i) => i.id === 'channel:telegram')

    expect(telegram).toMatchObject({ label: 'Telegram', count: 0, tone: 'channel' })
  })

  it('has no Channels group before any channel has an open conversation, and no counts before they load', () => {
    const groups = inboxViewGroups(null)

    expect(groups.map((g) => g.heading)).toEqual([null, 'AI agents', 'Saved views'])
    expect(groups.flatMap((g) => g.items).every((i) => i.count === null)).toBe(true)
  })

  it('titles the list in full where the pane abbreviates', () => {
    const item = selectedViewItem(inboxViewGroups(counts), { view: 'resolved_by_ai', channel: null })
    expect(item.label).toBe('Resolved by AI')
    expect(item.title).toBe('Resolved by AI today')
  })
})

describe('row chips', () => {
  const base = { status: 'open', user_id: null, group_id: null, agent: { name: 'Shop bot', ai_replies_enabled: true }, updated_at: minutesAgo(1) }

  it('names the AI agent while it answers', () => {
    expect(rowChips(base, 'me', NOW)).toEqual([{ kind: 'ai', text: 'AI · Shop bot' }])
  })

  it('prefers the display name', () => {
    expect(rowChips({ ...base, agent: { name: 'bot', display_name: 'Maya' } }, 'me', NOW)[0].text).toBe('AI · Maya')
  })

  it('says You, or the teammate, once a person holds it', () => {
    expect(rowChips({ ...base, user_id: 'me' }, 'me', NOW)).toEqual([{ kind: 'person', text: 'You' }])
    expect(rowChips({ ...base, user_id: 'asha', user_name: 'Asha' }, 'me', NOW)).toEqual([{ kind: 'person', text: 'Asha' }])
  })

  it('times a wait from the handover, and calls it late past the limit', () => {
    const fresh = rowChips({ ...base, status: 'transferred', handed_over_at: minutesAgo(6) }, 'me', NOW)
    const late = rowChips({ ...base, status: 'transferred', handed_over_at: minutesAgo(WAITING_LATE_MINUTES + 1) }, 'me', NOW)

    expect(fresh).toEqual([{ kind: 'waiting', late: false, text: 'Waiting 6m' }])
    expect(late[0]).toEqual({ kind: 'waiting', late: true, text: 'Waiting 9m · late' })
  })

  it('times a wait with no handover time (an agent that never answers with AI) from the last activity', () => {
    const chip = rowChips({ ...base, agent: { ai_replies_enabled: false }, updated_at: minutesAgo(3) }, 'me', NOW)[0]
    expect(chip).toEqual({ kind: 'waiting', late: false, text: 'Waiting 3m' })
  })

  it('marks an unhappy customer, and a closed chat', () => {
    expect(rowChips({ ...base, sentiment_label: 'negative' }, 'me', NOW).map((c) => c.kind)).toEqual(['ai', 'negative'])
    expect(rowChips({ ...base, status: 'closed' }, 'me', NOW)).toEqual([{ kind: 'closed', text: 'Closed' }])
  })
})

describe('presentation', () => {
  it('names a customer by the best thing known about them', () => {
    expect(customerName({ full_name: 'Maya', email: 'm@x.com' })).toBe('Maya')
    expect(customerName({ email: 'm@x.com' })).toBe('m@x.com')
    expect(customerName({ phone: '+44 7700' })).toBe('+44 7700')
    expect(customerName(null)).toBe('Visitor')
  })

  it('gives a conversation the same avatar tint every time', () => {
    expect(avatarTone('abc')).toBe(avatarTone('abc'))
    expect(avatarTone('abc')).toMatch(/^var\(--/)
  })

  it('puts a handover reason into words, and shows one it does not know as stored', () => {
    expect(transferReasonLabel('KNOWLEDGE_GAP')).toBe('No answer in knowledge')
    expect(transferReasonLabel('SOMETHING_NEW')).toBe('SOMETHING_NEW')
    expect(transferReasonLabel(null)).toBeNull()
  })
})

describe('time', () => {
  it('counts whole minutes, never negative or broken', () => {
    expect(minutesSince(minutesAgo(5.9), NOW)).toBe(5)
    expect(minutesSince(minutesAgo(-3), NOW)).toBe(0)
    expect(minutesSince('not a date', NOW)).toBe(0)
  })

  it('labels elapsed time the way the list shows it', () => {
    expect(elapsedLabel(minutesAgo(0.5), NOW)).toBe('now')
    expect(elapsedLabel(minutesAgo(6), NOW)).toBe('6m')
    expect(elapsedLabel(minutesAgo(125), NOW)).toBe('2h')
    expect(elapsedLabel(minutesAgo(3 * 24 * 60), NOW)).toBe('3d')
    expect(elapsedLabel(minutesAgo(10 * 24 * 60), NOW)).not.toMatch(/d$/)
  })

  it('says a wait in words', () => {
    expect(waitDuration(0)).toBe('1 minute')
    expect(waitDuration(6)).toBe('6 minutes')
    expect(waitDuration(60)).toBe('1 hour')
    expect(waitDuration(125)).toBe('2 hours 5 minutes')
  })
})

describe('thread content', () => {
  const thread = [
    { message: 'Can I get a refund?', message_type: 'user', created_at: minutesAgo(10) },
    { message: 'Let me check.', message_type: 'bot', created_at: minutesAgo(9) },
    { message: 'It was delivered to Berlin', message_type: 'user', created_at: minutesAgo(8) },
    { message: "I'm on it", message_type: 'agent', created_at: minutesAgo(2) },
  ]

  it('puts the handover summary before the first message after the handover', () => {
    expect(handoverIndex(thread, minutesAgo(5))).toBe(3)
    expect(handoverIndex(thread, minutesAgo(1))).toBe(4)
  })

  it('without a handover time, puts it before the first team reply, or last', () => {
    expect(handoverIndex(thread, null)).toBe(3)
    expect(handoverIndex(thread.slice(0, 3), null)).toBe(3)
  })

})

describe('channel glyphs', () => {
  it('names and colours each channel, and treats an unknown one as web chat with its own name', () => {
    expect(channelLabel('whatsapp')).toBe('WhatsApp')
    expect(channelLabel(null)).toBe('Web chat')
    expect(channelGlyph('carrier-pigeon')).toMatchObject({ label: 'carrier-pigeon', color: 'var(--channel-web)' })
  })
})

describe('day separators', () => {
  const local = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString()
  const today = new Date(2026, 10, 13, 15)

  it('names the day the way the thread shows it', () => {
    expect(dayLabel(local(2026, 11, 13, 9), today)).toBe('Today')
    expect(dayLabel(local(2026, 11, 12, 23), today)).toBe('Yesterday')
    expect(dayLabel(local(2026, 11, 10), today)).toMatch(/10/)
    expect(dayLabel(local(2025, 3, 2), today)).toMatch(/2025/)
  })

})

describe('the thread timeline', () => {
  const at = (h: number, m = 0) => new Date(2026, 10, 13, h, m).toISOString()
  const today = new Date(2026, 10, 13, 18)
  const messages = [
    { id: 1, created_at: at(9), message_type: 'user' },
    { id: 2, created_at: at(10), message_type: 'bot' },
    { id: 3, created_at: at(12), message_type: 'agent' },
  ]
  const note = (id: number, h: number) => ({ id, body: 'x', user_id: 'u', mentions: [], created_at: at(h) })

  it('slots notes in by time, after a day separator, with the handover card in its place', () => {
    const kinds = buildTimeline(messages, [note(7, 11), note(8, 13)], { handoverAt: 2, now: today })
      .map((e) => (e.kind === 'message' ? `m${e.index}` : e.kind === 'note' ? `n${e.note.id}` : e.kind))
    expect(kinds).toEqual(['day', 'm0', 'm1', 'n7', 'handover', 'm2', 'n8'])
  })

  it('puts a handover after every message before the notes written after it', () => {
    const kinds = buildTimeline(messages, [note(7, 13), note(8, 15)], { handoverAt: 3, handedOverAt: at(14), now: today })
      .map((e) => (e.kind === 'note' ? `n${e.note.id}` : e.kind))
    expect(kinds.slice(-3)).toEqual(['n7', 'handover', 'n8'])
  })

  it('puts the handover card last when it came after every message, and none without one', () => {
    const last = buildTimeline(messages, [], { handoverAt: 3, now: today }).map((e) => e.kind)
    expect(last.at(-1)).toBe('handover')
    expect(buildTimeline(messages, [], { handoverAt: null, now: today }).some((e) => e.kind === 'handover')).toBe(false)
  })
})

describe('knowledge drafts', () => {
  const thread = [
    { message_type: 'user', message: 'Hi, can I return a jacket delivered to Berlin for a refund?' },
    { message_type: 'bot', message: "I can't find our refund policy for the EU." },
    { message_type: 'user', message: 'Berlin is in the EU though.' },
    { message_type: 'agent', message: 'Yes: returns within the EU are free for 30 days.' },
    { message_type: 'agent', message: 'I have emailed you a prepaid label.' },
    { message_type: 'user', message: 'Thanks!' },
  ]

  it("takes the question the customer asked and every line of the team's answer", () => {
    expect(knowledgeDraft(thread, 3, 'team')).toEqual({
      question: 'Hi, can I return a jacket delivered to Berlin for a refund?',
      answer: 'Yes: returns within the EU are free for 30 days.\n\nI have emailed you a prepaid label.',
    })
  })

  it('offers nothing until the team has answered, or for a question too thin to publish', () => {
    expect(knowledgeDraft(thread.slice(0, 3), 3, 'team')).toBeNull()
    expect(knowledgeDraft([{ message_type: 'user', message: 'hi?' }, { message_type: 'agent', message: 'Hello, how can I help you today?' }], 1, 'team')).toBeNull()
    expect(knowledgeDraft([{ message_type: 'user', message: 'Where is my parcel now?' }, { message_type: 'agent', message: 'Sure' }], 1, 'team')).toBeNull()
  })

  it("pairs the team's reply with the question asked after the handover, past a system notice", () => {
    const thread = [
      { message_type: 'user', message: 'I want to talk to a person' },
      { message_type: 'bot', message: 'Connecting you with a teammate.' },
      { message_type: 'user', message: 'Do you ship to Norway?' },
      { message_type: 'agent', message: "You're now connected with a member of our team.", attributes: { source: 'system' } },
      { message_type: 'agent', message: 'Yes, we ship to Norway in 5 to 7 working days.' },
    ]
    expect(knowledgeDraft(thread, 1, 'team')).toEqual({
      question: 'Do you ship to Norway?',
      answer: 'Yes, we ship to Norway in 5 to 7 working days.',
    })
  })

  it("drafts a correction from an AI answer and the question it answered", () => {
    expect(knowledgeDraft(thread, 1, 'this')).toEqual({
      question: 'Hi, can I return a jacket delivered to Berlin for a refund?',
      answer: "I can't find our refund policy for the EU.",
    })
  })

  it("skips a team notice: it is not an answer", () => {
    const withNotice = [thread[0], { message_type: 'agent', message: "You're now connected with a member of our team.", attributes: { source: 'system' } }]
    expect(knowledgeDraft(withNotice, 1, 'team')).toBeNull()
  })
})

describe('mentions', () => {
  const people = [{ id: 'a', name: 'Asha Rao' }, { id: 't', name: 'Tom' }, { id: 'm', name: 'Maria Asha' }]

  it('finds the @query being typed at the caret, not an email address', () => {
    expect(mentionQuery('Hey @As', 7)).toEqual({ start: 4, query: 'As' })
    expect(mentionQuery('@', 1)).toEqual({ start: 0, query: '' })
    expect(mentionQuery('mail me@x.com', 13)).toBeNull()
    expect(mentionQuery('Hi @Asha R', 10)).toEqual({ start: 3, query: 'Asha R' })
    expect(mentionQuery('@Tom\nnext line', 14)).toBeNull()
  })

  it('suggests prefix matches first', () => {
    expect(matchMentionables(people, 'asha').map((p) => p.id)).toEqual(['a', 'm'])
    expect(matchMentionables(people, 'asha r').map((p) => p.id)).toEqual(['a'])
    expect(matchMentionables(people, 'tom and')).toEqual([])
    expect(matchMentionables(people, 'zzz')).toEqual([])
  })

  it('keeps only the mentions still in the text', () => {
    expect(mentionedIds('@Asha Rao can you check?', people)).toEqual(['a'])
    expect(mentionedIds('nobody now', people)).toEqual([])
  })

  it('splits a note into its text and mentions, longest name first', () => {
    expect(mentionParts('@Maria Asha and @Tom, look', ['Tom', 'Maria Asha'])).toEqual([
      { text: '@Maria Asha', mention: true }, { text: ' and ', mention: false },
      { text: '@Tom', mention: true }, { text: ', look', mention: false },
    ])
    expect(mentionParts('a (b) [c]', ['(b)'])).toEqual([{ text: 'a (b) [c]', mention: false }])
  })
})

describe('the Snoozed view', () => {
  const items = (counts: Partial<InboxCounts> | null, selected?: { view: 'snoozed' | 'open'; channel: null }) =>
    inboxViewGroups(counts as InboxCounts, selected)[0].items.map((i) => i.id)

  it('shows only once something is snoozed, or while it is the open view', () => {
    expect(items({ snoozed: 0 })).not.toContain('snoozed')
    expect(items(null)).not.toContain('snoozed')
    expect(items({ snoozed: 2 })).toContain('snoozed')
    expect(items({ snoozed: 0 }, { view: 'snoozed', channel: null })).toContain('snoozed')
  })
})

describe('faqEditorLink', () => {
  it('opens the help center editor with the question and answer filled in', () => {
    expect(faqEditorLink({ question: 'Do you ship to Norway?', answer: 'Yes & fast' }))
      .toBe('/faq?question=Do+you+ship+to+Norway%3F&answer=Yes+%26+fast')
  })
})
