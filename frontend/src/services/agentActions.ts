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
  AgentAction, AgentActionInput, AgentActionList, AgentActionModelView,
} from '@/types/agentActions'

const base = (agentId: string) => `/agent/${agentId}/actions`

export const agentActionsService = {
  async list(agentId: string): Promise<AgentActionList> {
    const response = await api.get(base(agentId))
    return response.data
  },

  async create(agentId: string, action: AgentActionInput): Promise<AgentAction> {
    const response = await api.post(base(agentId), action)
    return response.data
  },

  async update(agentId: string, actionId: string, action: AgentActionInput): Promise<AgentAction> {
    const response = await api.put(`${base(agentId)}/${actionId}`, action)
    return response.data
  },

  async setEnabled(agentId: string, actionId: string, enabled: boolean): Promise<AgentAction> {
    const response = await api.patch(`${base(agentId)}/${actionId}`, { enabled })
    return response.data
  },

  async remove(agentId: string, actionId: string): Promise<void> {
    await api.delete(`${base(agentId)}/${actionId}`)
  },

  async modelView(agentId: string, actionId: string): Promise<AgentActionModelView> {
    const response = await api.get(`${base(agentId)}/${actionId}/model-view`)
    return response.data
  },
}
