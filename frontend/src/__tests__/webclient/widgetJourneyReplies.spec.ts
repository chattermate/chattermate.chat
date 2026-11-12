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
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'

/**
 * A journey step that moves on while the agent is answering (an action it ran
 * finished the step) comes after the reply, not before it: it waits until the
 * reply has arrived *and* finished typing out, then shows below it.
 *
 * Reply buttons go the moment one is tapped and stay gone until its reply has
 * typed out; buttons the agent offers with a reply stand in for the step's.
 */

const sendMessage = vi.fn()
const handlers = new Map<string, (...args: any[]) => void>()

const socket = {
    messages: ref<any[]>([]),
    loading: ref(false),
    errorMessage: ref(''),
    showError: ref(false),
    loadingHistory: ref(false),
    hasStartedChat: ref(true),
    connectionStatus: ref('connected'),
    humanAgent: ref({}),
    currentForm: ref(null),
    currentSessionId: ref('session-1'),
    refusal: ref(null)
}

vi.mock('@/composables/useWidgetSocket', () => ({
    useWidgetSocket: () => ({
        ...socket,
        sendMessage,
        sendFileAttachments: vi.fn(),
        endChat: vi.fn(),
        loadChatHistory: vi.fn(),
        connect: vi.fn().mockResolvedValue(true),
        reconnect: vi.fn(),
        cleanup: vi.fn(),
        onTakeover: vi.fn(),
        onSessionState: vi.fn(),
        onReauthorize: vi.fn(),
        submitRating: vi.fn(),
        submitForm: vi.fn(),
        getWorkflowState: vi.fn(),
        proceedWorkflow: vi.fn(),
        onWorkflowState: vi.fn(),
        onWorkflowProceeded: vi.fn(),
        setToken: vi.fn(),
        setWidgetId: vi.fn(),
        on: (event: string, listener: (...args: any[]) => void) => handlers.set(event, listener),
        emit: vi.fn()
    })
}))

const STEP = 'Next it needs to learn about Pedalco.'
const REPLY = 'Your Pedalco Assistant is set up.'

const teachStep = {
    view: {
        journey_key: 'setup',
        journey_name: 'Setup',
        auto_open: false,
        step_count: 4,
        step_titles: ['Create', 'Teach it', 'Try it', 'Go live'],
        finished: false,
        step_id: 'teach',
        step_index: 1,
        title: 'Teach it',
        message: STEP,
        chips: [{ label: 'Paste some text', kind: 'text', value: 'I want to paste some text' }],
    },
}

