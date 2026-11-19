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

import type { ChannelAccount } from '@/services/channels'

const accountName = (a: ChannelAccount) => a.display_name || a.external_account_id

/** The integration-card warning for accounts that cannot send replies, or
 *  undefined when every account is healthy: ones whose platform stopped
 *  accepting their credentials, and numbers the platform won't let send. */
export const accountWarning = (accounts: ChannelAccount[]): string | undefined => {
  const expired = accounts.filter(a => a.needs_reconnect)
  const blocked = accounts.filter(a => !a.needs_reconnect && a.send_problem)
  const warnings = [
    expired.length
      ? `Access expired for ${expired.map(accountName).join(', ')} — reconnect to resume replies.`
      : '',
    blocked.length
      ? `${blocked.map(accountName).join(', ')} can't send replies — open it to see why.`
      : '',
  ].filter(Boolean)
  return warnings.length ? warnings.join(' ') : undefined
}

/** The account a card's Manage opens: one that needs fixing first, so the
 *  card's warning leads to its fix, else the first connected. */
export const accountToManage = (accounts: ChannelAccount[]): ChannelAccount | null =>
  accounts.find(a => a.needs_reconnect)
  ?? accounts.find(a => a.send_problem)
  ?? accounts[0]
  ?? null
