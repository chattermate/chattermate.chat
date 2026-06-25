<!--
ChatterMate - Workflow Properties Panel
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
-->

<script setup lang="ts">
import { ref, watch, computed, type Ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { workflowNodeService } from '@/services/workflowNode'
import { workflowCacheStorage } from '@/utils/storage'
import LLMNodeConfig from '@/components/workflow/nodes/LLMNodeConfig.vue'
import FormNodeConfig from '@/components/workflow/nodes/FormNodeConfig.vue'
import WaitNodeConfig from '@/components/workflow/nodes/WaitNodeConfig.vue'
import HumanTransferNodeConfig from '@/components/workflow/nodes/HumanTransferNodeConfig.vue'
import LandingPageNodeConfig from '@/components/workflow/nodes/LandingPageNodeConfig.vue'
import EndNodeConfig from '@/components/workflow/nodes/EndNodeConfig.vue'
import ActionNodeConfig from '@/components/workflow/nodes/ActionNodeConfig.vue'
import MessageNodeConfig from '@/components/workflow/nodes/MessageNodeConfig.vue'
import ConditionNodeConfig from '@/components/workflow/nodes/ConditionNodeConfig.vue'
import UserInputNodeConfig from '@/components/workflow/nodes/UserInputNodeConfig.vue'
import GuardrailsNodeConfig from '@/components/workflow/nodes/GuardrailsNodeConfig.vue'
import { ExitCondition } from '@/types/workflow'
import { listGroups } from '@/services/groups'
import type { UserGroup } from '@/types/user'
import { toast } from 'vue-sonner'

// Collapsible sections state
const collapsedSections = ref({
  basic: false,
  nodeSettings: false,
  advanced: true, // Advanced settings collapsed by default
  knowledge: true, // Knowledge sources collapsed by default
  variables: false // Variables expanded by default
})

// Define form field interface
interface FormField {
  name: string
  label: string
  type: string
  required: boolean
  placeholder: string
  options: string | string[]
  minLength: number
  maxLength: number
}

const props = defineProps<{
  selectedNode: Node
  availableNodeTypes: Array<{
    type: string
    label: string
    icon: string
    description: string
    color: string
  }>
  workflowId: string
  agentId: string
  organizationId: string
  currentEdges: Edge[] | Ref<Edge[]>
  currentNodes: Node[] | Ref<Node[]>
  availableVariables: Array<{
    nodeId: string
    nodeName: string
    fieldName: string
    fieldType: string
    fieldLabel: string
  }>
}>()

const emit = defineEmits<{
  (e: 'save', properties: any): void
  (e: 'close'): void
  (e: 'delete'): void
}>()



const nodeForm = ref({
  name: '',
  description: '',
  // Message node
  message_text: '',
  show_typing: false,
  // LLM node
  system_prompt: '',
  temperature: 0.7,
  exit_condition: ExitCondition.SINGLE_EXECUTION,
  auto_transfer_enabled: false,
  transfer_group_id: '',
  ask_for_rating: false,
  // Condition node
  condition_expression: '',
  condition_groups: [] as any[],

  // Form node
  form_fields: [] as FormField[],
  form_title: '',
  form_description: '',
  submit_button_text: 'Submit',
  form_full_screen: false,
  // Action node
  action_type: '',
  action_url: '',
  // Human transfer node
  transfer_department: '',
  transfer_message: '',
  // Wait node
  wait_duration: 5,
  wait_unit: 'seconds',
  // End node
  final_message: '',
  // Landing Page node
  landing_page_heading: '',
  landing_page_content: '',
  // User Input node
  prompt_message: '',
  confirmation_message: '',
  // Guardrails node
  enabled_guardrails: ['pii', 'jailbreak'] as string[],
  pii_action: 'block',
  jailbreak_sensitivity: 0.7,
  text_source: 'user_message',
  block_message: ''
})

const saving = ref(false)

// Validation errors state
const validationErrors = ref<Record<string, string>>({})

// User groups state
const userGroups = ref<UserGroup[]>([])
const loadingGroups = ref(false)

// Auto-save functionality
const autoSaveTimeout = ref<number | null>(null)

// Simple debounce implementation
const debounce = (func: Function, delay: number) => {
  return (...args: any[]) => {
    if (autoSaveTimeout.value) {
      clearTimeout(autoSaveTimeout.value)
    }
    autoSaveTimeout.value = setTimeout(() => func(...args), delay)
  }
}



// Toggle collapsible section
const toggleSection = (section: keyof typeof collapsedSections.value | string) => {
  if (section in collapsedSections.value) {
    collapsedSections.value[section as keyof typeof collapsedSections.value] = !collapsedSections.value[section as keyof typeof collapsedSections.value]
  }
}

// Variables functionality
const shouldShowVariables = computed(() => {
  // Show variables for nodes that can use them (message, llm, landingPage, userInput, condition)
  // Also show for userInput nodes to display what variables they will create
  const nodeType = props.selectedNode.data.nodeType
  return ['message', 'llm', 'landingPage', 'userInput', 'condition'].includes(nodeType) && props.availableVariables.length > 0
})

const getVariableSyntax = (fieldName: string) => {
  return `{{${fieldName}}}`
}

const copyVariableToClipboard = async (variable: any) => {
  try {
    const variableSyntax = getVariableSyntax(variable.fieldName)
    await navigator.clipboard.writeText(variableSyntax)
    
    // Show success toast
    toast.success(`Copied ${variableSyntax} to clipboard`, {
      position: 'top-center',
      duration: 2000
    })
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    toast.error('Failed to copy to clipboard', {
      position: 'top-center'
    })
  }
}

// Update LLM form data from child component
const updateLLMFormData = (data: any) => {
  Object.assign(nodeForm.value, data)
  // Trigger auto-save after updating
  autoSaveToCache()
}

// Update Form form data from child component
const updateFormFormData = (data: any) => {
  Object.assign(nodeForm.value, data)
  // Trigger auto-save after updating
  autoSaveToCache()
}

// Update Wait form data from child component
const updateWaitFormData = (data: any) => {
  Object.assign(nodeForm.value, data)
  // Trigger auto-save after updating
  autoSaveToCache()
}

// Update Human Transfer form data from child component
const updateHumanTransferFormData = (data: any) => {
  Object.assign(nodeForm.value, data)
  // Trigger auto-save after updating
  autoSaveToCache()
}

// Update Landing Page form data from child component
const updateLandingPageFormData = (data: any) => {
  Object.assign(nodeForm.value, data)
  // Trigger auto-save after updating
  autoSaveToCache()
}

// Update End form data from child component
const updateEndFormData = (data: any) => {
  Object.assign(nodeForm.value, data)
  // Trigger auto-save after updating
  autoSaveToCache()
}

// Update Action form data from child component
const updateActionFormData = (data: any) => {
  Object.assign(nodeForm.value, data)
  // Trigger auto-save after updating
  autoSaveToCache()
}

// Update Message form data from child component
const updateMessageFormData = (data: any) => {
  Object.assign(nodeForm.value, data)
  // Trigger auto-save after updating
  autoSaveToCache()
}

// Update Condition form data from child component
const updateConditionFormData = (data: any) => {
  Object.assign(nodeForm.value, data)
  // Trigger auto-save after updating
  autoSaveToCache()
}

// Update User Input form data from child component
const updateUserInputFormData = (data: any) => {
  Object.assign(nodeForm.value, data)
  // Trigger auto-save after updating
  autoSaveToCache()
}

// Update Guardrails form data from child component
const updateGuardrailsFormData = (data: any) => {
  Object.assign(nodeForm.value, data)
  // Trigger auto-save after updating
  autoSaveToCache()
}

// Helper function to check if node name is unique
const isNodeNameUnique = (nodeName: string): boolean => {
  const currentNodes = Array.isArray(props.currentNodes)
    ? props.currentNodes
    : (props.currentNodes as Ref<Node[]>).value
  const currentNodeId = props.selectedNode.id
  
  return !currentNodes.some((node: any) => 
    node.id !== currentNodeId && 
    (node.data.cleanName?.toLowerCase() === nodeName.toLowerCase() || 
     node.data.label?.toLowerCase() === nodeName.toLowerCase())
  )
}

// Helper function to validate condition node connections
const validateConditionConnections = (): string | null => {
  if (props.selectedNode.data.nodeType !== 'condition') return null
  
  const edges = Array.isArray(props.currentEdges)
    ? props.currentEdges
    : (props.currentEdges as Ref<Edge[]>).value
  const outgoingConnections = edges.filter((edge: any) => edge.source === props.selectedNode.id)
  
  if (outgoingConnections.length === 0) {
    return 'Condition node must have both true and false connections'
  }
  
  if (outgoingConnections.length === 1) {
    const existingLabel = outgoingConnections[0].label
    const missingLabel = existingLabel === 'true' ? 'false' : 'true'
    return `Condition node is missing ${missingLabel} connection`
  }
  
  if (outgoingConnections.length === 2) {
    const labels = outgoingConnections.map((edge: any) => edge.label).filter(Boolean)
    const hasTrue = labels.includes('true')
    const hasFalse = labels.includes('false')
    
    if (!hasTrue && !hasFalse) {
      return 'Condition connections must be labeled as true and false'
    } else if (!hasTrue) {
      return 'Condition node is missing true connection'
    } else if (!hasFalse) {
      return 'Condition node is missing false connection'
    }
  }
  
  return null
}

// Validation functions
const validateField = (field: string, value: any, nodeType: string): string | null => {
  switch (field) {
    case 'name':
      if (!value || value.trim() === '') {
        return 'Node name is required'
      }
      if (value.length > 100) {
        return 'Node name must be less than 100 characters'
      }
      // Check for unique node name
      if (!isNodeNameUnique(value.trim())) {
        return 'Node name must be unique within the workflow'
      }
      break
    
    case 'message_text':
      if (nodeType === 'message' && (!value || value.trim() === '')) {
        return 'Message text is required'
      }
      break
    
    case 'system_prompt':
      if (nodeType === 'llm' && (!value || value.trim() === '')) {
        return 'System prompt is required'
      }
      break
    
    case 'temperature':
      if (nodeType === 'llm' && (value < 0 || value > 2)) {
        return 'Temperature must be between 0 and 2'
      }
      break
    
    case 'exit_condition':
      if (nodeType === 'llm' && (!value || value.trim() === '')) {
        return 'Exit condition is required'
      }
      break
    
    case 'condition_expression':
      if (nodeType === 'condition' && (!value || value.trim() === '')) {
        return 'Condition expression is required'
      }
      break
    
    case 'condition_groups':
      if (nodeType === 'condition') {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'At least one condition rule is required'
        }
        
        let hasValidRule = false
        for (let groupIndex = 0; groupIndex < value.length; groupIndex++) {
          const group = value[groupIndex]
          if (group.rules && Array.isArray(group.rules)) {
            for (let ruleIndex = 0; ruleIndex < group.rules.length; ruleIndex++) {
              const rule = group.rules[ruleIndex]
              
              // Check if rule has all required fields
              if (rule.variable && rule.operator && rule.value) {
                hasValidRule = true
              } else {
                // Only show error for incomplete rules if they have any field filled
                if (rule.variable || rule.operator || rule.value) {
                  const missingFields = []
                  if (!rule.variable) missingFields.push('variable')
                  if (!rule.operator) missingFields.push('operator')
                  if (!rule.value) missingFields.push('value')
                  
                  return `Group ${groupIndex + 1}, rule ${ruleIndex + 1}: Missing ${missingFields.join(', ')}`
                }
              }
            }
          }
        }
        
        if (!hasValidRule) {
          return 'At least one complete condition rule is required (variable, operator, and value)'
        }
      }
      break
    
    case 'condition_connections':
      if (nodeType === 'condition') {
        return validateConditionConnections()
      }
      break
    
    
    case 'action_type':
      if (nodeType === 'action' && (!value || value.trim() === '')) {
        return 'Action type is required'
      }
      break
    
    case 'action_url':
      if (nodeType === 'action' && (!value || value.trim() === '')) {
        return 'Action URL is required'
      }
      if (nodeType === 'action' && value && !isValidUrl(value)) {
        return 'Please enter a valid URL'
      }
      break
    
    case 'transfer_department':
      if (nodeType === 'humanTransfer' && (!value || value.trim() === '')) {
        return 'Department is required'
      }
      break
    
    case 'wait_duration':
      if (nodeType === 'wait' && (!value || value < 1)) {
        return 'Wait duration must be at least 1'
      }
      break
    
    case 'wait_unit':
      if (nodeType === 'wait' && (!value || value.trim() === '')) {
        return 'Time unit is required'
      }
      break
    
    case 'form_fields':
      if (nodeType === 'form' && (!value || value.length === 0)) {
        return 'At least one form field is required'
      }
      if (nodeType === 'form' && value && value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          const field = value[i]
          if (!field.name || field.name.trim() === '') {
            return `Form field ${i + 1}: Field name is required`
          }
          if (!field.label || field.label.trim() === '') {
            return `Form field ${i + 1}: Display label is required`
          }
          if (field.name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name)) {
            return `Form field ${i + 1}: Field name must start with a letter or underscore and contain only letters, numbers, and underscores`
          }
        }
      }
      break
    
    case 'landing_page_heading':
      if (nodeType === 'landingPage' && (!value || value.trim() === '')) {
        return 'Heading is required'
      }
      break
    
    case 'landing_page_content':
      if (nodeType === 'landingPage' && (!value || value.trim() === '')) {
        return 'Content is required'
      }
      break
    
    // Removed prompt_message validation case - it's now optional
  }
  return null
}

