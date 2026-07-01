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
import type { WorkflowNodesResponse, WorkflowNode, WorkflowConnection } from '@/types/workflow'
import { workflowCacheStorage } from '@/utils/storage'

export const workflowNodeService = {
  /**
   * Get all nodes and connections for a workflow (with cache)
   */
  async getWorkflowNodes(workflowId: string, useCache: boolean = true): Promise<WorkflowNodesResponse> {
    // Try to get from cache first if useCache is true
    if (useCache) {
      const cached = workflowCacheStorage.getWorkflowCache(workflowId)
      if (cached) {
        console.log('Using cached workflow data:', cached)
        return cached
      }
    }

    // Fetch from API
    const response = await api.get(`/workflow/${workflowId}/nodes`)
    const data = response.data

    // Store in cache
    workflowCacheStorage.setWorkflowCache(workflowId, data)
    
    return data
  },

  /**
   * Clear cache and reload from server
   */
  async refreshWorkflowNodes(workflowId: string): Promise<WorkflowNodesResponse> {
    workflowCacheStorage.clearWorkflowCache(workflowId)
    return this.getWorkflowNodes(workflowId, false)
  },

  /**
   * Create a new workflow node
   */
  async createWorkflowNode(workflowId: string, nodeData: Partial<WorkflowNode>): Promise<WorkflowNode> {
    const response = await api.post(`/workflow/${workflowId}/nodes`, nodeData)
    return response.data
  },

  /**
   * Update a workflow node
   */
  async updateWorkflowNode(workflowId: string, nodeId: string, nodeData: Partial<WorkflowNode>): Promise<WorkflowNode> {
    const response = await api.put(`/workflow/${workflowId}/nodes/${nodeId}`, nodeData)
    return response.data
  },

  /**
   * Delete a workflow node
   */
  async deleteWorkflowNode(workflowId: string, nodeId: string): Promise<void> {
    await api.delete(`/workflow/${workflowId}/nodes/${nodeId}`)
  },

  /**
   * Replace all workflow nodes and connections (complete cache replacement)
   */
  async replaceWorkflowNodes(workflowId: string, data: {
    nodes: Partial<WorkflowNode>[]
    connections: Partial<WorkflowConnection>[]
  }): Promise<WorkflowNodesResponse> {
    const response = await api.put(`/workflow/${workflowId}/nodes`, data)
    const result = response.data
    
    // Update cache with the response
    workflowCacheStorage.setWorkflowCache(workflowId, result)
    
    return result
  },

  /**
   * Filter out blank/empty values from an object
   */
  filterBlankValues(obj: any): any {
    const filtered: any = {}
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip null, undefined, empty strings, and empty arrays
      if (value !== null && value !== undefined && value !== '' && 
          !(Array.isArray(value) && value.length === 0)) {
        
        // For objects, recursively filter
        if (typeof value === 'object' && !Array.isArray(value)) {
          const filteredObj = this.filterBlankValues(value)
          // Only include if the filtered object has properties
          if (Object.keys(filteredObj).length > 0) {
            filtered[key] = filteredObj
          }
        } else {
          filtered[key] = value
        }
      }
    }
    
    return filtered
  },

  /**
   * Save entire workflow cache to backend (replaces all existing data)
   */
  async saveWorkflowCache(workflowId: string): Promise<WorkflowNodesResponse> {
    const cached = workflowCacheStorage.getWorkflowCache(workflowId)
    if (!cached) {
      throw new Error('No cached data found for workflow')
    }

    // Filter out blank values from nodes and connections
    const filteredNodes = cached.nodes.map((node: any) => this.filterBlankValues(node))
    const filteredConnections = cached.connections.map((conn: any) => this.filterBlankValues(conn))

    return this.replaceWorkflowNodes(workflowId, {
      nodes: filteredNodes,
      connections: filteredConnections
    })
  },

  /**
   * Update a single workflow node with its properties
   */
  async updateSingleNode(workflowId: string, nodeId: string, data: {
    name?: string;
    description?: string;
    position?: { x: number; y: number };
    config?: any;
    message_text?: string;
    system_prompt?: string;
    temperature?: number;
    model_id?: number;
    form_fields?: any[];
    condition_expression?: string;
    action_type?: string;
    action_config?: any;
    transfer_rules?: any;
    wait_duration?: number;
    wait_until_condition?: string;
  }): Promise<WorkflowNode> {
    const response = await api.put(`/workflow/${workflowId}/nodes/${nodeId}`, data);
    const updatedNode = response.data;
    
    // Update cache with the updated node
    workflowCacheStorage.updateNodeInCache(workflowId, updatedNode);
    
    return updatedNode;
  },

  /**
   * Create a new workflow node in cache only
   */
  createNodeInCache(workflowId: string, nodeData: any): void {
    workflowCacheStorage.updateNodeInCache(workflowId, nodeData)
  },

  /**
   * Update a node in cache only
   */
  updateNodeInCache(workflowId: string, nodeData: any): void {
    workflowCacheStorage.updateNodeInCache(workflowId, nodeData)
  },

  /**
   * Delete a node from cache only
   */
  deleteNodeFromCache(workflowId: string, nodeId: string): void {
    workflowCacheStorage.removeNodeFromCache(workflowId, nodeId)
  },

  /**
   * Add connection to cache only
   */
  addConnectionToCache(workflowId: string, connectionData: any): void {
    workflowCacheStorage.addConnectionToCache(workflowId, connectionData)
  },

  /**
   * Remove connection from cache only
   */
  removeConnectionFromCache(workflowId: string, connectionId: string): void {
    workflowCacheStorage.removeConnectionFromCache(workflowId, connectionId)
  },

  /**
   * Get a single workflow node
   */
  async getNode(workflowId: string, nodeId: string): Promise<WorkflowNode> {
    const response = await api.get(`/workflow/${workflowId}/nodes/${nodeId}`);
    return response.data;
  },

  /**
   * Create a workflow connection
   */
  async createWorkflowConnection(workflowId: string, connectionData: Partial<WorkflowConnection>): Promise<WorkflowConnection> {
    const response = await api.post(`/workflow/${workflowId}/connections`, connectionData)
    return response.data
  },

  /**
   * Update a workflow connection
   */
  async updateWorkflowConnection(workflowId: string, connectionId: string, connectionData: Partial<WorkflowConnection>): Promise<WorkflowConnection> {
    const response = await api.put(`/workflow/${workflowId}/connections/${connectionId}`, connectionData)
    return response.data
  },

  /**
   * Delete a workflow connection
   */
  async deleteWorkflowConnection(workflowId: string, connectionId: string): Promise<void> {
    await api.delete(`/workflow/${workflowId}/connections/${connectionId}`)
  }
} 