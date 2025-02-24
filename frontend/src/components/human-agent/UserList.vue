<!--
ChatterMate - User List
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
import { onMounted, ref, computed } from 'vue'
import type { User } from '@/types/user'
import userAvatar from '@/assets/user.svg'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import { useUsers } from '@/composables/useUsers'
import UserForm from './UserForm.vue'
import Modal from '@/components/common/Modal.vue'
import { userService } from '@/services/user'
import { inject } from 'vue'

const getUserAvatar = (user: User) => {
  if (user.profile_pic) {
    if (user.profile_pic.includes('amazonaws.com')) {
      return user.profile_pic
    }
    return `${import.meta.env.VITE_API_URL}${user.profile_pic}`
  }
  return userAvatar
}

const {
  users,
  loading,
  error,
  showEditModal,
  showDeleteModal,
  showCreateModal,
  selectedUser,
  fetchUsers,
  handleEditUser,
  handleUpdateUser,
  handleDeleteUser,
  confirmDeleteUser,
  handleCreateUser
} = useUsers()

const currentUser = userService.getCurrentUser()
const openSettings = inject('openSettings') as () => void

const handleUserAction = (user: User) => {
  // If user is editing their own profile, open settings instead
  if (user.id === currentUser?.id) {
    openSettings()
    return
  }
  handleEditUser(user)
}

onMounted(async () => {
  await fetchUsers()
})
</script>

<template>
  <div class="user-list">
    <header class="page-header">
      <h1>Users</h1>
      <button class="btn btn-primary"  @click="showCreateModal = true">
        <span>+</span>
        Add User
      </button>
    </header>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading">Loading users...</div>
    
    <div v-else-if="users.length > 0" class="users-grid">
      <div 
        v-for="user in users" 
        :key="user.id" 
        class="user-card"
        :class="{ 'user-inactive': !user.is_active }"
      >
        <div class="user-info">
          <div class="avatar-wrapper">
            <img :src="getUserAvatar(user)" alt="User avatar" class="user-avatar">
            <span 
              class="status-indicator" 
              :class="{ 'online': user.is_online }"
              :title="user.is_online ? 'Online' : 'Offline'"
            ></span>
          </div>
          <div class="user-details">
            <h3>{{ user.full_name }}</h3>
            <p class="email">{{ user.email }}</p>
            <span v-if="!user.is_active" class="status-badge inactive">Inactive</span>
            <div class="role-badge" v-if="user.role">
              {{ user.role.name }}
            </div>
            <div class="groups-list" v-if="user.groups?.length">
              <div class="groups-label">Groups:</div>
              <div class="group-badges">
                <span v-for="group in user.groups" :key="group.id" class="group-badge">
                  {{ group.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Menu as="div" class="user-menu">
          <MenuButton class="menu-button">
            <EllipsisVerticalIcon class="h-5 w-5" />
          </MenuButton>

          <MenuItems class="menu-items">
            <MenuItem v-slot="{ active }">
              <button 
                :class="['menu-item', { active }]"
                @click="handleUserAction(user)"
              >
                {{ user.id === currentUser?.id ? 'Edit Profile' : 'Edit User' }}
              </button>
            </MenuItem>
            <MenuItem v-slot="{ active }" v-if="user.id !== currentUser?.id">
              <button 
                :class="['menu-item', { active }]"
                @click="handleDeleteUser(user)"
              >
                Delete User
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>

    <!-- Edit User Modal -->
    <Modal v-if="showEditModal" @close="showEditModal = false">
      <template #title>Edit User</template>
      <template #content>
        <UserForm 
          :user="selectedUser"
          @submit="handleUpdateUser"
          @cancel="showEditModal = false"
        />
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #title>Delete User</template>
      <template #content>
        <p>Are you sure you want to delete this user?</p>
        <div class="modal-actions">
          <button 
            class="btn btn-danger" 
            @click="confirmDeleteUser"
          >
            Delete
          </button>
          <button 
            class="btn btn-secondary" 
            @click="showDeleteModal = false"
          >
            Cancel
          </button>
        </div>
      </template>
    </Modal>

    <!-- Create User Modal -->
    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #title>Create New User</template>
      <template #content>
        <UserForm 
          @submit="handleCreateUser"
          @cancel="showCreateModal = false"
        />
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.user-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.page-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: var(--text-2xl);
  font-weight: 600;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
}

.user-card {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  transition: all var(--transition-fast);
}

.user-info {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}

.avatar-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.user-details h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-xs);
  line-height: 1.2;
}

.user-details p {
  opacity: 0.7;
  font-size: var(--text-sm);
  line-height: 1.4;
}

.loading {
  text-align: center;
  padding: var(--space-xl);
  opacity: 0.7;
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
  background: var(--background-soft);
}

.menu-items {
  position: absolute;
  right: 0;
  margin-top: var(--space-xs);
  background: var(--background-mute);
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
  background: var(--background-soft);
}

.user-menu {
  position: relative;
}

.email {
  opacity: 0.7;
  font-size: var(--text-sm);
  margin-bottom: var(--space-xs);
}

.role-badge {
  background: var(--background-soft);
  color: var(--text-color);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  opacity: 0.8;
  display: inline-block;
}

.error-message {
  color: var(--error-color);
  text-align: center;
  padding: var(--space-lg);
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  margin-top: var(--space-lg);
}

.groups-list {
  margin-top: var(--space-sm);
}

.groups-label {
  font-size: var(--text-xs);
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: var(--space-xs);
}

.group-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.group-badge {
  background: var(--background-soft);
  color: var(--text-color);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  opacity: 0.8;
}

.status-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  margin-bottom: var(--space-xs);
}

.status-badge.inactive {
  background: var(--error-soft);
  color: var(--error-color);
}

.user-inactive {
  opacity: 0.7;
  background: var(--background-mute);
  border: 1px dashed var(--border-color);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--text-muted);
  border: 2px solid var(--background-soft);
}

.status-indicator.online {
  background-color: #22c55e;
}
</style> 