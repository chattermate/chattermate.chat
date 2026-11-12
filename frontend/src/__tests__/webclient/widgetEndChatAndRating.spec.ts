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
 * The end of a conversation and the human handover.
 *
 * An end_chat message closes the session on the server; doing that more than once (the
 * watch is deep and re-runs on every streamed character) or for the wrong message ends
 * conversations nobody finished. The rating prompt is the only CSAT signal the widget
 * collects. On takeover the header and AI disclosure must stop claiming an AI is
 * answering. Characterization: this pins today's behaviour.
 */

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())

import { mountWidget, resetSocket, settle, socket, socketCalls } from './widgetHarness'
import { AI_DISCLAIMER_TEXT } from '@/utils/aiDisclaimer'

const endChatMessage = (attributes: Record<string, any> = {}) => ({
    message: 'Thanks for chatting!',
    message_type: 'bot',
    created_at: '2026-11-10T10:00:00Z',
    session_id: 'session-9',
    attributes: { end_chat: true, end_chat_reason: 'RESOLVED', ...attributes },
})

let wrapper: any

const mounted = async (customization: Record<string, any> = {}) => {
    const result = await mountWidget({ customization })
    wrapper = result.wrapper
    await settle(wrapper, 6)
    return result
}

const endChatCalls = (fetchMock: any) =>
    fetchMock.mock.calls.filter(([url]: any[]) => String(url).includes('/end-chat'))
// The stars are named "N out of 5"; anything else stays free to restyle them.
const stars = (wrapper: any) =>
    [1, 2, 3, 4, 5].map((n) => wrapper.find(`button[aria-label="${n} out of 5"]`)).filter((star: any) => star.exists())
const submitButton = (wrapper: any) =>
    wrapper.findAll('button').find((b: any) => b.text() === 'Submit Rating')
const headerName = (wrapper: any) => wrapper.find('.header-info h3')

beforeEach(() => resetSocket())
afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.unstubAllGlobals()
})

describe('an end_chat message', () => {
    it('closes the session on the server with its reason and the conversation token', async () => {
        const { fetchMock } = await mounted()

        socket.messages.value = [endChatMessage()]
        await settle(wrapper)

        const calls = endChatCalls(fetchMock)
        expect(calls).toHaveLength(1)
        const [url, init] = calls[0]
        const parsed = new URL(String(url))
        expect(parsed.pathname).toMatch(/\/widgets\/w-1\/end-chat$/)
        expect(parsed.searchParams.get('session_id')).toBe('session-9')
        expect(parsed.searchParams.get('reason')).toBe('RESOLVED')
        expect(init).toMatchObject({ method: 'POST', keepalive: false })
        expect(init.headers.Authorization).toBe('Bearer tok-1')
    })

    it('closes it once even as the message keeps re-rendering', async () => {
        const { fetchMock } = await mounted()

        socket.messages.value = [endChatMessage()]
        await settle(wrapper)
        // A streamed reply mutates the same message object character by character.
        socket.messages.value[0].message += ' Bye.'
        await settle(wrapper)
        socket.messages.value[0].message += ' Take care.'
        await settle(wrapper)

        expect(endChatCalls(fetchMock)).toHaveLength(1)
    })

    it('closes it again when the same end_chat arrives as a new object (e.g. a history reload)', async () => {
        const { fetchMock } = await mounted()

        socket.messages.value = [endChatMessage()]
        await settle(wrapper)
        // Pinned current behaviour (odd): "already handled" is tracked by object identity,
        // so a reloaded transcript whose last message is the same end_chat closes it again.
        socket.messages.value = [endChatMessage()]
        await settle(wrapper)

        expect(endChatCalls(fetchMock)).toHaveLength(2)
    })

    it('does not close anything for an ordinary message carrying a session id', async () => {
        const { fetchMock } = await mounted()

        socket.messages.value = [{ ...endChatMessage(), attributes: { end_chat: false } }]
        await settle(wrapper)

        expect(endChatCalls(fetchMock)).toHaveLength(0)
    })

    it('does not ask for a rating unless request_rating is set', async () => {
        await mounted()

        socket.messages.value = [endChatMessage()]
        await settle(wrapper)

        expect(wrapper.text()).not.toContain('Rate the chat session')
        expect(stars(wrapper)).toHaveLength(0)
    })
})

