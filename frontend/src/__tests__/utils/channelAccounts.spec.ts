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
import { accountToManage, reconnectWarning } from '@/utils/channelAccounts'
import type { ChannelAccount } from '@/services/channels'

const account = (overrides: Partial<ChannelAccount> = {}): ChannelAccount => ({
  id: 'a1', channel_type: 'whatsapp', external_account_id: 'PN1',
  display_name: 'Support (+1 555)', is_active: true, ...overrides,
})

describe('reconnectWarning', () => {
  it('is silent when no account needs reconnecting', () => {
    expect(reconnectWarning([])).toBeUndefined()
    expect(reconnectWarning([account(), account({ needs_reconnect: false })])).toBeUndefined()
  })

  it('names the account that needs reconnecting', () => {
    expect(reconnectWarning([account({ needs_reconnect: true })]))
      .toBe('Access expired for Support (+1 555) — reconnect to resume replies.')
  })

  it('names only the expired ones when several are connected', () => {
    const warning = reconnectWarning([
      account({ id: 'a1', display_name: 'Sales', needs_reconnect: true }),
      account({ id: 'a2', display_name: 'Healthy' }),
      account({ id: 'a3', display_name: 'Billing', needs_reconnect: true }),
    ])
    expect(warning).toBe('Access expired for Sales, Billing — reconnect to resume replies.')
  })

  it('falls back to the platform id when the account has no name', () => {
    expect(reconnectWarning([account({ display_name: undefined, needs_reconnect: true })]))
      .toContain('Access expired for PN1')
  })
})

describe('reconnectWarning for numbers Meta would not register', () => {
  it('names the number that cannot send', () => {
    expect(reconnectWarning([account({ registration_error: 'PIN Mismatch' })]))
      .toBe("Support (+1 555) can't send replies yet — open it to see why.")
  })

  it('says both when one account expired and another cannot send', () => {
    expect(reconnectWarning([
      account({ id: 'a1', display_name: 'Sales', needs_reconnect: true }),
      account({ id: 'a2', display_name: 'Billing', registration_error: 'PIN Mismatch' }),
    ])).toBe("Access expired for Sales — reconnect to resume replies. Billing can't send replies yet — open it to see why.")
  })

  it('an expired account is named once, even if its register also failed', () => {
    expect(reconnectWarning([account({ needs_reconnect: true, registration_error: 'x' })]))
      .toBe('Access expired for Support (+1 555) — reconnect to resume replies.')
  })
})

describe('accountToManage', () => {
  it('opens a number that cannot send before a healthy one', () => {
    const unregistered = account({ id: 'a2', registration_error: 'PIN Mismatch' })
    expect(accountToManage([account({ id: 'a1' }), unregistered])).toBe(unregistered)
  })

  it('opens an expired account before one that cannot send', () => {
    const expired = account({ id: 'a3', needs_reconnect: true })
    expect(accountToManage([account({ id: 'a2', registration_error: 'x' }), expired])).toBe(expired)
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
