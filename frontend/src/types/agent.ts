import type { UserGroup } from "./user"

export interface Agent {
  id: string // UUID
  name: string
  display_name: string | null
  description: string | null
  agent_type: string
  instructions: string[]
  is_active: boolean
  organization_id: string // UUID
  transfer_to_human: boolean
  knowledge: Array<{
    id: number
    name: string
    type: string
  }>
  customization?: AgentCustomization
  groups?: UserGroup[]
}

export type AgentResponse = Agent

export interface ChatMessage {
  id?: string
  role: 'user' | 'bot' | 'error' | 'agent'
  content: string
  isSetup?: boolean
  setupStep?: 'provider' | 'model' | 'key'
  options?: Array<{ value: string; label: string }>
  showKeyInput?: boolean
  showModelInput?: boolean
  timestamp?: Date
  attributes?: Record<string, unknown>
  agent_name?: string
  transfer_to_human?: boolean
  message_type?: string
}

export interface AgentCustomization {
  id: number
  agent_id: string // UUID
  photo_url?: string
  photo_url_signed?: string
  chat_background_color?: string
  chat_bubble_color?: string
  chat_text_color?: string
  icon_url?: string
  icon_color?: string
  accent_color?: string
  font_family?: string
  custom_css?: string
  customization_metadata?: Record<string, any>
}

export interface AgentWithCustomization extends AgentResponse {
  customization?: AgentCustomization
}
