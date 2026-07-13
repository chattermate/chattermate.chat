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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { FaqImportMode, FaqItem, FaqStatus } from '@/types/faq'
import { useFaqWorkspace } from '@/composables/useFaqWorkspace'
import { useHelpCenterSettings } from '@/composables/useHelpCenterSettings'
import FaqGenerateBar from './FaqGenerateBar.vue'
import FaqEmptyState from './FaqEmptyState.vue'
import FaqGenerationProgress from './FaqGenerationProgress.vue'
import FaqCategoryGroup from './FaqCategoryGroup.vue'
import FaqCard from './FaqCard.vue'
import FaqImportModal from './FaqImportModal.vue'
import HelpCenterAppearance from './HelpCenterAppearance.vue'
import HelpCenterPublic from './HelpCenterPublic.vue'

const props = defineProps<{ organizationId?: string }>()

const emit = defineEmits<{
  'plan-allowed': [allowed: boolean]
}>()

const {
  faqs,
  job,
  settings,
  estimate,
  fetchEstimate,
  sourceCount,
  pageCount,
  phase,
  barPhase,
  publishedCount,
  groupedFaqs,
  searchQuery,
  categoryFilter,
  statusFilter,
  categories,
  hasActiveFilters,
  filteredCount,
  resetFilters,
  toggleCategory,
  isCategoryOpen,
  editingId,
  isNewFaq,
  draftQuestion,
  draftAnswer,
  isSaving,
  selectedIds,
  selectionActive,
  toggleSelect,
  setSelected,
  clearSelection,
  bulkSetStatus,
  bulkDelete,
  refresh,
  startPolling,
  stopPolling,
  startGeneration,
  submitImport,
  submitPdfImport,
  togglePublish,
  startEdit,
  startAdd,
  cancelEdit,
  saveEdit,
  deleteFaq,
} = useFaqWorkspace(() => props.organizationId)

const {
  saveState,
  queueSave,
  saveNow,
  uploadLogo,
  removeLogo,
  domainBusy,
  setDomain,
  verifyDomain,
  removeDomain,
} = useHelpCenterSettings(settings)

// Surface the server-side plan verdict to the view's lock overlay.
watch(
  () => settings.value?.plan_allowed,
  (allowed) => {
    if (typeof allowed === 'boolean') emit('plan-allowed', allowed)
  },
)

defineExpose({ settings })

// Tabs keep the (potentially long) FAQ list and the settings on separate
// panes so neither forces the other into a long scroll.
const tab = ref<'faqs' | 'settings'>('faqs')

// Import modal state.
const importOpen = ref(false)
const importSubmitting = ref(false)

async function onImportSubmit(url: string, mode: FaqImportMode) {
  importSubmitting.value = true
  try {
    const ok = await submitImport(url, mode)
    if (ok) importOpen.value = false
  } finally {
    importSubmitting.value = false
  }
}

async function onPdfImportSubmit(file: File) {
  importSubmitting.value = true
  try {
    const ok = await submitPdfImport(file)
    if (ok) importOpen.value = false
  } finally {
    importSubmitting.value = false
  }
}

// A single reusable confirm dialog for deletes and generation.
interface ConfirmState {
  title: string
  message: string
  actionLabel: string
  busyLabel: string
  intent?: 'danger' | 'primary'
  disabledReason?: string
  action: () => Promise<void>
}
const confirmState = ref<ConfirmState | null>(null)
const confirmBusy = ref(false)

function askDelete(faq: FaqItem) {
  confirmState.value = {
    title: 'Delete FAQ',
    message: `Delete “${faq.question}”? This cannot be undone.`,
    actionLabel: 'Delete',
    busyLabel: 'Deleting…',
    intent: 'danger',
    action: () => deleteFaq(faq),
  }
}

