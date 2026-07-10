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
import type { KnowledgeSubPage } from '@/types/knowledge'
import type { SourceStatus } from '@/composables/useKnowledgeExplorer'

const props = defineProps<{
  page: KnowledgeSubPage
  sourceName: string
  sourceType: string
  status: SourceStatus
  deleting: boolean
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const statusText: Record<SourceStatus, string> = {
  synced: 'Synced',
  crawling: 'Crawling',
  error: 'Needs sync',
}

const paragraphs = computed(() =>
  (props.page.content || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean),
)

const href = computed(() => {
  const url = props.page.url || ''
  return /^https?:/i.test(url) ? url : `https://${url}`
})

const updatedLabel = computed(() => {
  if (!props.page.updated_at) return 'unknown'
  const d = new Date(props.page.updated_at)
  return Number.isNaN(d.getTime()) ? 'unknown' : d.toLocaleDateString()
})
</script>

<template>
  <div class="detail">
    <div class="detail__head">
      <div class="crumbs">
        <span class="crumbs__src" :title="sourceName">{{ sourceName }}</span>
        <span class="crumbs__sep">/</span>
        <span class="crumbs__type">{{ sourceType }}</span>
      </div>

      <div class="detail__title-row">
        <div class="detail__title-wrap">
          <h2 class="detail__title">{{ page.title }}</h2>
          <a class="detail__url" :href="href" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6" /><path d="M10 14 21 3" />
            </svg>
            <span class="detail__url-text">{{ page.url }}</span>
          </a>
        </div>
        <div class="detail__actions">
          <button class="btn btn--ghost" type="button" @click="$emit('edit')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
            Edit
          </button>
          <button class="btn btn--danger" type="button" :disabled="deleting" title="Delete page"
            @click="$emit('delete')">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
            </svg>
          </button>
        </div>
      </div>

      <div class="meta">
        <span class="meta__item">{{ page.word_count }} words</span>
        <span class="meta__sep"></span>
        <span class="meta__item">Updated {{ updatedLabel }}</span>
        <span class="meta__sep"></span>
        <span class="pill" :class="`pill--${status}`">
          <span class="pill__dot"></span>{{ statusText[status] }}
        </span>
      </div>
    </div>

    <div class="doc">
      <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
      <div v-if="paragraphs.length === 0" class="doc__empty">
        This page has no content yet. Click <strong>Edit</strong> to add some.
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.detail__head {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--o07);
  flex-shrink: 0;
}

.crumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted2);
  margin-bottom: 12px;
  min-width: 0;
}

.crumbs__src {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
}

.crumbs__sep { color: var(--faint); }
.crumbs__type { color: var(--text3); }

.detail__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.detail__title-wrap {
  flex: 1;
  min-width: 0;
}

.detail__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.01em;
  color: var(--text);
  margin: 0 0 6px;
  word-break: break-word;
}

.detail__url {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--c-teal);
  text-decoration: none;
  max-width: 100%;
}

.detail__url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  border: 1px solid var(--o12);
  background: var(--o05);
  color: var(--text2);
}

.btn:hover { background: var(--o08); }

.btn--danger {
  width: 34px;
  padding: 0;
  justify-content: center;
  height: 34px;
  color: var(--muted);
}

.btn--danger:hover:not(:disabled) {
  background: var(--coral-bg);
  color: var(--c-coral);
  border-color: var(--coral-border);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted2);
}

.meta__sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--faint);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid var(--teal-border);
  background: var(--teal-bg);
  color: var(--c-teal);
}

.pill__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.pill--crawling {
  border-color: var(--warning-border, var(--o12));
  background: var(--warning-bg);
  color: var(--warning-color);
}

.pill--error {
  border-color: var(--coral-border);
  background: var(--coral-bg);
  color: var(--c-coral);
}

.doc {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  color: var(--text3);
  font-size: 15px;
  line-height: 1.7;
  font-family: var(--font-sans);
}

.doc p {
  margin: 0 0 14px;
  white-space: pre-wrap;
}

.doc__empty {
  text-align: center;
  color: var(--muted2);
  font-size: 14px;
  padding: 40px 0;
}
</style>
