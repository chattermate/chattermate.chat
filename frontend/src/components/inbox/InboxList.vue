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
 * The conversations in the selected view: its name and size, how they are
 * sorted, a search over customers, and the rows, loading more as you scroll.
 * Below 1024px the views pane folds into the picker at the top.
 */
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { Conversation, InboxSort } from '@/types/chat'
import { navIconSvg } from '@/components/layout/navIcons'
import ConversationRow from './ConversationRow.vue'
import InboxFilters, { type InboxFilterValues } from './InboxFilters.vue'
import type { InboxViewGroup, InboxViewItem } from './inboxViews'

const props = defineProps<{
  view: InboxViewItem
  groups: InboxViewGroup[]
  conversations: Conversation[]
  selectedSessionId: string | null
  unread: Record<string, number>
  currentUserId: string | null
  now: Date
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: string
  /** Show the views as a picker here (the views pane is folded away) */
  showViewPicker: boolean
  /** The views pane was hidden by choice, and there's room to bring it back */
  canRestoreViews: boolean
  /** The views pane (and its New conversation button) is folded away */
  canStartConversation: boolean
  /** Tablet widths: the app's navigation is behind a menu button */
  showNavButton: boolean
  /** A search or filter is on: the view's count would not match the rows */
  narrowed: boolean
  /** What the filters offer; with one of each there is nothing to choose */
  filterAgents: Array<{ id: string; label: string }>
  filterTeammates: Array<{ id: string; label: string }>
}>()

const sort = defineModel<InboxSort>('sort', { required: true })
const search = defineModel<string>('search', { required: true })
const filters = defineModel<InboxFilterValues>('filters', { required: true })

const emit = defineEmits<{
  (e: 'select', sessionId: string): void
  (e: 'select-view', item: InboxViewItem): void
  (e: 'load-more'): void
  (e: 'retry'): void
  (e: 'restore-views'): void
  (e: 'new-conversation'): void
  (e: 'open-nav'): void
}>()

const searchInput = ref<HTMLInputElement | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function onPickView(event: Event) {
  const id = (event.target as HTMLSelectElement).value
  const item = props.groups.flatMap((g) => g.items).find((i) => i.id === id)
  if (item) emit('select-view', item)
}

watch(loadMoreTrigger, (el) => {
  observer?.disconnect()
  if (!el || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) emit('load-more')
  }, { rootMargin: '120px' })
  observer.observe(el)
})

onBeforeUnmount(() => observer?.disconnect())

const rowsEl = ref<HTMLElement | null>(null)

