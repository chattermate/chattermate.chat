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

// A customer signed in to a Shopify storefront chats as themselves.
//
// The store's page asks its own /apps/chattermate/identity; Shopify forwards that
// to our backend through the app's App Proxy, signed and naming the signed-in
// customer (app/services/shopify_app_proxy.py), and the answer is a conversation
// token for them. Only asked when the page says a customer is signed in. A token
// this module set earlier is dropped when no one is signed in, or someone else
// is - before asking, so another customer never chats as the previous one while
// the answer is on its way, or if it never comes. A token the page itself gave
// (ChatterMate.identify) is never replaced.

// The App Proxy's path on the store (shopify.app.toml: prefix "apps", subpath "chattermate")
export const IDENTITY_PATH = 'apps/chattermate/identity'
// Set in the token's custom_data by the backend: a token this module may replace or drop
export const STOREFRONT_SOURCE = 'shopify_storefront'
const IDENTITY_TIMEOUT_MS = 8000
const CUSTOMER_ID = /^[0-9]{1,20}$/

function claimsOf(token) {
  const payload = typeof token === 'string' ? token.split('.')[1] : null
  if (!payload) return null
  try {
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch (e) {
    return null
  }
}

// The storefront, or null on any other page (the checkout has its own sign-in)
function storefront(win) {
  const shopify = win.Shopify
  return shopify && typeof shopify.shop === 'string' && shopify.shop && !shopify.Checkout ? shopify : null
}

// The signed-in customer's id as Shopify's own page script states it, or null
export function signedInCustomer(win) {
  const fromAnalytics = win.ShopifyAnalytics && win.ShopifyAnalytics.meta && win.ShopifyAnalytics.meta.page
    ? win.ShopifyAnalytics.meta.page.customerId : null
  const value = String((win.__st && win.__st.cid) || fromAnalytics || '')
  return CUSTOMER_ID.test(value) ? value : null
}

function storefrontData(token) {
  const claims = claimsOf(token)
  const data = claims && claims.custom_data
  return data && data.source === STOREFRONT_SOURCE ? data : null
}

/** True when `token` came from this module (the store's sign-in), not the page. */
export function isStorefrontToken(token) {
  return !!storefrontData(token)
}

/**
 * Bring the chat's identity in line with the store's sign-in, once per page.
 * `current`: the token the widget runs on now. `identify(token)` / `signOut()`
 * are the loader's own. Resolves when done; never throws.
 */
export async function syncStorefrontIdentity(win, { widgetId, current, identify, signOut }) {
  const shopify = storefront(win)
  if (!shopify || !widgetId) return
  const fromStore = !current || isStorefrontToken(current)
  // A token the page gave is the page's business
  if (!fromStore) return
  const customer = signedInCustomer(win)
  const ours = current ? storefrontData(current) : null
  if (!customer) {
    if (current) signOut()
    return
  }
  // Someone else signed in on this browser: the previous customer's chat goes first
  if (ours && String(ours.shopify_customer_id || '') !== customer) signOut()
  const root = shopify.routes && typeof shopify.routes.root === 'string' ? shopify.routes.root : '/'
  const url = root + IDENTITY_PATH + '?widget_id=' + encodeURIComponent(widgetId)
  const controller = typeof AbortController === 'function' ? new AbortController() : null
  const timer = controller ? setTimeout(function () { controller.abort() }, IDENTITY_TIMEOUT_MS) : null
  try {
    const response = await win.fetch(url, { credentials: 'same-origin', signal: controller ? controller.signal : undefined })
    const body = response.ok ? await response.json() : null
    if (body && typeof body.token === 'string' && body.token) identify(body.token)
  } catch (e) {
    // No App Proxy on this store, or it didn't answer: the visitor chats as they are
  } finally {
    if (timer) clearTimeout(timer)
  }
}