// Helper function to validate URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Validate all fields
const validateForm = (): boolean => {
  const errors: Record<string, string> = {}
  const nodeType = props.selectedNode.data.nodeType
  
  // Validate each field
  const fieldsToValidate = [
    'name', 'message_text', 'system_prompt', 'temperature', 'exit_condition',
    'condition_expression', 'condition_groups', 'condition_connections', 'action_type', 'action_url',
    'transfer_department', 'wait_duration', 'wait_unit', 'form_fields',
    'landing_page_heading', 'landing_page_content', 'prompt_message', 'confirmation_message'
  ]
  
  fieldsToValidate.forEach(field => {
    const value = nodeForm.value[field as keyof typeof nodeForm.value]
    const error = validateField(field, value, nodeType)
    if (error) {
      errors[field] = error
    }
  })
  
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

// Real-time validation on field change
const validateFieldOnChange = (field: string) => {
  const value = nodeForm.value[field as keyof typeof nodeForm.value]
  const error = validateField(field, value, props.selectedNode.data.nodeType)
  
  if (error) {
    validationErrors.value[field] = error
  } else {
    delete validationErrors.value[field]
  }
  
  // Trigger auto-save after validation
  autoSaveToCache()
}



// Load user groups for transfer
const loadUserGroups = async () => {
  try {
    loadingGroups.value = true
    userGroups.value = await listGroups()
  } catch (error) {
    console.error('Failed to load user groups:', error)
    userGroups.value = []
  } finally {
    loadingGroups.value = false
  }
}

// Get node data with latest cache values for PropertiesPanel
const getNodeDataForForm = (node: Node) => {
  // Get cached workflow data
  const workflowCache = workflowCacheStorage.getWorkflowCache(props.workflowId)
  
  // Start with node data
  let nodeData = { ...node.data }
  
  if (workflowCache && workflowCache.nodes) {
    // Find this node in the cache
    const cachedNode = workflowCache.nodes.find((n: any) => n.id === node.id)
    if (cachedNode) {
      console.log('Found cached node:', cachedNode)
      // Update name from cache
      if (cachedNode.name) nodeData.cleanName = cachedNode.name
      if (cachedNode.description) nodeData.description = cachedNode.description
      
      // Update config values from cache
      if (cachedNode.config) {
        Object.assign(nodeData, cachedNode.config)
        nodeData.config = cachedNode.config
      }
    } else {
      console.log('No cached node found for:', node.id)
    }
  } else {
    console.log('No workflow cache found')
  }
  
  return nodeData
}

// Watch for node selection changes
// Load user groups on component mount
loadUserGroups()

// Watch for edge changes to validate condition connections
watch(() => props.currentEdges, () => {
  if (props.selectedNode && props.selectedNode.data.nodeType === 'condition') {
    // Validate condition connections when edges change
    const error = validateConditionConnections()
    if (error) {
      validationErrors.value.condition_connections = error
    } else {
      delete validationErrors.value.condition_connections
    }
  }
}, { deep: true })

watch(() => props.selectedNode, (newNode) => {
  if (newNode) {
    console.log('Node changed, loading form data for:', newNode.id)
    
    // Get node data with cache values
    const nodeData = getNodeDataForForm(newNode)
    console.log('Node data for form:', nodeData)
    
    // Helper function to extract clean name from label by removing emoji icons
    const extractCleanName = (label: string) => {
      if (!label) return ''
      // Remove common emoji icons and trim whitespace
      return label
        .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // Unicode emojis
        .replace(/[💬🤖🔀📝⚡👤⏱️🏁📄]/g, '') // Specific icons we use
        .replace(/^\s+|\s+$/g, '') // Trim whitespace
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    }

    nodeForm.value = {
      name: nodeData.cleanName || 
            extractCleanName(nodeData.label) || 
            '',
      description: nodeData.description || '',
      // Message node - check cache config first, then fallback
      message_text: nodeData.config?.message_text || 
                    nodeData.message_text || 
                    '',
      show_typing: nodeData.config?.show_typing !== undefined ? 
                   nodeData.config?.show_typing : 
                   (nodeData.show_typing || false),
      // LLM node
      system_prompt: nodeData.config?.system_prompt || 
                     nodeData.system_prompt || 
                     '',
      temperature: nodeData.config?.temperature !== undefined ? 
                   nodeData.config?.temperature : 
                   (nodeData.temperature || 0.7),
      exit_condition: nodeData.config?.exit_condition || 
                      nodeData.exit_condition || 
                      ExitCondition.SINGLE_EXECUTION,
      auto_transfer_enabled: nodeData.config?.auto_transfer_enabled !== undefined ? 
                             nodeData.config?.auto_transfer_enabled : 
                             (nodeData.auto_transfer_enabled || false),
      transfer_group_id: nodeData.config?.transfer_group_id || 
                         nodeData.transfer_group_id || 
                         '',
      ask_for_rating: nodeData.config?.ask_for_rating !== undefined ? 
                      nodeData.config?.ask_for_rating : 
                      (nodeData.ask_for_rating !== undefined ? nodeData.ask_for_rating : true),
      // Condition node
      condition_expression: nodeData.config?.condition_expression || 
                            nodeData.condition_expression || 
                            '',
      condition_groups: nodeData.config?.condition_groups || 
                        nodeData.condition_groups || 
                        [],
      // Form node - prioritize config over outer fields
      form_fields: (() => {
        const fields = nodeData.config?.form_fields || nodeData.form_fields || []
        // Convert array options back to newline-separated string for textarea display
        return fields.map((field: any) => ({
          ...field,
          options: Array.isArray(field.options) ? field.options.join('\n') : (field.options || '')
        }))
      })(),
      form_title: nodeData.config?.form_title || 
                  nodeData.form_title || 
                  '',
      form_description: nodeData.config?.form_description || 
                        nodeData.form_description || 
                        '',
      submit_button_text: nodeData.config?.submit_button_text || 
                          nodeData.submit_button_text || 
                          'Submit',
      form_full_screen: nodeData.config?.form_full_screen !== undefined ? 
                        nodeData.config?.form_full_screen : 
                        (nodeData.form_full_screen || false),
      // Action node
      action_type: nodeData.config?.action_type || 
                   nodeData.action_type || 
                   '',
      action_url: nodeData.config?.action_url || 
                  nodeData.action_url || 
                  '',
      // Human transfer node
      transfer_department: nodeData.config?.transfer_department || 
                           nodeData.transfer_department || 
                           '',
      transfer_message: nodeData.config?.transfer_message || 
                        nodeData.transfer_message || 
                        '',
      // Wait node
      wait_duration: nodeData.config?.wait_duration !== undefined ? 
                     nodeData.config?.wait_duration : 
                     (nodeData.wait_duration || 5),
      wait_unit: nodeData.config?.wait_unit || 
                 nodeData.wait_unit || 
                 'seconds',
      // End node
      final_message: nodeData.config?.final_message || 
                     nodeData.final_message || 
                     '',
      // Landing Page node
      landing_page_heading: nodeData.config?.landing_page_heading || 
                            nodeData.landing_page_heading || 
                            '',
      landing_page_content: nodeData.config?.landing_page_content || 
                            nodeData.landing_page_content || 
                            '',
      // User Input node
      prompt_message: nodeData.config?.prompt_message || 
                      nodeData.prompt_message || 
                      '',
      confirmation_message: nodeData.config?.confirmation_message || 
                            nodeData.confirmation_message || 
                            '',
      // Guardrails node
      enabled_guardrails: nodeData.config?.enabled_guardrails || 
                          nodeData.enabled_guardrails || 
                          ['pii', 'jailbreak'],
      pii_action: nodeData.config?.pii_action || 
                  nodeData.pii_action || 
                  'block',
      jailbreak_sensitivity: nodeData.config?.jailbreak_sensitivity !== undefined ? 
                             nodeData.config?.jailbreak_sensitivity : 
                             (nodeData.jailbreak_sensitivity !== undefined ? nodeData.jailbreak_sensitivity : 0.7),
      text_source: nodeData.config?.text_source || 
                   nodeData.text_source || 
                   'user_message',
      block_message: nodeData.config?.block_message || 
                     nodeData.block_message || 
                     ''
    }
    
    console.log('Form loaded with values:', nodeForm.value)
  }
}, { immediate: true })

// Get node type display name
const getNodeTypeName = (type: string) => {
  const names = {
    landingPage: 'Landing Page',
    message: 'Message',
    llm: 'LLM',
    condition: 'Condition',
    form: 'Form',
    action: 'Action',
    humanTransfer: 'Human Transfer',
    wait: 'Wait',
    end: 'End',
    userInput: 'User Input',
    guardrails: 'Guardrails'
  }
  return names[type as keyof typeof names] || type
}





// Filter out blank/empty values from config
const filterBlankValues = (obj: any): any => {
  const filtered: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip null, undefined, empty strings, and empty arrays
    if (value !== null && value !== undefined && value !== '' && 
        !(Array.isArray(value) && value.length === 0)) {
      
      // For objects, recursively filter
      if (typeof value === 'object' && !Array.isArray(value)) {
        const filteredObj = filterBlankValues(value)
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
}

// Get node-specific config based on node type
const getNodeSpecificConfig = (nodeType: string) => {
  const config: any = {}
  
  switch (nodeType) {
    case 'message':
      if (nodeForm.value.message_text) config.message_text = nodeForm.value.message_text
      if (nodeForm.value.show_typing !== undefined) config.show_typing = nodeForm.value.show_typing
      break
    
    case 'llm':
      if (nodeForm.value.system_prompt) config.system_prompt = nodeForm.value.system_prompt
      if (nodeForm.value.temperature !== undefined) config.temperature = nodeForm.value.temperature
      if (nodeForm.value.exit_condition) config.exit_condition = nodeForm.value.exit_condition
      if (nodeForm.value.auto_transfer_enabled !== undefined) config.auto_transfer_enabled = nodeForm.value.auto_transfer_enabled
      if (nodeForm.value.transfer_group_id) config.transfer_group_id = nodeForm.value.transfer_group_id
      if (nodeForm.value.ask_for_rating !== undefined) config.ask_for_rating = nodeForm.value.ask_for_rating
      break
    
    case 'condition':
      if (nodeForm.value.condition_expression) config.condition_expression = nodeForm.value.condition_expression
      if (nodeForm.value.condition_groups) config.condition_groups = nodeForm.value.condition_groups
      break
    
    case 'form':
      if (nodeForm.value.form_fields && nodeForm.value.form_fields.length > 0) {
        // Ensure all form field properties are saved, including required, placeholder, etc.
        config.form_fields = nodeForm.value.form_fields.map(field => ({
          name: field.name || '',
          label: field.label || '',
          type: field.type || 'text',
          required: field.required || false,
          placeholder: field.placeholder || '',
          // Convert newline-separated string to array for select/radio options
          options: (field.type === 'select' || field.type === 'radio') && field.options 
            ? (typeof field.options === 'string' 
                ? field.options.split('\n').map(opt => opt.trim()).filter(opt => opt.length > 0)
                : field.options)
            : (field.options || ''),
          minLength: field.minLength || 0,
          maxLength: field.maxLength || 255
        }))
      }
      if (nodeForm.value.form_title) config.form_title = nodeForm.value.form_title
      if (nodeForm.value.form_description) config.form_description = nodeForm.value.form_description
      if (nodeForm.value.submit_button_text) config.submit_button_text = nodeForm.value.submit_button_text
      if (nodeForm.value.form_full_screen !== undefined) config.form_full_screen = nodeForm.value.form_full_screen
      break
    
    case 'action':
      if (nodeForm.value.action_type) config.action_type = nodeForm.value.action_type
      if (nodeForm.value.action_url) config.action_url = nodeForm.value.action_url
      break
    
    case 'humanTransfer':
      if (nodeForm.value.transfer_department) config.transfer_department = nodeForm.value.transfer_department
      if (nodeForm.value.transfer_message) config.transfer_message = nodeForm.value.transfer_message
      break
    
    case 'wait':
      if (nodeForm.value.wait_duration) config.wait_duration = nodeForm.value.wait_duration
      if (nodeForm.value.wait_unit) config.wait_unit = nodeForm.value.wait_unit
      break
    
    case 'end':
      if (nodeForm.value.final_message) config.final_message = nodeForm.value.final_message
      break
    
    case 'landingPage':
      if (nodeForm.value.landing_page_heading) config.landing_page_heading = nodeForm.value.landing_page_heading
      if (nodeForm.value.landing_page_content) config.landing_page_content = nodeForm.value.landing_page_content
      break
    
    case 'userInput':
      if (nodeForm.value.prompt_message) config.prompt_message = nodeForm.value.prompt_message
      if (nodeForm.value.confirmation_message) config.confirmation_message = nodeForm.value.confirmation_message
      break
    
    case 'guardrails':
      if (nodeForm.value.enabled_guardrails) config.enabled_guardrails = nodeForm.value.enabled_guardrails
      if (nodeForm.value.pii_action) config.pii_action = nodeForm.value.pii_action
      if (nodeForm.value.jailbreak_sensitivity !== undefined) config.jailbreak_sensitivity = nodeForm.value.jailbreak_sensitivity
      if (nodeForm.value.text_source) config.text_source = nodeForm.value.text_source
      if (nodeForm.value.block_message) config.block_message = nodeForm.value.block_message
      break
  }
  
  // Apply additional filtering to remove any blank values
  return filterBlankValues(config)
}

// Auto-save node data to cache
const autoSaveToCache = debounce(async () => {
  console.log('autoSaveToCache called')
  // For form fields, we want to save even if there are validation errors on other fields
  // as long as the form field structure is valid
  const nodeType = props.selectedNode.data.nodeType || 'message'
 
  
  // If it's a form node, validate form fields separately
  if (nodeType === 'form') {
    
    // Check if form fields have basic structure (name and label)
    const hasValidFormFields = nodeForm.value.form_fields.every(field => 
      field.name && field.name.trim() !== '' && 
      field.label && field.label.trim() !== ''
    )
    
    if (!hasValidFormFields) {
      console.log('Form fields missing required name/label, skipping auto-save')
      return
    }
    
  } else {
    // For other node types, use full validation
    if (!validateForm()) {
      console.log('Form validation failed, skipping auto-save')
      return
    }
  }
  
  // Update node in cache with current form data
  const config = getNodeSpecificConfig(nodeType)
  
  
  const nodeData = {
    id: props.selectedNode.id,
    node_type: mapNodeTypeToBackend(nodeType),
    name: nodeForm.value.name,
    description: nodeForm.value.description,
    position_x: props.selectedNode.position.x,
    position_y: props.selectedNode.position.y,
    config: config
  }
  
  
  workflowNodeService.updateNodeInCache(props.workflowId, nodeData)
  
  // Emit the updated data to parent
  emit('save', {
    ...nodeForm.value,
    needsWorkflowSave: false, // Don't trigger full workflow save
    cacheUpdated: true
  })
}, 500) // Auto-save after 500ms of inactivity

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





// Handle close
const handleClose = () => {
  emit('close')
}

// Handle delete
const handleDelete = () => {
  if (confirm('Are you sure you want to delete this node?')) {
    emit('delete')
  }
}

// Add global event listeners when component mounts (removed for now)
// onMounted(() => {
//   document.addEventListener('click', handleGlobalModalClick, true)
//   document.addEventListener('keydown', handleGlobalModalClick, true)
// })

// Clean up event listeners when component unmounts (removed for now)
// onUnmounted(() => {
//   document.removeEventListener('click', handleGlobalModalClick, true)
//   document.removeEventListener('keydown', handleGlobalModalClick, true)
// })
</script>

<template>
  <div class="properties-panel">
    <div class="properties-header">
      <div class="header-left">
        <h3>Node Properties</h3>
        <span class="node-type-badge" :style="{ backgroundColor: selectedNode.data.color }">
          {{ selectedNode.data.icon }} {{ getNodeTypeName(selectedNode.data.nodeType) }}
        </span>
      </div>
      <div class="header-actions">
        <button class="header-icon-btn delete-btn" @click="handleDelete" title="Delete Node">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
        <button class="header-icon-btn close-btn" @click="handleClose" title="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="properties-content">
      <form @submit.prevent>
        <!-- Basic Properties -->
        <div class="collapsible-section">
          <div class="section-header" @click="toggleSection('basic')">
            <div class="section-title">
              <svg class="section-icon" :class="{ 'rotated': collapsedSections.basic }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
              <span>Basic Information</span>
            </div>
          </div>
          
          <div class="section-content" :class="{ 'collapsed': collapsedSections.basic }">
            <div class="form-group">
              <label for="node-name">Node Name *</label>
              <input
                id="node-name"
                v-model="nodeForm.name"
                type="text"
                class="form-input"
                :class="{ 'error': validationErrors.name }"
                placeholder="Enter node name"
                required
                @blur="validateFieldOnChange('name')"
                @input="validateFieldOnChange('name')"
              />
              <div v-if="validationErrors.name" class="error-message">
                {{ validationErrors.name }}
              </div>
            </div>

            <div class="form-group">
              <label for="node-description">Description</label>
              <textarea
                id="node-description"
                v-model="nodeForm.description"
                class="form-textarea"
                placeholder="Enter node description (optional)"
                rows="3"
                @blur="autoSaveToCache"
                @input="autoSaveToCache"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Node-specific Properties -->
        <div class="collapsible-section">
          <div class="section-header" @click="toggleSection('nodeSettings')">
            <div class="section-title">
              <svg class="section-icon" :class="{ 'rotated': collapsedSections.nodeSettings }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
              <span>{{ getNodeTypeName(selectedNode.data.nodeType) }} Settings</span>
            </div>
          </div>
          
          <div class="section-content" :class="{ 'collapsed': collapsedSections.nodeSettings }">
          
          <!-- Message Node -->
          <template v-if="selectedNode.data.nodeType === 'message'">
            <MessageNodeConfig
              :model-value="{
                message_text: nodeForm.message_text,
                show_typing: nodeForm.show_typing
              }"
              @update:model-value="updateMessageFormData"
              :validation-errors="validationErrors"
              @validate-field="validateFieldOnChange"
            />
          </template>

          <!-- LLM Node -->
          <template v-if="selectedNode.data.nodeType === 'llm'">
            <LLMNodeConfig
              :model-value="{
                system_prompt: nodeForm.system_prompt,
                temperature: nodeForm.temperature,
                exit_condition: nodeForm.exit_condition,
                auto_transfer_enabled: nodeForm.auto_transfer_enabled,
                transfer_group_id: nodeForm.transfer_group_id,
                ask_for_rating: nodeForm.ask_for_rating
              }"
              @update:model-value="updateLLMFormData"
              :validation-errors="validationErrors"
              :user-groups="userGroups"
              :loading-groups="loadingGroups"
              :agent-id="agentId"
              :organization-id="organizationId"
              :collapsed-sections="collapsedSections"
              @validate-field="validateFieldOnChange"
              @toggle-section="toggleSection"
            />
          </template>

          <!-- Condition Node -->
          <template v-if="selectedNode.data.nodeType === 'condition'">
            <!-- Connection Status -->
            <div class="form-group">
              <label>Connection Status</label>
              <div class="connection-status">
                <div class="connection-info" :class="{ 'error': validationErrors.condition_connections }">
                  <div class="connection-item">
                    <span class="connection-label true">True Path:</span>
                    <span class="connection-value">
                      {{ (() => {
                        const edgesVal = Array.isArray(currentEdges) ? currentEdges : (currentEdges as any).value
                        const trueConnection = edgesVal.find((edge: any) => edge.source === selectedNode.id && edge.label === 'true')
                        return trueConnection ? '✓ Connected' : '✗ Not connected'
                      })() }}
                    </span>
                  </div>
                  <div class="connection-item">
                    <span class="connection-label false">False Path:</span>
                    <span class="connection-value">
                      {{ (() => {
                        const edgesVal = Array.isArray(currentEdges) ? currentEdges : (currentEdges as any).value
                        const falseConnection = edgesVal.find((edge: any) => edge.source === selectedNode.id && edge.label === 'false')
                        return falseConnection ? '✓ Connected' : '✗ Not connected'
                      })() }}
                    </span>
                  </div>
                </div>
                <div v-if="validationErrors.condition_connections" class="error-message">
                  {{ validationErrors.condition_connections }}
                </div>
                <div class="help-text">
                  Drag connections from this node to other nodes. The first connection will be labeled "true" and the second "false".
                </div>
              </div>
            </div>
            
            <ConditionNodeConfig
              :key="selectedNode.id"
              :model-value="{
                condition_expression: nodeForm.condition_expression,
                condition_groups: nodeForm.condition_groups
              }"
              @update:model-value="updateConditionFormData"
              :validation-errors="validationErrors"
              :available-variables="availableVariables"
              @validate-field="validateFieldOnChange"
            />
          </template>

          <!-- Form Node -->
          <template v-if="selectedNode.data.nodeType === 'form'">
            <FormNodeConfig
              :model-value="{
                form_title: nodeForm.form_title,
                form_description: nodeForm.form_description,
                submit_button_text: nodeForm.submit_button_text,
                form_full_screen: nodeForm.form_full_screen,
                form_fields: nodeForm.form_fields
              }"
              @update:model-value="updateFormFormData"
              :validation-errors="validationErrors"
              @validate-field="validateFieldOnChange"
            />
          </template>

          <!-- Action Node -->
          <template v-if="selectedNode.data.nodeType === 'action'">
            <ActionNodeConfig
              :model-value="{
                action_type: nodeForm.action_type,
                action_url: nodeForm.action_url
              }"
              @update:model-value="updateActionFormData"
              :validation-errors="validationErrors"
              @validate-field="validateFieldOnChange"
            />
          </template>

          <!-- Human Transfer Node -->
          <template v-if="selectedNode.data.nodeType === 'humanTransfer'">
            <HumanTransferNodeConfig
              :model-value="{
                transfer_department: nodeForm.transfer_department,
                transfer_message: nodeForm.transfer_message
              }"
              @update:model-value="updateHumanTransferFormData"
              :validation-errors="validationErrors"
              @validate-field="validateFieldOnChange"
            />
          </template>

          <!-- Wait Node -->
          <template v-if="selectedNode.data.nodeType === 'wait'">
            <WaitNodeConfig
              :model-value="{
                wait_duration: nodeForm.wait_duration,
                wait_unit: nodeForm.wait_unit
              }"
              @update:model-value="updateWaitFormData"
              :validation-errors="validationErrors"
              @validate-field="validateFieldOnChange"
            />
          </template>

          <!-- End Node -->
          <template v-if="selectedNode.data.nodeType === 'end'">
            <EndNodeConfig
              :model-value="{
                final_message: nodeForm.final_message
              }"
              @update:model-value="updateEndFormData"
              :validation-errors="validationErrors"
              @validate-field="validateFieldOnChange"
            />
          </template>

          <!-- Landing Page Node -->
          <template v-if="selectedNode.data.nodeType === 'landingPage'">
            <LandingPageNodeConfig
              :model-value="{
                landing_page_heading: nodeForm.landing_page_heading,
                landing_page_content: nodeForm.landing_page_content
              }"
              @update:model-value="updateLandingPageFormData"
              :validation-errors="validationErrors"
              @validate-field="validateFieldOnChange"
            />
          </template>

          <!-- User Input Node -->
          <template v-if="selectedNode.data.nodeType === 'userInput'">
            <UserInputNodeConfig
              :model-value="{
                prompt_message: nodeForm.prompt_message,
                confirmation_message: nodeForm.confirmation_message
              }"
              @update:model-value="updateUserInputFormData"
              :validation-errors="validationErrors"
              @validate-field="validateFieldOnChange"
            />
          </template>

          <!-- Guardrails Node -->
          <template v-if="selectedNode.data.nodeType === 'guardrails'">
            <GuardrailsNodeConfig
              :model-value="{
                enabled_guardrails: nodeForm.enabled_guardrails,
                pii_action: nodeForm.pii_action,
                jailbreak_sensitivity: nodeForm.jailbreak_sensitivity,
                text_source: nodeForm.text_source,
                block_message: nodeForm.block_message
              }"
              @update:model-value="updateGuardrailsFormData"
              :validation-errors="validationErrors"
              :available-variables="availableVariables"
              @validate-field="validateFieldOnChange"
            />
          </template>
        </div>
        
        <!-- Form Variables Section -->
        <div v-if="shouldShowVariables" class="collapsible-section">
          <div class="section-header" @click="toggleSection('variables')">
            <div class="section-title">
              <svg class="section-icon" :class="{ 'rotated': collapsedSections.variables }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
              <span>Available Variables</span>
              <span v-if="availableVariables.length > 0" class="variables-count">{{ availableVariables.length }}</span>
            </div>
          </div>
          
          <div class="section-content" :class="{ 'collapsed': collapsedSections.variables }">
            <div v-if="availableVariables.length === 0" class="no-variables">
              <p>No variables available</p>
              <small>Add form or user input nodes to create variables</small>
            </div>
            
            <div v-else class="variables-list">
              <div
                v-for="variable in availableVariables"
                :key="`${variable.nodeId}-${variable.fieldName}`"
                class="variable-item"
                @click="copyVariableToClipboard(variable)"
                :title="`Click to copy {{${variable.fieldName}}} to clipboard`"
              >
                <div class="variable-info">
                  <div class="variable-name">{{ variable.fieldName }}</div>
                  <div class="variable-source">from {{ variable.nodeName }}</div>
                  <div class="variable-type">{{ variable.fieldType }}</div>
                </div>
                <div class="variable-syntax">
                  <code>{{ getVariableSyntax(variable.fieldName) }}</code>
                </div>
              </div>
            </div>
            
            <div v-if="availableVariables.length > 0" class="variables-help">
              <small>
                <strong>Usage:</strong><br>
                • <code>{{ getVariableSyntax('field_name') }}</code> - Latest value<br>
                • <code>{{ getVariableSyntax('node_id.field_name') }}</code> - Specific node
              </small>
            </div>
          </div>
        </div>
        </div>
      </form>
    </div>

    <div class="properties-footer">
      <div class="footer-info">
        <span class="auto-save-indicator">
          <svg class="auto-save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17,21 17,13 7,13 7,21"></polyline>
            <polyline points="7,3 7,8 15,8"></polyline>
          </svg>
          Auto-saves changes
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure toast positioning is centered and doesn't cover buttons */
.properties-panel :deep([data-sonner-toaster]) {
  top: 80px !important;
}

