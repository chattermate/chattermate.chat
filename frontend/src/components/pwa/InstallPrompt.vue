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

<script setup lang="ts" name="InstallPrompt">
import { computed } from 'vue'
import { usePWAInstall } from '@/composables/usePWAInstall'
import { isShopifyEmbedded } from '@/pwa/register'

const { canInstall, needsManualInstall, promptInstall } = usePWAInstall()

// Dashed hint card per the design: native prompt where supported, share-sheet
// instructions on iOS, hidden when installed/unsupported/embedded.
const visible = computed(() => !isShopifyEmbedded() && (canInstall.value || needsManualInstall.value))

const handleClick = () => {
  if (canInstall.value) promptInstall()
}
</script>

<template>
  <button v-if="visible" type="button" class="install-hint" @click="handleClick">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="install-icon" aria-hidden="true"><path d="M12 15V3m0 0L8 7m4-4l4 4"/><path d="M5 13v5a3 3 0 003 3h8a3 3 0 003-3v-5"/></svg>
    <span class="install-text">
      Install ChatterMate —
      <span v-if="needsManualInstall" class="install-sub">Share → Add to Home Screen</span>
      <span v-else class="install-sub">use it like a native app</span>
    </span>
  </button>
</template>

<style scoped>
.install-hint {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 13px 15px;
  border-radius: 14px;
  border: 1px dashed var(--o10);
  background: var(--o03);
  color: var(--text3);
  font-family: var(--font-sans);
  font-size: 12.5px;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.install-hint:hover {
  background: var(--o05);
}

.install-icon {
  color: var(--c-teal);
  flex-shrink: 0;
}

.install-sub {
  color: var(--muted);
}
</style>
