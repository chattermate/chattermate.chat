<!--
ChatterMate - Node Configuration Panel
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
import { ref, computed, onMounted } from 'vue'
import type { Node } from '@vue-flow/core'

const props = defineProps<{
  node: Node
  workflowId: string
}>()

const emit = defineEmits<{
  (e: 'save', config: any): void
  (e: 'cancel'): void
  (e: 'delete', nodeId: string): void
}>()

// Form state
const formData = ref({
  label: '',
  description: '',
  config: {} as Record<string, any>
})

// Initialize form data
onMounted(() => {
  formData.value = {
    label: props.node.data.label || '',
    description: props.node.data.description || '',
    config: { ...(props.node.data.config || {}) }
  }
})

// Field configuration type
interface FieldConfig {
  key: string
  label: string
  type: string
  required?: boolean
  placeholder?: string
  options?: string[]
  min?: number
  max?: number
  step?: number
  default?: any
  arrayType?: string
}

// Node type configurations
const nodeConfigs: Record<string, { fields: FieldConfig[] }> = {
  message: {
    fields: [
      { key: 'message', label: 'Message Text', type: 'textarea', required: true }
    ]
  },
  llm: {
    fields: [
      { key: 'model', label: 'AI Model', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo', 'claude-3'], required: true },
      { key: 'systemPrompt', label: 'System Prompt', type: 'textarea', required: true },
      { key: 'temperature', label: 'Temperature', type: 'number', min: 0, max: 2, step: 0.1, default: 0.7 },
      { key: 'maxTokens', label: 'Max Tokens', type: 'number', min: 1, max: 4000, default: 1000 }
    ]
  },
  condition: {
    fields: [
      { key: 'condition', label: 'Condition Expression', type: 'textarea', required: true },
      { key: 'conditionType', label: 'Condition Type', type: 'select', options: ['javascript', 'simple'], required: true }
    ]
  },
  form: {
    fields: [
      { key: 'fields', label: 'Form Fields', type: 'array', arrayType: 'object', required: true }
    ]
  },
  action: {
    fields: [
      { key: 'actionType', label: 'Action Type', type: 'select', options: ['webhook', 'email', 'api'], required: true },
      { key: 'url', label: 'URL', type: 'text', required: true },
      { key: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'POST' },
      { key: 'headers', label: 'Headers', type: 'object' },
      { key: 'body', label: 'Request Body', type: 'textarea' }
    ]
  },
  humanTransfer: {
    fields: [
      { key: 'department', label: 'Department', type: 'select', options: ['general', 'sales', 'support', 'technical'], required: true },
      { key: 'message', label: 'Transfer Message', type: 'textarea' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'], default: 'medium' }
    ]
  },
  wait: {
    fields: [
      { key: 'duration', label: 'Duration', type: 'number', min: 1, required: true },
      { key: 'unit', label: 'Time Unit', type: 'select', options: ['seconds', 'minutes', 'hours', 'days'], default: 'seconds' },
      { key: 'waitType', label: 'Wait Type', type: 'select', options: ['fixed', 'user_input'], default: 'fixed' }
    ]
  },
  end: {
    fields: [
      { key: 'endType', label: 'End Type', type: 'select', options: ['success', 'failure', 'timeout'], default: 'success' },
      { key: 'finalMessage', label: 'Final Message', type: 'textarea' }
    ]
  }
}

// Get configuration for current node type
const currentConfig = computed(() => {
  return nodeConfigs[props.node.type as keyof typeof nodeConfigs] || { fields: [] }
})

// Handle form submission
const handleSave = () => {
  emit('save', formData.value)
}

// Handle cancel
const handleCancel = () => {
  emit('cancel')
}

// Handle delete
const handleDelete = () => {
  if (confirm('Are you sure you want to delete this node?')) {
    emit('delete', props.node.id)
  }
}

// Handle array field changes
const addArrayItem = (fieldKey: string) => {
  if (!formData.value.config[fieldKey]) {
    formData.value.config[fieldKey] = []
  }
  formData.value.config[fieldKey].push({})
}

const removeArrayItem = (fieldKey: string, index: number) => {
  if (formData.value.config[fieldKey]) {
    formData.value.config[fieldKey].splice(index, 1)
  }
}

// Get node type display name
const getNodeTypeName = (type: string | undefined) => {
  if (!type) return 'Unknown'
  const names = {
    message: 'Message',
    llm: 'LLM',
    condition: 'Condition',
    form: 'Form',
    action: 'Action',
    humanTransfer: 'Human Transfer',
    wait: 'Wait',
    end: 'End'
  }
  return names[type as keyof typeof names] || type
}

// Handle object field changes
const handleObjectChange = (fieldKey: string, value: string) => {
  try {
    formData.value.config[fieldKey] = JSON.parse(value)
  } catch (e) {
    // Keep as string if not valid JSON
    formData.value.config[fieldKey] = value
  }
}
</script>

<template>
  <div class="node-config-overlay" @click="handleCancel">
    <div class="node-config-panel" @click.stop>
      <div class="panel-header">
        <div class="header-left">
          <h3>Configure {{ getNodeTypeName(node.type) }} Node</h3>
          <span class="node-id">ID: {{ node.id }}</span>
        </div>
        <button class="close-button" @click="handleCancel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="panel-content">
        <form @submit.prevent="handleSave">
          <!-- Basic Information -->
          <div class="form-section">
            <h4>Basic Information</h4>
            
            <div class="form-group">
              <label for="node-label">Node Label *</label>
              <input
                id="node-label"
                v-model="formData.label"
                type="text"
                class="form-input"
                placeholder="Enter node label"
                required
              />
            </div>

            <div class="form-group">
              <label for="node-description">Description</label>
              <textarea
                id="node-description"
                v-model="formData.description"
                class="form-textarea"
                placeholder="Enter node description (optional)"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Node-specific Configuration -->
          <div v-if="currentConfig.fields.length > 0" class="form-section">
            <h4>{{ getNodeTypeName(node.type) }} Configuration</h4>
            
            <div
              v-for="field in currentConfig.fields"
              :key="field.key"
              class="form-group"
            >
              <label :for="`config-${field.key}`">
                {{ field.label }}
                <span v-if="field.required" class="required">*</span>
              </label>

              <!-- Text Input -->
                             <input
                 v-if="field.type === 'text'"
                 :id="`config-${field.key}`"
                 v-model="formData.config[field.key]"
                 type="text"
                 class="form-input"
                 :placeholder="field.placeholder || `Enter ${field.label?.toLowerCase() || 'value'}`"
                 :required="field.required"
               />

              <!-- Number Input -->
              <input
                v-else-if="field.type === 'number'"
                :id="`config-${field.key}`"
                v-model.number="formData.config[field.key]"
                type="number"
                class="form-input"
                :min="field.min"
                :max="field.max"
                :step="field.step"
                :placeholder="field.default?.toString() || ''"
                :required="field.required"
              />

              <!-- Textarea -->
                             <textarea
                 v-else-if="field.type === 'textarea'"
                 :id="`config-${field.key}`"
                 v-model="formData.config[field.key]"
                 class="form-textarea"
                 :placeholder="field.placeholder || `Enter ${field.label?.toLowerCase() || 'value'}`"
                 rows="4"
                 :required="field.required"
               ></textarea>

              <!-- Select -->
              <select
                v-else-if="field.type === 'select'"
                :id="`config-${field.key}`"
                v-model="formData.config[field.key]"
                class="form-select"
                :required="field.required"
              >
                <option value="">Select {{ field.label.toLowerCase() }}</option>
                <option
                  v-for="option in field.options"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </select>

              <!-- Checkbox -->
              <label
                v-else-if="field.type === 'checkbox'"
                class="checkbox-label"
              >
                <input
                  :id="`config-${field.key}`"
                  v-model="formData.config[field.key]"
                  type="checkbox"
                  class="form-checkbox"
                />
                <span class="checkbox-text">{{ field.label }}</span>
              </label>

              <!-- Object (JSON) -->
              <textarea
                v-else-if="field.type === 'object'"
                :id="`config-${field.key}`"
                :value="JSON.stringify(formData.config[field.key] || {}, null, 2)"
                @input="handleObjectChange(field.key, ($event.target as HTMLTextAreaElement).value)"
                class="form-textarea"
                placeholder="Enter JSON object"
                rows="4"
              ></textarea>

              <!-- Array -->
              <div v-else-if="field.type === 'array'" class="array-field">
                <div
                  v-for="(item, index) in formData.config[field.key] || []"
                  :key="index"
                  class="array-item"
                >
                  <input
                    v-if="field.arrayType === 'string'"
                    v-model="formData.config[field.key][index]"
                    type="text"
                    class="form-input"
                    :placeholder="`${field.label} ${index + 1}`"
                  />
                  <div v-else-if="field.arrayType === 'object'" class="object-item">
                    <input
                      v-model="formData.config[field.key][index].name"
                      type="text"
                      class="form-input"
                      placeholder="Field name"
                    />
                    <select
                      v-model="formData.config[field.key][index].type"
                      class="form-select"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    class="remove-item-btn"
                    @click="removeArrayItem(field.key, index)"
                  >
                    ×
                  </button>
                </div>
                <button
                  type="button"
                  class="add-item-btn"
                  @click="addArrayItem(field.key)"
                >
                  Add {{ field.label }}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="panel-footer">
        <button type="button" class="btn btn-danger" @click="handleDelete">
          Delete Node
        </button>
        <div class="footer-actions">
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" @click="handleSave">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.node-config-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.node-config-panel {
  background: var(--background-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--background-soft);
}

.header-left h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
}

