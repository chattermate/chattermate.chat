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

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive, ref } from 'vue'
import type { VueWrapper } from '@vue/test-utils'
import RatingCard from '@/webclient/panel/messages/RatingCard.vue'
import UserInputCard from '@/webclient/panel/messages/UserInputCard.vue'
import ProductMessage from '@/webclient/panel/messages/ProductMessage.vue'
import { fakeController, mountWithController, type FakeController } from './panelFakeController'
import type { WidgetMessage } from '@/types/widget'

/** The conversation's cards with a stand-in controller: rating, question, products. */

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
    document.body.innerHTML = ''
})

/** Views write fields of a message (the controller's messages are reactive). */
const msg = (fields: Partial<WidgetMessage>): WidgetMessage =>
    reactive({ message: '', message_type: 'bot', created_at: '', session_id: 's-1', ...fields }) as WidgetMessage

const mountCard = (component: any, message: WidgetMessage, overrides: Partial<FakeController> = {}) => {
    ctrl = fakeController(overrides)
    wrapper = mountWithController(component, ctrl, { message, index: 0 })
    return wrapper
}

const option = (n: number) => wrapper!.get(`button[aria-label="${n} out of 5"]`)
const buttonNamed = (name: string) => wrapper!.findAll('button').find(b => b.text().trim() === name)

describe('the rating card', () => {
    it('asks "Sorted. How did we do?" with five numbered buttons named "N out of 5"', () => {
        mountCard(RatingCard, msg({ message_type: 'rating' }), { humanAgent: ref({ human_agent_name: 'Priya' }) })
        expect(wrapper!.classes()).toEqual(expect.arrayContaining(['message', 'rating-message']))
        expect(wrapper!.text()).toContain('Sorted. How did we do?')
        expect(wrapper!.text()).toContain('Rate the chat session that you had with Priya')
        const options = wrapper!.findAll('button.star-button')
        expect(options.map(o => o.text())).toEqual(['1', '2', '3', '4', '5'])
        expect(options.map(o => o.attributes('aria-label'))).toEqual(
            ['1 out of 5', '2 out of 5', '3 out of 5', '4 out of 5', '5 out of 5'])
        expect(wrapper!.text()).toContain('Not good')
        expect(wrapper!.text()).toContain('Excellent')
    })

    it('picks a rating through the controller and shows which is chosen, not by colour alone', async () => {
        const message = msg({ message_type: 'rating' })
        mountCard(RatingCard, message)
        await option(4).trigger('click')
        expect(ctrl.handleStarClick).toHaveBeenCalledWith(4)
        message.selectedRating = 4
        message.showFeedback = true
        await nextTick()
        expect(option(4).attributes('aria-pressed')).toBe('true')
        expect(option(3).attributes('aria-pressed')).toBe('false')
    })

    it('offers optional feedback and submits the rating with it as "Submit Rating"', async () => {
        const message = msg({ message_type: 'rating', selectedRating: 5, showFeedback: true })
        mountCard(RatingCard, message)
        const feedback = wrapper!.get('input[aria-label="Your feedback (optional)"]')
        expect(feedback.attributes('maxlength')).toBe('500')
        await feedback.setValue('Quick and kind')
        expect(wrapper!.text()).toContain('14/500')
        await buttonNamed('Submit Rating')!.trigger('click')
        expect(ctrl.handleSubmitRating).toHaveBeenCalledWith('s-1', 5, 'Quick and kind')
    })

    it('says it is submitting and locks the buttons meanwhile', () => {
        mountCard(RatingCard, msg({ message_type: 'rating', selectedRating: 2, showFeedback: true }), { isSubmittingRating: ref(true) })
        expect(buttonNamed('Submitting...')!.attributes('disabled')).toBeDefined()
        expect(option(1).attributes('disabled')).toBeDefined()
    })

    it('thanks the visitor once submitted, keeping their rating shown', () => {
        mountCard(RatingCard, msg({ message_type: 'rating', isSubmitted: true, finalRating: 3, finalFeedback: null }))
        expect(wrapper!.get('[role="status"]').text()).toBe('Thank you for your rating!')
        expect(option(3).attributes('aria-pressed')).toBe('true')
        expect(option(3).attributes('disabled')).toBeDefined()
        expect(buttonNamed('Submit Rating')).toBeUndefined()
    })

    it('shows the submitted feedback instead of the thanks when there is some', () => {
        mountCard(RatingCard, msg({ message_type: 'rating', isSubmitted: true, finalRating: 5, finalFeedback: 'Great' }))
        expect(wrapper!.get('[role="status"]').text()).toBe('Great')
    })
})

