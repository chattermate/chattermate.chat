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

import { describe, it, expect } from 'vitest'
import { accountNamesSummary, accountToManage, accountWarning, numberLimitState } from '@/utils/channelAccounts'
import type { ChannelAccount } from '@/services/channels'

const account = (overrides: Partial<ChannelAccount> = {}): ChannelAccount => ({
  id: 'a1', channel_type: 'whatsapp', external_account_id: 'PN1',
  display_name: 'Support (+1 555)', is_active: true, ...overrides,
})

describe('accountWarning', () => {
  it('is silent when no account needs reconnecting', () => {
    expect(accountWarning([])).toBeUndefined()
    expect(accountWarning([account(), account({ needs_reconnect: false })])).toBeUndefined()
  })

  it('names the account that needs reconnecting', () => {
    expect(accountWarning([account({ needs_reconnect: true })]))
      .toBe('Access expired for Support (+1 555) — reconnect to resume replies.')
  })

  it('names only the expired ones when several are connected', () => {
    const warning = accountWarning([
      account({ id: 'a1', display_name: 'Sales', needs_reconnect: true }),
      account({ id: 'a2', display_name: 'Healthy' }),
      account({ id: 'a3', display_name: 'Billing', needs_reconnect: true }),
    ])
    expect(warning).toBe('Access expired for Sales, Billing — reconnect to resume replies.')
  })

  it('falls back to the platform id when the account has no name', () => {
    expect(accountWarning([account({ display_name: undefined, needs_reconnect: true })]))
      .toContain('Access expired for PN1')
  })
})

describe('accountWarning for numbers that cannot send', () => {
  it('names the number that cannot send', () => {
    expect(accountWarning([account({ send_problem: 'PIN Mismatch' })]))
      .toBe("Support (+1 555) can't send replies — open it to see why.")
  })

  it('says both when one account expired and another cannot send', () => {
    expect(accountWarning([
      account({ id: 'a1', display_name: 'Sales', needs_reconnect: true }),
      account({ id: 'a2', display_name: 'Billing', send_problem: 'PIN Mismatch' }),
    ])).toBe("Access expired for Sales — reconnect to resume replies. Billing can't send replies — open it to see why.")
  })

  it('an expired account is named once, even if its register also failed', () => {
    expect(accountWarning([account({ needs_reconnect: true, send_problem: 'x' })]))
      .toBe('Access expired for Support (+1 555) — reconnect to resume replies.')
  })
})

describe('accountToManage', () => {
  it('opens a number that cannot send before a healthy one', () => {
    const blocked = account({ id: 'a2', send_problem: 'PIN Mismatch' })
    expect(accountToManage([account({ id: 'a1' }), blocked])).toBe(blocked)
  })

  it('opens an expired account before one that cannot send', () => {
    const expired = account({ id: 'a3', needs_reconnect: true })
    expect(accountToManage([account({ id: 'a2', send_problem: 'x' }), expired])).toBe(expired)
  })

  it('opens the account that needs reconnecting, even when it is not first', () => {
    const healthy = account({ id: 'a1' })
    const expired = account({ id: 'a2', needs_reconnect: true })
    expect(accountToManage([healthy, expired])).toBe(expired)
  })

  it('opens the first expired one when several need reconnecting', () => {
    const first = account({ id: 'a2', needs_reconnect: true })
    expect(accountToManage([account({ id: 'a1' }), first, account({ id: 'a3', needs_reconnect: true })])).toBe(first)
  })

  it('opens the first account when every one is healthy', () => {
    const first = account({ id: 'a1' })
    expect(accountToManage([first, account({ id: 'a2' })])).toBe(first)
  })

  it('opens nothing when no account is connected', () => {
    expect(accountToManage([])).toBeNull()
  })
})

describe('numberLimitState', () => {
  it('reads as a count when the plan sets no limit', () => {
    expect(numberLimitState(1, null)).toEqual({ usage: '1 number connected', atLimit: false, limitText: '' })
    expect(numberLimitState(3, null).usage).toBe('3 numbers connected')
  })

  it('shows the count against the limit and allows one more below it', () => {
    expect(numberLimitState(1, 2)).toEqual({
      usage: '1 of 2 numbers on your plan',
      atLimit: false,
      limitText: 'Your plan includes 2 WhatsApp numbers.',
    })
  })

  it('is at the limit once the plan is full, or past it after a downgrade', () => {
    expect(numberLimitState(2, 2).atLimit).toBe(true)
    expect(numberLimitState(3, 2).atLimit).toBe(true)
    expect(numberLimitState(3, 2).usage).toBe('3 numbers connected · your plan includes 2')
    expect(numberLimitState(1, 1).limitText).toBe('Your plan includes 1 WhatsApp number.')
    expect(numberLimitState(1, 1).usage).toBe('1 of 1 number on your plan')
  })
})

describe('accountNamesSummary', () => {
  const named = (...names: string[]) => names.map((n, i) => account({ id: `a${i}`, display_name: n }))

  it('lists every name while the list is short', () => {
    expect(accountNamesSummary(named('Sales'))).toBe('Sales')
    expect(accountNamesSummary(named('Sales', 'Support', 'Billing'))).toBe('Sales, Support, Billing')
  })

  it('names the first two and counts the rest of a long list', () => {
    expect(accountNamesSummary(named('Sales', 'Support', 'Billing', 'Returns', 'VIP')))
      .toBe('Sales, Support and 3 more')
  })

  it('skips accounts without a name', () => {
    expect(accountNamesSummary([account({ display_name: undefined }), ...named('Sales')])).toBe('Sales')
  })
})
