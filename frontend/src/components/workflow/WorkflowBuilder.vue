<!--
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
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, type NodeMouseEvent } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { toast } from 'vue-sonner'
import { workflowNodeService } from '../../services/workflowNode'
import { workflowService } from '../../services/workflow'
import type { WorkflowResponse } from '@/types/workflow'
import { WorkflowStatus, ExitCondition } from '@/types/workflow'
import PropertiesPanel from './PropertiesPanel.vue'
import { workflowCacheStorage } from '@/utils/storage'
import { useWorkflowValidation, type NodeTypeInfo } from '@/composables/useWorkflowValidation'
import { useWorkflowManagement } from '@/composables/useWorkflowManagement'

// Import Vue Flow styles
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const props = defineProps<{
  workflow: WorkflowResponse
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Vue Flow setup
const { onConnect, addNodes, removeNodes, addEdges, getNodes, getEdges, vueFlowRef } = useVueFlow({
  id: 'workflow-builder',
  nodes: [],
  edges: [],
  snapToGrid: true,
  snapGrid: [20, 20],
  defaultEdgeOptions: {
    style: { strokeWidth: 2 }
  }
})

// Node types configuration - using default Vue Flow nodes for now
const nodeTypes = {}

// Initialize workflow validation composable
const {
  validateAllNodes,
  highlightNodesWithErrors,
  resetNodeValidationStyle,
  resetAllNodesValidationStyle,
  getNodeDataWithCache
} = useWorkflowValidation()

// Helper function to check if a node is an LLM with continuous execution
const isLLMNodeWithContinuousExecution = (node: Node): boolean => {
  if (node.data.nodeType !== 'llm') return false
  
  // First check the cache for the most up-to-date configuration
  const exitCondition = getLLMNodeExitCondition(node.id)
  return exitCondition === ExitCondition.CONTINUOUS_EXECUTION
}

// Helper function to get LLM node exit condition from cache or node data
const getLLMNodeExitCondition = (nodeId: string): string => {
  const workflowCache = workflowCacheStorage.getWorkflowCache(props.workflow.id)
  
  if (workflowCache && workflowCache.nodes) {
    const cachedNode = workflowCache.nodes.find((n: any) => n.id === nodeId)
    if (cachedNode && cachedNode.config?.exit_condition) {
      return cachedNode.config.exit_condition
    }
  }
  
  // Fallback to node data
  const nodes = getNodes.value
  const node = nodes.find(n => n.id === nodeId)
  return node?.data.config?.exit_condition || node?.data.exit_condition || ExitCondition.SINGLE_EXECUTION
}



// Available node types for sidebar
const availableNodeTypes: NodeTypeInfo[] = [
  {
    type: 'landingPage',
    label: 'Landing Page',
    icon: '🏠',
    description: 'Display a welcome screen with customizable heading and content',
    color: '#6366F1'
  },
  {
    type: 'message',
    label: 'Message',
    icon: '💬',
    description: 'Send a predefined message to the user',
    color: '#3B82F6'
  },
  {
    type: 'llm',
    label: 'LLM',
    icon: '🤖',
    description: 'AI model processing with configurable prompts',
    color: '#8B5CF6'
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: '🔀',
    description: 'Branch conversation based on conditions using variables',
    color: '#F59E0B'
  },
  {
    type: 'form',
    label: 'Form',
    icon: '📝',
    description: 'Collect structured data from users',
    color: '#10B981'
  },
  {
    type: 'userInput',
    label: 'User Input',
    icon: '✏️',
    description: 'Wait for user input with a custom prompt',
    color: '#06B6D4'
  },
  {
    type: 'guardrails',
    label: 'Guardrails',
    icon: '🛡️',
    description: 'Check content for PII, jailbreak attempts, and other violations',
    color: '#EC4899'
  },
  // {
  //   type: 'action',
  //   label: 'Action',
  //   icon: '⚡',
  //   description: 'Trigger external actions or API calls',
  //   color: '#EF4444'
  // },
  {
    type: 'humanTransfer',
    label: 'Human Agent',
    icon: '👤',
    description: 'Let a human agent handle the conversation',
    color: '#F97316'
  },
  // {
  //   type: 'wait',
  //   label: 'Wait',
  //   icon: '⏱️',
  //   description: 'Pause execution for time-based triggers',
  //   color: '#6B7280'
  // },
  {
    type: 'end',
    label: 'End',
    icon: '🏁',
    description: 'Terminate conversation flow',
    color: '#DC2626'
  }
]

// State management
const loading = ref(false)
const draggedType = ref<string | null>(null)
const nodeIdCounter = ref(1)
const showPropertiesPanel = ref(false)
const selectedNode = ref<Node | null>(null)
const workflowStatus = ref<WorkflowStatus>(props.workflow.status)
const publishLoading = ref(false)

// Variables state for PropertiesPanel
const availableVariables = ref<Array<{
  nodeId: string
  nodeName: string
  fieldName: string
  fieldType: string
  fieldLabel: string
}>>([])

// Watch for node changes to update available variables
watch(() => getNodes.value, (newNodes) => {
  updateAvailableVariables(newNodes)
}, { deep: true })

// Initialize workflow management composable
const {
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
} = useWorkflowManagement({
  workflowId: props.workflow.id,
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
  getNodes: () => getNodes.value,
  getEdges: () => getEdges.value,
  addNodes,
  addEdges,
  removeNodes,
  closePropertiesPanel: () => {
    showPropertiesPanel.value = false
    selectedNode.value = null
    document.body.classList.remove('workflow-properties-panel-open')
  }
})

// Helper function to generate UUID-like IDs
const generateNodeId = (type: string) => {
  return `${type}-${nodeIdCounter.value++}`
}

// Helper function to generate unique node names
const generateUniqueNodeName = (baseName: string) => {
  const nodes = getNodes.value
  const existingNames = new Set(
    nodes.map(node => node.data.cleanName?.toLowerCase() || node.data.label?.toLowerCase()).filter(Boolean)
  )
  
  // Check if base name is already unique
  if (!existingNames.has(baseName.toLowerCase())) {
    return baseName
  }
  
  // Generate unique name with suffix
  let counter = 1
  while (true) {
    const candidateName = `${baseName}_${counter.toString().padStart(3, '0')}`
    if (!existingNames.has(candidateName.toLowerCase())) {
      return candidateName
    }
    counter++
    
    // Safety check to prevent infinite loop
    if (counter > 999) {
      return `${baseName}_${Date.now()}`
    }
  }
}

// Handle node deletion
const deleteSelectedNode = () => {
  if (selectedNode.value) {
    const nodeId = selectedNode.value.id
    console.log('Deleting selected node:', nodeId)
    
    // Remove from Vue Flow first
    removeNodes([nodeId])
    
    // Remove from cache
    workflowNodeService.deleteNodeFromCache(props.workflow.id, nodeId)
    
    // Close properties panel and show success message
    showPropertiesPanel.value = false
    selectedNode.value = null
    document.body.classList.remove('workflow-properties-panel-open')
    
    toast.success('Node deleted', {
      position: 'top-center'
    })
  }
}

// Handle properties panel close
const closePropertiesPanel = () => {
  showPropertiesPanel.value = false
  selectedNode.value = null
  
  // Remove class from body to reset toast positioning
  document.body.classList.remove('workflow-properties-panel-open')
}

// Get node type display name

// Computed properties
const hasNodes = computed(() => getNodes.value.length > 0)
const isPublished = computed(() => workflowStatus.value === WorkflowStatus.PUBLISHED)
const isDraft = computed(() => workflowStatus.value === WorkflowStatus.DRAFT)
const hasValidConnections = computed(() => {
  const nodes = getNodes.value
  const edges = getEdges.value
  
  // Single node is always valid
  if (nodes.length <= 1) return true
  
  // Multiple nodes must have connections
  if (edges.length === 0) return false
  
  // Check for isolated nodes
  const connectedNodeIds = new Set<string>()
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })
  
  // All nodes must be connected
  const allNodesConnected = nodes.every(node => connectedNodeIds.has(node.id))
  if (!allNodesConnected) return false
  
  // Check condition nodes have both true and false connections
  const conditionNodes = nodes.filter(node => node.data.nodeType === 'condition')
  for (const conditionNode of conditionNodes) {
    const outgoingConnections = edges.filter(edge => edge.source === conditionNode.id)
    
    // Condition nodes must have exactly 2 outgoing connections
    if (outgoingConnections.length !== 2) return false
    
    // Must have one 'true' and one 'false' connection
    const labels = outgoingConnections.map(edge => edge.label).filter(Boolean)
    const hasTrue = labels.includes('true')
    const hasFalse = labels.includes('false')
    
    if (!hasTrue || !hasFalse) return false
  }
  
  return true
})
const canPublish = computed(() => hasNodes.value && isDraft.value && hasValidConnections.value)





