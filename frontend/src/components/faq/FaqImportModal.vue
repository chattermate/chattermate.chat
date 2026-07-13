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
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import Modal from '@/components/common/Modal.vue'
import FaqOrb from './FaqOrb.vue'
import type { FaqImportMode } from '@/types/faq'

const props = defineProps<{
  open: boolean
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [url: string, mode: FaqImportMode]
  'submit-pdf': [file: File]
}>()

const url = ref('')
const mode = ref<FaqImportMode>('qa')
const pdfFile = ref<File | null>(null)

const MODES: { value: FaqImportMode; title: string; description: string }[] = [
  {
    value: 'qa',
    title: 'Q&A page',
    description: 'AI reads one page and extracts each question & answer. Uses AI credits.',
  },
  {
    value: 'articles',
    title: 'Article pages',
    description: 'Imports every article linked from the page as-is — text, images and links. No AI.',
  },
  {
    value: 'pdf',
    title: 'PDF document',
    description: 'AI extracts questions & answers from an uploaded PDF. Uses AI credits.',
  },
]

watch(
  () => props.open,
  (open) => {
    if (!open) {
      url.value = ''
      mode.value = 'qa'
      pdfFile.value = null
    }
  },
)

const canSubmit = computed(() => {
  if (props.submitting) return false
  if (mode.value === 'pdf') return pdfFile.value !== null
  return url.value.trim().length > 0
})

const hint = computed(() => {
  if (mode.value === 'articles')
    return 'ChatterMate follows the article links on that page and imports each article verbatim as a draft — formatting and images included.'
  if (mode.value === 'pdf')
    return 'ChatterMate reads the PDF, extracts each question and answer, and adds them here as drafts for you to review before publishing.'
  return 'ChatterMate crawls the page, extracts each question and answer, and adds them here as drafts for you to review before publishing.'
})

const fileSize = computed(() => {
  const bytes = pdfFile.value?.size ?? 0
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

const dragOver = ref(false)

function setPdf(file: File | null | undefined) {
  if (file && file.type === 'application/pdf') pdfFile.value = file
  else if (file) toast.error('Please choose a PDF file')
}

function onPdfChange(event: Event) {
  setPdf((event.target as HTMLInputElement).files?.[0] ?? null)
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  setPdf(event.dataTransfer?.files?.[0])
}

function submit() {
  if (!canSubmit.value) return
  if (mode.value === 'pdf') {
    if (pdfFile.value) emit('submit-pdf', pdfFile.value)
    return
  }
  const cleaned = url.value.trim().replace(/^https?:\/\//i, '')
  emit('submit', `https://${cleaned}`, mode.value)
}
</script>

<template>
  <Modal v-if="open" @close="$emit('close')">
    <template #title>Migrate an existing help center</template>
    <template #content>
      <p class="import-sub">Paste a help-center or FAQ URL and choose how to bring the content in.</p>

      <div class="mode-cards" role="radiogroup" aria-label="Import mode">
        <label
          v-for="option in MODES"
          :key="option.value"
          class="mode-card"
          :class="{ 'mode-card--active': mode === option.value }"
        >
          <input v-model="mode" class="mode-card__radio" type="radio" name="faq-import-mode" :value="option.value" />
          <span class="mode-card__title">{{ option.title }}</span>
          <span class="mode-card__desc">{{ option.description }}</span>
        </label>
      </div>

      <template v-if="mode !== 'pdf'">
        <label class="import-label" for="faq-import-url">{{ mode === 'articles' ? 'HELP CENTER INDEX URL' : 'FAQ PAGE URL' }}</label>
        <div class="import-input">
          <span class="import-input__prefix">https://</span>
          <input
            id="faq-import-url"
            v-model="url"
            type="text"
            placeholder="support.yourcompany.com/faq"
            @keydown.enter="submit"
          />
        </div>
      </template>
      <template v-else>
        <label class="import-label" for="faq-import-pdf">PDF FILE (MAX 25MB)</label>
        <label
          class="pdf-drop"
          :class="{ 'pdf-drop--filled': pdfFile, 'pdf-drop--drag': dragOver }"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="onDrop"
        >
          <input id="faq-import-pdf" class="pdf-drop__input" type="file" accept="application/pdf" @change="onPdfChange" />
          <span class="pdf-drop__icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" /><path d="M9 13h6M9 17h4" /></svg>
          </span>
          <span class="pdf-drop__text">
            <template v-if="pdfFile">
              <span class="pdf-drop__name">{{ pdfFile.name }}</span>
              <span class="pdf-drop__meta">{{ fileSize }} · Choose a different file</span>
            </template>
            <template v-else>
              <span class="pdf-drop__name">Choose a PDF or drop it here</span>
              <span class="pdf-drop__meta">PDF only, up to 25 MB</span>
            </template>
          </span>
        </label>
      </template>
      <div class="import-hint">
        <FaqOrb :size="34" />
        <div>{{ hint }}</div>
      </div>
      <div class="import-actions">
        <button class="btn-cancel" type="button" @click="$emit('close')">Cancel</button>
        <button class="btn-import" type="button" :disabled="!canSubmit" @click="submit">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12" /><path d="M8 11l4 4 4-4" /><path d="M5 21h14" /></svg>
          {{ submitting ? 'Importing…' : mode === 'articles' ? 'Import articles' : mode === 'pdf' ? 'Import PDF' : 'Import FAQs' }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.import-sub {
  font-size: 13px;
  color: var(--muted);
  margin: -12px 0 18px;
  line-height: 1.5;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

@media (max-width: 560px) {
  .mode-cards {
    grid-template-columns: 1fr;
  }
}

.mode-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 13px 14px;
  background: var(--o03);
  border: 1px solid var(--o12);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.mode-card--active {
  background: var(--purple-bg);
  border-color: var(--purple-border);
}

.mode-card__radio {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.mode-card__title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text2);
}

.mode-card--active .mode-card__title {
  color: var(--c-purple);
}

.mode-card__desc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.45;
}

.import-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted2);
  margin-bottom: 8px;
}

.import-input {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: 11px;
  padding: 0 14px;
  margin-bottom: 16px;
  font-family: var(--font-mono);
}

.import-input__prefix {
  color: var(--faint);
  font-size: 13.5px;
}

.import-input input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 13.5px;
  padding: 13px 4px;
  font-family: var(--font-mono);
}

.pdf-drop {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 16px 18px;
  margin-bottom: 16px;
  background: var(--bg);
  border: 1.5px dashed var(--o14);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.pdf-drop:hover {
  border-color: var(--c-purple);
  background: var(--purple-bg);
}

.pdf-drop--filled {
  border-style: solid;
  border-color: var(--purple-border);
  background: var(--purple-bg);
}

.pdf-drop--drag {
  border-style: solid;
  border-color: var(--c-purple);
  background: var(--purple-bg);
}

.pdf-drop__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.pdf-drop__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--o05);
  color: var(--muted);
}

.pdf-drop--filled .pdf-drop__icon {
  background: var(--surface);
  color: var(--c-purple);
}

.pdf-drop__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pdf-drop__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-drop__meta {
  font-size: 12px;
  color: var(--muted);
}

.import-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--o03);
  border: 1px solid var(--o07);
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.import-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 11px 18px;
  background: transparent;
  border: 1px solid var(--o12);
  border-radius: 10px;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-import {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: var(--c-purple);
  border: none;
  border-radius: 10px;
  color: var(--on-accent);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-import:disabled {
  opacity: 0.55;
  cursor: default;
}
</style>
