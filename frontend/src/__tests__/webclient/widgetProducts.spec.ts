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

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())

import { mountWidget, postFromParent, resetSocket, settle, socket } from './widgetHarness'
import { CART_ERROR } from '@/webclient/shopify-cart'

/**
 * Product cards from the Shopify tools. Characterization tests: they pin what the
 * widget shows today so the v2 rewrite can be checked against it. A card with the
 * wrong price, a dead "View product" link or an "Add to cart" button on a store
 * that cannot take it costs the merchant a sale.
 */

const SHOP = 'demo-store.myshopify.com'

let wrapper: any

beforeEach(() => resetSocket())
afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})

const mug = {
    id: 101,
    handle: 'blue-mug',
    title: 'Blue Mug',
    variant_title: 'Large',
    price: '12.5',
    currency: 'USD',
    cart_variant_id: 'gid-mug-large',
    image: { src: 'https://cdn.example.com/mug.png' },
}

const tee = {
    id: 202,
    title: 'Plain Tee',
    variant_title: 'Default Title',
    price: '20',
    currency: 'EUR',
    price_formatted: 'Rs. 1,999',
    cart_variant_id: 'gid-tee',
}

/** Show one product message in the conversation. */
const showProducts = async (message: Record<string, any>) => {
    ;({ wrapper } = await mountWidget())
    socket.messages.value = [{ message_type: 'product', created_at: new Date().toISOString(), ...message }]
    await settle(wrapper)
}

const card = (title: string) => wrapper.find(`[role="group"][aria-label="${title}"]`)

const buttonIn = (el: any, name: string) =>
    el.findAll('button').find((b: any) => b.text().trim().startsWith(name))

/** The ADD_TO_CART requests the frame posted to its host. */
const cartRequests = (post: any) =>
    post.mock.calls.map(([m]: any[]) => m).filter((m: any) => m?.type === 'ADD_TO_CART')

/** The storefront loader saying which store can take cart adds. */
const announceCart = (shop: string | null) => postFromParent(wrapper, { type: 'CART_AVAILABLE', shop })

describe('a product card', () => {
    it('shows the title, the variant and the formatted price', async () => {
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [mug] } })

        const text = card('Blue Mug').text()
        expect(text).toContain('Blue Mug')
        expect(text).toContain('Large')
        expect(text).toContain('$12.50')
        expect(card('Blue Mug').find('img').attributes('alt')).toBe('Blue Mug')
    })

    it("hides Shopify's 'Default Title' variant and prefers the server's price_formatted", async () => {
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [tee] } })

        const text = card('Plain Tee').text()
        expect(text).not.toContain('Default Title')
        expect(text).toContain('Rs. 1,999')
        expect(text).not.toContain('€')
    })

    it('renders one card per product under a "Products" heading', async () => {
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [mug, tee] } })

        expect(wrapper.findAll('[role="group"]')).toHaveLength(2)
        expect(wrapper.findAll('h3').map((h: any) => h.text())).toContain('Products')
    })
})

