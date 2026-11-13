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
 * Every message kind in the redesigned panel, end to end through the real widget
 * controller with the fake socket: the rating, forms, questions, workflow screens,
 * products and files reach the same socket calls as the classic widget's.
 */

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())

import { mountWidget, postFromParent, resetSocket, settle, socket, socketCalls } from './widgetHarness'

const V2 = { customization_metadata: { widget_ui: { version: 2 } } }

let wrapper: any

const mountPanel = async (initialData: Record<string, any> = {}) => {
    ;({ wrapper } = await mountWidget({ customization: V2, initialData }))
    document.body.appendChild(wrapper.element)
    await settle(wrapper, 6)
}

const show = async (...messages: Record<string, any>[]) => {
    socket.messages.value = messages.map(m => ({ created_at: '', session_id: 's-1', message: '', ...m }))
    await settle(wrapper)
}

const buttonNamed = (name: string) => wrapper.findAll('button').find((b: any) => b.text().trim() === name)

beforeEach(() => resetSocket())
afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
})

describe('the rating card', () => {
    it('sends the picked rating and feedback, then thanks the visitor', async () => {
        await mountPanel()
        await show({ message_type: 'rating' })
        await wrapper.find('button[aria-label="4 out of 5"]').trigger('click')
        await settle(wrapper)
        await wrapper.find('input[aria-label="Your feedback (optional)"]').setValue('Great help')
        await buttonNamed('Submit Rating').trigger('click')
        await settle(wrapper, 6)
        expect(socketCalls.submitRating).toHaveBeenCalledWith(4, 'Great help')
        expect(wrapper.find('.cm-rating [role="status"]').text()).toBe('Great help')
    })
})

describe('when sending fails', () => {
    it('keeps the rating card open after a failed submit, and a retry sends it once', async () => {
        await mountPanel()
        await show({ message_type: 'rating' })
        await wrapper.find('button[aria-label="5 out of 5"]').trigger('click')
        await settle(wrapper)
        socketCalls.submitRating.mockRejectedValueOnce(new Error('offline'))
        await buttonNamed('Submit Rating').trigger('click')
        await settle(wrapper, 6)
        expect(wrapper.find('.cm-rating__done').exists()).toBe(false)
        expect(buttonNamed('Submit Rating').attributes('disabled')).toBeUndefined()

        await buttonNamed('Submit Rating').trigger('click')
        await settle(wrapper, 6)
        expect(socketCalls.submitRating).toHaveBeenCalledTimes(2)
        expect(socketCalls.submitRating).toHaveBeenLastCalledWith(5, null)
        expect(wrapper.find('.cm-rating__done').text()).toBe('Thank you for your rating!')
    })

    it('keeps a form and what was typed after a failed submit, and a retry sends it', async () => {
        await mountPanel()
        await show({ message_type: 'form', attributes: { form_data: { title: 'Details', fields: [{ name: 'email', label: 'Email', type: 'email', required: true }] } } })
        const form = wrapper.find('form.form-message')
        await form.find('input[type="email"]').setValue('ada@example.com')
        socketCalls.submitForm.mockRejectedValueOnce(new Error('offline'))
        await form.trigger('submit')
        await settle(wrapper, 6)
        expect(wrapper.find('form.form-message').exists()).toBe(true)
        expect((wrapper.find('form.form-message input[type="email"]').element as HTMLInputElement).value).toBe('ada@example.com')
        expect(wrapper.find('form.form-message button[type="submit"]').attributes('disabled')).toBeUndefined()

        await wrapper.find('form.form-message').trigger('submit')
        await settle(wrapper, 6)
        expect(socketCalls.submitForm).toHaveBeenCalledTimes(2)
        expect(socketCalls.submitForm).toHaveBeenLastCalledWith({ email: 'ada@example.com' })
        expect(wrapper.find('form.form-message').exists()).toBe(false)
    })
})

describe('a form in the chat', () => {
    const FORM = {
        title: 'Before we connect you to a teammate',
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
        ],
    }

    it('refuses an incomplete form with errors tied to the fields, and sends a complete one', async () => {
        await mountPanel()
        await show({ message_type: 'form', attributes: { form_data: FORM } })
        const form = wrapper.find('form.form-message')
        await form.trigger('submit')
        await settle(wrapper)
        expect(socketCalls.submitForm).not.toHaveBeenCalled()
        expect(form.find('[aria-invalid="true"]').exists()).toBe(true)
        expect(form.text()).toContain('Name is required')

        await form.find('input[type="text"]').setValue('Ada')
        await form.find('input[type="email"]').setValue('ada@example.com')
        await form.trigger('submit')
        await settle(wrapper, 6)
        expect(socketCalls.submitForm).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@example.com' })
        // The submitted form leaves the chat.
        expect(wrapper.find('form.form-message').exists()).toBe(false)
    })
})

