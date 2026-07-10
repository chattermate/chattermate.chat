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

// A crawled sub-page, reconstructed on the client by grouping the content chunks
// of a source by their base id (the page URL/name, minus any `_N` chunk suffix).
export interface KnowledgeSubPage {
  page_id: string
  url: string
  title: string
  content: string
  word_count: number
  chunk_count: number
  updated_at: string | null
  chunk_ids: string[]
}

