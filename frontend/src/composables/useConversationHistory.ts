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

import { ref, type Ref } from 'vue'
import type { WidgetMessage } from '../types/widget'

/**
 * "Your conversations": the visitor's own past chats (app/api/widget_history.py),
 * listed a page at a time, searched, opened read-only and continued.
 */

export interface ConversationItem {
    id: string
    title: string
    last_message: string
    last_from_visitor: boolean
    last_at: string | null
    open: boolean
    current: boolean
    resolved_by: { name: string; avatar_url: string | null } | null
    snippet?: string
}

export interface OpenConversation {
    id: string
    open: boolean
    messages: WidgetMessage[]
    before: string | null
}

/** Chats from the visitor's other browsers, found by an email they proved with a code. */
export interface OtherBrowsers {
    /** The proven email, masked, while the proof lasts. */
    email: string | null
    /** The email check can be offered to find them. */
    offer: boolean
}

export interface HistoryState {
    /** The history screen is showing (instead of the conversation). */
    showing: boolean
    items: ConversationItem[]
    total: number
    nextCursor: string | null
    loading: boolean
    /** The list has been read at least once (the start state's Recent row uses it). */
    loaded: boolean
    query: string
    results: ConversationItem[] | null
    capped: boolean
    searching: boolean
    viewing: OpenConversation | null
    viewingLoading: boolean
    continuing: boolean
    error: string
    otherBrowsers: OtherBrowsers
}

/** How long typing waits before a search goes out. */
export const SEARCH_DEBOUNCE_MS = 250
export const SEARCH_MIN = 2

/** History before anything was read (also the dashboard preview's, which has none). */
export const emptyHistory = (): HistoryState => ({
    showing: false, items: [], total: 0, nextCursor: null, loading: false, loaded: false,
    query: '', results: null, capped: false, searching: false,
    viewing: null, viewingLoading: false, continuing: false, error: '',
    otherBrowsers: { email: null, offer: false },
})

const isObject = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object'

const itemFrom = (value: Record<string, any>): ConversationItem | null =>
    typeof value.id === 'string' && value.id ? {
        id: value.id,
        title: typeof value.title === 'string' ? value.title : '',
        last_message: typeof value.last_message === 'string' ? value.last_message : '',
        last_from_visitor: value.last_from_visitor === true,
        last_at: typeof value.last_at === 'string' ? value.last_at : null,
        open: value.open === true,
        current: value.current === true,
        resolved_by: isObject(value.resolved_by) && typeof value.resolved_by.name === 'string'
            ? { name: value.resolved_by.name, avatar_url: typeof value.resolved_by.avatar_url === 'string' ? value.resolved_by.avatar_url : null }
            : null,
        ...(typeof value.snippet === 'string' ? { snippet: value.snippet } : {}),
    } : null

const itemsFrom = (value: unknown): ConversationItem[] =>
    (Array.isArray(value) ? value : []).filter(isObject).map(itemFrom).filter((i): i is ConversationItem => i !== null)

/** A stored message as the conversation view draws it (the same shape history restores). */
const messageFrom = (m: Record<string, any>): WidgetMessage => ({
    ...(typeof m.id === 'number' ? { id: m.id } : {}),
    message: typeof m.message === 'string' ? m.message : '',
    message_type: typeof m.message_type === 'string' ? m.message_type : 'system',
    created_at: typeof m.timestamp === 'string' ? m.timestamp : '',
    session_id: '',
    attributes: isObject(m.attributes) ? m.attributes : {},
    attachments: Array.isArray(m.attachments) ? m.attachments : [],
    ...(isObject(m.attributes) && Array.isArray(m.attributes.sources) ? { sources: m.attributes.sources } : {}),
    ...(isObject(m.attributes) && isObject(m.attributes.shopify_output)
        ? { message_type: 'product', shopify_output: m.attributes.shopify_output as WidgetMessage['shopify_output'] } : {}),
})

