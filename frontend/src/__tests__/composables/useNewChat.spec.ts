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

import { describe, it, expect, vi, afterEach } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useNewChat } from '@/composables/useNewChat'
import { NEW_CHAT_CONFIRM_TIMEOUT_MS, NEW_CHAT_FAILED_TEXT } from '@/webclient/new-chat'

const setup = (endChat = vi.fn().mockResolvedValue(true)) => {
    const messages = ref<unknown[]>([{ message_type: 'bot' }])
    const humanAgent = ref<{ human_agent_name?: string }>({})
    const initializeWidget = vi.fn().mockResolvedValue(true)
    const getWorkflowState = vi.fn().mockResolvedValue(undefined)
    const clearComposer = vi.fn()
    const newChat = useNewChat({
        customization: ref({ allow_new_chat: true }),
        conversation: { messages, humanAgent, endChat, getWorkflowState },
        showEmailGate: ref(false),
        initializeWidget,
        clearComposer,
    })
    return { ...newChat, messages, humanAgent, initializeWidget, getWorkflowState, clearComposer, endChat }
}

/** A promise the test settles by hand, to look at state while a call is in flight. */
const deferred = <T>() => {
    let resolve: (value: T) => void = () => {}
    const promise = new Promise<T>(r => { resolve = r })
    return { promise, resolve }
}

describe('useNewChat', () => {
    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    it('arms on the first request, withdraws on the second', () => {
        const chat = setup()
        chat.requestNewChat()
        expect(chat.newChatArmed.value).toBe(true)
        chat.requestNewChat()
        expect(chat.newChatArmed.value).toBe(false)
    })

    it('withdraws an unanswered question after the timeout', () => {
        vi.useFakeTimers()
        const chat = setup()
        chat.requestNewChat()
        vi.advanceTimersByTime(NEW_CHAT_CONFIRM_TIMEOUT_MS)
        expect(chat.newChatArmed.value).toBe(false)
    })

    it('withdraws the question when a human agent joins', async () => {
        const chat = setup()
        chat.requestNewChat()
        chat.humanAgent.value = { human_agent_name: 'Sam' }
        await nextTick()
        expect(chat.canStartNewChat.value).toBe(false)
        expect(chat.newChatArmed.value).toBe(false)
    })

    it('starts over after a confirmed close', async () => {
        const chat = setup()
        chat.requestNewChat()
        await chat.confirmNewChat()
        expect(chat.clearComposer).toHaveBeenCalledOnce()
        expect(chat.initializeWidget).toHaveBeenCalledOnce()
        expect(chat.newChatArmed.value).toBe(false)
    })

    it('keeps the bar up with the failure when the close is not confirmed', async () => {
        const chat = setup(vi.fn().mockResolvedValue(false))
        chat.requestNewChat()
        await chat.confirmNewChat()
        expect(chat.newChatError.value).toBe(NEW_CHAT_FAILED_TEXT)
        expect(chat.newChatArmed.value).toBe(true)
        expect(chat.initializeWidget).not.toHaveBeenCalled()
    })

    it('confirming stops the withdraw timer', async () => {
        vi.useFakeTimers()
        const chat = setup(vi.fn().mockResolvedValue(false))
        chat.requestNewChat()
        await chat.confirmNewChat()
        expect(vi.getTimerCount()).toBe(0)

        // The failed confirm keeps the bar and its message; the old timer must not
        // come along later and wipe them.
        vi.advanceTimersByTime(NEW_CHAT_CONFIRM_TIMEOUT_MS + 1000)
        expect(chat.newChatArmed.value).toBe(true)
        expect(chat.newChatError.value).toBe(NEW_CHAT_FAILED_TEXT)
    })

    it('a re-armed question gets its full time, not what was left of the old one', () => {
        vi.useFakeTimers()
        const chat = setup()
        chat.requestNewChat()
        vi.advanceTimersByTime(10_000)
        chat.requestNewChat() // withdraw
        chat.requestNewChat() // ask again
        expect(chat.newChatArmed.value).toBe(true)

        // Past the moment the first timer would have fired.
        vi.advanceTimersByTime(NEW_CHAT_CONFIRM_TIMEOUT_MS - 1)
        expect(chat.newChatArmed.value).toBe(true)
        vi.advanceTimersByTime(1)
        expect(chat.newChatArmed.value).toBe(false)
    })

    it('shows the failure when closing the chat throws', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const chat = setup(vi.fn().mockRejectedValue(new Error('offline')))
        chat.requestNewChat()
        await chat.confirmNewChat()
        expect(chat.newChatError.value).toBe(NEW_CHAT_FAILED_TEXT)
        expect(chat.startingNewChat.value).toBe(false)
        expect(chat.newChatArmed.value).toBe(true)
        expect(chat.clearComposer).not.toHaveBeenCalled()
        expect(chat.initializeWidget).not.toHaveBeenCalled()
    })

    it('ignores another request while a new chat is starting', async () => {
        const closing = deferred<boolean>()
        const chat = setup(vi.fn(() => closing.promise))

        const first = chat.handleStartNewChat()
        expect(chat.startingNewChat.value).toBe(true)

        await chat.handleStartNewChat()
        await chat.confirmNewChat()
        chat.requestNewChat()
        expect(chat.endChat).toHaveBeenCalledOnce()
        expect(chat.newChatArmed.value).toBe(false)

        closing.resolve(true)
        await first
        expect(chat.startingNewChat.value).toBe(false)
        expect(chat.initializeWidget).toHaveBeenCalledOnce()
    })

    it('a new workflow conversation clears the chat and the human agent', async () => {
        const chat = setup()
        chat.humanAgent.value = { human_agent_name: 'Sam' }
        await chat.handleStartNewConversation()
        expect(chat.messages.value).toEqual([])
        expect(chat.humanAgent.value).toEqual({})
        expect(chat.initializeWidget).toHaveBeenCalledOnce()
        expect(chat.getWorkflowState).toHaveBeenCalledOnce()
    })

    it('passes a workflow state failure on to the caller', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const chat = setup()
        chat.getWorkflowState.mockRejectedValue(new Error('no state'))
        await expect(chat.handleStartNewConversation()).rejects.toThrow('no state')
        expect(chat.messages.value).toEqual([])
    })

    it('stops the withdraw timer when the widget goes away', () => {
        vi.useFakeTimers()
        const scope = effectScope()
        const chat = scope.run(() => setup())!
        chat.requestNewChat()
        expect(vi.getTimerCount()).toBe(1)

        scope.stop()
        expect(vi.getTimerCount()).toBe(0)
        vi.advanceTimersByTime(NEW_CHAT_CONFIRM_TIMEOUT_MS)
        expect(chat.newChatArmed.value).toBe(true)
    })
})
