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
  ): Promise<KnowledgeUploadResponse> {
    try {
      let completed = 0
      const response = await api.post('/knowledge/add/urls', {
        org_id: orgId,
        agent_id: agentId,
        pdf_urls: urls.filter((url) => url.toLowerCase().endsWith('.pdf')),
        websites: urls.filter((url) => !url.toLowerCase().endsWith('.pdf')),
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

  async addSubpage(knowledgeId: number, subpageName: string, content: string) {
    const response = await api.post(`/knowledge/${knowledgeId}/subpage`, { 
      subpage_name: subpageName,
      content 
    })
    return response.data
  },
}

