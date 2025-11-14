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
  ask_for_rating: boolean
  enable_rate_limiting: boolean
  overall_limit_per_ip: number
  requests_per_sec: number
  use_workflow: boolean
  active_workflow_id: string | null
  allow_attachments: boolean
  knowledge: Array<{
    id: number
    name: string
    type: string
  }>
  customization?: AgentCustomization
  groups?: UserGroup[]
}

export type AgentResponse = Agent

// Add AgentUpdate type for update operations
export interface AgentUpdate {
  display_name?: string | null
  instructions?: string[]
  is_active?: boolean
  transfer_to_human?: boolean
  ask_for_rating?: boolean
  enable_rate_limiting?: boolean
  overall_limit_per_ip?: number
  requests_per_sec?: number
  use_workflow?: boolean
  active_workflow_id?: string | null
  allow_attachments?: boolean
  customization?: AgentCustomization
}

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

export type ChatStyle = 'CHATBOT' | 'ASK_ANYTHING'
export type WidgetPosition = 'FLOATING' | 'FIXED'

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
  chat_style?: ChatStyle
  widget_position?: WidgetPosition
  welcome_title?: string
  welcome_subtitle?: string
  chat_initiation_messages?: string[]
}

export interface AgentWithCustomization extends AgentResponse {
  customization?: AgentCustomization
}
