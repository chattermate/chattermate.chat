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
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

interface ConditionRule {
  id: string
  variable: string
  operator: string
  value: string
}

interface ConditionGroup {
  id: string
  rules: ConditionRule[]
  logicalOperator: 'AND' | 'OR'
}

interface ConditionNodeData {
  condition_expression: string
  condition_groups?: ConditionGroup[]
}

interface Variable {
  nodeId: string
  nodeName: string
  fieldName: string
  fieldType: string
  fieldLabel: string
}

const props = defineProps<{
  modelValue: ConditionNodeData
  validationErrors: Record<string, string>
  availableVariables?: Variable[]
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: ConditionNodeData): void
  (e: 'validate-field', field: string): void
}>()

// Available operators
const operators = [
  { value: '===', label: 'equals' },
  { value: '!==', label: 'not equals' },
  { value: '>', label: 'greater than' },
  { value: '<', label: 'less than' },
  { value: '>=', label: 'greater than or equal' },
  { value: '<=', label: 'less than or equal' },
  { value: 'includes', label: 'contains' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'endsWith', label: 'ends with' }
]

// Initialize condition groups from existing data or create default
const conditionGroups = ref<ConditionGroup[]>(
  props.modelValue.condition_groups || [
    {
      id: generateId(),
      rules: [
        {
          id: generateId(),
          variable: '',
          operator: '===',
          value: ''
        }
      ],
      logicalOperator: 'AND'
    }
  ]
)

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Factory for default condition group structure
function createDefaultConditionGroups(): ConditionGroup[] {
  return [
    {
      id: generateId(),
      rules: [
        { id: generateId(), variable: '', operator: '===', value: '' }
      ],
      logicalOperator: 'AND'
    }
  ]
}

// Keep local state in sync when switching nodes or external updates occur
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && Array.isArray(newValue.condition_groups)) {
      conditionGroups.value = newValue.condition_groups.length > 0
        ? newValue.condition_groups
        : createDefaultConditionGroups()
    } else {
      conditionGroups.value = createDefaultConditionGroups()
    }
  },
  { deep: true, immediate: true }
)

// Update condition groups and generate expression
const updateConditions = () => {
  const expression = generateConditionExpression()
  const updatedData: ConditionNodeData = {
    condition_expression: expression,
    condition_groups: conditionGroups.value
  }
  
  emit('update:model-value', updatedData)
  emit('validate-field', 'condition_expression')
  emit('validate-field', 'condition_groups')
}

// Generate JavaScript expression from condition groups
const generateConditionExpression = (): string => {
  if (conditionGroups.value.length === 0) return ''
  
  const groupExpressions = conditionGroups.value.map(group => {
    if (group.rules.length === 0) return ''
    
    const ruleExpressions = group.rules
      .filter(rule => rule.variable && rule.operator && rule.value)
      .map(rule => {
        const variable = `{{${rule.variable}}}`
        const value = isNaN(Number(rule.value)) ? `"${rule.value}"` : rule.value
        
        if (rule.operator === 'includes') {
          return `${variable}.includes(${value})`
        } else if (rule.operator === 'startsWith') {
          return `${variable}.startsWith(${value})`
        } else if (rule.operator === 'endsWith') {
          return `${variable}.endsWith(${value})`
        } else {
          return `${variable} ${rule.operator} ${value}`
        }
      })
    
    if (ruleExpressions.length === 0) return ''
    if (ruleExpressions.length === 1) return ruleExpressions[0]
    
    return `(${ruleExpressions.join(` ${group.logicalOperator} `)})`
  }).filter(expr => expr)
  
  if (groupExpressions.length === 0) return ''
  if (groupExpressions.length === 1) return groupExpressions[0]
  
  return groupExpressions.join(' OR ')
}

// Add new rule to a group
const addRule = (groupId: string) => {
  const group = conditionGroups.value.find(g => g.id === groupId)
  if (group) {
    group.rules.push({
      id: generateId(),
      variable: '',
      operator: '===',
      value: ''
    })
    updateConditions()
  }
}

// Remove rule from a group
const removeRule = (groupId: string, ruleId: string) => {
  const group = conditionGroups.value.find(g => g.id === groupId)
  if (group && group.rules.length > 1) {
    group.rules = group.rules.filter(r => r.id !== ruleId)
    updateConditions()
  }
}

// Add new condition group
const addGroup = () => {
  conditionGroups.value.push({
    id: generateId(),
    rules: [
      {
        id: generateId(),
        variable: '',
        operator: '===',
        value: ''
      }
    ],
    logicalOperator: 'AND'
  })
  updateConditions()
}

// Remove condition group
const removeGroup = (groupId: string) => {
  if (conditionGroups.value.length > 1) {
    conditionGroups.value = conditionGroups.value.filter(g => g.id !== groupId)
    updateConditions()
  }
}

// Update rule
const updateRule = (groupId: string, ruleId: string, field: keyof ConditionRule, value: string) => {
  const group = conditionGroups.value.find(g => g.id === groupId)
  if (group) {
    const rule = group.rules.find(r => r.id === ruleId)
    if (rule) {
      rule[field] = value
      updateConditions()
    }
  }
}

// Update group logical operator
const updateGroupOperator = (groupId: string, operator: 'AND' | 'OR') => {
  const group = conditionGroups.value.find(g => g.id === groupId)
  if (group) {
    group.logicalOperator = operator
    updateConditions()
  }
}
</script>

