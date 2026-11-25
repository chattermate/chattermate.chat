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

<script setup lang="ts" name="PushOffNotice">
import { computed, ref, watch } from 'vue'
import { usePushStatus } from '@/composables/usePushStatus'
import { detectBrowser } from '@/utils/browserKind'
import { pushOffCopyFor } from './pushOffCopy'
import UnblockGuide from './UnblockGuide.vue'

/**
 * "Notifications are off on this device", in three places:
 * - panel: a line in the notification drawer, shown while push is off (no dismiss)
 * - banner: full width at the top of header pages ("Not now" hides it for 7 days)
 * - strip: one slim line above the inbox list, shown while push is off (no
 *   dismiss): the inbox is where a missed notification costs a waiting chat
 */
const props = defineProps<{
  variant: 'panel' | 'banner' | 'strip'
}>()

const { reason, showLandingNotice, busy, turnOn, snoozeLanding } = usePushStatus()

const browser = detectBrowser()
const copy = computed(() => (reason.value ? pushOffCopyFor(reason.value, browser) : null))
const guideOpen = ref(false)

// Blocked: the fix is in the browser's settings, so show where; else act here
const onAction = () => {
  if (reason.value === 'blocked') guideOpen.value = true
  else turnOn()
}

// Allowed in site settings while the guide was up: the notice is done
watch(reason, (now) => {
  if (now !== 'blocked') guideOpen.value = false
})
// Only the banner can be put off; the drawer line and inbox strip stay
const visible = computed(() =>
  props.variant === 'banner' ? !!copy.value && showLandingNotice.value : !!copy.value
)
</script>

<template>
  <div
    v-if="visible && copy"
    class="push-off"
    :class="`push-off--${variant}`"
    role="status"
    :aria-label="copy.title"
    :data-reason="reason"
  >
    <font-awesome-icon :icon="copy.icon" class="push-off-icon" aria-hidden="true" />

    <p v-if="variant === 'strip'" class="push-off-text">{{ copy.short }}</p>
    <p v-else-if="variant === 'banner'" class="push-off-text">
      <strong>{{ copy.title }}.</strong>
      {{ copy.bannerBody ?? copy.body }}
    </p>
    <div v-else class="push-off-text">
      <div class="push-off-title">{{ copy.title }}</div>
      <div class="push-off-body">{{ copy.body }}</div>
    </div>

    <div class="push-off-actions">
      <button v-if="variant === 'banner'" type="button" class="push-off-dismiss" @click="snoozeLanding">
        Not now
      </button>
      <button v-if="copy.action" type="button" class="push-off-cta" :disabled="busy" @click="onAction">
        {{ copy.action }}
      </button>
    </div>
    <UnblockGuide v-if="guideOpen" :browser="browser" @close="guideOpen = false" />
  </div>
</template>

<style scoped>
.push-off {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  color: var(--text);
}

.push-off-icon {
  color: var(--warning);
  flex-shrink: 0;
}

.push-off-text {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.push-off-title {
  font-weight: var(--font-weight-semibold);
  font-size: 13.5px;
}

.push-off-body {
  font-size: 12.5px;
  color: var(--text2);
  margin-top: 2px;
}

.push-off-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.push-off-dismiss {
  background: none;
  border: none;
  /* --muted2 falls short of 4.5:1 on the amber background in the light theme */
  color: var(--text3);
  font-size: 13.5px;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

.push-off-dismiss:hover {
  color: var(--text);
}

.push-off-cta {
  padding: 8px 14px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-btn);
  font-size: 13.5px;
  font-weight: 600;
  font-family: var(--font-sans);
  white-space: nowrap;
  cursor: pointer;
  transition: var(--transition-fast);
}

.push-off-cta:disabled {
  opacity: 0.6;
  cursor: default;
}

/* Drawer line: flush strip under the drawer header */
.push-off--panel {
  align-items: flex-start;
  border-width: 0 0 1px;
  padding: 12px 16px;
}

.push-off--panel .push-off-icon {
  margin-top: 3px;
}

.push-off--panel .push-off-cta {
  padding: 6px 12px;
  font-size: 13px;
}

/* Landing banner: matches the failed-source notice */
.push-off--banner {
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 18px;
}

/* Inbox strip: one slim line above the conversation list */
.push-off--strip {
  flex-shrink: 0;
  gap: 10px;
  border-radius: var(--radius-md);
  margin: 8px 12px 0;
  padding: 6px 6px 6px 12px;
}

.push-off--strip .push-off-text {
  font-size: 13px;
  font-weight: var(--font-weight-medium);
}

.push-off--strip .push-off-cta {
  padding: 5px 10px;
  font-size: 12.5px;
}

@media (max-width: 640px) {
  .push-off--banner {
    flex-direction: column;
    align-items: stretch;
  }

  .push-off--banner .push-off-actions {
    justify-content: flex-end;
  }
}
</style>
