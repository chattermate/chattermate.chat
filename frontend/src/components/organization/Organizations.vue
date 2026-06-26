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
import { ref, computed, onMounted } from 'vue'
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

const orgInitial = computed(() => (formData.value.name || 'O').charAt(0).toUpperCase())

// Danger zone — no destructive API yet; route the user to support.
const onTransferOwnership = () => {
  window.alert('To transfer ownership, please contact support@chattermate.chat.')
}
const onDeleteOrganization = () => {
  if (window.confirm('Permanently delete this organization and all its data? This cannot be undone.')) {
    window.alert('Organization deletion must be completed by support — please contact support@chattermate.chat.')
  }
}

// Business-hours presets — pure client-side mutation of formData
const applyPreset = (preset: 'weekday' | 'everyday' | 'always' | 'clear') => {
  for (const day of days) {
    const bh = formData.value.business_hours[day.key]
    const isWeekend = day.key === 'saturday' || day.key === 'sunday'
    switch (preset) {
      case 'weekday':
        bh.enabled = !isWeekend
        bh.start = '09:00'
        bh.end = '17:00'
        break
      case 'everyday':
        bh.enabled = true
        bh.start = '09:00'
        bh.end = '18:00'
        break
      case 'always':
        bh.enabled = true
        bh.start = '00:00'
        bh.end = '23:45'
        break
      case 'clear':
        bh.enabled = false
        break
    }
  }
}

const discardChanges = () => {
  // Reload from server-backed original state
  loadOrganizationData()
}

onMounted(async () => {
  await loadOrganizationData()
})
</script>

<template>
  <div class="org-settings">
    <div v-if="loading && !formData.name" class="loading-container">
      <div class="loader"></div>
    </div>

    <div v-else class="org-page">
      <!-- Page header -->
      <header class="org-header">
        <h1 class="org-title">Organization</h1>
        <p class="org-subtitle">Your workspace profile, hours of operation and team overview.</p>
      </header>

      <!-- Stats strip -->
      <div v-if="stats" class="stats-strip">
        <div class="stat-card">
          <span class="stat-label">MEMBERS</span>
          <span class="stat-value">{{ stats.members_total ?? stats.total_users ?? 0 }}</span>
          <span class="stat-sub members">{{ stats.members_admins ?? 0 }} admins · {{ stats.members_agents ?? 0 }} agents</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">ACTIVE NOW</span>
          <span class="stat-value">{{ stats.active_now ?? 0 }}</span>
          <span class="stat-sub active">online today</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">AI AGENTS</span>
          <span class="stat-value">{{ stats.agents_total ?? 0 }}</span>
          <span class="stat-sub agents">{{ stats.agents_live ?? 0 }} live · {{ stats.agents_draft ?? 0 }} draft</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">CONVERSATIONS · 30D</span>
          <span class="stat-value">{{ (stats.conversations_30d ?? 0).toLocaleString() }}</span>
          <span class="stat-sub conversations">
            {{ (stats.conversations_change_pct ?? 0) >= 0 ? '▲' : '▼' }}
            {{ Math.abs(stats.conversations_change_pct ?? 0) }}% vs prev
          </span>
        </div>
      </div>

      <form @submit.prevent="updateOrganization">
        <!-- PROFILE -->
        <section class="card">
          <div class="card-head">
            <h3 class="card-title">Profile</h3>
            <p class="card-desc">How your workspace appears to your team and customers.</p>
          </div>

          <div class="logo-row">
            <div class="org-logo">{{ orgInitial }}</div>
            <div class="logo-meta">
              <div class="logo-meta-title">Workspace logo</div>
              <div class="logo-meta-sub">Generated from your organization name.</div>
            </div>
          </div>

          <div class="field-grid">
            <div class="field">
              <label>Organization name</label>
              <input
                type="text"
                v-model="formData.name"
                placeholder="Organization name"
              >
            </div>
            <div class="field">
              <label>Primary domain</label>
              <input
                type="text"
                class="mono"
                v-model="formData.domain"
                placeholder="example.com"
              >
            </div>
          </div>

          <div class="field">
            <label>Timezone</label>
            <select class="select" v-model="formData.timezone">
              <option
                v-for="tz in timezones"
                :key="tz.value"
                :value="tz.value"
              >
                {{ tz.label }}
              </option>
            </select>
            <p class="field-hint">Used for business hours, reports and timestamps across the workspace.</p>
          </div>
        </section>

        <!-- BUSINESS HOURS -->
        <section class="card">
          <div class="card-head-row">
            <div>
              <h3 class="card-title">Business hours</h3>
              <p class="card-desc">When your human team is available. Outside these hours, AI handles every chat.</p>
            </div>
            <div class="presets">
              <button type="button" class="preset" @click="applyPreset('weekday')">Weekdays 9–5</button>
              <button type="button" class="preset" @click="applyPreset('everyday')">Every day 9–6</button>
              <button type="button" class="preset" @click="applyPreset('always')">24/7</button>
              <button type="button" class="preset preset-ghost" @click="applyPreset('clear')">Clear all</button>
            </div>
          </div>

          <div class="hours-list">
            <div v-for="day in days" :key="day.key" class="day-row">
              <button
                type="button"
                class="toggle"
                :class="{ on: formData.business_hours[day.key].enabled }"
                role="switch"
                :aria-checked="formData.business_hours[day.key].enabled"
                @click="formData.business_hours[day.key].enabled = !formData.business_hours[day.key].enabled"
              >
                <span class="knob"></span>
              </button>
              <span
                class="day-label"
                :class="{ off: !formData.business_hours[day.key].enabled }"
              >{{ day.label }}</span>
              <select
                class="time-select"
                v-model="formData.business_hours[day.key].start"
                :disabled="!formData.business_hours[day.key].enabled"
              >
                <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
              </select>
              <span class="time-sep">to</span>
              <select
                class="time-select"
                v-model="formData.business_hours[day.key].end"
                :disabled="!formData.business_hours[day.key].enabled"
              >
                <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
              </select>
              <span
                class="day-state"
                :class="formData.business_hours[day.key].enabled ? 'open' : 'closed'"
              >{{ formData.business_hours[day.key].enabled ? 'Open' : 'Closed' }}</span>
            </div>
          </div>
        </section>

        <!-- DANGER ZONE -->
        <section class="card danger-card">
          <h3 class="danger-title">Danger zone</h3>
          <div class="danger-row">
            <div>
              <div class="danger-row-title">Transfer ownership</div>
              <div class="danger-row-desc">Hand this workspace to another admin.</div>
            </div>
            <button type="button" class="danger-btn" @click="onTransferOwnership">Transfer</button>
          </div>
          <div class="danger-row last">
            <div>
              <div class="danger-row-title">Delete organization</div>
              <div class="danger-row-desc">Permanently remove this workspace and all its data.</div>
            </div>
            <button type="button" class="danger-btn delete" @click="onDeleteOrganization">Delete</button>
          </div>
        </section>

        <p v-if="message" class="success-message">{{ message }}</p>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>

    <!-- Sticky save bar -->
    <Transition name="save-bar">
      <div v-if="hasChanges" class="save-bar">
        <span class="save-bar-text">You have unsaved changes</span>
        <div class="save-bar-actions">
          <button type="button" class="btn-discard" @click="discardChanges" :disabled="loading">Discard</button>
          <button type="button" class="btn-save" @click="updateOrganization" :disabled="loading">
            {{ loading ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.org-settings {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.org-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 4px 0 24px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 240px;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid var(--primary-soft);
  border-bottom-color: var(--accent-ink);
  border-radius: 50%;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
}

/* Page header */
.org-header {
  margin-bottom: 26px;
}

.org-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0 0 6px;
}

.org-subtitle {
  font-size: 15px;
  color: var(--muted);
  margin: 0;
}

/* Stats strip */
.stats-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  color: var(--muted2);
}

