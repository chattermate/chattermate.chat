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
 * The pre-chat email gate (customization.collect_email).
 *
 * An agent that collects email gets a lead for every conversation; a gate that lets a
 * quick action or a message slip through first loses that lead, and one that never
 * lifts loses the visitor. Characterization: this pins what the widget does today.
 */

// The server answers a visitor it doesn't know yet (no customer, no email) with a plain
// 401 "Unauthorized". mountWidget stubs fetch with a 200 before mounting, so the token
// composable is wrapped: its ensureFresh() runs right before every authorize call, which
// gives the spec a hook to answer the NEXT authorize with that 401.
const hooks = vi.hoisted(() => ({ beforeAuthorize: null as null | (() => void) }))

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())
vi.mock('@/composables/useConversationToken', async (importOriginal) => {
    const real: any = await importOriginal()
    return {
        ...real,
        useConversationToken: (options: any) => {
            const lifecycle = real.useConversationToken(options)
            return {
                ...lifecycle,
                ensureFresh: async (widgetId: string) => {
                    const hook = hooks.beforeAuthorize
                    hooks.beforeAuthorize = null
                    hook?.()
                    return lifecycle.ensureFresh(widgetId)
                },
            }
        },
    }
})

import { jsonResponse, mountWidget, resetSocket, settle, socket, socketCalls } from './widgetHarness'

const UNKNOWN_VISITOR = jsonResponse({ detail: 'Unauthorized' }, 401)
const AUTHORIZED = jsonResponse({ agent: { name: 'Ada' } })

const QUICK_ACTIONS = ['Pricing', 'Talk to sales']
const SERVER_ERROR = jsonResponse({ detail: 'Server error' }, 500)

let wrapper: any

/** Mount as a brand-new visitor the server refuses until they give an email. */
const mountUnknownVisitor = async (customization: Record<string, any>) => {
    socket.hasStartedChat.value = false
    hooks.beforeAuthorize = () => (globalThis.fetch as any).mockResolvedValue(UNKNOWN_VISITOR)
    const mounted = await mountWidget({ customization: { quick_actions: QUICK_ACTIONS, ...customization } })
    wrapper = mounted.wrapper
    await settle(wrapper, 10)
    return mounted
}

const gate = () => wrapper.find('input[type="email"]')
const buttonNamed = (name: string) =>
    wrapper.findAll('button').find((b: any) => b.text().trim() === name)
const continueButton = () => buttonNamed('Continue to chat')
const quickActionButton = (label: string) => buttonNamed(label)
const composer = () => wrapper.find('input[placeholder="Type a message..."]')
const authorizeCalls = (fetchMock: any) =>
    fetchMock.mock.calls.filter(([url]: any[]) => /\/widgets\/w-1(\?|$)/.test(String(url)))

/** Type a valid address and get past the gate with the server accepting it. */
const passGate = async (fetchMock: any, email = 'ada@example.com') => {
    fetchMock.mockResolvedValue(AUTHORIZED)
    await gate().setValue(email)
    await continueButton().trigger('click')
    await settle(wrapper, 10)
}

beforeEach(() => resetSocket())
afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    hooks.beforeAuthorize = null
    vi.unstubAllGlobals()
})