// Handle node drag start
const handleDragStart = (event: DragEvent, nodeType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
  draggedType.value = nodeType
}

// Handle drop on canvas
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  const type = event.dataTransfer?.getData('application/vueflow')
  if (!type) return

  const vueFlowBounds = vueFlowRef.value?.getBoundingClientRect()
  if (!vueFlowBounds) return

  const position = {
    x: event.clientX - vueFlowBounds.left,
    y: event.clientY - vueFlowBounds.top
  }

  const nodeType = availableNodeTypes.find(t => t.type === type)
  const uniqueName = generateUniqueNodeName(nodeType?.label || 'Node')
  
  // Get default config for node type
  const getDefaultConfig = (nodeType: string) => {
    switch (nodeType) {
      case 'guardrails':
        return {
          enabled_guardrails: ['pii', 'jailbreak'],
          pii_action: 'block',
          jailbreak_sensitivity: 0.7,
          text_source: 'user_message',
          block_message: ''
        }
      default:
        return {}
    }
  }
  
  const defaultConfig = getDefaultConfig(type)
  
  const newNode: Node = {
    id: generateNodeId(type),
    type: 'default', // Use default Vue Flow node type
    position,
    data: {
      label: `${nodeType?.icon || '📄'} ${uniqueName}`, // Display with icon and unique name
      cleanName: uniqueName, // Store unique clean name for backend
      description: '',
      config: defaultConfig,
      nodeType: type, // Store the original type for later use
      icon: nodeType?.icon || '📄',
      color: nodeType?.color || '#6B7280'
    },
    style: {
      backgroundColor: nodeType?.color || '#6B7280',
      color: 'white',
      borderColor: nodeType?.color || '#6B7280'
    }
  }

  addNodes([newNode])
  
  // Add node to cache
  const cacheNodeData = {
    id: newNode.id,
    node_type: mapNodeTypeToBackend(type),
    name: uniqueName,
    description: '',
    position_x: newNode.position.x,
    position_y: newNode.position.y,
    config: defaultConfig
  }
  workflowNodeService.createNodeInCache(props.workflow.id, cacheNodeData)
  
  // Auto-connect to the last node if it exists
  autoConnectToLastNode(newNode)
  
  draggedType.value = null
}

