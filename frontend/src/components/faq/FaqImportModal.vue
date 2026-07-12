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
import Modal from '@/components/common/Modal.vue'
import FaqOrb from './FaqOrb.vue'

const props = defineProps<{
  open: boolean
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [url: string]
}>()

const url = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) url.value = ''
  },
)

const canSubmit = computed(() => url.value.trim().length > 0 && !props.submitting)

function submit() {
  if (!canSubmit.value) return
  const cleaned = url.value.trim().replace(/^https?:\/\//i, '')
  emit('submit', `https://${cleaned}`)
}
</script>

<template>
  <Modal v-if="open" @close="$emit('close')">
    <template #title>Migrate an existing FAQ page</template>
    <template #content>
      <p class="import-sub">Paste a help-center or FAQ URL — we detect every question &amp; answer pair.</p>
      <label class="import-label" for="faq-import-url">FAQ PAGE URL</label>
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
      <div class="import-hint">
        <FaqOrb :size="34" />
        <div>
          ChatterMate crawls the page, extracts each question and answer, and adds them here as
          drafts for you to review before publishing.
        </div>
      </div>
      <div class="import-actions">
        <button class="btn-cancel" type="button" @click="$emit('close')">Cancel</button>
        <button class="btn-import" type="button" :disabled="!canSubmit" @click="submit">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12" /><path d="M8 11l4 4 4-4" /><path d="M5 21h14" /></svg>
          {{ submitting ? 'Importing…' : 'Import FAQs' }}
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
