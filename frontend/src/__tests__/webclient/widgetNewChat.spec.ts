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

/**
 * The opt-in "New chat" control (customization.allow_new_chat) in the chat header.
 *
 * Starting a new chat closes the current session for good, so the control asks first,
 * withdraws the question if nobody answers, never shows mid-handover, and keeps the
 * conversation when the close fails. Characterization: this pins today's behaviour.
 */

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())

import { mountWidget, resetSocket, settle, socket, socketCalls } from './widgetHarness'
import {
    NEW_CHAT_CONFIRM_QUESTION,
    NEW_CHAT_CONFIRM_TIMEOUT_MS,
    NEW_CHAT_FAILED_TEXT,
    NEW_CHAT_LABEL,
} from '@/webclient/new-chat'

const A_MESSAGE = { message: 'Hello', message_type: 'user', created_at: '2026-11-10T10:00:00Z' }

// The message arrives after mount, as history does in the real widget. Seeding it
// before mount crashes setup today: the watch on canStartNewChat evaluates it while
// showEmailGate (declared ~260 lines later) is still in its TDZ ("Cannot access
// 'showEmailGate' before initialization"). An empty transcript short-circuits first.
let wrapper: any

const mountWithChat = async (customization: Record<string, any> = { allow_new_chat: true }) => {
    const mounted = await mountWidget({ customization })
    wrapper = mounted.wrapper
    await settle(wrapper, 6)
    socket.messages.value = [A_MESSAGE]
    await settle(wrapper)
    return mounted
}

const newChatButton = (wrapper: any) => wrapper.find(`button[aria-label="${NEW_CHAT_LABEL}"]`)
const confirmBar = (wrapper: any) => wrapper.find('[role="alertdialog"]')
const barButton = (wrapper: any, label: string) =>
    confirmBar(wrapper).findAll('button').find((b: any) => b.text() === label)
const authorizeCalls = (fetchMock: any) =>
    fetchMock.mock.calls.filter(([url]: any[]) => /\/widgets\/w-1(\?|$)/.test(String(url)))

beforeEach(() => resetSocket())
afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe('when the New chat control shows', () => {
    it('is not offered unless the agent opts in', async () => {
        await mountWithChat({})

        expect(newChatButton(wrapper).exists()).toBe(false)
    })

    it('is hidden while there is nothing to clear, and appears with the first message', async () => {
        ;({ wrapper } = await mountWidget({ customization: { allow_new_chat: true } }))
        await settle(wrapper, 6)

        expect(newChatButton(wrapper).exists()).toBe(false)

        socket.messages.value = [A_MESSAGE]
        await settle(wrapper)
        expect(newChatButton(wrapper).exists()).toBe(true)
        expect(newChatButton(wrapper).attributes('aria-expanded')).toBe('false')
    })

    it('is hidden during a human takeover', async () => {
        await mountWithChat()
        expect(newChatButton(wrapper).exists()).toBe(true)

        // Closing the session would drop the visitor out of a live handover.
        socket.humanAgent.value = { human_agent_name: 'Sam' }
        await settle(wrapper)

        expect(newChatButton(wrapper).exists()).toBe(false)
    })
})

describe('asking before a new chat', () => {
    it('arms a confirmation on the first click instead of ending the chat', async () => {
        await mountWithChat()

        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)

        expect(confirmBar(wrapper).exists()).toBe(true)
        expect(confirmBar(wrapper).text()).toContain(NEW_CHAT_CONFIRM_QUESTION)
        expect(newChatButton(wrapper).attributes('aria-expanded')).toBe('true')
        expect(socketCalls.endChat).not.toHaveBeenCalled()
    })

    it('a second click on the control withdraws the question', async () => {
        await mountWithChat()

        await newChatButton(wrapper).trigger('click')
        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)

        expect(confirmBar(wrapper).exists()).toBe(false)
        expect(socketCalls.endChat).not.toHaveBeenCalled()
    })

    it('Cancel withdraws the question and keeps the chat', async () => {
        await mountWithChat()
        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)

        await barButton(wrapper, 'Cancel').trigger('click')
        await settle(wrapper)

        expect(confirmBar(wrapper).exists()).toBe(false)
        expect(socketCalls.endChat).not.toHaveBeenCalled()
        expect(socket.messages.value).toHaveLength(1)
    })

    it('withdraws the question on its own when left unanswered', async () => {
        await mountWithChat()
        vi.useFakeTimers()

        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)
        expect(confirmBar(wrapper).exists()).toBe(true)

        vi.advanceTimersByTime(NEW_CHAT_CONFIRM_TIMEOUT_MS - 1)
        await settle(wrapper)
        expect(confirmBar(wrapper).exists()).toBe(true)

        vi.advanceTimersByTime(1)
        await settle(wrapper)
        expect(confirmBar(wrapper).exists()).toBe(false)
        expect(socketCalls.endChat).not.toHaveBeenCalled()
    })

    it('withdraws the question when a human agent takes over while it is open', async () => {
        await mountWithChat()
        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)

        socket.humanAgent.value = { human_agent_name: 'Sam' }
        await settle(wrapper)

        expect(confirmBar(wrapper).exists()).toBe(false)

        // Not just hidden: when the handover ends the control comes back un-armed.
        socket.humanAgent.value = {}
        await settle(wrapper)
        expect(newChatButton(wrapper).attributes('aria-expanded')).toBe('false')
        expect(confirmBar(wrapper).exists()).toBe(false)
    })
})

