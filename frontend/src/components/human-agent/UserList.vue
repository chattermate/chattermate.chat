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
import { useRouter } from 'vue-router'
import { useSubscriptionStorage } from '@/utils/storage'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

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
const router = useRouter()
const subscriptionStorage = useSubscriptionStorage()
const { hasEnterpriseModule } = useEnterpriseFeatures()

// Subscription and user limits
const currentSubscription = computed(() => subscriptionStorage.getCurrentSubscription())
const isSubscriptionActive = computed(() => subscriptionStorage.isSubscriptionActive())
const currentUserCount = computed(() => users.value.filter(user => user.is_active).length)

// Check if user creation is locked due to limits (only if enterprise module exists)
const isUserCreationLocked = computed(() => {
  // Only lock if enterprise module exists
  if (!hasEnterpriseModule) {
    return false
  }
  
  if (!currentSubscription.value || !isSubscriptionActive.value) {
    return true
  }
  
  // Check if max_users feature exists in subscription
  const hasMaxUsersFeature = subscriptionStorage.hasFeature('max_users')
  if (!hasMaxUsersFeature) {
    return false // No user limits if feature doesn't exist
  }
  
  // Get max users from subscription quantity (this is the user seat limit)
  const maxUsers = currentSubscription.value.quantity
  if (maxUsers === null || maxUsers === undefined) {
    return false // Unlimited users
  }
  
  return currentUserCount.value >= maxUsers
})

// Show upgrade modal state
const showUpgradeModal = ref(false)

// Modal functions
const closeUpgradeModal = () => {
  showUpgradeModal.value = false
}

const handleUpgrade = () => {
  // Only redirect to subscription page if enterprise module exists
  if (hasEnterpriseModule) {
    window.location.href = '/settings/subscription'
  }
}

const handleUserAction = (user: User) => {
  // If user is editing their own profile, navigate to user settings instead
  if (user.id === currentUser?.id) {
    router.push('/settings/user')
    return
  }
  handleEditUser(user)
}

const handleCreateUserClick = () => {
  if (isUserCreationLocked.value) {
    // Only show upgrade modal if enterprise module exists
    if (hasEnterpriseModule) {
      showUpgradeModal.value = true
      return
    }
  }
  showCreateModal.value = true
}

onMounted(async () => {
  await fetchUsers()
})
</script>

<template>
  <div class="user-list">
    <header class="page-header">
      <button
        class="btn btn-primary" 
        :class="{ 'locked': isUserCreationLocked }"
        :disabled="isUserCreationLocked"
        @click="handleCreateUserClick"
        :title="isUserCreationLocked ? `User limit reached (${currentUserCount}/${currentSubscription?.quantity}). Upgrade your plan to add more users.` : 'Add a new user'"
      >
        <span>+</span>
        Add User
        <font-awesome-icon v-if="hasEnterpriseModule && isUserCreationLocked" icon="fa-solid fa-lock" class="lock-icon" />
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

    <!-- User Limit Upgrade Modal (only shown when enterprise module exists) -->
    <div v-if="hasEnterpriseModule && showUpgradeModal" class="upgrade-modal-overlay" @click="closeUpgradeModal">
      <div class="upgrade-modal" @click.stop>
        <div class="upgrade-modal-header">
          <h3>User Limit Reached</h3>
          <button class="close-button" @click="closeUpgradeModal">×</button>
        </div>
        <div class="upgrade-modal-content">
          <p class="upgrade-description">
            You've reached your plan's user limit ({{ currentUserCount }}/{{ currentSubscription?.quantity }}). 
            Upgrade your plan to add more users and unlock additional features.
          </p>
          <div class="upgrade-features">
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>More user seats for your team</span>
            </div>
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>Advanced user management features</span>
            </div>
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>Enhanced collaboration tools</span>
            </div>
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>Priority support</span>
            </div>
          </div>
        </div>
        <div class="upgrade-modal-footer">
          <button class="upgrade-button primary" @click="handleUpgrade">
            Upgrade Plan
          </button>
          <button class="upgrade-button secondary" @click="closeUpgradeModal">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.page-header {
  padding: 0 0 var(--space-lg) 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.page-header h1 {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
}

.user-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  transition: all var(--transition-fast);
}

.user-card:hover {
  border-color: var(--o14);
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
  border-radius: 8px;
  color: var(--muted);
  transition: all var(--transition-fast);
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
  padding: 4px;
  min-width: 160px;
  z-index: 10;
  box-shadow: var(--shadow-md);
}

.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-sm) var(--space-md);
  border-radius: 8px;
  font-size: var(--text-sm);
  color: var(--text3);
  transition: all var(--transition-fast);
}

.menu-item:hover,
.menu-item.active {
  background: var(--o08);
  color: var(--text);
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
  background: rgba(157,140,255,.15);
  color: var(--c-purple);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
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
  background: var(--o08);
  color: var(--text3);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  margin-bottom: var(--space-xs);
}

.status-badge.inactive {
  background: var(--error-bg);
  color: var(--error-color);
}

.user-inactive {
  opacity: 0.6;
  background: var(--o04);
  border: 1px dashed var(--o10);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--muted);
  border: 2px solid var(--surface);
}

.status-indicator.online {
  background-color: #22c55e;
}

/* Locked button styles */
.btn.locked {
  background: var(--o06);
  color: var(--muted);
  cursor: not-allowed;
  opacity: 0.7;
}

.btn.locked:hover {
  background: var(--o06);
  transform: none;
}

.lock-icon {
  font-size: 12px;
  margin-left: var(--space-xs);
  color: var(--warning-color);
}

/* Upgrade Modal Styles */
.upgrade-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(5, 6, 9, 0.66);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.upgrade-modal {
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 20px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.upgrade-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--o08);
}

.upgrade-modal-header h3 {
  margin: 0;
  font-family: var(--font-display);
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 700;
}

.close-button {
  background: var(--o05);
  border: 1px solid var(--o12);
  font-size: 1.2rem;
  color: var(--muted);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--o10);
  color: var(--text);
}

.upgrade-modal-content {
  padding: var(--space-lg);
}

.upgrade-description {
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: var(--space-lg);
}

.upgrade-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.feature-icon {
  color: var(--accent-ink);
  font-size: 0.875rem;
}

.upgrade-modal-footer {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border-top: 1px solid var(--o08);
}

.upgrade-button {
  flex: 1;
  padding: var(--space-md);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.upgrade-button.primary {
  background: var(--accent-ink);
  color: var(--on-accent);
}

.upgrade-button.primary:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.upgrade-button.secondary {
  background: var(--o06);
  color: var(--text3);
  border: 1px solid var(--o10);
}

.upgrade-button.secondary:hover {
  background: var(--o10);
  color: var(--text);
}
</style> 