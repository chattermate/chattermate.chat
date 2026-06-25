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
import { onMounted, ref, computed } from 'vue'
import Modal from '@/components/common/Modal.vue'
import RoleForm from './RoleForm.vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import { useRoles } from '@/composables/useRoles'
import { useSubscriptionStorage } from '@/utils/storage'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

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

// Subscription and role feature checking
const subscriptionStorage = useSubscriptionStorage()
const { hasEnterpriseModule } = useEnterpriseFeatures()
const currentSubscription = computed(() => subscriptionStorage.getCurrentSubscription())
const isSubscriptionActive = computed(() => subscriptionStorage.isSubscriptionActive())

// Check if roles is locked (only if enterprise module exists)
const isRolesLocked = computed(() => {
  // Only lock if enterprise module exists
  if (!hasEnterpriseModule) {
    return false
  }
  
  if (!currentSubscription.value || !isSubscriptionActive.value) {
    return true
  }
  
  // Check if role feature exists in subscription
  const hasRoleFeature = subscriptionStorage.hasFeature('role')
  if (!hasRoleFeature) {
    return true // Lock roles if feature doesn't exist
  }
  
  return false
})

// Upgrade modal functions
const handleUpgrade = () => {
  // Only redirect to subscription page if enterprise module exists
  if (hasEnterpriseModule) {
    window.location.href = '/settings/subscription'
  }
}

onMounted(() => {
  if (!isRolesLocked.value) {
    fetchRoles()
  }
})
</script>

<template>
  <div class="role-list">
    <!-- Roles Locked Overlay -->
    <div v-if="isRolesLocked" class="roles-locked-overlay">
      <div class="locked-content">
        <div class="locked-header">
          <div class="locked-icon-wrapper">
            <div class="locked-icon-bg">
              <font-awesome-icon icon="fa-solid fa-users-gear" class="locked-icon" />
            </div>
          </div>
          <h2>Role Management</h2>
          <div class="locked-badge">
            <font-awesome-icon icon="fa-solid fa-lock" class="badge-icon" />
            <span>Premium Feature</span>
          </div>
        </div>
        
        <p class="locked-description">
          Unlock advanced role management to control user permissions, 
          create custom roles, and manage team access levels.
        </p>
        
        <div class="locked-features">
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <font-awesome-icon icon="fa-solid fa-user-shield" class="feature-icon" />
            </div>
            <div class="feature-content">
              <span class="feature-title">Custom Roles</span>
              <span class="feature-desc">Create and manage custom user roles</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <font-awesome-icon icon="fa-solid fa-key" class="feature-icon" />
            </div>
            <div class="feature-content">
              <span class="feature-title">Permission Control</span>
              <span class="feature-desc">Fine-grained access control management</span>
            </div>
          </div>
        </div>
        
        <div class="upgrade-section">
          <button class="upgrade-button" @click="handleUpgrade">
            <font-awesome-icon icon="fa-solid fa-crown" class="upgrade-icon" />
            <span>Upgrade to Unlock Roles</span>
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="arrow-icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- Roles Content (when unlocked) -->
    <div v-else>
      <header class="page-header">
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
  </div>
</template>

<style scoped>
.role-list {
  padding: var(--space-lg);
}

.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
}

.role-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  transition: border-color var(--transition-fast);
}

.role-card:hover {
  border-color: var(--o16);
}

.role-details h3 {
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

.permissions-list {
  margin-top: var(--space-sm);
}

.permissions-label {
  font-size: var(--text-xs);
  color: var(--faint);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--space-xs);
}

.permission-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.permission-badge {
  background: var(--o08);
  color: var(--text3);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  border: 1px solid var(--o10);
}

.role-menu {
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

.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--o06);
}

.loading {
  text-align: center;
  padding: var(--space-xl);
  opacity: 0.7;
}

.error-message {
  color: var(--c-coral);
  margin-bottom: var(--space-lg);
}

.empty-state {
  text-align: center;
  padding: var(--space-xl);
  color: var(--muted);
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
  border: 2px solid rgba(201, 242, 78, 0.4);
}

