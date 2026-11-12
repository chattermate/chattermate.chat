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
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useKnowledgeManagement } from '@/composables/useKnowledgeManagement'
import { useStagedSourceCap } from '@/composables/useStagedSourceCap'
import { useCrawlCheck } from '@/composables/useCrawlCheck'
import { isPdfSource, queueItemName, useLearningWatch, withoutUploadPrefix } from '@/composables/useLearningWatch'
import TeachTextFallback from './TeachTextFallback.vue'
import type { QueueItem } from '@/types/knowledge'
import { organizationService } from '@/services/organization'

const props = defineProps<{
  agentId: string
  organizationId: string
  /** The assistant added a source: move on by itself once it has been read. */
  followAssistant?: boolean
}>()

const emit = defineEmits<{
  (e: 'next'): void
  (e: 'back'): void
}>()

const {
  newUrl,
  urls,
  files,
  fileInput,
  isUploading,
  uploadProgress,
  uploadError,
  urlFormError,
  knowledgeItems,
  orgTotalCount,
  queueItems,
  fetchQueueItems,
  handleUrlAdd,
  removeUrl,
  triggerFileInput,
  handleUrlUpload,
  handleFileUpload,
  fetchKnowledge,
  withScheme,
} = useKnowledgeManagement(props.agentId, props.organizationId)

const urlInput = ref<HTMLInputElement | null>(null)
const pasteButton = ref<HTMLButtonElement | null>(null)

const advancing = ref(false)
// Sending a batch with a website in it: the server checks it can be reached.
const reading = ref(false)
const textSaving = ref(false)
// Sending the sources, or waiting to hear whether they could be read: the
// batch is in flight, so nothing on the step may change it.
const busy = computed(() => advancing.value || isUploading.value || textSaving.value)

// A website from the last attempt that failed fast (e.g. a domain that doesn't
// resolve), shown with a way round it instead of moving on with nothing learned
const crawlFailure = ref<QueueItem | null>(null)
const showTextFallback = ref(false)
const { firstFailure, cancel: stopCrawlCheck } = useCrawlCheck(fetchQueueItems, queueItems)
onBeforeUnmount(stopCrawlCheck)

const setFailure = (failure: QueueItem | null) => {
  crawlFailure.value = failure
  showTextFallback.value = false
}

// Nothing new to send: Continue would move on without the site that failed.
const nothingStaged = computed(() => !urls.value.length && !files.value.length && !newUrl.value.trim())
const continueLabel = computed(() => {
  if (reading.value) return 'Reading your site…'
  if (advancing.value) return 'Adding…'
  return crawlFailure.value && nothingStaged.value ? 'Continue without it' : 'Continue'
})

// A source sent from here or by the setup assistant stays on the step while it
// is read, then turns into an indexed row or says why it couldn't be read. A
// failure already on screen stays: it may hold text they are pasting.
const handleLearned = async (ids: number[]) => {
  const failed = queueItems.value.find((q) => ids.includes(q.id) && q.status === 'failed')
  await fetchKnowledge()
  if (failed && !crawlFailure.value) setFailure(failed)
  moveOnIfLearned()
}
const { learning: crawling } = useLearningWatch(props.agentId, queueItems, handleLearned)

// The assistant has said to try the agent, and that happens on the next step.
// Anything unsent or unresolved here stays theirs to deal with.
const moveOnIfLearned = () => {
  const settled = !crawling.value.length && !crawlFailure.value && !busy.value && nothingStaged.value
  const learned = props.followAssistant && knowledgeItems.value.length > 0 && settled
  if (learned) emit('next')
  return learned
}

// Crawls still running count against the cap too (the server counts them).
const inUseCount = computed(() => orgTotalCount.value + crawling.value.length)
const { fitToCap } = useStagedSourceCap(inUseCount, urls, files)

