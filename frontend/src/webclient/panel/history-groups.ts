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
 * How "Your conversations" groups its rows: open ones first, then Today, This week,
 * This month, then by month ("October 2026"). Pure, so tests pin the boundaries.
 */

import { PANEL_COPY } from '../copy'
import type { ConversationItem } from '../../composables/useConversationHistory'

export interface ConversationGroup {
    label: string
    items: ConversationItem[]
}

const DAY = 24 * 3600 * 1000

function groupLabel(item: ConversationItem, now: Date): string {
    if (item.open) return PANEL_COPY.groupOpen
    const at = item.last_at ? new Date(item.last_at) : null
    if (!at || Number.isNaN(at.getTime())) return PANEL_COPY.groupMonth
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    if (at.getTime() >= startOfToday) return PANEL_COPY.groupToday
    if (at.getTime() >= startOfToday - 6 * DAY) return PANEL_COPY.groupWeek
    if (at.getFullYear() === now.getFullYear() && at.getMonth() === now.getMonth()) return PANEL_COPY.groupMonth
    return at.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function groupConversations(items: ConversationItem[], now = new Date()): ConversationGroup[] {
    const open = items.filter(i => i.open)
    const rest = items.filter(i => !i.open)
    const groups: ConversationGroup[] = []
    for (const item of [...open, ...rest]) {
        const label = groupLabel(item, now)
        const last = groups[groups.length - 1]
        if (last && last.label === label) last.items.push(item)
        else groups.push({ label, items: [item] })
    }
    return groups
}

/** "3m", "2h", "Yesterday", "12 Oct": when the conversation last moved. */
export function relativeTime(iso: string | null, now = new Date()): string {
    if (!iso) return ''
    const at = new Date(iso)
    if (Number.isNaN(at.getTime())) return ''
    const minutes = Math.floor((now.getTime() - at.getTime()) / 60000)
    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}h`
    if (minutes < 48 * 60) return 'Yesterday'
    return at.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
