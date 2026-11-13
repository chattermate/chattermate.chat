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
 * The dashboard's "this needs a paid plan" card: a line saying what the feature
 * does and an Upgrade button. Given a gate, its words come from FEATURE_GATES.
 */
import { computed } from 'vue'
import { FEATURE_GATES, type GateKey } from './featureGates'

const props = defineProps<{
  /** The feature it unlocks: its description is the card's line. */
  gate?: GateKey
  /** A line of its own, in place of the gate's. */
  message?: string
  /** Shows a lock beside the line. */
  lock?: boolean
}>()

const emit = defineEmits<{
  (e: 'upgrade'): void
}>()

const text = computed(() => props.message ?? (props.gate ? FEATURE_GATES[props.gate].description : ''))
// Several cards can share a screen: each button says what it unlocks
const label = computed(() => (props.gate ? `Upgrade for ${FEATURE_GATES[props.gate].name}` : undefined))
</script>

<template>
  <div class="upgrade-card">
    <font-awesome-icon v-if="lock" icon="fa-solid fa-lock" class="upgrade-card__lock" />
    <p class="upgrade-card__text">{{ text }}</p>
    <button type="button" class="upgrade-card__button" :aria-label="label" @click="emit('upgrade')">
      <font-awesome-icon icon="fa-solid fa-crown" />
      <span>Upgrade</span>
    </button>
  </div>
</template>

<style scoped>
.upgrade-card {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
  padding: 14px 16px;
  background: var(--bg);
  border: 1px dashed var(--o12);
  border-radius: var(--radius-btn);
}

.upgrade-card__lock {
  font-size: 1rem;
  color: var(--muted);
  opacity: 0.7;
}

.upgrade-card__text {
  flex: 1;
  min-width: 200px;
  margin: 0;
  font-size: 13.5px;
  color: var(--muted);
}

.upgrade-card__button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: var(--radius-btn);
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.upgrade-card__button:hover {
  filter: brightness(1.05);
}

/* The crown in the button's own text colour */
.upgrade-card__button svg {
  font-size: 12px;
  color: currentColor;
}
</style>
