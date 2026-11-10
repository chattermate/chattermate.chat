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
import type { AgentCustomization, Agent, AgentUpdate } from '@/types/agent'
import { agentStorage } from '@/utils/storage'
import { isEmbeddedShopify } from '@/utils/shopifyEmbed'

export const agentService = {
  /**
   * Names of the org's AI agents, for the inbox filter.
   *
   * Not getOrganizationAgents: that needs manage_agents and returns each
   * agent's instructions and guardrail prompt. Filtering needs a name.
   */
  async getAgentRoster(): Promise<Array<{ id: string; name: string; display_name: string | null }>> {
    const response = await api.get('/agent/roster')
    return response.data
  },

  async getOrganizationAgents(): Promise<Agent[]> {
    const embedded = isEmbeddedShopify()
    
    const endpoint = embedded ? '/agent/list/shopify' : '/agent/list'
    const response = await api.get(endpoint)
    // Store agents in local storage
    agentStorage.setAgents(response.data)
    return response.data
  },

  async createAgent(data: {
    name: string;
    display_name: string;
    agent_type: string;
    instructions: string[];
    is_active: boolean;
    use_workflow?: boolean;
  }): Promise<Agent> {
    const response = await api.post('/agent', data)
    
    // Update agent in local storage
    const agents = agentStorage.getAgents()
    agents.push(response.data)
    agentStorage.setAgents(agents)
    
    return response.data
  },

  async updateAgent(
    agentId: string,
    data: AgentUpdate
  ): Promise<Agent> {
    const embedded = isEmbeddedShopify()
    
    const endpoint = embedded ? `/agent/${agentId}/shopify` : `/agent/${agentId}`
    const response = await api.put(endpoint, data)
    // Update agent in local storage
    agentStorage.updateAgent(response.data)
    return response.data
  },

  async updateCustomization(
    agentId: string,
    customization: AgentCustomization,
  ): Promise<AgentCustomization> {
    const embedded = isEmbeddedShopify()
    
    const endpoint = embedded ? `/agent/${agentId}/customization/shopify` : `/agent/${agentId}/customization`
    const response = await api.post(endpoint, customization)

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

    const embedded = isEmbeddedShopify()
    
    const endpoint = embedded ? `/agent/${agentId}/customization/photo/shopify` : `/agent/${agentId}/customization/photo`
    const response = await api.post(endpoint, formData, {
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
    const embedded = isEmbeddedShopify()
    
    const endpoint = embedded ? `/agent/${agentId}/shopify` : `/agent/${agentId}`
    const response = await api.get(endpoint)
    return response.data
  },
  
  /** The shipped guardrail rule with {org} filled in, shown as editable starting text. */
  async getGuardrailDefault(): Promise<string> {
    const response = await api.get('/agent/guardrail-default')
    return response.data?.prompt ?? ''
  },

  async generateInstructions(prompt: string, existingInstructions?: string[]): Promise<string[]> {
    const response = await api.post('/agent/generate-instructions', {
        prompt,
        existing_instructions: existingInstructions 
    })
    return response.data
  }
}
