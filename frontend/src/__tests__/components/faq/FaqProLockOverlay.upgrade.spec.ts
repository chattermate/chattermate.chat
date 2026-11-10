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
import { flushPromises, mount } from '@vue/test-utils'

const store = vi.hoisted(() => ({
  availablePlans: [] as unknown[],
  fetchPlans: vi.fn(),
}))

// Like the real composable: every call gets its own handle, empty until that
// caller connects it to the shared store.
vi.mock('@/composables/useEnterpriseFeatures', async () => {
  const { ref } = await import('vue')
  return {
    useEnterpriseFeatures: () => {
      const subscriptionStore = ref<Record<string, unknown>>({ availablePlans: [] })
      return {
        hasEnterpriseModule: true,
        subscriptionStore,
        initializeSubscriptionStore: vi.fn(async () => { subscriptionStore.value = store }),
      }
    },
  }
})
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import FaqProLockOverlay from '@/components/faq/FaqProLockOverlay.vue'
import { resetUpgradePlanCatalog } from '@/composables/useUpgradePlan'

const plan = (type: string, price: number, helpCenter: boolean, billing_interval = 'monthly') => ({
  type, name: type[0].toUpperCase() + type.slice(1), price_per_agent: price, billing_interval,
  features: { help_center: helpCenter },
})

describe('FaqProLockOverlay upgrade line', () => {
  beforeEach(() => {
    localStorage.clear()
    store.fetchPlans.mockReset().mockResolvedValue(undefined)
    resetUpgradePlanCatalog()
  })

  it('names the cheapest plan that includes the help center', async () => {
    store.availablePlans = [plan('starter', 4.99, false), plan('pro', 24.99, true), plan('growth', 9.99, true)]

    const wrapper = mount(FaqProLockOverlay, { props: { planAllowed: false } })
    await flushPromises()

    expect(wrapper.find('.lock-card__title').text()).toBe('Auto-generate FAQs with Growth')
    expect(wrapper.find('.btn-upgrade').text()).toBe('Upgrade to Growth')
    expect(wrapper.text()).not.toMatch(/\$39|\/agent|Pro/)
  })

  it('refreshes a possibly stale catalog once, however many locks are on screen', async () => {
    store.availablePlans = [plan('growth', 9.99, true)]

    mount(FaqProLockOverlay, { props: { planAllowed: false } })
    mount(FaqProLockOverlay, { props: { planAllowed: false } })
    await flushPromises()

    expect(store.fetchPlans).toHaveBeenCalledTimes(1)
  })

  it('names the plan on a lock mounted after the first one too', async () => {
    store.availablePlans = [plan('growth', 9.99, true)]

    mount(FaqProLockOverlay, { props: { planAllowed: false } })
    await flushPromises()
    const later = mount(FaqProLockOverlay, { props: { planAllowed: false } })
    await flushPromises()

    expect(later.find('.btn-upgrade').text()).toBe('Upgrade to Growth')
  })

  it('stays generic with no catalog, and survives a failed refresh', async () => {
    store.availablePlans = []
    store.fetchPlans.mockRejectedValue(new Error('offline'))

    const wrapper = mount(FaqProLockOverlay, { props: { planAllowed: false } })
    await flushPromises()

    expect(wrapper.find('.lock-card__title').text()).toBe('Auto-generate FAQs')
    expect(wrapper.find('.btn-upgrade').text()).toBe('Upgrade your plan')
  })
})
