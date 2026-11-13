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
import { type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ProductMessage from '@/webclient/panel/messages/ProductMessage.vue'
import ProductSheet from '@/webclient/panel/ProductSheet.vue'
import CartBar from '@/webclient/panel/CartBar.vue'
import { handleCartMessage, resetShopifyCart, cartSummary } from '@/webclient/shopify-cart'
import { closeProductSheet, openProductSheet, productSheet, settleProductSheet } from '@/webclient/product-sheet'
import { resetHostOrigin } from '@/webclient/host-bridge'
import { fakeController, mountWithController } from './panelFakeController'
import type { WidgetMessage, WidgetProduct } from '@/types/widget'

/** Commerce in the redesigned panel (plan phase 3): carousel, product sheet, cart bar. */

const SHOP = 'shop.test'
let wrapper: VueWrapper<any> | undefined
let posted: any[]

beforeEach(() => {
    resetShopifyCart()
    resetHostOrigin()
    closeProductSheet()
    posted = []
    vi.spyOn(window.parent, 'postMessage').mockImplementation((message: any) => { posted.push(message) })
})
afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
})

const tee: WidgetProduct = {
    id: 'p1', title: 'Tee', price: '20', price_max: '24', handle: 'tee', published: true,
    tracks_inventory: true, total_inventory: 2, has_choices: true,
}
const teeChoices = {
    complete: true,
    options: [{ name: 'Size', values: ['S', 'M'] }],
    variants: [
        { id: '11', available: false, options: { Size: 'S' } },
        { id: '12', available: true, options: { Size: 'M' }, price: '24' },
    ],
}
const mug: WidgetProduct = { id: 'p2', title: 'Mug', price: '9', cart_variant_id: '21', published: true }

const reply = (products: WidgetProduct[]): WidgetMessage =>
    ({ message_type: 'product', message: 'Picks', created_at: '', session_id: '', shopify_output: { products, shop_domain: SHOP } })

const mountReply = (products: WidgetProduct[]) => {
    wrapper = mountWithController(ProductMessage, fakeController(), { message: reply(products), index: 0 })
    return wrapper
}

describe('the product carousel', () => {
    it('is a carousel of groups, with "From", low stock and the right action per product', async () => {
        handleCartMessage({ type: 'CART_AVAILABLE', shop: SHOP })
        mountReply([tee, mug])
        await nextTick()
        expect(wrapper!.get('.cm-carousel').attributes('aria-roledescription')).toBe('carousel')
        const card = wrapper!.get('[role="group"][aria-label="Tee"]')
        expect(card.get('.cm-product__price').text()).toBe('From $20')
        expect(card.get('.cm-product__stock').text()).toBe('Only 2 left')
        expect(card.get('.cm-product__choose').text()).toBe('Choose options')
        expect(wrapper!.get('[aria-label="Mug"]').get('.cm-cart-button').text()).toBe('Add to cart')
    })

    it('offers no choice off the store, only View on store', () => {
        mountReply([tee])
        expect(wrapper!.find('.cm-product__choose').exists()).toBe(false)
        expect(wrapper!.find('a.cm-product__view').exists()).toBe(true)
    })

    it('opens the product sheet for the product', async () => {
        handleCartMessage({ type: 'CART_AVAILABLE', shop: SHOP })
        mountReply([tee])
        await nextTick()
        await wrapper!.get('.cm-product__choose').trigger('click')
        expect(productSheet.value?.product.id).toBe('p1')
        expect(productSheet.value?.shopDomain).toBe(SHOP)
    })
})

