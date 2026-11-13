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
/**
 * The reply box for a conversation you hold. Enter sends, Shift+Enter breaks
 * the line. The attach control comes from the parent (#attach), which owns the
 * upload state it sends with the message.
 */
import { ref } from 'vue'

const message = defineModel<string>({ required: true })

defineProps<{
  canSend: boolean
  hasFiles: boolean
  /** WhatsApp's 24h window closed: only a template reopens it */
  showTemplateNotice: boolean
}>()

const emit = defineEmits<{
  (e: 'send'): void
  (e: 'paste', event: ClipboardEvent): void
  (e: 'send-template'): void
}>()

const input = ref<HTMLTextAreaElement | null>(null)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    emit('send')
  }
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div class="composer-wrap">
    <div v-if="showTemplateNotice" class="window-closed">
      <span>This customer's 24-hour window has closed. Send an approved template to reopen it.</span>
      <button type="button" class="btn" @click="emit('send-template')">Send template</button>
    </div>
    <div class="composer" :class="{ disabled: !canSend }" @paste="emit('paste', $event)">
      <textarea
        ref="input"
        v-model="message"
        rows="2"
        class="input"
        placeholder="Type a message or paste a screenshot"
        aria-label="Reply to the customer"
        :disabled="!canSend"
        @keydown="onKeydown"
      ></textarea>
      <div class="bar">
        <div class="tools">
          <slot name="attach" />
        </div>
        <div class="send-group">
          <kbd aria-hidden="true">↵</kbd>
          <button
            type="button"
            class="send"
            aria-label="Send"
            :disabled="!canSend || (!message.trim() && !hasFiles)"
            @click="emit('send')"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.composer-wrap {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 20px 16px;
}

.window-closed {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 8px 8px 8px 14px;
  border-radius: 12px;
  border: 1px solid var(--waiting-border);
  background: var(--waiting-bg);
  font-size: 13px;
  color: var(--text2);
}

.window-closed span {
  flex: 1 1 240px;
}

.composer {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid var(--o12);
  background: var(--surface);
}

.composer:focus-within {
  border-color: var(--accent-border);
}

.composer.disabled {
  opacity: 0.6;
}

.input {
  margin: 0;
  padding: 10px 14px 4px;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
}

.input::placeholder {
  color: var(--muted2);
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 8px 8px;
}

.tools {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
}

.send-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

kbd {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted2);
}

.send,
.btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.send {
  border: 0;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}

.send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn {
  border: 1px solid var(--o12);
  background: var(--surface);
  color: var(--text2);
}

.send:focus-visible,
.btn:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: 1px;
}

@media (max-width: 768px) {
  .composer-wrap {
    margin: 0 12px calc(12px + var(--safe-bottom, 0px));
  }

  kbd {
    display: none;
  }
}
</style>
