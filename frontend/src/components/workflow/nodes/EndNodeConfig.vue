<!--
ChatterMate - End Node Configuration
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

interface EndNodeData {
  final_message: string
}

const props = defineProps<{
  modelValue: EndNodeData
  validationErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: EndNodeData): void
  (e: 'validate-field', field: string): void
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value: EndNodeData) => emit('update:model-value', value)
})

// Update form data
const updateFormData = (field: keyof EndNodeData, value: any) => {
  formData.value = {
    ...formData.value,
    [field]: value
  }
}
</script>

<template>
  <div class="end-node-config">
    <div class="form-group">
      <label for="end-message">Final Message</label>
      <textarea
        id="end-message"
        :value="formData.final_message"
        @input="updateFormData('final_message', ($event.target as HTMLTextAreaElement).value)"
        class="form-textarea"
        placeholder="Final message to show when ending conversation"
        rows="3"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.end-node-config {
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

.form-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-color);
  font-size: 0.85rem;
  transition: border-color 0.2s ease;
  resize: vertical;
  min-height: 70px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(201, 242, 78, 0.15);
}

.form-textarea.error {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

.form-textarea.error:focus {
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