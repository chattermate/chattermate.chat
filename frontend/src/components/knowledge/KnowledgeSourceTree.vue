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
import type { ExplorerSource, SourceStatus } from '@/composables/useKnowledgeExplorer'

interface PageRow {
  page_id: string
  title: string
  words: number | null
}

const props = defineProps<{
  sources: ExplorerSource[]
  selectedPageId: string | null
  selectedSourceId: number | null
  query: string
  statusOf: (source: ExplorerSource) => SourceStatus
  pageRowsOf: (source: ExplorerSource) => PageRow[]
}>()

// Group page rows once per render (the template reads them twice per source).
const rowsBySource = computed(() => {
  const map = new Map<number, PageRow[]>()
  for (const source of props.sources) map.set(source.id, props.pageRowsOf(source))
  return map
})

const emit = defineEmits<{
  (e: 'update:query', value: string): void
  (e: 'toggle', source: ExplorerSource): void
  (e: 'select', source: ExplorerSource, pageId: string): void
  (e: 'delete-source', source: ExplorerSource): void
  (e: 'add-page', source: ExplorerSource): void
}>()

const statusLabel: Record<SourceStatus, string> = {
  queued: 'Pending',
  crawling: 'Crawling',
  synced: 'Synced',
  error: 'Needs sync',
}

// A queued placeholder's error state is a failed crawl, not a source that
// merely "needs sync".
function queuedLabel(source: ExplorerSource): string {
  const status = props.statusOf(source)
  return status === 'error' ? 'Failed' : statusLabel[status]
}

function sourceGlyph(type: string): string {
  const t = (type || '').toLowerCase()
  if (t.includes('pdf') || t === 'file') return 'P'
  if (t.includes('site')) return 'S'
  if (t.includes('web')) return 'W'
  return 'T'
}
</script>

<template>
  <div class="tree">
    <div class="tree__search">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        :value="query"
        type="search"
        placeholder="Search pages…"
        aria-label="Search pages"
        @input="emit('update:query', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="tree__body">
      <div v-for="source in sources" :key="source.id" class="src">
        <div class="src__row">
          <button
            class="src__toggle"
            type="button"
            :aria-expanded="source.queued ? undefined : source.expanded"
            :disabled="source.queued"
            @click="!source.queued && emit('toggle', source)"
          >
            <svg v-if="!source.queued" class="chev" :class="{ 'chev--open': source.expanded }" viewBox="0 0 24 24"
              width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
            <span v-else class="chev-spacer"></span>
            <span class="src__glyph" :class="`src__glyph--${sourceGlyph(source.type).toLowerCase()}`">{{ sourceGlyph(source.type) }}</span>
            <span class="src__meta">
              <span class="src__name" :title="source.name">{{ source.name }}</span>
              <span class="src__count" :class="{ 'src__count--error': source.queued && statusOf(source) === 'error' }">
                {{ source.queued ? queuedLabel(source) : (source.pages ?? source.pageStubs).length + ' sub-pages' }}
              </span>
            </span>
          </button>
          <span class="dot" :class="`dot--${statusOf(source)}`" :title="statusLabel[statusOf(source)]"></span>
          <button
            v-if="!source.queued"
            class="src__add"
            type="button"
            title="Add a sub-page to this source"
            @click="emit('add-page', source)"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4"
              stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <button
            class="src__del"
            type="button"
            :title="!source.queued ? 'Delete this source' : (statusOf(source) === 'error' ? 'Dismiss failed source' : 'Cancel crawl')"
            @click="emit('delete-source', source)"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.9"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
            </svg>
          </button>
        </div>

        <div v-if="source.queued && source.queuedError" class="src__error">
          {{ source.queuedError }}
        </div>

        <div v-if="source.expanded && !source.queued" class="src__pages">
          <div v-if="source.loadingContent" class="src__hint">Loading pages…</div>
          <div v-else-if="source.contentError" class="src__hint src__hint--error">{{ source.contentError }}</div>
          <template v-else>
            <button
              v-for="row in (rowsBySource.get(source.id) || [])"
              :key="row.page_id"
              type="button"
              class="pg"
              :class="{ 'pg--active': source.id === selectedSourceId && row.page_id === selectedPageId }"
              @click="emit('select', source, row.page_id)"
            >
              <span class="pg__dot"></span>
              <span class="pg__title" :title="row.title">{{ row.title }}</span>
              <span v-if="row.words !== null" class="pg__words">{{ row.words }}w</span>
            </button>
            <div v-if="(rowsBySource.get(source.id) || []).length === 0" class="src__hint">No pages extracted yet.</div>
            <button type="button" class="pg pg--add" @click="emit('add-page', source)">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              Add sub-page
            </button>
          </template>
        </div>
      </div>

      <div v-if="sources.length === 0" class="tree__empty">
        <template v-if="query">No pages match “{{ query }}”.</template>
        <template v-else>No knowledge sources yet.</template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tree {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  min-height: 0;
}

