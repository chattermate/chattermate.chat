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
 * The open conversation's header: channel, customer, what it's about, and the
 * actions on it: who has it, Close (E), more, and the details panel. One line;
 * the name and subtitle cut off with "…" before anything wraps.
 */
import { computed } from 'vue'
import type { ChatDetail } from '@/types/chat'
import { channelGlyph } from '@/utils/channelGlyphs'
import { chatHandler } from '@/utils/chatState'
import { getInitials } from '@/utils/text'
import { navIconSvg } from '@/components/layout/navIcons'
import ActionMenu, { type ActionMenuItem } from '@/components/common/ActionMenu.vue'
import { customerName } from './inboxPresentation'

const props = defineProps<{
  chat: ChatDetail
  currentUserId: string | null
  detailsOpen: boolean
  /** Teammates to assign to; null when the viewer can't assign */
  assignees: ActionMenuItem[] | null
  moreActions: ActionMenuItem[]
  canClose: boolean
  /** Phones: a way back to the list */
  showBack: boolean
}>()

const emit = defineEmits<{
  (e: 'assign', userId: string): void
  (e: 'close-chat'): void
  (e: 'action', id: string): void
  (e: 'toggle-details'): void
  (e: 'back'): void
}>()

const name = computed(() => customerName(props.chat.customer))
const channel = computed(() => channelGlyph(props.chat.channel))
const handler = computed(() => chatHandler(props.chat, props.currentUserId))
const subtitle = computed(() => [channel.value.label, props.chat.title].filter(Boolean).join(' · '))

const assigneeName = computed(() => {
  if (handler.value.kind === 'human') return handler.value.label
  if (handler.value.kind === 'ai') return 'AI'
  return 'Unassigned'
})
const assigneeLabel = computed(() =>
  props.assignees ? `Assignee: ${assigneeName.value}. Change assignee` : `Assignee: ${assigneeName.value}`
)
</script>

<template>
  <header class="thread-header">
    <button v-if="showBack" type="button" class="icon-btn back" aria-label="Back to conversations" @click="emit('back')">
      <span aria-hidden="true" v-html="navIconSvg('chevronRight', 18)"></span>
    </button>
    <div class="who">
      <span class="channel" :style="{ background: channel.color }" :title="channel.label" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path :d="channel.path" /></svg>
      </span>
      <div class="names">
        <h2 class="name">{{ name }}</h2>
        <span class="subtitle">{{ subtitle }}</span>
      </div>
    </div>

    <div class="actions">
      <ActionMenu
        v-if="assignees"
        :label="assigneeLabel"
        :items="assignees"
        trigger-class="assignee"
        @select="emit('assign', $event)"
      >
        <span class="assignee-avatar" aria-hidden="true">{{ handler.kind === 'human' ? getInitials(assigneeName) : '–' }}</span>
        <span class="assignee-name">{{ assigneeName }}</span>
        <span class="chevron" aria-hidden="true" v-html="navIconSvg('chevronDown', 12)"></span>
      </ActionMenu>
      <span v-else class="assignee static" :aria-label="assigneeLabel">
        <span class="assignee-avatar" aria-hidden="true">{{ handler.kind === 'human' ? getInitials(assigneeName) : '–' }}</span>
        <span class="assignee-name">{{ assigneeName }}</span>
      </span>

      <button
        v-if="canClose"
        type="button"
        class="btn close-btn"
        aria-label="Close conversation"
        aria-keyshortcuts="E"
        @click="emit('close-chat')"
      >
        <span aria-hidden="true" v-html="navIconSvg('check', 14)"></span>
        <span class="btn-text">Close</span>
      </button>

      <ActionMenu
        v-if="moreActions.length"
        label="More actions"
        :items="moreActions"
        trigger-class="icon-btn"
        @select="emit('action', $event)"
      >
        <span aria-hidden="true" v-html="navIconSvg('more', 16)"></span>
      </ActionMenu>

      <button
        type="button"
        class="icon-btn details-toggle"
        :class="{ on: detailsOpen }"
        aria-label="Details panel"
        :aria-expanded="detailsOpen"
        aria-controls="inbox-details"
        @click="emit('toggle-details')"
      >
        <span aria-hidden="true" v-html="navIconSvg('panelRight', 16)"></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.thread-header {
  flex-shrink: 0;
  height: 64px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 0 20px;
  border-bottom: 1px solid var(--o07);
  background: var(--bg2);
}

.who {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.channel {
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-dark);
}

.names {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subtitle {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.actions :deep(.assignee),
.assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  max-width: 180px;
  padding: 0 10px 0 5px;
  border-radius: 8px;
  border: 1px solid var(--o10);
  background: var(--o04);
  color: var(--text2);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.assignee.static {
  cursor: default;
}

.assignee-avatar {
  flex: 0 0 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--coral-bg);
  color: var(--text);
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
}

.assignee-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  display: inline-flex;
  color: var(--muted2);
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--o10);
  background: var(--o04);
  color: var(--text2);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn:hover,
.actions :deep(.icon-btn:hover),
.actions :deep(.assignee:hover) {
  background: var(--o08);
  color: var(--text);
}

.actions :deep(.icon-btn),
.icon-btn {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 8px;
  border: 1px solid var(--o10);
  background: var(--o04);
  color: var(--text3);
  cursor: pointer;
}

.details-toggle.on {
  background: var(--o08);
  color: var(--text2);
}

.back :deep(svg) {
  transform: rotate(180deg);
}

.actions :deep(button:focus-visible),
.icon-btn:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: 1px;
}

@media (max-width: 1279px) {
  .btn-text {
    display: none;
  }

  .close-btn {
    width: 32px;
    padding: 0;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .thread-header {
    padding: calc(8px + var(--safe-top, 0px)) 12px 8px;
    height: auto;
    min-height: 56px;
  }

  .assignee,
  .actions :deep(.assignee) {
    display: none;
  }
}
</style>
