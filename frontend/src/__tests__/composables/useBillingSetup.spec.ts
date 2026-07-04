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

import { describe, it, expect, vi, beforeEach } from 'vitest'

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
    useRouter: () => ({ push: pushMock })
}))

const apiGetMock = vi.fn()
const apiPostMock = vi.fn()
vi.mock('@/services/api', () => ({
    default: {
        get: (...args: any[]) => apiGetMock(...args),
        post: (...args: any[]) => apiPostMock(...args)
    }
}))

vi.mock('@/config/api', () => ({
    getRazorpayKeyId: () => 'rzp_test_key'
}))

import { useBillingSetup, loadRazorpayScript } from '@/modules/enterprise/composables/useBillingSetup'

const billingStatusFixture = (overrides: Record<string, any> = {}) => ({
    checkout_provider: 'razorpay',
    currency: 'INR',
    currency_locked: false,
    upi_cap: 15000,
    new_plan: {
        id: 'plan-1',
        name: 'Pro',
        type: 'pro',
        price_per_agent: 899.0,
        prices: { INR: 899.0, USD: 9.99 },
        max_agents: null
    },
    active_human_agents: 2,
    is_trial: false,
    ...overrides
})

describe('useBillingSetup', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // fresh Razorpay stub per test
        ;(window as any).Razorpay = undefined
    })

    describe('fetchBillingStatus', () => {
        it('loads billing status and seeds quantity from agents/subscription', async () => {
            apiGetMock.mockResolvedValue({
                data: billingStatusFixture({
                    active_human_agents: 2,
                    current_subscription: {
                        id: 's1', quantity: 3, status: 'active', payment_provider: 'razorpay',
                        payment_provider_subscription_id: 'sub_1'
                    }
                })
            })
            const setup = useBillingSetup('plan-1')

            await setup.fetchBillingStatus()

            expect(setup.currency.value).toBe('INR')
            expect(setup.quantity.value).toBe(3) // max(agents, current quantity)
            expect(setup.currencySymbol.value).toBe('₹')
        })

        it('passes explicit currency to the API', async () => {
            apiGetMock.mockResolvedValue({ data: billingStatusFixture({ currency: 'USD' }) })
            const setup = useBillingSetup('plan-1')

            await setup.fetchBillingStatus('USD')

            expect(apiGetMock).toHaveBeenCalledWith(
                '/enterprise/subscriptions/check-billing-status/plan-1',
                { params: { currency: 'USD' } }
            )
            expect(setup.currencySymbol.value).toBe('$')
        })

        it('setCurrency is a no-op when locked', async () => {
            apiGetMock.mockResolvedValue({
                data: billingStatusFixture({ currency_locked: true })
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()
            apiGetMock.mockClear()

            await setup.setCurrency('USD')

            expect(apiGetMock).not.toHaveBeenCalled()
        })
    })

    describe('change classification', () => {
        it('seat decrease is a scheduled change with nothing due now', async () => {
            apiGetMock.mockResolvedValue({
                data: billingStatusFixture({
                    change_type: 'same',
                    current_period_end: new Date(Date.now() + 10 * 86400000).toISOString(),
                    proration: { remaining_days: 10, total_days: 30, current_cycle_total: 4495 },
                    current_subscription: {
                        id: 's1', quantity: 5, status: 'active', payment_provider: 'razorpay',
                        payment_provider_subscription_id: 'sub_1'
                    }
                })
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()

            setup.quantity.value = 3

            expect(setup.isQuantityReduction.value).toBe(true)
            expect(setup.isScheduledChange.value).toBe(true)
            expect(setup.dueNow.value).toBe(0)
            expect(setup.isPaidUpgrade.value).toBe(false)
            expect(setup.scheduledChangeMessage.value).toContain('Nothing is charged until then')
        })

        it('upgrade computes the prorated delta due now', async () => {
            apiGetMock.mockResolvedValue({
                data: billingStatusFixture({
                    change_type: 'same',
                    future_start_date: new Date(Date.now() + 15 * 86400000).toISOString(),
                    // 2 seats @ 899 paid, 15 of 30 days remaining
                    proration: { remaining_days: 15, total_days: 30, current_cycle_total: 1798 },
                    current_subscription: {
                        id: 's1', quantity: 2, status: 'active', payment_provider: 'razorpay',
                        payment_provider_subscription_id: 'sub_1'
                    }
                })
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()

            setup.quantity.value = 3

            // (2697 - 1798) x 15/30 = 449.5
            expect(setup.dueNow.value).toBe(449.5)
            expect(setup.isPaidUpgrade.value).toBe(true)
            expect(setup.dueNowMessage.value).toContain('applies right away')
        })

        it('no charge when the delta is below the minimum', async () => {
            apiGetMock.mockResolvedValue({
                data: billingStatusFixture({
                    proration: { remaining_days: 0, total_days: 30, current_cycle_total: 1798 },
                    current_subscription: {
                        id: 's1', quantity: 2, status: 'active', payment_provider: 'razorpay',
                        payment_provider_subscription_id: 'sub_1'
                    }
                })
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()
            setup.quantity.value = 3

            expect(setup.dueNow.value).toBe(0)
            expect(setup.isPaidUpgrade.value).toBe(false)
        })

        it('in-place USD increase says the card on file is charged, no re-auth', async () => {
            apiGetMock.mockResolvedValue({
                data: billingStatusFixture({
                    currency: 'USD',
                    new_plan: {
                        id: 'plan-1', name: 'Pro', type: 'pro',
                        price_per_agent: 9.99, prices: { USD: 9.99 }, max_agents: null
                    },
                    change_type: 'same',
                    update_in_place: true,
                    // 2 seats @ 9.99 paid, 15 of 30 days remaining
                    proration: { remaining_days: 15, total_days: 30, current_cycle_total: 19.98 },
                    current_subscription: {
                        id: 's1', quantity: 2, status: 'active', currency: 'USD',
                        payment_provider: 'razorpay',
                        payment_provider_subscription_id: 'sub_1'
                    }
                })
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()

            setup.quantity.value = 3

            // (29.97 - 19.98) x 15/30 = ~5.0 - Razorpay auto-charges it
            expect(setup.dueNow.value).toBeCloseTo(5.0, 1)
            expect(setup.isInPlaceUpdate.value).toBe(true)
            expect(setup.dueNowMessage.value).toContain('card on file')
        })

        it('in-place USD decrease is scheduled with no re-authorization', async () => {
            apiGetMock.mockResolvedValue({
                data: billingStatusFixture({
                    currency: 'USD',
                    new_plan: {
                        id: 'plan-1', name: 'Pro', type: 'pro',
                        price_per_agent: 9.99, prices: { USD: 9.99 }, max_agents: null
                    },
                    change_type: 'same',
                    update_in_place: true,
                    current_period_end: new Date(Date.now() + 10 * 86400000).toISOString(),
                    proration: { remaining_days: 10, total_days: 30, current_cycle_total: 29.97 },
                    current_subscription: {
                        id: 's1', quantity: 3, status: 'active', currency: 'USD',
                        payment_provider: 'razorpay',
                        payment_provider_subscription_id: 'sub_1'
                    }
                })
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()

            setup.quantity.value = 2

            expect(setup.dueNow.value).toBe(0)
            expect(setup.scheduledChangeMessage.value).toContain('Nothing is charged until then')
        })

        it('seeds seats from the scheduled change, not the current subscription', async () => {
            apiGetMock.mockResolvedValue({
                data: billingStatusFixture({
                    active_human_agents: 1,
                    current_subscription: {
                        id: 's1', quantity: 2, status: 'active', payment_provider: 'razorpay',
                        payment_provider_subscription_id: 'sub_1'
                    },
                    scheduled_change: {
                        razorpay_subscription_id: 'sub_sched',
                        plan_id: 'plan-1', plan_name: 'Pro', quantity: 1,
                        unit_price: 899.0, currency: 'INR',
                        start_at: new Date(Date.now() + 15 * 86400000).toISOString()
                    }
                })
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()

            // the scheduled downgrade to 1 is the baseline, not the current 2
            expect(setup.quantity.value).toBe(1)
            expect(setup.scheduledChange.value?.quantity).toBe(1)
            expect(setup.pendingChangeNote.value).toContain('scheduled for')
        })

        it('flags the UPI cap when total exceeds it', async () => {
            apiGetMock.mockResolvedValue({ data: billingStatusFixture() })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()

            setup.quantity.value = 20 // 20 x 899 = 17,980 > 15,000

            expect(setup.upiBlocked.value).toBe(true)
            expect(setup.upiCapMessage.value).toContain('card payment')
        })
    })

    describe('startCheckout', () => {
        const razorpayOpen = vi.fn()
        const razorpayOn = vi.fn()

        beforeEach(() => {
            ;(window as any).Razorpay = vi.fn(() => ({ open: razorpayOpen, on: razorpayOn }))
        })

        it('opens the Razorpay modal with the created subscription', async () => {
            apiGetMock.mockResolvedValue({ data: billingStatusFixture() })
            apiPostMock.mockResolvedValue({
                data: {
                    subscription_id: 'sub_new', status: 'created', currency: 'INR',
                    amount: 1798, due_now: 0, start_at: null, upi_blocked: false, change_type: 'new'
                }
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()

            await setup.startCheckout()

            expect(apiPostMock).toHaveBeenCalledWith(
                '/enterprise/payment/razorpay/create-subscription',
                { plan_id: 'plan-1', quantity: 2, currency: 'INR' }
            )
            const options = (window as any).Razorpay.mock.calls[0][0]
            expect(options.key).toBe('rzp_test_key')
            expect(options.subscription_id).toBe('sub_new')
            expect(razorpayOpen).toHaveBeenCalled()
        })

        it('scheduled subs route to the scheduled confirmation instead of polling', async () => {
            apiGetMock.mockResolvedValue({ data: billingStatusFixture() })
            apiPostMock.mockResolvedValue({
                data: {
                    subscription_id: 'sub_sched', status: 'created', currency: 'INR',
                    amount: 899, due_now: 0, start_at: new Date(Date.now() + 86400000).toISOString(),
                    upi_blocked: false, change_type: 'scheduled'
                }
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()
            await setup.startCheckout()

            const options = (window as any).Razorpay.mock.calls[0][0]
            apiPostMock.mockClear()
            apiPostMock.mockResolvedValue({ data: { status: 'verified' } })

            await options.handler({
                razorpay_payment_id: 'pay_1',
                razorpay_subscription_id: 'sub_sched',
                razorpay_signature: 'sig'
            })

            expect(apiPostMock).toHaveBeenCalledWith(
                '/enterprise/payment/razorpay/verify-payment',
                expect.objectContaining({ razorpay_payment_id: 'pay_1' })
            )
            expect(pushMock).toHaveBeenCalledWith('/settings/subscription?scheduled=true')
        })

        it('paid upgrades route to success - the upgrade applies immediately', async () => {
            apiGetMock.mockResolvedValue({ data: billingStatusFixture() })
            apiPostMock.mockResolvedValue({
                data: {
                    subscription_id: 'sub_upg', status: 'created', currency: 'INR',
                    amount: 2697, due_now: 449.5,
                    start_at: new Date(Date.now() + 15 * 86400000).toISOString(),
                    upi_blocked: false, change_type: 'upgrade'
                }
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()
            await setup.startCheckout()

            const options = (window as any).Razorpay.mock.calls[0][0]
            expect(options.description).toContain('Upgrade')
            apiPostMock.mockClear()
            apiPostMock.mockResolvedValue({ data: { status: 'verified' } })

            await options.handler({
                razorpay_payment_id: 'pay_up',
                razorpay_subscription_id: 'sub_upg',
                razorpay_signature: 'sig'
            })

            expect(pushMock).toHaveBeenCalledWith('/settings/subscription?success=true')
        })

        it('dismissing the modal clears processing without side effects', async () => {
            apiGetMock.mockResolvedValue({ data: billingStatusFixture() })
            apiPostMock.mockResolvedValue({
                data: {
                    subscription_id: 'sub_x', status: 'created', currency: 'INR',
                    amount: 899, start_at: null, upi_blocked: false, change_type: 'new'
                }
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()
            await setup.startCheckout()

            const options = (window as any).Razorpay.mock.calls[0][0]
            options.modal.ondismiss()

            expect(setup.isProcessing.value).toBe(false)
            expect(setup.error.value).toBe('')
        })

        it('surfaces backend errors from create-subscription', async () => {
            apiGetMock.mockResolvedValue({ data: billingStatusFixture() })
            apiPostMock.mockRejectedValue({
                response: { data: { detail: 'Quantity exceeds plan limit of 2 agents' } }
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()

            await setup.startCheckout()

            expect(setup.error.value).toContain('Quantity exceeds plan limit')
            expect(setup.isProcessing.value).toBe(false)
        })
    })

    describe('payment method visibility', () => {
        it('USD checkout hides INR-only recurring methods', async () => {
            const razorpayCtor = vi.fn(() => ({ open: vi.fn(), on: vi.fn() }))
            ;(window as any).Razorpay = razorpayCtor
            apiGetMock.mockResolvedValue({
                data: billingStatusFixture({
                    currency: 'USD',
                    new_plan: {
                        id: 'plan-1', name: 'Pro', type: 'pro',
                        price_per_agent: 9.99, prices: { USD: 9.99 }, max_agents: null
                    }
                })
            })
            apiPostMock.mockResolvedValue({
                data: { subscription_id: 'sub_x', status: 'created', currency: 'USD',
                        amount: 9.99, due_now: 0, start_at: null, upi_blocked: false,
                        change_type: 'new' }
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()

            await setup.startCheckout()

            const options = razorpayCtor.mock.calls[0][0] as any
            const hidden = options.config.display.hide.map((h: any) => h.method)
            expect(hidden).toContain('emandate')
            expect(hidden).toContain('upi')
        })

        it('INR checkout hides only emandate (UPI AutoPay stays)', async () => {
            const razorpayCtor = vi.fn(() => ({ open: vi.fn(), on: vi.fn() }))
            ;(window as any).Razorpay = razorpayCtor
            apiGetMock.mockResolvedValue({ data: billingStatusFixture() })
            apiPostMock.mockResolvedValue({
                data: { subscription_id: 'sub_x', status: 'created', currency: 'INR',
                        amount: 899, due_now: 0, start_at: null, upi_blocked: false,
                        change_type: 'new' }
            })
            const setup = useBillingSetup('plan-1')
            await setup.fetchBillingStatus()

            await setup.startCheckout()

            const options = razorpayCtor.mock.calls[0][0] as any
            const hidden = options.config.display.hide.map((h: any) => h.method)
            expect(hidden).toEqual(['emandate'])
        })
    })

    describe('loadRazorpayScript', () => {
        it('resolves immediately when Razorpay is already present', async () => {
            ;(window as any).Razorpay = vi.fn()
            await expect(loadRazorpayScript()).resolves.toBeUndefined()
        })
    })
})