describe('the Add to cart button', () => {
    it('is hidden until the storefront says it can add to this store', async () => {
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [mug] } })

        expect(buttonIn(card('Blue Mug'), 'Add to cart')).toBeUndefined()
    })

    it('shows once the loader reports cart support for the same shop (any case)', async () => {
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [mug] } })
        await announceCart(SHOP.toUpperCase())

        expect(buttonIn(card('Blue Mug'), 'Add to cart')).toBeTruthy()
    })

    it('stays hidden on a different store', async () => {
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [mug] } })
        await announceCart('other-store.myshopify.com')

        expect(buttonIn(card('Blue Mug'), 'Add to cart')).toBeUndefined()
    })

    it('stays hidden for a product without a cart variant', async () => {
        const noVariant = { ...mug, cart_variant_id: null }
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [noVariant] } })
        await announceCart(SHOP)

        expect(buttonIn(card('Blue Mug'), 'Add to cart')).toBeUndefined()
    })

    it('stays hidden when the message carries no shop domain', async () => {
        await showProducts({ message: '', shopify_output: { products: [mug] } })
        await announceCart(SHOP)

        expect(buttonIn(card('Blue Mug'), 'Add to cart')).toBeUndefined()
    })

    it('asks the host page to add the variant when clicked', async () => {
        const post = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [mug] } })
        await announceCart(SHOP)

        await buttonIn(card('Blue Mug'), 'Add to cart').trigger('click')

        // Not framed here, so the host is this window: addressed to its origin, never "*".
        expect(post).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'ADD_TO_CART', variantId: 'gid-mug-large' }),
            window.location.origin,
        )
    })

    it('asks once when clicked twice before the button re-renders', async () => {
        const post = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [mug] } })
        await announceCart(SHOP)

        // Both clicks land in the same tick, before the re-render disables the button.
        const add = buttonIn(card('Blue Mug'), 'Add to cart')
        add.trigger('click')
        add.trigger('click')
        await settle(wrapper)

        expect(cartRequests(post)).toHaveLength(1)
        expect(buttonIn(card('Blue Mug'), 'Adding').attributes('disabled')).toBeDefined()
    })

    it('turns into View cart with a confirmation when the store adds it', async () => {
        const post = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [mug] } })
        await announceCart(SHOP)
        await buttonIn(card('Blue Mug'), 'Add to cart').trigger('click')
        const [{ requestId }] = cartRequests(post)

        await postFromParent(wrapper, { type: 'ADD_TO_CART_DONE', requestId, ok: true })

        expect(card('Blue Mug').text()).toContain('Added to your cart')
        expect(buttonIn(card('Blue Mug'), 'Add to cart')).toBeUndefined()
        await buttonIn(card('Blue Mug'), 'View cart').trigger('click')
        expect(post).toHaveBeenCalledWith({ type: 'VIEW_CART' }, window.location.origin)
    })

    it("shows the store's error and offers Add to cart again when the add fails", async () => {
        const post = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [mug] } })
        await announceCart(SHOP)
        await buttonIn(card('Blue Mug'), 'Add to cart').trigger('click')
        const [{ requestId }] = cartRequests(post)

        await postFromParent(wrapper, { type: 'ADD_TO_CART_DONE', requestId, ok: false, error: 'Sold out' })

        expect(card('Blue Mug').text()).toContain('Sold out')
        expect(buttonIn(card('Blue Mug'), 'Add to cart').attributes('disabled')).toBeUndefined()
        expect(card('Blue Mug').text()).not.toContain('Added to your cart')
    })

    it('falls back to a generic error when the failed add names none', async () => {
        const post = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [mug] } })
        await announceCart(SHOP)
        await buttonIn(card('Blue Mug'), 'Add to cart').trigger('click')
        const [{ requestId }] = cartRequests(post)

        await postFromParent(wrapper, { type: 'ADD_TO_CART_DONE', requestId, ok: false })

        expect(card('Blue Mug').text()).toContain(CART_ERROR)
    })
})

describe('the View product button', () => {
    it('opens the product page by handle in a new tab without an opener', async () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null)
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [mug] } })

        await buttonIn(card('Blue Mug'), 'View product').trigger('click')

        expect(open).toHaveBeenCalledWith(`https://${SHOP}/products/blue-mug`, '_blank', 'noopener')
    })

    it('falls back to the product id when there is no handle', async () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null)
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [tee] } })

        await buttonIn(card('Plain Tee'), 'View product').trigger('click')

        expect(open).toHaveBeenCalledWith(`https://${SHOP}/products/202`, '_blank', 'noopener')
    })

    it('alerts instead of opening when the shop domain is missing', async () => {
        // Pinned current behaviour (odd): a blocking window.alert inside the chat frame.
        const open = vi.spyOn(window, 'open').mockImplementation(() => null)
        const alert = vi.fn()
        vi.stubGlobal('alert', alert)
        await showProducts({ message: '', shopify_output: { products: [mug] } })

        await buttonIn(card('Blue Mug'), 'View product').trigger('click')

        expect(open).not.toHaveBeenCalled()
        expect(alert).toHaveBeenCalledWith('Unable to open product: Shop domain not available. Please contact support.')
    })
})

describe('the text around the products', () => {
    it('replaces bare URLs and drops images but keeps markdown links when products are shown', async () => {
        await showProducts({
            message: 'Try these https://demo-store.example/x ![pic](https://cdn.example.com/a.png) or [the sale](https://demo-store.example/sale)',
            shopify_output: { shop_domain: SHOP, products: [mug] },
        })

        expect(wrapper.text()).toContain('Try these [link removed]')
        expect(wrapper.text()).not.toContain('https://demo-store.example/x')
        const sources = wrapper.findAll('img').map((img: any) => img.attributes('src'))
        expect(sources).not.toContain('https://cdn.example.com/a.png')
        const link = wrapper.findAll('a').find((a: any) => a.text() === 'the sale')
        expect(link.attributes('href')).toBe('https://demo-store.example/sale')
    })

    it('leaves URLs alone when there are no products', async () => {
        await showProducts({
            message: 'See https://demo-store.example/x',
            shopify_output: { shop_domain: SHOP, products: [] },
        })

        expect(wrapper.text()).not.toContain('[link removed]')
        expect(wrapper.text()).toContain('demo-store.example/x')
        // With message text present, the empty-state line is not added.
        expect(wrapper.text()).not.toContain('No products found.')
    })

    it('says "No products found." for an empty result with no text', async () => {
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP, products: [] } })

        expect(wrapper.text()).toContain('No products found.')
        expect(wrapper.find('[role="group"]').exists()).toBe(false)
    })

    it('says "No products to display." when the output has no products list at all', async () => {
        await showProducts({ message: '', shopify_output: { shop_domain: SHOP } })

        expect(wrapper.text()).toContain('No products to display.')
    })
})
