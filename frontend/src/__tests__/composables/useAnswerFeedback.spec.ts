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

import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useAnswerFeedback } from '@/composables/useAnswerFeedback'
import type { WidgetMessage } from '@/types/widget'

const setUp = () => {
    const listeners: Record<string, (data: any) => void> = {}
    const emit = vi.fn()
    const reply: WidgetMessage = { id: 5, message_type: 'bot', message: 'Hi', created_at: '', session_id: '', attributes: { sources: [] } }
    const messages = ref<WidgetMessage[]>([reply])
    const { sendFeedback } = useAnswerFeedback({ messages, emit, on: (event, fn) => { listeners[event] = fn } })
    return { sendFeedback, emit, listeners, messages }
}

describe('useAnswerFeedback', () => {
    it('shows the thumb at once and sends it', () => {
        const { sendFeedback, emit, messages } = setUp()
        sendFeedback(messages.value[0], 'up')
        expect(messages.value[0].attributes).toEqual({ sources: [], visitor_feedback: 'up' })
        expect(emit).toHaveBeenCalledWith('message_feedback', { message_id: 5, value: 'up' })
    })

    it('puts the previous thumb back when the server refuses', () => {
        const { sendFeedback, listeners, messages } = setUp()
        sendFeedback(messages.value[0], 'up')
        listeners.message_feedback_saved({ message_id: 5 })
        sendFeedback(messages.value[0], 'down')
        listeners.error({ type: 'feedback_error', message_id: 5 })
        expect(messages.value[0].attributes?.visitor_feedback).toBe('up')
    })

    it('ignores other errors and replies without an id', () => {
        const { sendFeedback, emit, listeners, messages } = setUp()
        sendFeedback({ ...messages.value[0], id: undefined }, 'up')
        expect(emit).not.toHaveBeenCalled()
        sendFeedback(messages.value[0], 'down')
        listeners.error({ type: 'chat_error', message_id: 5 })
        expect(messages.value[0].attributes?.visitor_feedback).toBe('down')
    })
})
