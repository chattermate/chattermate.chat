<!--
ChatterMate - Agent Advanced Tab
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
import type { Agent } from '@/types/agent'
import { agentService } from '@/services/agent'
import { toast } from 'vue-sonner'

const props = defineProps<{
  agent: Agent
}>()

const emit = defineEmits<{
  (e: 'update', agent: Agent): void
}>()

// Create a ref for the agent
const agentRef = ref(props.agent)

// Import the composable
import { useAgentAdvanced } from '@/composables/useAgentAdvanced'

// Use the composable
const {
  localSettings,
  isLoading,
  error,
  hasUnsavedChanges,
  toggleRateLimiting,
  updateLocalValue,
  saveRateLimitSettings
} = useAgentAdvanced(agentRef)

// Handle successful updates
const handleUpdate = (updatedAgent: Agent) => {
  emit('update', updatedAgent)
}

// Handle toggle rate limiting
const handleToggleRateLimiting = async () => {
  try {
    const updatedAgent = await toggleRateLimiting()
    handleUpdate(updatedAgent)
  } catch (err) {
    // Error is handled in the composable
  }
}

// Handle slider value changes
const handleValueChange = (type: 'overallLimitPerIp' | 'requestsPerSec', event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target) return
  
  updateLocalValue(type, target.value)
}

// Handle save settings
const handleSaveSettings = async () => {
  try {
    const updatedAgent = await saveRateLimitSettings()
    handleUpdate(updatedAgent)
  } catch (err) {
    // Error is handled in the composable
  }
}

// Handle attachments setting toggle
const updateAttachmentsSetting = async (enabled: boolean) => {
  try {
    // Call API to save the setting
    const updatedAgent = await agentService.updateAgent(agentRef.value.id, {
      allow_attachments: enabled
    })
    
    // Update local reference
    agentRef.value.allow_attachments = updatedAgent.allow_attachments
    
    // Emit update to parent
    emit('update', updatedAgent)
    
    // Show success toast
    toast.success('Attachment setting updated', {
      duration: 2000
    })
  } catch (err) {
    console.error('Failed to update attachments setting:', err)
    toast.error('Failed to update attachment setting', {
      duration: 2000
    })
  }
}

// Allowed file type categories
const fileTypeCategories = [
  { value: 'images', label: 'Images', description: 'JPG, PNG, GIF, WebP' },
  { value: 'documents', label: 'PDF Documents', description: 'PDF files' },
  { value: 'office', label: 'Office Files', description: 'DOC, DOCX, XLS, XLSX' },
  { value: 'text', label: 'Text Files', description: 'TXT, CSV' }
]

// Check if a category is selected
const isCategorySelected = (category: string): boolean => {
  const types = agentRef.value.allowed_attachment_types
  // If null or empty, all types are allowed
  if (!types || types.length === 0) return true
  return types.includes(category)
}

// Toggle a file type category
const toggleFileTypeCategory = async (category: string) => {
  try {
    let currentTypes = agentRef.value.allowed_attachment_types || []
    
    // If currently empty (all allowed), start with all categories
    if (currentTypes.length === 0) {
      currentTypes = fileTypeCategories.map(c => c.value)
    }
    
    let newTypes: string[]
    if (currentTypes.includes(category)) {
      // Remove category (but ensure at least one remains)
      newTypes = currentTypes.filter(t => t !== category)
      if (newTypes.length === 0) {
        toast.error('At least one file type must be allowed', { duration: 2000 })
        return
      }
    } else {
      // Add category
      newTypes = [...currentTypes, category]
    }
    
    // If all categories selected, set to null (allow all)
    const finalTypes = newTypes.length === fileTypeCategories.length ? null : newTypes
    
    const updatedAgent = await agentService.updateAgent(agentRef.value.id, {
      allowed_attachment_types: finalTypes
    })
    
    agentRef.value.allowed_attachment_types = updatedAgent.allowed_attachment_types
    emit('update', updatedAgent)
    
    toast.success('Allowed file types updated', { duration: 2000 })
  } catch (err) {
    console.error('Failed to update allowed file types:', err)
    toast.error('Failed to update allowed file types', { duration: 2000 })
  }
}

