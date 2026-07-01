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

import { ref, reactive } from 'vue'
import { mcpService } from '@/services/mcp'
import type { MCPTool, MCPToolCreate, MCPToolUpdate, MCPTransportType } from '@/types/mcp'
import { toast } from 'vue-sonner'

export function useMCPTools(agentId: string) {
  // State
  const agentMCPTools = ref<MCPTool[]>([])
  const availableMCPTools = ref<MCPTool[]>([])
  const isLoading = ref(false)
  const isLoadingAvailable = ref(false)
  const error = ref<string | null>(null)
  const showCreateModal = ref(false)
  const showLinkModal = ref(false)
  const showDeleteConfirm = ref(false)
  const deleteTargetId = ref<number | null>(null)

  // Form state for creating MCP tools
  const createForm = reactive<MCPToolCreate>({
    name: '',
    description: '',
    transport_type: 'stdio' as MCPTransportType,
    enabled: true,
    command: '',
    args: [],
    env_vars: {},
    url: '',
    headers: {},
    timeout: 30,
    sse_read_timeout: 60,
    terminate_on_close: true
  })

  // Transport type options
  const transportTypes = [
    { value: 'stdio', label: 'STDIO', description: 'Standard input/output communication' },
    { value: 'sse', label: 'Server-Sent Events', description: 'HTTP streaming communication' },
    { value: 'http', label: 'HTTP', description: 'Request/response communication' }
  ]

  // Common MCP tool presets
  const mcpPresets = [
    {
      name: 'File System',
      description: 'Access and manage files and directories',
      transport_type: 'stdio' as MCPTransportType,
      command: 'npx',
      args: ['-y','@modelcontextprotocol/server-filesystem'],
      env_vars: { ALLOWED_DIRECTORIES: '/path/to/allowed/directory' }
    },
    {
      name: 'Weather',
      description: 'Get weather information',
      transport_type: 'stdio' as MCPTransportType,
      command: 'uvx',
      args: ["--from", "git+https://github.com/adhikasp/mcp-weather.git", "mcp-weather"],
      env_vars: { ACCUWEATHER_API_KEY: 'your-api-key' }
    }
  ]

  // Fetch agent's MCP tools
  const fetchAgentMCPTools = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await mcpService.getAgentMCPTools(agentId)
      agentMCPTools.value = response.mcp_tools
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch MCP tools'
      console.error('Error fetching agent MCP tools:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Fetch available MCP tools for linking
  const fetchAvailableMCPTools = async () => {
    isLoadingAvailable.value = true
    
    try {
      const tools = await mcpService.getOrganizationMCPTools(true)
      availableMCPTools.value = tools
    } catch (err: any) {
      console.error('Error fetching available MCP tools:', err)
      toast.error('Failed to fetch available MCP tools')
    } finally {
      isLoadingAvailable.value = false
    }
  }

  // Create a new MCP tool
  const createMCPTool = async () => {
    try {
      const newTool = await mcpService.createMCPTool(createForm)
      
      // Add to agent immediately
      await mcpService.addMCPToolToAgent(newTool.id, agentId)
      
      // Refresh agent tools
      await fetchAgentMCPTools()
      
      // Reset form and close modal
      resetCreateForm()
      showCreateModal.value = false
      
      toast.success('MCP tool created and linked successfully')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create MCP tool'
      toast.error(errorMessage)
      throw err
    }
  }

  // Link existing MCP tool to agent
  const linkMCPTool = async (toolId: number) => {
    try {
      await mcpService.addMCPToolToAgent(toolId, agentId)
      await fetchAgentMCPTools()
      toast.success('MCP tool linked successfully')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to link MCP tool'
      toast.error(errorMessage)
    }
  }

  // Unlink MCP tool from agent
  const unlinkMCPTool = async (toolId: number) => {
    try {
      await mcpService.removeMCPToolFromAgent(toolId, agentId)
      await fetchAgentMCPTools()
      toast.success('MCP tool unlinked successfully')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to unlink MCP tool'
      toast.error(errorMessage)
    }
  }

  // Delete MCP tool
  const deleteMCPTool = async () => {
    if (!deleteTargetId.value) return
    
    try {
      await mcpService.deleteMCPTool(deleteTargetId.value)
      await fetchAgentMCPTools()
      cancelDelete()
      toast.success('MCP tool deleted successfully')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete MCP tool'
      toast.error(errorMessage)
    }
  }

  // Apply preset to form
  const applyPreset = (preset: typeof mcpPresets[0]) => {
    Object.assign(createForm, {
      ...preset,
      enabled: true
    })
  }

  // Reset create form
  const resetCreateForm = () => {
    Object.assign(createForm, {
      name: '',
      description: '',
      transport_type: 'stdio' as MCPTransportType,
      enabled: true,
      command: '',
      args: [],
      env_vars: {},
      url: '',
      headers: {},
      timeout: 30,
      sse_read_timeout: 60,
      terminate_on_close: true
    })
  }

  // Confirm delete
  const confirmDelete = (toolId: number) => {
    deleteTargetId.value = toolId
    showDeleteConfirm.value = true
  }

  // Cancel delete
  const cancelDelete = () => {
    deleteTargetId.value = null
    showDeleteConfirm.value = false
  }

  // Add argument to args array
  const addArg = (arg: string) => {
    if (arg.trim()) {
      createForm.args = [...(createForm.args || []), arg.trim()]
    }
  }

  // Remove argument from args array
  const removeArg = (index: number) => {
    createForm.args = createForm.args?.filter((_, i) => i !== index) || []
  }

  // Add environment variable
  const addEnvVar = (key: string, value: string) => {
    if (key.trim() && value.trim()) {
      createForm.env_vars = {
        ...createForm.env_vars,
        [key.trim()]: value.trim()
      }
    }
  }

  // Remove environment variable
  const removeEnvVar = (key: string) => {
    const newEnvVars = { ...createForm.env_vars }
    delete newEnvVars[key]
    createForm.env_vars = newEnvVars
  }

  // Add header
  const addHeader = (key: string, value: string) => {
    if (key.trim() && value.trim()) {
      createForm.headers = {
        ...createForm.headers,
        [key.trim()]: value.trim()
      }
    }
  }

  // Remove header
  const removeHeader = (key: string) => {
    const newHeaders = { ...createForm.headers }
    delete newHeaders[key]
    createForm.headers = newHeaders
  }

  // Check if tool is linked to agent
  const isToolLinked = (toolId: number): boolean => {
    return agentMCPTools.value.some(tool => tool.id === toolId)
  }

  // Get transport type display info
  const getTransportTypeInfo = (type: MCPTransportType) => {
    return transportTypes.find(t => t.value === type) || transportTypes[0]
  }

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    // State
    agentMCPTools,
    availableMCPTools,
    isLoading,
    isLoadingAvailable,
    error,
    showCreateModal,
    showLinkModal,
    showDeleteConfirm,
    createForm,
    transportTypes,
    mcpPresets,

    // Methods
    fetchAgentMCPTools,
    fetchAvailableMCPTools,
    createMCPTool,
    linkMCPTool,
    unlinkMCPTool,
    deleteMCPTool,
    applyPreset,
    resetCreateForm,
    confirmDelete,
    cancelDelete,
    addArg,
    removeArg,
    addEnvVar,
    removeEnvVar,
    addHeader,
    removeHeader,
    isToolLinked,
    getTransportTypeInfo,
    formatDate
  }
} 