// Auto-connect functionality
const autoConnectToLastNode = (newNode: Node) => {
  const nodes = getNodes.value
  const edges = getEdges.value
  
  if (nodes.length <= 1) return

  // Find the last node (excluding the new one) by looking for nodes that don't have outgoing connections
  // This indicates they are "leaf" nodes and likely the most recently added
  const otherNodes = nodes.filter(n => n.id !== newNode.id)
  
  // Find nodes that don't have any outgoing edges (no edges where they are the source)
  // For condition and guardrails nodes, check if they have less than 2 outgoing connections
  const nodesWithoutOutgoing = otherNodes.filter(node => {
    const outgoingConnections = edges.filter(edge => edge.source === node.id)
    if (node.data.nodeType === 'condition') {
      return outgoingConnections.length < 2 // Condition nodes can have up to 2 connections
    }
    return outgoingConnections.length === 0 // Other nodes can have only 1 connection
  })
  
  // If we have nodes without outgoing connections, use the first one found
  // If all nodes have outgoing connections, fall back to the last node in the array
  const lastNode = nodesWithoutOutgoing.length > 0 
    ? nodesWithoutOutgoing[0] 
    : otherNodes[otherNodes.length - 1]

  if (lastNode) {
    // Check if the new node already has an incoming connection
    const existingIncomingConnection = edges.find(edge => edge.target === newNode.id)
    if (existingIncomingConnection) {
      // Skip auto-connect if the new node already has an incoming connection
      return
    }
    
    // Check if the last node is an LLM with continuous execution
    if (isLLMNodeWithContinuousExecution(lastNode)) {
      toast.error('Cannot connect nodes after an LLM node with continuous execution. Continuous execution LLM nodes must be terminal nodes.', {
        position: 'top-center',
        duration: 5000,
        closeButton: true
      })
      return
    }
    
    // Determine connection label for condition nodes in auto-connect
    let autoConnectionLabel = undefined
    if (lastNode.data.nodeType === 'condition') {
      const existingOutgoingConnections = edges.filter(edge => edge.source === lastNode.id)
      const existingLabels = existingOutgoingConnections.map(edge => edge.label).filter(Boolean)
      
      // Assign true/false labels based on what's already used
      if (!existingLabels.includes('true') && !existingLabels.includes('false')) {
        // First connection - default to 'true'
        autoConnectionLabel = 'true'
      } else if (existingLabels.includes('true') && !existingLabels.includes('false')) {
        // Second connection - must be 'false'
        autoConnectionLabel = 'false'
      } else if (!existingLabels.includes('true') && existingLabels.includes('false')) {
        // Second connection - must be 'true'
        autoConnectionLabel = 'true'
      }
    }
    
    const newEdge: Edge = {
      id: `${lastNode.id}-${newNode.id}`,
      source: lastNode.id,
      target: newNode.id,
      animated: true,
      label: autoConnectionLabel,
      style: autoConnectionLabel ? { 
        stroke: autoConnectionLabel === 'true' ? '#10B981' : '#EF4444',
        strokeWidth: 2
      } : undefined
    }
    
    addEdges([newEdge])
    
    // Add connection to cache
    const cacheConnectionData = {
      id: newEdge.id,
      source_node_id: newEdge.source,
      target_node_id: newEdge.target,
      source_handle: newEdge.sourceHandle || undefined,
      target_handle: newEdge.targetHandle || undefined,
      label: autoConnectionLabel,
      condition: newEdge.data?.condition,
      priority: newEdge.data?.priority || 1,
      connection_metadata: newEdge.data?.metadata || {}
    }
    workflowNodeService.addConnectionToCache(props.workflow.id, cacheConnectionData)
  }
}