// Handle token authentication setting toggle
const updateTokenAuthSetting = async (enabled: boolean) => {
  try {
    // Call API to save the setting
    const updatedAgent = await agentService.updateAgent(agentRef.value.id, {
      require_token_auth: enabled
    })
    
    // Update local reference
    agentRef.value.require_token_auth = updatedAgent.require_token_auth
    
    // Emit update to parent
    emit('update', updatedAgent)
    
    // Show success toast
    toast.success(`Widget token authentication ${enabled ? 'enabled' : 'disabled'}`, {
      duration: 2000
    })
  } catch (err) {
    console.error('Failed to update token auth setting:', err)
    toast.error('Failed to update token authentication setting', {
      duration: 2000
    })
  }
}
</script>

<template>
  <div class="advanced-tab">
    <div class="page-header">
      <h3 class="page-title">Advanced Settings</h3>
      <p class="page-description">
        Configure rate limiting, security, and other technical options for your agent.
      </p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="settings-grid">
      <!-- Rate Limiting Card -->
      <div class="settings-card" :class="{ 'loading': isLoading }">
        <div class="card-header">
          <div class="card-title-section">
            <div class="card-icon rate-limit-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4 class="card-title">Rate Limiting</h4>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              :checked="localSettings.enableRateLimiting"
              @change="handleToggleRateLimiting"
              :disabled="isLoading"
            >
            <span class="slider" :class="{ 'enabled': localSettings.enableRateLimiting }"></span>
          </label>
        </div>

        <p class="card-description">Protect your agent from abuse by limiting requests per user.</p>

        <div v-if="localSettings.enableRateLimiting" class="card-content">
          <div class="setting-row">
            <div class="setting-info">
              <label class="setting-label">Daily Limit</label>
              <span class="setting-hint">Max requests per IP per day</span>
            </div>
            <div class="setting-control">
              <input
                type="number"
                v-model="localSettings.overallLimitPerIp"
                @input="(e) => handleValueChange('overallLimitPerIp', e)"
                min="10"
                max="1000"
                step="10"
                class="number-input"
                :disabled="isLoading"
              >
              <input
                type="range"
                v-model="localSettings.overallLimitPerIp"
                @input="(e) => handleValueChange('overallLimitPerIp', e)"
                min="10"
                max="1000"
                step="10"
                class="range-input"
                :disabled="isLoading"
              >
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label class="setting-label">Rate Limit</label>
              <span class="setting-hint">Requests per second</span>
            </div>
            <div class="setting-control">
              <input
                type="number"
                v-model="localSettings.requestsPerSec"
                @input="(e) => handleValueChange('requestsPerSec', e)"
                min="1"
                max="10"
                step="1"
                class="number-input"
                :disabled="isLoading"
              >
              <input
                type="range"
                v-model="localSettings.requestsPerSec"
                @input="(e) => handleValueChange('requestsPerSec', e)"
                min="1"
                max="10"
                step="1"
                class="range-input"
                :disabled="isLoading"
              >
            </div>
          </div>

          <button
            class="save-btn"
            @click="handleSaveSettings"
            :disabled="isLoading || !hasUnsavedChanges"
          >
            Save Changes
          </button>
        </div>
      </div>

      <!-- Token Authentication Card -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-title-section">
            <div class="card-icon security-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4 class="card-title">Widget Authentication</h4>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              v-model="agentRef.require_token_auth"
              @change="(e) => updateTokenAuthSetting((e.target as HTMLInputElement).checked)"
              :disabled="isLoading"
            >
            <span class="slider" :class="{ 'enabled': agentRef.require_token_auth }"></span>
          </label>
        </div>

        <p class="card-description">Require server-side token authentication for widget access.</p>

        <div class="card-content">
          <div class="status-badge" :class="agentRef.require_token_auth ? 'enabled' : 'disabled'">
            <svg v-if="agentRef.require_token_auth" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ agentRef.require_token_auth ? 'Tokens required' : 'Anonymous access allowed' }}
          </div>

          <div v-if="agentRef.require_token_auth" class="info-callout">
            <strong>Setup:</strong> Create an API key in <strong>Settings → Widget Apps</strong>, then call
            <code>/api/v1/generate-token</code> from your backend.
          </div>
        </div>
      </div>

      <!-- File Attachments Card -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-title-section">
            <div class="card-icon attachments-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.00502 21.9983C6.41282 21.9983 4.88586 21.3658 3.76002 20.24C2.63419 19.1142 2.00171 17.5872 2.00171 15.995C2.00171 14.4028 2.63419 12.8758 3.76002 11.75L12.33 3.18C13.0806 2.42975 14.0991 2.00892 15.16 2.00892C16.221 2.00892 17.2395 2.42975 17.99 3.18C18.7403 3.93053 19.1611 4.94903 19.1611 6.01C19.1611 7.07097 18.7403 8.08947 17.99 8.84L9.41002 17.41C9.03476 17.7853 8.52557 17.9961 7.99502 17.9961C7.46448 17.9961 6.95529 17.7853 6.58002 17.41C6.20476 17.0347 5.99393 16.5256 5.99393 15.995C5.99393 15.4644 6.20476 14.9553 6.58002 14.58L15.07 6.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4 class="card-title">File Attachments</h4>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              :checked="agentRef.allow_attachments"
              @change="(e) => updateAttachmentsSetting((e.target as HTMLInputElement).checked)"
              :disabled="isLoading"
            >
            <span class="slider" :class="{ 'enabled': agentRef.allow_attachments }"></span>
          </label>
        </div>

        <p class="card-description">Allow users to upload files during human agent handoff.</p>

        <div v-if="agentRef.allow_attachments" class="card-content">
          <div class="file-types-grid">
            <button
              v-for="category in fileTypeCategories"
              :key="category.value"
              class="file-type-chip"
              :class="{ 'selected': isCategorySelected(category.value) }"
              @click="toggleFileTypeCategory(category.value)"
            >
              <svg v-if="isCategorySelected(category.value)" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ category.label }}</span>
            </button>
          </div>
          <p class="file-types-note">
            {{ !agentRef.allowed_attachment_types || agentRef.allowed_attachment_types.length === 0 ? 'All file types allowed' : 'Click to toggle file types' }}
          </p>
        </div>

        <div v-else class="card-content">
          <p class="disabled-note">Enable to allow file uploads during human agent conversations.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.advanced-tab {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-lg);
  animation: fadeIn 0.3s ease;
}

