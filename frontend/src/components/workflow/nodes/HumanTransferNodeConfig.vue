<!--
ChatterMate - Human Transfer Node Configuration
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

interface HumanTransferNodeData {
  transfer_department: string
  transfer_message: string
}

const props = defineProps<{
  modelValue: HumanTransferNodeData
  validationErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: HumanTransferNodeData): void
  (e: 'validate-field', field: string): void
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value: HumanTransferNodeData) => emit('update:model-value', value)
})

// Update form data
const updateFormData = (field: keyof HumanTransferNodeData, value: any) => {
  formData.value = {
    ...formData.value,
    [field]: value
  }
  
  emit('validate-field', field)
}
</script>

<template>
  <div class="human-transfer-node-config">
    <div class="form-group">
      <label for="transfer-department">Department *</label>
      <select
        id="transfer-department"
        :value="formData.transfer_department"
        @change="updateFormData('transfer_department', ($event.target as HTMLSelectElement).value)"
        @blur="$emit('validate-field', 'transfer_department')"
        class="form-select"
        :class="{ 'error': validationErrors.transfer_department }"
        required
      >
        <option value="">Select department</option>
        <option value="general">General Support</option>
        <option value="sales">Sales</option>
        <option value="technical">Technical Support</option>
      </select>
      <div v-if="validationErrors.transfer_department" class="error-message">
        {{ validationErrors.transfer_department }}
      </div>
    </div>
    
    <div class="form-group">
      <label for="transfer-message">Transfer Message</label>
      <textarea
        id="transfer-message"
        :value="formData.transfer_message"
        @input="updateFormData('transfer_message', ($event.target as HTMLTextAreaElement).value)"
        class="form-textarea"
        placeholder="Message to show when transferring to human agent"
        rows="3"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.human-transfer-node-config {
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

.form-select,
.form-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-color);
  font-size: 0.85rem;
  transition: border-color 0.2s ease;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(201, 242, 78, 0.15);
}

.form-select.error,
.form-textarea.error {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

.form-select.error:focus,
.form-textarea.error:focus {
  border-color: var(--error-color);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 70px;
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