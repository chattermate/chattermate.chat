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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  useKnowledgeExplorer,
  type ExplorerSource,
  type AddSourcePayload,
} from '@/composables/useKnowledgeExplorer'
import KnowledgeSourceTree from './KnowledgeSourceTree.vue'
import KnowledgePageDetail from './KnowledgePageDetail.vue'
import KnowledgePageEditor from './KnowledgePageEditor.vue'
import KnowledgePlanMeters from './KnowledgePlanMeters.vue'
import KnowledgeAddSourceModal from './KnowledgeAddSourceModal.vue'

const props = withDefaults(
  defineProps<{
    mode: 'agent' | 'org'
    organizationId: string
    agentId?: string
    showPlanMeters?: boolean
    title?: string
    description?: string
    variant?: 'page' | 'section'
  }>(),
  {
    agentId: undefined,
    showPlanMeters: false,
    title: '',
    description: '',
    variant: 'section',
  },
)

const ex = useKnowledgeExplorer(props.mode, props.agentId, props.organizationId)

// Add-source modal state.
const addOpen = ref(false)
const isSubmittingSource = ref(false)

// A single, reusable confirm dialog for the destructive actions.
interface ConfirmState {
  title: string
  message: string
  actionLabel: string
  busyLabel: string
  action: () => Promise<void>
}
const confirmState = ref<ConfirmState | null>(null)

const largestSource = computed(() =>
  ex.sources.value.reduce<ExplorerSource | null>((max, s) => {
    if (!max || (s.pages ?? s.pageStubs).length > (max.pages ?? max.pageStubs).length) return s
    return max
  }, null),
)
const largestSubpageCount = computed(() => {
  const s = largestSource.value
  return s ? (s.pages ?? s.pageStubs).length : 0
})

function openAdd() {
  addOpen.value = true
}

async function onSubmitSource(payload: AddSourcePayload) {
  if (isSubmittingSource.value) return
  isSubmittingSource.value = true
  try {
    const ok = await ex.submitSource(payload)
    if (ok) addOpen.value = false
  } finally {
    isSubmittingSource.value = false
  }
}

function askDeleteSource(source: ExplorerSource) {
  confirmState.value = source.queued
    ? {
        title: 'Cancel crawl',
        message: `Cancel the queued crawl of “${source.name}”?`,
        actionLabel: 'Cancel crawl',
        busyLabel: 'Cancelling…',
        action: () => ex.deleteSource(source),
      }
    : {
        title: 'Delete source',
        message: `Delete “${source.name}” and all of its pages? This cannot be undone.`,
        actionLabel: 'Delete',
        busyLabel: 'Deleting…',
        action: () => ex.deleteSource(source),
      }
}

function askDeletePage() {
  const page = ex.selectedPage.value
  if (!page) return
  confirmState.value = {
    title: 'Delete page',
    message: `Delete “${page.title}” from this source? This cannot be undone.`,
    actionLabel: 'Delete',
    busyLabel: 'Deleting…',
    action: () => ex.deletePage(),
  }
}

async function runConfirm() {
  const state = confirmState.value
  if (!state) return
  await state.action()
  confirmState.value = null
}

onMounted(() => {
  ex.refresh()
  ex.startPolling()
})

onUnmounted(() => {
  ex.stopPolling()
})
</script>