.role-card[data-default="true"]::after {
  content: 'Default';
  position: absolute;
  top: var(--space-sm);
  right: var(--space-lg);
  font-size: var(--text-xs);
  padding: 2px var(--space-sm);
  background: rgba(201, 242, 78, 0.12);
  color: var(--accent-ink);
  border: 1px solid rgba(201, 242, 78, 0.3);
  border-radius: var(--radius-full);
  font-weight: 500;
}

/* Roles Locked Overlay Styles */
.roles-locked-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  background: var(--surface);
  border-radius: 20px;
  margin: var(--space-md) 0;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--o08);
}

.roles-locked-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(243, 70, 17, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.locked-content {
  text-align: center;
  max-width: 700px;
  padding: var(--space-xl) var(--space-md);
  position: relative;
  z-index: 1;
}

.locked-header {
  margin-bottom: var(--space-lg);
}

.locked-icon-wrapper {
  margin-bottom: var(--space-md);
}

.locked-icon-bg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(201, 242, 78, 0.15);
  border: 1px solid rgba(201, 242, 78, 0.3);
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--space-sm);
}

.locked-icon {
  font-size: 1.5rem;
  color: var(--accent-ink);
}

.locked-content h2 {
  font-size: var(--text-3xl);
  font-weight: 700;
  font-family: var(--font-display);
  color: var(--text);
  margin-bottom: var(--space-sm);
}

.locked-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: rgba(201, 242, 78, 0.12);
  color: var(--accent-ink);
  border: 1px solid rgba(201, 242, 78, 0.3);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
}

.badge-icon {
  font-size: 0.75rem;
}

.locked-description {
  font-size: var(--text-lg);
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: var(--space-lg);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.locked-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-lg);
  background: var(--o05);
  border-radius: 14px;
  border: 1px solid var(--o10);
  text-align: left;
  transition: all var(--transition-normal);
}

.feature-item:hover {
  transform: translateY(-2px);
  background: var(--o08);
  border-color: var(--o16);
}

.feature-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(201, 242, 78, 0.12);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.feature-icon {
  font-size: 1rem;
  color: var(--accent-ink);
}

.feature-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.feature-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text);
}

.feature-desc {
  font-size: var(--text-sm);
  color: var(--muted);
  line-height: 1.4;
}

.upgrade-section {
  text-align: center;
}

.upgrade-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--accent-ink);
  color: #0B0C10;
  border: none;
  border-radius: 14px;
  padding: var(--space-md) var(--space-xl);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.upgrade-button:hover {
  opacity: 0.88;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(201, 242, 78, 0.25);
}

.upgrade-icon {
  font-size: 1rem;
  color: #0B0C10;
}

.arrow-icon {
  font-size: 0.875rem;
  transition: transform var(--transition-normal);
}

.upgrade-button:hover .arrow-icon {
  transform: translateX(4px);
}

/* Responsive adjustments for locked overlay */
@media (max-width: 768px) {
  .roles-locked-overlay {
    min-height: 50vh;
    margin: var(--space-md) 0;
  }
  
  .locked-content {
    padding: var(--space-xl) var(--space-md);
  }
  
  .locked-content h2 {
    font-size: var(--text-2xl);
  }
  
  .locked-description {
    font-size: var(--text-base);
    margin-bottom: var(--space-lg);
  }
  
  .locked-features {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }
  
  .feature-item {
    padding: var(--space-md);
  }
  
  .feature-icon-wrapper {
    width: 32px;
    height: 32px;
  }
  
  .feature-icon {
    font-size: 0.875rem;
  }
  
  .upgrade-button {
    width: 100%;
    padding: var(--space-md) var(--space-lg);
    font-size: var(--text-sm);
  }
  
  .locked-icon-bg {
    width: 48px;
    height: 48px;
  }
  
  .locked-icon {
    font-size: 1.25rem;
  }
  
  .locked-header {
    margin-bottom: var(--space-lg);
  }
}
</style> 