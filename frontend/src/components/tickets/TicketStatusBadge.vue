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
import type { TicketStatus } from '@/types/ticket'
import { statusMeta } from './ticketMeta'

const props = defineProps<{ status: TicketStatus }>()
const meta = computed(() => statusMeta(props.status))
</script>

<template>
  <span class="ticket-status-badge" :style="{ '--chip-color': meta.color }">
    {{ meta.label }}
  </span>
</template>

<style scoped>
.ticket-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 11.5px;
  font-weight: var(--font-weight-semibold);
  color: var(--chip-color);
  background: color-mix(in srgb, var(--chip-color) 14%, transparent);
  white-space: nowrap;
}
</style>
