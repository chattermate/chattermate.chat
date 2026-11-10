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

import { beforeEach, describe, expect, it } from 'vitest'
import { computed } from 'vue'
import { subscriptionStorage } from '@/utils/storage'

const growth = { plan: { name: 'Growth', type: 'growth', features: { max_users: null } } } as any
const free = { plan: { name: 'Free', type: 'free', features: { max_users: 1 } } } as any

describe('subscriptionStorage', () => {
  beforeEach(() => localStorage.clear())

  it('re-runs a computed when this tab stores a new subscription', () => {
    subscriptionStorage.setCurrentSubscription(free)
    const planName = computed(() => subscriptionStorage.getCurrentSubscription()?.plan?.name)
    expect(planName.value).toBe('Free')

    subscriptionStorage.setCurrentSubscription(growth)

    expect(planName.value).toBe('Growth')
  })

  it('re-runs a computed when another tab stores one', () => {
    subscriptionStorage.setCurrentSubscription(free)
    const planName = computed(() => subscriptionStorage.getCurrentSubscription()?.plan?.name)
    expect(planName.value).toBe('Free')

    // Another tab paid: its write lands in shared storage and fires 'storage' here
    localStorage.setItem('current_subscription', JSON.stringify(growth))
    window.dispatchEvent(new StorageEvent('storage', { key: 'current_subscription' }))

    expect(planName.value).toBe('Growth')
  })
})
