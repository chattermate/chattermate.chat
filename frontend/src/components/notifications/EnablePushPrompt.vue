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

<script setup lang="ts" name="EnablePushPrompt">
import { ref, onMounted } from 'vue'
import { isShopifyEmbedded } from '@/pwa/register'
import { usePWAInstall } from '@/composables/usePWAInstall'

const emit = defineEmits<{
  // Parent (DashboardLayout) owns the notifications composable instance and
  // performs the actual permission request from this user gesture.
  (e: 'enable'): void
}>()

const SNOOZE_KEY = 'cm-push-prompt-snoozed-at'
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000

const visible = ref(false)
const needsInstallFirst = ref(false)
const { isIOS, isStandalone } = usePWAInstall()

const isSnoozed = () => {
  const at = Number(localStorage.getItem(SNOOZE_KEY) || 0)
  return at > 0 && Date.now() - at < SNOOZE_MS
}

onMounted(() => {
  if (isShopifyEmbedded() || isSnoozed()) return

  if (isIOS && !isStandalone.value) {
    // Safari tab on iOS: the Push API only exists once installed to Home Screen
    needsInstallFirst.value = true
    visible.value = true
    return
  }

  if ('Notification' in window && Notification.permission === 'default') {
    visible.value = true
  }
})

const snooze = () => {
  localStorage.setItem(SNOOZE_KEY, String(Date.now()))
  visible.value = false
}

const enable = () => {
  emit('enable')
  // The browser permission dialog takes over from here
  visible.value = false
}
</script>

<template>
  <Transition name="push-prompt">
    <div v-if="visible" class="push-prompt" role="dialog" aria-label="Enable notifications">
      <div class="bell-tile" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
      </div>

      <template v-if="needsInstallFirst">
        <div class="prompt-title">Install to get notifications</div>
        <div class="prompt-body">
          Add ChatterMate to your Home Screen first — on iPhone, push notifications only work
          from an installed app. Tap the share icon, then "Add to Home Screen".
        </div>
        <button type="button" class="secondary-btn" @click="snooze">Got it</button>
      </template>

      <template v-else>
        <div class="prompt-title">Get notified when a customer needs you</div>
        <div class="prompt-body">
          We'll ping you the moment the AI hands a chat over to you — so nobody waits.
        </div>
        <button type="button" class="primary-btn" @click="enable">
          Enable notifications
        </button>
        <button type="button" class="secondary-btn" @click="snooze">Not now</button>
      </template>
    </div>
  </Transition>
</template>

<style scoped>
.push-prompt {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1090;
  width: 340px;
  max-width: calc(100vw - 40px);
  background: var(--bg2);
  border: 1px solid var(--o10);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.bell-tile {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: var(--teal-bg);
  border: 1px solid var(--teal-border);
  color: var(--c-teal);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-md);
}

.prompt-title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-display);
  line-height: 1.2;
  color: var(--text);
}

.prompt-body {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
  margin-top: 10px;
}

.primary-btn {
  width: 100%;
  height: 48px;
  margin-top: var(--space-lg);
  border: none;
  border-radius: var(--radius-btn);
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: filter var(--transition-fast);
}

.primary-btn:hover:not(:disabled) {
  filter: brightness(1.05);
}

.secondary-btn {
  margin-top: 12px;
  background: none;
  border: none;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: 8px;
}

.secondary-btn:hover {
  color: var(--text);
}

/* Mobile: bottom sheet over the nav, safe-area aware */
@media (max-width: 768px) {
  .push-prompt {
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 100%;
    border-radius: 24px 24px 0 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
    padding-bottom: calc(var(--space-lg) + var(--safe-bottom));
  }
}

.push-prompt-enter-active,
.push-prompt-leave-active {
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

.push-prompt-enter-from,
.push-prompt-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
