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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope, ref, type EffectScope } from 'vue'

vi.mock('@/webclient/host-bridge', () => ({ postToHost: vi.fn() }))

import { postToHost } from '@/webclient/host-bridge'
import { useEndChat } from '@/composables/useEndChat'
import type { Message } from '@/types/chat'
import type { HumanAgent } from '@/types/widget'

let scope: EffectScope | null = null

const setup = ({ agentName = 'Ava', humanAgent = {} as HumanAgent } = {}) => {
    const messages = ref<Message[]>([])
    const currentSessionId = ref('')
    scope = effectScope()
    const endChat = scope.run(() => useEndChat({
        widgetId: ref('w1'),
        token: ref('tok-1'),
        messages,
        humanAgent: ref(humanAgent),
        agentName: ref(agentName),
        currentSessionId,
    }))!
    return { ...endChat, messages, currentSessionId }
}

const endChatMessage = (extra: Partial<Message> = {}): Message => ({
    message: 'Thanks, bye',
    message_type: 'bot',
    created_at: '2026-01-01T00:00:00Z',
    session_id: 's1',
    attributes: { end_chat: true, request_rating: true },
    ...extra,
})

// The deep watch runs on the next tick; the close request is awaited after that.
const settle = () => new Promise(resolve => setTimeout(resolve, 0))

const ratingPrompt = (messages: Message[]) => messages.find(m => m.message_type === 'rating')

describe('useEndChat', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ session_id: 's1' }) }))
        vi.spyOn(console, 'info').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        scope?.stop()
        scope = null
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
        vi.mocked(postToHost).mockClear()
    })

    describe('the rating prompt names', () => {
        it('the agent that ended the chat', async () => {
            const chat = setup({ humanAgent: { human_agent_name: 'Sam' } })
            chat.messages.value.push(endChatMessage({ agent_name: 'Riley' }))
            await settle()
            expect(ratingPrompt(chat.messages.value)?.message).toBe('Rate the chat session that you had with Riley')
        })

        it('else the human agent who took over', async () => {
            const chat = setup({ humanAgent: { human_agent_name: 'Sam' } })
            chat.messages.value.push(endChatMessage())
            await settle()
            expect(ratingPrompt(chat.messages.value)?.agent_name).toBe('Sam')
        })

        it('else the AI agent', async () => {
            const chat = setup()
            chat.messages.value.push(endChatMessage())
            await settle()
            expect(ratingPrompt(chat.messages.value)?.agent_name).toBe('Ava')
        })

        it('else "our agent"', async () => {
            const chat = setup({ agentName: '' })
            chat.messages.value.push(endChatMessage())
            await settle()
            expect(ratingPrompt(chat.messages.value)?.agent_name).toBe('our agent')
        })
    })

    it('still asks for a rating when closing the session fails', async () => {
        vi.mocked(fetch).mockRejectedValue(new Error('offline'))
        const chat = setup()
        chat.messages.value.push(endChatMessage())
        await settle()
        expect(ratingPrompt(chat.messages.value)).toBeTruthy()
        expect(chat.currentSessionId.value).toBe('s1')
    })

    it('closes the session once, and asks for no rating unless requested', async () => {
        const chat = setup()
        chat.messages.value.push(endChatMessage({ attributes: { end_chat: true } }))
        await settle()
        chat.messages.value[0].message = 'Thanks, bye!'
        await settle()
        expect(fetch).toHaveBeenCalledOnce()
        expect(ratingPrompt(chat.messages.value)).toBeUndefined()
    })

    describe('endChatForHost', () => {
        it('closes the session, then answers END_CHAT_DONE', async () => {
            const chat = setup()
            await chat.endChatForHost('s1')
            expect(vi.mocked(fetch).mock.calls[0][0].toString()).toContain('session_id=s1')
            expect(postToHost).toHaveBeenCalledWith({ type: 'END_CHAT_DONE' })
        })

        it('answers END_CHAT_DONE even when the close request throws', async () => {
            vi.mocked(fetch).mockRejectedValue(new Error('offline'))
            const chat = setup()
            await chat.endChatForHost('s1')
            expect(postToHost).toHaveBeenCalledWith({ type: 'END_CHAT_DONE' })
        })

        it('answers without a request when there is no session to close', async () => {
            const chat = setup()
            await chat.endChatForHost(undefined)
            expect(fetch).not.toHaveBeenCalled()
            expect(postToHost).toHaveBeenCalledWith({ type: 'END_CHAT_DONE' })
        })
    })
})
