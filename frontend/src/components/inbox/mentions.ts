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

/** A teammate the note composer can mention */
export interface Mentionable {
  id: string
  name: string
}

/** The note split into text and the "@Name" mentions in it, for bolding. */
export function mentionParts(body: string, names: string[]): Array<{ text: string; mention: boolean }> {
  const tags = [...new Set(names.filter(Boolean))].map((n) => `@${n}`).sort((a, b) => b.length - a.length)
  if (!tags.length) return [{ text: body, mention: false }]
  const escaped = tags.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'g')
  return body.split(pattern).filter((p) => p !== '').map((text) => ({ text, mention: tags.includes(text) }))
}

/** Who is still mentioned in the text: a mention picked then deleted is dropped. */
export function mentionedIds(body: string, picked: Mentionable[]): string[] {
  return [...new Set(picked.filter((p) => body.includes(`@${p.name}`)).map((p) => p.id))]
}

/**
 * The "@query" being typed at the caret, if any: an @ at the start or after a
 * space, then up to 40 characters on the same line. Spaces are allowed, so a
 * full name ("@Asha Rao") narrows the list; once nobody matches, the list
 * simply closes.
 */
export function mentionQuery(text: string, caret: number): { start: number; query: string } | null {
  const before = text.slice(0, caret)
  const match = /(^|\s)@([^\n@]{0,40})$/.exec(before)
  if (!match) return null
  return { start: caret - match[2].length - 1, query: match[2] }
}

/** Teammates whose name matches the query, best first (prefix before anywhere). */
export function matchMentionables(people: Mentionable[], query: string, limit = 6): Mentionable[] {
  const q = query.toLowerCase()
  const scored = people
    .map((p) => ({ p, at: p.name.toLowerCase().indexOf(q) }))
    .filter(({ at }) => at !== -1)
    .sort((a, b) => (a.at === 0 ? 0 : 1) - (b.at === 0 ? 0 : 1) || a.p.name.localeCompare(b.p.name))
  return scored.slice(0, limit).map(({ p }) => p)
}
