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

import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { postToHost } from '../webclient/host-bridge'
import { renderMarkdown } from '../webclient/markdown'

/** Longest unread preview the loader shows (it cuts again on its side). */
export const PREVIEW_MAX_CHARS = 120

/**
 * A reply as one line of plain text: its markdown rendered (and sanitised), then
 * only the text kept, parsed inertly (DOMParser loads nothing), cut to the limit.
 */
export function previewText(message: string): string {
    const html = renderMarkdown(message || '')
    const text = (new DOMParser().parseFromString(html, 'text/html').body.textContent || '')
        .replace(/\s+/g, ' ').trim()
    return text.length > PREVIEW_MAX_CHARS ? `${text.slice(0, PREVIEW_MAX_CHARS - 1).trimEnd()}…` : text
}

/** The reply itself, for the loader's peek. */
export interface UnreadPreview {
    /** Who the reply is from when the message does not say. */
    agentName: () => string
}

/**
 * Tracks unread agent/bot messages that arrive while the widget is minimized and
 * reports the running count to the embedder (which renders it on the launcher
 * badge). The embedder drives visibility via `WIDGET_VISIBILITY` messages and
 * shows the nudge count until the chat is first opened, then this unread count.
 */
export function useUnreadBadge(messages: Ref<any[]>, preview?: UnreadPreview) {
    const visible = ref(true)
    let unread = 0

    const post = () => {
        postToHost({ type: 'UNREAD_COUNT', count: unread })
    }

    const onMessage = (e: MessageEvent) => {
        if (e?.data?.type !== 'WIDGET_VISIBILITY') return
        visible.value = !!e.data.open
        // Opening the chat clears the unread count.
        if (visible.value && unread !== 0) {
            unread = 0
            post()
        }
    }

    // Count agent/bot replies that land while the chat is closed.
    watch(() => messages.value.length, (len, prev) => {
        if (len <= (prev ?? 0) || visible.value) return
        const m = messages.value[len - 1]
        if (m && (m.message_type === 'bot' || m.message_type === 'agent')) {
            unread += 1
            post()
            if (preview) {
                const text = previewText(m.message)
                if (text) postToHost({ type: 'UNREAD_PREVIEW', text, agentName: m.agent_name || preview.agentName() })
            }
        }
    })

    onMounted(() => window.addEventListener('message', onMessage))
    onUnmounted(() => window.removeEventListener('message', onMessage))
}
