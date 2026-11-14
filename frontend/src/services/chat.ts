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
import type { Conversation, ChatDetail, InboxCounts, InboxSort, InboxViewKey } from '@/types/chat'
import { isEmbeddedShopify } from '@/utils/shopifyEmbed'
import emitter from '@/utils/emitter'

interface ChatParams {
  skip?: number
  limit?: number
  agent_id?: string
  status?: 'open' | 'closed' | 'transferred' | string
  user_id?: string
  customer_email?: string
  date_from?: string
  date_to?: string
  view?: InboxViewKey
  channel?: string
  /** Customer name, email or phone */
  q?: string
  sort?: InboxSort
  /** Where "today" starts for resolved_by_ai: the viewer's local midnight */
  today_start?: string
}

/** The viewer's local midnight, as the server compares "resolved today" to it. */
export function localDayStart(now = new Date()): string {
  const midnight = new Date(now)
  midnight.setHours(0, 0, 0, 0)
  return midnight.toISOString()
}

let inboxCountsInFlight: Promise<InboxCounts> | null = null

export const chatService = {
  async getRecentChats(params?: ChatParams) {
    const embedded = isEmbeddedShopify()
    
    const endpoint = embedded ? '/chats/recent/shopify' : '/chats/recent'
    const response = await api.get(endpoint, { params })
    return response.data as Conversation[]
  },

  /**
   * Each inbox view's size: the nav badges and the inbox's view list. Callers
   * at the same moment (both refresh on 'inbox-changed') share one request,
   * and every answer is broadcast ('inbox-counts') so the badge can use the
   * inbox's instead of asking again.
   */
  getInboxCounts(): Promise<InboxCounts> {
    inboxCountsInFlight ??= api
      .get<InboxCounts>('/chats/counts', { params: { today_start: localDayStart() } })
      .then((response) => {
        emitter.emit('inbox-counts', response.data)
        return response.data
      })
      .finally(() => { inboxCountsInFlight = null })
    return inboxCountsInFlight
  },

  async getChatDetail(sessionId: string) {
    const embedded = isEmbeddedShopify()
    
    const endpoint = embedded ? `/chats/${sessionId}/shopify` : `/chats/${sessionId}`
    const response = await api.get<ChatDetail>(endpoint)
    return response.data
  },

  async takeoverChat(sessionId: string): Promise<void> {
    const response = await api.post(`/sessions/${sessionId}/takeover`)
    emitter.emit('inbox-changed')
    return response.data
  },

  /** Stop the AI on this chat and queue it for the team, without claiming it. */
  async routeToHuman(sessionId: string): Promise<ChatDetail> {
    const response = await api.post(`/sessions/${sessionId}/route-to-human`)
    emitter.emit('inbox-changed')
    return response.data as ChatDetail
  },

  /** Give the chat back to the AI: nobody holds it and it leaves the queue. */
  async releaseToAi(sessionId: string): Promise<ChatDetail> {
    const response = await api.post(`/sessions/${sessionId}/release`)
    emitter.emit('inbox-changed')
    return response.data as ChatDetail
  },

  async reassignChat(sessionId: string, toUserId: string) {
    const response = await api.post(`/sessions/${sessionId}/reassign`, null, { params: { to_user_id: toUserId } })
    emitter.emit('inbox-changed')
    return response.data as ChatDetail
  }
} 