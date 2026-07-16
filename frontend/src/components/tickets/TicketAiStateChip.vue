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
import type { TicketAiState } from '@/types/ticket'
import { aiStateMeta } from './ticketMeta'

const props = defineProps<{ state?: TicketAiState | null }>()
const meta = computed(() => aiStateMeta(props.state))
</script>

<template>
  <span class="ai-state" :style="{ '--chip-color': meta.color }">
    <span class="dot" :class="{ pulse: meta.pulse }"></span>{{ meta.label }}
  </span>
</template>

<style scoped>
.ai-state {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: var(--font-weight-medium);
  color: var(--chip-color);
  white-space: nowrap;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--chip-color);
}
.dot.pulse {
  animation: ticket-pulse 1.4s ease-in-out infinite;
}
@keyframes ticket-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
</style>
