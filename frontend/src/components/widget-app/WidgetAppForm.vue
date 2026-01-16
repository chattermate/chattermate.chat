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
        placeholder="My Widget App"
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
        placeholder="Optional description..."
        maxlength="500"
        rows="3"
      />
      <span class="hint">Optional description of this app's purpose</span>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary">
        {{ app ? 'Update' : 'Create' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="emit('cancel')">
        Cancel
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
  margin-bottom: var(--space-sm);
  font-weight: 500;
  color: var(--text-color);
}

.required {
  color: var(--error-color);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--text-base);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.hint {
  display: block;
  margin-top: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.error-message {
  padding: var(--space-sm);
  background: var(--error-bg);
  color: var(--error-color);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.form-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}
</style>
