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

/**
 * Check if Jira is connected for the current organization
 */
export const checkJiraConnection = async () => {
  try {
    const response = await api.get('/jira/status')
    return response.data
  } catch (error) {
    console.error('Error checking Jira connection:', error)
    return { connected: false }
  }
}

/**
 * Get the Jira authorization URL
 */
export const getJiraAuthUrl = () => {
  return `${import.meta.env.VITE_API_URL}/jira/authorize`
}

/**
 * Disconnect Jira integration
 */
export const disconnectJira = async () => {
  try {
    const response = await api.delete('/jira/disconnect')
    return response.data
  } catch (error) {
    console.error('Error disconnecting Jira:', error)
    throw error
  }
}

/**
 * Get Jira projects
 */
export const getJiraProjects = async () => {
  try {
    const response = await api.get('/jira/projects')
    return response.data
  } catch (error) {
    console.error('Error getting Jira projects:', error)
    throw error
  }
}

/**
 * Get Jira issue types for a project
 */
export const getJiraIssueTypes = async (projectKey: string) => {
  try {
    const response = await api.get(`/jira/projects/${projectKey}/issue-types`)
    return response.data
  } catch (error) {
    console.error('Error getting Jira issue types:', error)
    throw error
  }
}

/**
 * Save agent-to-Jira configuration
 */
export const saveAgentJiraConfig = async (agentId: string, config: {
  enabled: boolean;
  projectKey?: string;
  issueTypeId?: string;
}) => {
  try {
    const response = await api.post(`/jira/agent-config/${agentId}`, config)
    return response.data
  } catch (error) {
    console.error('Error saving agent Jira config:', error)
    throw error
  }
}

/**
 * Get agent-to-Jira configuration
 */
export const getAgentJiraConfig = async (agentId: string) => {
  try {
    const response = await api.get(`/jira/agent-config/${agentId}`)
    return response.data
  } catch (error) {
    console.error('Error getting agent Jira config:', error)
    return { enabled: false }
  }
}

/**
 * Create a Jira ticket
 */
export const createJiraTicket = async (data: {
  projectKey: string;
  issueTypeId: string;
  summary: string;
  description: string;
  priority?: string;
  chatId?: string;
}) => {
  try {
    const response = await api.post('/jira/issues', data)
    return response.data
  } catch (error) {
    console.error('Error creating Jira ticket:', error)
    throw error
  }
}

/**
 * Get Jira priorities
 */
export const getJiraPriorities = async () => {
  try {
    const response = await api.get('/jira/priorities')
    return response.data
  } catch (error) {
    console.error('Error getting Jira priorities:', error)
    throw error
  }
}

/**
 * Check if priority field is available for a project and issue type
 */
export const checkPriorityAvailability = async (projectKey: string, issueTypeId: string) => {
  try {
    const response = await api.get(`/jira/projects/${projectKey}/issue-types/${issueTypeId}/has-priority`)
    return response.data.hasPriority
  } catch (error) {
    console.error('Error checking priority availability:', error)
    return false
  }
} 