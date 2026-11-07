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

import { computed, onMounted } from 'vue'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { lowestPlanWith, planDisplayName, upgradeLabel } from '@/utils/planDisplay'

/** One catalog refresh per page load, shared by every upgrade line on screen.
 *  The cached catalog may predate a pricing change, so it is refreshed once
 *  rather than trusted; the cache is shown until the refresh lands, and the
 *  line goes generic if the refresh fails. */
let catalogRefresh: Promise<void> | null = null

/** Forget the refresh, so the next mount fetches again (tests). */
export function resetUpgradePlanCatalog() {
  catalogRefresh = null
}

/** The plan an upgrade line for `feature` should name, read from the plan
 *  catalog, so the copy follows the catalog instead of a fixed tier. In the
 *  open-source build there is no catalog and the line stays generic. */
export function useUpgradePlan(feature: string) {
  const { hasEnterpriseModule, subscriptionStore, initializeSubscriptionStore } = useEnterpriseFeatures()

  onMounted(() => {
    if (!hasEnterpriseModule) return
    catalogRefresh ??= initializeSubscriptionStore()
      .then(() => subscriptionStore.value.fetchPlans?.())
      .catch(() => undefined)
  })

  const planName = computed<string | null>(() => {
    const plan = lowestPlanWith(subscriptionStore.value.availablePlans ?? [], feature)
    return plan ? planDisplayName(plan) : null
  })

  return { planName, upgradeText: computed(() => upgradeLabel(planName.value)) }
}