async function askGenerate() {
  await fetchEstimate(true) // full estimate incl. page counts for the dialog
  const e = estimate.value
  if (!e) {
    // Estimate unavailable (e.g. plan check failed) — let the backend decide.
    await startGeneration()
    return
  }
  if (e.total_sources === 0) {
    toast.error('No knowledge sources to generate from. Add knowledge first.')
    return
  }
  if (e.new_sources === 0) {
    toast.info('All knowledge sources already have FAQs — nothing new to generate.')
    return
  }
  const sources = `${e.new_sources} new source${e.new_sources === 1 ? '' : 's'}`
  const pages = e.pages ? ` (~${e.pages} page${e.pages === 1 ? '' : 's'})` : ''
  let message = `Generate FAQs from ${sources}${pages}?`
  let disabledReason: string | undefined
  if (e.metered) {
    message += ` This will use about ${e.estimated_calls} message credit${e.estimated_calls === 1 ? '' : 's'}.`
    if (e.remaining_credits !== null && e.estimated_calls > e.remaining_credits) {
      disabledReason = `Only ${e.remaining_credits} credits left this period — upgrade your plan or switch to your own AI model.`
    }
  }
  confirmState.value = {
    title: 'Generate FAQs',
    message,
    actionLabel: 'Generate',
    busyLabel: 'Starting…',
    intent: 'primary',
    disabledReason,
    action: () => startGeneration(),
  }
}

function askBulkDelete() {
  const n = selectedIds.value.size
  confirmState.value = {
    title: `Delete ${n} FAQ${n === 1 ? '' : 's'}`,
    message: 'Published articles will disappear from your help center. This cannot be undone.',
    actionLabel: 'Delete',
    busyLabel: 'Deleting…',
    intent: 'danger',
    action: async () => {
      try {
        await bulkDelete()
      } catch (error: any) {
        toast.error(error.message)
      }
    },
  }
}

function selectedInCategory(items: FaqItem[]): number {
  return items.reduce((n, item) => n + (selectedIds.value.has(item.id) ? 1 : 0), 0)
}

function publishedInCategory(items: FaqItem[]): number {
  return items.reduce((n, item) => n + (item.status === 'published' ? 1 : 0), 0)
}

const STATUS_FILTERS: { v: 'all' | FaqStatus; l: string }[] = [
  { v: 'all', l: 'All' },
  { v: 'published', l: 'Published' },
  { v: 'draft', l: 'Draft' },
]

async function runConfirm() {
  const state = confirmState.value
  if (!state) return
  confirmBusy.value = true
  try {
    await state.action()
  } finally {
    confirmBusy.value = false
    confirmState.value = null
  }
}

// Placeholder card for a manually added FAQ.
const newFaqStub = computed<FaqItem>(() => ({
  id: 'new',
  question: '',
  answer: '',
  category: 'New',
  status: 'draft',
  knowledge_id: null,
  source_label: 'Added manually',
}))

onMounted(() => {
  refresh()
  startPolling()
})

onUnmounted(stopPolling)
</script>

