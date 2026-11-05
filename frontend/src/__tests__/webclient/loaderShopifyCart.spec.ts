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
import { createShopifyCart } from '@/webclient/loader/shopifyCart.js'
import {
  bringUp, cleanupPage, flush, fromFrame, handshake, loadLoader, resetPage, spyOnFrame,
} from './loaderHarness'

const SHOP = 'demo.myshopify.com'

function jsonResponse(status: number, body: unknown) {
  return { ok: status < 400, status, json: async () => body }
}

function storefront(overrides: Record<string, unknown> = {}, fetchImpl: any = vi.fn(async () => jsonResponse(200, {}))) {
  const posted: any[] = []
  const win: any = {
    Shopify: { shop: SHOP, routes: { root: '/' }, ...overrides },
    fetch: fetchImpl,
    location: { assign: vi.fn() },
  }
  return { win, posted, cart: createShopifyCart(win, (m: any) => posted.push(m)) }
}

const addRequest = { type: 'ADD_TO_CART', requestId: 'r1', variantId: '111' }

describe('shopify cart in the loader', () => {
  it('announces the shop on a storefront', () => {
    const { cart, posted } = storefront()
    cart.announce()
    expect(posted).toEqual([{ type: 'CART_AVAILABLE', shop: SHOP }])
  })

  it.each([
    ['no Shopify at all', { Shopify: undefined }],
    ['a Shopify object with no shop', { Shopify: {} }],
    ['the checkout', { Shopify: { shop: SHOP, Checkout: {} } }],
  ])('announces nothing on %s', (_name, page) => {
    const posted: any[] = []
    createShopifyCart({ ...page } as any, (m: any) => posted.push(m)).announce()
    expect(posted).toEqual([])
  })

  it('adds one of the variant through the store\'s own cart', async () => {
    const { cart, win, posted } = storefront()
    expect(cart.handleFrameMessage(addRequest)).toBe(true)
    await flush()

    const [url, options] = win.fetch.mock.calls[0]
    expect(url).toBe('/cart/add.js')
    expect(options.method).toBe('POST')
    expect(options.credentials).toBe('same-origin')
    expect(JSON.parse(options.body)).toEqual({ items: [{ id: 111, quantity: 1 }] })
    expect(posted).toEqual([{ type: 'ADD_TO_CART_DONE', requestId: 'r1', ok: true }])
  })

  it('keeps a language prefix', async () => {
    const { cart, win } = storefront({ routes: { root: '/fr/' } })
    cart.handleFrameMessage(addRequest)
    await flush()
    expect(win.fetch.mock.calls[0][0]).toBe('/fr/cart/add.js')
  })

  it('falls back to the site root when the theme has no routes', async () => {
    const { cart, win } = storefront({ routes: undefined })
    cart.handleFrameMessage(addRequest)
    await flush()
    expect(win.fetch.mock.calls[0][0]).toBe('/cart/add.js')
  })

  it('passes on Shopify\'s shopper-facing reason', async () => {
    const soldOut = vi.fn(async () => jsonResponse(422, {
      status: 422, message: 'Cart Error', description: 'The product is already sold out.',
    }))
    const { cart, posted } = storefront({}, soldOut)
    cart.handleFrameMessage(addRequest)
    await flush()
    expect(posted).toEqual([{
      type: 'ADD_TO_CART_DONE', requestId: 'r1', ok: false, error: 'The product is already sold out.',
    }])
  })

  it('caps a long reason', async () => {
    const wordy = vi.fn(async () => jsonResponse(422, { description: 'x'.repeat(500) }))
    const { cart, posted } = storefront({}, wordy)
    cart.handleFrameMessage(addRequest)
    await flush()
    expect(posted[0].error).toHaveLength(200)
  })

  it.each([
    ['a body that is not JSON', async () => ({ ok: false, status: 500, json: async () => { throw new Error('html') } })],
    ['a body with no reason', async () => jsonResponse(404, { status: 404 })],
    ['a reason that is not text', async () => jsonResponse(422, { description: { nested: true } })],
    ['a network failure', async () => { throw new TypeError('Failed to fetch') }],
  ])('answers with no reason on %s', async (_name, impl) => {
    const { cart, posted } = storefront({}, vi.fn(impl))
    cart.handleFrameMessage(addRequest)
    await flush()
    expect(posted).toEqual([{ type: 'ADD_TO_CART_DONE', requestId: 'r1', ok: false, error: null }])
  })

  it('gives up on a store that never answers', async () => {
    vi.useFakeTimers()
    const hung = vi.fn((_url: string, options: any) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('aborted')))
    }))
    const { cart, posted } = storefront({}, hung)
    cart.handleFrameMessage(addRequest)
    await vi.advanceTimersByTimeAsync(15000)
    vi.useRealTimers()
    expect(posted).toEqual([{ type: 'ADD_TO_CART_DONE', requestId: 'r1', ok: false, error: null }])
  })

  it.each(['abc', '12 OR 1', '-1', '1.5', '', '1'.repeat(16)])('refuses the variant id %j', async (variantId) => {
    const { cart, win, posted } = storefront()
    cart.handleFrameMessage({ ...addRequest, variantId })
    await flush()
    expect(win.fetch).not.toHaveBeenCalled()
    expect(posted[0].ok).toBe(false)
  })

  it('does nothing with a request it could not answer', async () => {
    const { cart, win, posted } = storefront()
    cart.handleFrameMessage({ type: 'ADD_TO_CART', variantId: '111' })
    await flush()
    expect(win.fetch).not.toHaveBeenCalled()
    expect(posted).toEqual([])
  })

  it('answers no off a storefront', async () => {
    const posted: any[] = []
    const fetchImpl = vi.fn()
    createShopifyCart({ fetch: fetchImpl } as any, (m: any) => posted.push(m)).handleFrameMessage(addRequest)
    await flush()
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(posted[0].ok).toBe(false)
  })

  it('opens the cart page, with the language prefix', () => {
    const { cart, win } = storefront({ routes: { root: '/fr/' } })
    expect(cart.handleFrameMessage({ type: 'VIEW_CART' })).toBe(true)
    expect(win.location.assign).toHaveBeenCalledWith('/fr/cart')
  })

  it('leaves other messages alone', () => {
    expect(storefront().cart.handleFrameMessage({ type: 'WIDGET_OPEN_REQUEST' })).toBe(false)
  })
})