// Handle node click for editing
const handleNodeClick = (event: NodeMouseEvent) => {
  selectedNode.value = event.node
  showPropertiesPanel.value = true
  console.log('Node clicked:', event.node.id)
  
  // Add class to body to adjust toast positioning
  document.body.classList.add('workflow-properties-panel-open')
}


// Handle connection creation
onConnect((params) => {
  // Get the source and target nodes
  const nodes = getNodes.value
  const edges = getEdges.value
  const sourceNode = nodes.find(n => n.id === params.source)
  const targetNode = nodes.find(n => n.id === params.target)
  
  if (!sourceNode || !targetNode) return
  
  // Check if target node already has an incoming connection
  const existingIncomingConnection = edges.find(edge => edge.target === params.target)
  if (existingIncomingConnection) {
    toast.error('Each node can only accept one incoming connection. Please remove the existing connection first.', {
      position: 'top-center',
      duration: 5000,
      closeButton: true
    })
    return
  }
  
  // Check if source is an LLM node with continuous execution
  if (isLLMNodeWithContinuousExecution(sourceNode)) {
    toast.error('Cannot connect nodes after an LLM node with continuous execution. Continuous execution LLM nodes must be terminal nodes.', {
      position: 'top-center',
      duration: 5000,
      closeButton: true
    })
    return
  }
  
  // Check if source node already has outgoing connections (except for condition nodes which can have multiple)
  if (sourceNode.data.nodeType !== 'condition') {
    const existingOutgoingConnection = edges.find(edge => edge.source === params.source)
    if (existingOutgoingConnection) {
      toast.error('Each node can only have one outgoing connection, except condition nodes which can branch to multiple paths.', {
        position: 'top-center',
        duration: 5000,
        closeButton: true
      })
      return
    }
  } else {
    // For condition nodes, limit to maximum 2 outgoing connections (true/false branches)
    const existingOutgoingConnections = edges.filter(edge => edge.source === params.source)
    if (existingOutgoingConnections.length >= 2) {
      toast.error('Condition nodes can have maximum 2 outgoing connections (true and false branches).', {
        position: 'top-center',
        duration: 5000,
        closeButton: true
      })
      return
    }
  }
  
  // Determine connection label for condition nodes
  let connectionLabel = undefined
  if (sourceNode.data.nodeType === 'condition') {
    const existingOutgoingConnections = edges.filter(edge => edge.source === params.source)
    const existingLabels = existingOutgoingConnections.map(edge => edge.label).filter(Boolean)
    
    // Assign true/false labels based on what's already used
    if (!existingLabels.includes('true') && !existingLabels.includes('false')) {
      // First connection - default to 'true'
      connectionLabel = 'true'
    } else if (existingLabels.includes('true') && !existingLabels.includes('false')) {
      // Second connection - must be 'false'
      connectionLabel = 'false'
    } else if (!existingLabels.includes('true') && existingLabels.includes('false')) {
      // Second connection - must be 'true'
      connectionLabel = 'true'
    }
  }
  
  const newEdge: Edge = {
    ...params,
    id: `${params.source}-${params.target}`,
    animated: true,
    label: connectionLabel,
    style: connectionLabel ? { 
      stroke: connectionLabel === 'true' ? '#10B981' : '#EF4444',
      strokeWidth: 2
    } : undefined
  }
  addEdges([newEdge])
  
  // Add connection to cache
  const cacheConnectionData = {
    id: newEdge.id,
    source_node_id: newEdge.source,
    target_node_id: newEdge.target,
    source_handle: newEdge.sourceHandle || undefined,
    target_handle: newEdge.targetHandle || undefined,
    label: connectionLabel,
    condition: newEdge.data?.condition,
    priority: newEdge.data?.priority || 1,
    connection_metadata: newEdge.data?.metadata || {}
  }
  workflowNodeService.addConnectionToCache(props.workflow.id, cacheConnectionData)
})

