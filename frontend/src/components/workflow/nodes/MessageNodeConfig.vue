<!--
ChatterMate - Message Node Configuration
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

interface MessageNodeData {
  message_text: string
  show_typing: boolean
}

const props = defineProps<{
  modelValue: MessageNodeData
  validationErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: MessageNodeData): void
  (e: 'validate-field', field: string): void
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value: MessageNodeData) => emit('update:model-value', value)
})

// Update form data
const updateFormData = (field: keyof MessageNodeData, value: any) => {
  formData.value = {
    ...formData.value,
    [field]: value
  }
  
  emit('validate-field', field)
}
</script>

<template>
  <div class="message-node-config">
    <div class="form-group">
      <label for="message-text">Message Text *</label>
      <textarea
        id="message-text"
        :value="formData.message_text"
        @input="updateFormData('message_text', ($event.target as HTMLTextAreaElement).value)"
        @blur="$emit('validate-field', 'message_text')"
        class="form-textarea"
        :class="{ 'error': validationErrors.message_text }"
        placeholder="Enter the message to send to users"
        rows="4"
        required
      ></textarea>
      <div v-if="validationErrors.message_text" class="error-message">
        {{ validationErrors.message_text }}
      </div>
    </div>
    
    <div class="form-group">
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="formData.show_typing"
            @change="updateFormData('show_typing', ($event.target as HTMLInputElement).checked)"
            class="form-checkbox"
          />
          <span>Show typing indicator</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-node-config {
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
  box-shadow: 0 0 0 2px rgba(243, 70, 17, 0.1);
}

.form-textarea.error {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

.form-textarea.error:focus {
  border-color: var(--error-color);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
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