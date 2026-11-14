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
 * One conversation in the inbox list: who, which channel, when, what about,
 * and who has it. Two lines of text and a row of chips, about 76px tall.
 */
import { computed } from 'vue'
import type { Conversation } from '@/types/chat'
import { getInitials } from '@/utils/text'
import { channelGlyph } from '@/utils/channelGlyphs'
import { navIconSvg } from '@/components/layout/navIcons'
import { formatBadgeCount } from '@/utils/badgeCount'
import { avatarTone, customerName, rowChips } from './inboxPresentation'
import { elapsedLabel } from './inboxTime'

const props = defineProps<{
  conversation: Conversation
  active: boolean
  unread?: number
  currentUserId: string | null
  now: Date
}>()

defineEmits<{ (e: 'select', sessionId: string): void }>()

const name = computed(() => customerName(props.conversation.customer))
const channel = computed(() => channelGlyph(props.conversation.channel))
const chips = computed(() => rowChips(props.conversation, props.currentUserId, props.now))
const time = computed(() => elapsedLabel(props.conversation.updated_at, props.now))
const preview = computed(() => props.conversation.last_message || '')
const unreadLabel = computed(() => formatBadgeCount(props.unread))
const unreadHint = computed(() =>
  props.unread ? `, ${props.unread} unread` : ''
)

const CHIP_ICONS: Record<string, string> = { waiting: 'clock', negative: 'frown' }
</script>

<template>
  <button
    type="button"
    class="row"
    :class="{ active, unread: !!unread }"
    :aria-current="active ? 'true' : undefined"
    :aria-label="`Conversation with ${name}`"
    :aria-description="`${channel.label}${unreadHint}`"
    :data-session-id="conversation.session_id"
    @click="$emit('select', conversation.session_id)"
  >
    <span class="avatar" :style="{ background: avatarTone(conversation.session_id) }" aria-hidden="true">
      {{ getInitials(name) }}
      <span class="channel" :style="{ background: channel.color }" :title="channel.label">
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path :d="channel.path" /></svg>
      </span>
    </span>
    <span class="body">
      <span class="line">
        <span class="name">{{ name }}</span>
        <span class="time">{{ time }}</span>
      </span>
      <span class="summary">
        <span v-if="conversation.title" class="title">{{ conversation.title }}</span>
        <span v-if="conversation.title && preview" class="sep"> · </span>
        <span class="preview">{{ preview }}</span>
      </span>
      <span class="chips">
        <span
          v-for="chip in chips"
          :key="chip.kind"
          class="chip"
          :class="[`chip-${chip.kind}`, { late: chip.late }]"
        >
          <span v-if="chip.kind === 'ai' || chip.kind === 'person'" class="chip-dot" aria-hidden="true"></span>
          <span v-if="CHIP_ICONS[chip.kind]" class="chip-icon" aria-hidden="true" v-html="navIconSvg(CHIP_ICONS[chip.kind], 11)"></span>
          {{ chip.text }}
        </span>
        <span class="spacer"></span>
        <span v-if="unreadLabel" class="unread-count" aria-hidden="true">{{ unreadLabel }}</span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.row {
  position: relative;
  display: flex;
  gap: 10px;
  width: 100%;
  min-height: 76px;
  padding: 10px 12px;
  border: 0;
  border-bottom: 1px solid var(--o06);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.row:hover {
  background: var(--o04);
}

.row.active {
  background: var(--accent-bg-08);
}

.row.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--accent-ink);
}

.row:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: -2px;
}

.avatar {
  position: relative;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
}

.channel {
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg2);
  color: var(--on-dark);
  box-sizing: border-box;
}

.body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  white-space: nowrap;
}

.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.row.unread .name {
  font-weight: 700;
}

.time {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--muted2);
}

.summary {
  font-size: 13px;
  line-height: 17px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title {
  font-weight: 500;
  color: var(--text2);
}

.sep,
.preview {
  color: var(--muted);
}

.chips {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
}

.chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 18px;
  padding: 0 6px;
  border-radius: 6px;
  background: var(--o08);
  color: var(--text2);
  font-size: 11px;
  font-weight: 600;
}

.chip-ai {
  background: var(--accent-bg-12);
  color: var(--accent-ink);
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.chip-person .chip-dot {
  background: var(--c-coral);
}

.chip-waiting {
  background: var(--waiting-bg);
  color: var(--c-warn);
}

.chip-waiting.late {
  background: color-mix(in srgb, var(--c-warn) 22%, transparent);
}

.chip-icon {
  display: inline-flex;
}

.chip-closed {
  color: var(--muted);
}

.spacer {
  flex: 1;
}

.unread-count {
  flex-shrink: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  box-sizing: border-box;
  border-radius: 999px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}
</style>
