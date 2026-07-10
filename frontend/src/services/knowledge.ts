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
import type { KnowledgeUploadResponse, PaginatedKnowledgeResponse } from '@/types/knowledge'

export const knowledgeService = {
  async uploadPdfFiles(
    files: File[],
    orgId: string,
    agentId?: string,
    onProgress?: (progress: number) => void,
  ): Promise<KnowledgeUploadResponse> {
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      formData.append('org_id', orgId.toString())
      if (agentId) {
        formData.append('agent_id', agentId.toString())
      }

      const response = await api.post('/knowledge/upload/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      })

      return response.data
    } catch (error: any) {
      // Extract error message from response if available
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         'Failed to upload PDFs'
      throw new Error(errorMessage)
    }
  },

  async addUrls(
    orgId: string,
    urls: string[],
    agentId?: string,
    onProgress?: (progress: number) => void,
    maxLinks?: number,
  ): Promise<KnowledgeUploadResponse> {
    try {
      let completed = 0
      const response = await api.post('/knowledge/add/urls', {
        org_id: orgId,
        agent_id: agentId,
        pdf_urls: urls.filter((url) => url.toLowerCase().endsWith('.pdf')),
        websites: urls.filter((url) => !url.toLowerCase().endsWith('.pdf')),
        // Optional crawl-scope cap for websites (e.g. 1 = "this page only").
        ...(maxLinks ? { max_links: maxLinks } : {}),
      })
      if (onProgress) {
        const interval = setInterval(() => {
          completed += 10
          onProgress(Math.min(completed, 100))
          if (completed >= 100) clearInterval(interval)
        }, 500)
      }
      return response.data
    } catch (error: any) {
      // Extract error message from response if available
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         'Failed to add URLs'
      throw new Error(errorMessage)
    }
  },

  async getKnowledgeByOrganization(orgId: string, page: number = 1, pageSize: number = 10) {
    const response = await api.get(`/knowledge/organization/${orgId}`, {
      params: { page, page_size: pageSize },
    })
    return response.data
  },

  async linkToAgent(knowledgeId: number, agentId: string) {
    const response = await api.post('/knowledge/link', null, {
      params: { knowledge_id: knowledgeId, agent_id: agentId },
    })
    return response.data
  },

  async unlinkFromAgent(knowledgeId: number, agentId: string) {
    const response = await api.delete('/knowledge/unlink', {
      params: { knowledge_id: knowledgeId, agent_id: agentId },
    })
    return response.data
  },

  async getKnowledgeByAgent(
    agentId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedKnowledgeResponse> {
    try {
      const response = await api.get(`/knowledge/agent/${agentId}`, {
        params: {
          page,
          page_size: pageSize,
        },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch knowledge:', error)
      throw error
    }
  },

  async deleteKnowledge(knowledgeId: number): Promise<unknown> {
    const response = await api.delete(`/knowledge/${knowledgeId}`)
    return response.data
  },

  async getAgentQueueItems(agentId: string) {
    const response = await api.get(`/knowledge/queue/agent/${agentId}`)
    return response.data
  },

  async getOrgQueueItems(orgId: string) {
    const response = await api.get(`/knowledge/queue/organization/${orgId}`)
    return response.data
  },

  async deleteQueueItem(queueId: number) {
    const response = await api.delete(`/knowledge/queue/${queueId}`)
    return response.data
  },

  async getKnowledgeContent(knowledgeId: number) {
    const response = await api.get(`/knowledge/${knowledgeId}/content`)
    return response.data
  },

  async updateChunkContent(knowledgeId: number, chunkId: string, content: string) {
    // Don't encode chunkId here - axios will handle it
    const response = await api.put(`/knowledge/${knowledgeId}/chunk/${encodeURIComponent(chunkId)}`, { content })
    return response.data
  },

  async deleteChunk(knowledgeId: number, chunkId: string) {
    const response = await api.delete(`/knowledge/${knowledgeId}/chunk/${chunkId}`)
    return response.data
  },

  async addSubpage(knowledgeId: number, subpageName: string, content: string, url?: string) {
    const response = await api.post(`/knowledge/${knowledgeId}/subpage`, {
      subpage_name: subpageName,
      content,
      ...(url ? { url } : {}),
    })
    return response.data
  },

  // Replace a whole sub-page's content and re-embed it. `pageId` is the page's
  // base id (its URL/name) — encoded for the backend `:path` route param.
  async updatePage(knowledgeId: number, pageId: string, content: string, title?: string) {
    const response = await api.put(
      `/knowledge/${knowledgeId}/page/${encodeURIComponent(pageId)}`,
      { content, title },
    )
    return response.data
  },

  // Delete an entire sub-page (all of its chunks) from a knowledge source.
  async deletePage(knowledgeId: number, pageId: string) {
    const response = await api.delete(
      `/knowledge/${knowledgeId}/page/${encodeURIComponent(pageId)}`,
    )
    return response.data
  },

  // Create a knowledge source from pasted text; indexed immediately (no crawl).
  async addText(orgId: string, title: string, content: string, agentId?: string) {
    try {
      const response = await api.post('/knowledge/add/text', {
        org_id: orgId,
        title,
        content,
        agent_id: agentId,
      })
      return response.data
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.response?.data?.message || 'Failed to add text source'
      throw new Error(errorMessage)
    }
  },
}

