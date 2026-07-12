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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { useSubscriptionStorage } from '@/utils/storage'

const props = defineProps<{
  /** Server-side plan verdict (settings.plan_allowed). false always locks. */
  planAllowed?: boolean | null
}>()

const PRO_PRICE_NOTE = 'Included in Pro · $39/agent/mo'

const router = useRouter()
const { hasEnterpriseModule } = useEnterpriseFeatures()
const subscriptionStorage = useSubscriptionStorage()

const isLocked = computed(() => {
  if (props.planAllowed === false) return true
  return (
    hasEnterpriseModule &&
    (!subscriptionStorage.hasFeature('help_center') || !subscriptionStorage.isSubscriptionActive())
  )
})

function goToSubscription() {
  router.push('/settings/subscription')
}
</script>

<template>
  <div class="lock-wrap">
    <div class="lock-wrap__content" :class="{ 'lock-wrap__content--locked': isLocked }">
      <slot />
    </div>
    <div v-if="isLocked" class="lock-overlay">
      <div class="lock-card">
        <div class="lock-card__icon">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--c-purple)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2.2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        </div>
        <h3 class="lock-card__title">Auto-generate FAQs with Pro</h3>
        <p class="lock-card__copy">
          ChatterMate reads every knowledge source and drafts clear, ready-to-publish FAQs — grouped
          by topic and kept in sync as your docs change.
        </p>
        <div class="lock-card__actions">
          <button class="btn-upgrade" type="button" @click="goToSubscription">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" stroke="none"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>
            Upgrade to Pro
          </button>
          <button class="btn-compare" type="button" @click="goToSubscription">Compare plans</button>
        </div>
        <div class="lock-card__note">{{ PRO_PRICE_NOTE }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lock-wrap {
  position: relative;
}

.lock-wrap__content--locked {
  filter: grayscale(0.9) saturate(0.5);
  opacity: 0.55;
  pointer-events: none;
  user-select: none;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--scrim);
  backdrop-filter: blur(6px);
  border-radius: 18px;
}

.lock-card {
  max-width: 440px;
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--purple-border);
  border-radius: 20px;
  padding: 34px 32px;
  box-shadow: var(--shadow-lg);
}

.lock-card__icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 18px;
  border-radius: 14px;
  background: var(--purple-bg);
  border: 1px solid var(--purple-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-card__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 21px;
  letter-spacing: -0.01em;
  color: var(--text);
  margin: 0 0 10px;
}

.lock-card__copy {
  font-size: 14.5px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0 0 22px;
}

.lock-card__actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-upgrade {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 22px;
  background: var(--c-purple);
  border: 1px solid var(--c-purple);
  border-radius: 11px;
  color: var(--on-accent);
  font-family: var(--font-sans);
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-compare {
  padding: 13px 20px;
  background: var(--o05);
  border: 1px solid var(--o14);
  border-radius: 11px;
  color: var(--text2);
  font-family: var(--font-sans);
  font-size: 14.5px;
  font-weight: 500;
  cursor: pointer;
}

.lock-card__note {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted2);
  margin-top: 18px;
}
</style>
