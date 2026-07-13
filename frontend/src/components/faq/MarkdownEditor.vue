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
import { computed, nextTick, ref } from 'vue'
import { marked } from 'marked'
import { toast } from 'vue-sonner'
import { faqService } from '@/services/faq'

const props = withDefaults(
  defineProps<{ modelValue: string; placeholder?: string }>(),
  { placeholder: 'Answer — Markdown supported (headings, **bold**, lists, links, images)' },
)
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const mode = ref<'write' | 'preview'>('write')
const uploading = ref(false)

// Preview renders in a sandboxed iframe (no allow-scripts): it safely shows
// images/links from the author's Markdown without executing anything, and
// sidesteps the app-wide DOMPurify hook that strips <img> elsewhere.
const previewDoc = computed(() => {
  const body = props.modelValue.trim()
    ? (marked.parse(props.modelValue, { breaks: true, async: false }) as string)
    : '<p style="color:#9aa0ad">Nothing to preview yet.</p>'
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.7;color:#2a303e;margin:14px;}
    h1,h2,h3,h4{font-weight:700;line-height:1.3;margin:20px 0 10px;color:#1a1b25;}
    h1{font-size:20px}h2{font-size:17px}h3{font-size:15px}
    a{color:#4338ca;font-weight:600}
    img{max-width:100%;height:auto;border-radius:10px;border:1px solid #ececf2;margin:6px 0}
    ul,ol{padding-left:22px}li{margin:4px 0}
    blockquote{margin:6px 0;padding:10px 14px;background:#f4f2fd;border-left:3px solid #6d5bd0;border-radius:8px}
    code{font-family:ui-monospace,monospace;background:#f1f2f6;border-radius:4px;padding:1px 5px}
    pre{background:#f1f2f6;border-radius:10px;padding:12px;overflow-x:auto}
    pre code{background:none;padding:0}
    table{border-collapse:collapse;width:100%}th,td{border:1px solid #ececf2;padding:6px 9px}
  </style></head><body>${body}</body></html>`
})

/** Replace the current selection (or insert at caret), then restore focus/caret. */
function replaceSelection(transform: (selected: string) => { text: string; caretOffset?: number }) {
  const el = textarea.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const value = props.modelValue
  const selected = value.slice(start, end)
  const { text, caretOffset } = transform(selected)
  const next = value.slice(0, start) + text + value.slice(end)
  emit('update:modelValue', next)
  const caret = caretOffset === undefined ? start + text.length : start + caretOffset
  nextTick(() => {
    el.focus()
    el.setSelectionRange(caret, caret)
  })
}

function wrap(before: string, after: string, placeholder: string) {
  replaceSelection((sel) => {
    const inner = sel || placeholder
    return { text: `${before}${inner}${after}`, caretOffset: before.length + inner.length }
  })
}

function prefixLine(prefix: string, placeholder: string) {
  replaceSelection((sel) => {
    const inner = sel || placeholder
    return { text: `${prefix}${inner}`, caretOffset: prefix.length + inner.length }
  })
}

function insertLink() {
  replaceSelection((sel) => {
    const label = sel || 'link text'
    return { text: `[${label}](https://)`, caretOffset: label.length + 3 }
  })
}

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploading.value = true
  try {
    const url = await faqService.uploadImage(file)
    const alt = file.name.replace(/\.[^.]+$/, '')
    replaceSelection(() => ({ text: `\n![${alt}](${url})\n` }))
  } catch (error: any) {
    toast.error(error?.message || 'Failed to upload image')
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="md-editor">
    <div class="md-toolbar">
      <div class="md-tools">
        <button type="button" class="md-btn" title="Heading" @click="prefixLine('## ', 'Heading')">H</button>
        <button type="button" class="md-btn md-btn--bold" title="Bold" @click="wrap('**', '**', 'bold')">B</button>
        <button type="button" class="md-btn" title="Bullet list" @click="prefixLine('- ', 'List item')">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="8" y1="18" x2="20" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>
        </button>
        <button type="button" class="md-btn" title="Link" @click="insertLink">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>
        </button>
        <button type="button" class="md-btn" title="Insert image" :disabled="uploading" @click="fileInput?.click()">
          <svg v-if="!uploading" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <span v-else class="md-spin"></span>
        </button>
        <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden @change="onFile" />
      </div>
      <div class="md-modes">
        <button type="button" class="md-mode" :class="{ 'md-mode--on': mode === 'write' }" @click="mode = 'write'">Write</button>
        <button type="button" class="md-mode" :class="{ 'md-mode--on': mode === 'preview' }" @click="mode = 'preview'">Preview</button>
      </div>
    </div>

    <textarea
      v-show="mode === 'write'"
      ref="textarea"
      class="md-textarea"
      rows="8"
      :placeholder="placeholder"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>

    <iframe v-show="mode === 'preview'" class="md-preview" :srcdoc="previewDoc" sandbox="" title="Answer preview"></iframe>
  </div>
</template>

<style scoped>
.md-editor {
  border: 1px solid var(--o12);
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg);
}

.md-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--o08);
  background: var(--o03);
}

.md-tools {
  display: flex;
  align-items: center;
  gap: 4px;
}

.md-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 13.5px;
  cursor: pointer;
}

.md-btn:hover {
  background: var(--o08);
  color: var(--text2);
}

.md-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.md-btn--bold {
  font-weight: 700;
}

.md-modes {
  display: flex;
  gap: 2px;
  background: var(--o05);
  border-radius: 8px;
  padding: 2px;
}

.md-mode {
  padding: 5px 11px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.md-mode--on {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.md-textarea {
  width: 100%;
  display: block;
  background: var(--bg);
  border: none;
  padding: 12px 13px;
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 13.5px;
  line-height: 1.6;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}

.md-preview {
  width: 100%;
  height: 240px;
  border: none;
  background: #fff;
  display: block;
}

.md-spin {
  width: 13px;
  height: 13px;
  border: 2px solid var(--o16);
  border-top-color: var(--c-purple);
  border-radius: 50%;
  animation: md-spin 0.7s linear infinite;
}

@keyframes md-spin {
  to { transform: rotate(360deg); }
}
</style>