describe('the email gate when the agent collects email', () => {
    it('shows the gate instead of the chat for a visitor with no email yet', async () => {
        await mountUnknownVisitor({ collect_email: true })

        expect(wrapper.text()).toContain('Before we start')
        expect(wrapper.text()).toContain("Enter your email and we'll continue the chat.")
        expect(gate().attributes('placeholder')).toBe('you@example.com')
        // No composer and no quick actions behind it: nothing can be sent yet.
        expect(composer().exists()).toBe(false)
        QUICK_ACTIONS.forEach((label) => expect(quickActionButton(label)).toBeUndefined())
    })

    it('uses the welcome title as the gate heading when one is set', async () => {
        await mountUnknownVisitor({ collect_email: true, welcome_title: 'Hi there' })

        expect(wrapper.text()).toContain('Hi there')
        expect(wrapper.text()).not.toContain('Before we start')
    })

    it('asks for an address when Continue is pressed with the field empty', async () => {
        const { fetchMock } = await mountUnknownVisitor({ collect_email: true })
        const before = authorizeCalls(fetchMock).length

        await continueButton().trigger('click')
        await settle(wrapper)

        expect(wrapper.text()).toContain('Please enter your email address.')
        expect(authorizeCalls(fetchMock).length).toBe(before)
        expect(gate().exists()).toBe(true)
        expect(composer().exists()).toBe(false)
    })

    it('refuses an invalid address with its error and does not call the server', async () => {
        const { fetchMock } = await mountUnknownVisitor({ collect_email: true })
        const before = authorizeCalls(fetchMock).length

        await gate().setValue('not-an-email')
        await continueButton().trigger('click')
        await settle(wrapper)

        expect(wrapper.text()).toContain('Please enter a valid email address.')
        expect(gate().classes()).toContain('invalid')
        expect(authorizeCalls(fetchMock).length).toBe(before)
        expect(gate().exists()).toBe(true)
        expect(composer().exists()).toBe(false)

        // Typing again clears the error.
        await gate().setValue('not-an-email-either')
        expect(wrapper.text()).not.toContain('Please enter a valid email address.')
    })

    it('lets the chat start once a valid address is submitted', async () => {
        const { fetchMock } = await mountUnknownVisitor({ collect_email: true })
        fetchMock.mockResolvedValue(AUTHORIZED)

        await gate().setValue('  ada@example.com ')
        await gate().trigger('keyup', { key: 'Enter' })
        await settle(wrapper, 10)

        // The address goes to the server on the authorize call, trimmed.
        const lastAuthorize = authorizeCalls(fetchMock).at(-1)
        expect(new URL(String(lastAuthorize[0])).searchParams.get('email')).toBe('ada@example.com')
        // Authorizing loads the history, which is what starts the chat.
        expect(socketCalls.loadChatHistory).toHaveBeenCalled()
        expect(socket.hasStartedChat.value).toBe(true)

        expect(gate().exists()).toBe(false)
        expect(composer().exists()).toBe(true)
        expect(composer().attributes('disabled')).toBeUndefined()
        expect(quickActionButton('Pricing')).toBeDefined()
        expect(quickActionButton('Pricing').attributes('disabled')).toBeUndefined()
    })

    it('sends a quick action with the collected email once the gate is passed', async () => {
        const { fetchMock } = await mountUnknownVisitor({ collect_email: true })
        await passGate(fetchMock)

        await quickActionButton('Talk to sales').trigger('click')
        await settle(wrapper)

        expect(socketCalls.sendMessage).toHaveBeenCalledWith('Talk to sales', 'ada@example.com', [], {})
    })

    it('keeps the gate up while an address is only typed, valid or not', async () => {
        const { fetchMock } = await mountUnknownVisitor({ collect_email: true })
        const before = authorizeCalls(fetchMock).length

        await gate().setValue('ada@')
        await settle(wrapper)
        expect(gate().exists()).toBe(true)
        expect(composer().exists()).toBe(false)
        expect(quickActionButton('Pricing')).toBeUndefined()

        // A valid address is not enough on its own: only Continue (or Enter) submits it.
        await gate().setValue('ada@example.com')
        await settle(wrapper)
        expect(gate().exists()).toBe(true)
        expect(composer().exists()).toBe(false)
        expect(quickActionButton('Pricing')).toBeUndefined()
        expect(authorizeCalls(fetchMock).length).toBe(before)
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
    })

    it('lifts the gate even when the server still refuses the visitor', async () => {
        await mountUnknownVisitor({ collect_email: true })

        // Pinned current behaviour (bug): a second 401 still drops the gate, because
        // submitting ignores the authorize result (it only catches a throw, which never comes).
        await gate().setValue('ada@example.com')
        await continueButton().trigger('click')
        await settle(wrapper, 10)

        expect(gate().exists()).toBe(false)
        expect(socket.hasStartedChat.value).toBe(false)
        expect(composer().exists()).toBe(true)
        expect(wrapper.text()).not.toContain('Something went wrong. Please try again.')
    })

    it('disables Continue while the address is being checked', async () => {
        const { fetchMock } = await mountUnknownVisitor({ collect_email: true })
        let answer: (response: any) => void = () => {}
        fetchMock.mockReturnValue(new Promise((resolve) => { answer = resolve }))
        await gate().setValue('ada@example.com')

        await continueButton().trigger('click')
        await settle(wrapper)

        const waiting = buttonNamed('Please wait…')
        expect(waiting.attributes('disabled')).toBeDefined()
        expect(gate().attributes('disabled')).toBeDefined()

        answer(AUTHORIZED)
        await settle(wrapper, 10)
        expect(gate().exists()).toBe(false)
    })

    it('authorizes twice when Continue is pressed twice within one tick', async () => {
        const { fetchMock } = await mountUnknownVisitor({ collect_email: true })
        fetchMock.mockResolvedValue(AUTHORIZED)
        await gate().setValue('ada@example.com')
        const before = authorizeCalls(fetchMock).length

        // Both clicks land before the re-render disables the button.
        const button = continueButton()
        button.trigger('click')
        button.trigger('click')
        await settle(wrapper, 10)

        // Pinned current behaviour (bug): the submit has no in-flight guard of its own;
        // only the disabled button stops a second press, so a same-tick double press sends two.
        expect(authorizeCalls(fetchMock).length - before).toBe(2)
        expect(gate().exists()).toBe(false)
    })
})

