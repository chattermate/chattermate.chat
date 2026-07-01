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

export type MCPTransportType = 'stdio' | 'sse' | 'http'

export interface MCPTool {
  id: number
  name: string
  description?: string
  transport_type: MCPTransportType
  enabled: boolean
  
  // STDIO transport fields
  command?: string
  args?: string[]
  env_vars?: Record<string, string>
  
  // SSE/HTTP transport fields
  url?: string
  headers?: Record<string, string>
  timeout?: number
  sse_read_timeout?: number
  terminate_on_close?: boolean
  
  organization_id: string
  created_at: string
  updated_at: string
}

export interface MCPToolCreate {
  name: string
  description?: string
  transport_type: MCPTransportType
  enabled: boolean
  
  // STDIO transport fields
  command?: string
  args?: string[]
  env_vars?: Record<string, string>
  
  // SSE/HTTP transport fields
  url?: string
  headers?: Record<string, string>
  timeout?: number
  sse_read_timeout?: number
  terminate_on_close?: boolean
}

export interface MCPToolUpdate {
  name?: string
  description?: string
  enabled?: boolean
  
  // STDIO transport fields
  command?: string
  args?: string[]
  env_vars?: Record<string, string>
  
  // SSE/HTTP transport fields
  url?: string
  headers?: Record<string, string>
  timeout?: number
  sse_read_timeout?: number
  terminate_on_close?: boolean
}

export interface MCPToolToAgent {
  id: number
  mcp_tool_id: number
  agent_id: string
  created_at: string
  mcp_tool: MCPTool
}

export interface AgentMCPTools {
  id: string
  name: string
  mcp_tools: MCPTool[]
} 