describe('shopify cart through the loader', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    resetPage()
    ;(window as any).Shopify = { shop: SHOP, routes: { root: '/' } }
    fetchMock = vi.fn(async () => jsonResponse(200, {}))
    await loadLoader()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    delete (window as any).Shopify
    cleanupPage()
  })

  const cartCalls = () => fetchMock.mock.calls.filter(([url]) => String(url).includes('cart/add.js'))

  // What the loader says to the widget as it mounts
  function saidOnMount() {
    handshake()
    const post = spyOnFrame()
    fromFrame({ type: 'WIDGET_READY' })
    return post.mock.calls.map(([message]) => message as any)
  }

  it('tells the widget about the cart once it has mounted', () => {
    expect(saidOnMount()).toContainEqual({ type: 'CART_AVAILABLE', shop: SHOP })
  })

  it('says nothing about the cart before the widget has mounted', () => {
    const post = spyOnFrame()
    handshake()
    expect(post.mock.calls.some(([m]) => (m as any).type === 'CART_AVAILABLE')).toBe(false)
  })

  it('adds to the cart for the widget frame and answers it', async () => {
    bringUp()
    const post = spyOnFrame()
    fromFrame(addRequest)
    await flush()
    expect(cartCalls()).toHaveLength(1)
    expect(post.mock.calls.map(([m]) => m)).toContainEqual({ type: 'ADD_TO_CART_DONE', requestId: 'r1', ok: true })
  })

  it('ignores the same message from another origin', async () => {
    bringUp()
    fromFrame(addRequest, { origin: 'https://evil.example' })
    await flush()
    expect(cartCalls()).toHaveLength(0)
  })

  it('ignores the same message from another window', async () => {
    bringUp()
    fromFrame(addRequest, { source: window as any })
    await flush()
    expect(cartCalls()).toHaveLength(0)
  })

  it('is silent on a site that is not a store', () => {
    delete (window as any).Shopify
    const said = saidOnMount()
    expect(said.some((message) => message.type === 'HOST_ACTIONS')).toBe(true)
    expect(said.some((message) => message.type === 'CART_AVAILABLE')).toBe(false)
  })
})