describe('the rating prompt', () => {
    const endWithRating = async () => {
        const result = await mounted()
        socket.messages.value = [endChatMessage({ request_rating: true })]
        await settle(result.wrapper, 6)
        return result
    }

    it('shows five stars and names the agent once the chat ends with request_rating', async () => {
        await endWithRating()

        expect(wrapper.text()).toContain('Rate the chat session that you had with Ada')
        expect(stars(wrapper)).toHaveLength(5)
        expect(socket.messages.value.at(-1)).toMatchObject({ message_type: 'rating', session_id: 'session-9' })
        // The socket rates whatever session is current, so the widget points it here.
        expect(socket.currentSessionId.value).toBe('session-9')
        // No feedback box or submit until a star is picked.
        expect(submitButton(wrapper)).toBeUndefined()
    })

    it('submits the picked star with the feedback, and locks the stars afterwards', async () => {
        await endWithRating()

        await stars(wrapper)[3].trigger('click')
        await settle(wrapper)
        await wrapper.find('input[placeholder="Please share your feedback (optional)"]').setValue('Great help')
        await submitButton(wrapper).trigger('click')
        await settle(wrapper)

        // The session is not an argument: handleSubmitRating drops its sessionId and the
        // socket uses currentSessionId (set to the ended session above).
        expect(socketCalls.submitRating).toHaveBeenCalledTimes(1)
        expect(socketCalls.submitRating).toHaveBeenCalledWith(4, 'Great help')
        expect(socket.currentSessionId.value).toBe('session-9')

        expect(submitButton(wrapper)).toBeUndefined()
        expect(wrapper.text()).toContain('Great help')
        stars(wrapper).forEach((star: any) => expect(star.attributes('disabled')).toBeDefined())
    })

    it('submits a star with no feedback as null feedback', async () => {
        await endWithRating()

        await stars(wrapper)[4].trigger('click')
        await settle(wrapper)
        await submitButton(wrapper).trigger('click')
        await settle(wrapper)

        expect(socketCalls.submitRating).toHaveBeenCalledWith(5, null)
    })

    it('disables Submit while the rating is being sent', async () => {
        await endWithRating()
        let finish: () => void = () => {}
        socketCalls.submitRating.mockReturnValue(new Promise<void>((resolve) => { finish = resolve }))

        await stars(wrapper)[2].trigger('click')
        await settle(wrapper)
        await submitButton(wrapper).trigger('click')
        await settle(wrapper)

        const sending = wrapper.findAll('button').find((b: any) => b.text() === 'Submitting...')
        expect(sending.attributes('disabled')).toBeDefined()

        finish()
        await settle(wrapper)
        expect(socketCalls.submitRating).toHaveBeenCalledTimes(1)
    })

    it('sends the rating once when Submit is pressed twice within one tick', async () => {
        await endWithRating()

        await stars(wrapper)[2].trigger('click')
        await settle(wrapper)
        // Both clicks land before the re-render disables the button.
        const submit = submitButton(wrapper)
        submit.trigger('click')
        submit.trigger('click')
        await settle(wrapper)

        // The submit has its own in-flight guard (it used to send two).
        expect(socketCalls.submitRating).toHaveBeenCalledTimes(1)
    })

    it('submits the picked number, whatever the pointer passed over after', async () => {
        await endWithRating()

        await stars(wrapper)[3].trigger('click')
        await stars(wrapper)[1].trigger('mouseover')
        await stars(wrapper)[1].trigger('mouseleave')
        await settle(wrapper)
        await submitButton(wrapper).trigger('click')
        await settle(wrapper)

        // The classic stars sent the last hovered star here; the panel's numbers have no hover state.
        expect(socketCalls.submitRating).toHaveBeenCalledWith(4, null)
    })
})

describe('the AI disclaimer and the header on a human takeover', () => {
    it('shows the AI disclaimer by default and drops it once a human takes over', async () => {
        await mounted()
        expect(wrapper.text()).toContain(AI_DISCLAIMER_TEXT)

        socket.humanAgent.value = { human_agent_name: 'Sam' }
        await settle(wrapper)

        expect(wrapper.text()).not.toContain(AI_DISCLAIMER_TEXT)
    })

    it('never shows the disclaimer when show_ai_disclaimer is false', async () => {
        await mounted({ show_ai_disclaimer: false })

        expect(wrapper.text()).not.toContain(AI_DISCLAIMER_TEXT)
    })

    it('switches the header from the agent to the human agent by name', async () => {
        await mounted()
        expect(headerName(wrapper).text()).toBe('Ada')

        socket.humanAgent.value = { human_agent_name: 'Sam' }
        await settle(wrapper)

        expect(headerName(wrapper).text()).toBe('Sam')
    })

    it('names the human agent in the rating prompt when the end_chat has no agent name', async () => {
        await mounted()
        socket.humanAgent.value = { human_agent_name: 'Sam' }
        socket.messages.value = [endChatMessage({ request_rating: true })]
        await settle(wrapper, 6)

        expect(wrapper.text()).toContain('Rate the chat session that you had with Sam')
    })
})
