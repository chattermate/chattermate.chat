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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { SEARCH_DEBOUNCE_MS, useConversationHistory } from '@/composables/useConversationHistory'
import type { WidgetMessage } from '@/types/widget'

const item = (id: string, fields = {}) => ({
    id, title: `Chat ${id}`, last_message: 'Thanks!', last_from_visitor: false, last_at: '2026-11-10T10:00:00Z',
    open: false, current: false, resolved_by: null, ...fields,
})

const setUp = (messages: WidgetMessage[] = [], fresh = true) => {
    const listeners: Record<string, (data: any) => void> = {}
    const emit = vi.fn()
    const startFreshChat = vi.fn(async () => fresh)
    const list = ref<WidgetMessage[]>(messages)
    const h = useConversationHistory({ on: (event, fn) => { listeners[event] = fn }, emit, messages: list, startFreshChat })
    return { ...h, emit, startFreshChat, list, hear: (event: string, data?: unknown) => listeners[event](data) }
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('useConversationHistory', () => {
    it('opens the list and pages through it without duplicates', () => {
        const h = setUp()
        h.openHistory()
        expect(h.emit).toHaveBeenLastCalledWith('list_conversations', {})
        h.hear('conversations', { items: [item('a'), item('b')], next_cursor: 'c1', total: 3 })
        expect(h.history.value).toMatchObject({ showing: true, loaded: true, total: 3, nextCursor: 'c1' })
        h.loadMoreConversations()
        expect(h.emit).toHaveBeenLastCalledWith('list_conversations', { cursor: 'c1' })
        h.loadMoreConversations()
        expect(h.emit).toHaveBeenCalledTimes(2)
        h.hear('conversations', { items: [item('b'), item('c')], next_cursor: null, total: 3 })
        expect(h.history.value.items.map(i => i.id)).toEqual(['a', 'b', 'c'])
        h.loadMoreConversations()
        expect(h.emit).toHaveBeenCalledTimes(2)
    })

    it('searches after typing settles, and ignores a stale answer', () => {
        const h = setUp()
        h.searchConversations('ship')
        h.searchConversations('shipping')
        vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
        expect(h.emit).toHaveBeenCalledTimes(1)
        expect(h.emit).toHaveBeenCalledWith('search_conversations', { q: 'shipping' })
        h.hear('conversation_search', { q: 'ship', items: [item('x')], capped: false })
        expect(h.history.value.results).toBeNull()
        h.hear('conversation_search', { q: 'shipping', items: [item('y')], capped: true })
        expect(h.history.value.results?.map(i => i.id)).toEqual(['y'])
        expect(h.history.value.capped).toBe(true)
        h.searchConversations('s')
        expect(h.history.value.results).toBeNull()
    })

    it('opens a conversation and loads older messages above it', () => {
        const h = setUp()
        h.openConversation('a')
        expect(h.emit).toHaveBeenLastCalledWith('get_conversation', { id: 'a' })
        h.hear('conversation', { id: 'a', open: false, before: 'b1', messages: [{ id: 5, message: 'Later', message_type: 'user', timestamp: 't2' }] })
        h.loadOlderMessages()
        expect(h.emit).toHaveBeenLastCalledWith('get_conversation', { id: 'a', before: 'b1' })
        h.hear('conversation', { id: 'a', open: false, before: null, messages: [{ id: 4, message: 'Earlier', message_type: 'bot', timestamp: 't1' }] })
        expect(h.history.value.viewing?.messages.map(m => m.message)).toEqual(['Earlier', 'Later'])
    })

    it('continues in this chat when it is empty, and shows where it continues from', async () => {
        const h = setUp([])
        await h.continueConversation('a')
        expect(h.startFreshChat).not.toHaveBeenCalled()
        expect(h.emit).toHaveBeenLastCalledWith('continue_conversation', { id: 'a' })
        h.hear('conversation_continued', { title: 'Late order' })
        expect(h.list.value.at(-1)).toMatchObject({ message_type: 'system', message: 'Continued from "Late order"' })
        expect(h.history.value.showing).toBe(false)
    })

    it('starts a fresh chat first when this one has messages, and says when that failed', async () => {
        const busy = setUp([{ message: 'hi', message_type: 'user', created_at: '', session_id: '' }])
        await busy.continueConversation('a')
        expect(busy.startFreshChat).toHaveBeenCalled()
        const failing = setUp([{ message: 'hi', message_type: 'user', created_at: '', session_id: '' }], false)
        await failing.continueConversation('a')
        expect(failing.emit).not.toHaveBeenCalledWith('continue_conversation', expect.anything())
        expect(failing.history.value.error).toBe('continue_failed')
    })

    it('forgets a conversation the server says is not theirs', () => {
        const h = setUp()
        h.openConversation('zzz')
        h.hear('error', { type: 'conversation_not_found' })
        expect(h.history.value.viewing).toBeNull()
    })
})