// J/K (or a deep link) can select a row scrolled out of sight: bring it in
watch(() => props.selectedSessionId, async (id) => {
  if (!id) return
  await nextTick()
  rowsEl.value?.querySelector(`[data-session-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest' })
})

// Another view, sort, search or filter is a new list: start it at the top
watch([() => props.view.id, sort, search, filters], () => {
  if (rowsEl.value) rowsEl.value.scrollTop = 0
})

/** For the "/" shortcut */
function focusSearch() {
  searchInput.value?.focus()
  searchInput.value?.select()
}

defineExpose({ focusSearch })
</script>

<template>
  <section class="list" aria-labelledby="inbox-list-title">
    <div class="list-head">
      <div class="head-row">
        <button v-if="showNavButton" type="button" class="icon-btn" aria-label="Open navigation" @click="emit('open-nav')">
          <span aria-hidden="true" v-html="navIconSvg('panelLeft', 16)"></span>
        </button>
        <h2 id="inbox-list-title" class="title">
          {{ view.title }}
          <span v-if="view.count !== null && !narrowed" class="title-count">{{ view.count }}</span>
        </h2>
        <label class="sort">
          <span class="visually-hidden">Sort</span>
          <select v-model="sort" class="sort-select">
            <option value="newest">Newest</option>
            <option value="waiting_longest">Waiting longest</option>
          </select>
          <span class="sort-chevron" aria-hidden="true" v-html="navIconSvg('chevronDown', 12)"></span>
        </label>
      </div>
      <div v-if="showViewPicker" class="picker-row">
      <button
        v-if="canRestoreViews"
        type="button"
        class="icon-btn"
        aria-label="Show views"
        aria-expanded="false"
        title="Show views"
        @click="emit('restore-views')"
      >
        <span aria-hidden="true" v-html="navIconSvg('panelLeft', 14)"></span>
      </button>
      <label class="view-picker">
        <span class="visually-hidden">View</span>
        <select :value="view.id" @change="onPickView">
          <optgroup v-for="(group, index) in groups" :key="group.heading ?? index" :label="group.heading ?? 'Inbox'">
            <option v-for="item in group.items" :key="item.id" :value="item.id">
              {{ item.count ? `${item.label} (${item.count})` : item.label }}
            </option>
          </optgroup>
        </select>
        <span class="sort-chevron" aria-hidden="true" v-html="navIconSvg('chevronDown', 12)"></span>
      </label>
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
      </div>
      <div class="search-row">
      <label class="search">
        <span class="search-icon" aria-hidden="true" v-html="navIconSvg('search', 14)"></span>
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          placeholder="Search customers or orders"
          title="Search by name, email, phone or order number"
          aria-label="Search conversations"
          aria-keyshortcuts="/"
        />
        <kbd aria-hidden="true">/</kbd>
      </label>
      <InboxFilters
        v-if="filterAgents.length > 1 || filterTeammates.length > 1"
        v-model="filters"
        :agents="filterAgents"
        :teammates="filterTeammates"
      />
      </div>
    </div>

    <div ref="rowsEl" class="rows" aria-live="polite" :aria-busy="loading">
      <p v-if="error" class="state">
        {{ error }}
        <button type="button" class="link-btn" @click="emit('retry')">Try again</button>
      </p>
      <p v-else-if="loading && !conversations.length" class="state">Loading conversations…</p>
      <p v-else-if="!conversations.length" class="state">
        {{ search.trim() ? `No conversations match “${search.trim()}”.` : view.empty }}
      </p>
      <ul v-else class="row-list">
        <li v-for="conversation in conversations" :key="conversation.session_id">
          <ConversationRow
            :conversation="conversation"
            :active="conversation.session_id === selectedSessionId"
            :unread="unread[conversation.session_id]"
            :current-user-id="currentUserId"
            :now="now"
            @select="emit('select', $event)"
          />
        </li>
      </ul>
      <div v-if="hasMore && conversations.length" ref="loadMoreTrigger" class="more">
        <span v-if="loadingMore">Loading more…</span>
      </div>
    </div>

    <p class="shortcuts" aria-hidden="true">
      <span><kbd>J</kbd> / <kbd>K</kbd> move</span>
      <span><kbd>E</kbd> close</span>
      <span><kbd>?</kbd> shortcuts</span>
    </p>
  </section>
</template>

<style scoped>
.list {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg2);
  border-right: 1px solid var(--o07);
}

.list-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--o07);
}

.head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.title {
  flex: 1;
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.title-count {
  font-weight: 500;
  color: var(--muted2);
}

.sort,
.view-picker {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.sort select,
.view-picker select {
  appearance: none;
  height: 28px;
  padding: 0 24px 0 8px;
  border-radius: 8px;
  border: 1px solid var(--o08);
  background: transparent;
  color: var(--text3);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.view-picker select {
  width: 100%;
  height: 32px;
  font-size: 13px;
  color: var(--text2);
}

.view-picker {
  flex: 1;
  min-width: 0;
}

.picker-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
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

.icon-btn:hover {
  background: var(--o08);
  color: var(--text);
}

select option,
select optgroup {
  background: var(--surface);
  color: var(--text);
}

.sort-chevron {
  position: absolute;
  right: 8px;
  display: inline-flex;
  pointer-events: none;
  color: var(--muted2);
}

.search-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-row :deep(.filter-btn) {
  width: 32px;
  height: 32px;
}

.search {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 8px 0 10px;
  border-radius: 8px;
  background: var(--o04);
  border: 1px solid var(--o08);
  color: var(--muted2);
}

.search:focus-within {
  border-color: var(--accent-border);
}

.search-icon {
  display: inline-flex;
  flex-shrink: 0;
}

.search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 13px;
}

.search input::placeholder {
  color: var(--muted2);
}

kbd {
  padding: 0 5px;
  border-radius: 6px;
  border: 1px solid var(--o10);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted2);
}

.rows {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.row-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.state {
  margin: 0;
  padding: 24px 16px;
  font-size: 13px;
  color: var(--muted);
  text-align: center;
}

.link-btn {
  margin-left: 4px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent-ink);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.more {
  padding: 12px;
  min-height: 1px;
  font-size: 12px;
  color: var(--muted2);
  text-align: center;
}

.shortcuts {
  margin: 0;
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  border-top: 1px solid var(--o07);
  font-size: 11px;
  color: var(--muted2);
  white-space: nowrap;
  overflow: hidden;
}

.shortcuts kbd {
  padding: 0;
  border: 0;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 768px) {
  /* Under the status bar of an installed app on a notched phone */
  .list-head {
    padding-top: calc(12px + var(--safe-top, 0px));
  }
}

@media (hover: none) {
  .shortcuts,
  .search kbd {
    display: none;
  }
}
</style>
