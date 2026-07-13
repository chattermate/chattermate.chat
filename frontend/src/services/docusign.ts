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

export interface DocuSignTemplate {
  templateId: string
  name: string
}

export interface AgentDocuSignConfig {
  enabled: boolean
  defaultTemplateId: string | null
}

/** Check if DocuSign is connected for the current organization */
export const checkDocuSignConnection = async () => {
  try {
    const response = await api.get('/docusign/status')
    return response.data
  } catch (error) {
    console.error('Error checking DocuSign connection:', error)
    return { connected: false }
  }
}

/** The DocuSign OAuth authorization URL (org connects via redirect) */
export const getDocuSignAuthUrl = () => {
  return `${import.meta.env.VITE_API_URL}/docusign/authorize`
}

/** Disconnect the DocuSign integration */
export const disconnectDocuSign = async () => {
  const response = await api.delete('/docusign/disconnect')
  return response.data
}

/** List the templates available in the connected DocuSign account */
export const getDocuSignTemplates = async (): Promise<DocuSignTemplate[]> => {
  try {
    const response = await api.get('/docusign/templates')
    return response.data
  } catch (error) {
    console.error('Error getting DocuSign templates:', error)
    return []
  }
}

/** Read an agent's DocuSign configuration */
export const getAgentDocuSignConfig = async (agentId: string): Promise<AgentDocuSignConfig> => {
  const response = await api.get(`/docusign/agent-config/${agentId}`)
  return response.data
}

/** Save an agent's DocuSign configuration */
export const saveAgentDocuSignConfig = async (agentId: string, config: AgentDocuSignConfig) => {
  const response = await api.post(`/docusign/agent-config/${agentId}`, config)
  return response.data
}
