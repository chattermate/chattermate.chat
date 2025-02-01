import api from './api'
import type { AgentCustomization, Agent } from '@/types/agent'
import { agentStorage } from '@/utils/storage'

export const agentService = {
  async getOrganizationAgents(): Promise<Agent[]> {
    const response = await api.get('/agent/list')
    // Store agents in local storage
    agentStorage.setAgents(response.data)
    return response.data
  },

  async updateAgent(
    agentId: string,
    data: {
      display_name?: string | null
      instructions?: string[]
      is_active?: boolean,
      transfer_to_human?: boolean,
      customization?: AgentCustomization
    },
  ): Promise<Agent> {
    const response = await api.put(`/agent/${agentId}`, data)
    // Update agent in local storage
    agentStorage.updateAgent(response.data)
    return response.data
  },

  async updateCustomization(
    agentId: string,
    customization: AgentCustomization,
  ): Promise<AgentCustomization> {
    const response = await api.post(`/agent/${agentId}/customization`, customization)

    // Update agent customization in local storage
    const agents = agentStorage.getAgents()
    const agent = agents.find((a) => a.id === agentId)
    if (agent) {
      agent.customization = response.data
      agentStorage.updateAgent(agent)

      // Update active agent if it's the same one
      const activeAgent = agentStorage.getActiveAgent()
      if (activeAgent && activeAgent.id === agentId) {
        agentStorage.setActiveAgent(agent)
      }
    }

    return response.data
  },

  async uploadAgentPhoto(agentId: string, file: File): Promise<AgentCustomization> {
    const formData = new FormData()
    formData.append('photo', file)

    const response = await api.post(`/agent/${agentId}/customization/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Update agent customization in local storage
    const agents = agentStorage.getAgents()
    const agent = agents.find((a) => a.id === agentId)
    if (agent) {
      agent.customization = response.data
      agentStorage.updateAgent(agent)

      // Update active agent if it's the same one
      const activeAgent = agentStorage.getActiveAgent()
      if (activeAgent && activeAgent.id === agentId) {
        agentStorage.setActiveAgent(agent)
      }
    }

    return response.data
  },

  async updateAgentGroups(agentId: string, groupIds: string[]): Promise<Agent> {
    const response = await api.put(`/agent/${agentId}/groups`, groupIds)
    return response.data
  },

  async getAgentById(agentId: string): Promise<Agent> {
    const response = await api.get(`/agent/${agentId}`)
    return response.data
  },
}
