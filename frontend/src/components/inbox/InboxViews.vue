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
 * The inbox's views: yours, waiting for a person, all open, the AI's, each
 * channel, and saved ones, each with its count. Also where you go online or
 * offline and start a conversation, since the inbox has no page header.
 * The enterprise module adds to it: a menu on each of its saved views
 * (#item-actions) and "New view" under the list (#footer).
 */
import { inject } from 'vue'
import { AGENT_STATUS_KEY } from '@/composables/useAgentStatus'
import { navIconSvg } from '@/components/layout/navIcons'
import { formatBadgeCount } from '@/utils/badgeCount'
import type { InboxViewGroup, InboxViewItem } from './inboxViews'

defineProps<{
  groups: InboxViewGroup[]
  selectedId: string
  canStartConversation: boolean
}>()

const emit = defineEmits<{
  (e: 'select', item: InboxViewItem): void
  (e: 'new-conversation'): void
  (e: 'hide'): void
}>()

const status = inject(AGENT_STATUS_KEY, null)

const countLabel = (item: InboxViewItem) => (item.count ? formatBadgeCount(item.count) : '')
</script>

<template>
  <nav class="views" aria-label="Inbox views">
    <div class="views-head">
      <h1>Inbox</h1>
      <span class="head-actions">
        <button
          v-if="canStartConversation"
          type="button"
          class="icon-btn"
          aria-label="New conversation"
          title="New conversation"
          @click="emit('new-conversation')"
        >
          <span aria-hidden="true" v-html="navIconSvg('plus', 14)"></span>
        </button>
        <button
          type="button"
          class="icon-btn ghost"
          aria-label="Hide views"
          aria-expanded="true"
          title="Hide views"
          @click="emit('hide')"
        >
          <span aria-hidden="true" v-html="navIconSvg('panelLeft', 14)"></span>
        </button>
      </span>
    </div>

    <button
      v-if="status"
      type="button"
      class="status"
      :aria-pressed="status.isOnline.value"
      :disabled="status.statusUpdating.value"
      :aria-label="status.isOnline.value ? 'You\'re online. Go offline' : 'You\'re offline. Go online'"
      @click="status.toggleOnline()"
    >
      <span class="status-dot" :class="{ online: status.isOnline.value }" aria-hidden="true"></span>
      <span class="status-text">{{ status.isOnline.value ? "You're online" : "You're offline" }}</span>
    </button>

    <div v-for="(group, index) in groups" :key="group.heading ?? index" class="group">
      <h2 v-if="group.heading" class="group-heading">{{ group.heading }}</h2>
      <ul class="group-items">
        <li v-for="item in group.items" :key="item.id" class="item">
          <button
            type="button"
            class="view"
            :class="[`tone-${item.tone}`, { active: item.id === selectedId }]"
            :aria-current="item.id === selectedId ? 'true' : undefined"
            :aria-label="item.count ? `${item.label}, ${item.count}` : item.label"
            :data-view="item.id"
            @click="emit('select', item)"
          >
            <span
              class="marker"
              :class="{ square: item.tone === 'channel' }"
              :style="item.color ? { background: item.color } : undefined"
              aria-hidden="true"
            ></span>
            <span class="label">{{ item.label }}</span>
            <span v-if="countLabel(item)" class="count" aria-hidden="true">{{ countLabel(item) }}</span>
          </button>
          <slot name="item-actions" :item="item" />
        </li>
      </ul>
    </div>

    <slot name="footer" />
  </nav>
</template>

<style scoped>
.views {
  height: 100%;
  box-sizing: border-box;
  /* A thin bar on a short screen, so it doesn't eat the labels' room */
  scrollbar-width: thin;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 8px;
  overflow-y: auto;
  background: var(--bg2);
  border-right: 1px solid var(--o07);
}

.views-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 0 6px;
}

.views-head h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text);
}

.head-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 28px;
  height: 28px;
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

.icon-btn.ghost {
  background: transparent;
  color: var(--muted);
}

.icon-btn:hover {
  background: var(--o08);
  color: var(--text);
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--o08);
  background: var(--o04);
  color: var(--text2);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
}

.status:disabled {
  opacity: 0.6;
  cursor: progress;
}

.status-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--muted2);
}

.status-dot.online {
  background: var(--c-positive);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-positive) 22%, transparent);
}

.status-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-heading {
  margin: 0;
  padding: 0 10px 6px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted2);
}

.group-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item {
  position: relative;
}

/* Room for the actions an item carries (#item-actions) */
.item:has(> .item-actions) .view {
  padding-right: 34px;
}

.view {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 8px 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text3);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  text-align: left;
  cursor: pointer;
}

.view:hover {
  background: var(--o05);
  color: var(--text);
}

.view.active {
  background: var(--accent-bg-12);
  color: var(--accent-ink);
  font-weight: 600;
}

.view:focus-visible,
.status:focus-visible,
.icon-btn:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: 1px;
}

.marker {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
}

.marker.square {
  border-radius: 2px;
}

.tone-waiting .marker {
  background: var(--c-warn);
}

.tone-ai .marker {
  background: var(--accent-ink);
}

.label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.count {
  flex-shrink: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  box-sizing: border-box;
  border-radius: 999px;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
  color: var(--muted2);
}

/* On the selected view's tinted background muted2 falls under 4.5:1 */
.view.active .count {
  color: var(--text2);
}

.tone-waiting .count {
  background: var(--c-warn);
  color: var(--on-warn);
}
</style>
