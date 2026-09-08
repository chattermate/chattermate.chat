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
import type { MCPTool, MCPToolCreate, MCPToolReferences, MCPToolTestResult, MCPTransportType } from '@/types/mcp'
import { DEFAULT_MCP_TIMEOUT, clampMCPTimeout } from '@/utils/mcp'
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
  const deleteReferences = ref<MCPToolReferences | null>(null)
  // Which tool the form is editing, or null when it is creating one.
  const editingToolId = ref<number | null>(null)

  // Form state for creating MCP tools
  const createForm = reactive<MCPToolCreate>({
    name: '',
    description: '',
    usage_guidance: '',
    transport_type: 'stdio' as MCPTransportType,
    enabled: true,
    command: '',
    args: [],
    env_vars: {},
    url: '',
    headers: {},
    timeout: DEFAULT_MCP_TIMEOUT,
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

  // Load an existing tool into the shared form. Secret values arrive masked;
  // leaving them alone keeps the stored credential.
  const startEdit = (tool: MCPTool) => {
    Object.assign(createForm, {
      name: tool.name,
      description: tool.description || '',
      usage_guidance: tool.usage_guidance || '',
      transport_type: tool.transport_type,
      enabled: tool.enabled,
      command: tool.command || '',
      args: [...(tool.args || [])],
      env_vars: { ...(tool.env_vars || {}) },
      url: tool.url || '',
      headers: { ...(tool.headers || {}) },
      timeout: tool.timeout ?? DEFAULT_MCP_TIMEOUT,
      sse_read_timeout: tool.sse_read_timeout ?? 60,
      terminate_on_close: tool.terminate_on_close ?? true
    })
    editingToolId.value = tool.id
    showCreateModal.value = true
  }

  // Create a new MCP tool, or save the one being edited
  const saveMCPTool = async () => {
    const isEditing = editingToolId.value !== null
    try {
      const payload = { ...createForm, timeout: clampMCPTimeout(createForm.timeout) }

      if (isEditing) {
        await mcpService.updateMCPTool(editingToolId.value as number, payload)
      } else {
        const newTool = await mcpService.createMCPTool(payload)
        // Add to agent immediately
        await mcpService.addMCPToolToAgent(newTool.id, agentId)
      }

      // Refresh agent tools
      await fetchAgentMCPTools()

      // Reset form and close modal
      resetCreateForm()
      showCreateModal.value = false
      editingToolId.value = null

      toast.success(isEditing ? 'MCP tool updated successfully' : 'MCP tool created and linked successfully')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail
        || (isEditing ? 'Failed to update MCP tool' : 'Failed to create MCP tool')
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

  // Connection test results, per tool id. A tool that saves fine can still be
  // dead at runtime (missing npx, bad key, unreachable server) — the Test
  // button surfaces that instead of a silent 0-tool run.
  const testResults = ref<Record<number, MCPToolTestResult>>({})
  const testingToolId = ref<number | null>(null)

  const testMCPTool = async (toolId: number) => {
    testingToolId.value = toolId
    try {
      testResults.value = { ...testResults.value, [toolId]: await mcpService.testMCPTool(toolId) }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to test MCP tool'
      testResults.value = { ...testResults.value, [toolId]: { success: false, functions: [], error: errorMessage } }
    } finally {
      testingToolId.value = null
    }
  }

  // Apply preset to form
  const applyPreset = (preset: typeof mcpPresets[0]) => {
    Object.assign(createForm, {
      ...preset,
      // Presets describe themselves for humans; that copy must never become
      // prompt text the AI treats as a description of the real source.
      usage_guidance: '',
      enabled: true
    })
  }

  // Reset create form
  const resetCreateForm = () => {
    editingToolId.value = null
    Object.assign(createForm, {
      name: '',
      description: '',
      usage_guidance: '',
      transport_type: 'stdio' as MCPTransportType,
      enabled: true,
      command: '',
      args: [],
      env_vars: {},
      url: '',
      headers: {},
      timeout: DEFAULT_MCP_TIMEOUT,
      sse_read_timeout: 60,
      terminate_on_close: true
    })
  }

  // Confirm delete. This destroys the connector for the whole organization,
  // so the dialog first asks what else points at it.
  const confirmDelete = async (toolId: number) => {
    deleteTargetId.value = toolId
    deleteReferences.value = null
    showDeleteConfirm.value = true
    try {
      deleteReferences.value = await mcpService.getMCPToolReferences(toolId)
    } catch {
      // Non-fatal — confirm without the reference list rather than blocking.
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    deleteTargetId.value = null
    deleteReferences.value = null
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
    deleteReferences,
    editingToolId,
    createForm,
    transportTypes,
    mcpPresets,

    // Methods
    fetchAgentMCPTools,
    fetchAvailableMCPTools,
    saveMCPTool,
    startEdit,
    linkMCPTool,
    unlinkMCPTool,
    deleteMCPTool,
    testMCPTool,
    testResults,
    testingToolId,
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