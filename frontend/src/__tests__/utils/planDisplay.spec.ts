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

import { describe, expect, it } from 'vitest'
import { formatShortDate } from '@/utils/shortDate'
import {
  cheapestPaidPlan,
  dayCount,
  endsIn,
  lowestPlanWith,
  planDisplayName,
  planShortName,
  trialLabel,
  upgradeLabel,
} from '@/utils/planDisplay'

describe('planDisplayName', () => {
  it('calls every free plan Free, the hidden legacy one included', () => {
    expect(planDisplayName({ type: 'free', name: 'Free (legacy)' })).toBe('Free')
    expect(planDisplayName({ type: 'free', name: 'Free' })).toBe('Free')
  })

  it('shows a customer on a retired paid plan the name they bought it under', () => {
    expect(planDisplayName({ type: 'pro', name: 'Pro (legacy)' })).toBe('Pro')
    expect(planDisplayName({ type: 'pro', name: 'Pro (yearly) (legacy)' })).toBe('Pro (yearly)')
    expect(planDisplayName({ type: 'base', name: 'Base (Legacy)' })).toBe('Base')
  })

  it('keeps a paid plan its own name, and is empty with no plan', () => {
    expect(planDisplayName({ type: 'growth', name: 'Growth' })).toBe('Growth')
    expect(planDisplayName(null)).toBe('')
    expect(planDisplayName({ type: 'pro', name: null })).toBe('')
  })
})

describe('trial labels', () => {
  it('counts days in the singular and plural', () => {
    expect(dayCount(1)).toBe('1 day')
    expect(dayCount(3)).toBe('3 days')
    expect(dayCount(0)).toBe('0 days')
  })

  it('names the plan and the days left', () => {
    expect(trialLabel('Growth', 14)).toBe('Growth trial · 14 days left')
    expect(trialLabel('Growth', 1)).toBe('Growth trial · 1 day left')
  })

  it('says the trial ends today on its last day, and copes with no plan name', () => {
    expect(trialLabel('Growth', 0)).toBe('Growth trial ends today')
    expect(trialLabel('', 2)).toBe('Trial · 2 days left')
  })
})

describe('lowestPlanWith', () => {
  const plan = (type: string, price: number, features: Record<string, unknown>, billing_interval = 'monthly') =>
    ({ type, name: type[0].toUpperCase() + type.slice(1), price_per_agent: price, billing_interval, features })
  const catalog = [
    plan('free', 0, { help_center: true }),
    plan('pro', 24.99, { help_center: true, api_access: true }),
    plan('growth', 9.99, { help_center: true }),
    plan('starter', 4.99, { help_center: false }),
    plan('growth', 99.9, { help_center: true }, 'yearly'),
  ]

  it('picks the cheapest paid monthly plan that includes the feature', () => {
    expect(lowestPlanWith(catalog, 'help_center')?.name).toBe('Growth')
    expect(lowestPlanWith(catalog, 'api_access')?.name).toBe('Pro')
  })

  it('never names Free or a yearly plan, and finds nothing for an unknown feature', () => {
    expect(lowestPlanWith([catalog[0], catalog[4]], 'help_center')).toBeNull()
    expect(lowestPlanWith(catalog, 'nope')).toBeNull()
    expect(lowestPlanWith([], 'help_center')).toBeNull()
  })

  it('needs the flag to be exactly true', () => {
    expect(lowestPlanWith([plan('growth', 9.99, { max_users: 1 })], 'max_users')).toBeNull()
  })
})

describe('upgradeLabel', () => {
  it('names the plan when it is known', () => {
    expect(upgradeLabel('Growth')).toBe('Upgrade to Growth')
    expect(upgradeLabel(null)).toBe('Upgrade your plan')
  })
})

describe('planShortName', () => {
  it('drops the interval suffix only', () => {
    expect(planShortName('Growth (yearly)')).toBe('Growth')
    expect(planShortName('Pro (Monthly)')).toBe('Pro')
    expect(planShortName('Pro (yearly) (legacy)')).toBe('Pro (legacy)')
    expect(planShortName(null)).toBe('')
  })
})

describe('formatShortDate', () => {
  it('formats a date and returns null for a missing or broken one', () => {
    const iso = '2026-12-03T12:00:00Z'
    expect(formatShortDate(iso)).toBe(new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }))
    expect(formatShortDate(null)).toBeNull()
    expect(formatShortDate('')).toBeNull()
    expect(formatShortDate('soon')).toBeNull()
  })
})

describe('endsIn', () => {
  it('counts down in days, then says today', () => {
    expect(endsIn(2)).toBe('in 2 days')
    expect(endsIn(1)).toBe('in 1 day')
    expect(endsIn(0)).toBe('today')
  })
})

describe('cheapestPaidPlan', () => {
  const plans = [
    { type: 'free', price_per_agent: 0, billing_interval: 'monthly' },
    { type: 'pro', price_per_agent: 24.99, billing_interval: 'monthly' },
    { type: 'growth', price_per_agent: 9.99, billing_interval: 'monthly' },
    { type: 'growth', price_per_agent: 99.9, billing_interval: 'yearly' },
  ]

  it('picks the cheapest paid plan at the interval that passes the test', () => {
    expect(cheapestPaidPlan(plans, () => true)?.price_per_agent).toBe(9.99)
    expect(cheapestPaidPlan(plans, (p) => p.type === 'pro')?.price_per_agent).toBe(24.99)
    expect(cheapestPaidPlan(plans, () => true, 'yearly')?.price_per_agent).toBe(99.9)
  })

  it('treats a plan with no interval as monthly, and finds nothing when none pass', () => {
    expect(cheapestPaidPlan([{ type: 'starter', price_per_agent: 4.99 }], () => true)?.price_per_agent).toBe(4.99)
    expect(cheapestPaidPlan(plans, () => false)).toBeNull()
  })
})
