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
import type {
  FaqGenerationJob,
  FaqItem,
  FaqListResponse,
  FaqStatus,
  GenerateEstimate,
  HelpCenterDomain,
  HelpCenterSettings,
  HelpCenterSettingsUpdate,
} from '@/types/faq'

function errorMessage(error: any, fallback: string): Error {
  return new Error(error.response?.data?.detail || fallback)
}

export const faqService = {
  async getFaqs(params: { status?: FaqStatus; category?: string; q?: string; page?: number; page_size?: number } = {}): Promise<FaqListResponse> {
    try {
      const response = await api.get('/help-center/faqs', { params: { page_size: 200, ...params } })
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to load FAQs')
    }
  },

  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/help-center/faqs/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data.url as string
    } catch (error: any) {
      throw errorMessage(error, 'Failed to upload image')
    }
  },

  async createFaq(payload: { question: string; answer: string; category?: string; status?: FaqStatus }): Promise<FaqItem> {
    try {
      const response = await api.post('/help-center/faqs', payload)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to create FAQ')
    }
  },

  async updateFaq(id: string, payload: Partial<Pick<FaqItem, 'question' | 'answer' | 'category' | 'status'>>): Promise<FaqItem> {
    try {
      const response = await api.put(`/help-center/faqs/${id}`, payload)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to update FAQ')
    }
  },

  async deleteFaq(id: string): Promise<void> {
    try {
      await api.delete(`/help-center/faqs/${id}`)
    } catch (error: any) {
      throw errorMessage(error, 'Failed to delete FAQ')
    }
  },

  async setStatus(ids: string[], status: FaqStatus): Promise<number> {
    try {
      const response = await api.post('/help-center/faqs/bulk-status', { faq_ids: ids, status })
      return response.data.updated
    } catch (error: any) {
      throw errorMessage(error, 'Failed to update FAQ status')
    }
  },

  async getGenerateEstimate(): Promise<GenerateEstimate> {
    try {
      const response = await api.get('/help-center/generate/estimate')
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to load generation estimate')
    }
  },

  async startGeneration(knowledgeIds?: number[]): Promise<FaqGenerationJob> {
    try {
      const response = await api.post(
        '/help-center/generate',
        knowledgeIds?.length ? { knowledge_ids: knowledgeIds } : {},
      )
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to start generation')
    }
  },

  async importFaq(url: string): Promise<FaqGenerationJob> {
    try {
      const response = await api.post('/help-center/import', { url })
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to start import')
    }
  },

  async getJob(active = true): Promise<FaqGenerationJob | null> {
    try {
      const response = await api.get('/help-center/jobs', { params: { active } })
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to load job status')
    }
  },

  async getSettings(): Promise<HelpCenterSettings> {
    try {
      const response = await api.get('/help-center/settings')
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to load help center settings')
    }
  },

  async updateSettings(payload: HelpCenterSettingsUpdate): Promise<HelpCenterSettings> {
    try {
      const response = await api.put('/help-center/settings', payload)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to save help center settings')
    }
  },

  async uploadLogo(file: File): Promise<HelpCenterSettings> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/help-center/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to upload logo')
    }
  },

  async removeLogo(): Promise<HelpCenterSettings> {
    try {
      const response = await api.delete('/help-center/logo')
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to remove logo')
    }
  },

  async setDomain(domain: string): Promise<HelpCenterDomain> {
    try {
      const response = await api.post('/help-center/domain', { domain })
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to set custom domain')
    }
  },

  async removeDomain(): Promise<HelpCenterDomain> {
    try {
      const response = await api.delete('/help-center/domain')
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to remove custom domain')
    }
  },

  async verifyDomain(): Promise<HelpCenterDomain> {
    try {
      const response = await api.post('/help-center/domain/verify')
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to verify domain')
    }
  },

  async getDomainStatus(): Promise<HelpCenterDomain> {
    try {
      const response = await api.get('/help-center/domain/status')
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to load domain status')
    }
  },
}