<template>
  <div class="faq-workspace">
    <div v-if="phase === 'loading'" class="loading">Loading your FAQs…</div>

    <template v-else>
      <nav class="tabs" role="tablist">
        <button class="tab" :class="{ 'tab--active': tab === 'faqs' }" type="button" role="tab" :aria-selected="tab === 'faqs'" @click="tab = 'faqs'">
          FAQs
          <span v-if="faqs.length" class="tab__count">{{ faqs.length }}</span>
        </button>
        <button class="tab" :class="{ 'tab--active': tab === 'settings' }" type="button" role="tab" :aria-selected="tab === 'settings'" @click="tab = 'settings'">
          Customization
        </button>
      </nav>

      <div v-show="tab === 'faqs'" class="tab-panel">
        <FaqGenerateBar
          class="workspace-bar"
          :phase="barPhase"
          :source-count="sourceCount"
          :page-count="pageCount"
          :faq-count="faqs.length"
          :published-count="publishedCount"
          :new-source-count="estimate?.new_sources ?? null"
          @generate="askGenerate"
          @import="importOpen = true"
          @add="startAdd"
        />

        <FaqEmptyState
          v-if="phase === 'empty' && !isNewFaq"
          :source-count="sourceCount"
          :page-count="pageCount"
          @generate="askGenerate"
          @import="importOpen = true"
          @add="startAdd"
        />

        <FaqGenerationProgress v-else-if="phase === 'generating' && job" :job="job" />

        <template v-else>
          <div v-if="isNewFaq" class="faq-list faq-list--new">
            <FaqCard
              :faq="newFaqStub"
              :editing="true"
              :is-new="true"
              :saving="isSaving"
              v-model:draft-question="draftQuestion"
              v-model:draft-answer="draftAnswer"
              @save="saveEdit"
              @cancel="cancelEdit"
            />
          </div>

          <!-- Search + filter toolbar (only once there are FAQs to filter) -->
          <template v-if="faqs.length">
            <div class="faq-toolbar">
              <div class="faq-search">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                <input v-model="searchQuery" type="search" placeholder="Search questions & answers…" aria-label="Search FAQs" />
              </div>
              <select v-model="categoryFilter" class="faq-select" aria-label="Filter by category">
                <option :value="null">All topics</option>
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
              <div class="faq-status-filter" role="group" aria-label="Filter by status">
                <button
                  v-for="opt in STATUS_FILTERS"
                  :key="opt.v"
                  class="faq-status-filter__btn"
                  :class="{ 'faq-status-filter__btn--active': statusFilter === opt.v }"
                  type="button"
                  @click="statusFilter = opt.v"
                >{{ opt.l }}</button>
              </div>
            </div>

            <div v-if="hasActiveFilters" class="faq-resultcount">{{ filteredCount }} of {{ faqs.length }} shown</div>
          </template>

          <div v-if="faqs.length && groupedFaqs.size === 0" class="faq-noresults">
            <p>No FAQs match your filters.</p>
            <button v-if="hasActiveFilters" class="faq-noresults__clear" type="button" @click="resetFilters">Clear filters</button>
          </div>

          <div v-else-if="groupedFaqs.size" class="faq-list">
            <FaqCategoryGroup
              v-for="[category, items] in groupedFaqs"
              :key="category"
              :category="category"
              :count="items.length"
              :published-count="publishedInCategory(items)"
              :selected-count="selectedInCategory(items)"
              :open="isCategoryOpen(category)"
              @toggle="toggleCategory(category)"
              @toggle-all="setSelected(items, $event)"
            >
              <FaqCard
                v-for="faq in items"
                :key="faq.id"
                :faq="faq"
                :editing="editingId === faq.id"
                :saving="isSaving"
                :selectable="selectionActive"
                :selected="selectedIds.has(faq.id)"
                :draft-question="draftQuestion"
                :draft-answer="draftAnswer"
                @update:draft-question="draftQuestion = $event"
                @update:draft-answer="draftAnswer = $event"
                @toggle-select="toggleSelect(faq.id)"
                @toggle-status="togglePublish(faq)"
                @edit="startEdit(faq)"
                @delete="askDelete(faq)"
                @save="saveEdit"
                @cancel="cancelEdit"
              />
            </FaqCategoryGroup>
          </div>
        </template>
      </div>

      <div v-show="tab === 'settings'" class="tab-panel">
        <template v-if="settings">
          <HelpCenterAppearance
            class="settings-section"
            :settings="settings"
            :save-state="saveState"
            @update="queueSave"
            @save-now="saveNow"
            @upload-logo="uploadLogo"
            @remove-logo="removeLogo"
          />
          <HelpCenterPublic
            class="settings-section"
            :settings="settings"
            :domain-busy="domainBusy"
            @toggle-enabled="saveNow({ enabled: $event })"
            @update-ai="saveNow($event)"
            @set-domain="setDomain"
            @verify-domain="verifyDomain"
            @remove-domain="removeDomain"
          />
        </template>
        <div v-else class="loading">Loading settings…</div>
      </div>
    </template>

    <FaqImportModal :open="importOpen" :submitting="importSubmitting" @close="importOpen = false" @submit="onImportSubmit" @submit-pdf="onPdfImportSubmit" />

    <div v-if="selectionActive" class="bulkbar" role="toolbar" aria-label="Bulk actions">
      <span class="bulkbar__count">{{ selectedIds.size }} selected</span>
      <button class="bulkbar__btn" type="button" @click="bulkSetStatus('published')">Publish</button>
      <button class="bulkbar__btn" type="button" @click="bulkSetStatus('draft')">Unpublish</button>
      <button class="bulkbar__btn bulkbar__btn--danger" type="button" @click="askBulkDelete">Delete</button>
      <button class="bulkbar__clear" type="button" aria-label="Clear selection" @click="clearSelection">✕</button>
    </div>

    <div v-if="confirmState" class="confirm" role="dialog" aria-modal="true">
      <div class="confirm__card">
        <h3 class="confirm__title">{{ confirmState.title }}</h3>
        <p class="confirm__msg">{{ confirmState.message }}</p>
        <p v-if="confirmState.disabledReason" class="confirm__blocked">{{ confirmState.disabledReason }}</p>
        <div class="confirm__actions">
          <button class="confirm__cancel" type="button" :disabled="confirmBusy" @click="confirmState = null">Cancel</button>
          <button
            class="confirm__go"
            :class="confirmState.intent === 'primary' ? 'confirm__go--primary' : 'confirm__go--danger'"
            type="button"
            :disabled="confirmBusy || !!confirmState.disabledReason"
            @click="runConfirm"
          >
            {{ confirmBusy ? confirmState.busyLabel : confirmState.actionLabel }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.faq-workspace {
  display: flex;
  flex-direction: column;
}

.loading {
  padding: 48px 0;
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--o08);
  margin-bottom: 20px;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.tab:hover {
  color: var(--text);
}

.tab--active {
  color: var(--text);
  border-bottom-color: var(--c-teal);
}

.tab__count {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  padding: 1px 7px;
  border-radius: var(--radius-pill);
  background: var(--o08);
  color: var(--muted2);
}

.tab--active .tab__count {
  background: var(--teal-bg);
  color: var(--c-teal);
}

.workspace-bar {
  margin-bottom: 16px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.faq-list--new {
  margin-bottom: 16px;
}

.faq-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.faq-search {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1;
  min-width: 200px;
  padding: 0 12px;
  background: var(--surface);
  border: 1px solid var(--o12);
  border-radius: 11px;
  color: var(--muted);
}

.faq-search input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 13.5px;
  padding: 10px 0;
}

.faq-select {
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--o12);
  border-radius: 11px;
  color: var(--text2);
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
}