// A newly staged source makes the last failure history: Continue sends it and
// checks again. `capError` is set when the plan had no room and nothing stayed.
const afterStaging = (capError: string | null) => {
  urlFormError.value = capError
  if (capError) return
  uploadError.value = null
  setFailure(null)
}

// Stage the typed URL, then keep the batch within the plan's source cap —
// over the cap the server rejects the whole batch, signup domain included.
const stageUrl = () => {
  const before = urls.value.length
  handleUrlAdd()
  if (urls.value.length > before) afterStaging(fitToCap('urls'))
}

// Picked PDFs join the list like URLs do, rather than replacing the last pick.
const stageFiles = (event: Event) => {
  const input = event.target as HTMLInputElement
  const picked = Array.from(input.files ?? [])
  // Cleared so picking the same file again (after removing it) still registers.
  input.value = ''
  if (!picked.length) return
  const fresh = picked.filter((f) => !files.value.some((s) => s.name === f.name && s.size === f.size))
  if (!fresh.length) {
    urlFormError.value = 'That PDF is already in the list.'
    return
  }
  files.value = [...files.value, ...fresh]
  afterStaging(fitToCap('files', fresh.length))
}

// Errors about the batch no longer describe it once a source is taken out. The
// × that had focus is gone with its row, so focus goes back to the address box.
const afterUnstaging = () => {
  urlFormError.value = null
  uploadError.value = null
  urlInput.value?.focus()
}

const unstageUrl = (index: number) => {
  removeUrl(index)
  afterUnstaging()
}

const unstageFile = (index: number) => {
  files.value.splice(index, 1)
  afterUnstaging()
}

// The site they gave us at signup is almost always what they want indexed
// first. Stage it as a source rather than dropping it in the input: sitting in
// the box it looks like a placeholder, and nothing says you must press
// "Add" for it to count. In the list it reads as added, with an × to
// drop it.
const prefillFromOrgDomain = async () => {
  try {
    const org = await organizationService.getOrganization(props.organizationId)
    if (!org?.domain || newUrl.value || urls.value.length) return
    const domainUrl = withScheme(org.domain)
    // Back from a later step, the domain may still be crawling — not indexed
    // yet, so the dedupe below can't see it. Staging it again would re-send it.
    // If it already failed, suggesting it again would only fail again. The
    // queue lists newest first, so this is its latest attempt.
    const last = queueItems.value.find((q) => q.source === domainUrl)
    if (last && last.status !== 'completed') return
    // The server only accepts websites with a full domain (acme.com, not
    // localhost): don't suggest one it will refuse.
    if (!new URL(domainUrl).hostname.includes('.')) return

    newUrl.value = domainUrl
    stageUrl()
    // stageUrl flags an already-indexed URL, or a plan with no room left. That
    // is worth saying when a person typed it, but not for a suggestion they
    // never asked for — it just ends up not staged.
    urlFormError.value = null
  } catch {
    // A missing prefill is not worth blocking or alarming the user over.
  }
}

// Back on this step with nothing learned yet and the last site unreadable
// (e.g. via "Add your website or some text" on the Test step): pick up where
// they left off, ways round it included.
const restoreLastFailure = () => {
  if (knowledgeItems.value.length || crawling.value.length || urls.value.length) return
  const [newest] = queueItems.value
  if (newest?.status === 'failed' && newest.source_type === 'website') setFailure(newest)
}

onMounted(async () => {
  // Prefill after the fetch so the dedupe check can see what is already indexed.
  await fetchKnowledge()
  // Pasted text is learned at once, so nothing is left to wait for.
  if (moveOnIfLearned()) return
  await prefillFromOrgDomain()
  restoreLastFailure()
})

