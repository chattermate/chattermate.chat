<!--
ChatterMate - Group List
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
import GroupForm from './GroupForm.vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import { useGroups } from '@/composables/useGroups'

const {
  groups,
  users,
  loading,
  error,
  showCreateModal,
  showEditModal,
  showMembersModal,
  showDeleteModal,
  selectedGroup,
  selectedUsers,
  fetchGroups,
  handleCreateGroup,
  handleEditGroup,
  handleUpdateGroup,
  handleManageMembers,
  handleUserSelection,
  handleDeleteGroup,
  handleDeleteConfirm
} = useGroups()

onMounted(fetchGroups)
</script>

<template>
  <div class="group-list">
    <header class="page-header">
      <h1>Groups</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">
          <span class="icon">+</span>
          Add Group
        </button>
      </div>
    </header>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading">Loading groups...</div>
    
    <div v-else-if="groups.length > 0" class="groups-grid">
      <div v-for="group in groups" :key="group.id" class="group-card">
        <div class="group-details">
          <h3>{{ group.name }}</h3>
          <p v-if="group.description" class="description">{{ group.description }}</p>
          <span class="members-count">
            {{ group.users?.length || 0 }} members
          </span>
        </div>
        <Menu as="div" class="group-menu">
          <MenuButton class="menu-button">
            <EllipsisVerticalIcon class="h-5 w-5" />
          </MenuButton>
          <MenuItems class="menu-items">
            <MenuItem v-slot="{ active }">
              <button 
                :class="['menu-item', { active }]"
                @click="handleEditGroup(group)"
              >
                Edit Group
              </button>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <button 
                :class="['menu-item', { active }]"
                @click="handleManageMembers(group)"
              >
                Manage Members
              </button>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <button 
                :class="['menu-item delete', { active }]"
                @click="handleDeleteGroup(group)"
              >
                Delete Group
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-content">
        <h3>No Groups Found</h3>
        <p>Create your first group to start organizing team members</p>
        <button class="btn btn-primary" @click="showCreateModal = true">
          <span class="icon">+</span>
          Create Group
        </button>
      </div>
    </div>

    <!-- Create Group Modal -->
    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #title>Create Group</template>
      <template #content>
        <GroupForm
          @submit="handleCreateGroup"
          @cancel="showCreateModal = false"
        />
      </template>
    </Modal>

    <!-- Edit Group Modal -->
    <Modal v-if="showEditModal" @close="showEditModal = false">
      <template #title>Edit Group</template>
      <template #content>
        <GroupForm
          :group="selectedGroup"
          @submit="handleUpdateGroup"
          @cancel="showEditModal = false"
        />
      </template>
    </Modal>

    <!-- Manage Members Modal -->
    <Modal v-if="showMembersModal" @close="showMembersModal = false">
      <template #title>Manage Members</template>
      <template #content>
        <div class="members-list">
          <div v-for="user in users" :key="user.id" class="member-item">
            <label class="checkbox-label">
              <input
                type="checkbox"
                :checked="selectedUsers.includes(user.id)"
                @change="handleUserSelection(user.id, ($event.target as HTMLInputElement).checked)"
                :disabled="loading"
              />
              <div class="user-info">
                <span class="user-name">{{ user.full_name }}</span>
                <span class="user-email">{{ user.email }}</span>
              </div>
            </label>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #title>Delete Group</template>
      <template #content>
        <div class="delete-confirmation">
          <p>Are you sure you want to delete "{{ selectedGroup?.name }}"?</p>
          <p class="warning">This action cannot be undone.</p>
          <div class="form-actions">
            <button class="btn btn-secondary" @click="showDeleteModal = false">
              Cancel
            </button>
            <button class="btn btn-danger" @click="handleDeleteConfirm">
              Delete
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.group-list {
  padding: var(--space-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.header-actions {
  display: flex;
  gap: var(--space-md);
}

.icon {
  font-size: 1.2em;
  margin-right: var(--space-xs);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: var(--radius-lg);
  margin-top: var(--space-lg);
}

.empty-content {
  text-align: center;
}

.empty-content h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-sm);
  color: var(--text);
}

.empty-content p {
  color: var(--muted);
  margin-bottom: var(--space-lg);
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
  margin-top: var(--space-lg);
}

.group-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: border-color var(--transition-fast);
}

.group-card:hover {
  border-color: var(--o16);
}

.group-details h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-xs);
  color: var(--text);
  font-family: var(--font-display);
  font-weight: 600;
}

.description {
  color: var(--muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-sm);
}

.members-count {
  font-size: var(--text-sm);
  color: var(--muted);
}

.error-message {
  color: var(--error-color);
  text-align: center;
  padding: var(--space-lg);
}

.loading {
  text-align: center;
  padding: var(--space-xl);
  opacity: 0.7;
}

.group-menu {
  position: relative;
}

.menu-button {
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  color: var(--muted);
  transition: all var(--transition-fast);
  background: transparent;
  border: none;
  cursor: pointer;
}

.menu-button:hover {
  color: var(--text);
  background: var(--o08);
}

.menu-items {
  position: absolute;
  right: 0;
  margin-top: var(--space-xs);
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 12px;
  padding: var(--space-xs);
  min-width: 160px;
  z-index: 10;
  box-shadow: var(--shadow-md);
}

.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--text);
  transition: all var(--transition-fast);
  background: transparent;
  border: none;
  cursor: pointer;
}

.menu-item:hover,
.menu-item.active {
  background: var(--o08);
}

.menu-item.delete {
  color: var(--c-coral);
}

.members-list {
  max-height: 400px;
  overflow-y: auto;
  margin: var(--space-md) 0;
}

.member-item {
  padding: var(--space-sm);
  border-bottom: 1px solid var(--o08);
}

.member-item:last-child {
  border-bottom: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
}

.user-email {
  font-size: var(--text-sm);
  opacity: 0.7;
}

.delete-confirmation {
  text-align: center;
  padding: var(--space-lg);
}

.delete-confirmation p {
  margin-bottom: var(--space-md);
}

.warning {
  color: var(--error-color);
  font-size: var(--text-sm);
  margin-top: var(--space-sm);
}

.btn-danger {
  background: transparent;
  border: 1px solid rgba(255, 138, 115, 0.3);
  color: var(--c-coral);
}

.btn-danger:hover {
  background: rgba(255, 138, 115, 0.1);
}

.form-actions {
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}
</style> 