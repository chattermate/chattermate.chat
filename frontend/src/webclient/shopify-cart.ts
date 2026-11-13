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

/**
 * The widget's side of "Add to cart". The loader on the storefront makes the real
 * cart call (loader/shopifyCart.js) and says when it can with CART_AVAILABLE, so
 * the button only appears on the store these products came from.
 */

import { computed, reactive, ref } from 'vue'
import { postToHost } from './host-bridge'
import { planAllows } from './plan-features'

export type CartStatus = 'idle' | 'adding' | 'added' | 'failed'

export interface CartState {
  status: CartStatus
  error: string | null
}

// Past the loader's own limit: only an answer that never came ends up here
const ANSWER_TIMEOUT_MS = 20000
export const CART_ERROR = "Couldn't add this to your cart. Please try again."

const IDLE: CartState = { status: 'idle', error: null }

const shop = ref<string | null>(null)
const states = reactive<Record<string, CartState>>({})
const waiting = new Map<string, { variantId: string; timer: ReturnType<typeof setTimeout> }>()
// Each product's most recent request: an older one's answer may only report success
const latest = new Map<string, string>()
let nextRequest = 0

const sameShop = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export function canAddToCart(product: { cart_variant_id?: string | null }, shopDomain?: string | null): boolean {
  return !!product.cart_variant_id && cartAvailableFor(shopDomain)
}

/** Whether the loader announced this store's cart (products from another shop can't go in it). */
export function cartAvailableFor(shopDomain?: string | null): boolean {
  return !!(shopDomain && shop.value && sameShop(shop.value, shopDomain))
}

export function cartState(variantId: string): CartState {
  return states[variantId] ?? IDLE
}

function settle(variantId: string, requestId: string, state: CartState): void {
  if (state.status === 'added' || latest.get(variantId) === requestId) states[variantId] = state
}

// A late answer still counts: the item may be in the cart after the button gave up
function finish(requestId: string, state: CartState): void {
  const request = waiting.get(requestId)
  if (!request) return
  clearTimeout(request.timer)
  waiting.delete(requestId)
  settle(request.variantId, requestId, state)
}

export function addToCart(variantId: string): void {
  if (cartState(variantId).status === 'adding') return
  const requestId = `cart-${++nextRequest}`
  states[variantId] = { status: 'adding', error: null }
  latest.set(variantId, requestId)
  waiting.set(requestId, {
    variantId,
    timer: setTimeout(() => settle(variantId, requestId, { status: 'failed', error: CART_ERROR }), ANSWER_TIMEOUT_MS),
  })
  postToHost({ type: 'ADD_TO_CART', requestId, variantId })
}

export function viewCart(): void {
  postToHost({ type: 'VIEW_CART' })
}

export interface CartLine {
  variant_id: string
  title: string
  quantity: number
  image: string | null
  /** In the store's minor unit (cents), as cart.js gives it. */
  line_price: number
}

export interface CartSummary {
  item_count: number
  /** In the store's minor unit (cents). */
  total_price: number
  currency: string
  items: CartLine[]
}

/** The storefront's cart, as the loader last read it (CART_STATE); null until then. */
export const cartSummary = ref<CartSummary | null>(null)

/** Whether the loader announced a store cart on this page at all. */
export const cartOnPage = computed(() => !!shop.value)

/** Ask the loader for the cart (it answers with CART_STATE). The cart bar asks,
 * while the panel is open. */
export function requestCart(): void {
  if (shop.value) postToHost({ type: 'GET_CART' })
}

export function goToCheckout(): void {
  postToHost({ type: 'GO_TO_CHECKOUT' })
}

const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0)

function summaryFrom(data: Record<string, unknown>): CartSummary {
  const items = Array.isArray(data.items) ? data.items : []
  return {
    item_count: count(data.item_count),
    total_price: count(data.total_price),
    currency: typeof data.currency === 'string' ? data.currency : '',
    items: items.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object').map(item => ({
      variant_id: String(item.variant_id ?? ''),
      title: typeof item.title === 'string' ? item.title : '',
      quantity: count(item.quantity),
      image: typeof item.image === 'string' && /^https?:\/\//.test(item.image) ? item.image : null,
      line_price: count(item.line_price),
    })),
  }
}

/** A message from the loader. Returns true if it was for the cart. */
export function handleCartMessage(data: Record<string, unknown>): boolean {
  if (data.type === 'CART_AVAILABLE') {
    // Shopping in the chat is a Growth plan's: without it the store's cart is never
    // taken up, so no Add, Choose options or cart bar (product cards keep View)
    shop.value = planAllows('shop_in_chat') && typeof data.shop === 'string' && data.shop ? data.shop : null
    return true
  }
  if (data.type === 'CART_STATE') {
    if (shop.value) cartSummary.value = summaryFrom(data)
    return true
  }
  if (data.type === 'ADD_TO_CART_DONE') {
    const error = typeof data.error === 'string' && data.error ? data.error : CART_ERROR
    finish(String(data.requestId), data.ok === true ? { status: 'added', error: null } : { status: 'failed', error })
    return true
  }
  return false
}

/** Test seam: forget the store and every button's state. */
export function resetShopifyCart(): void {
  shop.value = null
  cartSummary.value = null
  waiting.forEach((request) => clearTimeout(request.timer))
  waiting.clear()
  latest.clear()
  Object.keys(states).forEach((variantId) => delete states[variantId])
}
