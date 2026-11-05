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

// The Shopify storefront's side of "Add to cart", bundled into the embed loader.
//
// The widget frame is on our origin and can't touch the store's cart, but this
// loader runs on the storefront itself, where the Ajax Cart API is same-origin and
// needs no app scope. The frame asks with ADD_TO_CART; the answer goes back as
// ADD_TO_CART_DONE. Anywhere else there is no window.Shopify, nothing is announced,
// and the widget shows no button.

const ADD_TIMEOUT_MS = 15000
const MAX_ERROR_LENGTH = 200
// Short enough to stay exact as a JavaScript number
const VARIANT_ID = /^[0-9]{1,15}$/

// Shopify's cart errors are written for shoppers ("… is already sold out.")
async function errorFrom(response) {
  try {
    const body = await response.json()
    return typeof body.description === 'string' ? body.description.slice(0, MAX_ERROR_LENGTH) : null
  } catch (e) {
    return null
  }
}

export function createShopifyCart(win, postToFrame) {
  // The storefront, or null on any other page. The checkout has its own cart.
  function storefront() {
    const shopify = win.Shopify
    return shopify && typeof shopify.shop === 'string' && shopify.shop && !shopify.Checkout ? shopify : null
  }

  // Keeps a store's language prefix, as in /fr/cart/add.js
  function urlFor(shopify, path) {
    const root = shopify.routes && typeof shopify.routes.root === 'string' ? shopify.routes.root : '/'
    return root + path
  }

  // Tell the frame the cart is here. Called whenever the widget mounts.
  function announce() {
    const shopify = storefront()
    if (shopify) postToFrame({ type: 'CART_AVAILABLE', shop: shopify.shop })
  }

  async function post(shopify, variantId) {
    const controller = new AbortController()
    const timer = setTimeout(function () { controller.abort() }, ADD_TIMEOUT_MS)
    try {
      const response = await win.fetch(urlFor(shopify, 'cart/add.js'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: [{ id: Number(variantId), quantity: 1 }] }),
        signal: controller.signal,
      })
      return response.ok ? { ok: true } : { ok: false, error: await errorFrom(response) }
    } catch (e) {
      return { ok: false, error: null }
    } finally {
      clearTimeout(timer)
    }
  }

  async function add(message) {
    const requestId = String(message.requestId || '')
    if (!requestId) return
    const variantId = String(message.variantId || '')
    const shopify = storefront()
    const answer = shopify && VARIANT_ID.test(variantId)
      ? await post(shopify, variantId)
      : { ok: false, error: null }
    postToFrame(Object.assign({ type: 'ADD_TO_CART_DONE', requestId: requestId }, answer))
  }

  function viewCart() {
    const shopify = storefront()
    if (shopify) win.location.assign(urlFor(shopify, 'cart'))
  }

  // Returns true if the message was for the cart.
  function handleFrameMessage(data) {
    if (data.type === 'ADD_TO_CART') {
      void add(data)
      return true
    }
    if (data.type === 'VIEW_CART') {
      viewCart()
      return true
    }
    return false
  }

  return { announce, handleFrameMessage }
}
