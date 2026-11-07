import type { ApiClient } from './client'
import type { Schemas } from './types'

/** A connected account (ChannelAccountOut); webhook_url is set for SMS and email. */
export type ChannelAccount = Schemas['ChannelAccountOut']

async function connect(api: ApiClient, path: string, data: Record<string, unknown>): Promise<ChannelAccount> {
  const account = await api.post<ChannelAccount>(path, { data })
  return { ...account, id: String(account.id) }
}

/** Connects a Telegram bot (the backend checks the token with getMe and registers its webhook). */
export function connectTelegram(api: ApiClient, botToken: string): Promise<ChannelAccount> {
  return connect(api, '/channels/telegram', { bot_token: botToken })
}

/** Manual WhatsApp Cloud API connect: a phone number id and a system-user token, plus the
 *  app secret, which a token from the customer's own Meta app can't connect without. */
export function connectWhatsApp(api: ApiClient, phoneNumberId: string, accessToken: string, appSecret?: string): Promise<ChannelAccount> {
  return connect(api, '/channels/meta/whatsapp', { phone_number_id: phoneNumberId, access_token: accessToken, app_secret: appSecret })
}

export function connectMessenger(api: ApiClient, pageId: string, pageAccessToken: string, appSecret?: string): Promise<ChannelAccount> {
  return connect(api, '/channels/meta/messenger', { page_id: pageId, page_access_token: pageAccessToken, app_secret: appSecret })
}

export function connectInstagram(api: ApiClient, igId: string, pageAccessToken: string): Promise<ChannelAccount> {
  return connect(api, '/channels/meta/instagram', { ig_id: igId, page_access_token: pageAccessToken })
}

export function connectLine(api: ApiClient, channelSecret: string, channelAccessToken: string): Promise<ChannelAccount> {
  return connect(api, '/channels/line', { channel_secret: channelSecret, channel_access_token: channelAccessToken })
}

/** An email inbox that receives mail through the provider's inbound-parse webhook; replies use platform SMTP. */
export function connectEmail(api: ApiClient, inboundAddress: string): Promise<ChannelAccount> {
  return connect(api, '/channels/email', { inbound_address: inboundAddress })
}

export function connectSms(
  api: ApiClient,
  provider: 'twilio' | 'plivo',
  phoneNumber: string,
  credentials: Record<string, string>,
): Promise<ChannelAccount> {
  return connect(api, '/channels/sms', { provider, phone_number: phoneNumber, credentials })
}

/**
 * Slack connects only through OAuth: /install hands out a state, Slack sends the
 * browser back to /callback with a code, and the backend trades the code for a
 * bot token and stores the workspace. The callback answers with a redirect, not
 * the account — find it afterwards with listChannelAccounts.
 */
export async function installSlack(api: ApiClient, code: string): Promise<void> {
  const install = await api.raw('GET', '/channels/slack/install', { maxRedirects: 0 })
  const state = new URL(install.headers().location ?? 'about:blank').searchParams.get('state')
  if (!state) throw new Error(`Slack install → ${install.status()}: no state in the redirect`)
  const callback = await api.raw('GET', '/channels/slack/callback', { params: { code, state }, maxRedirects: 0 })
  const location = callback.headers().location ?? ''
  if (!location.includes('status=success')) throw new Error(`Slack callback → ${location || callback.status()}`)
}

export async function listChannelAccounts(api: ApiClient): Promise<ChannelAccount[]> {
  const accounts = await api.get<ChannelAccount[]>('/channels/accounts')
  return accounts.map((a) => ({ ...a, id: String(a.id) }))
}

/** Routes a connected channel account's conversations to an AI agent. */
export async function routeToAgent(api: ApiClient, accountId: string, agentId: string): Promise<void> {
  await api.post(`/channels/agent-config/${accountId}`, { data: { agent_id: agentId, is_active: true } })
}