.stat-value {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  margin: 8px 0 4px;
}

.stat-sub {
  font-size: 12.5px;
}

.stat-sub.members { color: var(--c-online); }
.stat-sub.active { color: var(--accent-ink); }
.stat-sub.agents { color: var(--c-pro); }
.stat-sub.conversations { color: var(--c-coral); }

@media (max-width: 980px) {
  .stats-strip {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .stats-strip {
    grid-template-columns: 1fr;
  }
}

/* Section cards */
.card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: 26px;
  margin: 0 0 18px;
  max-width: none;
  width: 100%;
  box-sizing: border-box;
}

/* Danger zone */
.danger-card {
  border-color: var(--coral-border);
  padding: 24px;
}

.danger-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 16px;
  color: var(--c-coral);
}

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--o06);
}

.danger-row.last {
  padding: 14px 0 0;
  border-bottom: none;
}

.danger-row-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text2);
}

.danger-row-desc {
  font-size: 12.5px;
  color: var(--muted);
  margin-top: 2px;
}

.danger-btn {
  flex-shrink: 0;
  padding: 9px 16px;
  background: transparent;
  border: 1px solid var(--o14);
  border-radius: 10px;
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.danger-btn:hover {
  background: var(--o06);
}

.danger-btn.delete {
  background: var(--coral-bg);
  border-color: var(--coral-border);
  color: var(--c-coral);
  font-weight: 600;
}

.danger-btn.delete:hover {
  background: color-mix(in srgb, var(--c-coral) 18%, transparent);
}

.card-head {
  margin-bottom: 22px;
}

.card-head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.card-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 17px;
  color: var(--text);
  margin: 0 0 4px;
}

.card-desc {
  font-size: 13.5px;
  color: var(--muted);
  margin: 0;
}

