<!--
ChatterMate - Widget App List
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
import { onMounted, computed } from 'vue'
import { useWidgetApps } from '@/composables/useWidgetApps'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { EllipsisVerticalIcon, PlusIcon } from '@heroicons/vue/24/outline'
import Modal from '@/components/common/Modal.vue'
import WidgetAppForm from './WidgetAppForm.vue'
import ApiKeyModal from './ApiKeyModal.vue'
import { permissionChecks } from '@/utils/permissions'
import { useSubscriptionStorage } from '@/utils/storage'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

const subscriptionStorage = useSubscriptionStorage()
const { hasEnterpriseModule } = useEnterpriseFeatures()

const {
  apps,
  loading,
  error,
  showCreateModal,
  showEditModal,
  showDeleteModal,
  showApiKeyModal,
  selectedApp,
  newApiKey,
  showInactive,
  hasAnyApps,
  hasInactiveApps,
  fetchApps,
  handleCreateApp,
  handleEditApp,
  handleUpdateApp,
  handleDeleteApp,
  confirmDeleteApp,
  handleRegenerateKey,
  closeApiKeyModal
} = useWidgetApps()

const canManage = computed(() => permissionChecks.canManageOrganization())

// Subscription and widget apps feature checking
const currentSubscription = computed(() => subscriptionStorage.getCurrentSubscription())
const isSubscriptionActive = computed(() => subscriptionStorage.isSubscriptionActive())

