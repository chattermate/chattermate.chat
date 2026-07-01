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
import { onMounted, ref } from 'vue'
import { useKnowledgeManagement } from '@/composables/useKnowledgeManagement'

const props = defineProps<{
  agentId: string
  organizationId: string
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
  successMessage,
  knowledgeItems,
  handleUrlAdd,
  removeUrl,
  triggerFileInput,
  handleFileSelect,
  handleUrlUpload,
  handleFileUpload,
  fetchKnowledge,
} = useKnowledgeManagement(props.agentId, props.organizationId)

const advancing = ref(false)

onMounted(() => {
  fetchKnowledge()
})

// Flush any staged URLs/files, then advance. Ingestion runs async in the
// background — we don't block the wizard on it.
const handleContinue = async () => {
  advancing.value = true
  try {
    if (urls.value.length) await handleUrlUpload()
    if (files.value.length) await handleFileUpload()
  } finally {
    advancing.value = false
    emit('next')
  }
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
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
        v-model="newUrl"
        class="text-input mono"
        type="text"
        placeholder="https://docs.yourcompany.com"
        :disabled="isUploading"
        @keydown.enter.prevent="handleUrlAdd"
      />
      <button type="button" class="btn-soft" :disabled="isUploading" @click="handleUrlAdd">+ Website</button>
      <button type="button" class="btn-soft" :disabled="isUploading" @click="triggerFileInput">+ PDF</button>
      <input
        ref="fileInput"
        type="file"
        accept="application/pdf"
        multiple
        hidden
        @change="handleFileSelect"
      />
    </div>

    <p v-if="urlFormError" class="step-error">{{ urlFormError }}</p>

    <!-- Staged sources (this batch) -->
    <ul v-if="urls.length || files.length" class="source-list">
      <li v-for="(url, i) in urls" :key="`u-${i}`" class="source-row">
        <span class="source-icon" aria-hidden="true">🌐</span>
        <span class="source-name">{{ url }}</span>
        <button type="button" class="source-remove" :disabled="isUploading" @click="removeUrl(i)" aria-label="Remove">×</button>
      </li>
      <li v-for="(file, i) in files" :key="`f-${i}`" class="source-row">
        <span class="source-icon" aria-hidden="true">📄</span>
        <span class="source-name">{{ file.name }}</span>
        <button type="button" class="source-remove" :disabled="isUploading" @click="removeFile(i)" aria-label="Remove">×</button>
      </li>
    </ul>

    <!-- Already indexed for this agent -->
    <ul v-if="knowledgeItems.length" class="source-list indexed">
      <li v-for="item in knowledgeItems" :key="item.id" class="source-row">
        <span class="source-icon" aria-hidden="true">✓</span>
        <span class="source-name">{{ item.name }}</span>
        <span class="source-tag">indexed</span>
      </li>
    </ul>

    <div v-if="isUploading" class="progress">
      <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
    </div>

    <p v-if="successMessage" class="step-hint">{{ successMessage }} Processing in the background — you can continue.</p>
    <p v-if="uploadError" class="step-error">{{ uploadError }}</p>

    <div class="step-actions">
      <button type="button" class="btn-ghost" :disabled="advancing || isUploading" @click="emit('back')">Back</button>
      <button type="button" class="btn-accent" :disabled="advancing || isUploading" @click="handleContinue">
        {{ advancing ? 'Saving…' : 'Continue' }}
        <span v-if="!advancing" class="arrow">→</span>
      </button>
    </div>
  </div>
</template>

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

.btn-soft {
  flex-shrink: 0;
  padding: 14px 18px;
  background: var(--o06);
  border: 1px solid var(--o14);
  border-radius: var(--radius-input);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition-fast);
}

.btn-soft:hover:not(:disabled) {
  background: var(--o10);
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
  font-size: 14px;
  flex-shrink: 0;
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

.source-remove {
  background: none;
  border: none;
  color: var(--muted2);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}

.source-remove:hover:not(:disabled) {
  color: var(--text);
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

.step-hint {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.step-error {
  margin: 0;
  font-size: 13.5px;
  color: var(--error-color);
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
.btn-ghost:disabled,
.btn-soft:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.arrow {
  font-size: 17px;
}
</style>