<template>
  <div class="condition-node-config">
    <!-- Condition Builder -->
    <div class="form-group">
      <label>Condition Rules *</label>
      
      <div v-if="!availableVariables || availableVariables.length === 0" class="no-variables">
        <p>No variables available. Add form or user input nodes before this condition node to use their values in conditions.</p>
      </div>
      
      <div v-else class="condition-builder">
        <div 
          v-for="(group, groupIndex) in conditionGroups" 
          :key="group.id"
          class="condition-group"
        >
          <!-- Group Header -->
          <div v-if="groupIndex > 0" class="group-separator">
            <span class="separator-text">OR</span>
          </div>
          
          <div class="group-content">
            <!-- Rules within the group -->
            <div 
              v-for="(rule, ruleIndex) in group.rules" 
              :key="rule.id"
              class="condition-rule"
            >
              <!-- Rule logical operator (AND/OR) -->
              <div v-if="ruleIndex > 0" class="rule-operator">
                <select 
                  :value="group.logicalOperator"
                  @change="updateGroupOperator(group.id, ($event.target as HTMLSelectElement).value as 'AND' | 'OR')"
                  class="operator-select"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>
              
              <!-- Rule configuration -->
              <div class="rule-config">
                <!-- Variable selection -->
                <select 
                  :value="rule.variable"
                  @change="updateRule(group.id, rule.id, 'variable', ($event.target as HTMLSelectElement).value)"
                  class="variable-select"
                >
                  <option value="">Select variable</option>
                  <option 
                    v-for="variable in availableVariables" 
                    :key="variable.fieldName"
                    :value="variable.fieldName"
                  >
                    {{ variable.fieldLabel }}
                  </option>
                </select>
                
                <!-- Operator selection -->
                <select 
                  :value="rule.operator"
                  @change="updateRule(group.id, rule.id, 'operator', ($event.target as HTMLSelectElement).value)"
                  class="operator-select"
                >
                  <option 
                    v-for="op in operators" 
                    :key="op.value"
                    :value="op.value"
                  >
                    {{ op.label }}
                  </option>
                </select>
                
                <!-- Value input -->
                <input 
                  type="text"
                  :value="rule.value"
                  @input="updateRule(group.id, rule.id, 'value', ($event.target as HTMLInputElement).value)"
                  placeholder="Enter value"
                  class="value-input"
                />
                
                <!-- Remove rule button -->
                <button 
                  v-if="group.rules.length > 1"
                  type="button"
                  @click="removeRule(group.id, rule.id)"
                  class="remove-btn rule-remove"
                  title="Remove rule"
                >
                  ×
                </button>
              </div>
            </div>
            
            <!-- Add rule button -->
            <button 
              type="button"
              @click="addRule(group.id)"
              class="add-btn add-rule"
            >
              + Add Rule
            </button>
          </div>
          
          <!-- Remove group button -->
          <button 
            v-if="conditionGroups.length > 1"
            type="button"
            @click="removeGroup(group.id)"
            class="remove-btn group-remove"
            title="Remove group"
          >
            ×
          </button>
        </div>
        
        <!-- Add group button -->
        <button 
          type="button"
          @click="addGroup"
          class="add-btn add-group"
        >
          + Add Group (OR)
        </button>
      </div>
      
      <!-- Generated expression preview -->
      <div v-if="generateConditionExpression()" class="expression-preview">
        <label>Generated Expression:</label>
        <code class="expression-code">{{ generateConditionExpression() }}</code>
      </div>
      
      <div v-if="validationErrors.condition_expression" class="error-message">
        {{ validationErrors.condition_expression }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.condition-node-config {
  width: 100%;
}

.form-group {
  margin-bottom: var(--space-sm);
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 8px;
}

.no-variables {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
  margin: 8px 0;
  padding: 12px;
  background: var(--background-soft);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-color);
}

.condition-builder {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.condition-group {
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px;
  background: var(--background-soft);
}

.group-separator {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}

.separator-text {
  background: var(--background-color);
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.group-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.condition-rule {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-operator {
  display: flex;
  justify-content: center;
}

.rule-config {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.variable-select,
.operator-select {
  flex: 1;
  min-width: 120px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--background-color);
  color: var(--text-color);
  font-size: 0.8rem;
}

.value-input {
  flex: 1;
  min-width: 100px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--background-color);
  color: var(--text-color);
  font-size: 0.8rem;
}

.variable-select:focus,
.operator-select:focus,
.value-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(201, 242, 78, 0.15);
}

.add-btn {
  padding: 6px 12px;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(201, 242, 78, 0.05);
}

.add-rule {
  align-self: flex-start;
  margin-top: 4px;
}

.add-group {
  align-self: center;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: var(--error-color);
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: var(--error-dark, #dc2626);
  transform: scale(1.1);
}

.group-remove {
  position: absolute;
  top: -8px;
  right: -8px;
}

.rule-remove {
  margin-left: 4px;
}

.expression-preview {
  margin-top: 12px;
  padding: 8px;
  background: var(--background-alt);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.expression-preview label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.expression-code {
  display: block;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: var(--text-color);
  background: var(--background-color);
  padding: 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  word-break: break-all;
  white-space: pre-wrap;
}

.error-message {
  color: var(--error-color);
  font-size: 0.75rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-message::before {
  content: "⚠";
  font-size: 0.8rem;
}
</style> 