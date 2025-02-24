<!--
ChatterMate - Organizations
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
import { ref,onMounted } from 'vue'
import { useOrganizationSettings } from '@/composables/useOrganizationSettings'
// @ts-ignore
import { listTz, clientTz } from 'timezone-select-js'

const {
  formData,
  loading,
  message,
  error,
  stats,
  hasChanges,
  days,
  timeOptions,
  loadOrganizationData,
  updateOrganization
} = useOrganizationSettings()

const timezones = ref(listTz())

onMounted(async () => {
  await loadOrganizationData()
})
</script>

<template>
  <div class="settings-window">
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
    </div>

    <div v-else class="settings-content">
      <div class="settings-header">
        <div class="header-content">
          <h3>Organization Settings</h3>
        </div>
        <p class="settings-description">
          Manage your organization settings and configuration
        </p>
      </div>

      <form @submit.prevent="updateOrganization" class="settings-form">
        <!-- Organization Info -->
        <div class="form-section">
          <h4>Organization Information</h4>
          
          <div class="form-group">
            <label>Organization Name</label>
            <input 
              type="text" 
              v-model="formData.name" 
              placeholder="Organization name"
            >
          </div>

          <div class="form-group">
            <label>Domain</label>
            <input 
              type="text" 
              v-model="formData.domain" 
              placeholder="Organization domain"
            >
          </div>

          <div class="form-group">
            <label>Timezone</label>
            <select 
              class="form-input" 
              v-model="formData.timezone"
            >
              <option 
                v-for="tz in timezones" 
                :key="tz.value" 
                :value="tz.value"
              >
                {{ tz.label }}
              </option>
            </select>
            <p class="form-hint">
              Organization's primary timezone
            </p>
          </div>

          <div class="form-group">
            <label>Business Hours</label>
            <div class="business-hours">
              <div v-for="day in days" :key="day.key" class="day-row">
                <div class="day-toggle">
                  <label class="toggle">
                    <input 
                      type="checkbox" 
                      v-model="formData.business_hours[day.key].enabled"
                    >
                    <span class="toggle-slider"></span>
                  </label>
                  <span class="day-label">{{ day.label }}</span>
                </div>
                <div class="time-selects" :class="{ disabled: !formData.business_hours[day.key].enabled }">
                  <select 
                    v-model="formData.business_hours[day.key].start"
                    :disabled="!formData.business_hours[day.key].enabled"
                  >
                    <option v-for="time in timeOptions" :key="time" :value="time">
                      {{ time }}
                    </option>
                  </select>
                  <span class="time-separator">to</span>
                  <select 
                    v-model="formData.business_hours[day.key].end"
                    :disabled="!formData.business_hours[day.key].enabled"
                  >
                    <option v-for="time in timeOptions" :key="time" :value="time">
                      {{ time }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <p class="form-hint">Set your organization's operating hours for each day</p>
          </div>
        </div>

        <!-- Organization Stats -->
        <div class="form-section" v-if="stats">
          <h4>Organization Statistics</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Total Users</span>
              <span class="stat-value">{{ stats.total_users }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Active Users</span>
              <span class="stat-value">{{ stats.active_users }}</span>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading || !hasChanges"
          >
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>

          <p v-if="message" class="success-message">{{ message }}</p>
          <p v-if="error" class="error-message">{{ error }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.settings-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 15px rgb(131, 129, 129);
  padding: var(--space-lg);
}

.settings-content {
  flex: 1;
  padding: var(--space-lg);
  background: transparent;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid var(--primary-color-soft);
  border-bottom-color: var(--primary-color);
  border-radius: 50%;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
}

.settings-header {
  margin-bottom: var(--space-xl);
}

.settings-description {
  color: var(--text-color);
  opacity: 0.7;
  margin-top: var(--space-sm);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.form-section {
  background: var(--background-soft);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.form-section h4 {
  margin-bottom: var(--space-lg);
  color: var(--text-color);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-mute);
  color: var(--text-color);
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
}

.stat-item {
  padding: var(--space-md);
  background: var(--background-mute);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.submit-button {
  padding: var(--space-sm) var(--space-xl);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-message {
  color: var(--success-color);
}

.error-message {
  color: var(--error-color);
}

select.form-input {
  padding-right: var(--space-xl);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-sm) center;
  background-size: 16px;
}

.form-hint {
  font-size: var(--text-sm);
  color: var(--text-color);
  opacity: 0.7;
  margin-top: var(--space-xs);
}

.business-hours {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.day-row {
  display: flex;
  align-items: center;
  padding: var(--space-sm) 0;
  gap: var(--space-lg);
}

.day-row:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.day-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 120px;
}

.day-label {
  font-size: var(--text-sm);
  color: var(--text-color);
}

.time-selects {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.time-selects.disabled {
  opacity: 0.5;
}

.time-selects select {
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-mute);
  color: var(--text-color);
  font-size: var(--text-sm);
}

.time-separator {
  color: var(--text-color);
  opacity: 0.7;
  font-size: var(--text-sm);
}

.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--background-mute);
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

@media (max-width: 640px) {
  .day-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .day-toggle {
    width: 100%;
  }
  
  .time-selects {
    width: 100%;
    justify-content: space-between;
  }
}
</style> 