.properties-panel :deep([data-sonner-toaster][data-theme]) {
  top: 80px !important;
}

.properties-panel :deep(.sonner-toaster) {
  top: 80px !important;
}
/* Properties Panel Styles */
.properties-panel {
  width: 350px;
  background: var(--background-soft);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.properties-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--background-color);
}

.properties-header .header-left {
  flex: 1;
}

.properties-header h3 {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--text-color);
}

.node-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 500;
  color: white;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.header-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-icon-btn:hover {
  background: var(--background-muted);
  color: var(--text-color);
}

.header-icon-btn.delete-btn:hover {
  background: var(--error-color);
  color: white;
}

.header-icon-btn svg {
  width: 16px;
  height: 16px;
}

.properties-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
}

/* Collapsible Section Styles */
.collapsible-section {
  margin-bottom: var(--space-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--background-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-color);
}

.section-header:hover {
  background: var(--background-alt);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
}

.section-icon {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.section-icon.rotated {
  transform: rotate(-90deg);
}

.section-content {
  padding: var(--space-md);
  transition: all 0.3s ease;
  max-height: none;
  overflow: visible;
}

.section-content.collapsed {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
  overflow: hidden;
}

.form-section {
  margin-bottom: var(--space-lg);
}

.form-section h4 {
  margin: 0 0 var(--space-sm) 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--space-xs);
}