describe('a free-text question', () => {
    it('sends the answer as the visitor\'s message', async () => {
        await mountPanel()
        await show({ message_type: 'user_input', attributes: { prompt_message: 'Your order number?' } })
        await wrapper.find('.cm-question textarea').setValue('1042')
        await wrapper.find('.cm-question form').trigger('submit')
        await settle(wrapper, 6)
        expect(socketCalls.sendMessage).toHaveBeenCalledWith('1042', expect.anything())
        expect(wrapper.find('.cm-question').text()).toContain('1042')
    })
})

describe('workflow screens', () => {
    const mountWorkflow = async () => {
        await mountPanel({ workflow: true })
        await vi.waitFor(() => expect(socketCalls.onWorkflowState).toHaveBeenCalled())
        return async (data: Record<string, any>) => {
            socketCalls.onWorkflowState.mock.calls[0][0](data)
            await settle(wrapper)
        }
    }

    it('shows the landing page in front of the chat, branding under it, and proceeds', async () => {
        const pushState = await mountWorkflow()
        await pushState({ type: 'landing_page', button_text: 'Start Chat', landing_page_data: { heading: 'Welcome aboard', content: 'We answer in minutes.' } })
        expect(wrapper.find('h2').text()).toBe('Welcome aboard')
        expect(wrapper.find('textarea[aria-label="Message"]').exists()).toBe(false)
        expect(wrapper.find('.cm-footer a').text()).toContain('Powered by')
        await buttonNamed('Start Chat').trigger('click')
        await settle(wrapper)
        expect(socketCalls.proceedWorkflow).toHaveBeenCalledTimes(1)
    })

    it('shows a full-screen form and sends it once valid', async () => {
        const pushState = await mountWorkflow()
        await pushState({
            type: 'form',
            form_data: { form_full_screen: true, title: 'Your details', fields: [{ name: 'email', label: 'Email', type: 'email', required: true }] },
        })
        expect(wrapper.find('h2').text()).toBe('Your details')
        const form = wrapper.find('form.cm-screen--form')
        await form.find('input[type="email"]').setValue('ada@example.com')
        await form.trigger('submit')
        await settle(wrapper, 6)
        expect(socketCalls.submitForm).toHaveBeenCalledWith({ email: 'ada@example.com' })
    })
})

describe('product cards', () => {
    const SHOP = 'acme.myshopify.com'
    const MUG = { id: 'p1', title: 'Blue Mug', price: '12.5', price_formatted: '$12.50', cart_variant_id: 'gid-mug' }

    it('adds to the store\'s cart through the page once the page announced its cart', async () => {
        await mountPanel()
        const post = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
        await postFromParent(wrapper, { type: 'CART_AVAILABLE', shop: SHOP })
        await show({ message_type: 'product', message: 'One pick.', shopify_output: { shop_domain: SHOP, products: [MUG] } })
        const card = wrapper.find('[role="group"][aria-label="Blue Mug"]')
        expect(wrapper.find('.message.agent-message.product-message').exists()).toBe(true)
        await card.findAll('button').find((b: any) => b.text() === 'Add to cart').trigger('click')
        expect(post).toHaveBeenCalledWith(expect.objectContaining({ type: 'ADD_TO_CART', variantId: 'gid-mug' }), expect.anything())
    })
})

describe('files on messages', () => {
    it('opens an image in the preview and closes it with Escape', async () => {
        await mountPanel()
        await show({
            message_type: 'agent', message: 'Here is the label.', agent_name: 'Priya',
            attachments: [{ id: 7, filename: 'label.png', file_url: 'https://cdn.test/label.png', content_type: 'image/png', file_size: 2048 }],
        })
        await wrapper.find('button[aria-label="Preview label.png"]').trigger('click')
        await settle(wrapper)
        const dialog = wrapper.find('[role="dialog"]')
        expect(dialog.exists()).toBe(true)
        expect(dialog.find('img').attributes('src')).toBe('https://cdn.test/label.png')
        dialog.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
        await settle(wrapper)
        expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    })
})
