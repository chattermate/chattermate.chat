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
/**
 * The one "this needs a higher plan" dialog: what the feature does, what it
 * includes, and a button naming the plan that has it ("Upgrade to Growth").
 *
 * Replaces four hand-rolled copies (agent tabs, agent limit, team limit,
 * ratings) that each had their own scrim, colours and button copy.
 * The default slot sits under the list (a live promo offer, for example).
 */
import { computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useUpgradePlan } from '@/composables/useUpgradePlan'

const props = withDefaults(defineProps<{
  title: string
  description: string
  bullets?: readonly string[]
  /** The plan flag the feature needs; names the plan on the button. Leave
   *  out for limits (agents, seats), where any higher plan helps. */
  feature?: string
}>(), { bullets: () => [], feature: '' })

const emit = defineEmits<{ (e: 'close'): void; (e: 'upgrade'): void }>()

// Only a feature has a plan to name; a limit points at the plans page.
const upgradeText = props.feature ? useUpgradePlan(props.feature).upgradeText : null
const buttonLabel = computed(() => upgradeText?.value ?? 'See plans')
</script>

<template>
  <BaseModal :title="title" width="440px" @close="emit('close')">
    <p class="um-description">{{ description }}</p>
    <ul v-if="bullets.length" class="um-list">
      <li v-for="bullet in bullets" :key="bullet">
        <svg class="um-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {{ bullet }}
      </li>
    </ul>
    <slot />
    <template #actions>
      <button type="button" class="btn btn-ghost" @click="emit('close')">Not now</button>
      <button type="button" class="btn btn-primary" data-autofocus @click="emit('upgrade')">
        {{ buttonLabel }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.um-description {
  margin: 0;
  color: var(--text2);
  font-size: 14px;
  line-height: 1.55;
}

.um-list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.um-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  font-size: 14px;
}

.um-check {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  padding: 3px;
  border-radius: 50%;
  background: var(--accent-bg-12);
  color: var(--accent-ink);
  box-sizing: content-box;
}
</style>