/* Page Header */
.page-header {
  margin-bottom: var(--space-xl);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 var(--space-xs) 0;
}

.page-description {
  color: var(--text-muted);
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

/* Settings Grid */
.settings-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Settings Card */
.settings-card {
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.settings-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.settings-card.loading {
  opacity: 0.6;
  pointer-events: none;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.card-title-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon.rate-limit-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.card-icon.security-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.card-icon.attachments-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.card-description {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.5;
}

.card-content {
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-color);
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e0e0e0;
  transition: 0.3s;
  border-radius: 26px;
}

.slider.enabled {
  background-color: #10b981;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

/* Setting Rows */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-row:last-of-type {
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-color);
}

.setting-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.setting-control {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex: 1;
  max-width: 300px;
  margin-left: var(--space-xl);
}

.number-input {
  width: 70px;
  padding: var(--space-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-color);
  font-size: 0.9rem;
  text-align: center;
  flex-shrink: 0;
}

.number-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.range-input {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.range-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
}

/* Save Button */
.save-btn {
  margin-top: var(--space-lg);
  padding: var(--space-sm) var(--space-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.enabled {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge.disabled {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

/* Info Callout */
.info-callout {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: rgba(245, 158, 11, 0.08);
  border-radius: var(--radius-md);
  border-left: 3px solid #f59e0b;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-color);
}

.info-callout code {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.9em;
}

/* File Types Grid */
.file-types-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.file-type-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-type-chip:hover {
  border-color: var(--primary-color);
  color: var(--text-color);
}

.file-type-chip.selected {
  background: rgba(243, 70, 17, 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.file-types-note {
  margin-top: var(--space-md);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.disabled-note {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

/* Error Message */
.error-message {
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  line-height: 1.5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .advanced-tab {
    padding: 0 var(--space-md);
  }

  .settings-card {
    padding: var(--space-lg);
  }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .setting-control {
    margin-left: 0;
    max-width: 100%;
    width: 100%;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
}
</style> 