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
    isSubscriptionActive: () => state.active,
  },
}))

import { useFeatureLock } from '@/composables/useFeatureLock'
import { FEATURE_GATES } from '@/components/agent/featureGates'

describe('quick actions for some pages (page suggestions)', () => {
  beforeEach(() => {
    state.enterprise = true
    state.features = {}
    state.active = true
  })

  it('reads the plan flag the server gates on', () => {
    expect(FEATURE_GATES['page-suggestions'].feature).toBe('page_suggestions')
  })

  it('is locked on a plan without the flag (Free)', () => {
    state.features = { page_suggestions: false }
    expect(useFeatureLock().isLocked('page-suggestions')).toBe(true)
  })

  it('is open on a paid plan', () => {
    state.features = { page_suggestions: true }
    expect(useFeatureLock().isLocked('page-suggestions')).toBe(false)
  })

  it('is locked when the subscription is not active', () => {
    state.features = { page_suggestions: true }
    state.active = false
    expect(useFeatureLock().isLocked('page-suggestions')).toBe(true)
  })

  it('is never locked self-hosted', () => {
    state.enterprise = false
    expect(useFeatureLock().isLocked('page-suggestions')).toBe(false)
  })
})
