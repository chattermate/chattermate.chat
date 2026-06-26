<!--
ChatterMate - Role Form
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
import { ref, onMounted, watch } from 'vue'
import type { Role } from '@/types/user'
import { listPermissions, type Permission } from '@/services/roles'

const props = defineProps<{
  role?: Role | null
}>()

const emit = defineEmits<{
  submit: [roleData: Partial<Role>]
  cancel: []
}>()

const name = ref('')
const description = ref('')
const selectedPermissions = ref<Permission[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(false)
const error = ref('')

// Watch for role prop changes to update form
watch(() => props.role, (newRole) => {
  name.value = newRole?.name || ''
  description.value = newRole?.description || ''
  selectedPermissions.value = newRole?.permissions || []
}, { immediate: true })

const fetchPermissions = async () => {
  try {
    loading.value = true
    permissions.value = await listPermissions()
  } catch (err) {
    console.error('Failed to load permissions:', err)
    error.value = 'Failed to load permissions'
  } finally {
    loading.value = false
  }
}

const handleSubmit = () => {
  if (!selectedPermissions.value.length) {
    error.value = 'Please select at least one permission'
    return
  }

  emit('submit', {
    name: name.value,
    description: description.value,
    is_default: false,
    permissions: selectedPermissions.value
  })

  // Reset form if not editing
  if (!props.role) {
    name.value = ''
    description.value = ''
    selectedPermissions.value = []
    error.value = ''
  }
}

onMounted(fetchPermissions)
</script>

<template>
  <form @submit.prevent="handleSubmit" class="role-form">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="form-group">
      <label for="name">Name</label>
      <input
        id="name"
        v-model="name"
        type="text"
        required
        class="form-input"
      />
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="description"
        class="form-input"
        rows="3"
      />
    </div>

    <div class="form-group">
      <label>Permissions</label>
      <div v-if="loading" class="loading">Loading permissions...</div>
      <div v-else class="permissions-list">
        <label 
          v-for="permission in permissions" 
          :key="permission.id"
          class="permission-item"
        >
          <input
            type="checkbox"
            :checked="selectedPermissions.map(p => p.id).includes(permission.id)"
            @change="($event) => {
              if (($event.target as HTMLInputElement).checked) {
                selectedPermissions.push(permission)
              } else {
                selectedPermissions = selectedPermissions.filter(p => p.id !== permission.id)
              }
            }"
          />
          <div class="permission-info">
            <span class="permission-name">{{ permission.name }}</span>
            <span v-if="permission.description" class="permission-description">
              {{ permission.description }}
            </span>
          </div>
        </label>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="emit('cancel')">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary">
        {{ props.role ? 'Update' : 'Create' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.role-form {
  padding: 0;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 9px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: var(--text);
}

.form-input {
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

textarea.form-input {
  resize: vertical;
  line-height: 1.5;
}

.form-input::placeholder {
  color: var(--faint);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-ink);
  box-shadow: var(--ring-focus);
}

.permissions-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid var(--o10);
  border-radius: var(--radius-input);
  padding: 10px;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 11px;
  border-radius: 9px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.permission-item:hover {
  background: var(--o04);
}

.permission-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 1px 0 0;
  flex-shrink: 0;
  accent-color: var(--accent-ink);
  cursor: pointer;
}

.permission-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.permission-name {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  word-break: break-word;
}

.permission-description {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
  line-height: 1.35;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 22px;
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

.error-message {
  color: var(--error-color);
  margin-bottom: var(--space-md);
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: var(--space-lg);
  color: var(--muted);
}
</style> 