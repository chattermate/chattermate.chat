<!--
ChatterMate - Widget App Form
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
import { ref } from 'vue'
import type { WidgetApp, WidgetAppCreate } from '@/types/widget-app'

const props = defineProps<{
  app?: WidgetApp | null
}>()

// Always emit WidgetAppCreate since the form requires name
// The parent component uses this for both create and update operations
const emit = defineEmits<{
  submit: [data: WidgetAppCreate]
  cancel: []
}>()

const name = ref(props.app?.name || '')
const description = ref(props.app?.description || '')
const error = ref('')

const handleSubmit = () => {
  error.value = ''

  if (!name.value.trim()) {
    error.value = 'Name is required'
    return
  }

  if (name.value.length > 100) {
    error.value = 'Name must be less than 100 characters'
    return
  }

  if (description.value && description.value.length > 500) {
    error.value = 'Description must be less than 500 characters'
    return
  }

  emit('submit', {
    name: name.value.trim(),
    description: description.value.trim() || undefined
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="widget-app-form">
    <div class="form-group">
      <label for="name">Name <span class="required">*</span></label>
      <input
        id="name"
        v-model="name"
        type="text"
        placeholder="e.g. Marketing Site"
        maxlength="100"
        required
      />
      <span class="hint">A descriptive name for this widget app</span>
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="description"
        placeholder="Where will this widget live?"
        maxlength="500"
        rows="3"
      />
      <span class="hint">Optional description of this app's purpose</span>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="emit('cancel')">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary">
        {{ app ? 'Update app' : 'Create app' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.widget-app-form {
  padding: var(--space-md);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-group label {
  display: block;
  margin-bottom: 9px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: var(--text);
}

.required {
  color: var(--c-coral);
}

.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 15px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: var(--radius-input);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 14.5px;
}

.form-group textarea {
  resize: vertical;
  line-height: 1.5;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--faint);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent-ink);
  box-shadow: var(--ring-focus);
}

.hint {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--muted);
}

.error-message {
  padding: var(--space-sm) var(--space-md);
  background: var(--error-bg);
  color: var(--error-color);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: var(--space-lg);
}

.btn {
  padding: 12px 22px;
  border-radius: var(--radius-btn);
  font-family: var(--font-sans);
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast), filter var(--transition-fast);
}

.btn-primary {
  background: var(--accent-ink);
  color: var(--on-accent);
  border: none;
}

.btn-primary:hover {
  filter: brightness(1.05);
}

.btn-secondary {
  background: var(--o05);
  border: 1px solid var(--o14);
  color: var(--text);
}

.btn-secondary:hover {
  background: var(--o10);
}
</style>
