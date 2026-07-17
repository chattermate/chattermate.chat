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
  DbConnector,
  DbConnectorPayload,
  DbConnectorTable,
  InvestigationDetail,
  InvestigationRun,
  RcaDocument,
  Ticket,
  TicketActivity,
  TicketCreatePayload,
  TicketDetail,
  TicketListResponse,
  TicketProposal,
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

  async investigate(
    id: string,
    options: { run_type?: 'triage' | 'investigation'; context_note?: string } = {},
  ): Promise<InvestigationRun> {
    try {
      const response = await api.post(`/tickets/${id}/investigate`, options)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to start the AI run')
    }
  },

  async getInvestigation(id: string): Promise<InvestigationDetail> {
    try {
      const response = await api.get(`/tickets/${id}/investigation`)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to load the investigation')
    }
  },

  async updateRca(
    id: string,
    patch: { customer_summary?: string; mark_reviewed?: boolean },
  ): Promise<RcaDocument> {
    try {
      const response = await api.patch(`/tickets/${id}/rca`, patch)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to save the RCA')
    }
  },

  async sendRcaToCustomer(id: string): Promise<TicketActivity> {
    try {
      const response = await api.post(`/tickets/${id}/rca/send-customer`)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to send the summary to the customer')
    }
  },

  async approveProposal(id: string): Promise<TicketProposal> {
    try {
      const response = await api.post(`/tickets/${id}/proposal/approve`)
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to approve the proposal')
    }
  },

  async rejectProposal(
    id: string,
    reason?: string,
    reinvestigate = false,
  ): Promise<TicketProposal> {
    try {
      const response = await api.post(`/tickets/${id}/proposal/reject`, {
        reason,
        reinvestigate,
      })
      return response.data
    } catch (error: any) {
      throw errorMessage(error, 'Failed to reject the proposal')
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

export const dbConnectorService = {
  async list(): Promise<DbConnector[]> {
    const response = await api.get('/ticket-db-connectors')
    return response.data
  },

  async discover(
    payload: DbConnectorPayload,
  ): Promise<{ ok: boolean; error?: string; tables: DbConnectorTable[] }> {
    const response = await api.post('/ticket-db-connectors/discover', payload)
    return response.data
  },

  async create(payload: DbConnectorPayload): Promise<DbConnector> {
    const response = await api.post('/ticket-db-connectors', payload)
    return response.data
  },

  async update(id: string, patch: Partial<DbConnectorPayload>): Promise<DbConnector> {
    const response = await api.patch(`/ticket-db-connectors/${id}`, patch)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/ticket-db-connectors/${id}`)
  },

  async test(id: string): Promise<{ ok: boolean; error?: string; tables: DbConnectorTable[] }> {
    const response = await api.post(`/ticket-db-connectors/${id}/test`)
    return response.data
  },
}
