export interface KnowledgeUploadResponse {
  message?: string
  error?: string
  knowledge?: Array<{
    id: number
    name: string
    type: string
    status: string
  }>
}

export interface KnowledgePage {
  subpage: string
  created_at: string | null
  updated_at: string | null
}

export interface KnowledgeItem {
  id: number
  name: string
  type: string
  pages: KnowledgePage[]
  error?: string
}

export interface PaginatedKnowledgeResponse {
  knowledge: KnowledgeItem[]
  pagination: {
    page: number
    page_size: number
    total_count: number
    total_pages: number
  }
}

export interface QueueItem {
  id: number
  source: string
  source_type: string
  status: 'pending' | 'processing' | 'failed' | 'completed'
  error?: string
  created_at: string
  updated_at?: string
  processing_stage?: string
  progress_percentage?: number
}

export interface KnowledgeContentChunk {
  id: string
  content: string
  metadata?: Record<string, any>
  created_at?: string
}

export interface KnowledgeContent {
  knowledge_id: number
  source: string
  source_type: string
  chunks: KnowledgeContentChunk[]
}

