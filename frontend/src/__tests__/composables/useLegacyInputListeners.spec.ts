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
import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { useLegacyInputListeners } from '@/composables/useLegacyInputListeners'

const FIRST_SELECTOR = '.widget-container input[type="text"]'

let scope: EffectScope | null = null

const setup = () => {
    const newMessage = ref('')
    const connectionStatus = ref('connecting')
    const messages = ref<unknown[]>([])
    const sendMessage = vi.fn()
    scope = effectScope()
    const legacy = scope.run(() => useLegacyInputListeners({ newMessage, sendMessage, connectionStatus, messages }))!
    return { ...legacy, newMessage, connectionStatus, messages, sendMessage }
}

const typeInto = (input: HTMLInputElement, text: string) => {
    input.value = text
    input.dispatchEvent(new Event('input', { bubbles: true }))
}

const pressEnter = (input: HTMLElement) =>
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))

const addInput = (parent: Element = document.querySelector('.widget-container')!) => {
    const input = document.createElement('input')
    input.type = 'text'
    parent.appendChild(input)
    return input
}

// Mutation observer callbacks run as microtasks, outside the faked timers.
const flushMutations = async () => {
    await Promise.resolve()
    await nextTick()
}

describe('useLegacyInputListeners', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        document.body.innerHTML = '<div class="widget-container"><div class="message-input"></div></div>'
    })

    afterEach(() => {
        scope?.stop()
        scope = null
        vi.useRealTimers()
        vi.restoreAllMocks()
        document.body.innerHTML = ''
    })

    it('keeps the message box in sync and sends on Enter once set up', () => {
        const legacy = setup()
        const input = addInput()
        legacy.start()
        vi.advanceTimersByTime(100)
        typeInto(input, 'hello')
        expect(legacy.newMessage.value).toBe('hello')
        pressEnter(input)
        expect(legacy.sendMessage).toHaveBeenCalledOnce()
    })

    it('stop() cancels a pending setup, and a later start() does nothing', async () => {
        const legacy = setup()
        const input = addInput()
        legacy.connectionStatus.value = 'connected'
        await nextTick()
        legacy.stop()
        vi.advanceTimersByTime(1000)
        typeInto(input, 'hello')
        expect(legacy.newMessage.value).toBe('')

        legacy.start()
        addInput()
        await flushMutations()
        vi.advanceTimersByTime(1000)
        typeInto(input, 'still nothing')
        expect(legacy.newMessage.value).toBe('')
    })

    it('ignores Enter and typing inside a form in the chat', () => {
        const container = document.querySelector('.widget-container')!
        const form = document.createElement('div')
        form.className = 'form-message'
        container.appendChild(form)
        const formField = addInput(form)
        const legacy = setup()
        legacy.start()
        vi.advanceTimersByTime(100)

        typeInto(formField, 'Jane')
        pressEnter(formField)
        expect(legacy.newMessage.value).toBe('')
        expect(legacy.sendMessage).not.toHaveBeenCalled()
    })

    it('re-attaches once after a burst of new fields (debounced)', async () => {
        const legacy = setup()
        addInput()
        legacy.start()
        vi.advanceTimersByTime(100)
        const lookups = vi.spyOn(document, 'querySelectorAll')
        const setups = () => lookups.mock.calls.filter(([selector]) => selector === FIRST_SELECTOR).length

        addInput()
        await flushMutations()
        vi.advanceTimersByTime(30)
        addInput()
        await flushMutations()
        vi.advanceTimersByTime(49)
        expect(setups()).toBe(0)
        vi.advanceTimersByTime(1)
        expect(setups()).toBe(1)
    })

    it('clears the visible field after a send and attaches to the new fields', () => {
        const legacy = setup()
        const input = addInput()
        input.placeholder = 'Type a message...'
        input.value = 'sent text'
        legacy.afterMessageSent()
        expect(input.value).toBe('')
        vi.advanceTimersByTime(500)
        typeInto(input, 'next')
        expect(legacy.newMessage.value).toBe('next')
    })
})
