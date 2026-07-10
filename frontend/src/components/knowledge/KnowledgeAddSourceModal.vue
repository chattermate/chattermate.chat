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
import { computed, ref } from 'vue'
import type { AddSourcePayload } from '@/composables/useKnowledgeExplorer'

type SourceKind = 'website' | 'sitemap' | 'pdf' | 'text'

const props = withDefaults(
  defineProps<{
    initialUrl?: string
    initialType?: SourceKind
    submitting?: boolean
  }>(),
  { initialUrl: '', initialType: 'website', submitting: false },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: AddSourcePayload): void
}>()

const kind = ref<SourceKind>(props.initialType)
const url = ref(props.initialUrl)
const followLinks = ref(true)
const files = ref<File[]>([])
const title = ref('')
const content = ref('')
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const types: { key: SourceKind; title: string; sub: string }[] = [
  { key: 'website', title: 'Website', sub: 'Crawl a page or whole site' },
  { key: 'sitemap', title: 'Sitemap', sub: 'Index every listed page' },
  { key: 'pdf', title: 'Document', sub: 'PDF file, up to 25 MB' },
  { key: 'text', title: 'Text', sub: 'Paste content directly' },
]

const willQueue = computed(() => kind.value !== 'text')
const submitLabel = computed(() => (kind.value === 'text' ? 'Add page' : 'Add to crawl queue'))

const canSubmit = computed(() => {
  if (props.submitting) return false
  if (kind.value === 'website' || kind.value === 'sitemap') return url.value.trim().length > 0
  if (kind.value === 'pdf') return files.value.length > 0
  return title.value.trim().length > 0 && content.value.trim().length > 0
})

function normalizeUrl(raw: string): string {
  const v = raw.trim()
  // Leave an explicit scheme alone; otherwise assume https.
  return v.includes('://') ? v : `https://${v}`
}

function pickFiles() {
  fileInput.value?.click()
}

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) files.value = Array.from(input.files)
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  const dropped = event.dataTransfer?.files
  if (dropped && dropped.length) files.value = Array.from(dropped)
}

function submit() {
  if (!canSubmit.value) return
  if (kind.value === 'website') {
    emit('submit', { type: 'website', url: normalizeUrl(url.value), followLinks: followLinks.value })
  } else if (kind.value === 'sitemap') {
    emit('submit', { type: 'sitemap', url: normalizeUrl(url.value) })
  } else if (kind.value === 'pdf') {
    emit('submit', { type: 'pdf', files: files.value })
  } else {
    emit('submit', { type: 'text', title: title.value.trim(), content: content.value })
  }
}
</script>

<template>
  <div class="scrim" @click.self="emit('close')">
    <div class="modal" role="dialog" aria-modal="true" aria-label="Add knowledge source">
      <div class="modal__head">
        <div>
          <h3 class="modal__title">Add knowledge source</h3>
          <p class="modal__sub">Pick a source type — we crawl and index it in the background.</p>
        </div>
        <button class="icon-btn" type="button" aria-label="Close" @click="emit('close')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>

      <div class="types">
        <button
          v-for="t in types"
          :key="t.key"
          type="button"
          class="type"
          :class="{ 'type--active': kind === t.key }"
          @click="kind = t.key"
        >
          <span class="type__title">{{ t.title }}</span>
          <span class="type__sub">{{ t.sub }}</span>
        </button>
      </div>

      <div class="body">
        <!-- website -->
        <template v-if="kind === 'website'">
          <label class="field-label" for="kb-add-url">PAGE URL</label>
          <input id="kb-add-url" v-model="url" class="text-input" type="text"
            placeholder="https://docs.yourcompany.com/help" @keyup.enter="submit" />
          <label class="field-label">CRAWL SCOPE</label>
          <div class="scope">
            <button type="button" class="scope__opt" :class="{ 'scope__opt--active': !followLinks }"
              @click="followLinks = false">
              <span class="radio" :class="{ 'radio--on': !followLinks }"></span>
              <span>
                <span class="scope__title">This page only</span>
                <span class="scope__sub">Index just the URL above.</span>
              </span>
            </button>
            <button type="button" class="scope__opt" :class="{ 'scope__opt--active': followLinks }"
              @click="followLinks = true">
              <span class="radio" :class="{ 'radio--on': followLinks }"></span>
              <span>
                <span class="scope__title">Follow links on this domain</span>
                <span class="scope__sub">Discover and queue linked pages, up to your plan limit.</span>
              </span>
            </button>
          </div>
        </template>

        <!-- sitemap -->
        <template v-else-if="kind === 'sitemap'">
          <label class="field-label" for="kb-add-sitemap">SITEMAP URL</label>
          <input id="kb-add-sitemap" v-model="url" class="text-input" type="text"
            placeholder="https://yourcompany.com/sitemap.xml" @keyup.enter="submit" />
          <div class="note note--teal">
            We read the sitemap, then queue every listed page for crawling. Large sitemaps process in batches.
          </div>
        </template>

        <!-- document -->
        <template v-else-if="kind === 'pdf'">
          <div
            class="drop"
            :class="{ 'drop--over': dragOver }"
            @click="pickFiles"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="onDrop"
          >
            <input ref="fileInput" type="file" accept="application/pdf" multiple class="hidden-file"
              @change="onFilesSelected" />
            <span v-if="files.length" class="drop__name">{{ files.map((f) => f.name).join(', ') }}</span>
            <span v-else class="drop__name">Drop a PDF or click to browse</span>
            <span class="drop__hint">PDF files · up to 25 MB each</span>
          </div>
          <div class="note note--coral">
            We extract the text, split it into sections, and index each one. Scanned PDFs are run through OCR.
          </div>
        </template>

        <!-- text -->
        <template v-else>
          <label class="field-label" for="kb-add-title">TITLE</label>
          <input id="kb-add-title" v-model="title" class="text-input" type="text" placeholder="e.g. Refund policy" />
          <label class="field-label" for="kb-add-content">CONTENT</label>
          <textarea id="kb-add-content" v-model="content" class="textarea"
            placeholder="Paste or type the content your agents should learn…"></textarea>
        </template>
      </div>

      <div class="foot">
        <span class="foot__note">
          <span class="foot__dot" :class="willQueue ? 'foot__dot--queue' : 'foot__dot--instant'"></span>
          <template v-if="willQueue">Queued for crawling — you’ll be notified when it’s indexed.</template>
          <template v-else>Added instantly — no crawling needed.</template>
        </span>
        <div class="foot__actions">
          <button class="btn btn--ghost" type="button" :disabled="submitting" @click="emit('close')">Cancel</button>
          <button class="btn btn--primary" type="button" :disabled="!canSubmit" @click="submit">
            {{ submitting ? 'Adding…' : submitLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--scrim);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 20px;
  overflow-y: auto;
}

