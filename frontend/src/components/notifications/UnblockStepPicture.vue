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

<script setup lang="ts" name="UnblockStepPicture">
import type { StepPicture } from './unblockSteps'

/**
 * A small drawing of the browser screen a step happens on, with the control
 * to tap ringed. Drawn rather than screenshotted so it follows the app theme
 * and never shows another site's name. The step's text says the same thing,
 * so the drawing is hidden from screen readers.
 */
defineProps<{ picture: StepPicture }>()

const host = typeof window === 'undefined' ? 'app.chattermate.chat' : window.location.host
</script>

<template>
  <div class="usp" :class="{ 'usp--mobile': 'mobile' in picture && picture.mobile }" aria-hidden="true">
    <!-- Browser toolbar: the site icon, the reload button, or under the site popover -->
    <template v-if="picture.kind === 'site-icon' || picture.kind === 'reload' || picture.kind === 'site-setting'">
      <div class="usp-toolbar">
        <template v-if="!('mobile' in picture && picture.mobile)">
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="usp-nav" />
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="usp-nav" />
          <span class="usp-nav-btn" :class="{ 'usp-ring': picture.kind === 'reload' }">
            <font-awesome-icon icon="fa-solid fa-rotate-right" />
          </span>
        </template>
        <div class="usp-address">
          <span class="usp-site-icon" :class="{ 'usp-ring': picture.kind === 'site-icon' }">
            <font-awesome-icon :icon="picture.icon ?? 'fa-solid fa-lock'" />
          </span>
          <span class="usp-host">{{ host }}</span>
        </div>
        <span
          v-if="'mobile' in picture && picture.mobile"
          class="usp-nav-btn"
          :class="{ 'usp-ring': picture.kind === 'reload' }"
        >
          <font-awesome-icon :icon="picture.kind === 'reload' ? 'fa-solid fa-rotate-right' : 'fa-solid fa-ellipsis-vertical'" />
        </span>
      </div>

      <div v-if="picture.kind === 'site-setting'" class="usp-popover">
        <div class="usp-popover-title">{{ picture.control === 'clear' ? 'Permissions' : host }}</div>
        <div v-if="picture.control === 'clear'" class="usp-row">
          <font-awesome-icon icon="fa-solid fa-bell-slash" class="usp-row-icon" />
          <span class="usp-row-label">Send notifications</span>
          <span class="usp-blocked">Blocked</span>
          <span class="usp-clear usp-ring"><font-awesome-icon icon="fa-solid fa-xmark" /></span>
        </div>
        <div v-else class="usp-row" :class="{ 'usp-ring': picture.control === 'toggle' }">
          <font-awesome-icon icon="fa-regular fa-bell" class="usp-row-icon" />
          <span class="usp-row-label">Notifications</span>
          <span v-if="picture.control === 'toggle'" class="usp-switch" />
          <span v-else class="usp-select usp-ring">Allow <font-awesome-icon icon="fa-solid fa-chevron-down" /></span>
        </div>
      </div>
    </template>

    <!-- macOS menu bar with Safari's menu open -->
    <template v-else-if="picture.kind === 'safari-menu'">
      <div class="usp-menubar">
        <font-awesome-icon icon="fa-brands fa-apple" />
        <span class="usp-menu-open">Safari</span>
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
      </div>
      <div class="usp-dropdown">
        <div class="usp-dropdown-item">About Safari</div>
        <div class="usp-dropdown-item usp-ring">Settings… <span class="usp-kbd">⌘,</span></div>
      </div>
    </template>

    <!-- Safari Settings, Websites tab -->
    <template v-else-if="picture.kind === 'safari-websites'">
      <div class="usp-window">
        <div class="usp-tabs">
          <span><font-awesome-icon icon="fa-solid fa-gear" />General</span>
          <span><font-awesome-icon icon="fa-solid fa-lock" />Privacy</span>
          <span class="usp-tab-on usp-ring"><font-awesome-icon icon="fa-solid fa-globe" />Websites</span>
        </div>
        <div class="usp-split">
          <div class="usp-sidebar">
            <span>Camera</span>
            <span>Microphone</span>
            <span class="usp-side-on">Notifications</span>
          </div>
          <div class="usp-site-row">
            <span class="usp-host">{{ host }}</span>
            <span class="usp-select usp-ring">Allow <font-awesome-icon icon="fa-solid fa-chevron-down" /></span>
          </div>
        </div>
      </div>
    </template>

    <!-- iPhone Settings -->
    <template v-else-if="picture.kind === 'ios-settings'">
      <div class="usp-phone">
        <div class="usp-phone-title">{{ picture.screen === 'apps' ? 'Apps' : 'Notifications' }}</div>
        <template v-if="picture.screen === 'apps'">
          <div class="usp-list-row usp-faint"><span class="usp-app-icon" />Calendar</div>
          <div class="usp-list-row usp-ring">
            <span class="usp-app-icon usp-app-icon--ours" />ChatterMate
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="usp-chevron" />
          </div>
        </template>
        <div v-else class="usp-list-row usp-ring">
          Allow Notifications
          <span class="usp-switch" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.usp {
  /* --accent-ink darkens in the light theme; lime would vanish on white */
  --usp-ring: var(--accent-ink);
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg2);
  padding: 10px;
  font-size: 11.5px;
  color: var(--text2);
  overflow: hidden;
}

