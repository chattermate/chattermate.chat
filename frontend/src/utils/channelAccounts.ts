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

/** Copy shown wherever an account has no agent: inbound messages wait for the team, unanswered by the AI. */
export const NO_AGENT_TEXT = "No agent: messages wait in your inbox."

/** Connected accounts no AI agent answers. */
export const accountsWithoutAgent = (accounts: ChannelAccount[]): ChannelAccount[] =>
  accounts.filter(a => !a.agent_id)

/** The card's warning for accounts no agent answers, naming them when the
 *  card holds several, or undefined when every account has one. */
export const noAgentWarning = (accounts: ChannelAccount[]): string | undefined => {
  const missing = accountsWithoutAgent(accounts)
  if (!missing.length) return undefined
  if (accounts.length === 1) return NO_AGENT_TEXT
  return `No agent on ${missing.map(accountName).join(', ')}: messages wait in your inbox.`
}

/** The account a card's Manage opens: one that needs fixing first, so the
 *  card's warning leads to its fix (credentials, then sending, then a missing
 *  agent), else the first connected. */
export const accountToManage = (accounts: ChannelAccount[]): ChannelAccount | null =>
  accounts.find(a => a.needs_reconnect)
  ?? accounts.find(a => a.send_problem)
  ?? accounts.find(a => !a.agent_id)
  ?? accounts[0]
  ?? null

/** The card's line of connected account names: all of them up to `shown`,
 *  else the first few and how many more ("Sales, Support and 5 more"). */
export const accountNamesSummary = (accounts: ChannelAccount[], shown = 2): string => {
  const names = accounts.map(a => a.display_name).filter(Boolean) as string[]
  if (names.length <= shown + 1) return names.join(', ')
  return `${names.slice(0, shown).join(', ')} and ${names.length - shown} more`
}

export interface NumberLimitState {
  /** "1 of 2 numbers on your plan", or "2 numbers connected" with no limit */
  usage: string
  /** Connected as many as the plan allows */
  atLimit: boolean
  /** "Your plan includes 2 WhatsApp numbers." (only meaningful at a limit) */
  limitText: string
}

/** How a channel's connected count reads against the plan's limit (null = none). */
export const numberLimitState = (connected: number, limit: number | null): NumberLimitState => {
  const plural = (n: number) => (n === 1 ? 'number' : 'numbers')
  if (limit === null) {
    return { usage: `${connected} ${plural(connected)} connected`, atLimit: false, limitText: '' }
  }
  // Past the limit after a downgrade: every number keeps working, none can be added
  const usage = connected > limit
    ? `${connected} ${plural(connected)} connected · your plan includes ${limit}`
    : `${connected} of ${limit} ${plural(limit)} on your plan`
  return {
    usage,
    atLimit: connected >= limit,
    limitText: `Your plan includes ${limit} WhatsApp ${plural(limit)}.`,
  }
}
