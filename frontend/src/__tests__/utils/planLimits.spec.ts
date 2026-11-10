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

import { afterEach, describe, expect, it } from 'vitest'
import { subscriptionStorage } from '@/utils/storage'

const storeSubscription = (plan: Record<string, unknown>) =>
  subscriptionStorage.setCurrentSubscription({ status: 'trial', plan } as never)

describe('subscriptionStorage.getPlanLimits', () => {
  afterEach(() => localStorage.clear())

  it('keeps an unlimited agent allowance unlimited', () => {
    // null is "no cap" on the backend; turning it into 0 locked agent creation
    // for every unlimited plan (found by the e2e enterprise suite).
    storeSubscription({ max_agents: null })
    expect(subscriptionStorage.getPlanLimits().maxAgents).toBeNull()
  })

  it('passes a capped allowance through', () => {
    storeSubscription({ max_agents: 5 })
    expect(subscriptionStorage.getPlanLimits().maxAgents).toBe(5)
  })

  it('allows nothing without a subscription', () => {
    expect(subscriptionStorage.getPlanLimits().maxAgents).toBe(0)
  })
})

describe('subscriptionStorage.getFeatureLimit', () => {
  afterEach(() => localStorage.clear())

  it('reads a numeric team limit from the plan', () => {
    storeSubscription({ features: { max_users: 1, chat: true } })
    expect(subscriptionStorage.getFeatureLimit('max_users')).toBe(1)
  })

  it('treats a null limit as unlimited', () => {
    storeSubscription({ features: { max_users: null } })
    expect(subscriptionStorage.getFeatureLimit('max_users')).toBeNull()
  })

  it('ignores a flag that is not a number, and a missing plan', () => {
    storeSubscription({ features: { chat: true } })
    expect(subscriptionStorage.getFeatureLimit('chat')).toBeNull()
    localStorage.clear()
    expect(subscriptionStorage.getFeatureLimit('max_users')).toBeNull()
  })

  it('still reports a numeric limit as a present feature', () => {
    storeSubscription({ features: { max_users: 1 } })
    expect(subscriptionStorage.hasFeatures(['max_users', 'chat'])).toEqual({ max_users: true, chat: false })
  })
})

describe('subscriptionStorage.isSubscriptionActive', () => {
  afterEach(() => localStorage.clear())

  it('keeps a past-due org on its plan while the payment is retried, like the server', () => {
    subscriptionStorage.setCurrentSubscription({ status: 'past_due', plan: {} } as never)
    expect(subscriptionStorage.isSubscriptionActive()).toBe(true)
  })

  it('treats a lapsed trial and an unknown status as inactive', () => {
    subscriptionStorage.setCurrentSubscription({ status: 'trial', trial_end: '2000-01-01T00:00:00Z', plan: {} } as never)
    expect(subscriptionStorage.isSubscriptionActive()).toBe(false)
    subscriptionStorage.setCurrentSubscription({ status: 'expired', plan: {} } as never)
    expect(subscriptionStorage.isSubscriptionActive()).toBe(false)
  })
})
