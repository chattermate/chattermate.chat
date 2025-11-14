export interface CustomerInfo {
  id: string
  email: string
  full_name?: string
}

export interface Message {
  id?: number
  message?: string
  message_type: string
  created_at: string
  session_id: string
  attributes?: Record<string, any>
  user_name?: string
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
}

export interface ShopifyProductImage {
    src?: string
    alt?: string
}

export interface Conversation {
  customer: CustomerInfo
  agent: {
    id: string
    name: string
    display_name: string | null
  }
  last_message: string
  updated_at: string
  message_count: number
  session_id: string
  user_id: string | null
  status: 'open' | 'closed' | 'transferred'
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
  }
  session_id: string
  messages: Message[]
  created_at: string
  updated_at: string
  user_id: string | null
  user_name?: string | null
  group_id: string | null
  status: 'open' | 'transferred' | 'closed'
}
