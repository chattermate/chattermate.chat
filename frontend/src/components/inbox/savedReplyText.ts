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

import type { SavedReply } from '@/services/savedReplies'

/** What a reply's {{variables}} are filled from. */
export interface ReplyContext {
  customerName?: string | null
  customerEmail?: string | null
  agentName?: string | null
}

/** The variables a saved reply can use, for the editor's hint and the picker */
export const REPLY_VARIABLES = [
  { token: '{{customer.first_name}}', label: "Customer's first name" },
  { token: '{{customer.name}}', label: "Customer's name" },
  { token: '{{customer.email}}', label: "Customer's email" },
  { token: '{{agent.name}}', label: 'Your name' },
  { token: '{{agent.first_name}}', label: 'Your first name' },
] as const

const firstWord = (name?: string | null) => (name ?? '').trim().split(/\s+/)[0] ?? ''

/**
 * The reply with its variables filled in. A name nobody gave reads "there"
 * ("Hi there,"), never an empty gap; a variable it doesn't know stays as
 * written, so a typo shows up in the box before it is sent.
 */
export function fillReply(body: string, context: ReplyContext): string {
  const customer = context.customerName?.trim() || ''
  const values: Record<string, string> = {
    'customer.first_name': firstWord(customer) || 'there',
    'customer.name': customer || 'there',
    'customer.email': context.customerEmail?.trim() || '',
    'agent.name': context.agentName?.trim() || '',
    'agent.first_name': firstWord(context.agentName),
  }
  return body.replace(/\{\{\s*([a-z_.]+)\s*\}\}/g, (token, key: string) => (key in values ? values[key] : token))
}

/**
 * The replies that match what was typed, best first: a shortcut that starts
 * with it, then a title, then anywhere in the text. All of them for nothing typed.
 */
export function matchReplies(replies: SavedReply[], query: string, limit = 8): SavedReply[] {
  const q = query.trim().toLowerCase()
  if (!q) return replies.slice(0, limit)
  const rank = (r: SavedReply): number => {
    if (r.shortcut?.startsWith(q)) return 0
    const title = r.title.toLowerCase()
    if (title.startsWith(q)) return 1
    if (title.includes(q) || r.shortcut?.includes(q)) return 2
    if (r.body.toLowerCase().includes(q)) return 3
    return -1
  }
  return replies
    .map((r) => ({ r, score: rank(r) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score || a.r.title.localeCompare(b.r.title))
    .slice(0, limit)
    .map(({ r }) => r)
}