describe('when authorizing fails', () => {
    const failAuthorize = (answer: () => void) => {
        hooks.beforeAuthorize = answer
    }

    it('shows the error from a 500 on mount instead of the chat', async () => {
        failAuthorize(() => (globalThis.fetch as any).mockResolvedValue(SERVER_ERROR))
        ;({ wrapper } = await mountWidget())
        await settle(wrapper, 10)

        expect(wrapper.text()).toContain('Authentication Error')
        expect(wrapper.text()).toContain('Server error')
        expect(composer().exists()).toBe(false)
        expect(socketCalls.connect).not.toHaveBeenCalled()
    })

    it('shows a generic error when the authorize request itself fails on mount', async () => {
        failAuthorize(() => (globalThis.fetch as any).mockRejectedValue(new Error('offline')))
        ;({ wrapper } = await mountWidget())
        await settle(wrapper, 10)

        expect(wrapper.text()).toContain('Authentication Error')
        expect(wrapper.text()).toContain('An unexpected error occurred. Please try again.')
        expect(composer().exists()).toBe(false)
        expect(socketCalls.connect).not.toHaveBeenCalled()
    })

    it('replaces the gate with the error when the submit answers 500', async () => {
        const { fetchMock } = await mountUnknownVisitor({ collect_email: true })
        fetchMock.mockResolvedValue(SERVER_ERROR)

        await gate().setValue('ada@example.com')
        await continueButton().trigger('click')
        await settle(wrapper, 10)

        expect(wrapper.text()).toContain('Authentication Error')
        expect(wrapper.text()).toContain('Server error')
        expect(gate().exists()).toBe(false)
        expect(composer().exists()).toBe(false)
        expect(socketCalls.connect).not.toHaveBeenCalled()
    })

    it('replaces the gate with a generic error when the submit request fails', async () => {
        const { fetchMock } = await mountUnknownVisitor({ collect_email: true })
        fetchMock.mockRejectedValue(new Error('offline'))

        await gate().setValue('ada@example.com')
        await continueButton().trigger('click')
        await settle(wrapper, 10)

        // The gate's own "Something went wrong" never shows: authorizing catches the
        // failure itself and swaps the whole widget for its error card.
        expect(wrapper.text()).toContain('An unexpected error occurred. Please try again.')
        expect(wrapper.text()).not.toContain('Something went wrong. Please try again.')
        expect(gate().exists()).toBe(false)
        expect(composer().exists()).toBe(false)
    })
})

describe('the email gate when the agent does not collect email', () => {
    it('never shows a gate, and the chat is usable without an email', async () => {
        // Even before the server has accepted the visitor (the same 401 start as above).
        await mountUnknownVisitor({ collect_email: false })

        expect(gate().exists()).toBe(false)
        expect(wrapper.text()).not.toContain('Before we start')
        expect(composer().exists()).toBe(true)
        expect(composer().attributes('disabled')).toBeUndefined()

        await quickActionButton('Pricing').trigger('click')
        await settle(wrapper)
        expect(socketCalls.sendMessage).toHaveBeenCalledWith('Pricing', '', [], {})
    })

    it('treats a missing collect_email as off', async () => {
        await mountUnknownVisitor({})

        expect(gate().exists()).toBe(false)
        expect(composer().exists()).toBe(true)
        expect(quickActionButton('Pricing')).toBeDefined()
    })
})
