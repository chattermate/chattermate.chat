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
import { mountWidget, resetSocket, socket, socketCalls } from './widgetHarness'

/**
 * The composer while the assistant is answering.
 *
 * Disabling an input blurs it, and nothing hands the focus back — so gating the
 * field on "no reply in flight" cost the visitor their cursor after every single
 * message, and they had to click the box again to keep typing (#316).
 */

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())

let wrapper: any

describe('the composer while a reply is in flight', () => {
    beforeEach(() => resetSocket())

    afterEach(() => {
        wrapper?.unmount()
        wrapper = undefined
        vi.unstubAllGlobals()
    })

    const composer = (wrapper: any) => wrapper.find('textarea[aria-label="Message"]')
    const sendButton = (wrapper: any) => wrapper.find('button[aria-label="Send message"]')

    it('keeps the field typable while the assistant is answering', async () => {
        ;({ wrapper } = await mountWidget())

        expect(composer(wrapper).attributes('disabled')).toBeUndefined()

        socket.loading.value = true
        await wrapper.vm.$nextTick()

        // The moment this becomes `disabled`, the browser drops the cursor.
        expect(composer(wrapper).attributes('disabled')).toBeUndefined()
    })

    it('still refuses typing when the socket is not connected', async () => {
        ;({ wrapper } = await mountWidget())

        socket.connectionStatus.value = 'connecting'
        await wrapper.vm.$nextTick()

        expect(composer(wrapper).attributes('disabled')).toBeDefined()
    })

    it('holds a message typed mid-reply and sends it when the reply lands', async () => {
        ;({ wrapper } = await mountWidget())

        socket.loading.value = true
        await wrapper.vm.$nextTick()

        const field = composer(wrapper)
        await field.setValue('and one more thing')
        await field.trigger('keydown', { key: 'Enter' })

        // Sending now would start a second agent run on the same conversation.
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()

        socket.loading.value = false
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()

        // ...and it must not be lost either.
        expect(socketCalls.sendMessage).toHaveBeenCalledWith(
            'and one more thing', expect.anything(), expect.anything(), {}
        )
    })

    it('does not carry a queued message into the next conversation', async () => {
        ;({ wrapper } = await mountWidget())

        socket.loading.value = true
        await wrapper.vm.$nextTick()

        const field = composer(wrapper)
        await field.setValue('meant for the chat I just closed')
        await field.trigger('keydown', { key: 'Enter' })

        // Ending the chat clears the transcript and stops the typing indicator,
        // which lands on the same `loading` change the queue waits for.
        socket.hasStartedChat.value = false
        socket.messages.value = []
        socket.loading.value = false
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()

        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
    })

    it('does not send a second message while one is being answered', async () => {
        ;({ wrapper } = await mountWidget())

        socket.loading.value = true
        await wrapper.vm.$nextTick()

        // Typing carries on, and the button takes it, but sending waits its turn.
        await composer(wrapper).setValue('second question')
        await sendButton(wrapper).trigger('click')
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()

        socket.loading.value = false
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()

        expect(socketCalls.sendMessage).toHaveBeenCalledTimes(1)
        expect(socketCalls.sendMessage).toHaveBeenCalledWith(
            'second question', expect.anything(), expect.anything(), {}
        )
    })
})
