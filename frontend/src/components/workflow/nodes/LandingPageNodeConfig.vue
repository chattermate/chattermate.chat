<!--
ChatterMate - Landing Page Node Configuration
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

interface LandingPageNodeData {
  landing_page_heading: string
  landing_page_content: string
}

const props = defineProps<{
  modelValue: LandingPageNodeData
  validationErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: LandingPageNodeData): void
  (e: 'validate-field', field: string): void
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value: LandingPageNodeData) => emit('update:model-value', value)
})

// Update form data
const updateFormData = (field: keyof LandingPageNodeData, value: any) => {
  formData.value = {
    ...formData.value,
    [field]: value
  }
  
  emit('validate-field', field)
}
</script>

<template>
  <div class="landing-page-node-config">
    <div class="form-group">
      <label for="landing-page-heading">Heading *</label>
      <input
        id="landing-page-heading"
        :value="formData.landing_page_heading"
        @input="updateFormData('landing_page_heading', ($event.target as HTMLInputElement).value)"
        @blur="$emit('validate-field', 'landing_page_heading')"
        class="form-input"
        :class="{ 'error': validationErrors.landing_page_heading }"
        placeholder="Enter a welcoming heading for your landing page"
        required
      />
      <div v-if="validationErrors.landing_page_heading" class="error-message">
        {{ validationErrors.landing_page_heading }}
      </div>
    </div>
    
    <div class="form-group">
      <label for="landing-page-content">Content *</label>
      <textarea
        id="landing-page-content"
        :value="formData.landing_page_content"
        @input="updateFormData('landing_page_content', ($event.target as HTMLTextAreaElement).value)"
        @blur="$emit('validate-field', 'landing_page_content')"
        class="form-textarea"
        :class="{ 'error': validationErrors.landing_page_content }"
        placeholder="Enter the content text for your landing page. This will be displayed below the heading."
        rows="4"
        required
      ></textarea>
      <div v-if="validationErrors.landing_page_content" class="error-message">
        {{ validationErrors.landing_page_content }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-page-node-config {
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

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(201, 242, 78, 0.15);
}

.form-input.error,
.form-textarea.error {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

.form-input.error:focus,
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