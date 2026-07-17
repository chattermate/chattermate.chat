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

/**
 * Whether the WhatsApp connect UI can offer Embedded Signup. Everything but
 * `enabled` is null when it can't — a self-hoster has no ChatterMate Meta app
 * to onboard under, and the plan check stays on the server.
 */
export interface EmbeddedSignupConfig {
  enabled: boolean
  config_id: string | null
  app_id: string | null
  graph_version: string
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

  /**
   * The WhatsApp numbers an outbound conversation can be sent FROM.
   *
   * Both entry points want this exact question answered, and each was asking
   * it by fetching the whole account list and applying the same filter. It
   * resolves to [] rather than throwing: a surface that cannot list accounts
   * should hide its entry point, not break the page around it.
   */
  async listActiveWhatsAppAccounts(): Promise<ChannelAccount[]> {
    try {
      const accounts = await this.listAccounts()
      return accounts.filter(
        (account) => account.channel_type === 'whatsapp' && account.is_active,
      )
    } catch {
      return []
    }
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

  /** Whether to offer Embedded Signup, and the ids the Meta SDK needs */
  async getEmbeddedSignupConfig(): Promise<EmbeddedSignupConfig> {
    const response = await api.get('/channels/meta/embedded-signup-config')
    return response.data
  },

  /** Finish an Embedded Signup: the backend trades the code for the token */
  async connectWhatsAppEmbeddedSignup(payload: {
    code: string
    waba_id: string
    phone_number_id: string
  }): Promise<ChannelAccount> {
    const response = await api.post('/channels/meta/whatsapp/embedded-signup', payload)
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

  /**
   * Where to write a template: Meta's Template Library, deep-linked to this
   * number's Business Account. Templates are authored there, not here — Meta's
   * library holds ~150 pre-written, pre-localised templates shaped to pass its
   * own review, which a form of ours could only ever approximate badly.
   */
  async getWhatsAppTemplateLibraryUrl(accountId: string): Promise<string> {
    const response = await api.get(`/channels/meta/whatsapp/${accountId}/template-library`)
    return response.data.url
  },

  /**
   * Start a WhatsApp conversation with a phone number via an approved
   * Utility/Authentication template. Returns the session to open in the
   * inbox; a reply lands there and the AI answers with the template as
   * context. customer_id links to a person picked from People.
   */
  async startWhatsAppConversation(
    accountId: string,
    payload: {
      to: string
      template_name: string
      language?: string
      components?: TemplateComponent[]
      customer_id?: string
      customer_name?: string
    },
  ): Promise<{ session_id: string }> {
    const response = await api.post(`/channels/meta/whatsapp/${accountId}/conversations`, payload)
    return response.data
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