.node-id {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--background-muted);
  color: var(--text-color);
}

.close-button svg {
  width: 16px;
  height: 16px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
}

.form-section {
  margin-bottom: var(--space-xl);
}

.form-section h4 {
  margin: 0 0 var(--space-md) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--space-sm);
}

.form-group {
  margin-bottom: var(--space-md);
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: var(--space-xs);
}

.required {
  color: var(--error-color);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-color);
  font-size: var(--text-sm);
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(201, 242, 78, 0.15);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  font-weight: normal;
}

.form-checkbox {
  width: auto;
  margin: 0;
}

.checkbox-text {
  font-size: var(--text-sm);
  color: var(--text-color);
}

.array-field {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  background: var(--background-soft);
}

.array-item {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  align-items: center;
}

.object-item {
  display: flex;
  gap: var(--space-sm);
  flex: 1;
}

.remove-item-btn {
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  line-height: 1;
  flex-shrink: 0;
}

.add-item-btn {
  background: var(--primary-color);
  color: #0B0C10;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  cursor: pointer;
  font-size: var(--text-sm);
  transition: background-color 0.2s ease;
}

.add-item-btn:hover {
  background: var(--primary-dark);
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-top: 1px solid var(--border-color);
  background: var(--background-soft);
}

.footer-actions {
  display: flex;
  gap: var(--space-sm);
}

.btn {
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--text-sm);
}

.btn-primary {
  background: var(--primary-color);
  color: #0B0C10;
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

/* Responsive */
@media (max-width: 768px) {
  .node-config-panel {
    width: 95%;
    max-height: 90vh;
  }
  
  .panel-footer {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .footer-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .btn {
    flex: 1;
  }
}
</style> 