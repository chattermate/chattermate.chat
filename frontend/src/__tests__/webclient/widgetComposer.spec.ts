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
import { ref } from 'vue'

/**
 * The composer while the assistant is answering.
 *
 * Disabling an input blurs it, and nothing hands the focus back — so gating the
 * field on "no reply in flight" cost the visitor their cursor after every single
 * message, and they had to click the box again to keep typing (#316).
 */

const sendMessage = vi.fn()

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
    currentSessionId: ref('session-1')
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
        submitRating: vi.fn(),
        submitForm: vi.fn(),
        getWorkflowState: vi.fn(),
        proceedWorkflow: vi.fn(),
        onWorkflowState: vi.fn(),
        onWorkflowProceeded: vi.fn(),
        setToken: vi.fn(),
        setWidgetId: vi.fn()
    })
}))

describe('the composer while a reply is in flight', () => {
    let WidgetBuilder: any

    beforeEach(async () => {
        sendMessage.mockClear()
        socket.loading.value = false
        socket.hasStartedChat.value = true
        socket.connectionStatus.value = 'connected'
        socket.messages.value = []

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
        vi.unstubAllGlobals()
    })

    const composer = (wrapper: any) =>
        wrapper.find('input.welcome-message-field, .message-input input')

    it('keeps the field typable while the assistant is answering', async () => {
        const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })

        expect(composer(wrapper).attributes('disabled')).toBeUndefined()

        socket.loading.value = true
        await wrapper.vm.$nextTick()

        // The moment this becomes `disabled`, the browser drops the cursor.
        expect(composer(wrapper).attributes('disabled')).toBeUndefined()

        wrapper.unmount()
    })

    it('still refuses typing when the socket is not connected', async () => {
        const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })

        socket.connectionStatus.value = 'connecting'
        await wrapper.vm.$nextTick()

        expect(composer(wrapper).attributes('disabled')).toBeDefined()

        wrapper.unmount()
    })

    it('holds a message typed mid-reply and sends it when the reply lands', async () => {
        const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })

        socket.loading.value = true
        await wrapper.vm.$nextTick()

        const field = composer(wrapper)
        await field.setValue('and one more thing')
        await field.trigger('keypress', { key: 'Enter' })

        // Sending now would start a second agent run on the same conversation.
        expect(sendMessage).not.toHaveBeenCalled()

        socket.loading.value = false
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()

        // ...and it must not be lost either.
        expect(sendMessage).toHaveBeenCalledWith(
            'and one more thing', expect.anything(), expect.anything()
        )

        wrapper.unmount()
    })

    it('does not carry a queued message into the next conversation', async () => {
        const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })

        socket.loading.value = true
        await wrapper.vm.$nextTick()

        const field = composer(wrapper)
        await field.setValue('meant for the chat I just closed')
        await field.trigger('keypress', { key: 'Enter' })

        // Ending the chat clears the transcript and stops the typing indicator,
        // which lands on the same `loading` change the queue waits for.
        socket.hasStartedChat.value = false
        socket.messages.value = []
        socket.loading.value = false
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()

        expect(sendMessage).not.toHaveBeenCalled()

        wrapper.unmount()
    })

    it('does not accept a second message while one is being answered', async () => {
        const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })

        socket.loading.value = true
        await wrapper.vm.$nextTick()

        // Typing carries on, but sending waits its turn.
        const send = wrapper.find('.welcome-send-button, .send-button')
        expect(send.attributes('disabled')).toBeDefined()

        wrapper.unmount()
    })
})
