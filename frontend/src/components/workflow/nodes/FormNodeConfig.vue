<!--
ChatterMate - Form Node Configuration
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

// Define form field interface
interface FormField {
  name: string
  label: string
  type: string
  required: boolean
  placeholder: string
  options: string | string[] // Can be string (for textarea display) or array (when saved)
  minLength: number
  maxLength: number
}

interface FormNodeData {
  form_title: string
  form_description: string
  submit_button_text: string
  form_full_screen: boolean
  form_fields: FormField[]
}

const props = defineProps<{
  modelValue: FormNodeData
  validationErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: FormNodeData): void
  (e: 'validate-field', field: string): void
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value: FormNodeData) => emit('update:model-value', value)
})

// Get field type icon
const getFieldTypeIcon = (type: string) => {
  const icons = {
    text: '📝',
    email: '📧',
    number: '🔢',
    tel: '📞',
    textarea: '📄',
    select: '📋',
    checkbox: '☑️',
    radio: '🔘'
  }
  return icons[type as keyof typeof icons] || '📝'
}

// Add form field
const addFormField = () => {
  const updatedFields = [...formData.value.form_fields, {
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: '',
    minLength: 0,
    maxLength: 255
  }]
  
  formData.value = {
    ...formData.value,
    form_fields: updatedFields
  }
  
  // Trigger validation for form fields
  emit('validate-field', 'form_fields')
}

// Remove form field
const removeFormField = (index: number) => {
  const updatedFields = formData.value.form_fields.filter((_, i) => i !== index)
  
  formData.value = {
    ...formData.value,
    form_fields: updatedFields
  }
  
  // Trigger validation for form fields
  emit('validate-field', 'form_fields')
}

// Update individual field
const updateField = (index: number, field: string, value: any) => {
  const updatedFields = [...formData.value.form_fields]
  updatedFields[index] = {
    ...updatedFields[index],
    [field]: value
  }
  
  formData.value = {
    ...formData.value,
    form_fields: updatedFields
  }
  
  emit('validate-field', 'form_fields')
}

// Update form data
const updateFormData = (field: keyof FormNodeData, value: any) => {
  formData.value = {
    ...formData.value,
    [field]: value
  }
  
  if (field !== 'form_fields') {
    emit('validate-field', field)
  }
}
</script>

