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
 * The saved replies to pick from, above the reply box. Opened by the ⚡ button
 * (with its own search box) or by typing "/" in an empty reply (the text after
 * the slash is the search). Arrows move, Enter picks, Escape closes.
 */
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { SavedReply } from '@/services/savedReplies'
import { matchReplies } from './savedReplyText'

const props = defineProps<{
  replies: SavedReply[]
  /** The search typed in the reply box after "/"; null when the picker has its own box */
  query: string | null
  loaded: boolean
  canManage: boolean
}>()

const emit = defineEmits<{
  (e: 'pick', reply: SavedReply): void
  (e: 'close'): void
}>()

const ownQuery = ref('')
const searchBox = ref<HTMLInputElement | null>(null)
const highlighted = ref(0)
const search = computed(() => props.query ?? ownQuery.value)
const matches = computed(() => matchReplies(props.replies, search.value))

watch(search, () => { highlighted.value = 0 })

function move(step: number) {
  if (!matches.value.length) return
  highlighted.value = (highlighted.value + step + matches.value.length) % matches.value.length
}

function choose() {
  const reply = matches.value[highlighted.value]
  if (reply) emit('pick', reply)
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    move(event.key === 'ArrowDown' ? 1 : -1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    choose()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    emit('close')
  }
}

onMounted(async () => {
  if (props.query === null) {
    await nextTick()
    searchBox.value?.focus()
  }
})

defineExpose({ move, choose, hasMatches: computed(() => matches.value.length > 0) })
</script>

<template>
  <div class="picker" role="dialog" aria-label="Saved replies">
    <input
      v-if="query === null"
      ref="searchBox"
      v-model="ownQuery"
      type="search"
      class="search"
      placeholder="Search saved replies"
      aria-label="Search saved replies"
      aria-controls="saved-reply-options"
      @keydown="onSearchKeydown"
    />
    <ul v-if="matches.length" id="saved-reply-options" class="options" role="listbox" aria-label="Saved replies">
      <li
        v-for="(reply, index) in matches"
        :key="reply.id"
        role="option"
        class="option"
        :aria-selected="index === highlighted"
        @mousedown.prevent="emit('pick', reply)"
        @mouseenter="highlighted = index"
      >
        <span class="line">
          <span class="title">{{ reply.title }}</span>
          <span v-if="reply.shortcut" class="shortcut">/{{ reply.shortcut }}</span>
        </span>
        <span class="preview">{{ reply.body }}</span>
      </li>
    </ul>
    <p v-else class="empty">
      <template v-if="!loaded">Loading…</template>
      <template v-else-if="replies.length">No saved reply matches “{{ search }}”.</template>
      <template v-else>
        No saved replies yet.
        <router-link v-if="canManage" to="/settings/saved-replies">Add one</router-link>
      </template>
    </p>
  </div>
</template>

<style scoped>
.picker {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: calc(100% + 6px);
  z-index: var(--z-dropdown, 50);
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid var(--o10);
  background: var(--surface);
  box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.3));
}

.search {
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--o10);
  background: var(--o04);
  color: var(--text);
  font: inherit;
  font-size: 13px;
  outline: 0;
}

.search:focus {
  border-color: var(--accent-border);
}

.options {
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 260px;
  overflow-y: auto;
}

.option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 7px 8px;
  border-radius: 8px;
  cursor: pointer;
}

.option[aria-selected='true'] {
  background: var(--o08);
}

.line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.shortcut {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted2);
}

.preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--muted);
}

.empty {
  margin: 4px 6px;
  font-size: 13px;
  color: var(--muted);
}

.empty a {
  color: var(--accent-ink);
  font-weight: 600;
}
</style>
