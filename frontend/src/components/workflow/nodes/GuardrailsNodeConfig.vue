<!--
ChatterMate - Guardrails Node Configuration
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
import { computed } from 'vue'

interface GuardrailsNodeData {
  enabled_guardrails: string[]
  pii_action: string
  jailbreak_sensitivity: number
  text_source: string
  block_message: string
}

interface Variable {
  nodeId: string
  nodeName: string
  fieldName: string
  fieldType: string
  fieldLabel: string
}

const props = defineProps<{
  modelValue: GuardrailsNodeData
  validationErrors: Record<string, string>
  availableVariables?: Variable[]
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: GuardrailsNodeData): void
  (e: 'validate-field', field: string): void
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value: GuardrailsNodeData) => emit('update:model-value', value)
})

// Update form data
const updateFormData = (field: keyof GuardrailsNodeData, value: any) => {
  formData.value = {
    ...formData.value,
    [field]: value
  }
  
  emit('validate-field', field)
}

// Toggle guardrail type
const toggleGuardrail = (type: string) => {
  const current = formData.value.enabled_guardrails || []
  const index = current.indexOf(type)
  
  let updated: string[]
  if (index > -1) {
    // Remove if exists
    updated = current.filter(g => g !== type)
  } else {
    // Add if doesn't exist
    updated = [...current, type]
  }
  
  updateFormData('enabled_guardrails', updated)
}

const isGuardrailEnabled = (type: string) => {
  return (formData.value.enabled_guardrails || []).includes(type)
}

// Helper to get variable syntax
const getVariableSyntax = (fieldName: string) => {
  return `{{${fieldName}}}`
}

// Copy variable to clipboard
const copyVariableToClipboard = async (variable: Variable) => {
  const syntax = getVariableSyntax(variable.fieldName)
  try {
    await navigator.clipboard.writeText(syntax)
    // Could add a toast notification here if needed
  } catch (err) {
    console.error('Failed to copy variable:', err)
  }
}
</script>

<template>
  <div class="guardrails-node-config">
    <div class="info-box">
      <p>Configure content guardrails to detect and block inappropriate content.</p>
    </div>

    <div class="form-group">
      <label>Enabled Guardrails *</label>
      <div class="guardrail-options">
        <label class="guardrail-option">
          <input
            type="checkbox"
            :checked="isGuardrailEnabled('pii')"
            @change="toggleGuardrail('pii')"
            class="form-checkbox"
          />
          <div class="guardrail-info">
            <span class="guardrail-icon">🔒</span>
            <div>
              <strong>PII Detection</strong>
              <p>Detects personally identifiable information (emails, phone numbers, SSNs, etc.)</p>
            </div>
          </div>
        </label>
        
        <label class="guardrail-option">
          <input
            type="checkbox"
            :checked="isGuardrailEnabled('jailbreak')"
            @change="toggleGuardrail('jailbreak')"
            class="form-checkbox"
          />
          <div class="guardrail-info">
            <span class="guardrail-icon">⚠️</span>
            <div>
              <strong>Jailbreak Detection</strong>
              <p>Detects attempts to bypass AI safety guidelines or manipulate system prompts</p>
            </div>
          </div>
        </label>
      </div>
      <div v-if="validationErrors.enabled_guardrails" class="error-message">
        {{ validationErrors.enabled_guardrails }}
      </div>
    </div>

    <!-- PII Action -->
    <div v-if="isGuardrailEnabled('pii')" class="form-group">
      <label for="pii-action">PII Action</label>
      <select
        id="pii-action"
        :value="formData.pii_action"
        @change="updateFormData('pii_action', ($event.target as HTMLSelectElement).value)"
        class="form-select"
      >
        <option value="block">Block - Stop processing if PII detected</option>
        <option value="redact">Redact - Replace PII with placeholders</option>
        <option value="warning">Warning - Log but allow processing</option>
        <option value="log">Log - Only log detection</option>
      </select>
    </div>

    <!-- Jailbreak Sensitivity -->
    <div v-if="isGuardrailEnabled('jailbreak')" class="form-group">
      <label for="jailbreak-sensitivity">
        Jailbreak Sensitivity: {{ formData.jailbreak_sensitivity?.toFixed(1) || '0.7' }}
      </label>
      <input
        id="jailbreak-sensitivity"
        type="range"
        :value="formData.jailbreak_sensitivity || 0.7"
        @input="updateFormData('jailbreak_sensitivity', parseFloat(($event.target as HTMLInputElement).value))"
        min="0.1"
        max="1.0"
        step="0.1"
        class="form-range"
      />
      <div class="range-labels">
        <span>Less Sensitive (0.1)</span>
        <span>More Sensitive (1.0)</span>
      </div>
      <small class="help-text">
        Higher sensitivity = more likely to detect potential jailbreak attempts
      </small>
    </div>

    <div class="form-group">
      <label for="text-source">Text Source</label>
      <input
        id="text-source"
        type="text"
        :value="formData.text_source"
        @input="updateFormData('text_source', ($event.target as HTMLInputElement).value)"
        class="form-input"
        placeholder="user_message or user_input_input"
      />
      <small class="help-text">
        Specify what text to check. Use "user_message" for the latest user input, or reference a variable like "user_input_input" or use double curly braces syntax
      </small>
    </div>

    <!-- Available Variables Section -->
    <div v-if="availableVariables && availableVariables.length > 0" class="variables-section">
      <div class="variables-header">
        <span class="variables-title">Available Variables</span>
        <span class="variables-count">{{ availableVariables.length }}</span>
      </div>
      
      <div class="variables-list">
        <div
          v-for="variable in availableVariables"
          :key="`${variable.nodeId}-${variable.fieldName}`"
          class="variable-item"
          @click="copyVariableToClipboard(variable)"
          :title="`Click to copy ${getVariableSyntax(variable.fieldName)} to clipboard`"
        >
          <div class="variable-info">
            <div class="variable-name">{{ variable.fieldName }}</div>
            <div class="variable-source">from {{ variable.nodeName }}</div>
          </div>
          <div class="variable-syntax">
            <code>{{ getVariableSyntax(variable.fieldName) }}</code>
          </div>
        </div>
      </div>
      
      <div class="variables-help">
        <small>Click on any variable to copy it to clipboard</small>
      </div>
    </div>

    <div class="form-group">
      <label for="block-message">Custom Block Message</label>
      <textarea
        id="block-message"
        :value="formData.block_message"
        @input="updateFormData('block_message', ($event.target as HTMLTextAreaElement).value)"
        class="form-textarea"
        placeholder="Optional: Custom message to show when content is blocked"
        rows="3"
      ></textarea>
      <small class="help-text">
        Leave empty to use default block messages
      </small>
    </div>


  </div>