describe('confirming a new chat', () => {
    it('closes the session, reconnects into a fresh one and drops the question', async () => {
        const { fetchMock } = await mountWithChat()
        socketCalls.endChat.mockResolvedValue(true)
        const authorizedBefore = authorizeCalls(fetchMock).length

        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)
        await barButton(wrapper, 'Start new chat').trigger('click')
        await settle(wrapper, 8)

        expect(socketCalls.endChat).toHaveBeenCalledTimes(1)
        // initializeWidget runs again: a new authorize call.
        expect(authorizeCalls(fetchMock).length).toBe(authorizedBefore + 1)
        expect(confirmBar(wrapper).exists()).toBe(false)
        // Clearing the transcript is the socket's job (endChat resets it); the widget
        // itself does not touch messages here.
        expect(socket.messages.value).toHaveLength(1)
    })

    it('disables both answers and the control while the close is in flight', async () => {
        await mountWithChat()
        let finish: (closed: boolean) => void = () => {}
        socketCalls.endChat.mockReturnValue(new Promise<boolean>((resolve) => { finish = resolve }))

        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)
        await barButton(wrapper, 'Start new chat').trigger('click')
        await settle(wrapper)

        expect(barButton(wrapper, 'Start new chat').attributes('disabled')).toBeDefined()
        expect(barButton(wrapper, 'Cancel').attributes('disabled')).toBeDefined()
        expect(newChatButton(wrapper).attributes('disabled')).toBeDefined()

        finish(true)
        await settle(wrapper, 8)
    })

    it('closes once when confirm is pressed twice before the bar re-renders', async () => {
        const { fetchMock } = await mountWithChat()
        socketCalls.endChat.mockResolvedValue(true)
        const authorizedBefore = authorizeCalls(fetchMock).length

        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)
        // Both clicks land in the same tick, before the re-render disables the button.
        const confirm = barButton(wrapper, 'Start new chat')
        confirm.trigger('click')
        confirm.trigger('click')
        await settle(wrapper, 8)

        expect(socketCalls.endChat).toHaveBeenCalledTimes(1)
        expect(authorizeCalls(fetchMock).length).toBe(authorizedBefore + 1)
    })

    it('keeps the bar up with the failure text when the server does not confirm the close', async () => {
        const { fetchMock } = await mountWithChat()
        socketCalls.endChat.mockResolvedValue(false)
        const authorizedBefore = authorizeCalls(fetchMock).length

        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)
        await barButton(wrapper, 'Start new chat').trigger('click')
        await settle(wrapper, 6)

        expect(confirmBar(wrapper).exists()).toBe(true)
        // The failure replaces the question in the same bar.
        expect(confirmBar(wrapper).text()).toContain(NEW_CHAT_FAILED_TEXT)
        expect(confirmBar(wrapper).text()).not.toContain(NEW_CHAT_CONFIRM_QUESTION)
        // No reconnect: the old conversation is still the live one.
        expect(authorizeCalls(fetchMock).length).toBe(authorizedBefore)
    })

    it('shows the same failure text when ending the chat throws', async () => {
        await mountWithChat()
        socketCalls.endChat.mockRejectedValue(new Error('socket gone'))

        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)
        await barButton(wrapper, 'Start new chat').trigger('click')
        await settle(wrapper, 6)

        expect(confirmBar(wrapper).text()).toContain(NEW_CHAT_FAILED_TEXT)
    })

    it('Cancel after a failure clears the failure text', async () => {
        await mountWithChat()
        socketCalls.endChat.mockResolvedValue(false)
        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)
        await barButton(wrapper, 'Start new chat').trigger('click')
        await settle(wrapper, 6)

        await barButton(wrapper, 'Cancel').trigger('click')
        await settle(wrapper)
        expect(confirmBar(wrapper).exists()).toBe(false)

        // Asking again shows the question, not the old failure.
        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)
        expect(confirmBar(wrapper).text()).toContain(NEW_CHAT_CONFIRM_QUESTION)
        expect(confirmBar(wrapper).text()).not.toContain(NEW_CHAT_FAILED_TEXT)
    })

    it('leaves the failure up indefinitely: the auto-withdraw timer is gone after a confirm', async () => {
        await mountWithChat()
        socketCalls.endChat.mockResolvedValue(false)
        vi.useFakeTimers()
        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)
        await barButton(wrapper, 'Start new chat').trigger('click')
        await settle(wrapper, 6)

        // Pinned current behaviour (odd): confirming clears the auto-withdraw timer and a
        // failure does not re-arm it, so only Cancel (or the control) closes this bar.
        vi.advanceTimersByTime(NEW_CHAT_CONFIRM_TIMEOUT_MS * 2)
        await settle(wrapper)
        expect(confirmBar(wrapper).text()).toContain(NEW_CHAT_FAILED_TEXT)
    })

    it('lets the visitor retry after a failed close, and the retry starts the new chat', async () => {
        const { fetchMock } = await mountWithChat()
        socketCalls.endChat.mockResolvedValueOnce(false).mockResolvedValueOnce(true)
        const authorizedBefore = authorizeCalls(fetchMock).length

        await newChatButton(wrapper).trigger('click')
        await settle(wrapper)
        await barButton(wrapper, 'Start new chat').trigger('click')
        await settle(wrapper, 6)
        expect(confirmBar(wrapper).text()).toContain(NEW_CHAT_FAILED_TEXT)
        expect(authorizeCalls(fetchMock).length).toBe(authorizedBefore)

        await barButton(wrapper, 'Start new chat').trigger('click')
        await settle(wrapper, 8)

        expect(socketCalls.endChat).toHaveBeenCalledTimes(2)
        expect(authorizeCalls(fetchMock).length).toBe(authorizedBefore + 1)
        expect(confirmBar(wrapper).exists()).toBe(false)
    })
})