.tree__search {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 14px;
  padding: 0 12px;
  background: var(--bg);
  border: 1px solid var(--o10);
  border-radius: 10px;
  color: var(--muted2);
  flex-shrink: 0;
}

.tree__search input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 13.5px;
  padding: 10px 0;
}

.tree__body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.src {
  margin-bottom: 4px;
}

.src__row {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 9px;
  padding-right: 6px;
}

.src__row:hover {
  background: var(--o04);
}

.src__toggle {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  background: transparent;
  border: none;
  text-align: left;
  color: inherit;
}

.chev {
  flex-shrink: 0;
  color: var(--muted2);
  transition: transform 0.18s ease;
}

.chev-spacer {
  width: 14px;
  flex-shrink: 0;
}

.src__toggle:disabled {
  cursor: default;
}

.chev--open {
  transform: rotate(90deg);
}

.src__glyph {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;
  background: var(--accent-bg-12);
  color: var(--accent-ink);
}

.src__glyph--p { background: var(--coral-bg); color: var(--c-coral); }
.src__glyph--s { background: var(--teal-bg); color: var(--c-teal); }
.src__glyph--t { background: var(--purple-bg, var(--o08)); color: var(--c-purple); }

.src__meta {
  flex: 1;
  min-width: 0;
}

.src__name {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.src__count {
  display: block;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--muted2);
  margin-top: 2px;
}

.src__count--error {
  color: var(--c-coral);
}

.dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--muted2);
}

.dot--synced { background: var(--c-teal); box-shadow: 0 0 6px var(--c-teal); }
.dot--crawling { background: var(--warning-color); }
.dot--queued { background: var(--c-purple); }
.dot--error { background: var(--c-coral); }

.src__add,
.src__del {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 7px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--muted2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.src__row:hover .src__add,
.src__row:hover .src__del { opacity: 1; }

.src__add:hover {
  background: var(--accent-bg-08);
  color: var(--accent-ink);
  border-color: var(--accent-border, var(--o12));
}

.src__del:hover {
  background: var(--coral-bg);
  color: var(--c-coral);
  border-color: var(--coral-border);
}

.src__pages {
  padding: 2px 0 6px 18px;
}

.pg {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 10px;
  margin: 1px 0;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  background: transparent;
  color: inherit;
}

.pg:hover { background: var(--o04); }
.pg--active { background: var(--accent-bg-08); }

.pg--add {
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: var(--font-sans);
  color: var(--muted2);
}

.pg--add:hover {
  color: var(--accent-ink);
}

.pg__dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--c-teal);
}

.pg__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: var(--text3);
}

.pg--active .pg__title {
  color: var(--text);
  font-weight: 600;
}

.pg__words {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--faint);
}

.src__hint {
  padding: 8px 10px;
  font-size: 12.5px;
  color: var(--muted2);
}

.src__hint--error { color: var(--c-coral); }

.src__error {
  margin: 2px 10px 6px 44px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--c-coral);
  background: var(--coral-bg);
  border: 1px solid var(--coral-border);
  border-radius: 8px;
}

.tree__empty {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px;
  color: var(--muted2);
}
</style>