// Close workflow builder
const closeBuilder = () => {
  // Clean up body class when closing
  document.body.classList.remove('workflow-properties-panel-open')
  emit('close')
}

// Variables methods
const updateAvailableVariables = (nodes: Node[]) => {
  const variables: Array<{
    nodeId: string
    nodeName: string
    fieldName: string
    fieldType: string
    fieldLabel: string
  }> = []
  
  // Find all form nodes and extract their field definitions
  nodes.forEach(node => {
    if (node.data.nodeType === 'form') {
      // Get form fields from cache or node data
      const nodeData = getNodeDataWithCache(node, props.workflow.id)
      const formFields = nodeData?.config?.form_fields || node.data.config?.form_fields || []
      
      formFields.forEach((field: any) => {
        if (field.name) {
          const nodeName = node.data.cleanName || node.data.label || 'Form'
          variables.push({
            nodeId: node.id,
            nodeName: nodeName,
            fieldName: `${nodeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${field.name}`,
            fieldType: field.type || 'text',
            fieldLabel: `${nodeName}: ${field.label || field.name}`
          })
        }
      })
    }
    
    // Find all user input nodes and add their input as a variable
    if (node.data.nodeType === 'userInput') {
      const nodeName = node.data.cleanName || node.data.label || 'User Input'
      variables.push({
        nodeId: node.id,
        nodeName: nodeName,
        fieldName: `${nodeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_input`,
        fieldType: 'text',
        fieldLabel: `${nodeName}: User Input`
      })
    }
  })
  
  availableVariables.value = variables
}



// Load data on mount
onMounted(() => {
  loadWorkflowData()
})

// Cleanup on unmount
onUnmounted(() => {
  // Clean up body class when component unmounts
  document.body.classList.remove('workflow-properties-panel-open')
})