export function useConversationHistory(options: {
    on: (event: string, listener: (...args: any[]) => void) => void
    emit: (event: string, data?: unknown) => void
    messages: Ref<WidgetMessage[]>
    /** Close the current conversation and start a fresh one; false when it failed. */
    startFreshChat: () => Promise<boolean>
}) {
    const history = ref<HistoryState>(emptyHistory())
    const update = (fields: Partial<HistoryState>) => { history.value = { ...history.value, ...fields } }
    let searchTimer: ReturnType<typeof setTimeout> | null = null

    options.on('conversations', (data: Record<string, any>) => {
        const page = itemsFrom(data?.items)
        const known = new Set(history.value.items.map(i => i.id))
        const appending = history.value.loading && history.value.nextCursor !== null && history.value.loaded
        update({
            items: appending ? [...history.value.items, ...page.filter(i => !known.has(i.id))] : page,
            total: typeof data?.total === 'number' ? data.total : page.length,
            nextCursor: typeof data?.next_cursor === 'string' ? data.next_cursor : null,
            loading: false,
            loaded: true,
            otherBrowsers: {
                email: typeof data?.other_browsers?.email === 'string' ? data.other_browsers.email : null,
                offer: data?.other_browsers?.offer === true,
            },
        })
    })
    options.on('conversation_search', (data: Record<string, any>) => {
        if (data?.q !== history.value.query) return
        update({ results: itemsFrom(data.items), capped: data.capped === true, searching: false })
    })
    options.on('conversation', (data: Record<string, any>) => {
        if (!isObject(data) || typeof data.id !== 'string') return
        const page = (Array.isArray(data.messages) ? data.messages : []).filter(isObject).map(messageFrom)
        const older = history.value.viewing?.id === data.id && history.value.viewingLoading && history.value.viewing.messages.length
        update({
            viewing: {
                id: data.id,
                open: data.open === true,
                messages: older ? [...page, ...history.value.viewing!.messages] : page,
                before: typeof data.before === 'string' ? data.before : null,
            },
            viewingLoading: false,
        })
    })
    options.on('conversation_continued', (data: { title?: string }) => {
        const title = typeof data?.title === 'string' ? data.title : ''
        options.messages.value = [...options.messages.value, {
            message: `Continued from "${title}"`, message_type: 'system', created_at: new Date().toISOString(), session_id: '',
        }]
        update({ continuing: false, showing: false, viewing: null })
    })
    options.on('error', (error: { type?: string }) => {
        if (error?.type === 'conversation_not_found') update({ viewingLoading: false, continuing: false, viewing: null })
    })

    /** Read the first page (the screen, or the start state's Recent row). */
    const refreshConversations = () => {
        update({ loading: true, nextCursor: null })
        options.emit('list_conversations', {})
    }
    const openHistory = () => {
        update({ showing: true, error: '' })
        refreshConversations()
    }
    const closeHistory = () => update({ showing: false, viewing: null, query: '', results: null })
    const loadMoreConversations = () => {
        const { nextCursor, loading } = history.value
        if (!nextCursor || loading) return
        update({ loading: true })
        options.emit('list_conversations', { cursor: nextCursor })
    }
    const searchConversations = (query: string) => {
        const q = query.trim()
        if (searchTimer) clearTimeout(searchTimer)
        if (q.length < SEARCH_MIN) {
            update({ query: q, results: null, searching: false, capped: false })
            return
        }
        update({ query: q, searching: true })
        searchTimer = setTimeout(() => options.emit('search_conversations', { q }), SEARCH_DEBOUNCE_MS)
    }
    const openConversation = (id: string) => {
        update({ viewing: { id, open: false, messages: [], before: null }, viewingLoading: true })
        options.emit('get_conversation', { id })
    }
    const closeConversation = () => update({ viewing: null, viewingLoading: false })
    const loadOlderMessages = () => {
        const viewing = history.value.viewing
        if (!viewing?.before || history.value.viewingLoading) return
        update({ viewingLoading: true })
        options.emit('get_conversation', { id: viewing.id, before: viewing.before })
    }
    /** Carry a past conversation into a chat: a fresh one when the current has messages. */
    const continueConversation = async (id: string) => {
        if (history.value.continuing) return
        update({ continuing: true, error: '' })
        if (options.messages.value.length > 0 && !(await options.startFreshChat())) {
            update({ continuing: false, error: 'continue_failed' })
            return
        }
        options.emit('continue_conversation', { id })
    }

    return {
        history, openHistory, closeHistory, refreshConversations, loadMoreConversations, searchConversations,
        openConversation, closeConversation, loadOlderMessages, continueConversation,
    }
}
