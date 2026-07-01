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
import { computed } from 'vue'

interface ActionNodeData {
  action_type: string
  action_url: string
}

const props = defineProps<{
  modelValue: ActionNodeData
  validationErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: ActionNodeData): void
  (e: 'validate-field', field: string): void
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value: ActionNodeData) => emit('update:model-value', value)
})

// Update form data
const updateFormData = (field: keyof ActionNodeData, value: any) => {
  formData.value = {
    ...formData.value,
    [field]: value
  }
  
  emit('validate-field', field)
}
</script>

<template>
  <div class="action-node-config">
    <div class="form-group">
      <label for="action-type">Action Type *</label>
      <select
        id="action-type"
        :value="formData.action_type"
        @change="updateFormData('action_type', ($event.target as HTMLSelectElement).value)"
        @blur="$emit('validate-field', 'action_type')"
        class="form-select"
        :class="{ 'error': validationErrors.action_type }"
        required
      >
        <option value="">Select action type</option>
        <option value="webhook">Webhook</option>
        <option value="email">Send Email</option>
        <option value="api">API Call</option>
      </select>
      <div v-if="validationErrors.action_type" class="error-message">
        {{ validationErrors.action_type }}
      </div>
    </div>
    
    <div class="form-group">
      <label for="action-url">URL *</label>
      <input
        id="action-url"
        :value="formData.action_url"
        @input="updateFormData('action_url', ($event.target as HTMLInputElement).value)"
        @blur="$emit('validate-field', 'action_url')"
        type="url"
        class="form-input"
        :class="{ 'error': validationErrors.action_url }"
        placeholder="https://example.com/webhook"
        required
      />
      <div v-if="validationErrors.action_url" class="error-message">
        {{ validationErrors.action_url }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.action-node-config {
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
  margin-bottom: 4px;
}

.form-input,
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
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(201, 242, 78, 0.15);
}

.form-input.error,
.form-select.error {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

.form-input.error:focus,
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
</style> 