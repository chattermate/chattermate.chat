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

import { reactive, ref } from 'vue'
import { postToHost } from './host-bridge'

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
let nextRequest = 0

const sameShop = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export function canAddToCart(product: { cart_variant_id?: string | null }, shopDomain?: string | null): boolean {
  return !!(product.cart_variant_id && shopDomain && shop.value && sameShop(shop.value, shopDomain))
}

export function cartState(variantId: string): CartState {
  return states[variantId] ?? IDLE
}

function finish(requestId: string, state: CartState): void {
  const request = waiting.get(requestId)
  if (!request) return
  clearTimeout(request.timer)
  waiting.delete(requestId)
  states[request.variantId] = state
}

export function addToCart(variantId: string): void {
  if (cartState(variantId).status === 'adding') return
  const requestId = `cart-${++nextRequest}`
  states[variantId] = { status: 'adding', error: null }
  waiting.set(requestId, {
    variantId,
    timer: setTimeout(() => finish(requestId, { status: 'failed', error: CART_ERROR }), ANSWER_TIMEOUT_MS),
  })
  postToHost({ type: 'ADD_TO_CART', requestId, variantId })
}

export function viewCart(): void {
  postToHost({ type: 'VIEW_CART' })
}

/** A message from the loader. Returns true if it was for the cart. */
export function handleCartMessage(data: Record<string, unknown>): boolean {
  if (data.type === 'CART_AVAILABLE') {
    shop.value = typeof data.shop === 'string' && data.shop ? data.shop : null
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
  waiting.forEach((request) => clearTimeout(request.timer))
  waiting.clear()
  Object.keys(states).forEach((variantId) => delete states[variantId])
}
