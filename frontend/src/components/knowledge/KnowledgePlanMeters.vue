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
import { computed, onMounted } from 'vue'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

const props = defineProps<{
  sourceCount: number
  largestSourceName: string | null
  largestSubpageCount: number
}>()

const { hasEnterpriseModule, subscriptionStore, initializeSubscriptionStore } =
  useEnterpriseFeatures()

onMounted(async () => {
  if (!hasEnterpriseModule) return
  await initializeSubscriptionStore()
  if (!subscriptionStore.value.currentPlan) {
    await subscriptionStore.value.fetchCurrentPlan()
  }
})

const plan = computed(() => subscriptionStore.value.currentPlan?.plan ?? null)
const maxSources = computed<number | null>(() => plan.value?.max_knowledge_sources ?? null)
const maxSubpages = computed<number | null>(() => plan.value?.max_sub_pages ?? null)

// Clamp a usage ratio to a readable meter width (min 6% so a tiny bar still shows).
function pct(used: number, limit: number | null): number {
  if (!limit || limit <= 0) return 0
  return Math.max(6, Math.min(100, Math.round((used / limit) * 100)))
}

const sourcesOver = computed(() => maxSources.value !== null && props.sourceCount > maxSources.value)
const subpagesOver = computed(
  () => maxSubpages.value !== null && props.largestSubpageCount > maxSubpages.value,
)
</script>

<template>
  <div class="meters">
    <div class="meter" :class="{ 'meter--over': sourcesOver }">
      <div class="meter__head">
        <span class="meter__label">Knowledge sources</span>
        <span class="meter__value">
          {{ sourceCount }}<template v-if="maxSources !== null"> / {{ maxSources }}</template>
        </span>
      </div>
      <div v-if="maxSources !== null" class="meter__track">
        <div class="meter__fill" :style="{ width: pct(sourceCount, maxSources) + '%' }"></div>
      </div>
      <div class="meter__note">
        <template v-if="sourcesOver">You’ve exceeded your plan’s source limit. Upgrade to connect more.</template>
        <template v-else-if="maxSources !== null">{{ sourceCount }} of {{ maxSources }} sources connected.</template>
        <template v-else>{{ sourceCount }} sources connected.</template>
      </div>
    </div>

    <div class="meter" :class="{ 'meter--over': subpagesOver }">
      <div class="meter__head">
        <span class="meter__label">Sub-pages per source</span>
        <span class="meter__value">
          <template v-if="maxSubpages !== null">up to {{ maxSubpages }}</template>
          <template v-else>—</template>
        </span>
      </div>
      <div v-if="maxSubpages !== null" class="meter__track">
        <div class="meter__fill meter__fill--alt"
          :style="{ width: pct(largestSubpageCount, maxSubpages) + '%' }"></div>
      </div>
      <div class="meter__note">
        <template v-if="largestSourceName">
          Largest source: {{ largestSourceName }} — {{ largestSubpageCount }}<template v-if="maxSubpages !== null"> / {{ maxSubpages }}</template> sub-pages
        </template>
        <template v-else>No sources yet.</template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 640px) {
  .meters {
    grid-template-columns: 1fr;
  }
}

.meter {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 14px;
  padding: 16px 18px;
}

.meter__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 11px;
}

.meter__label {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text2);
}

.meter__value {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--text3);
}

.meter--over .meter__value {
  color: var(--c-coral);
}

.meter__track {
  height: 7px;
  border-radius: 999px;
  background: var(--o07);
  overflow: hidden;
}

.meter__fill {
  height: 100%;
  border-radius: 999px;
  background: var(--c-teal);
  transition: width 0.3s ease;
}

.meter__fill--alt {
  background: var(--c-purple);
}

.meter--over .meter__fill {
  background: var(--c-coral);
}

.meter__note {
  font-size: 12.5px;
  color: var(--muted);
  margin-top: 10px;
  line-height: 1.5;
}

.meter--over .meter__note {
  color: var(--c-coral);
}
</style>
