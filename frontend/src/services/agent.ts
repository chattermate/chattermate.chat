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

export const agentService = {
  async getOrganizationAgents(): Promise<Agent[]> {
    // Check if we're in a Shopify context (has shop query param or session token)
    const urlParams = new URLSearchParams(window.location.search)
    const hasShopParam = urlParams.has('shop') || urlParams.has('host')
    
    const endpoint = hasShopParam ? '/agent/list/shopify' : '/agent/list'
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
    // Check if we're in a Shopify context
    const urlParams = new URLSearchParams(window.location.search)
    const hasShopParam = urlParams.has('shop') || urlParams.has('host')
    
    const endpoint = hasShopParam ? `/agent/${agentId}/shopify` : `/agent/${agentId}`
    const response = await api.put(endpoint, data)
    // Update agent in local storage
    agentStorage.updateAgent(response.data)
    return response.data
  },

  async updateCustomization(
    agentId: string,
    customization: AgentCustomization,
  ): Promise<AgentCustomization> {
    // Check if we're in a Shopify context
    const urlParams = new URLSearchParams(window.location.search)
    const hasShopParam = urlParams.has('shop') || urlParams.has('host')
    
    const endpoint = hasShopParam ? `/agent/${agentId}/customization/shopify` : `/agent/${agentId}/customization`
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

    // Check if we're in a Shopify context
    const urlParams = new URLSearchParams(window.location.search)
    const hasShopParam = urlParams.has('shop') || urlParams.has('host')
    
    const endpoint = hasShopParam ? `/agent/${agentId}/customization/photo/shopify` : `/agent/${agentId}/customization/photo`
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
    // Check if we're in a Shopify context
    const urlParams = new URLSearchParams(window.location.search)
    const hasShopParam = urlParams.has('shop') || urlParams.has('host')
    
    const endpoint = hasShopParam ? `/agent/${agentId}/shopify` : `/agent/${agentId}`
    const response = await api.get(endpoint)
    return response.data
  },
  
  async generateInstructions(prompt: string, existingInstructions?: string[]): Promise<string[]> {
    const response = await api.post('/agent/generate-instructions', { 
        prompt,
        existing_instructions: existingInstructions 
    })
    return response.data
  }
}