// Check if widget apps is locked (only if enterprise module exists)
const isWidgetAppsLocked = computed(() => {
  // Only lock if enterprise module exists
  if (!hasEnterpriseModule) {
    return false
  }

  if (!currentSubscription.value || !isSubscriptionActive.value) {
    return true
  }

  // Check if api_access feature exists in subscription (required for widget apps)
  const hasApiAccessFeature = subscriptionStorage.hasFeature('api_access')
  if (!hasApiAccessFeature) {
    return true // Lock widget apps if feature doesn't exist
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

onMounted(async () => {
  if (canManage.value && !isWidgetAppsLocked.value) {
    await fetchApps()
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div v-if="!canManage" class="no-permission">
    <p>You don't have permission to manage widget apps.</p>
  </div>

  <div v-else class="widget-app-list">
    <!-- Widget Apps Locked Overlay -->
    <div v-if="isWidgetAppsLocked" class="widget-apps-locked-overlay">
      <div class="locked-content">
        <div class="locked-header">
          <div class="locked-icon-wrapper">
            <div class="locked-icon-bg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="locked-icon">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
          </div>
          <h2>Widget Apps</h2>
          <div class="locked-badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="badge-icon">
              <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd" />
            </svg>
            <span>Premium Feature</span>
          </div>
        </div>

        <p class="locked-description">
          Unlock Widget Apps to create secure API keys for authenticating your chat widgets
          across multiple platforms and applications.
        </p>

        <div class="locked-features">
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="feature-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="feature-content">
              <span class="feature-title">Secure API Keys</span>
              <span class="feature-desc">Generate unique keys for each integration</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="feature-icon">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="feature-content">
              <span class="feature-title">Access Control</span>
              <span class="feature-desc">Manage and revoke access anytime</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="feature-icon">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
              </svg>
            </div>
            <div class="feature-content">
              <span class="feature-title">Multi-Platform</span>
              <span class="feature-desc">Deploy widgets across multiple sites</span>
            </div>
          </div>
        </div>

        <button class="upgrade-btn" @click="handleUpgrade">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="upgrade-icon">
            <path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
          </svg>
          Upgrade to Pro
        </button>
      </div>
    </div>

    <!-- Normal content when not locked -->
    <template v-else>
      <!-- Header -->
      <header class="page-header">
        <div>
          <h1>Widget Apps</h1>
          <p class="subtitle">Manage widget apps and API keys for your organization</p>
        </div>
        <button v-if="hasAnyApps" class="btn btn-primary" @click="showCreateModal = true">
          <PlusIcon class="icon" />
          Create App
        </button>
      </header>

    <!-- Include inactive toggle (only show when there are inactive apps) -->
    <div v-if="hasInactiveApps" class="filters">
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="showInactive"
        />
        Show inactive apps
      </label>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading widget apps...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="fetchApps">Retry</button>
    </div>

    <!-- Empty state (only when no apps at all) -->
    <div v-else-if="!hasAnyApps" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon-wrapper">
          <div class="empty-icon-bg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
        </div>
        <h2>No Widget Apps Yet</h2>
        <p class="empty-description">
          Widget apps allow you to generate secure API keys for authenticating your chat widgets.
          Create your first app to get started.
        </p>
        <div class="empty-features">
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Secure API Keys</strong>
              <span>Generate unique keys for each integration</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Access Control</strong>
              <span>Manage and revoke access anytime</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Multi-Platform</strong>
              <span>Deploy widgets across multiple sites</span>
            </div>
          </div>
        </div>
        <button class="btn btn-primary create-btn" @click="showCreateModal = true">
          <PlusIcon class="icon" />
          Create Your First App
        </button>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="apps.length > 0" class="table-container">
      <table class="widget-app-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in apps" :key="app.id" :class="{ inactive: !app.is_active }">
            <td class="name-cell">
              <strong>{{ app.name }}</strong>
            </td>
            <td class="description-cell">
              {{ app.description || '—' }}
            </td>
            <td>
              <span :class="['status-badge', app.is_active ? 'active' : 'inactive']">
                {{ app.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="date-cell">
              {{ formatDate(app.created_at) }}
            </td>
            <td class="date-cell">
              {{ formatDate(app.updated_at) }}
            </td>
            <td class="actions-cell">
              <Menu as="div" class="actions-menu">
                <MenuButton class="menu-button">
                  <EllipsisVerticalIcon class="icon" />
                </MenuButton>
                <MenuItems class="menu-items">
                  <MenuItem v-slot="{ active }">
                    <button
                      :class="['menu-item', { active }]"
                      @click="handleEditApp(app)"
                    >
                      Edit
                    </button>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button
                      :class="['menu-item', { active }]"
                      @click="handleRegenerateKey(app)"
                    >
                      Regenerate API Key
                    </button>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button
                      :class="['menu-item danger', { active }]"
                      @click="handleDeleteApp(app)"
                    >
                      Delete
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- All apps filtered state (all inactive and showInactive is false) -->
    <div v-else-if="hasAnyApps && apps.length === 0" class="filtered-state">
      <p>All widget apps are currently inactive.</p>
      <button class="btn btn-secondary" @click="showInactive = true">
        Show inactive apps
      </button>
    </div>

    <!-- Create Modal -->
    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #title>Create Widget App</template>
      <template #content>
        <WidgetAppForm
          @submit="handleCreateApp"
          @cancel="showCreateModal = false"
        />
      </template>
    </Modal>

    <!-- Edit Modal -->
    <Modal v-if="showEditModal && selectedApp" @close="showEditModal = false">
      <template #title>Edit Widget App</template>
      <template #content>
        <WidgetAppForm
          :app="selectedApp"
          @submit="handleUpdateApp"
          @cancel="showEditModal = false"
        />
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-if="showDeleteModal && selectedApp" @close="showDeleteModal = false">
      <template #title>Delete Widget App</template>
      <template #content>
        <div class="confirm-delete">
          <p>Are you sure you want to delete <strong>{{ selectedApp.name }}</strong>?</p>
          <p class="warning">This will invalidate the API key immediately.</p>
          <div class="modal-actions">
            <button class="btn btn-danger" @click="confirmDeleteApp">
              Delete
            </button>
            <button class="btn btn-secondary" @click="showDeleteModal = false">
              Cancel
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- API Key Display Modal -->
    <ApiKeyModal
      v-if="showApiKeyModal && newApiKey"
      :apiKey="newApiKey"
      @close="closeApiKeyModal"
    />
    </template>
  </div>
</template>

<style scoped>
.widget-app-list {
  width: 100%;
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.page-header h1 {
  font-size: var(--text-2xl);
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.subtitle {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.filters {
  margin-bottom: var(--space-lg);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
}

.table-container {
  overflow: visible;
  background: var(--background-color);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.widget-app-table {
  width: 100%;
  border-collapse: collapse;
}

.widget-app-table th {
  text-align: left;
  padding: var(--space-md);
  border-bottom: 1px solid var(--border-color);
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.widget-app-table td {
  padding: var(--space-md);
  border-bottom: 1px solid var(--border-color);
}

.widget-app-table tr:last-child td {
  border-bottom: none;
}

.widget-app-table tr.inactive {
  opacity: 0.6;
}

.status-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 500;
}

.status-badge.active {
  background: var(--success-bg);
  color: var(--success-color);
}

.status-badge.inactive {
  background: var(--error-bg);
  color: var(--error-color);
}

.date-cell {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.actions-menu {
  position: relative;
}

.menu-button {
  padding: var(--space-xs);
  border: none;
  background: none;
  cursor: pointer;
  border-radius: var(--radius-md);
}

.menu-button:hover {
  background: var(--hover-bg);
}

.menu-items {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: var(--space-xs);
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  min-width: 180px;
}

.actions-cell {
  position: relative;
  overflow: visible;
}

.menu-item {
  display: block;
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
}

.menu-item:hover,
.menu-item.active {
  background: var(--hover-bg);
}

.menu-item.danger {
  color: var(--error-color);
}

.confirm-delete {
  padding: var(--space-md);
}

.confirm-delete .warning {
  color: var(--error-color);
  margin-top: var(--space-sm);
  font-size: var(--text-sm);
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.icon {
  width: 20px;
  height: 20px;
}

.loading-state,
.error-state,
.no-permission,
.filtered-state {
  text-align: center;
  padding: var(--space-2xl);
}

.filtered-state {
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.filtered-state p {
  color: var(--text-muted);
  margin-bottom: var(--space-md);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--space-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State Styles */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.empty-state::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(243, 70, 17, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.empty-content {
  text-align: center;
  max-width: 600px;
  padding: var(--space-xl);
  position: relative;
  z-index: 1;
}

.empty-icon-wrapper {
  margin-bottom: var(--space-lg);
}

.empty-icon-bg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: white;
}

.empty-content h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.empty-description {
  font-size: var(--text-base);
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: var(--space-xl);
}

.empty-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--background-color);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  text-align: left;
  transition: all var(--transition-normal);
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-color-hover);
}

.feature-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--info-bg);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.feature-icon {
  width: 22px;
  height: 22px;
  color: var(--info-color);
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feature-text strong {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.feature-text span {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.create-btn {
  padding: var(--space-md) var(--space-xl);
  font-size: var(--text-base);
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .empty-state {
    min-height: 40vh;
  }

  .empty-content {
    padding: var(--space-lg);
  }

  .empty-icon-bg {
    width: 64px;
    height: 64px;
  }

  .empty-icon {
    width: 32px;
    height: 32px;
  }

  .empty-content h2 {
    font-size: var(--text-xl);
  }

  .empty-description {
    font-size: var(--text-sm);
  }

  .feature-item {
    padding: var(--space-sm);
  }

  .feature-icon-wrapper {
    width: 36px;
    height: 36px;
  }

  .feature-icon {
    width: 18px;
    height: 18px;
  }
}

/* Widget Apps Locked Overlay Styles */
.widget-apps-locked-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.widget-apps-locked-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(243, 70, 17, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.widget-apps-locked-overlay .locked-content {
  text-align: center;
  max-width: 500px;
  padding: var(--space-xl);
  position: relative;
  z-index: 1;
}

.widget-apps-locked-overlay .locked-header {
  margin-bottom: var(--space-lg);
}

.widget-apps-locked-overlay .locked-icon-wrapper {
  margin-bottom: var(--space-md);
}

.widget-apps-locked-overlay .locked-icon-bg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.widget-apps-locked-overlay .locked-icon {
  width: 40px;
  height: 40px;
  color: white;
}

.widget-apps-locked-overlay .locked-header h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.widget-apps-locked-overlay .locked-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--warning-bg);
  color: var(--warning-color);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
}

.widget-apps-locked-overlay .badge-icon {
  width: 14px;
  height: 14px;
}

.widget-apps-locked-overlay .locked-description {
  font-size: var(--text-base);
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: var(--space-xl);
}

.widget-apps-locked-overlay .locked-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.widget-apps-locked-overlay .feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--background-color);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  text-align: left;
}

.widget-apps-locked-overlay .feature-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--info-bg);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.widget-apps-locked-overlay .feature-icon {
  width: 22px;
  height: 22px;
  color: var(--info-color);
}

.widget-apps-locked-overlay .feature-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.widget-apps-locked-overlay .feature-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.widget-apps-locked-overlay .feature-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.widget-apps-locked-overlay .upgrade-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
}

.widget-apps-locked-overlay .upgrade-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.widget-apps-locked-overlay .upgrade-icon {
  width: 20px;
  height: 20px;
}
</style>
