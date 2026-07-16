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

import api from './api'

// Types
export type ChannelType =
  | 'web'
  | 'telegram'
  | 'whatsapp'
  | 'messenger'
  | 'instagram'
  | 'slack'
  | 'email'
  | 'sms'
  | 'line'
  | 'api'

export interface SmsProviderField {
  key: string
  label: string
  secret: boolean
  optional: boolean
}

export interface SmsProviderInfo {
  name: string
  label: string
  fields: SmsProviderField[]
}

/**
 * Meta reviews every template; only APPROVED ones can be sent. The backend
 * passes Graph's value through verbatim and Meta adds statuses over time
 * (PENDING_DELETION, IN_APPEAL, FLAGGED, ...), so this list is the common set,
 * not an exhaustive one — treat any unlisted status as "cannot send".
 */
export type TemplateStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED'
  | 'PAUSED'
  | 'DISABLED'
  | (string & {})

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'

/** One piece of a template — the BODY carries the text and its {{n}} variables. */
export interface TemplateComponent {
  type: string
  text?: string
  format?: string
  [key: string]: unknown
}

export interface WhatsAppTemplate {
  id?: string
  name: string
  status?: TemplateStatus
  category?: TemplateCategory
  language?: string
  components?: TemplateComponent[]
}

export interface ChannelAccount {
  id: string
  channel_type: ChannelType
  external_account_id: string
  display_name?: string
  is_active: boolean
  agent_id?: string
  created_at?: string
  /** For email/SMS/LINE: the webhook URL to configure on the provider */
  webhook_url?: string
}

const channelsService = {
  /** All connected messaging channel accounts for the organization */
  async listAccounts(): Promise<ChannelAccount[]> {
    const response = await api.get('/channels/accounts')
    return response.data
  },

  /** Connect a Telegram bot by token; backend validates and registers the webhook */
  async connectTelegram(botToken: string): Promise<ChannelAccount> {
    const response = await api.post('/channels/telegram', { bot_token: botToken })
    return response.data
  },

  async disconnectTelegram(accountId: string): Promise<void> {
    await api.delete(`/channels/telegram/${accountId}`)
  },

  /** Connect a WhatsApp Cloud API number (manual credentials from a Meta app) */
  async connectWhatsApp(payload: {
    phone_number_id: string
    access_token: string
    waba_id?: string
  }): Promise<ChannelAccount> {
    const response = await api.post('/channels/meta/whatsapp', payload)
    return response.data
  },

  /** Connect a Facebook Page for Messenger */
  async connectMessenger(payload: { page_id: string; page_access_token: string }): Promise<ChannelAccount> {
    const response = await api.post('/channels/meta/messenger', payload)
    return response.data
  },

  /** Connect an Instagram professional account (via its linked page token) */
  async connectInstagram(payload: { ig_id: string; page_access_token: string }): Promise<ChannelAccount> {
    const response = await api.post('/channels/meta/instagram', payload)
    return response.data
  },

  /** Disconnect any Meta channel account (WhatsApp/Messenger/Instagram) */
  async disconnectMeta(accountId: string): Promise<void> {
    await api.delete(`/channels/meta/${accountId}`)
  },

  /** Templates on a WhatsApp number's Business Account, in every status */
  async listWhatsAppTemplates(accountId: string): Promise<WhatsAppTemplate[]> {
    const response = await api.get(`/channels/meta/whatsapp/${accountId}/templates`)
    return response.data
  },

  /** Submit a template to Meta for review; it cannot be sent until approved */
  async createWhatsAppTemplate(
    accountId: string,
    payload: {
      name: string
      category: TemplateCategory
      language: string
      components: TemplateComponent[]
    },
  ): Promise<WhatsAppTemplate> {
    const response = await api.post(`/channels/meta/whatsapp/${accountId}/templates`, payload)
    return response.data
  },

  async deleteWhatsAppTemplate(accountId: string, name: string): Promise<void> {
    await api.delete(`/channels/meta/whatsapp/${accountId}/templates`, { params: { name } })
  },

  /** Send an approved template to reopen a conversation whose 24h window closed */
  async sendWhatsAppTemplate(
    accountId: string,
    payload: {
      session_id: string
      template_name: string
      language?: string
      components?: TemplateComponent[]
    },
  ): Promise<{ status: string; external_message_id?: string }> {
    const response = await api.post(`/channels/meta/whatsapp/${accountId}/send-template`, payload)
    return response.data
  },

  /** Connect a support inbox. Optional SMTP fields send replies from the
   *  inbox's own domain; omit them to use the platform mail server. */
  async connectEmail(payload: {
    inbound_address: string
    display_name?: string
    smtp_host?: string
    smtp_port?: number
    smtp_username?: string
    smtp_password?: string
    from_email?: string
  }): Promise<ChannelAccount> {
    const response = await api.post('/channels/email', payload)
    return response.data
  },

  async disconnectEmail(accountId: string): Promise<void> {
    await api.delete(`/channels/email/${accountId}`)
  },

  /** Available SMS providers + the credential fields each needs */
  async listSmsProviders(): Promise<SmsProviderInfo[]> {
    const response = await api.get('/channels/sms/providers')
    return response.data
  },

  /** Connect an SMS number through a chosen provider */
  async connectSms(payload: {
    provider: string
    phone_number: string
    credentials: Record<string, string>
  }): Promise<ChannelAccount> {
    const response = await api.post('/channels/sms', payload)
    return response.data
  },

  async disconnectSms(accountId: string): Promise<void> {
    await api.delete(`/channels/sms/${accountId}`)
  },

  /** Connect a LINE Official Account */
  async connectLine(payload: { channel_secret: string; channel_access_token: string }): Promise<ChannelAccount> {
    const response = await api.post('/channels/line', payload)
    return response.data
  },

  async disconnectLine(accountId: string): Promise<void> {
    await api.delete(`/channels/line/${accountId}`)
  },

  /** Browser URL that starts the Slack OAuth install (redirects to Slack) */
  getSlackInstallUrl(): string {
    return `${import.meta.env.VITE_API_URL}/channels/slack/install`
  },

  async disconnectSlack(accountId: string): Promise<void> {
    await api.delete(`/channels/slack/${accountId}`)
  },

  /** Route a connected account to an AI agent */
  async setAccountAgent(accountId: string, agentId: string, isActive = true): Promise<ChannelAccount> {
    const response = await api.post(`/channels/agent-config/${accountId}`, {
      agent_id: agentId,
      is_active: isActive,
    })
    return response.data
  },

  async clearAccountAgent(accountId: string): Promise<void> {
    await api.delete(`/channels/agent-config/${accountId}`)
  },
}

export default channelsService