describe('the product sheet', () => {
    let ctrl: ReturnType<typeof fakeController>
    const openSheet = async (choices: typeof teeChoices | null = teeChoices) => {
        ctrl = fakeController()
        wrapper = mountWithController(ProductSheet, ctrl)
        openProductSheet(tee, SHOP)
        await nextTick()
        if (choices) settleProductSheet(tee.id, choices)
        await nextTick()
        await nextTick()
    }

    it('asks the shop for the options and says it is loading meanwhile', async () => {
        await openSheet(null)
        expect(ctrl.requestProductOptions).toHaveBeenCalledWith('p1')
        expect(wrapper!.get('[role="dialog"]').attributes('aria-busy')).toBe('true')
        expect(wrapper!.get('.cm-sheet__note').text()).toBe('Loading options…')
    })

    it('is a modal dialog starting on the first size on sale, ready to add', async () => {
        handleCartMessage({ type: 'CART_AVAILABLE', shop: SHOP })
        await openSheet()
        const dialog = wrapper!.get('[role="dialog"]')
        expect(dialog.attributes('aria-modal')).toBe('true')
        expect(dialog.attributes('aria-label')).toBe('Tee')
        const [small, medium] = wrapper!.findAll('.cm-variant-chip')
        expect(small.attributes('aria-label')).toBe('S (sold out)')
        expect(medium.attributes('aria-pressed')).toBe('true')
        expect(wrapper!.get('.cm-sheet__price').text()).toBe('\$24')
        await wrapper!.get('.cm-sheet__add .cm-cart-button').trigger('click')
        expect(posted.find(m => m.type === 'ADD_TO_CART')).toMatchObject({ variantId: '12' })
    })

    it('says a sold-out size is sold out instead of adding it', async () => {
        await openSheet()
        await wrapper!.findAll('.cm-variant-chip')[0].trigger('click')
        expect(wrapper!.find('.cm-sheet__add .cm-cart-button').exists()).toBe(false)
        expect(wrapper!.get('.cm-sheet__note').text()).toBe('Sold out')
    })

    it('sends a product it cannot show whole to its own page', async () => {
        await openSheet({ ...teeChoices, complete: false })
        expect(wrapper!.find('.cm-variant-chip').exists()).toBe(false)
        expect(wrapper!.get('.cm-sheet__note').text()).toBe('Choose the options on the product page.')
        expect(wrapper!.get('a.cm-product__view').attributes('href')).toBe('https://shop.test/products/tee')
    })

    it('drops a late answer for another product', async () => {
        await openSheet(null)
        settleProductSheet('other', teeChoices)
        await nextTick()
        expect(productSheet.value?.choices).toBeNull()
    })

    it('closes on Escape without letting the key reach the page, even with focus lost', async () => {
        await openSheet()
        ;(document.activeElement as HTMLElement | null)?.blur()
        const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
        document.body.dispatchEvent(escape)
        await nextTick()
        expect(escape.defaultPrevented).toBe(true)
        expect(productSheet.value).toBeNull()
    })

    it('keeps Tab inside, and brings a lost focus back in', async () => {
        await openSheet()
        const buttons = wrapper!.findAll('button').filter(b => !b.attributes('disabled'))
        ;(buttons[buttons.length - 1].element as HTMLElement).focus()
        const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
        buttons[buttons.length - 1].element.dispatchEvent(tab)
        expect(tab.defaultPrevented).toBe(true)
        expect(document.activeElement).toBe(buttons[0].element)
        ;(document.activeElement as HTMLElement).blur()
        const lost = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
        document.body.dispatchEvent(lost)
        expect(document.activeElement).toBe(buttons[0].element)
    })
})

describe('the cart bar', () => {
    it('shows the cart once it has something, with View cart and Checkout', async () => {
        handleCartMessage({ type: 'CART_AVAILABLE', shop: SHOP })
        expect(posted).not.toContainEqual({ type: 'GET_CART' })
        const ctrl = fakeController()
        wrapper = mountWithController(CartBar, ctrl)
        // Read as the open panel shows it, and again each time it opens
        expect(posted.filter(m => m.type === 'GET_CART')).toHaveLength(1)
        ctrl.hostVisible.value = false
        await nextTick()
        ctrl.hostVisible.value = true
        await nextTick()
        expect(posted.filter(m => m.type === 'GET_CART')).toHaveLength(2)
        expect(wrapper.find('.cm-cart-bar').exists()).toBe(false)

        handleCartMessage({ type: 'CART_STATE', item_count: 2, total_price: 4300, currency: 'GBP', items: [
            { variant_id: '1', title: 'Tee', quantity: 2, image: 'https://cdn.test/t.png', line_price: 4300 },
            { variant_id: '2', title: 'Bad', quantity: 1, image: 'javascript:alert(1)', line_price: 0 },
        ] })
        await nextTick()
        expect(wrapper.get('.cm-cart-bar').attributes('aria-label')).toBe('Your cart')
        expect(wrapper.get('.cm-cart-bar__summary').text()).toBe('2 items · $43')
        expect(wrapper.findAll('.cm-cart-bar__thumbs img')).toHaveLength(1)
        await wrapper.get('.cm-cart-bar__checkout').trigger('click')
        expect(posted).toContainEqual({ type: 'GO_TO_CHECKOUT' })
        await wrapper.get('.cm-cart-bar__view').trigger('click')
        expect(posted).toContainEqual({ type: 'VIEW_CART' })
    })

    it('goes when the cart was emptied elsewhere', async () => {
        handleCartMessage({ type: 'CART_AVAILABLE', shop: SHOP })
        wrapper = mountWithController(CartBar, fakeController())
        handleCartMessage({ type: 'CART_STATE', item_count: 1, total_price: 100, currency: 'GBP', items: [] })
        await nextTick()
        expect(wrapper.find('.cm-cart-bar').exists()).toBe(true)
        handleCartMessage({ type: 'CART_STATE', item_count: 0, total_price: 0, currency: 'GBP', items: [] })
        await nextTick()
        expect(wrapper.find('.cm-cart-bar').exists()).toBe(false)
    })

    it('ignores a cart from a page that announced no store', () => {
        handleCartMessage({ type: 'CART_STATE', item_count: 2, total_price: 100, currency: 'GBP', items: [] })
        expect(cartSummary.value).toBeNull()
    })
})
