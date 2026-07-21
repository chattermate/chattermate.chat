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
import type { TicketPriority } from '@/types/ticket'
import { priorityMeta } from './ticketMeta'

const props = defineProps<{ priority: TicketPriority }>()
const meta = computed(() => priorityMeta(props.priority))
</script>

<template>
  <span class="ticket-priority" :style="{ '--chip-color': meta.color }">
    <span class="dot"></span>{{ meta.label }}
  </span>
</template>

<style scoped>
.ticket-priority {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  color: var(--chip-color);
  white-space: nowrap;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--chip-color);
}
</style>
