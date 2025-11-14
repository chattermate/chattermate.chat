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
import { computed, ref } from 'vue'
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
  rateLimitTooltipContent,
  dailyLimitTooltipContent,
  requestsPerSecTooltipContent,
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
</script>

<template>
  <div class="advanced-tab">
    <div class="advanced-settings">
      <h3 class="section-title">Advanced Settings</h3>
      <p class="section-description">
        Configure advanced options for your agent including rate limiting and other technical settings.
      </p>
      
      <!-- Error message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <!-- Rate Limiting Section -->
      <div class="rate-limiting-section" :class="{ 'loading': isLoading }">
        <div class="section-header">
          <h4 class="subsection-title">Rate Limiting</h4>
          <div class="toggle-switch">
            <span class="toggle-label">
              Enable Rate Limiting
            </span>
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
        </div>
        
        <hr class="divider">
        
        <div class="rate-limit-settings" v-if="localSettings.enableRateLimiting">
          <p class="helper-text">Configure rate limiting to protect your agent from abuse and control traffic.</p>
          
          <div class="form-group">
            <label>
              Daily Limit (requests per IP)
            </label>
            <div class="input-with-slider">
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
          
          <div class="form-group">
            <label>
              Rate Limit (requests per second)
            </label>
            <div class="input-with-slider">
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

          <!-- Save Settings Button -->
          <button 
            class="save-settings-btn" 
            @click="handleSaveSettings"
            :disabled="isLoading || !hasUnsavedChanges"
          >
            Save Settings
          </button>
        </div>
        
        <div class="rate-limit-disabled" v-else>
          <p class="disabled-message">
            <i class="fas fa-info-circle"></i>
            Rate limiting is currently disabled. Enable it to protect your agent from abuse and control traffic.
          </p>
        </div>
      </div>

      <!-- File Attachments Section -->
      <div class="attachments-section">
        <div class="section-header">
          <h4 class="subsection-title">File Attachments</h4>
          <div class="toggle-switch">
            <span class="toggle-label">
              Allow Attachments
            </span>
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
        </div>
        
        <hr class="divider">
        
        <div class="attachments-info">
          <p v-if="agentRef.allow_attachments" class="helper-text success-text">
            <i class="fas fa-check-circle"></i>
            File attachments are enabled for this agent. Users can upload and attach files to their messages when the chat is handed over to a human agent.
          </p>
          <p v-else class="helper-text warning-text">
            <i class="fas fa-ban"></i>
            File attachments are disabled for this agent. Users cannot upload files.
          </p>
          <p class="helper-text info-text" style="margin-top: 8px;">
            <i class="fas fa-info-circle"></i>
            <strong>Note:</strong> Attachments are only available when the chat is handed over to a human agent, not during AI agent conversations.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.advanced-tab {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-lg);
}

.advanced-settings {
  animation: fadeIn 0.3s ease;
  width: 100%;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--space-xs);
}

.section-description {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: var(--space-lg);
  line-height: 1.5;
}

.subsection-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.rate-limiting-section {
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  transition: opacity 0.3s ease;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.attachments-section {
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.rate-limiting-section.loading {
  opacity: 0.7;
  pointer-events: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.toggle-label {
  font-size: 0.9em;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: help;
}

.info-icon {
  font-size: 0.9em;
  color: var(--text-muted);
  opacity: 0.7;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
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
  background-color: rgb(224, 224, 224);
  transition: .4s;
  border-radius: 24px;
}

.slider.enabled {
  background-color: #4caf50;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: rgb(255, 255, 255);
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

input:checked + .slider {
  background-color: #4caf50;
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.rate-limit-settings {
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
}

.helper-text {
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
  line-height: 1.5;
}

.form-group {
  margin-bottom: var(--space-xl);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-md);
  font-weight: 500;
  color: var(--text-color);
  font-size: 1rem;
}

.input-with-slider {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  max-width: 700px;
}

.number-input {
  width: 80px;
  padding: var(--space-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-color);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.range-input {
  flex: 1;
  accent-color: var(--primary-color);
  height: 6px;
  width: calc(100% - 100px);
  -webkit-appearance: none;
  appearance: none;
  background: #e0e0e0;
  border-radius: 4px;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f34611;
  cursor: pointer;
  border: none;
}

.range-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f34611;
  cursor: pointer;
  border: none;
}

.save-settings-btn {
  margin-top: var(--space-lg);
  padding: var(--space-sm) var(--space-lg);
  background: #bb8873;
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.save-settings-btn:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.save-settings-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.rate-limit-disabled {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--background-mute);
  border-radius: var(--radius-md);
}

.disabled-message {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  line-height: 1.5;
  margin: 0;
}

.disabled-message i {
  color: var(--warning);
  flex-shrink: 0;
}

.error-message {
  padding: var(--space-md);
  margin-bottom: var(--space-md);
  background: var(--error-color-soft);
  color: var(--error-color);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  line-height: 1.5;
}

.divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: var(--space-md) 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.attachments-info {
  margin-top: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--background-mute);
}

.success-text {
  color: #2ecc71;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.success-text i {
  color: #27ae60;
  flex-shrink: 0;
}

.warning-text {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.warning-text i {
  color: #e67e22;
  flex-shrink: 0;
}

.info-text {
  color: #3498db;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.info-text i {
  color: #2980b9;
  flex-shrink: 0;
}
</style> 