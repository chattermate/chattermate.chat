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
 * Replies the visitor can tap instead of typing, on the visitor's side of the
 * chat: tapping one answers in their words (and may run an in-app action).
 */
import type { PageChip } from './actions/hostActionsClient'

defineProps<{ chips: PageChip[]; disabled?: boolean }>()
const emit = defineEmits<{ (e: 'pick', chip: PageChip): void }>()
</script>

<template>
  <div class="cm-replies" role="group" aria-label="Suggested replies">
    <button
      v-for="chip in chips"
      :key="chip.label"
      type="button"
      class="cm-reply"
      :disabled="disabled"
      @click="emit('pick', chip)"
    >{{ chip.label }}</button>
  </div>
</template>

<style scoped>
.cm-replies {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
  margin: 2px 0 10px;
}
.cm-reply {
  min-height: 34px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--cm-accent) 55%, var(--cm-hairline));
  background: var(--cm-card);
  color: var(--cm-text);
  font-family: var(--cm-body-font);
  font-size: 13px;
  line-height: 1.3;
  text-align: left;
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.cm-reply:hover:not(:disabled) {
  border-color: var(--cm-accent);
  background: color-mix(in srgb, var(--cm-accent) 12%, var(--cm-card));
}
.cm-reply:disabled { opacity: .5; cursor: default; }
.cm-reply:focus-visible { outline: 2px solid var(--cm-accent); outline-offset: 2px; }
</style>
