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

import type { Ref } from 'vue'
import type { WidgetMessage } from '../types/widget'
import { feedbackOf, type VisitorFeedback } from '../webclient/panel/answer-extras'

/**
 * The visitor's thumbs on an AI reply. The thumb shows at once; the server stores
 * it on the reply (message_feedback) and a refusal puts the previous one back.
 */
export function useAnswerFeedback(options: {
    messages: Ref<WidgetMessage[]>
    on: (event: string, listener: (...args: any[]) => void) => void
    emit: (event: string, data?: unknown) => void
}) {
    // Message id → the thumb before the unsaved change.
    const pending = new Map<number, VisitorFeedback | null>()

    const setThumb = (id: number, value: VisitorFeedback | null) => {
        const message = options.messages.value.find(m => m.id === id)
        if (!message) return
        const attributes = { ...(message.attributes || {}) }
        if (value) attributes.visitor_feedback = value
        else delete attributes.visitor_feedback
        message.attributes = attributes
    }

    /** Thumb a reply up or down, or take the thumb back (null). Replies without an id are not stored yet. */
    const sendFeedback = (message: WidgetMessage, value: VisitorFeedback | null) => {
        const id = message.id
        if (typeof id !== 'number') return
        if (!pending.has(id)) pending.set(id, feedbackOf(message))
        setThumb(id, value)
        options.emit('message_feedback', { message_id: id, value })
    }

    options.on('message_feedback_saved', (data: { message_id?: number }) => {
        if (typeof data?.message_id === 'number') pending.delete(data.message_id)
    })
    options.on('error', (error: { type?: string; message_id?: number }) => {
        if (error?.type !== 'feedback_error' || typeof error.message_id !== 'number') return
        if (!pending.has(error.message_id)) return
        setThumb(error.message_id, pending.get(error.message_id) ?? null)
        pending.delete(error.message_id)
    })

    return { sendFeedback }
}