.modal {
  width: 560px;
  max-width: 100%;
  background: var(--bg2);
  border: 1px solid var(--o12);
  border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--o08);
}

.modal__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
  color: var(--text);
  margin: 0 0 4px;
}

.modal__sub {
  font-size: 13px;
  color: var(--muted);
  margin: 0;
}

.icon-btn {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--o08);
  color: var(--text2);
}

.types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  padding: 18px 24px 4px;
}

.type {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 13px;
  border-radius: 11px;
  cursor: pointer;
  text-align: left;
  background: transparent;
  border: 1.5px solid var(--o10);
}

.type:hover {
  background: var(--o04);
}

.type--active {
  background: var(--accent-bg-06);
  border-color: var(--accent-solid);
}

.type__title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text2);
}

.type__sub {
  font-size: 11.5px;
  color: var(--muted2);
  line-height: 1.3;
}

.body {
  padding: 16px 24px 4px;
  min-height: 172px;
}

.field-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.07em;
  color: var(--muted2);
  margin-bottom: 8px;
}

.field-label:not(:first-child) {
  margin-top: 16px;
}

.text-input,
.textarea {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: 11px;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--text);
  outline: none;
  font-family: var(--font-sans);
}

.textarea {
  min-height: 120px;
  line-height: 1.6;
  color: var(--text3);
  resize: vertical;
}

.text-input:focus,
.textarea:focus {
  border-color: var(--accent-border, var(--accent-ink));
}

.scope {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scope__opt {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  width: 100%;
  padding: 12px 13px;
  border-radius: 11px;
  cursor: pointer;
  text-align: left;
  background: transparent;
  border: 1.5px solid var(--o10);
}

.scope__opt--active {
  background: var(--accent-bg-06);
  border-color: var(--accent-solid);
}

.radio {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
  border-radius: 50%;
  border: 2px solid var(--o20);
}

.radio--on {
  border-color: var(--accent-solid);
  background: radial-gradient(circle, var(--accent-solid) 0 45%, transparent 48%);
}

.scope__title {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text2);
}

.scope__sub {
  display: block;
  font-size: 12px;
  color: var(--muted2);
  margin-top: 1px;
}

.drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 30px 20px;
  background: var(--bg);
  border: 1.5px dashed var(--o20);
  border-radius: 14px;
  cursor: pointer;
  text-align: center;
}

.drop--over {
  border-color: var(--c-coral);
  background: var(--coral-bg);
}

.hidden-file {
  display: none;
}

.drop__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text2);
  word-break: break-word;
}

.drop__hint {
  font-size: 12px;
  color: var(--muted2);
}

.note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 11px;
  font-size: 12.5px;
  color: var(--text3);
  line-height: 1.5;
  margin-top: 14px;
}

.note--teal {
  background: var(--teal-bg);
  border: 1px solid var(--teal-border);
}

.note--coral {
  background: var(--coral-bg);
  border: 1px solid var(--coral-border);
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 24px;
  border-top: 1px solid var(--o08);
  background: var(--surface);
}

.foot__note {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.4;
}

.foot__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.foot__dot--queue {
  background: var(--c-purple);
}

.foot__dot--instant {
  background: var(--c-teal);
}

.foot__actions {
  display: flex;
  gap: 9px;
  flex-shrink: 0;
}

.btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--ghost {
  background: transparent;
  border-color: var(--o12);
  color: var(--muted);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--o05);
}

.btn--primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.05);
}
</style>
