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

export interface CustomerInfo {
  id: string
  email: string
  full_name?: string
  // Integrator-supplied fields (e.g. student_name, center_name) set via
  // POST /generate-token's `custom_data`.
  meta_data?: Record<string, unknown>
  phone?: string | null
}

export interface Message {
  id?: number
  message?: string
  message_type: string
  created_at: string
  session_id: string
  // Live replies are revealed client-side with a typewriter effect.
  stream?: boolean
  attributes?: Record<string, any>
  // Set on a message sent from the inbox until the backend reports its id
  client_id?: string
  // Channel messages: the platform's id and its latest delivery receipt
  external_message_id?: string | null
  channel_status?: 'sent' | 'delivered' | 'read' | 'failed' | null
  /** Who on the team wrote it (agent messages) */
  user_id?: string | null
  user_name?: string | null
  agent_name?: string
  end_chat?: boolean
  end_chat_reason?: string
  end_chat_description?: string
  attachments?: Array<{
    id: number
    filename: string
    file_url: string
    content_type: string
    file_size: number
  }>
  
  // Updated shopify_output to match Conversation structure
  shopify_output?: {
    products: Array<{
      id: string
      title: string
      price: string
      image?: ShopifyProductImage // Reuse existing ShopifyProductImage type
    }>
  }

  // Knowledge-base citations used to ground this message (rendered as source chips)
  // url/title/description: a crawled page's link, for the redesign's link chips and card
  sources?: Array<{ name: string; type: string; url?: string; title?: string; description?: string }>
}

export interface ShopifyProductImage {
    src?: string
    alt?: string
}

/** Each inbox view's size in the caller's scope (GET /chats/counts). */
export interface InboxCounts {
  open: number
  waiting_for_human: number
  assigned_to_me: number
  ai_handling: number
  negative: number
  resolved_by_ai_today: number
  /** Open conversations per channel ('web', 'whatsapp', ...) */
  channels: Record<string, number>
}

/** The inbox's saved views (backend app/repositories/inbox_views.py). */
export type InboxViewKey = 'mine' | 'waiting' | 'open' | 'ai' | 'resolved_by_ai' | 'closed' | 'negative'

export type InboxSort = 'newest' | 'waiting_longest'

export type SentimentLabel = 'positive' | 'neutral' | 'negative'

/** Why a conversation was handed to the team (TransferReasonType). */
export type TransferReason =
  | 'UNABLE_TO_ANSWER' | 'NEED_MORE_INFO' | 'KNOWLEDGE_GAP' | 'NEED_TO_CALL'
  | 'NEED_TO_EMAIL' | 'NEED_TO_MEET' | 'FRUSTRATED' | 'REPEAT_INSTRUCTIONS'
  | 'DIRECT_REQUEST' | 'HIGH_PRIORITY_ISSUE' | 'COMPLIANCE_ISSUE'

export interface Conversation {
  customer: CustomerInfo
  agent: {
    id: string
    name: string
    display_name: string | null
    /** False when this agent never answers with AI — its chats wait for a person. */
    ai_replies_enabled?: boolean
  }
  last_message: string | null
  updated_at: string
  message_count: number
  session_id: string
  user_id: string | null
  /** Human agent holding the chat; absent while the AI still has it. */
  user_name?: string | null
  group_id?: string | null
  status: 'open' | 'closed' | 'transferred'
  channel?: string
  /** When it last moved to the team's queue: how long it has waited */
  handed_over_at?: string | null
  /** A short AI-written title, once the chat has closed */
  title?: string | null
  sentiment_label?: SentimentLabel | null
  attributes?: {
    message_type?: string
    shopify_output?: {
      products: Array<{
        id: string
        title: string
        price: string
        image?: {
          src: string
          alt?: string
        }
      }>
    }
  }
}

export interface ChatDetail {
  customer: CustomerInfo
  agent: {
    id: string
    name: string
    display_name: string | null
    /** False when this agent never answers with AI — its chats wait for a person. */
    ai_replies_enabled?: boolean
  }
  session_id: string
  messages: Message[]
  created_at: string
  updated_at: string
  user_id: string | null
  user_name?: string | null
  group_id: string | null
  status: 'open' | 'transferred' | 'closed'
  channel?: string
  /** The connected account this conversation arrived on; absent for web chats. */
  channel_account_id?: string | null
  /** The handover: when, why, and the AI's summary for whoever picks it up */
  handed_over_at?: string | null
  transfer_reason?: TransferReason | string | null
  transfer_description?: string | null
  sentiment_label?: SentimentLabel | null
  title?: string | null
}
