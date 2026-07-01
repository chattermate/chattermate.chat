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

import { ref, type Ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { toast } from 'vue-sonner'
import { workflowNodeService } from '@/services/workflowNode'
import { workflowService } from '@/services/workflow'
import { workflowCacheStorage } from '@/utils/storage'
import { WorkflowStatus } from '@/types/workflow'
import type { NodeTypeInfo, ValidationResult } from './useWorkflowValidation'

export interface WorkflowManagementOptions {
  workflowId: string
  selectedNode: Ref<Node | null>
  showPropertiesPanel: Ref<boolean>
  loading: Ref<boolean>
  publishLoading: Ref<boolean>
  workflowStatus: Ref<WorkflowStatus>
  nodeIdCounter: Ref<number>
  availableNodeTypes: NodeTypeInfo[]
  validateAllNodes: (nodes: Node[], workflowId: string, edges?: any[]) => ValidationResult
  highlightNodesWithErrors: (nodes: Node[], workflowId: string, availableNodeTypes: NodeTypeInfo[], edges?: any[]) => void
  resetAllNodesValidationStyle: (nodes: Node[], availableNodeTypes: NodeTypeInfo[]) => void
  getNodes: () => Node[]
  getEdges: () => Edge[]
  addNodes: (nodes: Node[]) => void
  addEdges: (edges: Edge[]) => void
  removeNodes: (nodeIds: string[]) => void
  closePropertiesPanel: () => void
}

export function useWorkflowManagement(options: WorkflowManagementOptions) {
  const {
    workflowId,
    selectedNode,
    showPropertiesPanel,
    loading,
    publishLoading,
    workflowStatus,
    nodeIdCounter,
    availableNodeTypes,
    validateAllNodes,
    highlightNodesWithErrors,
    resetAllNodesValidationStyle,
    getNodes,
    getEdges,
    addNodes,
    addEdges,
    removeNodes,
    closePropertiesPanel
  } = options

  // Map backend node types to frontend enum values
  const mapNodeTypeToFrontend = (backendType: string) => {
    const mapping = {
      'landing_page': 'landingPage',
      'message': 'message',
      'llm': 'llm',
      'condition': 'condition',
      'form': 'form',
      'action': 'action',
      'human_transfer': 'humanTransfer',
      'wait': 'wait',
      'end': 'end',
      'user_input': 'userInput',
      'guardrails': 'guardrails'
    }
    return mapping[backendType as keyof typeof mapping] || 'message'
  }

  // Map frontend node types to backend enum values
  const mapNodeTypeToBackend = (frontendType: string) => {
    const mapping = {
      'landingPage': 'landing_page',
      'message': 'message',
      'llm': 'llm',
      'condition': 'condition',
      'form': 'form',
      'action': 'action',
      'humanTransfer': 'human_transfer',
      'wait': 'wait',
      'end': 'end',
      'userInput': 'user_input',
      'guardrails': 'guardrails'
    }
    return mapping[frontendType as keyof typeof mapping] || 'message'
  }

  // Load workflow data
  const loadWorkflowData = async () => {
    try {
      loading.value = true
      
      // Clear any existing cache and load fresh from API
      workflowCacheStorage.clearWorkflowCache(workflowId)
      const data = await workflowNodeService.getWorkflowNodes(workflowId, false)

      // Convert backend nodes to Vue Flow nodes
      const nodes: Node[] = data.nodes.map((node: any) => {
        const frontendNodeType = mapNodeTypeToFrontend(node.node_type)
        const nodeType = availableNodeTypes.find(t => t.type === frontendNodeType)
        return {
          id: node.id,
          type: 'default',
          position: { x: node.position_x, y: node.position_y },
          data: {
            label: `${nodeType?.icon || '📄'} ${node.name}`,
            cleanName: node.name,
            description: node.description,
            config: node.config,
            nodeType: frontendNodeType,
            icon: nodeType?.icon || '📄',
            color: nodeType?.color || '#6B7280',
            // Store all backend properties directly in data for easy access
            message_text: node.config?.message_text,
            system_prompt: node.system_prompt,
            temperature: node.temperature,
            model_id: node.model_id,
            form_fields: node.form_fields,
            form_title: node.form_title,
            form_description: node.form_description,
            submit_button_text: node.submit_button_text,
            form_full_screen: node.form_full_screen,
            condition_expression: node.condition_expression,
            action_type: node.action_type,
            action_config: node.action_config,
            transfer_rules: node.transfer_rules,
            wait_duration: node.wait_duration,
            wait_until_condition: node.wait_until_condition,
            landing_page_heading: node.landing_page_heading,
            landing_page_content: node.landing_page_content,
            // Also spread config for backward compatibility
            ...node.config
          },
          style: {
            backgroundColor: nodeType?.color || '#6B7280',
            color: 'white',
            borderColor: nodeType?.color || '#6B7280'
          }
        }
      })

      // Convert backend connections to Vue Flow edges
      const edges: Edge[] = data.connections.map((conn: any) => ({
        id: conn.id,
        source: conn.source_node_id,
        target: conn.target_node_id,
        sourceHandle: conn.source_handle,
        targetHandle: conn.target_handle,
        label: conn.label,
        data: {
          condition: conn.condition,
          priority: conn.priority,
          metadata: conn.connection_metadata
        }
      }))

      addNodes(nodes)
      addEdges(edges)
      
      // Update counter for new nodes
      const maxCounter = nodes.reduce((max, node) => {
        const match = node.id.match(/-(\d+)$/)
        if (match) {
          return Math.max(max, parseInt(match[1]))
        }
        return max
      }, 0)
      nodeIdCounter.value = maxCounter + 1
    } catch (error: any) {
      console.error('Error loading workflow data:', error)
      
      // Don't show error toast for 404 - it means workflow exists but has no nodes yet
      if (error.response?.status !== 404) {
        toast.error('Failed to load workflow data', {
          position: 'top-center'
        })
      }
      
      if (error.response?.status === 404) {
        console.log('No nodes found for workflow - starting with empty canvas')
      }
    } finally {
      loading.value = false
    }
  }

  // Save node properties
  const saveNodeProperties = (properties: any) => {
    if (selectedNode.value) {
      // Update the node visual data (label and styling)
      const nodeType = availableNodeTypes.find(t => t.type === selectedNode.value?.data.nodeType)
      selectedNode.value.data.label = `${nodeType?.icon || '📄'} ${properties.name || selectedNode.value.data.cleanName}`
      selectedNode.value.data.cleanName = properties.name || selectedNode.value.data.cleanName
      selectedNode.value.data.description = properties.description || selectedNode.value.data.description
    }
    
    // Reset all validation styling to refresh the validation state based on latest cache data
    resetAllNodesValidationStyle(getNodes(), availableNodeTypes)
    
    // Re-validate to ensure errors are cleared if the node is now valid
    setTimeout(() => {
      const validation = validateAllNodes(getNodes(), workflowId, getEdges())
      if (!validation.isValid) {
        highlightNodesWithErrors(getNodes(), workflowId, availableNodeTypes, getEdges())
      }
    }, 100)
  }

  // Save workflow
  const saveWorkflow = async () => {
    const nodes = getNodes()
    const edges = getEdges()
    
    // Check if there are no nodes to save
    if (nodes.length === 0) {
      toast.error('Cannot save empty workflow. Please add at least one node.', {
        duration: 4000,
        closeButton: true,
        position: 'top-center'
      })
      return
    }
    
    // Check for at least one connection if multiple nodes exist
    if (nodes.length > 1 && edges.length === 0) {
      toast.error('Cannot save workflow without connections. Please connect your nodes before saving.', {
        duration: 5000,
        closeButton: true,
        position: 'top-center'
      })
      return
    }
    
    // For single node workflows, ensure it's a valid starting node type
    if (nodes.length === 1) {
      const singleNode = nodes[0]
      const validStartingNodeTypes = ['landingPage', 'message', 'llm', 'form']
      if (!validStartingNodeTypes.includes(singleNode.data.nodeType)) {
        toast.error(`Cannot save workflow with only a ${singleNode.data.nodeType} node. A workflow must start with a Landing Page, Message, LLM, or Form node.`, {
          duration: 6000,
          closeButton: true,
          position: 'top-center'
        })
        return
      }
    }
    
    // Advanced connection validation: Check for isolated nodes
    if (nodes.length > 1) {
      const connectedNodeIds = new Set<string>()
      
      edges.forEach(edge => {
        connectedNodeIds.add(edge.source)
        connectedNodeIds.add(edge.target)
      })
      
      const isolatedNodes = nodes.filter(node => !connectedNodeIds.has(node.id))
      
      if (isolatedNodes.length > 0) {
        const isolatedNodeNames = isolatedNodes.map(node => 
          node.data.cleanName || node.data.label || 'Unnamed node'
        ).join(', ')
        
        toast.error(`Cannot save workflow with isolated nodes: ${isolatedNodeNames}. Please connect all nodes before saving.`, {
          duration: 6000,
          closeButton: true,
          position: 'top-center'
        })
        return
      }
    }
    
    // Validate all nodes have required configuration
    const validation = validateAllNodes(nodes, workflowId, edges)
    if (!validation.isValid) {
      highlightNodesWithErrors(nodes, workflowId, availableNodeTypes, edges)
      toast.error('Cannot save workflow with validation errors:\n' + validation.errors.join('\n'), {
        duration: 8000,
        closeButton: true,
        position: 'top-center'
      })
      return
    }

    try {
      loading.value = true
      
      // Save entire cache to backend and get the updated data with real UUIDs
      const savedData = await workflowNodeService.saveWorkflowCache(workflowId)
      
      console.log('Workflow saved, reloading with new UUIDs:', savedData)
      
      // Close properties panel if open to avoid ID mismatch issues
      if (showPropertiesPanel.value) {
        closePropertiesPanel()
      }
      
      // Clear current nodes and edges
      removeNodes(getNodes().map(n => n.id))
      
      // Reload workflow data with new UUIDs from backend
      await loadWorkflowData()
      
      toast.success('Workflow saved successfully', {
        position: 'top-center'
      })
    } catch (error) {
      console.error('Error saving workflow:', error)
      toast.error('Failed to save workflow', {
        position: 'top-center'
      })
    } finally {
      loading.value = false
    }
  }

  // Publish workflow
  const publishWorkflow = async () => {
    try {
      publishLoading.value = true
      
      const nodes = getNodes()
      const edges = getEdges()
      
      // Validate connections before publishing
      if (nodes.length > 1 && edges.length === 0) {
        toast.error('Cannot publish workflow without connections between nodes. Please connect your nodes before publishing.', {
          duration: 5000,
          closeButton: true,
          position: 'top-center'
        })
        return
      }
      
      // For single node workflows, ensure it's a valid starting node type
      if (nodes.length === 1) {
        const singleNode = nodes[0]
        const validStartingNodeTypes = ['landingPage', 'message', 'llm', 'form']
        if (!validStartingNodeTypes.includes(singleNode.data.nodeType)) {
          toast.error(`Cannot publish workflow with only a ${singleNode.data.nodeType} node. A workflow must start with a Landing Page, Message, LLM, or Form node.`, {
            duration: 6000,
            closeButton: true,
            position: 'top-center'
          })
          return
        }
      }
      
      // Advanced connection validation: Check for isolated nodes
      if (nodes.length > 1) {
        const connectedNodeIds = new Set<string>()
        
        edges.forEach(edge => {
          connectedNodeIds.add(edge.source)
          connectedNodeIds.add(edge.target)
        })
        
        const isolatedNodes = nodes.filter(node => !connectedNodeIds.has(node.id))
        
        if (isolatedNodes.length > 0) {
          const isolatedNodeNames = isolatedNodes.map(node => 
            node.data.cleanName || node.data.label || 'Unnamed node'
          ).join(', ')
          
          toast.error(`Cannot publish workflow with isolated nodes: ${isolatedNodeNames}. Please connect all nodes before publishing.`, {
            duration: 6000,
            closeButton: true,
            position: 'top-center'
          })
          return
        }
      }
      
      // Validate before publishing
      const validation = validateAllNodes(nodes, workflowId, edges)
      if (!validation.isValid) {
        highlightNodesWithErrors(nodes, workflowId, availableNodeTypes, edges)
        toast.error('Please fix validation errors before publishing:\n' + validation.errors.join('\n'), {
          duration: 8000,
          closeButton: true,
          position: 'top-center'
        })
        return
      }
      
      // First save the workflow to ensure all changes are persisted
      await saveWorkflow()
      
      // Then publish it
      const updatedWorkflow = await workflowService.publishWorkflow(workflowId)
      workflowStatus.value = updatedWorkflow.status
      
      toast.success('Workflow published successfully! It\'s now live and ready to handle conversations.', {
        position: 'top-center'
      })
    } catch (error) {
      console.error('Error publishing workflow:', error)
      toast.error('Failed to publish workflow', {
        position: 'top-center'
      })
    } finally {
      publishLoading.value = false
    }
  }

  // Unpublish workflow
  const unpublishWorkflow = async () => {
    try {
      publishLoading.value = true
      
      const updatedWorkflow = await workflowService.unpublishWorkflow(workflowId)
      workflowStatus.value = updatedWorkflow.status
      
      toast.success('Workflow unpublished successfully! It\'s now in draft mode.', {
        position: 'top-center'
      })
    } catch (error) {
      console.error('Error unpublishing workflow:', error)
      toast.error('Failed to unpublish workflow', {
        position: 'top-center'
      })
    } finally {
      publishLoading.value = false
    }
  }

  // Handle nodes deletion
  const handleNodesDelete = (deletedNodes: Node[]) => {
    console.log('handleNodesDelete called with:', deletedNodes)
    
    // Remove deleted nodes from cache
    deletedNodes.forEach(node => {
      console.log('Deleting node from cache (handleNodesDelete):', node.id)
      workflowNodeService.deleteNodeFromCache(workflowId, node.id)
    })
    
    // Check if the currently selected node was deleted
    if (selectedNode.value && deletedNodes.some(node => node.id === selectedNode.value?.id)) {
      console.log('Selected node was deleted, closing properties panel')
      closePropertiesPanel()
      toast.success('Node deleted', {
        position: 'top-center'
      })
    }
  }

  // Handle nodes change (e.g., node added, moved, deleted)
  const handleNodesChange = (changes: any) => {
    console.log('Nodes changed:', changes)
    
    changes.forEach((change: any) => {
      switch (change.type) {
        case 'remove':
          console.log('Node removal detected:', change)
          workflowNodeService.deleteNodeFromCache(workflowId, change.id)
          
          if (selectedNode.value && selectedNode.value.id === change.id) {
            console.log('Selected node was deleted, closing properties panel')
            closePropertiesPanel()
            toast.success('Node deleted', {
              position: 'top-center'
            })
          }
          break
        
        case 'position':
          if (change.position) {
            const nodeIndex = getNodes().findIndex(n => n.id === change.id)
            if (nodeIndex !== -1) {
              const node = getNodes()[nodeIndex]
              const cacheNodeData = {
                id: node.id,
                node_type: mapNodeTypeToBackend(node.data.nodeType),
                name: node.data.cleanName || node.data.label || 'Node',
                description: node.data.description || '',
                position_x: change.position.x,
                position_y: change.position.y,
                config: node.data.config || {}
              }
              workflowNodeService.updateNodeInCache(workflowId, cacheNodeData)
            }
          }
          break
      }
    })
  }

  // Handle delete event from Vue Flow
  const handleDeleteEvent = (event: any) => {
    console.log('Vue Flow delete event:', event)
    
    const handleSingleNodeDeletion = (nodeId: string) => {
      console.log('Deleting node from cache (handleDeleteEvent):', nodeId)
      workflowNodeService.deleteNodeFromCache(workflowId, nodeId)
      
      if (selectedNode.value && selectedNode.value.id === nodeId) {
        closePropertiesPanel()
        toast.success('Node deleted', {
          position: 'top-center'
        })
      }
    }

    if (Array.isArray(event)) {
      const deletedNodes = event.filter((item: any) => item.type === 'node' || !item.type)
      deletedNodes.forEach((node: any) => handleSingleNodeDeletion(node.id))
    } else if (event.nodes) {
      event.nodes.forEach((node: any) => handleSingleNodeDeletion(node.id))
    } else if (event.id) {
      handleSingleNodeDeletion(event.id)
    }
  }

  // Handle edge changes (including deletion)
  const handleEdgesChange = (changes: any[]) => {
    console.log('Edges changed:', changes)
    
    changes.forEach((change: any) => {
      switch (change.type) {
        case 'remove':
          console.log('Edge removal detected:', change)
          workflowNodeService.removeConnectionFromCache(workflowId, change.id)
          
          toast.success('Connection deleted', {
            position: 'top-center'
          })
          break
        
        // Handle other edge change types if needed in the future
        case 'select':
          // Edge selection - no cache update needed
          break
          
        case 'add':
          // Edge addition - already handled in onConnect
          break
      }
    })
  }

  return {
    loadWorkflowData,
    saveNodeProperties,
    saveWorkflow,
    publishWorkflow,
    unpublishWorkflow,
    handleNodesDelete,
    handleNodesChange,
    handleDeleteEvent,
    handleEdgesChange,
    mapNodeTypeToFrontend,
    mapNodeTypeToBackend
  }
} 