.faq-status-filter {
  display: inline-flex;
  padding: 3px;
  background: var(--o05);
  border: 1px solid var(--o12);
  border-radius: 11px;
}

.faq-status-filter__btn {
  padding: 7px 13px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.faq-status-filter__btn--active {
  background: var(--surface);
  color: var(--text2);
  box-shadow: 0 1px 3px var(--scrim);
}

.faq-resultcount {
  margin: -8px 0 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted2);
}

.faq-noresults {
  padding: 40px 0;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
}

.faq-noresults__clear {
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--o05);
  border: 1px solid var(--o12);
  border-radius: 10px;
  color: var(--text2);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.settings-section:not(:first-child) {
  margin-top: 36px;
}

.bulkbar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--surface);
  border: 1px solid var(--o14);
  border-radius: var(--radius-pill);
  box-shadow: 0 8px 30px var(--scrim);
}

.bulkbar__count {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
  padding: 0 6px;
}

.bulkbar__btn {
  padding: 8px 14px;
  background: var(--o05);
  border: 1px solid var(--o12);
  border-radius: var(--radius-pill);
  color: var(--text2);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.bulkbar__btn:hover {
  background: var(--o08);
}

.bulkbar__btn--danger {
  background: var(--coral-bg);
  border-color: var(--coral-border);
  color: var(--c-coral);
}

.bulkbar__clear {
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
}

.bulkbar__clear:hover {
  background: var(--o08);
  color: var(--text);
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

.confirm__cancel {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid var(--o12);
  border-radius: 10px;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
}

.confirm__go {
  padding: 10px 18px;
  border-radius: 10px;
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

.confirm__go:disabled {
  opacity: 0.55;
  cursor: default;
}

.confirm__go--danger {
  background: var(--coral-bg);
  border: 1px solid var(--coral-border);
  color: var(--c-coral);
}

.confirm__go--primary {
  background: var(--purple-bg);
  border: 1px solid var(--purple-border);
  color: var(--c-purple);
}

.confirm__blocked {
  font-size: 13px;
  color: var(--c-coral);
  background: var(--coral-bg);
  border: 1px solid var(--coral-border);
  border-radius: 10px;
  padding: 10px 12px;
  margin: -8px 0 20px;
}
</style>