/* The control to tap */
.usp-ring {
  outline: 2px solid var(--usp-ring);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
  color: var(--text);
}

.usp-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.usp-nav {
  color: var(--muted);
}

.usp-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.usp-address {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  border: 1px solid var(--border-color);
}

.usp-site-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
}

.usp-host {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
}

.usp-popover {
  margin: 8px 0 0 40px;
  max-width: 230px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border-color);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

.usp--mobile .usp-popover {
  margin-left: 0;
  max-width: none;
}

.usp-popover-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.usp-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 4px;
}

.usp-row-icon {
  color: var(--muted);
}

.usp-row-label {
  flex: 1;
  color: var(--text);
}

.usp-blocked {
  color: var(--muted);
}

.usp-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.usp-switch {
  position: relative;
  width: 26px;
  height: 15px;
  border-radius: var(--radius-pill);
  background: var(--accent-solid);
  flex-shrink: 0;
}

.usp-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  right: 2px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--on-accent-solid);
}

.usp-select {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  background: var(--bg2);
}

.usp-menubar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
}

.usp-menu-open {
  font-weight: var(--font-weight-semibold);
  padding: 0 6px;
  border-radius: var(--radius-sm);
  background: var(--accent-bg-12);
}

.usp-dropdown {
  margin: 4px 0 0 22px;
  width: 170px;
  padding: 6px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border-color);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

.usp-dropdown-item {
  display: flex;
  justify-content: space-between;
  padding: 3px 6px;
}

.usp-kbd {
  color: var(--muted);
}

.usp-window {
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.usp-tabs {
  display: flex;
  justify-content: center;
  gap: 14px;
  padding: 6px;
  border-bottom: 1px solid var(--border-color);
}

.usp-tabs span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 4px;
}

.usp-tab-on {
  color: var(--text);
}

.usp-split {
  display: flex;
  gap: 10px;
  padding: 8px;
}

.usp-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 88px;
  flex-shrink: 0;
}

.usp-sidebar span {
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}

.usp-side-on {
  background: var(--accent-bg-12);
  color: var(--text);
}

.usp-site-row {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  align-self: flex-start;
  padding: 2px 4px;
}

.usp-phone {
  max-width: 240px;
  margin: 0 auto;
}

.usp-phone-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text);
  margin: 0 0 6px 4px;
}

.usp-list-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  margin-bottom: 6px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  justify-content: space-between;
}

.usp-faint {
  color: var(--muted);
  justify-content: flex-start;
}

.usp-list-row.usp-ring:has(.usp-app-icon) {
  justify-content: flex-start;
}

.usp-app-icon {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: var(--border-color);
  flex-shrink: 0;
}

.usp-app-icon--ours {
  background: var(--accent-solid);
}

.usp-chevron {
  margin-left: auto;
  color: var(--muted);
}
</style>