// Flush any staged URLs/files, then advance — but only when the server took
// them. Ingestion itself runs async in the background; we don't wait on it.
const handleContinue = async () => {
  // A URL sitting in the box (the prefill, or one they typed without pressing
  // "Add") reads as accepted. Stage it rather than silently dropping it.
  if (newUrl.value.trim()) {
    stageUrl()
    if (urlFormError.value) return
  }

  advancing.value = true
  setFailure(null)
  let failed: QueueItem | null = null
  let filesAccepted = true
  try {
    const sentUrls = [...urls.value]
    reading.value = sentUrls.length > 0
    // On failure the error is on screen and the batch stays staged to fix.
    if (!(await handleUrlUpload())) return
    filesAccepted = await handleFileUpload()
    // The websites went in even if a PDF didn't: say now if one already failed.
    if (sentUrls.length) failed = await firstFailure(sentUrls)
  } finally {
    advancing.value = false
    reading.value = false
  }

  if (!failed) {
    if (filesAccepted) emit('next') // else the PDF error is on screen
    return
  }
  setFailure(failed)
  // Focus was on the button, disabled while it read the site. Trying another
  // address is the likeliest next move; the ways round it follow in tab order.
  await nextTick()
  urlInput.value?.focus()
}

const openTextFallback = () => {
  showTextFallback.value = true
}

const closeTextFallback = async () => {
  showTextFallback.value = false
  await nextTick()
  pasteButton.value?.focus()
}

const handleTextAdded = () => {
  setFailure(null)
  emit('next')
}
</script>

<template>
  <div class="step">
    <header class="step-head">
      <h2 class="step-title">Teach it your business</h2>
      <p class="step-sub">Drop a website URL or PDF — ChatterMate reads and indexes it automatically.</p>
    </header>

    <div class="source-input">
      <input
        ref="urlInput"
        v-model="newUrl"
        class="text-input mono"
        type="text"
        aria-label="Website address"
        placeholder="https://docs.yourcompany.com"
        :disabled="busy"
        @keydown.enter.prevent="stageUrl"
      />
      <!-- "Add" acts on the URL beside it, so the object is implicit. The PDF
           button opens a file picker, a different action — it keeps its own
           label rather than reading as a second way to add the same thing. -->
      <button type="button" class="btn-soft" :disabled="busy" @click="stageUrl">Add</button>
      <button type="button" class="btn-soft" :disabled="busy" @click="triggerFileInput">Upload PDF</button>
      <input
        ref="fileInput"
        type="file"
        accept="application/pdf"
        multiple
        hidden
        @change="stageFiles"
      />
    </div>

    <p v-if="urlFormError" class="step-error" role="alert">{{ urlFormError }}</p>

    <!-- Staged sources (this batch) -->
    <ul v-if="urls.length || files.length" class="source-list" aria-label="To add">
      <li v-for="(url, i) in urls" :key="`u-${url}`" class="source-row">
        <font-awesome-icon icon="fa-solid fa-globe" class="source-icon" aria-hidden="true" />
        <span class="source-name">{{ url }}</span>
        <button type="button" class="source-remove" :disabled="busy" :aria-label="`Remove ${url}`" @click="unstageUrl(i)">
          <font-awesome-icon icon="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </li>
      <li v-for="(file, i) in files" :key="`f-${file.name}-${file.size}`" class="source-row">
        <font-awesome-icon icon="fa-solid fa-file-pdf" class="source-icon" aria-hidden="true" />
        <span class="source-name">{{ file.name }}</span>
        <button type="button" class="source-remove" :disabled="busy" :aria-label="`Remove ${file.name}`" @click="unstageFile(i)">
          <font-awesome-icon icon="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </li>
    </ul>

    <!-- Sent, and being read now -->
    <ul v-if="crawling.length" class="source-list learning" aria-label="Learning">
      <li v-for="item in crawling" :key="item.id" class="source-row">
        <font-awesome-icon
          :icon="isPdfSource(item) ? 'fa-solid fa-file-pdf' : 'fa-solid fa-globe'"
          class="source-icon"
          aria-hidden="true"
        />
        <span class="source-name">{{ queueItemName(item) }}</span>
        <span class="source-tag pending">learning…</span>
      </li>
    </ul>

    <!-- Already indexed for this agent -->
    <ul v-if="knowledgeItems.length" class="source-list indexed" aria-label="Already added">
      <li v-for="item in knowledgeItems" :key="item.id" class="source-row">
        <font-awesome-icon icon="fa-solid fa-check" class="source-icon done" aria-hidden="true" />
        <span class="source-name">{{ withoutUploadPrefix(item.name) }}</span>
        <span class="source-tag">indexed</span>
      </li>
    </ul>

    <div
      v-if="isUploading"
      class="progress"
      role="progressbar"
      aria-label="Upload progress"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="uploadProgress"
    >
      <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
    </div>

    <p v-if="uploadError" class="step-error" role="alert">{{ uploadError }}</p>

    <div v-if="crawlFailure" class="crawl-failure">
      <p class="step-error" role="alert">We couldn't read {{ queueItemName(crawlFailure) }}. {{ crawlFailure.reason }}</p>
      <TeachTextFallback
        v-if="showTextFallback"
        :agent-id="agentId"
        :organization-id="organizationId"
        @added="handleTextAdded"
        @cancel="closeTextFallback"
        @busy="textSaving = $event"
      />
      <div v-else class="failure-actions">
        <button ref="pasteButton" type="button" class="btn-soft" :disabled="busy" @click="openTextFallback">
          Paste some text instead
        </button>
        <button type="button" class="btn-soft" :disabled="busy" @click="triggerFileInput">Upload a PDF</button>
      </div>
    </div>

    <div class="step-actions">
      <button type="button" class="btn-ghost" :disabled="busy" @click="emit('back')">Back</button>
      <button type="button" class="btn-accent" :disabled="busy" @click="handleContinue">
        {{ continueLabel }}
        <span v-if="!advancing" class="arrow" aria-hidden="true">→</span>
      </button>
    </div>
  </div>
