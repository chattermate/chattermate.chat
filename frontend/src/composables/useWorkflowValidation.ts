/*
ChatterMate - Workflow Validation Composable
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
*/

import type { Node } from '@vue-flow/core'
import { workflowCacheStorage } from '@/utils/storage'
import { ExitCondition } from '@/types/workflow'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface NodeTypeInfo {
  type: string
  label: string
  icon: string
  color: string
  description: string
}

export function useWorkflowValidation() {
  
  // Get node data with latest cache values
  const getNodeDataWithCache = (node: Node, workflowId: string) => {
    // Get cached workflow data
    const workflowCache = workflowCacheStorage.getWorkflowCache(workflowId)
    
    // Merge node data with cache data, prioritizing cache
    const nodeData = { ...node.data }
    
    if (workflowCache && workflowCache.nodes) {
      // Find this node in the cache
      const cachedNode = workflowCache.nodes.find((n: any) => n.id === node.id)
      if (cachedNode) {
        // Update name from cache
        if (cachedNode.name) nodeData.cleanName = cachedNode.name
        
        // Update config values from cache
        if (cachedNode.config) {
          Object.assign(nodeData, cachedNode.config)
          nodeData.config = cachedNode.config
        }
      }
    }
    
    return nodeData
  }

  // Validate a single node based on its type
  const validateNode = (nodeType: string, nodeData: any): string[] => {
    const errors: string[] = []
    
    switch (nodeType) {
      case 'message':
        if (!nodeData.cleanName || nodeData.cleanName.trim() === '') {
          errors.push(`${nodeType} node: Name is required`)
        }
        const messageText = nodeData.message_text || nodeData.config?.message_text
        if (!messageText || messageText.trim() === '') {
          errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}": Message text is required`)
        }
        break
      
      case 'llm':
        if (!nodeData.cleanName || nodeData.cleanName.trim() === '') {
          errors.push(`${nodeType} node: Name is required`)
        }
        const systemPrompt = nodeData.system_prompt || nodeData.config?.system_prompt
        if (!systemPrompt || systemPrompt.trim() === '') {
          errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}": System prompt is required`)
        }
        break
      
      case 'condition':
        if (!nodeData.cleanName || nodeData.cleanName.trim() === '') {
          errors.push(`${nodeType} node: Name is required`)
        }
        
        // Check for condition expression
        const conditionExpression = nodeData.condition_expression || nodeData.config?.condition_expression
        if (!conditionExpression || conditionExpression.trim() === '') {
          errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}": Condition expression is required`)
        }
        break
      
      case 'form':
        if (!nodeData.cleanName || nodeData.cleanName.trim() === '') {
          errors.push(`${nodeType} node: Name is required`)
        }
        const formFields = nodeData.form_fields || nodeData.config?.form_fields || []
        if (!formFields || formFields.length === 0) {
          errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}": At least one form field is required`)
        } else {
          for (let i = 0; i < formFields.length; i++) {
            const field = formFields[i]
            if (!field.name || field.name.trim() === '') {
              errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}" field ${i + 1}: Field name is required`)
            }
            if (!field.label || field.label.trim() === '') {
              errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}" field ${i + 1}: Display label is required`)
            }
          }
        }
        break
      
      case 'action':
        if (!nodeData.cleanName || nodeData.cleanName.trim() === '') {
          errors.push(`${nodeType} node: Name is required`)
        }
        const actionType = nodeData.action_type || nodeData.config?.action_type
        if (!actionType || actionType.trim() === '') {
          errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}": Action type is required`)
        }
        const actionUrl = nodeData.action_url || nodeData.config?.action_url
        if (!actionUrl || actionUrl.trim() === '') {
          errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}": Action URL is required`)
        }
        break
      
      case 'humanTransfer':
        if (!nodeData.cleanName || nodeData.cleanName.trim() === '') {
          errors.push(`${nodeType} node: Name is required`)
        }
        const transferDepartment = nodeData.transfer_department || nodeData.config?.transfer_department
        if (!transferDepartment || transferDepartment.trim() === '') {
          errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}": Department is required`)
        }
        break
      
      case 'wait':
        if (!nodeData.cleanName || nodeData.cleanName.trim() === '') {
          errors.push(`${nodeType} node: Name is required`)
        }
        const waitDuration = nodeData.wait_duration || nodeData.config?.wait_duration
        if (!waitDuration || waitDuration < 1) {
          errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}": Wait duration must be at least 1`)
        }
        const waitUnit = nodeData.wait_unit || nodeData.config?.wait_unit
        if (!waitUnit || waitUnit.trim() === '') {
          errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}": Time unit is required`)
        }
        break
      
      case 'landingPage':
        if (!nodeData.cleanName || nodeData.cleanName.trim() === '') {
          errors.push(`${nodeType} node: Name is required`)
        }
        const landingPageHeading = nodeData.landing_page_heading || nodeData.config?.landing_page_heading
        if (!landingPageHeading || landingPageHeading.trim() === '') {
          errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}": Heading is required`)
        }
        const landingPageContent = nodeData.landing_page_content || nodeData.config?.landing_page_content
        if (!landingPageContent || landingPageContent.trim() === '') {
          errors.push(`${nodeType} node "${nodeData.cleanName || 'Unnamed'}": Content is required`)
        }
        break
      
      case 'userInput':
        if (!nodeData.cleanName || nodeData.cleanName.trim() === '') {
          errors.push(`${nodeType} node: Name is required`)
        }
        // Removed prompt_message validation - it's now optional
        break
      
      default:
        if (!nodeData.cleanName || nodeData.cleanName.trim() === '') {
          errors.push(`${nodeType} node: Name is required`)
        }
        break
    }
    
    return errors
  }

  // Check if a node has validation errors (simplified to use validateNode)
  const hasNodeValidationErrors = (nodeType: string, nodeData: any): boolean => {
    return validateNode(nodeType, nodeData).length > 0
  }

  // Validate all nodes in a workflow and return detailed error messages
  const validateAllNodes = (nodes: Node[], workflowId: string, edges?: any[]): ValidationResult => {
    const errors: string[] = []
    
    for (const node of nodes) {
      const nodeType = node.data.nodeType
      const nodeData = getNodeDataWithCache(node, workflowId)
      const nodeErrors = validateNode(nodeType, nodeData)
      errors.push(...nodeErrors)
    }
    
    // Workflow-level validation: Check for LLM nodes with continuous execution that have outgoing connections
    if (edges) {
      for (const node of nodes) {
        if (node.data.nodeType === 'llm') {
          const nodeData = getNodeDataWithCache(node, workflowId)
          const exitCondition = nodeData.config?.exit_condition || nodeData.exit_condition
          
          if (exitCondition === ExitCondition.CONTINUOUS_EXECUTION) {
            // Check if this LLM node has any outgoing edges
            const hasOutgoingConnections = edges.some(edge => edge.source === node.id)
            
            if (hasOutgoingConnections) {
              const nodeName = nodeData.cleanName || nodeData.label || 'Unnamed LLM node'
              errors.push(`LLM node "${nodeName}" has continuous execution enabled but has outgoing connections. Continuous execution LLM nodes must be terminal nodes.`)
            }
          }
        }
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }

  // Quick check if workflow has any validation errors (without detailed messages)
  const hasWorkflowValidationErrors = (nodes: Node[], workflowId: string): boolean => {
    for (const node of nodes) {
      const nodeType = node.data.nodeType
      const nodeData = getNodeDataWithCache(node, workflowId)
      if (hasNodeValidationErrors(nodeType, nodeData)) {
        return true
      }
    }
    return false
  }

  // Apply error styling to nodes with validation errors
  const highlightNodesWithErrors = (nodes: Node[], workflowId: string, availableNodeTypes: NodeTypeInfo[]) => {
    // Update node styles to show validation errors
    nodes.forEach(node => {
      const nodeType = node.data.nodeType
      const nodeData = getNodeDataWithCache(node, workflowId)
      const hasError = hasNodeValidationErrors(nodeType, nodeData)
      
      // Update node style based on validation
      if (hasError) {
        node.style = {
          ...node.style,
          borderColor: '#EF4444',
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)'
        }
      } else {
        // Reset to original style
        const nodeTypeInfo = availableNodeTypes.find(t => t.type === node.data.nodeType)
        node.style = {
          backgroundColor: nodeTypeInfo?.color || '#6B7280',
          color: 'white',
          borderColor: nodeTypeInfo?.color || '#6B7280'
        }
      }
    })
  }

  // Reset a specific node's validation styling
  const resetNodeValidationStyle = (node: Node, availableNodeTypes: NodeTypeInfo[]) => {
    const nodeTypeInfo = availableNodeTypes.find(t => t.type === node.data.nodeType)
    node.style = {
      backgroundColor: nodeTypeInfo?.color || '#6B7280',
      color: 'white',
      borderColor: nodeTypeInfo?.color || '#6B7280'
    }
  }

  // Reset all nodes validation styling
  const resetAllNodesValidationStyle = (nodes: Node[], availableNodeTypes: NodeTypeInfo[]) => {
    nodes.forEach(node => {
      resetNodeValidationStyle(node, availableNodeTypes)
    })
  }

  return {
    validateAllNodes,
    validateNode,
    hasNodeValidationErrors,
    hasWorkflowValidationErrors,
    highlightNodesWithErrors,
    resetNodeValidationStyle,
    resetAllNodesValidationStyle,
    getNodeDataWithCache
  }
} 