</template>

<style scoped>
.guardrails-node-config {
  width: 100%;
}

.info-box {
  background: var(--color-bg-tertiary, #f8f9fa);
  border-left: 3px solid var(--color-primary, #3b82f6);
  padding: var(--space-xs);
  margin-bottom: var(--space-sm);
  border-radius: 4px;
}

.info-box p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #6b7280);
}

.info-box ul {
  margin: var(--space-xs) 0 0 0;
  padding-left: 1.5rem;
}

.info-box li {
  margin: 0.25rem 0;
  font-size: 0.85rem;
}

.routing-info {
  border-left-color: var(--color-accent, #ec4899);
}

.form-group {
  margin-bottom: var(--space-sm);
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
  margin-bottom: var(--space-xs);
}

.guardrail-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.guardrail-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  padding: var(--space-xs);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.guardrail-option:hover {
  background: var(--color-bg-secondary, #f9fafb);
  border-color: var(--color-primary, #3b82f6);
}

.guardrail-option input[type="checkbox"] {
  margin-top: 0.2rem;
}

.guardrail-info {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  flex: 1;
}

.guardrail-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.guardrail-info strong {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.guardrail-info p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary, #6b7280);
  font-weight: normal;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: var(--space-xs);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 4px;
  font-size: 0.85rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
}

.form-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--color-bg-tertiary, #e5e7eb);
  outline: none;
  -webkit-appearance: none;
}

.form-range::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary, #3b82f6);
  cursor: pointer;
}

.form-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary, #3b82f6);
  cursor: pointer;
  border: none;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
}

.range-labels span {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #6b7280);
}

.help-text {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 0.25rem;
}

.error-message {
  color: var(--color-error, #ef4444);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-checkbox {
  cursor: pointer;
}

/* Variables Section */
.variables-section {
  margin-top: var(--space-sm);
  padding: var(--space-sm);
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.variables-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
}

.variables-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color);
}

.variables-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.variables-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.variable-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.variable-item:hover {
  background: var(--background-alt);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.variable-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.variable-name {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--text-color);
  word-break: break-word;
}

.variable-source {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 2px 0;
}

.variable-syntax {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-top: 2px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.variable-syntax code {
  background: var(--background-soft);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  white-space: nowrap;
}

.variables-help {
  padding: var(--space-sm);
  background: var(--background-soft);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  margin-top: var(--space-xs);
}

.variables-help small {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.3;
}
</style>
