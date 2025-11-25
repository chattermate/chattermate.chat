import api from './api'

// Types
export interface SlackConnectionStatus {
  connected: boolean
  team_id?: string
  team_name?: string
  bot_user_id?: string
}

export interface SlackChannel {
  id: string
  name: string
  is_private: boolean
  is_member: boolean
  num_members?: number
}

export type StorageMode = 'FULL_CONTENT' | 'METADATA_ONLY' | 'EMBEDDINGS_ONLY'

export interface SlackWorkspaceConfig {
  id: number
  organization_id: string
  team_id: string
  allowed_channel_ids: string[]
  storage_mode: StorageMode
  default_agent_id?: string
  created_at: string
  updated_at: string
}

export interface AgentSlackConfig {
  id: number
  organization_id: string
  team_id: string
  agent_id: string
  channel_id: string
  channel_name: string
  enabled: boolean
  respond_to_mentions: boolean
  respond_to_reactions: boolean
  respond_to_commands: boolean
  reaction_emoji: string
  created_at: string
  updated_at: string
}

export interface AgentSlackConfigCreate {
  channel_id: string
  channel_name: string
  enabled?: boolean
  respond_to_mentions?: boolean
  respond_to_reactions?: boolean
  respond_to_commands?: boolean
  reaction_emoji?: string
}

export interface AgentSlackConfigUpdate {
  enabled?: boolean
  respond_to_mentions?: boolean
  respond_to_reactions?: boolean
  respond_to_commands?: boolean
  reaction_emoji?: string
}

export interface SlackWorkspaceConfigUpdate {
  allowed_channel_ids?: string[]
  storage_mode?: StorageMode
  default_agent_id?: string
}

/**
 * Check if Slack is connected for the current organization
 */
export const checkSlackConnection = async (): Promise<SlackConnectionStatus> => {
  try {
    const response = await api.get('/slack/status')
    return response.data
  } catch (error) {
    console.error('Error checking Slack connection:', error)
    return { connected: false }
  }
}

/**
 * Get the Slack authorization URL
 */
export const getSlackAuthUrl = () => {
  return `${import.meta.env.VITE_API_URL}/slack/authorize`
}

/**
 * Disconnect Slack integration
 */
export const disconnectSlack = async () => {
  try {
    const response = await api.delete('/slack/disconnect')
    return response.data
  } catch (error) {
    console.error('Error disconnecting Slack:', error)
    throw error
  }
}

/**
 * Get Slack channels the bot is a member of
 */
export const getSlackChannels = async (): Promise<SlackChannel[]> => {
  try {
    const response = await api.get('/slack/channels')
    return response.data
  } catch (error) {
    console.error('Error getting Slack channels:', error)
    throw error
  }
}

/**
 * Get workspace configuration
 */
export const getSlackWorkspaceConfig = async (): Promise<SlackWorkspaceConfig> => {
  try {
    const response = await api.get('/slack/workspace-config')
    return response.data
  } catch (error) {
    console.error('Error getting Slack workspace config:', error)
    throw error
  }
}

/**
 * Update workspace configuration
 */
export const updateSlackWorkspaceConfig = async (
  config: SlackWorkspaceConfigUpdate
): Promise<SlackWorkspaceConfig> => {
  try {
    const response = await api.put('/slack/workspace-config', config)
    return response.data
  } catch (error) {
    console.error('Error updating Slack workspace config:', error)
    throw error
  }
}

/**
 * Get agent's Slack channel configurations
 */
export const getAgentSlackConfig = async (agentId: string): Promise<AgentSlackConfig[]> => {
  try {
    const response = await api.get(`/slack/agent-config/${agentId}`)
    return response.data
  } catch (error) {
    console.error('Error getting agent Slack config:', error)
    return []
  }
}

/**
 * Create a new agent-to-channel configuration
 */
export const createAgentSlackConfig = async (
  agentId: string,
  config: AgentSlackConfigCreate
): Promise<AgentSlackConfig> => {
  try {
    const response = await api.post(`/slack/agent-config/${agentId}`, config)
    return response.data
  } catch (error) {
    console.error('Error creating agent Slack config:', error)
    throw error
  }
}

/**
 * Update an agent's Slack channel configuration
 */
export const updateAgentSlackConfig = async (
  agentId: string,
  configId: number,
  config: AgentSlackConfigUpdate
): Promise<AgentSlackConfig> => {
  try {
    const response = await api.put(`/slack/agent-config/${agentId}/${configId}`, config)
    return response.data
  } catch (error) {
    console.error('Error updating agent Slack config:', error)
    throw error
  }
}

/**
 * Delete an agent's Slack channel configuration
 */
export const deleteAgentSlackConfig = async (
  agentId: string,
  channelId: string
): Promise<void> => {
  try {
    await api.delete(`/slack/agent-config/${agentId}/${channelId}`)
  } catch (error) {
    console.error('Error deleting agent Slack config:', error)
    throw error
  }
}
