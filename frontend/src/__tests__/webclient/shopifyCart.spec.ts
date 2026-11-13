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
import { nextTick } from 'vue'
import ProductCartButton from '@/webclient/ProductCartButton.vue'
import {
  CART_ERROR, addToCart, canAddToCart, cartOnPage, cartState, handleCartMessage, resetShopifyCart, viewCart,
} from '@/webclient/shopify-cart'
import { resetHostOrigin } from '@/webclient/host-bridge'

const SHOP = 'demo.myshopify.com'
const VARIANT = '111'

describe('shopify cart in the widget', () => {
  let posted: any[]

  beforeEach(() => {
    resetShopifyCart()
    resetHostOrigin()
    posted = []
    vi.spyOn(window.parent, 'postMessage').mockImplementation((message: any) => { posted.push(message) })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const lastRequest = () => posted[posted.length - 1].requestId
  const onStore = () => handleCartMessage({ type: 'CART_AVAILABLE', shop: SHOP })

  describe('canAddToCart', () => {
    const product = { cart_variant_id: VARIANT }

    it('is off until the loader says the cart is here', () => {
      expect(canAddToCart(product, SHOP)).toBe(false)
    })

    it('is on for this store\'s product', () => {
      onStore()
      expect(canAddToCart(product, SHOP)).toBe(true)
      expect(canAddToCart(product, 'DEMO.myshopify.com')).toBe(true)
    })

    it('stays off on a plan without shopping in the chat', () => {
      window.__INITIAL_DATA__ = { planFeatures: { shop_in_chat: false } } as Window['__INITIAL_DATA__']
      try {
        onStore()
        expect(canAddToCart(product, SHOP)).toBe(false)
        expect(cartOnPage.value).toBe(false)
      } finally {
        delete window.__INITIAL_DATA__
      }
    })

    it('is off on another store', () => {
      onStore()
      expect(canAddToCart(product, 'other.myshopify.com')).toBe(false)
    })

    it.each([[{}], [{ cart_variant_id: null }], [{ cart_variant_id: '' }]])('is off without a variant: %j', (noVariant) => {
      onStore()
      expect(canAddToCart(noVariant, SHOP)).toBe(false)
    })

    it.each([[null], [undefined], ['']])('is off with no shop on the reply: %j', (domain) => {
      onStore()
      expect(canAddToCart(product, domain)).toBe(false)
    })

    it.each([[''], [42], [null]])('is off when the loader names no shop: %j', (shop) => {
      handleCartMessage({ type: 'CART_AVAILABLE', shop })
      expect(canAddToCart(product, SHOP)).toBe(false)
    })
  })

  describe('adding', () => {
    it('asks the loader and waits', () => {
      addToCart(VARIANT)
      expect(posted[0]).toMatchObject({ type: 'ADD_TO_CART', variantId: VARIANT })
      expect(cartState(VARIANT).status).toBe('adding')
    })

    it('sends one request for a double click', () => {
      addToCart(VARIANT)
      addToCart(VARIANT)
      expect(posted).toHaveLength(1)
    })

    it('marks it added', () => {
      addToCart(VARIANT)
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId: lastRequest(), ok: true })
      expect(cartState(VARIANT)).toEqual({ status: 'added', error: null })
    })

    it('shows the store\'s reason', () => {
      addToCart(VARIANT)
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId: lastRequest(), ok: false, error: 'Sold out.' })
      expect(cartState(VARIANT)).toEqual({ status: 'failed', error: 'Sold out.' })
    })

    it.each([[null], [''], [undefined], [7]])('falls back to its own words for reason %j', (error) => {
      addToCart(VARIANT)
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId: lastRequest(), ok: false, error })
      expect(cartState(VARIANT)).toEqual({ status: 'failed', error: CART_ERROR })
    })

    it('fails when no answer comes', () => {
      vi.useFakeTimers()
      addToCart(VARIANT)
      vi.advanceTimersByTime(20000)
      expect(cartState(VARIANT)).toEqual({ status: 'failed', error: CART_ERROR })
    })

    it('shows a success that arrives after giving up', () => {
      vi.useFakeTimers()
      addToCart(VARIANT)
      const requestId = lastRequest()
      vi.advanceTimersByTime(20000)
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId, ok: true })
      expect(cartState(VARIANT)).toEqual({ status: 'added', error: null })
    })

    it('answers a request only once', () => {
      addToCart(VARIANT)
      const requestId = lastRequest()
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId, ok: true })
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId, ok: false, error: 'Sold out.' })
      expect(cartState(VARIANT).status).toBe('added')
    })

    it('keeps a retry in progress when the earlier request fails late', () => {
      vi.useFakeTimers()
      addToCart(VARIANT)
      const first = lastRequest()
      vi.advanceTimersByTime(20000)
      addToCart(VARIANT)
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId: first, ok: false, error: 'Sold out.' })
      expect(cartState(VARIANT)).toEqual({ status: 'adding', error: null })
    })

    it('does not let an earlier timeout fail the retry', () => {
      vi.useFakeTimers()
      addToCart(VARIANT)
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId: lastRequest(), ok: false })
      vi.advanceTimersByTime(10000)
      addToCart(VARIANT)
      vi.advanceTimersByTime(15000)
      expect(cartState(VARIANT)).toEqual({ status: 'adding', error: null })
    })

    it('ignores an answer to nothing it asked', () => {
      addToCart(VARIANT)
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId: 'stranger', ok: true })
      expect(cartState(VARIANT).status).toBe('adding')
    })

    it('can try again after a failure', () => {
      addToCart(VARIANT)
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId: lastRequest(), ok: false })
      addToCart(VARIANT)
      expect(posted).toHaveLength(2)
      expect(cartState(VARIANT)).toEqual({ status: 'adding', error: null })
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId: lastRequest(), ok: true })
      expect(cartState(VARIANT).status).toBe('added')
    })

    it('keeps each product\'s state apart', () => {
      addToCart('1')
      addToCart('2')
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId: posted[0].requestId, ok: true })
      expect(cartState('1').status).toBe('added')
      expect(cartState('2').status).toBe('adding')
    })
  })

  it('asks the loader to open the cart', () => {
    viewCart()
    expect(posted).toEqual([{ type: 'VIEW_CART' }])
  })

  it('leaves other messages to the widget', () => {
    expect(handleCartMessage({ type: 'SCROLL_TO_BOTTOM' })).toBe(false)
  })

  describe('the button', () => {
    const button = () => mount(ProductCartButton, { props: { variantId: VARIANT } })

    it('starts ready', () => {
      const wrapper = button()
      expect(wrapper.get('button').text()).toBe('Add to cart')
      expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('is disabled while adding', async () => {
      const wrapper = button()
      await wrapper.get('button').trigger('click')
      expect(wrapper.get('button').text()).toBe('Adding…')
      expect(wrapper.get('button').attributes('disabled')).toBeDefined()
      expect(posted).toHaveLength(1)
    })

    it('offers the cart once added', async () => {
      const wrapper = button()
      await wrapper.get('button').trigger('click')
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId: lastRequest(), ok: true })
      await nextTick()
      expect(wrapper.get('button').text()).toBe('View cart')
      expect(wrapper.get('[role="status"]').text()).toBe('Added to your cart')

      await wrapper.get('button').trigger('click')
      expect(posted[posted.length - 1]).toEqual({ type: 'VIEW_CART' })
    })

    it('shows why it failed and can be pressed again', async () => {
      const wrapper = button()
      await wrapper.get('button').trigger('click')
      handleCartMessage({ type: 'ADD_TO_CART_DONE', requestId: lastRequest(), ok: false, error: 'Sold out.' })
      await nextTick()
      expect(wrapper.get('[role="alert"]').text()).toBe('Sold out.')
      expect(wrapper.get('button').text()).toBe('Add to cart')

      await wrapper.get('button').trigger('click')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
      expect(posted).toHaveLength(2)
    })
  })
})
