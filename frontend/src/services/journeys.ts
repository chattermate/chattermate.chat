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
  ContextKey, Funnel, Journey, JourneyInput, JourneyStatus, JourneyTemplate, PersonJourney, StuckUser,
} from '@/types/journeys'

const base = (agentId: string) => `/agent/${agentId}/journeys`

export const journeysService = {
  async list(agentId: string): Promise<Journey[]> {
    return (await api.get(base(agentId))).data
  },
  async templates(agentId: string): Promise<JourneyTemplate[]> {
    return (await api.get(`${base(agentId)}/templates`)).data
  },
  async contextKeys(agentId: string): Promise<ContextKey[]> {
    return (await api.get(`${base(agentId)}/context-keys`)).data
  },
  async create(agentId: string, journey: JourneyInput): Promise<Journey> {
    return (await api.post(base(agentId), journey)).data
  },
  async fromTemplate(agentId: string, templateKey: string): Promise<Journey> {
    return (await api.post(`${base(agentId)}/from-template`, { template_key: templateKey })).data
  },
  async update(agentId: string, id: string, journey: JourneyInput): Promise<Journey> {
    return (await api.put(`${base(agentId)}/${id}`, journey)).data
  },
  async setStatus(agentId: string, id: string, status: JourneyStatus): Promise<Journey> {
    return (await api.patch(`${base(agentId)}/${id}/status`, { status })).data
  },
  async reorder(agentId: string, ids: string[]): Promise<Journey[]> {
    return (await api.put(`${base(agentId)}/order`, { ids })).data
  },
  async remove(agentId: string, id: string): Promise<void> {
    await api.delete(`${base(agentId)}/${id}`)
  },
  async funnel(agentId: string, id: string, days = 30): Promise<Funnel> {
    return (await api.get(`${base(agentId)}/${id}/funnel`, { params: { days } })).data
  },
  async stuckUsers(agentId: string, id: string, stepId: string): Promise<StuckUser[]> {
    return (await api.get(`${base(agentId)}/${id}/steps/${encodeURIComponent(stepId)}/users`)).data
  },
  async stuckUsersCsv(agentId: string, id: string, stepId: string): Promise<Blob> {
    const response = await api.get(`${base(agentId)}/${id}/steps/${encodeURIComponent(stepId)}/users`, {
      params: { format: 'csv' }, responseType: 'blob',
    })
    return response.data
  },
  async forPerson(customerId: string): Promise<PersonJourney[]> {
    return (await api.get(`/people/${customerId}/journeys`)).data
  },
}
