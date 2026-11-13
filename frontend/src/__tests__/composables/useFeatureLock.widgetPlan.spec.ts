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

const state = vi.hoisted(() => ({ enterprise: true, features: {} as Record<string, unknown>, active: true }))

vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({ hasEnterpriseModule: state.enterprise }),
}))
vi.mock('@/utils/storage', () => ({
  subscriptionStorage: {
    hasFeature: (name: string) => Boolean(state.features[name]),
    // As utils/storage: a plan that doesn't name a newer flag yet has it; no plan, none
    hasPlanFlag: (name: string) => (Object.keys(state.features).length === 0 ? false
      : name in state.features ? Boolean(state.features[name]) : true),
    isSubscriptionActive: () => state.active,
  },
}))

import { useFeatureLock } from '@/composables/useFeatureLock'
import { FEATURE_GATES } from '@/components/agent/featureGates'

// The dashboard's locks for the widget's plan features, and the flag each reads
// (the server's widget_plan.py gates on the same names)
const GATES = [
  ['chat-initiation', 'chat_initiation'],
  ['quick-actions', 'quick_actions'],
  ['page-suggestions', 'page_suggestions'],
  ['follow-ups', 'follow_ups'],
] as const

describe.each(GATES)('the %s lock', (gate, flag) => {
  beforeEach(() => {
    state.enterprise = true
    state.features = {}
    state.active = true
  })

  it('reads the plan flag the server gates on', () => {
    expect(FEATURE_GATES[gate].feature).toBe(flag)
  })

  it('is locked on a plan without the flag', () => {
    state.features = { [flag]: false }
    expect(useFeatureLock().isLocked(gate)).toBe(true)
  })

  it('is open on a plan that does not name the flag yet (before its migration runs)', () => {
    state.features = { chat: true }
    expect(useFeatureLock().isLocked(gate)).toBe(false)
  })

  it('is locked with no plan at all', () => {
    state.features = {}
    expect(useFeatureLock().isLocked(gate)).toBe(true)
  })

  it('is open on a plan with it', () => {
    state.features = { [flag]: true }
    expect(useFeatureLock().isLocked(gate)).toBe(false)
  })

  it('is locked when the subscription is not active', () => {
    state.features = { [flag]: true }
    state.active = false
    expect(useFeatureLock().isLocked(gate)).toBe(true)
  })

  it('is never locked self-hosted', () => {
    state.enterprise = false
    expect(useFeatureLock().isLocked(gate)).toBe(false)
  })
})
