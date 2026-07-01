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

import { userService } from '@/services/user'

const STORAGE_KEY = 'chattermate:onboarding:v1'

export const ONBOARDING_STEPS = ['Create', 'Teach', 'Test', 'Launch'] as const
export type OnboardingStepIndex = 0 | 1 | 2 | 3

export interface OnboardingRecord {
  skipped: boolean
  currentStep: OnboardingStepIndex
  completedSteps: number[]
  agentId: string | null
  agentName: string | null
  widgetId: string | null
  updatedAt: number
}

type OnboardingStore = Record<string, OnboardingRecord>

const emptyRecord = (): OnboardingRecord => ({
  skipped: false,
  currentStep: 0,
  completedSteps: [],
  agentId: null,
  agentName: null,
  widgetId: null,
  updatedAt: Date.now(),
})

function readStore(): OnboardingStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as OnboardingStore) : {}
  } catch {
    return {}
  }
}

function writeStore(store: OnboardingStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch (err) {
    console.warn('Failed to persist onboarding state:', err)
  }
}

/**
 * localStorage-backed onboarding state machine, keyed by organization id.
 * Completion is backend-authoritative (org has >=1 agent); this only tracks
 * skip + in-run progress + the resume-checklist banner ticks.
 */
export function useOnboardingState() {
  const resolveOrgId = (orgId?: string): string => {
    return orgId || userService.getCurrentUser()?.organization_id || ''
  }

  const get = (orgId?: string): OnboardingRecord => {
    const id = resolveOrgId(orgId)
    if (!id) return emptyRecord()
    const store = readStore()
    return store[id] ? { ...emptyRecord(), ...store[id] } : emptyRecord()
  }

  const patch = (orgId: string | undefined, partial: Partial<OnboardingRecord>): OnboardingRecord => {
    const id = resolveOrgId(orgId)
    if (!id) return emptyRecord()
    const store = readStore()
    const next: OnboardingRecord = {
      ...emptyRecord(),
      ...store[id],
      ...partial,
      updatedAt: Date.now(),
    }
    store[id] = next
    writeStore(store)
    return next
  }

  const isSkipped = (orgId?: string): boolean => get(orgId).skipped

  const skip = (orgId?: string): OnboardingRecord => patch(orgId, { skipped: true })

  const clear = (orgId?: string) => {
    const id = resolveOrgId(orgId)
    if (!id) return
    const store = readStore()
    delete store[id]
    writeStore(store)
  }

  const goTo = (orgId: string | undefined, step: OnboardingStepIndex): OnboardingRecord =>
    patch(orgId, { currentStep: step })

  const completeStep = (
    orgId: string | undefined,
    step: OnboardingStepIndex,
    nextStep?: OnboardingStepIndex,
  ): OnboardingRecord => {
    const record = get(orgId)
    const completedSteps = Array.from(new Set([...record.completedSteps, step])).sort((a, b) => a - b)
    return patch(orgId, {
      completedSteps,
      currentStep: nextStep ?? record.currentStep,
    })
  }

  /**
   * An unfinished run worth surfacing in the resume banner: an agent was
   * created but the user hasn't seen every step, and they didn't skip.
   */
  const hasUnfinishedRun = (orgId?: string): boolean => {
    const record = get(orgId)
    if (record.skipped) return false
    if (!record.agentId) return false
    return record.completedSteps.length < ONBOARDING_STEPS.length
  }

  return {
    ONBOARDING_STEPS,
    get,
    patch,
    isSkipped,
    skip,
    clear,
    goTo,
    completeStep,
    hasUnfinishedRun,
    resolveOrgId,
  }
}
