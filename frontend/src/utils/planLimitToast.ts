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

import { markRaw } from 'vue'
import { toast } from 'vue-sonner'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

/** Server messages that mean "your plan caps this" rather than "it broke"
 *  (backend/app/api/{knowledge,agent,users}.py). Deliberately narrow: a
 *  generic "maximum number of retries" must stay an error, not an upsell. */
const PLAN_LIMIT_PATTERNS = [
  /maximum number of (knowledge sources|agents|users|sub-?pages)/i,
  /your plan allows/i,
  /upgrade (your|to a) plan/i,
  /not (available|included) (on|in) your (current )?plan/i,
]

function isPlanLimitError(message: string | undefined | null): boolean {
  if (!message) return false
  return PLAN_LIMIT_PATTERNS.some((pattern) => pattern.test(message))
}

/**
 * Show a blocked-action error. When the enterprise module is present and a
 * promo applies, the toast carries the offer (design 2b B3); otherwise it is
 * the plain error toast. Returns true when it was a plan-limit message.
 */
export async function showPlanLimitError(title: string, message: string | undefined | null): Promise<boolean> {
  if (!isPlanLimitError(message)) {
    toast.error(title, { description: message || undefined })
    return false
  }
  const { hasEnterpriseModule, loadModule, moduleImports } = useEnterpriseFeatures()
  const module = hasEnterpriseModule ? await loadModule(moduleImports.promoLimitToast) : null
  const component = module?.default
  if (!component) {
    toast.error(title, { description: message || undefined })
    return true
  }
  const id = toast.custom(markRaw(component), {
    duration: 12000,
    componentProps: {
      title,
      message,
      onDismiss: () => toast.dismiss(id),
    },
  })
  return true
}
