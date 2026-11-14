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
 * A note the team left on the conversation: amber, dashed, and labelled as
 * private. Mentions are bold. Plain text throughout (no v-html), so a note can
 * never inject markup.
 */
import { computed } from 'vue'
import type { ConversationNote } from '@/types/chat'
import { mentionParts } from './mentions'

const props = defineProps<{
  note: ConversationNote
  currentUserId: string | null
}>()

const author = computed(() => {
  if (props.note.user_id && props.note.user_id === props.currentUserId) return 'You'
  return props.note.user_name || 'A teammate'
})
const parts = computed(() => mentionParts(props.note.body, props.note.mentions.map((m) => m.name).filter(Boolean) as string[]))
const time = computed(() =>
  new Date(props.note.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
)
</script>

<template>
  <div class="note" role="note" :aria-label="`Note from ${author}, only your team sees this`">
    <span class="label">Note · only your team sees this</span>
    <p class="body">
      <template v-for="(part, index) in parts" :key="index">
        <strong v-if="part.mention" class="mention">{{ part.text }}</strong>
        <template v-else>{{ part.text }}</template>
      </template>
    </p>
    <span class="meta">{{ author }} · {{ time }}</span>
  </div>
</template>

<style scoped>
.note {
  align-self: flex-end;
  max-width: 76%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 9px 12px;
  border-radius: 12px;
  border: 1px dashed var(--waiting-border);
  background: var(--waiting-bg);
}

.label {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-warn);
}

.body {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text2);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.mention {
  color: var(--text);
}

.meta {
  font-size: 11px;
  color: var(--muted2);
}
</style>
