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


<!--
  A Page the customer ticked in Meta's popup that couldn't be connected (their
  Facebook account has no role on it). Says which, and offers the
  business-portfolio login, which reaches the Pages a portfolio owns.
-->
<script setup lang="ts">
defineProps<{
  notice: string
  /** The business-portfolio login is set up on this deployment */
  canUseBusinessLogin: boolean
  busy: boolean
}>()

const emit = defineEmits<{
  (e: 'business-login'): void
}>()
</script>

<template>
  <div class="page-notice" role="note">
    <p class="page-notice-text">{{ notice }}</p>
    <button
      v-if="canUseBusinessLogin"
      type="button"
      class="page-notice-btn"
      :disabled="busy"
      @click="emit('business-login')"
    >
      <font-awesome-icon v-if="busy" icon="fa-solid fa-spinner" spin />
      Connect through your business portfolio
    </button>
  </div>
</template>

<style scoped>
.page-notice {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--warning-border);
  background: var(--warning-bg);
}

.page-notice-text {
  margin: 0;
  color: var(--text);
  font-size: 13px;
  line-height: 1.45;
}

.page-notice-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.page-notice-btn:hover:not(:disabled) {
  filter: brightness(1.05);
}

.page-notice-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
