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

/** The plan fields a label is built from. */
export interface NamedPlan {
  name?: string | null
  type?: string | null
}

/** The fields that decide which plan an upgrade line points to. */
export interface CatalogPlan extends NamedPlan {
  price_per_agent?: number | null
  billing_interval?: string | null
  features?: Record<string, unknown> | null
}

export const FREE_PLAN_NAME = 'Free'

/** A trial this close to its end is shown as ending soon. */
export const TRIAL_ENDING_SOON_DAYS = 3

/** "(legacy)" marks a retired catalog row for us; the customer on it
 *  still has the plan they bought. */
const LEGACY_SUFFIX = /\s*\(legacy\)/i

/** Every free plan reads as "Free", whatever the catalog row is called
 *  (a hidden legacy Free plan is still the Free plan to the customer), and a
 *  retired paid plan keeps the name it was sold under. */
export const planDisplayName = (plan?: NamedPlan | null): string =>
  plan?.type === 'free' ? FREE_PLAN_NAME : (plan?.name ?? '').replace(LEGACY_SUFFIX, '')

/** "Growth (yearly)" -> "Growth", for copy that names the interval itself
 *  or doesn't need it (badges, "Keep Growth"). */
export const planShortName = (name: string | null | undefined): string =>
  (name ?? '').replace(/\s*\((yearly|monthly)\)/i, '')

/** "1 day", "3 days". */
export const dayCount = (days: number): string => `${days} day${days === 1 ? '' : 's'}`

/** "in 3 days", or "today" on the last one. */
export const endsIn = (daysLeft: number): string => (daysLeft > 0 ? `in ${dayCount(daysLeft)}` : 'today')

/** "Growth trial · 3 days left", or "Growth trial ends today". */
export const trialLabel = (planName: string, daysLeft: number): string => {
  const name = planName ? `${planName} trial` : 'Trial'
  return daysLeft > 0 ? `${name} · ${dayCount(daysLeft)} left` : `${name} ends today`
}

/** The cheapest paid plan billed at `interval` that passes `test`, or null.
 *  Upgrade lines name this plan rather than a fixed tier. */
export const cheapestPaidPlan = <T extends CatalogPlan>(
  plans: readonly T[],
  test: (plan: T) => boolean,
  interval: 'monthly' | 'yearly' = 'monthly',
): T | null =>
  plans
    .filter((plan) => plan.type !== 'free' && (plan.billing_interval ?? 'monthly') === interval && test(plan))
    .reduce<T | null>(
      (best, plan) => (best === null || (plan.price_per_agent ?? 0) < (best.price_per_agent ?? 0) ? plan : best),
      null,
    )

/** The cheapest paid monthly plan that includes a feature, or null. */
export const lowestPlanWith = <T extends CatalogPlan>(plans: readonly T[], feature: string): T | null =>
  cheapestPaidPlan(plans, (plan) => plan.features?.[feature] === true)

/** "Upgrade to Growth", or a generic line when the plan isn't known. */
export const upgradeLabel = (planName: string | null): string =>
  planName ? `Upgrade to ${planName}` : 'Upgrade your plan'
