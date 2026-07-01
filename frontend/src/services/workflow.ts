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
import type { WorkflowCreate, WorkflowResponse } from '@/types/workflow'
import { WorkflowStatus } from '@/types/workflow'

export const workflowService = {
  async createWorkflow(data: WorkflowCreate): Promise<WorkflowResponse> {
    const response = await api.post('/workflow', data)
    return response.data
  },

  async getWorkflowByAgent(agentId: string): Promise<WorkflowResponse | null> {
    try {
      const response = await api.get(`/workflow/agent/${agentId}`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  async updateWorkflow(workflowId: string, data: Partial<WorkflowCreate>): Promise<WorkflowResponse> {
    const response = await api.put(`/workflow/${workflowId}`, data)
    return response.data
  },

  async deleteWorkflow(workflowId: string): Promise<void> {
    await api.delete(`/workflow/${workflowId}`)
  },

  async publishWorkflow(workflowId: string): Promise<WorkflowResponse> {
    const response = await api.put(`/workflow/${workflowId}`, { status: WorkflowStatus.PUBLISHED })
    return response.data
  },

  async unpublishWorkflow(workflowId: string): Promise<WorkflowResponse> {
    const response = await api.put(`/workflow/${workflowId}`, { status: WorkflowStatus.DRAFT })
    return response.data
  }
} 