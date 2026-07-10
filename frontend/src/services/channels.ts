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

export interface ChannelAccount {
  id: string
  channel_type: ChannelType
  external_account_id: string
  display_name?: string
  is_active: boolean
  agent_id?: string
  created_at?: string
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
