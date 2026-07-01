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

// Handle cancel - restore local rate-limit values from the agent reference
const handleCancel = () => {
  localSettings.value = {
    ...localSettings.value,
    overallLimitPerIp: String(agentRef.value.overall_limit_per_ip || 100),
    requestsPerSec: String(agentRef.value.requests_per_sec || 1)
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
      <h3 class="page-title">Advanced settings</h3>
      <p class="page-description">
        Configure rate limiting, security and other technical options for your agent.
      </p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="settings-grid">
      <!-- Rate Limiting Card -->
      <div class="settings-card" :class="{ 'loading': isLoading }">
        <div class="card-top">
          <div class="card-lead">
            <div class="card-icon icon-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="card-meta">
              <div class="card-title">Rate limiting</div>
              <div class="card-desc">Protect your agent from abuse by limiting requests per user.</div>
            </div>
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

        <div v-if="localSettings.enableRateLimiting" class="card-extra">
          <div class="num-fields">
            <div class="num-field">
              <label class="num-label">Max requests</label>
              <input
                type="number"
                v-model="localSettings.overallLimitPerIp"
                @input="(e) => handleValueChange('overallLimitPerIp', e)"
                min="10"
                max="1000"
                step="10"
                class="num-input"
                :disabled="isLoading"
              >
            </div>
            <div class="num-field">
              <label class="num-label">Per (seconds)</label>
              <input
                type="number"
                v-model="localSettings.requestsPerSec"
                @input="(e) => handleValueChange('requestsPerSec', e)"
                min="1"
                max="10"
                step="1"
                class="num-input"
                :disabled="isLoading"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Token Authentication Card -->
      <div class="settings-card">
        <div class="card-top">
          <div class="card-lead">
            <div class="card-icon icon-coral">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="card-meta">
              <div class="card-title">Widget authentication</div>
              <div class="card-desc">Require server-side token authentication for widget access.</div>
            </div>
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

        <div class="card-extra">
          <div v-if="agentRef.require_token_auth" class="locked-note">
            <span class="locked-note-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span>
              <strong>Setup:</strong> Create an API key in <strong>Settings → Widget Apps</strong>, then call
              <code>/api/v1/generate-token</code> from your backend.
            </span>
          </div>
          <div v-else class="info-pill">
            <span class="info-pill-icon">&#9432;</span>
            <span>Anonymous access allowed</span>
          </div>
        </div>
      </div>

      <!-- File Attachments Card -->
      <div class="settings-card">
        <div class="card-top">
          <div class="card-lead">
            <div class="card-icon icon-teal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.00502 21.9983C6.41282 21.9983 4.88586 21.3658 3.76002 20.24C2.63419 19.1142 2.00171 17.5872 2.00171 15.995C2.00171 14.4028 2.63419 12.8758 3.76002 11.75L12.33 3.18C13.0806 2.42975 14.0991 2.00892 15.16 2.00892C16.221 2.00892 17.2395 2.42975 17.99 3.18C18.7403 3.93053 19.1611 4.94903 19.1611 6.01C19.1611 7.07097 18.7403 8.08947 17.99 8.84L9.41002 17.41C9.03476 17.7853 8.52557 17.9961 7.99502 17.9961C7.46448 17.9961 6.95529 17.7853 6.58002 17.41C6.20476 17.0347 5.99393 16.5256 5.99393 15.995C5.99393 15.4644 6.20476 14.9553 6.58002 14.58L15.07 6.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="card-meta">
              <div class="card-title">File attachments</div>
              <div class="card-desc">Allow users to upload files during human-agent handoff.</div>
            </div>
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

        <div v-if="agentRef.allow_attachments" class="card-extra">
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
          <p class="extra-note">
            Customers can upload files once a human agent joins the conversation.
          </p>
        </div>

        <div v-else class="card-extra">
          <p class="extra-note">Enable to allow file uploads during human-agent conversations.</p>
        </div>
      </div>
    </div>

    <!-- Save bar -->
    <div class="save-bar">
      <button
        class="btn-ghost"
        type="button"
        @click="handleCancel"
        :disabled="isLoading || !hasUnsavedChanges"
      >
        Cancel
      </button>
      <button
        class="btn-primary"
        type="button"
        @click="handleSaveSettings"
        :disabled="isLoading || !hasUnsavedChanges"
      >
        Save changes
      </button>
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
  margin-bottom: 22px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 6px 0;
}

.page-description {
  color: var(--muted);
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

/* Settings Grid */
.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Settings Card */
.settings-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
}

.settings-card.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Card top row */
.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.card-lead {
  display: flex;
  gap: 14px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-btn);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon.icon-info {
  background: color-mix(in srgb, var(--c-info) 14%, transparent);
  color: var(--c-info);
}

.card-icon.icon-coral {
  background: var(--coral-bg);
  color: var(--c-coral);
}

.card-icon.icon-teal {
  background: color-mix(in srgb, var(--c-teal) 14%, transparent);
  color: var(--c-teal);
}

.card-meta {
  min-width: 0;
}

.card-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16.5px;
  color: var(--text);
}

