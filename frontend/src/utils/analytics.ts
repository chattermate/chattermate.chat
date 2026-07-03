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
 * GTM / gtag event helpers. Every helper is a safe no-op when gtag isn't
 * loaded (local dev, OSS deployments without GTM), so enterprise-module
 * builds never depend on the tag actually being present.
 */

declare global {
    interface Window {
        gtag?: (...args: any[]) => void
        dataLayer?: any[]
    }
}

const track = (eventName: string, params: Record<string, any> = {}): void => {
    try {
        if (typeof window === 'undefined') return
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, params)
        } else if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push({ event: eventName, ...params })
        }
    } catch {
        // analytics must never break the app
    }
}

// ---- Plans & checkout -------------------------------------------------------

export const trackViewPlans = (): void => {
    track('view_item_list', { item_list_name: 'subscription_plans' })
}

export const trackSelectPlan = (planName: string, pricePerAgent: number, action?: string): void => {
    track('select_item', {
        item_list_name: 'subscription_plans',
        items: [{ item_name: planName, price: pricePerAgent }],
        action,
    })
}

export const trackSelectPlanShopify = (planName: string, action?: string): void => {
    track('select_item', {
        item_list_name: 'shopify_plans',
        items: [{ item_name: planName }],
        action,
    })
}

export const trackBeginCheckout = (planName: string, quantity: number, value: number): void => {
    track('begin_checkout', {
        currency: 'USD',
        value,
        items: [{ item_name: planName, quantity }],
    })
}

export const trackAddPaymentInfo = (paymentType: string, planName: string): void => {
    track('add_payment_info', { payment_type: paymentType, items: [{ item_name: planName }] })
}

export const trackCheckoutProgress = (step: string): void => {
    track('checkout_progress', { checkout_step: step })
}

export const trackPurchase = (
    transactionId: string,
    value: number,
    currency: string,
    planName: string,
    quantity?: number,
): void => {
    track('purchase', {
        transaction_id: transactionId,
        value,
        currency,
        items: [{ item_name: planName, quantity: quantity ?? 1 }],
    })
}

export const trackSubscriptionCancel = (planName: string, remainingDays?: number): void => {
    track('subscription_cancel', { item_name: planName, remaining_days: remainingDays })
}

// ---- Signup & exploration ---------------------------------------------------

export const trackSignUp = (method: string): void => {
    track('sign_up', { method })
}

export const trackSignupStep = (step: number): void => {
    track('signup_step', { step })
}

export const trackSignupRedirect = (source: string): void => {
    track('signup_redirect', { source })
}

export const trackViewDemo = (websiteUrl?: string): void => {
    track('view_demo', { website_url: websiteUrl })
}
