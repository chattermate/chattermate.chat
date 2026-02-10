/**
 * GTM DataLayer analytics utility
 * Wraps window.dataLayer.push() with type-safe event functions.
 * Uses GA4 recommended event names where possible.
 * Never sends PII (no emails/names — only plan names, prices, step numbers).
 *
 * All tracking is gated on VITE_GTM_ID. If the env var is not set,
 * GTM is never loaded and no events are pushed.
 */

const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined

type EventParams = Record<string, string | number | boolean | undefined>

// All param keys used across events — pushed as undefined to reset stale values
const ALL_PARAM_KEYS = [
  'website_url', 'source', 'step', 'method',
  'item_list_name', 'plan_name', 'plan_price', 'action',
  'quantity', 'value', 'payment_method', 'transaction_id',
  'currency', 'context', 'remaining_days',
] as const

/**
 * Injects the GTM script tag into <head> at runtime.
 * Call once on app startup (e.g. in main.ts).
 */
export function initGTM() {
  if (!GTM_ID) return

  // GTM inline snippet
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
  document.head.insertBefore(script, document.head.firstChild)

  // noscript fallback
  const noscript = document.createElement('noscript')
  const iframe = document.createElement('iframe')
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`
  iframe.height = '0'
  iframe.width = '0'
  iframe.style.display = 'none'
  iframe.style.visibility = 'hidden'
  noscript.appendChild(iframe)
  document.body.insertBefore(noscript, document.body.firstChild)
}

function pushEvent(eventName: string, params?: EventParams) {
  if (!GTM_ID) return

  try {
    window.dataLayer = window.dataLayer || []

    // Reset all known keys to undefined, then overlay this event's params.
    // This prevents GTM's cumulative state from leaking params across events.
    const reset: Record<string, undefined> = {}
    for (const key of ALL_PARAM_KEYS) {
      reset[key] = undefined
    }

    const event = { ...reset, event: eventName, ...params }
    window.dataLayer.push(event)

    if (import.meta.env.DEV) {
      console.log('[GTM]', eventName, params)
    }
  } catch {
    // Tracking must never break the app
  }
}

// -- Explore (top of funnel) --

export function trackViewDemo(websiteUrl: string) {
  pushEvent('view_demo', { website_url: websiteUrl })
}

export function trackSignupRedirect(source: string) {
  pushEvent('signup_redirect', { source })
}

// -- Signup flow --

export function trackSignupStep(step: number) {
  pushEvent('signup_step', { step })
}

export function trackSignUp(method: string = 'email') {
  pushEvent('sign_up', { method })
}

// -- Login --

export function trackLogin(method: string = 'email') {
  pushEvent('login', { method })
}

// -- Subscription plans --

export function trackViewPlans() {
  pushEvent('view_item_list', { item_list_name: 'plans' })
}

export function trackSelectPlan(planName: string, planPrice: number, action: string) {
  pushEvent('select_item', { plan_name: planName, plan_price: planPrice, action })
}

// -- Checkout / Billing --

export function trackBeginCheckout(planName: string, quantity: number, value: number) {
  pushEvent('begin_checkout', { plan_name: planName, quantity, value })
}

export function trackAddPaymentInfo(paymentMethod: string, planName: string) {
  pushEvent('add_payment_info', { payment_method: paymentMethod, plan_name: planName })
}

export function trackCheckoutProgress(step: string) {
  pushEvent('checkout_progress', { step })
}

export function trackPurchase(transactionId: string, value: number, currency: string, planName: string, quantity?: number) {
  pushEvent('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    plan_name: planName,
    ...(quantity !== undefined && { quantity }),
  })
}

// -- Shopify --

export function trackSelectPlanShopify(planName: string, action: string) {
  pushEvent('select_item', { plan_name: planName, context: 'shopify', action })
}

// -- Cancellation --

export function trackSubscriptionCancel(planName: string, remainingDays: number) {
  pushEvent('subscription_cancel', { plan_name: planName, remaining_days: remainingDays })
}
