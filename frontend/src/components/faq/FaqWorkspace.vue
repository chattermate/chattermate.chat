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
import type { FaqItem } from '@/types/faq'
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
  sourceCount,
  pageCount,
  phase,
  barPhase,
  publishedCount,
  groupedFaqs,
  editingId,
  isNewFaq,
  draftQuestion,
  draftAnswer,
  isSaving,
  refresh,
  startPolling,
  stopPolling,
  startGeneration,
  submitImport,
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

async function onImportSubmit(url: string) {
  importSubmitting.value = true
  try {
    const ok = await submitImport(url)
    if (ok) importOpen.value = false
  } finally {
    importSubmitting.value = false
  }
}

// A single reusable confirm dialog for deletes.
interface ConfirmState {
  title: string
  message: string
  actionLabel: string
  busyLabel: string
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
    action: () => deleteFaq(faq),
  }
}

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
          Help center
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
          @generate="startGeneration"
          @import="importOpen = true"
          @add="startAdd"
        />

        <FaqEmptyState
          v-if="phase === 'empty' && !isNewFaq"
          :source-count="sourceCount"
          :page-count="pageCount"
          @generate="startGeneration"
          @import="importOpen = true"
          @add="startAdd"
        />

        <FaqGenerationProgress v-else-if="phase === 'generating' && job" :job="job" />

        <div v-else class="faq-list">
          <FaqCard
            v-if="isNewFaq"
            :faq="newFaqStub"
            :editing="true"
            :is-new="true"
            :saving="isSaving"
            v-model:draft-question="draftQuestion"
            v-model:draft-answer="draftAnswer"
            @save="saveEdit"
            @cancel="cancelEdit"
          />
          <FaqCategoryGroup
            v-for="[category, items] in groupedFaqs"
            :key="category"
            :category="category"
            :count="items.length"
          >
            <FaqCard
              v-for="faq in items"
              :key="faq.id"
              :faq="faq"
              :editing="editingId === faq.id"
              :saving="isSaving"
              :draft-question="draftQuestion"
              :draft-answer="draftAnswer"
              @update:draft-question="draftQuestion = $event"
              @update:draft-answer="draftAnswer = $event"
              @toggle-status="togglePublish(faq)"
              @edit="startEdit(faq)"
              @delete="askDelete(faq)"
              @save="saveEdit"
              @cancel="cancelEdit"
            />
          </FaqCategoryGroup>
        </div>
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

    <FaqImportModal :open="importOpen" :submitting="importSubmitting" @close="importOpen = false" @submit="onImportSubmit" />

    <div v-if="confirmState" class="confirm" role="dialog" aria-modal="true">
      <div class="confirm__card">
        <h3 class="confirm__title">{{ confirmState.title }}</h3>
        <p class="confirm__msg">{{ confirmState.message }}</p>
        <div class="confirm__actions">
          <button class="confirm__cancel" type="button" :disabled="confirmBusy" @click="confirmState = null">Cancel</button>
          <button class="confirm__delete" type="button" :disabled="confirmBusy" @click="runConfirm">
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

.settings-section:not(:first-child) {
  margin-top: 36px;
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

.confirm__delete {
  padding: 10px 18px;
  background: var(--coral-bg);
  border: 1px solid var(--coral-border);
  border-radius: 10px;
  color: var(--c-coral);
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}
</style>
