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
import { PlusIcon } from '@heroicons/vue/24/outline'
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
        <div class="page-header-text">
          <h1>Widget Apps</h1>
          <p class="subtitle">
            Generate secure API keys to authenticate your chat widgets.
            <span v-if="hasAnyApps" class="subtitle-count">{{ apps.length }} {{ apps.length === 1 ? 'app' : 'apps' }}</span>
          </p>
        </div>
        <button v-if="hasAnyApps" class="btn btn-primary" @click="showCreateModal = true">
          <PlusIcon class="icon" />
          Create app
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
        <div class="empty-icon-bg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
            <rect x="4" y="4" width="7" height="7" rx="2"/>
            <rect x="13" y="4" width="7" height="7" rx="2"/>
            <rect x="4" y="13" width="7" height="7" rx="2"/>
            <rect x="13" y="13" width="7" height="7" rx="2"/>
          </svg>
        </div>
        <h2>No widget apps yet</h2>
        <p class="empty-description">
          Widget apps let you generate secure API keys for authenticating your chat widgets.
          Create your first to get started.
        </p>
        <button class="btn btn-primary create-btn" @click="showCreateModal = true">
          <PlusIcon class="icon" />
          Create your first app
        </button>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="apps.length > 0" class="table-container">
      <div class="table-head">
        <span class="col-name">NAME</span>
        <span class="col-desc">DESCRIPTION</span>
        <span class="col-created">CREATED</span>
        <span class="col-updated">UPDATED</span>
        <span class="col-actions">ACTIONS</span>
      </div>
      <div
        v-for="app in apps"
        :key="app.id"
        :class="['table-row', { inactive: !app.is_active }]"
      >
        <div class="cell-name">
          <div class="app-name">{{ app.name }}</div>
          <span :class="['status-badge', app.is_active ? 'active' : 'inactive']">
            <span class="status-dot"></span>
            {{ app.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <div class="cell-desc">{{ app.description || '—' }}</div>
        <div class="cell-date">{{ formatDate(app.created_at) }}</div>
        <div class="cell-date">{{ formatDate(app.updated_at) }}</div>
        <div class="cell-actions">
          <button
            class="action-btn"
            title="Edit"
            @click="handleEditApp(app)"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <button
            class="action-btn"
            title="Regenerate key"
            @click="handleRegenerateKey(app)"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>
          </button>
          <button
            class="action-btn action-btn-danger"
            title="Revoke"
            @click="handleDeleteApp(app)"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14"/></svg>
          </button>
        </div>
      </div>
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
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.page-header h1 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
  color: var(--text);
}

.subtitle {
  color: var(--muted);
  font-size: 15px;
  margin: 0;
}

.subtitle-count {
  color: var(--muted2);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.page-header .btn-primary {
  padding: 12px 20px;
  background: var(--accent-ink);
  color: var(--on-accent);
  border: none;
  border-radius: var(--radius-btn);
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: filter var(--transition-fast, 0.15s);
}

.page-header .btn-primary:hover {
  filter: brightness(1.05);
}

.page-header .btn-primary .icon {
  width: 17px;
  height: 17px;
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
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: 18px 0 6px;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: minmax(140px, 1.3fr) minmax(160px, 1.6fr) 130px 130px 130px;
  gap: 14px;
  align-items: center;
}

.table-head {
  padding: 0 22px 14px;
}

.table-head span {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.05em;
  color: var(--faint);
}

.table-head .col-actions {
  text-align: right;
}

.table-row {
  padding: 15px 22px;
  border-top: 1px solid var(--o06);
}

.table-row.inactive {
  opacity: 0.6;
}

.cell-name {
  min-width: 0;
}

.app-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-desc {
  font-size: 13px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-date {
  font-size: 12.5px;
  color: var(--muted);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 10.5px;
  font-weight: 500;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.status-badge.active {
  background: var(--teal-bg);
  border: 1px solid var(--teal-border);
  color: var(--c-online);
}

.status-badge.active .status-dot {
  background: var(--c-teal);
}

.status-badge.inactive {
  background: var(--o06);
  border: 1px solid var(--o10);
  color: var(--muted);
}

.status-badge.inactive .status-dot {
  background: var(--muted);
}

.cell-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--o05);
  border: 1px solid var(--o12);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast, 0.15s), color var(--transition-fast, 0.15s);
}

.action-btn:hover {
  background: var(--o10);
  color: var(--text2);
}

.action-btn-danger {
  background: transparent;
  border: 1px solid var(--coral-border);
  color: var(--c-coral);
}

.action-btn-danger:hover {
  background: var(--coral-bg);
  color: var(--c-coral);
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
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
}

.empty-content {
  max-width: 440px;
  margin: 0 auto;
}

.empty-icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin: 0 auto 18px;
  border-radius: 16px;
  background: var(--accent-bg-12);
  border: 1px solid var(--accent-border);
}

.empty-icon {
  width: 28px;
  height: 28px;
  color: var(--accent-ink);
}

.empty-content h2 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  color: var(--text);
  margin: 0 0 8px;
}

.empty-description {
  font-size: 14.5px;
  color: var(--muted);
  line-height: 1.55;
  margin: 0 auto 26px;
}

.create-btn {
  padding: 13px 24px;
  background: var(--accent-ink);
  color: var(--on-accent);
  border: none;
  border-radius: var(--radius-btn);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: filter var(--transition-fast, 0.15s);
}

.create-btn:hover {
  filter: brightness(1.05);
}

.create-btn .icon {
  width: 17px;
  height: 17px;
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
    radial-gradient(circle at 20% 80%, rgba(201, 242, 78, 0.04) 0%, transparent 50%),
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
  color: var(--on-accent);
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
  color: var(--on-accent);
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