.form-group {
  margin-bottom: var(--space-sm);
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-color);
  font-size: 0.85rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(201, 242, 78, 0.15);
}

.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

.form-input.error:focus,
.form-textarea.error:focus,
.form-select.error:focus {
  border-color: var(--error-color);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: var(--error-color);
  font-size: 0.75rem;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-message::before {
  content: "⚠";
  font-size: 0.8rem;
}

.form-textarea {
  resize: vertical;
  min-height: 70px;
}

.checkbox-group {
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
  margin-bottom: 0;
  padding: 4px 0;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-label span {
  font-size: 0.85rem;
  color: var(--text-color);
  line-height: 1.4;
  user-select: none;
}

.properties-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-top: 1px solid var(--border-color);
  background: var(--background-soft);
  flex-shrink: 0;
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.auto-save-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 500;
}

.auto-save-icon {
  width: 14px;
  height: 14px;
  color: var(--success-color);
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  min-width: 80px;
  white-space: nowrap;
}

.btn-primary {
  background: var(--primary-color);
  color: var(--on-accent);
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--background-muted);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--background-alt);
  color: var(--text-color);
}

.btn-danger {
  background: var(--error-color);
  color: white;
}

.btn-danger:hover {
  background: #DC2626;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}





/* Knowledge Section Styles */
.knowledge-section {
  margin-top: var(--space-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  overflow: hidden;
}

.knowledge-header .section-header {
  background: var(--background-muted);
  border-bottom: 1px solid var(--border-color);
}

.knowledge-header .section-title {
  color: var(--text-color);
}

.knowledge-content {
  padding: 0; /* Remove default padding since KnowledgeGrid has its own */
  max-height: none;
  overflow: visible;
  transition: all 0.3s ease;
}

.knowledge-content.collapsed {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
  overflow: hidden;
}

.knowledge-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Override KnowledgeGrid styles within PropertiesPanel */
.knowledge-content :deep(.knowledge-grid-container) {
  padding: var(--space-sm);
  background: transparent;
  border-top: none;
}

.knowledge-content :deep(.knowledge-header) {
  margin-bottom: var(--space-sm);
  flex-direction: column;
  gap: var(--space-xs);
  align-items: stretch;
}

.knowledge-content :deep(.header-left) {
  flex-direction: column;
  gap: var(--space-xs);
  align-items: stretch;
}

.knowledge-content :deep(.header-left h3) {
  font-size: 1rem;
  margin-bottom: 0;
}

.knowledge-content :deep(.header-actions) {
  display: flex;
  gap: var(--space-xs);
  justify-content: center;
}

.knowledge-content :deep(.action-button) {
  font-size: 0.7rem;
  padding: 4px 8px;
  flex: 1;
  text-align: center;
  white-space: nowrap;
}

.knowledge-content :deep(.knowledge-grid) {
  font-size: 0.8rem;
}

.knowledge-content :deep(.knowledge-grid-header),
.knowledge-content :deep(.knowledge-grid-row) {
  grid-template-columns: 1fr 60px;
  min-height: auto;
}

.knowledge-content :deep(.header-cell),
.knowledge-content :deep(.grid-cell) {
  padding: var(--space-xs) var(--space-sm);
  font-size: 0.75rem;
}

.knowledge-content :deep(.header-cell:nth-child(2)),
.knowledge-content :deep(.header-cell:nth-child(3)),
.knowledge-content :deep(.header-cell:nth-child(4)),
.knowledge-content :deep(.grid-cell:nth-child(2)),
.knowledge-content :deep(.grid-cell:nth-child(3)),
.knowledge-content :deep(.grid-cell:nth-child(4)) {
  display: none;
}

.knowledge-content :deep(.actions-cell) {
  width: 60px;
  text-align: center;
}

.knowledge-content :deep(.delete-button) {
  padding: 2px;
}

.knowledge-content :deep(.delete-icon) {
  width: 16px;
  height: 16px;
}

.knowledge-content :deep(.knowledge-empty) {
  padding: var(--space-md);
  text-align: center;
}

.knowledge-content :deep(.warning-message) {
  font-size: 0.8rem;
  margin-bottom: var(--space-xs);
}

.knowledge-content :deep(.warning-description) {
  font-size: 0.75rem;
  line-height: 1.4;
}

.knowledge-content :deep(.modal-content) {
  max-width: 30vw;
  max-height: 75vh;
  width: 65%;
}

/* Ensure knowledge modals have proper z-index and don't interfere */
.knowledge-content :deep(.modal-overlay) {
  z-index: 1001 !important; /* Higher than properties panel */
  position: fixed !important;
  isolation: isolate;
  background: rgba(0, 0, 0, 0.4) !important; /* Slightly more transparent for workflow context */
}

/* Prevent modal interactions from bubbling to properties panel */
.knowledge-content :deep(.modal-overlay),
.knowledge-content :deep(.modal-content) {
  pointer-events: auto;
}

.knowledge-content :deep(.modal-overlay) {
  backdrop-filter: blur(4px);
}

.knowledge-content :deep(.pagination) {
  flex-direction: column;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.knowledge-content :deep(.pagination-button) {
  width: 100%;
  font-size: 0.7rem;
  padding: var(--space-xs);
}

.knowledge-content :deep(.page-info) {
  font-size: 0.7rem;
  text-align: center;
}

/* Link modal overrides for PropertiesPanel */
.knowledge-content :deep(.link-modal) {
  max-width: 65vw;
  width: 60%;
}

.knowledge-content :deep(.org-knowledge-grid .knowledge-grid-header),
.knowledge-content :deep(.org-knowledge-grid .knowledge-grid-row) {
  grid-template-columns: 2fr 0fr 100px; /* Keep 3 columns but make type column 0 width */
  align-items: center;
}

.knowledge-content :deep(.org-knowledge-grid .type-cell) {
  display: none; /* Hide type column */
}

.knowledge-content :deep(.source-cell) {
  padding-left: var(--space-sm);
  white-space: normal;
  word-break: break-word;
  font-size: 0.75rem;
}

.knowledge-content :deep(.action-cell) {
  padding-right: var(--space-sm);
  text-align: right;
  width: 100px;
}

.knowledge-content :deep(.link-button),
.knowledge-content :deep(.unlink-button) {
  min-width: 70px;
  padding: 4px 8px;
  font-size: 0.7rem;
  display: inline-block;
}

/* Force proper button display regardless of responsive breakpoints */
.knowledge-content :deep(.org-knowledge-grid) .action-cell {
  display: block !important;
  visibility: visible !important;
}

.knowledge-content :deep(.org-knowledge-grid) .link-button,
.knowledge-content :deep(.org-knowledge-grid) .unlink-button {
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Additional form styles */
.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 8px 0;
}

.checkbox-group input[type="checkbox"] {
  margin-top: 2px;
  flex-shrink: 0;
}

.checkbox-label {
  font-size: 0.85rem;
  color: var(--text-color);
  line-height: 1.4;
}

.help-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
  line-height: 1.3;
}

/* Exit condition help text styling */
.help-text template {
  display: block;
  padding: 6px 8px;
  background: var(--background-soft);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary-color);
  margin-top: 4px;
}



/* Override any responsive hiding that might affect buttons */
@media (max-width: 768px) {
  .knowledge-content :deep(.knowledge-grid-container) {
    padding: 4px;
  }
  
  .knowledge-content :deep(.header-actions) {
    flex-direction: column;
    gap: 4px;
  }
  
  .knowledge-content :deep(.action-button) {
    font-size: 0.65rem;
    padding: 3px 6px;
  }

  .knowledge-content :deep(.org-knowledge-grid .knowledge-grid-header),
  .knowledge-content :deep(.org-knowledge-grid .knowledge-grid-row) {
    grid-template-columns: 2fr 0fr 100px !important; /* Force 3-column layout */
  }
  
  .knowledge-content :deep(.org-knowledge-grid) .action-cell {
    display: block !important;
    grid-column: 3 !important; /* Ensure it's in the third column */
  }
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .properties-panel {
    width: 320px;
  }
}

@media (max-width: 768px) {
  .properties-panel {
    width: 100%;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1002;
    box-shadow: var(--shadow-lg);
  }
  
  .properties-footer {
    padding: var(--space-md);
  }
  
  .footer-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .btn {
    flex: 1;
    margin: 0 4px;
  }
}

/* Variables Section Styles */
.variables-count {
  background: var(--primary-color);
  color: var(--on-accent);
  border-radius: var(--radius-full);
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-left: var(--space-xs);
}

.no-variables {
  text-align: center;
  padding: var(--space-lg);
  color: var(--text-muted);
}

.no-variables p {
  margin: 0 0 var(--space-xs) 0;
  font-size: var(--text-sm);
}

.no-variables small {
  font-size: 0.75rem;
  opacity: 0.7;
}

.variables-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.variable-item {
  padding: var(--space-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--background-color);
}

.variable-item:hover {
  background: var(--background-alt);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.variable-info {
  margin-bottom: var(--space-xs);
}

.variable-name {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--text-color);
}

.variable-source {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 2px 0;
}

.variable-type {
  font-size: 0.75rem;
  color: var(--primary-color);
  background: var(--primary-soft);
  padding: 1px 6px;
  border-radius: var(--radius-xs);
  display: inline-block;
}

.variable-syntax {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.variable-syntax code {
  background: var(--background-soft);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.variables-help {
  padding: var(--space-sm);
  background: var(--background-soft);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  margin-top: var(--space-sm);
}

.variables-help small {
  color: var(--text-muted);
  line-height: 1.4;
}

.variables-help code {
  background: var(--background-color);
  padding: 1px 4px;
  border-radius: var(--radius-xs);
  font-size: 0.7rem;
  color: var(--primary-color);
  border: 1px solid var(--border-color);
}

/* Connection Status Styles */
.connection-status {
  margin-top: var(--space-xs);
}

.connection-info {
  padding: var(--space-sm);
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xs);
}

.connection-info.error {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

.connection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
}

.connection-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-xs);
  padding-bottom: var(--space-xs);
}

.connection-label {
  font-weight: 600;
  font-size: 0.85rem;
}

.connection-label.true {
  color: var(--success-color, #10B981);
}

.connection-label.false {
  color: var(--error-color, #EF4444);
}

.connection-value {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.connection-value:contains('✓') {
  color: var(--success-color, #10B981);
}

.connection-value:contains('✗') {
  color: var(--error-color, #EF4444);
}

</style> 