</script>

<template>
  <div class="workflow-builder" :class="{ 'properties-panel-open': showPropertiesPanel }" @dragover.prevent @drop="handleDrop">
    <!-- Header -->
    <div class="builder-header">
      <div class="header-left">
        <h2 class="header-title">{{ workflow.name }}</h2>
        <span class="header-status" :class="{ 
          'status-published': isPublished, 
          'status-draft': isDraft 
        }">
          {{ isPublished ? 'Published' : 'Draft' }}
        </span>
      </div>
      <div class="header-actions">
        <button class="action-btn secondary" @click="closeBuilder">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Close
        </button>
        
        <!-- Publish/Unpublish button -->
        <button 
          v-if="isPublished" 
          class="action-btn warning" 
          @click="unpublishWorkflow" 
          :disabled="publishLoading"
        >
          <div v-if="publishLoading" class="btn-spinner"></div>
          <svg v-else class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          Unpublish
        </button>
        
        <button 
          v-else 
          class="action-btn success" 
          @click="publishWorkflow" 
          :disabled="!canPublish || publishLoading"
          :title="!hasNodes ? 'Add nodes to the workflow before publishing' : 
                  !hasValidConnections ? 'Connect all nodes and ensure condition nodes have both true and false paths before publishing' : 
                  'Publish workflow to make it live'"
        >
          <div v-if="publishLoading" class="btn-spinner"></div>
          <svg v-else class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
          Publish
        </button>
        
        <button class="action-btn primary" @click="saveWorkflow" :disabled="loading">
          <div v-if="loading" class="btn-spinner"></div>
          <svg v-else class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17,21 17,13 7,13 7,21"></polyline>
            <polyline points="7,3 7,8 15,8"></polyline>
          </svg>
          Save
        </button>
      </div>
    </div>

    <div class="builder-content">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="sidebar-header">
          <h3>Node Types</h3>
          <p>Drag nodes to canvas</p>
        </div>
        
        <div class="node-types">
          <div
            v-for="nodeType in availableNodeTypes"
            :key="nodeType.type"
            class="node-type-item"
            draggable="true"
            @dragstart="handleDragStart($event, nodeType.type)"
          >
            <div class="node-type-icon" :style="{ backgroundColor: nodeType.color }">
              {{ nodeType.icon }}
            </div>
            <div class="node-type-content">
              <h4>{{ nodeType.label }}</h4>
              <p>{{ nodeType.description }}</p>
            </div>
          </div>
        </div>
        

      </div>

      <!-- Canvas -->
      <div class="canvas-container">
        <div v-if="loading" class="canvas-loading">
          <div class="loading-spinner"></div>
          <p>Loading workflow...</p>
        </div>
        
        <VueFlow
          v-else
          :node-types="nodeTypes"
          class="workflow-canvas"
          :default-viewport="{ zoom: 1 }"
          :min-zoom="0.2"
          :max-zoom="4"
          @node-click="handleNodeClick"
          @nodes-delete="handleNodesDelete"
          @nodes-change="handleNodesChange"
          @delete="handleDeleteEvent"
          @nodes-remove="handleNodesDelete"
          @elements-remove="handleDeleteEvent"
          @edges-change="handleEdgesChange"
        >
          <Background pattern-color="#aaa" :gap="16" />
          <Controls />
          <MiniMap />
          
          <!-- Empty state -->
          <div v-if="!hasNodes" class="empty-state">
            <div class="empty-icon">🎯</div>
            <h3>Start Building Your Workflow</h3>
            <p>Drag nodes from the sidebar to create your conversation flow</p>
            <div v-if="isPublished" class="empty-state-warning">
              <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <p>This workflow is published but has no nodes. Add nodes to make it functional.</p>
            </div>
          </div>
        </VueFlow>
      </div>

      <!-- Properties Panel -->
      <PropertiesPanel
        v-if="showPropertiesPanel && selectedNode"
        :selected-node="selectedNode"
        :available-node-types="availableNodeTypes"
        :workflow-id="workflow.id"
        :agent-id="workflow.agent_id"
        :organization-id="workflow.organization_id"
        :current-edges="getEdges"
        :current-nodes="getNodes"
        :available-variables="availableVariables"
        @save="saveNodeProperties"
        @close="closePropertiesPanel"
        @delete="deleteSelectedNode"
      />
    </div>


  </div>