.card-desc {
  font-size: 13.5px;
  color: var(--muted);
  margin-top: 4px;
  max-width: 520px;
  line-height: 1.5;
}

/* Card extra (revealed area) */
.card-extra {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--o06);
}

/* Toggle Switch (46x26) */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
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
  inset: 0;
  background: var(--toggle-track-off);
  transition: background 0.15s;
  border-radius: var(--radius-pill);
}

.slider.enabled {
  background: var(--toggle-on-teal);
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  top: 3px;
  background: var(--toggle-knob);
  transition: transform 0.15s;
  border-radius: 50%;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

/* Number fields (rate limiting) */
.num-fields {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.num-field {
  flex: 1;
  min-width: 140px;
}

.num-label {
  display: block;
  font-size: 12.5px;
  color: var(--muted);
  margin-bottom: 7px;
}

.num-input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 13px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: var(--radius-md);
  color: var(--text);
  font-size: 14px;
  font-family: var(--font-mono);
  outline: none;
}

.num-input:focus {
  border-color: var(--accent-ink);
}

/* Widget auth - locked note */
.locked-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.locked-note-icon {
  flex-shrink: 0;
  display: inline-flex;
  color: var(--c-teal);
}

.locked-note code {
  background: var(--o06);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--text);
}

/* Widget auth - info pill */
.info-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 13px;
  border-radius: var(--radius-pill);
  background: var(--o05);
  border: 1px solid var(--o08);
  color: var(--muted);
  font-size: 13px;
}

.info-pill-icon {
  font-size: 13px;
  line-height: 1;
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
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-type-chip:hover {
  border-color: var(--accent-ink);
  color: var(--text);
}

.file-type-chip.selected {
  background: var(--accent-bg-08);
  border-color: var(--accent-ink);
  color: var(--accent-ink);
}

/* Descriptive extra text */
.extra-note {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
}

.file-types-grid + .extra-note {
  margin-top: var(--space-md);
}

/* Save bar */
.save-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 0 4px;
}

.btn-ghost,
.btn-primary {
  padding: 13px 22px;
  border-radius: var(--radius-btn);
  font-family: var(--font-display);
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost {
  background: var(--o05);
  border: 1px solid var(--o14);
  color: var(--text);
}

.btn-primary {
  padding: 13px 26px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
}

.btn-primary:hover:not(:disabled),
.btn-ghost:hover:not(:disabled) {
  filter: brightness(1.05);
}

.btn-ghost:disabled,
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Error Message */
.error-message {
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  background: var(--coral-bg);
  color: var(--c-coral);
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

  .card-top {
    flex-direction: row;
    align-items: flex-start;
    gap: var(--space-md);
  }
}
</style> 