describe('the free-text question', () => {
    it('labels the box with the question and submits the answer through the controller', async () => {
        const message = msg({ message_type: 'user_input', attributes: { prompt_message: 'Your order number?' } })
        mountCard(UserInputCard, message)
        const box = wrapper!.get('textarea')
        const promptId = box.attributes('aria-labelledby')
        expect(wrapper!.get(`#${promptId}`).text()).toBe('Your order number?')
        expect(buttonNamed('Submit')!.attributes('disabled')).toBeDefined()
        await box.setValue('1042')
        await wrapper!.get('form').trigger('submit')
        expect(ctrl.handleUserInputSubmit).toHaveBeenCalledWith(message)
    })

    it('submits with Ctrl+Enter and Cmd+Enter; a plain Enter is a new line', async () => {
        const message = msg({ message_type: 'user_input', userInputValue: '1042' })
        mountCard(UserInputCard, message)
        const box = wrapper!.get('textarea')
        expect(box.attributes('aria-label')).toBe('Your input')
        await box.trigger('keydown', { key: 'Enter' })
        expect(ctrl.handleUserInputSubmit).not.toHaveBeenCalled()
        await box.trigger('keydown', { key: 'Enter', ctrlKey: true })
        await box.trigger('keydown', { key: 'Enter', metaKey: true })
        expect(ctrl.handleUserInputSubmit).toHaveBeenCalledTimes(2)
    })

    it('shows the answer and the confirmation once submitted', () => {
        mountCard(UserInputCard, msg({
            message_type: 'user_input', isSubmitted: true, submittedValue: '1042',
            attributes: { confirmation_message: 'Thanks, looking it up.' },
        }))
        expect(wrapper!.find('textarea').exists()).toBe(false)
        expect(wrapper!.text()).toContain('1042')
        expect(wrapper!.text()).toContain('Thanks, looking it up.')
    })
})

describe('product cards', () => {
    const products = [
        { id: 'p1', title: 'Guji 250g', price: '14', price_formatted: '£14.00', handle: 'guji', image: { src: 'https://cdn.test/guji.jpg' } },
        { id: 'p2', title: 'Mug', price: '9', variant_title: 'Large', cart_variant_id: 'gid-mug' },
    ]

    it('draws each product as a group named by it, keeping the reply hooks', () => {
        mountCard(ProductMessage, msg({ message_type: 'product', message: 'Two picks: https://shop.test/a', shopify_output: { products, shop_domain: 'shop.test' } }))
        expect(wrapper!.classes()).toEqual(expect.arrayContaining(['message', 'agent-message', 'product-message']))
        expect(wrapper!.get('.message-bubble').text()).not.toContain('https://shop.test/a')
        const guji = wrapper!.get('[role="group"][aria-label="Guji 250g"]')
        expect(guji.text()).toContain('£14.00')
        expect(guji.get('img').attributes('loading')).toBe('lazy')
        const mug = wrapper!.get('[role="group"][aria-label="Mug"]')
        expect(mug.text()).toContain('Large')
        expect(mug.text()).toContain('$9')
    })

    it('links each product to its store page, opening in a new tab', () => {
        mountCard(ProductMessage, msg({ message_type: 'product', shopify_output: { products, shop_domain: 'shop.test' } }))
        const link = wrapper!.get('[aria-label="Guji 250g"]').get('a.cm-product__view')
        expect(link.attributes('href')).toBe('https://shop.test/products/guji')
        expect(link.attributes('target')).toBe('_blank')
        expect(link.attributes('rel')).toContain('noopener')
        expect(link.text()).toContain('View product')
        expect(link.text()).toContain('(opens in a new tab)')
        // No handle: the product's id stands in.
        expect(wrapper!.get('[aria-label="Mug"] a.cm-product__view').attributes('href')).toBe('https://shop.test/products/p2')
    })

    it('leaves the link out, and never raises an alert, when the store is unknown', async () => {
        const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
        mountCard(ProductMessage, msg({ message_type: 'product', shopify_output: { products } }))
        expect(wrapper!.find('a.cm-product__view').exists()).toBe(false)
        expect(wrapper!.findAll('button')).toHaveLength(0)
        expect(alert).not.toHaveBeenCalled()
    })

    it("hides Shopify's 'Default Title' variant", () => {
        mountCard(ProductMessage, msg({ message_type: 'product', shopify_output: {
            products: [{ id: 'p3', title: 'Plain Tee', price: '20', variant_title: 'Default Title' }], shop_domain: 'shop.test',
        } }))
        expect(wrapper!.text()).not.toContain('Default Title')
        expect(wrapper!.find('.cm-product__variant').exists()).toBe(false)
    })

    it('offers Add to cart only where the product can go straight in the cart', () => {
        mountCard(ProductMessage, msg({ message_type: 'product', shopify_output: { products, shop_domain: 'shop.test' } }))
        // No cart on this page (the loader did not announce one): no button at all.
        expect(wrapper!.find('.cm-cart-button').exists()).toBe(false)
    })

    it('says when nothing was found, only without words of its own', () => {
        mountCard(ProductMessage, msg({ message_type: 'product', message: '', shopify_output: { products: [] } }))
        expect(wrapper!.text()).toContain('No products found.')
        wrapper!.unmount()
        mountCard(ProductMessage, msg({ message_type: 'product', message: 'Nothing matched.', shopify_output: { products: [] } }))
        expect(wrapper!.text()).not.toContain('No products found.')
    })
})

describe('touch targets', () => {
    it('brings every control in the panel to 44px on touch screens and phones', () => {
        const css = readFileSync(resolve(__dirname, '../../webclient/widget-panel.css'), 'utf8')
        const block = css.match(/@media \(pointer: coarse\), \(max-width: 480px\) \{([\s\S]*?)\n\}/)?.[1] ?? ''
        expect(block).toContain('min-height: 44px')
        for (const control of ['.cm-icon-button', '.cm-send', '.cm-product__view', '.cm-attachments__link', '.cm-rating__option', '.cm-suggestion']) {
            expect(block).toContain(control)
        }
    })
})
