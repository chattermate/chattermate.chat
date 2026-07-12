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

const props = defineProps<{ logoUrl: string | null }>()

const emit = defineEmits<{
  upload: [file: File]
  remove: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const logoName = computed(() => {
  if (!props.logoUrl) return ''
  return props.logoUrl.split('/').pop()?.split('?')[0] || 'logo'
})

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('upload', file)
  input.value = ''
}
</script>

<template>
  <div>
    <input ref="fileInput" class="file-input" type="file" accept=".png,.svg" @change="onFileChange" />
    <div v-if="logoUrl" class="logo-row">
      <div class="logo-chip">
        <img class="logo-chip__img" :src="logoUrl" alt="Logo" />
        <div class="logo-chip__name">{{ logoName }}</div>
      </div>
      <button class="btn-sm" type="button" @click="fileInput?.click()">Replace</button>
      <button class="icon-btn" type="button" title="Remove logo" @click="$emit('remove')">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></svg>
      </button>
    </div>
    <button v-else class="upload-btn" type="button" @click="fileInput?.click()">
      <span class="upload-btn__icon">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4" /><path d="M8 8l4-4 4 4" /><path d="M4 20h16" /></svg>
      </span>
      <span>
        <span class="upload-btn__title">Upload your logo</span>
        <span class="upload-btn__sub">PNG or SVG, up to 2 MB · shown top-left</span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.file-input {
  display: none;
}

.logo-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 14px;
  background: var(--bg);
  border: 1px solid var(--o10);
  border-radius: 11px;
  margin-right: 6px;
  min-width: 0;
}

.logo-chip__img {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: contain;
  flex-shrink: 0;
}

.logo-chip__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-sm {
  padding: 9px 13px;
  background: var(--o05);
  border: 1px solid var(--o12);
  border-radius: 9px;
  color: var(--text2);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-sm:hover {
  background: var(--o08);
}

.icon-btn {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--o05);
  border: 1px solid var(--o12);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--coral-bg);
  color: var(--c-coral);
  border-color: var(--coral-border);
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: var(--bg);
  border: 1.5px dashed var(--o16);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  font-family: var(--font-sans);
}

.upload-btn:hover {
  border-color: var(--o30);
}

.upload-btn__icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--o05);
  border: 1px solid var(--o10);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}

.upload-btn__title {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text2);
}

.upload-btn__sub {
  display: block;
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}
</style>
