/*
ChatterMate - Onboarding State
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
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
