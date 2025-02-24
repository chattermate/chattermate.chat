<!--
ChatterMate - Role List
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
import { onMounted } from 'vue'
import Modal from '@/components/common/Modal.vue'
import RoleForm from './RoleForm.vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import { useRoles } from '@/composables/useRoles'

const {
  roles,
  loading,
  error,
  showCreateModal,
  showEditModal,
  showDeleteModal,
  selectedRole,
  fetchRoles,
  handleCreateRole,
  handleEditRole,
  handleUpdateRole,
  handleDeleteRole,
  confirmDeleteRole,
  openCreateModal,
  deleteError
} = useRoles()

onMounted(fetchRoles)
</script>

<template>
  <div class="role-list">
    <header class="page-header">
      <h1>Roles</h1>
      <button class="btn btn-primary" @click="openCreateModal">
        <span class="icon">+</span>
        Add Role
      </button>
    </header>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading">Loading roles...</div>
    
    <div v-else-if="roles.length > 0" class="roles-grid">
      <div 
        v-for="role in roles" 
        :key="role.id" 
        class="role-card"
        :data-default="role.is_default"
      >
        <div class="role-info">
          <div class="role-details">
            <h3>{{ role.name }}</h3>
            <p v-if="role.description" class="description">{{ role.description }}</p>
            <div class="permissions-list" v-if="role.permissions?.length">
              <div class="permissions-label">Permissions:</div>
              <div class="permission-badges">
                <span v-for="permission in role.permissions" :key="permission.id" class="permission-badge">
                  {{ permission.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Menu as="div" class="role-menu">
          <MenuButton class="menu-button">
            <EllipsisVerticalIcon class="h-5 w-5" />
          </MenuButton>

          <MenuItems class="menu-items">
            <MenuItem v-slot="{ active }">
              <button 
                :class="['menu-item', { active }]"
                @click="handleEditRole(role)"
                :disabled="role.is_default"
                :title="role.is_default ? 'Cannot edit default role' : ''"
              >
                Edit Role
              </button>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <button 
                :class="['menu-item delete', { active }]"
                @click="handleDeleteRole(role)"
                :disabled="role.is_default"
                :title="role.is_default ? 'Cannot delete default role' : ''"
              >
                Delete Role
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-content">
        <h3>No Roles Found</h3>
        <p>Create your first role to manage user permissions</p>
        <button class="btn btn-primary" @click="openCreateModal">
          <span class="icon">+</span>
          Create Role
        </button>
      </div>
    </div>

    <!-- Create/Edit Role Modal -->
    <Modal v-if="showCreateModal || showEditModal" 
           @close="showCreateModal ? (showCreateModal = false) : (showEditModal = false)">
      <template #title>{{ showCreateModal ? 'Create Role' : 'Edit Role' }}</template>
      <template #content>
        <RoleForm
          :role="selectedRole"
          @submit="(data) => showCreateModal ? handleCreateRole(data) : handleUpdateRole(data)"
          @cancel="showCreateModal ? (showCreateModal = false) : (showEditModal = false)"
        />
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #title>Delete Role</template>
      <template #content>
        <div class="delete-confirmation">
          <div v-if="deleteError" class="error-message">
            {{ deleteError }}
          </div>
          <p>Are you sure you want to delete "{{ selectedRole?.name }}"?</p>
          <p class="warning">This action cannot be undone.</p>
          <div class="form-actions">
            <button class="btn btn-secondary" @click="showDeleteModal = false">
              Cancel
            </button>
            <button 
              class="btn btn-danger" 
              @click="confirmDeleteRole"
              :disabled="loading"
            >
              {{ loading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.role-list {
  padding: var(--space-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
}

.role-card {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.role-details h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-xs);
}

.description {
  color: var(--text-color);
  opacity: 0.7;
  font-size: var(--text-sm);
  margin-bottom: var(--space-sm);
}

.permissions-list {
  margin-top: var(--space-sm);
}

.permissions-label {
  font-size: var(--text-xs);
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: var(--space-xs);
}

.permission-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.permission-badge {
  background: var(--background-mute);
  color: var(--text-color);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  opacity: 0.8;
}

.role-menu {
  position: relative;
}

.menu-button {
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  color: var(--text-color);
  opacity: 0.7;
  transition: all var(--transition-fast);
}

.menu-button:hover {
  opacity: 1;
  background: var(--background-mute);
}

.menu-items {
  position: absolute;
  right: 0;
  margin-top: var(--space-xs);
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-xs);
  min-width: 160px;
  z-index: 10;
}

.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: black;
  transition: all var(--transition-fast);
}

.menu-item:hover,
.menu-item.active {
  background: var(--background-mute);
}

.menu-item.delete {
  color: var(--error-color);
}

.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--background-mute);
}

.loading {
  text-align: center;
  padding: var(--space-xl);
  opacity: 0.7;
}

.error-message {
  color: var(--text-danger);
  margin-bottom: var(--space-lg);
}

.empty-state {
  text-align: center;
  padding: var(--space-xl);
  opacity: 0.7;
}

.empty-content {
  margin-bottom: var(--space-lg);
}

.delete-confirmation {
  text-align: center;
  padding: var(--space-lg);
}

.delete-confirmation p {
  margin-bottom: var(--space-md);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

/* Add visual indicator for default role */
.role-card[data-default="true"] {
  border: 2px solid var(--primary-color);
}

.role-card[data-default="true"]::after {
  content: 'Default';
  position: absolute;
  top: var(--space-sm);
  right: var(--space-lg);
  font-size: var(--text-xs);
  padding: 2px var(--space-sm);
  background: var(--background-soft);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-full);
  font-weight: 500;
}
</style> 