<template>
  <div class="explorer">
    <header class="explorer__header">
      <div class="explorer__heading">
        <component :is="variant === 'page' ? 'h1' : 'h3'" class="explorer__title" :class="`explorer__title--${variant}`">
          {{ title }}
        </component>
        <p v-if="description" class="explorer__desc">{{ description }}</p>
      </div>
      <div class="explorer__actions">
        <slot name="actions" />
        <button class="btn btn--primary" type="button" @click="openAdd">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Add source
        </button>
      </div>
    </header>

    <KnowledgePlanMeters
      v-if="showPlanMeters"
      class="explorer__meters"
      :source-count="ex.sources.value.length"
      :largest-source-name="largestSource?.name ?? null"
      :largest-subpage-count="largestSubpageCount"
    />

    <div v-if="ex.error.value" class="banner" role="alert">
      {{ ex.error.value }}
      <button class="banner__close" type="button" aria-label="Dismiss" @click="ex.error.value = null">×</button>
    </div>

    <div class="grid">
      <KnowledgeSourceTree
        class="grid__tree"
        :sources="ex.filteredSources.value"
        :selected-page-id="ex.selectedPageId.value"
        :query="ex.query.value"
        :status-of="ex.sourceStatus"
        :page-rows-of="ex.pageRows"
        @update:query="ex.query.value = $event"
        @toggle="ex.toggleSource"
        @select="(source, pageId) => ex.selectPage(source, pageId)"
        @delete-source="askDeleteSource"
      />

      <div class="grid__detail">
        <KnowledgePageEditor
          v-if="ex.editing.value && ex.selectedPage.value"
          :title="ex.draftTitle.value"
          :content="ex.draftContent.value"
          :saving="ex.isSaving.value"
          @update:title="ex.draftTitle.value = $event"
          @update:content="ex.draftContent.value = $event"
          @save="ex.savePage"
          @cancel="ex.cancelEdit"
        />
        <KnowledgePageDetail
          v-else-if="ex.selectedPage.value && ex.selectedSource.value"
          :page="ex.selectedPage.value"
          :source-name="ex.selectedSource.value.name"
          :source-type="ex.selectedSource.value.type"
          :status="ex.sourceStatus(ex.selectedSource.value)"
          :deleting="ex.isDeleting.value"
          @edit="ex.startEdit"
          @delete="askDeletePage"
        />
        <div v-else class="empty">
          <div class="empty__orb"></div>
          <div class="empty__title">Select a page to review</div>
          <p class="empty__text">
            Pick any extracted page on the left to read its content, edit it, or remove it — or add a source of your own.
          </p>
        </div>
      </div>
    </div>

    <div v-if="confirmState" class="confirm" role="dialog" aria-modal="true">
      <div class="confirm__card">
        <h3 class="confirm__title">{{ confirmState.title }}</h3>
        <p class="confirm__msg">{{ confirmState.message }}</p>
        <div class="confirm__actions">
          <button class="btn btn--ghost" type="button" :disabled="ex.isDeleting.value" @click="confirmState = null">Cancel</button>
          <button class="btn btn--danger-solid" type="button" :disabled="ex.isDeleting.value" @click="runConfirm">
            {{ ex.isDeleting.value ? confirmState.busyLabel : confirmState.actionLabel }}
          </button>
        </div>
      </div>
    </div>

    <KnowledgeAddSourceModal
      v-if="addOpen"
      :submitting="isSubmittingSource"
      @close="addOpen = false"
      @submit="onSubmitSource"
    />
  </div>
</template>

<style scoped>
.explorer {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.explorer__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.explorer__heading {
  min-width: 0;
}

.explorer__title {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--text);
  margin: 0 0 6px;
}

.explorer__title--page {
  font-size: 30px;
  letter-spacing: -0.02em;
}

.explorer__title--section {
  font-size: 20px;
}

.explorer__desc {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
  max-width: 560px;
  line-height: 1.55;
}

.explorer__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.explorer__meters {
  margin-bottom: 14px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 47px;
  padding: 0 18px;
  border-radius: 11px;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}

.btn--primary:hover:not(:disabled) { filter: brightness(1.05); }

.btn--ghost {
  background: var(--o05);
  border-color: var(--o12);
  color: var(--text2);
}

.btn--ghost:hover:not(:disabled) { background: var(--o08); }

.btn--danger-solid {
  background: var(--c-coral);
  color: var(--on-accent-solid);
}

.btn--danger-solid:hover:not(:disabled) { filter: brightness(1.05); }

.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 14px;
  margin-bottom: 16px;
  background: var(--error-bg);
  border: 1px solid var(--coral-border);
  border-radius: 11px;
  color: var(--c-coral);
  font-size: 13.5px;
}

.banner__close {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
}

.grid {
  display: grid;
  grid-template-columns: 344px 1fr;
  gap: 18px;
  align-items: stretch;
}

@media (max-width: 860px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.grid__tree,
.grid__detail {
  height: 640px;
}

.grid__detail {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.empty__orb {
  width: 52px;
  height: 52px;
  margin-bottom: 18px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, var(--c-lime), var(--c-purple), var(--c-teal), var(--c-coral), var(--c-lime));
  opacity: 0.85;
}

.empty__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 18px;
  color: var(--text2);
  margin-bottom: 8px;
}

.empty__text {
  font-size: 14px;
  color: var(--muted);
  max-width: 320px;
  line-height: 1.55;
  margin: 0;
}

.confirm {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm__card {
  background: var(--surface);
  border: 1px solid var(--o12);
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
}

.confirm__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  color: var(--text);
  margin: 0 0 8px;
}

.confirm__msg {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.55;
  margin: 0 0 20px;
}

.confirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
