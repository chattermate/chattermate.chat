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

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  isStorefrontToken, signedInCustomer, syncStorefrontIdentity,
} from '@/webclient/loader/shopifyIdentity.js'
import { WIDGET_ID, cleanupPage, flush, loadLoader, resetPage } from './loaderHarness'

/** A storefront's signed-in customer chats as themselves (the App Proxy route). */

const token = (claims: Record<string, unknown>) =>
  'h.' + btoa(JSON.stringify(claims)).replace(/=+$/, '') + '.s'
const STORE_TOKEN = token({ sub: 'c-1', custom_data: { source: 'shopify_storefront' } })
const PAGE_TOKEN = token({ sub: 'c-2', customer_email: 'x@acme.com' })

function store({ customer = '7', answer = { token: 'new-token' } as any, ok = true, extra = {} } = {}) {
  const fetch = vi.fn(async () => ({ ok, json: async () => answer }))
  const win: any = {
    Shopify: { shop: 'demo.myshopify.com', routes: { root: '/fr/' } },
    __st: customer ? { cid: Number(customer) } : {},
    fetch,
    ...extra,
  }
  const identify = vi.fn()
  const signOut = vi.fn()
  const sync = (current: string | null) =>
    syncStorefrontIdentity(win, { widgetId: 'w 1', current, identify, signOut })
  return { win, fetch, identify, signOut, sync }
}

describe('the storefront\'s signed-in customer', () => {
  it('asks the store\'s App Proxy and identifies the visitor with its token', async () => {
    const s = store()
    await s.sync(null)
    expect(s.fetch).toHaveBeenCalledWith('/fr/apps/chattermate/identity?widget_id=w%201',
      expect.objectContaining({ credentials: 'same-origin' }))
    expect(s.identify).toHaveBeenCalledWith('new-token')
  })

  it('reads the customer from ShopifyAnalytics when __st has none', () => {
    expect(signedInCustomer({ ShopifyAnalytics: { meta: { page: { customerId: 42 } } } })).toBe('42')
    expect(signedInCustomer({ __st: { cid: 'abc' } })).toBeNull()
    expect(signedInCustomer({})).toBeNull()
  })

  it('refreshes its own token on each page', async () => {
    const s = store()
    await s.sync(STORE_TOKEN)
    expect(s.identify).toHaveBeenCalledWith('new-token')
  })

  it('never replaces a token the page itself gave', async () => {
    const s = store()
    await s.sync(PAGE_TOKEN)
    expect(s.fetch).not.toHaveBeenCalled()
    expect(s.signOut).not.toHaveBeenCalled()
  })

  it('signs the chat out when the customer signed out of the store', async () => {
    const s = store({ customer: '' })
    await s.sync(STORE_TOKEN)
    expect(s.signOut).toHaveBeenCalled()
    expect(s.fetch).not.toHaveBeenCalled()
  })

  it('leaves an anonymous visitor alone', async () => {
    const s = store({ customer: '' })
    await s.sync(null)
    expect(s.fetch).not.toHaveBeenCalled()
    expect(s.signOut).not.toHaveBeenCalled()
  })

  it.each([
    ['no token in the answer', { answer: { token: null } }],
    ['a store without the App Proxy', { ok: false, answer: null }],
  ])('keeps the visitor as they are with %s', async (_, options) => {
    const s = store(options as any)
    await s.sync(null)
    expect(s.identify).not.toHaveBeenCalled()
  })

  it('survives a failed request', async () => {
    const s = store()
    s.fetch.mockRejectedValueOnce(new Error('offline'))
    await expect(s.sync(null)).resolves.toBeUndefined()
    expect(s.identify).not.toHaveBeenCalled()
  })

  it('does nothing off a storefront, or at the checkout', async () => {
    const off = store({ extra: { Shopify: undefined } })
    await off.sync(null)
    const checkout = store({ extra: { Shopify: { shop: 'demo.myshopify.com', Checkout: {} } } })
    await checkout.sync(null)
    expect(off.fetch).not.toHaveBeenCalled()
    expect(checkout.fetch).not.toHaveBeenCalled()
  })

  it('knows its own tokens by their source', () => {
    expect(isStorefrontToken(STORE_TOKEN)).toBe(true)
    expect(isStorefrontToken(PAGE_TOKEN)).toBe(false)
    expect(isStorefrontToken('garbage')).toBe(false)
  })
})

describe('through the loader', () => {
  afterEach(() => {
    delete (window as any).Shopify
    delete (window as any).__st
    cleanupPage()
  })

  it('asks the store for the signed-in customer once the widget is built', async () => {
    resetPage()
    ;(window as any).Shopify = { shop: 'demo.myshopify.com', routes: { root: '/' } }
    ;(window as any).__st = { cid: 7 }
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ token: null }) }))
    vi.stubGlobal('fetch', fetchMock)
    await loadLoader()
    await flush()
    const asked = fetchMock.mock.calls.map(([url]) => String(url))
    expect(asked).toContain('/apps/chattermate/identity?widget_id=' + WIDGET_ID)
  })

  it('asks nothing on a site that is not a Shopify store', async () => {
    resetPage()
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    vi.stubGlobal('fetch', fetchMock)
    await loadLoader()
    await flush()
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('apps/chattermate'))).toBe(false)
  })
})
