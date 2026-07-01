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
import type { MCPTool, MCPToolCreate, MCPToolUpdate, MCPToolToAgent, AgentMCPTools } from '@/types/mcp'

export const mcpService = {
  // MCP Tool management
  async getOrganizationMCPTools(enabledOnly: boolean = true): Promise<MCPTool[]> {
    const response = await api.get('/mcp-tools', {
      params: { enabled_only: enabledOnly }
    })
    return response.data
  },

  async getMCPTool(toolId: number): Promise<MCPTool> {
    const response = await api.get(`/mcp-tools/${toolId}`)
    return response.data
  },

  async createMCPTool(data: MCPToolCreate): Promise<MCPTool> {
    const response = await api.post('/mcp-tools', data)
    return response.data
  },

  async updateMCPTool(toolId: number, data: MCPToolUpdate): Promise<MCPTool> {
    const response = await api.put(`/mcp-tools/${toolId}`, data)
    return response.data
  },

  async deleteMCPTool(toolId: number): Promise<void> {
    await api.delete(`/mcp-tools/${toolId}`)
  },

  // Agent-MCP Tool associations
  async getAgentMCPTools(agentId: string): Promise<AgentMCPTools> {
    const response = await api.get(`/mcp-tools/agent/${agentId}`)
    return response.data
  },

  async addMCPToolToAgent(mcpToolId: number, agentId: string): Promise<MCPToolToAgent> {
    const response = await api.post('/mcp-tools/agent-association', {
      mcp_tool_id: mcpToolId,
      agent_id: agentId
    })
    return response.data
  },

  async removeMCPToolFromAgent(mcpToolId: number, agentId: string): Promise<void> {
    await api.delete(`/mcp-tools/agent-association/${mcpToolId}/${agentId}`)
  }
} 