describe('journey replies in the widget', () => {
    let WidgetBuilder: any

    beforeEach(async () => {
        vi.useFakeTimers()
        handlers.clear()
        sendMessage.mockClear()
        socket.loading.value = false
        socket.messages.value = [{ message: 'Set up an agent for me', message_type: 'user', created_at: '', session_id: '' }]

        ;(window as any).__INITIAL_DATA__ = {
            widgetId: 'w-1',
            agentName: 'Ada',
            customization: {},
            customerId: 'c-1',
            customer: {},
            initialToken: 'tok-1'
        }
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ agent: { name: 'Ada' } })
        }))

        vi.resetModules()
        WidgetBuilder = (await import('@/webclient/WidgetBuilder.vue')).default
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.unstubAllGlobals()
    })

    const bubbles = (wrapper: any) => wrapper.findAll('.message-bubble').map((b: any) => b.text())

    it('shows the step only once the reply has typed out, and below it', async () => {
        const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })

        // The agent is answering; its action finishes the step meanwhile.
        socket.loading.value = true
        handlers.get('journey_state')!(teachStep)
        await nextTick()
        expect(wrapper.text()).not.toContain(STEP)

        // The reply lands and starts typing out: the step still waits.
        socket.loading.value = false
        socket.messages.value.push({ message: REPLY, message_type: 'bot', created_at: '', session_id: '', stream: true })
        await nextTick()
        await vi.advanceTimersByTimeAsync(60)
        expect(wrapper.text()).not.toContain(STEP)
        expect(wrapper.text()).not.toContain('Paste some text')

        // Typed out: now the step shows, after the reply.
        await vi.runAllTimersAsync()
        await nextTick()
        const texts = bubbles(wrapper)
        const reply = texts.findIndex((t: string) => t.includes(REPLY))
        const step = texts.findIndex((t: string) => t.includes(STEP))
        expect(reply).toBeGreaterThan(-1)
        expect(step).toBeGreaterThan(reply)
        expect(wrapper.text()).toContain('Paste some text')

        wrapper.unmount()
    })

    it('does not store a step the visitor has not seen as answered', async () => {
        const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })

        handlers.get('journey_state')!(teachStep)
        socket.messages.value.push({ message: REPLY, message_type: 'bot', created_at: '', session_id: '', stream: true })
        await nextTick()

        const field = wrapper.find('input.welcome-message-field, .message-input input')
        await field.setValue('quick question')
        await field.trigger('keypress', { key: 'Enter' })
        await nextTick()

        expect(sendMessage).toHaveBeenCalledWith('quick question', expect.anything(), expect.anything(), {})

        wrapper.unmount()
    })

    const buttons = (wrapper: any) => wrapper.findAll('.cm-reply').map((b: any) => b.text())
    const typedOut = async () => {
        await vi.runAllTimersAsync()
        await nextTick()
    }

    it('offers the agent\'s choices in place of the step\'s buttons until answered', async () => {
        const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })
        handlers.get('journey_state')!(teachStep)
        socket.messages.value.push({ message: 'Which colour?', message_type: 'bot', created_at: '', session_id: '', attributes: { quick_replies: ['Blue', 'Green'] } })
        await nextTick()
        expect(buttons(wrapper)).toEqual(['Blue', 'Green'])

        // Any later message retires them: the step's own come back.
        socket.messages.value.push({ message: 'purple please', message_type: 'user', created_at: '', session_id: '' })
        socket.messages.value.push({ message: 'Done.', message_type: 'bot', created_at: '', session_id: '' })
        await nextTick()
        expect(buttons(wrapper)).toEqual(['Paste some text'])
        wrapper.unmount()
    })

    it('hides every button the moment one is tapped, until its reply has typed out', async () => {
        const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })
        handlers.get('journey_state')!(teachStep)
        socket.messages.value.push({ message: 'Which colour?', message_type: 'bot', created_at: '', session_id: '', attributes: { quick_replies: ['Blue', 'Green'] } })
        await nextTick()

        await wrapper.findAll('.cm-reply')[0].trigger('click')
        await nextTick()
        expect(sendMessage).toHaveBeenCalledWith('Blue', expect.anything(), expect.anything(), expect.anything())
        // Before the server has said anything
        expect(buttons(wrapper)).toEqual([])

        socket.loading.value = true
        await nextTick()
        socket.loading.value = false
        socket.messages.value.push({ message: 'Blue', message_type: 'user', created_at: '', session_id: '' })
        socket.messages.value.push({ message: 'The chat is blue now.', message_type: 'bot', created_at: '', session_id: '', stream: true })
        await nextTick()
        await vi.advanceTimersByTimeAsync(60)
        expect(buttons(wrapper)).toEqual([])

        await typedOut()
        expect(buttons(wrapper)).toEqual(['Paste some text'])
        wrapper.unmount()
    })

    it('brings the buttons back when a tap started nothing', async () => {
        const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })
        handlers.get('journey_state')!(teachStep)
        await nextTick()

        await wrapper.findAll('.cm-reply')[0].trigger('click')
        await nextTick()
        expect(buttons(wrapper)).toEqual([])

        await vi.advanceTimersByTimeAsync(10_000)
        await nextTick()
        expect(buttons(wrapper)).toEqual(['Paste some text'])
        wrapper.unmount()
    })
})