</template>

<style scoped src="./step-controls.css"></style>
<style scoped>
.step {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.step-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 22px;
  margin: 0;
  color: var(--text);
}

.step-sub {
  font-size: 14.5px;
  color: var(--muted);
  margin: 0;
}

.source-input {
  display: flex;
  gap: 10px;
}

/* On a phone the address gets its own row rather than a sliver beside the buttons */
@media (max-width: 520px) {
  .source-input {
    flex-wrap: wrap;
  }

  .source-input .text-input {
    flex-basis: 100%;
  }
}

.text-input {
  flex: 1;
  min-width: 0;
  padding: 14px 16px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: var(--radius-input);
  color: var(--text);
  font-size: 14px;
  font-family: var(--font-sans);
  outline: none;
  transition: var(--transition-fast);
}

.text-input.mono {
  font-family: var(--font-mono);
}

.text-input:focus {
  border-color: var(--accent-ink);
  box-shadow: var(--ring-focus);
}

.source-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: var(--radius-input);
}

.source-icon {
  flex-shrink: 0;
  width: 14px;
  font-size: 14px;
  color: var(--muted);
}

.source-icon.done {
  color: var(--accent-ink);
}

.source-name {
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-tag {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--accent-ink);
}

.source-tag.pending {
  color: var(--muted);
}

.source-remove {
  background: none;
  border: none;
  color: var(--muted2);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  padding: 2px 4px;
}

.source-remove:hover:not(:disabled) {
  color: var(--text);
}

.source-remove:disabled {
  cursor: not-allowed;
}

.progress {
  height: 6px;
  background: var(--o08);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--accent-solid);
  transition: width 0.3s ease;
}

.crawl-failure {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--o12);
  border-radius: var(--radius-input);
}

.failure-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.btn-ghost {
  padding: 14px 22px;
  background: var(--o05);
  border: 1px solid var(--o14);
  border-radius: var(--radius-btn);
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--o10);
}

.btn-accent {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 26px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-btn);
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-accent:hover:not(:disabled) {
  filter: brightness(1.05);
}

.btn-accent:disabled,
.btn-ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.arrow {
  font-size: 17px;
}
</style>