</template>

<style scoped>
.workflow-builder {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--background-color);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

/* Ensure toast positioning is centered and doesn't cover buttons */
.workflow-builder :deep([data-sonner-toaster]) {
  top: 80px !important;
}

.workflow-builder :deep([data-sonner-toaster][data-theme]) {
  top: 80px !important;
}

.workflow-builder :deep(.sonner-toaster) {
  top: 80px !important;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--background-soft);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.header-status {
  padding: var(--space-xs) var(--space-sm);
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.header-status.status-published {
  background: var(--success-color, #10B981);
}

.header-status.status-draft {
  background: var(--warning-color, #F59E0B);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--text-sm);
}

.action-btn.primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.action-btn.secondary {
  background: var(--background-muted);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.action-btn.secondary:hover {
  background: var(--background-alt);
  color: var(--text-color);
}

.action-btn.success {
  background: var(--success-color, #10B981);
  color: white;
}

.action-btn.success:hover:not(:disabled) {
  background: var(--success-dark, #059669);
}

.action-btn.warning {
  background: var(--warning-color, #F59E0B);
  color: white;
}

.action-btn.warning:hover:not(:disabled) {
  background: var(--warning-dark, #D97706);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.builder-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  background: var(--background-soft);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 var(--space-xs) 0;
  color: var(--text-color);
}

.sidebar-header p {
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin: 0;
}

.node-types {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
}

.node-type-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  cursor: grab;
  transition: all 0.2s ease;
  margin-bottom: var(--space-sm);
  background: var(--background-color);
  border: 1px solid var(--border-color);
}

.node-type-item:hover {
  background: var(--background-alt);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.node-type-item:active {
  cursor: grabbing;
}

.node-type-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.node-type-content {
  flex: 1;
  min-width: 0;
}

.node-type-content h4 {
  font-size: var(--text-sm);
  font-weight: 600;
  margin: 0 0 var(--space-xs) 0;
  color: var(--text-color);
}

.node-type-content p {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.3;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.canvas-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin: 0 auto var(--space-md);
}

.workflow-canvas {
  width: 100%;
  height: 100%;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-md);
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 var(--space-sm) 0;
}

.empty-state p {
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin: 0;
}

.empty-state-warning {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: var(--warning-soft, #FEF3C7);
  border: 1px solid var(--warning-color, #F59E0B);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  max-width: 400px;
}

.warning-icon {
  width: 20px;
  height: 20px;
  color: var(--warning-color, #F59E0B);
  flex-shrink: 0;
}

.empty-state-warning p {
  color: var(--warning-dark, #92400E);
  font-size: var(--text-sm);
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Vue Flow Styles */
:deep(.vue-flow__node) {
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  background: var(--background-color);
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
  min-width: 120px;
}

:deep(.vue-flow__node:hover) {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

:deep(.vue-flow__node.selected) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-soft);
}

:deep(.vue-flow__node-default) {
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  min-width: 120px;
  text-align: center;
}

:deep(.vue-flow__node-default .vue-flow__node-label) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

:deep(.vue-flow__node-default .node-icon) {
  font-size: 1.2rem;
  margin-bottom: var(--space-xs);
}

:deep(.vue-flow__node-default .node-label) {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-color);
}

:deep(.vue-flow__edge) {
  stroke: var(--border-color);
  stroke-width: 2px;
}

:deep(.vue-flow__edge.selected) {
  stroke: var(--primary-color);
}

:deep(.vue-flow__edge.animated) {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

@keyframes dashdraw {
  to {
    stroke-dashoffset: -10;
  }
}

:deep(.vue-flow__controls) {
  bottom: var(--space-md);
  left: var(--space-md);
}

:deep(.vue-flow__minimap) {
  bottom: var(--space-md);
  right: var(--space-md);
}



</style> 