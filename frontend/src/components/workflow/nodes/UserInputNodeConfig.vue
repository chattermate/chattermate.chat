<!--
ChatterMate - User Input Node Configuration
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

interface UserInputNodeData {
  prompt_message: string
  confirmation_message: string
}

const props = defineProps<{
  modelValue: UserInputNodeData
  validationErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: UserInputNodeData): void
  (e: 'validateField', field: string): void
}>()

// Computed properties for two-way binding
const promptMessage = computed({
  get: () => props.modelValue.prompt_message,
  set: (value: string) => {
    emit('update:modelValue', { ...props.modelValue, prompt_message: value })
    emit('validateField', 'prompt_message')
  }
})

const confirmationMessage = computed({
  get: () => props.modelValue.confirmation_message,
  set: (value: string) => {
    emit('update:modelValue', { ...props.modelValue, confirmation_message: value })
    emit('validateField', 'confirmation_message')
  }
})
</script>

<template>
  <div class="user-input-config">
    <div class="form-group">
      <label for="prompt-message">Prompt Message</label>
      <textarea
        id="prompt-message"
        v-model="promptMessage"
        class="form-textarea"
        :class="{ 'error': validationErrors.prompt_message }"
        placeholder="Enter message to prompt user for input (optional)"
        rows="3"
        @blur="$emit('validateField', 'prompt_message')"
        @input="$emit('validateField', 'prompt_message')"
      ></textarea>
      <div v-if="validationErrors.prompt_message" class="error-message">
        {{ validationErrors.prompt_message }}
      </div>
      <div class="help-text">
        Optional message shown to the user to prompt for input. If left empty, no message will be displayed.
      </div>
    </div>

    <div class="form-group">
      <label for="confirmation-message">Confirmation Message</label>
      <textarea
        id="confirmation-message"
        v-model="confirmationMessage"
        class="form-textarea"
        placeholder="Optional message to show after user provides input (e.g., 'Thank you for your input!')"
        rows="2"
      ></textarea>
      <div class="help-text">
        Optional message displayed after the user submits their input. Leave empty to proceed silently to the next node.
      </div>
    </div>

    <div class="info-section">
      <div class="info-header">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"></path>
          <path d="M12,17h0"></path>
        </svg>
        <span>User Input Node Behavior</span>
      </div>
      <div class="info-content">
        <ul>
          <li>The workflow will pause at this node and wait for user input</li>
          <li>The prompt message will be displayed to the user</li>
          <li>After the user provides input, the workflow continues to the next node</li>
          <li>User input can be referenced in subsequent nodes using variables</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-input-config {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-color);
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
  min-height: 60px;
  font-family: inherit;
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

.help-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.3;
}

.info-section {
  margin-top: var(--space-sm);
  padding: var(--space-sm);
  background: var(--background-soft);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.info-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-color);
}

.info-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.info-content {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.info-content ul {
  margin: 0;
  padding-left: var(--space-md);
  list-style-type: disc;
}

.info-content li {
  margin-bottom: var(--space-xs);
}

.info-content li:last-child {
  margin-bottom: 0;
}
</style> 