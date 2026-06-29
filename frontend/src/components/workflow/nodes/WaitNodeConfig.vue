<!--
ChatterMate - Wait Node Configuration
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

interface WaitNodeData {
  wait_duration: number
  wait_unit: string
}

const props = defineProps<{
  modelValue: WaitNodeData
  validationErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: WaitNodeData): void
  (e: 'validate-field', field: string): void
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value: WaitNodeData) => emit('update:model-value', value)
})

// Update form data
const updateFormData = (field: keyof WaitNodeData, value: any) => {
  formData.value = {
    ...formData.value,
    [field]: value
  }
  
  emit('validate-field', field)
}
</script>

<template>
  <div class="wait-node-config">
    <div class="form-group">
      <label for="wait-duration">Duration *</label>
      <input
        id="wait-duration"
        :value="formData.wait_duration"
        @input="updateFormData('wait_duration', parseInt(($event.target as HTMLInputElement).value) || 1)"
        @blur="$emit('validate-field', 'wait_duration')"
        type="number"
        class="form-input"
        :class="{ 'error': validationErrors.wait_duration }"
        min="1"
        placeholder="5"
        required
      />
      <div v-if="validationErrors.wait_duration" class="error-message">
        {{ validationErrors.wait_duration }}
      </div>
    </div>
    
    <div class="form-group">
      <label for="wait-unit">Time Unit *</label>
      <select
        id="wait-unit"
        :value="formData.wait_unit"
        @change="updateFormData('wait_unit', ($event.target as HTMLSelectElement).value)"
        @blur="$emit('validate-field', 'wait_unit')"
        class="form-select"
        :class="{ 'error': validationErrors.wait_unit }"
        required
      >
        <option value="seconds">Seconds</option>
        <option value="minutes">Minutes</option>
        <option value="hours">Hours</option>
      </select>
      <div v-if="validationErrors.wait_unit" class="error-message">
        {{ validationErrors.wait_unit }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.wait-node-config {
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