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

const store = vi.hoisted(() => ({ availablePlans: [] as unknown[], fetchPlans: vi.fn() }))

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

import UpgradeModal from '@/components/common/UpgradeModal.vue'
import LockedNote from '@/components/common/LockedNote.vue'
import { resetUpgradePlanCatalog } from '@/composables/useUpgradePlan'

const plan = (name: string, price: number, features: Record<string, boolean>) => ({
  type: name.toLowerCase(), name, price_per_agent: price, billing_interval: 'monthly', features,
})

describe('UpgradeModal', () => {
  beforeEach(() => {
    store.fetchPlans.mockReset().mockResolvedValue(undefined)
    store.availablePlans = [plan('Starter', 4.99, {}), plan('Pro', 24.99, { workflow: true }), plan('Growth', 9.99, { workflow: true })]
    resetUpgradePlanCatalog()
  })

  const open = (props: Record<string, unknown>) =>
    mount(UpgradeModal, { props: { title: 'Unlock Workflow', description: 'Build flows.', ...props }, attachTo: document.body })

  it('names the cheapest plan with the feature on its button', async () => {
    const wrapper = open({ feature: 'workflow', bullets: ['Visual builder', 'Branching'] })
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').attributes('aria-label')).toBe('Unlock Workflow')
    expect(wrapper.findAll('li').map((li) => li.text())).toEqual(['Visual builder', 'Branching'])
    expect(wrapper.find('.btn-primary').text()).toBe('Upgrade to Growth')
    wrapper.unmount()
  })

  it('points a limit at the plans page without naming a plan or fetching one', async () => {
    const wrapper = open({ title: 'Team limit reached', description: 'Upgrade to add more.' })
    await flushPromises()

    expect(wrapper.find('.btn-primary').text()).toBe('See plans')
    expect(wrapper.find('ul').exists()).toBe(false)
    expect(store.fetchPlans).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('emits upgrade and close from its buttons', async () => {
    const wrapper = open({ feature: 'workflow' })
    await wrapper.find('.btn-primary').trigger('click')
    await wrapper.find('.btn-ghost').trigger('click')

    expect(wrapper.emitted('upgrade')).toHaveLength(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })
})

describe('LockedNote', () => {
  beforeEach(() => {
    store.availablePlans = [plan('Growth', 9.99, { ai_ticketing: true })]
    resetUpgradePlanCatalog()
  })

  it('reads as one sentence with the plan as a link', async () => {
    const wrapper = mount(LockedNote, {
      props: { feature: 'ai_ticketing', action: 'to turn on AI ticketing.' },
      global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
    })
    await flushPromises()

    expect(wrapper.text()).toBe('Upgrade to Growth to turn on AI ticketing.')
    expect(wrapper.find('a').attributes('href')).toBe('/settings/subscription')
  })
})
