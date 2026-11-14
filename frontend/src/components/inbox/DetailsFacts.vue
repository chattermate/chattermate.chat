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
/** A details panel's label / value rows (the customer's, the conversation's). */
import type { DetailsFact } from './inboxPresentation'

defineProps<{ facts: DetailsFact[] }>()
</script>

<template>
  <dl v-if="facts.length" class="facts">
    <div v-for="fact in facts" :key="fact.label" class="fact">
      <dt>{{ fact.label }}</dt>
      <dd :class="fact.tone ? `tone-${fact.tone}` : undefined">{{ fact.value }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.facts {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fact {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
}

.fact dt {
  flex-shrink: 0;
  color: var(--muted2);
}

.fact dd {
  margin: 0;
  min-width: 0;
  color: var(--text2);
  text-align: right;
  overflow-wrap: anywhere;
}

.tone-waiting {
  color: var(--c-warn);
  font-weight: 600;
}

.tone-ai {
  color: var(--accent-ink);
  font-weight: 600;
}
</style>
