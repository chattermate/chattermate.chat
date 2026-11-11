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
const CART_TIMEOUT_MS = 8000
// The cart summary the widget's cart bar shows: a few lines, never the whole cart
const MAX_CART_ITEMS = 20
const MAX_TITLE_LENGTH = 120
const MAX_ERROR_LENGTH = 200
// Short enough to stay exact as a JavaScript number
const VARIANT_ID = /^[0-9]{1,15}$/

// The theme's own cart icon and drawer, redrawn by Shopify after an add (the Section
// Rendering API), as the theme's own add-to-cart does. Without this the header still
// shows the old count. Named as Dawn and the themes built on it name them; a theme
// without these parts keeps its count until the next page load.
// `shows` is an element Dawn hides while it thinks the cart is empty: shown again
// only once its part holds the fresh cart.
const THEME_CART_PARTS = [
  { section: 'cart-icon-bubble', target: '#cart-icon-bubble', from: '.shopify-section' },
  { section: 'cart-drawer', target: '#CartDrawer', from: '#CartDrawer', shows: 'cart-drawer' },
]
// Dispatched on the page after every add, so a theme we don't know can refresh itself
export const CART_UPDATED_EVENT = 'chattermate:cart-updated'

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

  // The theme or another app changed the cart: the bar follows, while a widget is up.
  let listening = false
  function onCartUpdated() { void sendCart() }

  // Tell the frame the cart is here. Called whenever the widget mounts.
  function announce() {
    const shopify = storefront()
    if (!shopify) return
    postToFrame({ type: 'CART_AVAILABLE', shop: shopify.shop })
    if (!listening && win.document) {
      win.document.addEventListener(CART_UPDATED_EVENT, onCartUpdated)
      listening = true
    }
  }

  // The widget is gone (ChatterMate.destroy): stop following the cart.
  function destroy() {
    if (listening && win.document) win.document.removeEventListener(CART_UPDATED_EVENT, onCartUpdated)
    listening = false
  }

  // The parts of the theme's cart this page has
  function cartPartsOnPage() {
    const doc = win.document
    return doc ? THEME_CART_PARTS.filter(function (part) { return doc.querySelector(part.target) }) : []
  }

  // Puts one part's fresh markup on the page. Returns true if it did.
  function redrawPart(part, sections) {
    const html = sections && sections[part.section]
    if (typeof html !== 'string') return false
    const fresh = new win.DOMParser().parseFromString(html, 'text/html').querySelector(part.from)
    if (!fresh) return false
    win.document.querySelector(part.target).innerHTML = fresh.innerHTML
    if (part.shows) {
      const hidden = win.document.querySelector(part.shows)
      if (hidden) hidden.classList.remove('is-empty')
    }
    return true
  }

  // Never fails the add: the item is in the cart whatever happens here
  function redrawCart(sections) {
    try {
      cartPartsOnPage().forEach(function (part) { redrawPart(part, sections) })
    } catch (e) {
      /* a theme we can't redraw keeps its old count */
    }
    try {
      win.document.dispatchEvent(new win.CustomEvent(CART_UPDATED_EVENT))
    } catch (e) {
      /* no document to tell */
    }
  }

  async function post(shopify, variantId) {
    const controller = new AbortController()
    const timer = setTimeout(function () { controller.abort() }, ADD_TIMEOUT_MS)
    const parts = cartPartsOnPage().map(function (part) { return part.section })
    const body = { items: [{ id: Number(variantId), quantity: 1 }] }
    if (parts.length) body.sections = parts.join(',')
    try {
      const response = await win.fetch(urlFor(shopify, 'cart/add.js'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      if (!response.ok) return { ok: false, error: await errorFrom(response) }
      redrawCart(await response.json().then(function (added) { return added && added.sections }, function () { return null }))
      return { ok: true }
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

  // Each read of the cart is numbered: an older answer arriving last is dropped.
  let cartReads = 0

  // The cart as the widget's cart bar shows it, from the storefront's own cart.js
  function summaryFrom(cart) {
    const items = Array.isArray(cart && cart.items) ? cart.items : []
    return {
      item_count: Number(cart && cart.item_count) || 0,
      total_price: Number(cart && cart.total_price) || 0,
      currency: typeof (cart && cart.currency) === 'string' ? cart.currency : '',
      items: items.slice(0, MAX_CART_ITEMS).map(function (item) {
        return {
          variant_id: String(item.variant_id || ''),
          title: String(item.product_title || item.title || '').slice(0, MAX_TITLE_LENGTH),
          quantity: Number(item.quantity) || 0,
          image: typeof item.image === 'string' ? item.image : null,
          line_price: Number(item.final_line_price != null ? item.final_line_price : item.line_price) || 0,
        }
      }),
    }
  }

  // Tell the frame what is in the cart (CART_STATE); nothing when it can't be read
  async function sendCart() {
    const shopify = storefront()
    if (!shopify) return
    const read = ++cartReads
    const controller = new AbortController()
    const timer = setTimeout(function () { controller.abort() }, CART_TIMEOUT_MS)
    try {
      const response = await win.fetch(urlFor(shopify, 'cart.js'), {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!response.ok) return
      const cart = await response.json()
      if (read === cartReads) postToFrame(Object.assign({ type: 'CART_STATE' }, summaryFrom(cart)))
    } catch (e) {
      /* the bar keeps what it last showed */
    } finally {
      clearTimeout(timer)
    }
  }

  function goToCheckout() {
    const shopify = storefront()
    if (shopify) win.location.assign(urlFor(shopify, 'checkout'))
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
    if (data.type === 'GET_CART') {
      void sendCart()
      return true
    }
    if (data.type === 'GO_TO_CHECKOUT') {
      goToCheckout()
      return true
    }
    return false
  }

  return { announce, handleFrameMessage, sendCart, destroy }
}