/* Logo row */
.logo-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--o07);
  margin-bottom: 22px;
}

.org-logo {
  width: 62px;
  height: 62px;
  flex-shrink: 0;
  border-radius: 16px;
  background: var(--grad-lime-teal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 26px;
  color: var(--on-accent);
  overflow: hidden;
}

.org-logo.has-image {
  background: var(--surface);
  border: 1px solid var(--o10);
}

.org-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-meta {
  flex: 1;
  min-width: 0;
}

.logo-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.hidden-input {
  display: none;
}

.logo-btn {
  padding: 9px 18px;
  background: var(--o05);
  border: 1px solid var(--o14);
  border-radius: var(--radius-chip);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.logo-btn:hover:not(:disabled) {
  background: var(--o10);
}

.logo-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.logo-meta-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text2);
  margin-bottom: 3px;
}

.logo-meta-sub {
  font-size: 12.5px;
  color: var(--muted2);
}

/* Fields */
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text3);
  margin-bottom: 8px;
}

.field input,
.select {
  width: 100%;
  padding: 13px 15px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: var(--radius-input);
  color: var(--text);
  font-size: 14.5px;
  font-family: var(--font-sans);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.field input.mono {
  font-family: var(--font-mono);
}

.field input::placeholder {
  color: var(--faint);
}

.field input:focus,
.select:focus {
  border-color: var(--accent-ink);
  box-shadow: var(--ring-focus);
}

.select {
  cursor: pointer;
  appearance: none;
  padding-right: 38px;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3B0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
  background-size: 16px;
}

.field-hint {
  font-size: 12.5px;
  color: var(--muted2);
  margin: 8px 0 0;
}

/* Business hours — presets */
.presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preset {
  padding: 8px 13px;
  background: var(--o05);
  border: 1px solid var(--o12);
  border-radius: 9px;
  color: var(--text3);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.preset:hover {
  background: var(--o10);
}

.preset-ghost {
  background: transparent;
  border-color: var(--o10);
  color: var(--muted);
}

.preset-ghost:hover {
  background: transparent;
  color: var(--text3);
}

/* Day rows */
.hours-list {
  display: flex;
  flex-direction: column;
}

.day-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 0;
  border-bottom: 1px solid var(--o05);
}

.day-row:last-child {
  border-bottom: none;
}

.day-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  min-width: 92px;
}

.day-label.off {
  color: var(--muted2);
}

/* Toggle */
.toggle {
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: var(--toggle-track-off);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.toggle.on {
  background: var(--toggle-on-accent);
}

.knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--toggle-knob);
  transition: transform var(--transition-fast);
}

.toggle.on .knob {
  transform: translateX(18px);
}

/* Time selects */
.time-select {
  padding: 8px 10px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: var(--radius-md);
  color: var(--text);
  font-size: 13.5px;
  font-family: var(--font-mono);
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.time-select:focus {
  border-color: var(--accent-ink);
}

.time-select:disabled {
  background: var(--o03);
  color: var(--muted);
  cursor: not-allowed;
}

.time-sep {
  color: var(--muted2);
  font-size: 13px;
}

.day-state {
  margin-left: auto;
  font-size: 12.5px;
  font-weight: 500;
}

.day-state.open {
  color: var(--c-teal);
}

.day-state.closed {
  color: var(--muted2);
}

/* Messages */
.success-message {
  color: var(--c-teal);
  font-size: 13.5px;
  margin: 4px 0 0;
}

.error-message {
  color: var(--c-coral);
  font-size: 13.5px;
  margin: 4px 0 0;
}

/* Sticky save bar */
.save-bar {
  position: fixed;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 14px 12px 22px;
  background: color-mix(in srgb, var(--surface) 96%, transparent);
  backdrop-filter: blur(12px);
  border: 1px solid var(--o12);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}

.save-bar-text {
  font-size: 13.5px;
  color: var(--text3);
}

.save-bar-actions {
  display: flex;
  gap: 10px;
}

.btn-discard {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid var(--o14);
  border-radius: 10px;
  color: var(--text3);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background var(--transition-fast);
}

.btn-discard:hover:not(:disabled) {
  background: var(--o06);
}

.btn-save {
  padding: 10px 20px;
  background: var(--accent-ink);
  color: var(--on-accent);
  border: none;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: filter var(--transition-fast);
}

.btn-save:hover:not(:disabled) {
  filter: brightness(1.05);
}

.btn-save:disabled,
.btn-discard:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-bar-enter-active,
.save-bar-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.save-bar-enter-from,
.save-bar-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

/* Responsive */
@media (max-width: 640px) {
  .field-grid {
    grid-template-columns: 1fr;
  }

  .day-row {
    flex-wrap: wrap;
  }

  .day-state {
    margin-left: 0;
  }
}
</style>
