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

import type { InboxCounts, InboxSort, InboxViewKey } from '@/types/chat'
import { channelGlyph } from '@/utils/channelGlyphs'

/**
 * Which slice of the inbox is listed: one of the saved views, optionally
 * narrowed to a channel ("Channels" in the views pane is All open on that
 * channel). The backend applies the same rules (inbox_views.py).
 */
export interface InboxSelection {
  view: InboxViewKey
  channel: string | null
}

/** How a view's marker and count are drawn. */
export type ViewTone = 'plain' | 'waiting' | 'ai' | 'channel'

export interface InboxViewItem {
  /** Stable id for the list, the URL and tests */
  id: string
  /** In the views pane (short: it is 200px wide) */
  label: string
  /** Above the list, where there is room to say it in full */
  title: string
  selection: InboxSelection
  /** null when the view has no count (Closed: it only grows) */
  count: number | null
  tone: ViewTone
  /** The channel's colour, for a channel view's marker */
  color?: string
  /** What the list says when the view is empty */
  empty: string
}

/**
 * Everything the list shows, as one value: the view, its sort and search, and
 * the AI agent / teammate filters. What a preset view (the enterprise
 * module's saved views) brings back in one click.
 */
export interface InboxListState {
  selection: InboxSelection
  sort: InboxSort
  search: string
  agentId: string
  assigneeId: string
}

/** A view that brings back a whole list state rather than a selection */
export interface InboxPresetItem extends InboxViewItem {
  preset: InboxListState
}

export const isPreset = (item: InboxViewItem): item is InboxPresetItem => 'preset' in item

/** Two list states show the same conversations (a search's case and spaces aside). */
export function sameListState(a: InboxListState, b: InboxListState): boolean {
  return selectionId(a.selection) === selectionId(b.selection) && a.sort === b.sort
    && a.search.trim().toLowerCase() === b.search.trim().toLowerCase()
    && a.agentId === b.agentId && a.assigneeId === b.assigneeId
}

export interface InboxViewGroup {
  /** No heading for the first group */
  heading: string | null
  items: InboxViewItem[]
}

interface ViewDef {
  view: InboxViewKey
  label: string
  title?: string
  countKey: keyof Omit<InboxCounts, 'channels'> | null
  tone: ViewTone
  empty: string
}

const VIEW_DEFS: Record<InboxViewKey, ViewDef> = {
  mine: { view: 'mine', label: 'Your inbox', countKey: 'assigned_to_me', tone: 'plain', empty: 'Nothing is assigned to you.' },
  mentions: { view: 'mentions', label: 'Mentions', countKey: 'mentions', tone: 'plain', empty: 'Nobody has mentioned you in an open conversation.' },
  waiting: { view: 'waiting', label: 'Waiting for a human', countKey: 'waiting_for_human', tone: 'waiting', empty: 'Nobody is waiting for a person.' },
  open: { view: 'open', label: 'All open', countKey: 'open', tone: 'plain', empty: 'No open conversations.' },
  ai: { view: 'ai', label: 'AI handling now', countKey: 'ai_handling', tone: 'ai', empty: 'The AI has no live conversations.' },
  resolved_by_ai: { view: 'resolved_by_ai', label: 'Resolved by AI', title: 'Resolved by AI today', countKey: 'resolved_by_ai_today', tone: 'plain', empty: 'Nothing resolved by the AI yet today.' },
  closed: { view: 'closed', label: 'Closed', countKey: null, tone: 'plain', empty: 'No closed conversations.' },
  negative: { view: 'negative', label: 'Negative sentiment', countKey: 'negative', tone: 'plain', empty: 'No unhappy customers right now.' },
  snoozed: { view: 'snoozed', label: 'Snoozed', countKey: 'snoozed', tone: 'plain', empty: 'Nothing is snoozed.' },
}

const GROUPS: Array<{ heading: string | null; views: InboxViewKey[] }> = [
  { heading: null, views: ['mine', 'mentions', 'waiting', 'open', 'snoozed'] },
  { heading: 'AI agents', views: ['ai', 'resolved_by_ai', 'closed'] },
]
// Snoozed shows once something is (snoozing is the enterprise module's)
const SAVED_VIEWS: InboxViewKey[] = ['negative']

export const DEFAULT_SELECTION: InboxSelection = { view: 'open', channel: null }

/** The id a selection is known by, in the URL (?view=) and the views pane. */
export function selectionId(selection: InboxSelection): string {
  return selection.channel ? `channel:${selection.channel}` : selection.view
}

/** A ?view= value back into a selection; anything unknown is the default. */
export function parseSelection(id: unknown): InboxSelection {
  if (typeof id !== 'string') return DEFAULT_SELECTION
  if (id.startsWith('channel:') && id.length > 'channel:'.length) {
    return { view: 'open', channel: id.slice('channel:'.length) }
  }
  return id in VIEW_DEFS ? { view: id as InboxViewKey, channel: null } : DEFAULT_SELECTION
}

/** Waiting views list the longest wait first; everything else the newest. */
export const defaultSort = (selection: InboxSelection): InboxSort =>
  selection.view === 'waiting' ? 'waiting_longest' : 'newest'

function viewItem(view: InboxViewKey, counts: InboxCounts | null): InboxViewItem {
  const def = VIEW_DEFS[view]
  return {
    id: view,
    label: def.label,
    title: def.title ?? def.label,
    selection: { view, channel: null },
    count: def.countKey && counts ? counts[def.countKey] : null,
    tone: def.tone,
    empty: def.empty,
  }
}

function channelItem(channel: string, count: number): InboxViewItem {
  const glyph = channelGlyph(channel)
  return {
    id: `channel:${channel}`,
    label: glyph.label,
    title: glyph.label,
    selection: { view: 'open', channel },
    count,
    tone: 'channel',
    color: glyph.color,
    empty: `No open ${glyph.label} conversations.`,
  }
}

/**
 * The views pane, from the latest counts. Channels appear once they have an
 * open conversation, busiest first; the selected one stays even when it
 * empties, so the list under it doesn't jump away.
 */
export function inboxViewGroups(
  counts: InboxCounts | null, selected?: InboxSelection, presets: InboxPresetItem[] = [],
): InboxViewGroup[] {
  const channelCounts = { ...(counts?.channels ?? {}) }
  if (selected?.channel && !(selected.channel in channelCounts)) channelCounts[selected.channel] = 0
  const channels = Object.entries(channelCounts)
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(([channel, count]) => channelItem(channel, count))

  return [
    ...GROUPS.map(({ heading, views }) => ({
      heading,
      items: views.filter((v) => v !== 'snoozed' || counts?.snoozed || selected?.view === 'snoozed').map((v) => viewItem(v, counts)),
    })),
    ...(channels.length ? [{ heading: 'Channels', items: channels }] : []),
    { heading: 'Saved views', items: [...SAVED_VIEWS.map((v) => viewItem(v, counts)), ...presets] },
  ]
}

/** The item for a selection, for the list's title and its empty state. */
export function selectedViewItem(groups: InboxViewGroup[], selection: InboxSelection): InboxViewItem {
  const id = selectionId(selection)
  for (const group of groups) {
    const found = group.items.find((item) => item.id === id)
    if (found) return found
  }
  return viewItem(selection.view, null)
}
