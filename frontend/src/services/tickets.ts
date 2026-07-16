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
  InvestigationRun,
  Ticket,
  TicketActivity,
  TicketCreatePayload,
  TicketDetail,
  TicketListResponse,
  TicketSettings,
  TicketStats,
  TicketUpdatePayload,
} from '@/types/ticket'

function errorMessage(error: any, fallback: string): Error {
  return new Error(error.response?.data?.detail || fallback)
}

export const ticketService = {
  async listTickets(params: {
    status?: string
    priority?: string
    assignee_id?: string
    unassigned?: boolean
    ai_state?: string
    search?: string
    sort?: string
    page?: number
    page_size?: number
  } = {}): Promise<TicketListResponse> {
    try {
      const response = await api.get('/tickets', { params })
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to load tickets')
    }
  },

  async getStats(): Promise<TicketStats> {
    try {
      const response = await api.get('/tickets/stats')
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to load ticket stats')
    }
  },

  async getTicket(id: string): Promise<TicketDetail> {
    try {
      const response = await api.get(`/tickets/${id}`)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to load the ticket')
    }
  },

  async createTicket(payload: TicketCreatePayload): Promise<TicketDetail> {
    try {
      const response = await api.post('/tickets', payload)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to create the ticket')
    }
  },

  async updateTicket(id: string, patch: TicketUpdatePayload): Promise<Ticket> {
    try {
      const response = await api.patch(`/tickets/${id}`, patch)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to update the ticket')
    }
  },

  async addComment(id: string, body: string, isInternal = true): Promise<TicketActivity> {
    try {
      const response = await api.post(`/tickets/${id}/comments`, {
        body,
        is_internal: isInternal,
      })
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to post the comment')
    }
  },

  async resolveTicket(
    id: string,
    payload: { outcome?: string; resolution_summary?: string; customer_message?: string } = {},
  ): Promise<Ticket> {
    try {
      const response = await api.post(`/tickets/${id}/resolve`, { outcome: 'fixed', ...payload })
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to resolve the ticket')
    }
  },

  async reopenTicket(id: string, reason?: string): Promise<Ticket> {
    try {
      const response = await api.post(`/tickets/${id}/reopen`, { reason })
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to reopen the ticket')
    }
  },

  async investigate(id: string): Promise<InvestigationRun> {
    try {
      const response = await api.post(`/tickets/${id}/investigate`)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to start the AI run')
    }
  },

  async getTicketBySession(sessionId: string): Promise<Ticket | null> {
    try {
      const response = await api.get(`/tickets/by-session/${sessionId}`)
      return response.data || null
    } catch {
      // 403 (plan gate) or transient errors — the inbox card just hides.
      return null
    }
  },

  async draftFromSession(sessionId: string): Promise<{ title: string; description: string }> {
    try {
      const response = await api.get(`/tickets/draft-from-session/${sessionId}`)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to draft from the conversation')
    }
  },

  async getSettings(): Promise<TicketSettings> {
    try {
      const response = await api.get('/tickets/settings')
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to load ticketing settings')
    }
  },

  async updateSettings(patch: Partial<TicketSettings>): Promise<TicketSettings> {
    try {
      const response = await api.put('/tickets/settings', patch)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to save ticketing settings')
    }
  },
}