<template>
  <div class="form-node-config">
    <div class="form-group">
      <label for="form-title">Form Title</label>
      <input
        id="form-title"
        :value="formData.form_title"
        @input="updateFormData('form_title', ($event.target as HTMLInputElement).value)"
        type="text"
        class="form-input"
        placeholder="Enter form title"
      />
    </div>
    
    <div class="form-group">
      <label for="form-description">Form Description</label>
      <textarea
        id="form-description"
        :value="formData.form_description"
        @input="updateFormData('form_description', ($event.target as HTMLTextAreaElement).value)"
        class="form-textarea"
        placeholder="Enter form description (optional)"
        rows="3"
      ></textarea>
    </div>
    
    <div class="form-group">
      <label for="submit-button-text">Submit Button Text</label>
      <input
        id="submit-button-text"
        :value="formData.submit_button_text"
        @input="updateFormData('submit_button_text', ($event.target as HTMLInputElement).value)"
        type="text"
        class="form-input"
        placeholder="Submit"
      />
    </div>
    
    <div class="form-group">
      <label class="checkbox-group">
        <input
          :checked="formData.form_full_screen"
          @change="updateFormData('form_full_screen', ($event.target as HTMLInputElement).checked)"
          type="checkbox"
          class="form-checkbox"
        />
        <span class="checkbox-label">Display form in full screen mode</span>
      </label>
      <p class="help-text">When enabled, the form will be displayed as a full screen overlay instead of within the chat interface</p>
    </div>
    
    <div class="form-group">
      <label>Form Fields</label>
      <div class="form-fields-container" :class="{ 'error': validationErrors.form_fields }">
        <div
          v-for="(field, index) in formData.form_fields"
          :key="index"
          class="form-field-item"
        >
          <div class="form-field-header">
            <span class="field-type-badge" :class="`field-type-${field.type}`">
              {{ getFieldTypeIcon(field.type) }} {{ field.type }}
            </span>
            <button
              type="button"
              class="remove-field-btn"
              @click="removeFormField(index)"
              title="Remove field"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="form-field-config">
            <div class="field-row">
              <div class="field-col">
                <label class="field-label">Field Name *</label>
                <input
                  :value="field.name"
                  @input="updateField(index, 'name', ($event.target as HTMLInputElement).value)"
                  @blur="$emit('validate-field', 'form_fields')"
                  type="text"
                  class="field-input"
                  placeholder="field_name"
                  required
                />
              </div>
              <div class="field-col">
                <label class="field-label">Display Label *</label>
                <input
                  :value="field.label"
                  @input="updateField(index, 'label', ($event.target as HTMLInputElement).value)"
                  @blur="$emit('validate-field', 'form_fields')"
                  type="text"
                  class="field-input"
                  placeholder="Field Label"
                  required
                />
              </div>
            </div>
            
            <div class="field-row">
              <div class="field-col">
                <label class="field-label">Field Type</label>
                <select 
                  :value="field.type" 
                  @change="updateField(index, 'type', ($event.target as HTMLSelectElement).value)"
                  class="field-select"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="tel">Phone</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="radio">Radio</option>
                </select>
              </div>
              <div class="field-col">
                <label class="field-label">Required</label>
                <label class="checkbox-label">
                  <input
                    :checked="field.required"
                    @change="updateField(index, 'required', ($event.target as HTMLInputElement).checked)"
                    type="checkbox"
                    class="form-checkbox"
                  />
                  <span>Required field</span>
                </label>
              </div>
            </div>
            
            <div class="field-row">
              <div class="field-col-full">
                <label class="field-label">Placeholder</label>
                <input
                  :value="field.placeholder"
                  @input="updateField(index, 'placeholder', ($event.target as HTMLInputElement).value)"
                  @blur="$emit('validate-field', 'form_fields')"
                  type="text"
                  class="field-input"
                  placeholder="Enter placeholder text"
                />
              </div>
            </div>
            
            <!-- Options for select/radio fields -->
            <div v-if="field.type === 'select' || field.type === 'radio'" class="field-row">
              <div class="field-col-full">
                <label class="field-label">Options (one per line)</label>
                <textarea
                  :value="Array.isArray(field.options) ? field.options.join('\n') : field.options"
                  @input="updateField(index, 'options', ($event.target as HTMLTextAreaElement).value)"
                  @blur="$emit('validate-field', 'form_fields')"
                  class="field-textarea"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <!-- Validation for text fields -->
            <div v-if="field.type === 'text' || field.type === 'textarea'" class="field-row">
              <div class="field-col">
                <label class="field-label">Min Length</label>
                <input
                  :value="field.minLength"
                  @input="updateField(index, 'minLength', parseInt(($event.target as HTMLInputElement).value) || 0)"
                  @blur="$emit('validate-field', 'form_fields')"
                  type="number"
                  class="field-input"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div class="field-col">
                <label class="field-label">Max Length</label>
                <input
                  :value="field.maxLength"
                  @input="updateField(index, 'maxLength', parseInt(($event.target as HTMLInputElement).value) || 255)"
                  @blur="$emit('validate-field', 'form_fields')"
                  type="number"
                  class="field-input"
                  min="1"
                  placeholder="255"
                />
              </div>
            </div>
          </div>
        </div>
        
        <button
          type="button"
          class="add-field-btn"
          @click="addFormField"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Form Field
        </button>
      </div>
      <div v-if="validationErrors.form_fields" class="error-message">
        {{ validationErrors.form_fields }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-node-config {
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

.form-textarea {
  resize: vertical;
  min-height: 70px;
}

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
  cursor: pointer;
  user-select: none;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.help-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
  line-height: 1.3;
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

/* Form Fields Styles */
.form-fields-container {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  padding: var(--space-sm);
  max-height: none;
  overflow: visible;
}

.form-fields-container.error {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

.form-field-item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-soft);
  margin-bottom: var(--space-sm);
  overflow: hidden;
}

.form-field-item:last-child {
  margin-bottom: 0;
}

.form-field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--background-muted);
  border-bottom: 1px solid var(--border-color);
}

.field-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: capitalize;
  background: var(--primary-soft);
  color: var(--primary-color);
}

.remove-field-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-field-btn:hover {
  background: var(--error-color);
  color: white;
}

.remove-field-btn svg {
  width: 12px;
  height: 12px;
}

.form-field-config {
  padding: var(--space-md);
}

.field-row {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.field-row:last-child {
  margin-bottom: 0;
}

.field-col {
  flex: 1;
}

.field-col-full {
  flex: 1;
  width: 100%;
}

.field-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.field-input,
.field-textarea,
.field-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--background-color);
  color: var(--text-color);
  font-size: 0.75rem;
  transition: border-color 0.2s ease;
}

.field-input:focus,
.field-textarea:focus,
.field-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px rgba(201, 242, 78, 0.15);
}

.field-input.error,
.field-textarea.error,
.field-select.error {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

.field-textarea {
  resize: vertical;
  min-height: 60px;
}

.add-field-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  width: 100%;
  padding: var(--space-sm);
  background: var(--background-muted);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  font-weight: 500;
}

.add-field-btn:hover {
  background: var(--primary-soft);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.add-field-btn svg {
  width: 14px;
  height: 14px;
}
</style> 