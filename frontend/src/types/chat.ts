export interface CustomerInfo {
  id: string
  email: string
  full_name?: string
}

export interface Message {
  message: string
  message_type: string
  timestamp: string
  session_id: string
  attributes?: Record<string, any>
  user_name?: string
  agent_name?: string
}

export interface Conversation {
  customer: CustomerInfo
  agent_id: string
  agent_name: string
  last_message: string
  updated_at: string
  message_count: number
  session_id: string
  user_id: string
}

export interface ChatDetail {
  customer: CustomerInfo
  agent_id: string
  agent_name: string
  session_id: string
  messages: Message[]
  created_at: string
  updated_at: string
  user_id: string | null
  user_name?: string
  group_id: string
  status: 'open' | 'transferred' | 'closed'
}
