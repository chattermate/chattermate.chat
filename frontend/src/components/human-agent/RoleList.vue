<!--
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import Modal from '@/components/common/Modal.vue'
import RoleForm from './RoleForm.vue'
import type { Role } from '@/types/user'
import { useRoles } from '@/composables/useRoles'
import { useSubscriptionStorage } from '@/utils/storage'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

const props = defineProps<{
  searchQuery?: string
}>()

const emit = defineEmits<{
  (e: 'changed'): void
}>()

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

// Wrap create/delete so the parent view can refresh counts after a change
const createRoleAndNotify = async (data: Partial<Role>) => {
  await handleCreateRole(data)
  if (!showCreateModal.value) {
    emit('changed')
  }
}

const deleteRoleAndNotify = async () => {
  await confirmDeleteRole()
  if (!showDeleteModal.value) {
    emit('changed')
  }
}

// Filter cards by role name (case-insensitive)
const filteredRoles = computed(() => {
  const q = (props.searchQuery || '').trim().toLowerCase()
  if (!q) return roles.value
  return roles.value.filter(role => role.name?.toLowerCase().includes(q))
})

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
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="loading" class="loading">Loading roles...</div>

      <div v-else class="roles-grid">
        <div
          v-for="role in filteredRoles"
          :key="role.id"
          class="role-card"
        >
          <div class="role-card__header">
            <h3 class="role-card__name">{{ role.name }}</h3>
            <span v-if="role.is_default" class="role-card__badge">Default</span>
          </div>

          <p class="role-card__desc" :class="{ 'is-muted': !role.description }">
            {{ role.description || 'No description' }}
          </p>

          <template v-if="role.permissions?.length">
            <div class="role-card__perm-label">PERMISSIONS</div>
            <div class="role-card__perm-chips">
              <span
                v-for="permission in role.permissions"
                :key="permission.id"
                class="role-card__chip"
              >
                {{ permission.name }}
              </span>
            </div>
          </template>

          <button
            class="role-card__edit"
            @click="handleEditRole(role)"
            :disabled="role.is_default"
            :title="role.is_default ? 'Cannot edit default role' : ''"
          >
            Edit permissions
          </button>

          <button
            v-if="!role.is_default"
            class="role-card__delete"
            @click="handleDeleteRole(role)"
          >
            Delete role
          </button>
        </div>

        <!-- Create a custom role card -->
        <button class="role-card-add" @click="openCreateModal">
          <div class="role-card-add__icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div class="role-card-add__title">Create a custom role</div>
          <div class="role-card-add__desc">Pick exactly which permissions a group of agents gets</div>
        </button>
      </div>

      <!-- Create/Edit Role Modal -->
      <Modal v-if="showCreateModal || showEditModal"
             @close="showCreateModal ? (showCreateModal = false) : (showEditModal = false)">
        <template #title>{{ showCreateModal ? 'Create Role' : 'Edit Role' }}</template>
        <template #content>
          <RoleForm
            :role="selectedRole"
            @submit="(data) => showCreateModal ? createRoleAndNotify(data) : handleUpdateRole(data)"
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
                @click="deleteRoleAndNotify"
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

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 18px;
  align-items: start;
}

.role-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: border-color var(--transition-fast);
}

.role-card:hover {
  border-color: var(--o16);
}

.role-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.role-card__name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 19px;
  color: var(--text);
  margin: 0;
}

.role-card__badge {
  padding: 2px 9px;
  border-radius: var(--radius-pill);
  background: var(--accent-bg-12);
  border: 1px solid var(--accent-border);
  color: var(--accent-ink);
  font-size: 11px;
  font-weight: 500;
}

.role-card__desc {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0 0 18px;
}

.role-card__desc.is-muted {
  color: var(--muted2);
}

.role-card__perm-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  color: var(--faint);
  margin-bottom: 9px;
}

.role-card__perm-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.role-card__chip {
  font-family: var(--font-mono);
  font-size: 11.5px;
  padding: 4px 9px;
  border-radius: 7px;
  background: var(--o05);
  border: 1px solid var(--o08);
  color: var(--text3);
  white-space: nowrap;
}

.role-card__edit {
  margin-top: 20px;
  padding: 11px;
  background: var(--o05);
  border: 1px solid var(--o14);
  border-radius: var(--radius-chip);
  color: var(--text);
  font-size: 13.5px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.role-card__edit:hover:not(:disabled) {
  background: var(--o10);
}

.role-card__edit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.role-card__delete {
  margin-top: 8px;
  padding: 8px;
  background: transparent;
  border: none;
  color: var(--muted2);
  font-size: 12.5px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.role-card__delete:hover {
  color: var(--c-coral);
}

/* Create a custom role dashed card */
.role-card-add {
  background: transparent;
  border: 1.5px dashed var(--o16);
  border-radius: 18px;
  padding: 24px;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--muted2);
  font-family: var(--font-sans);
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.role-card-add:hover {
  border-color: var(--accent-border);
  color: var(--accent-ink);
}

.role-card-add__icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--o05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-card-add__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text2);
}

.role-card-add__desc {
  font-size: 12.5px;
  color: var(--muted2);
  text-align: center;
  max-width: 200px;
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
    radial-gradient(circle at 20% 80%, rgba(201, 242, 78, 0.04) 0%, transparent 50%),
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
  background: var(--accent-solid);
  color: var(--on-accent-solid);
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
  color: var(--on-accent-solid);
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