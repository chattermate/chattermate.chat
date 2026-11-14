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

import type { Message } from '@/types/chat'

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
  const firstTeamReply = messages.findIndex((m) => m.message_type === 'agent')
  return firstTeamReply === -1 ? messages.length : firstTeamReply
}

/** The customer's last message before `index`: the question an answer was for. */
export function questionBefore(messages: Pick<Message, 'message' | 'message_type'>[], index: number): string | null {
  for (let i = Math.min(index, messages.length) - 1; i >= 0; i--) {
    if (messages[i].message_type === 'user' && messages[i].message?.trim()) return messages[i].message!.trim()
  }
  return null
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

/** For each message, the separator to draw above it: the first of each day gets one. */
export function daySeparators(messages: Pick<Message, 'created_at'>[], now: Date = new Date()): Array<string | null> {
  let previous = ''
  return messages.map((m) => {
    const label = dayLabel(m.created_at, now)
    if (label === previous) return null
    previous = label
    return label
  })
}
