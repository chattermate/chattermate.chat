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

import { subscriptionStorage } from '@/utils/storage'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { FEATURE_GATES, type GateKey } from '@/components/agent/featureGates'

/**
 * Whether a paid agent feature is locked for this org: only with the enterprise
 * module (self-hosted is never locked), when the plan lacks the flag or the
 * subscription isn't active.
 */
export function useFeatureLock() {
  const { hasEnterpriseModule } = useEnterpriseFeatures()
  const isLocked = (key: GateKey): boolean => {
    if (!hasEnterpriseModule) return false
    return !subscriptionStorage.hasFeature(FEATURE_GATES[key].feature) || !subscriptionStorage.isSubscriptionActive()
  }
  return { isLocked }
}
