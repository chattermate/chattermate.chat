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
 * The box under the thread, in two modes. Reply writes to the customer (only
 * once you hold the chat; otherwise the Reply tab offers to take it over).
 * Note writes to the team: amber, never sent to the customer, and "@" picks a
 * teammate to mention. Enter sends, Shift+Enter breaks the line. The attach
 * control comes from the parent (#attach), which owns the upload state.
 */
import { computed, nextTick, ref, watch } from 'vue'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { navIconSvg } from '@/components/layout/navIcons'
import { matchMentionables, mentionQuery, mentionedIds, type Mentionable } from './mentions'

export type ComposerMode = 'reply' | 'note'

const message = defineModel<string>({ required: true })
const mode = defineModel<ComposerMode>('mode', { required: true })

const props = defineProps<{
  /** You hold the chat: replies go to the customer */
  canReply: boolean
  /** Not yours, but you may take it over: the Reply tab asks */
  canTakeOver: boolean
  canSend: boolean
  hasFiles: boolean
  /** WhatsApp's 24h window closed: only a template reopens it */
  showTemplateNotice: boolean
  teammates: Mentionable[]
}>()

const emit = defineEmits<{
  (e: 'send'): void
  (e: 'send-and-close'): void
  (e: 'send-note', body: string, mentions: string[]): void
  (e: 'take-over'): void
  (e: 'paste', event: ClipboardEvent): void
  (e: 'send-template'): void
}>()

const input = ref<HTMLTextAreaElement | null>(null)
const isNote = computed(() => mode.value === 'note')
const hasText = computed(() => !!message.value.trim())
const sendDisabled = computed(() =>
  isNote.value ? !hasText.value : (!props.canSend || (!hasText.value && !props.hasFiles))
)

function chooseReply() {
  if (props.canReply) mode.value = 'reply'
  else if (props.canTakeOver) emit('take-over')
}

// ---- @-mentions ----
const picked = ref<Mentionable[]>([])
const mention = ref<{ start: number; query: string } | null>(null)
const highlighted = ref(0)
const suggestions = computed(() =>
  isNote.value && mention.value ? matchMentionables(props.teammates, mention.value.query) : []
)

function updateMention() {
  const el = input.value
  mention.value = isNote.value && el ? mentionQuery(message.value, el.selectionStart ?? message.value.length) : null
  highlighted.value = 0
}

async function pick(person: Mentionable) {
  const el = input.value
  if (!mention.value || !el) return
  const caret = el.selectionStart ?? message.value.length
  const start = mention.value.start
  const insert = `@${person.name} `
  message.value = message.value.slice(0, start) + insert + message.value.slice(caret)
  picked.value = [...picked.value.filter((p) => p.id !== person.id), person]
  mention.value = null
  // After the inserted mention, ready to keep typing
  await nextTick()
  el.focus()
  el.setSelectionRange(start + insert.length, start + insert.length)
}

// The note was sent (the parent cleared it): forget the mentions picked for it.
// An empty box in Reply mode is the other draft, not a sent note.
watch(message, (text) => { if (!text && isNote.value) picked.value = [] })
watch(mode, () => { mention.value = null })

function submit() {
  if (sendDisabled.value) return
  if (isNote.value) emit('send-note', message.value.trim(), mentionedIds(message.value, picked.value))
  else emit('send')
}

function onKeydown(event: KeyboardEvent) {
  if (suggestions.value.length) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      highlighted.value = (highlighted.value + step + suggestions.value.length) % suggestions.value.length
      return
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      void pick(suggestions.value[highlighted.value])
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      mention.value = null
      return
    }
  }
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    submit()
  }
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div class="composer-wrap">
    <div v-if="showTemplateNotice && !isNote" class="window-closed">
      <span>This customer's 24-hour window has closed. Send an approved template to reopen it.</span>
      <button type="button" class="btn" @click="emit('send-template')">Send template</button>
    </div>
    <div class="composer" :class="{ note: isNote, disabled: !isNote && !canSend }" @paste="emit('paste', $event)">
      <div class="head">
        <div class="tabs" role="tablist" aria-label="Message type">
          <button
            type="button"
            role="tab"
            class="tab"
            :aria-selected="!isNote"
            :disabled="!canReply && !canTakeOver"
            :title="canReply ? undefined : 'Take the chat over to reply'"
            @click="chooseReply"
          >Reply</button>
          <button type="button" role="tab" class="tab" :aria-selected="isNote" @click="mode = 'note'">Note</button>
        </div>
        <span class="caption">
          {{ isNote ? 'Only your team sees notes · @ to mention' : canReply ? 'The customer sees this' : '' }}
        </span>
      </div>

      <div class="field">
        <textarea
          ref="input"
          v-model="message"
          rows="2"
          class="input"
          :placeholder="isNote ? 'Write a note for your team' : 'Type a message or paste a screenshot'"
          :aria-label="isNote ? 'Note for your team' : 'Reply to the customer'"
          :disabled="!isNote && !canSend"
          :aria-expanded="suggestions.length > 0"
          aria-autocomplete="list"
          :aria-controls="suggestions.length ? 'mention-suggestions' : undefined"
          :aria-activedescendant="suggestions.length ? `mention-${suggestions[highlighted].id}` : undefined"
          @keydown="onKeydown"
          @input="updateMention"
          @click="updateMention"
        ></textarea>
        <ul v-if="suggestions.length" id="mention-suggestions" class="mentions" role="listbox" aria-label="Mention a teammate">
          <li
            v-for="(person, index) in suggestions"
            :id="`mention-${person.id}`"
            :key="person.id"
            role="option"
            class="mention-option"
            :aria-selected="index === highlighted"
            @mousedown.prevent="pick(person)"
          >{{ person.name }}</li>
        </ul>
      </div>

      <div class="bar">
        <div class="tools">
          <slot v-if="!isNote" name="attach" />
        </div>
        <div class="send-group">
          <kbd aria-hidden="true">↵</kbd>
          <div class="split">
            <button
              type="button"
              class="send"
              :aria-label="isNote ? 'Add note' : 'Send'"
              :disabled="sendDisabled"
              @click="submit"
            >{{ isNote ? 'Add note' : 'Send' }}</button>
            <ActionMenu
              v-if="!isNote && canSend && (hasText || hasFiles)"
              label="More send options"
              :items="[{ id: 'send-and-close', label: 'Send and close' }]"
              trigger-class="send-more"
              @select="emit('send-and-close')"
            >
              <span aria-hidden="true" v-html="navIconSvg('chevronDown', 12)"></span>
            </ActionMenu>
          </div>
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

.composer.note {
  border-color: var(--waiting-border);
  background: color-mix(in srgb, var(--c-warn) 6%, var(--surface));
}

.composer.disabled {
  opacity: 0.6;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px 0;
}

.tabs {
  display: flex;
  gap: 4px;
}

.tab {
  height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.tab[aria-selected='true'] {
  background: var(--o08);
  color: var(--text);
}

.composer.note .tab[aria-selected='true'] {
  background: var(--waiting-bg);
  color: var(--c-warn);
}

.tab:disabled {
  color: var(--muted2);
  cursor: not-allowed;
}

.caption {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--muted2);
}

.field {
  position: relative;
}

.input {
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 8px 14px 4px;
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

.mentions {
  position: absolute;
  left: 12px;
  bottom: calc(100% + 4px);
  z-index: var(--z-dropdown, 50);
  min-width: 200px;
  margin: 0;
  padding: 6px;
  list-style: none;
  border-radius: 10px;
  border: 1px solid var(--o10);
  background: var(--surface);
  box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.3));
}

.mention-option {
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
}

.mention-option[aria-selected='true'],
.mention-option:hover {
  background: var(--o08);
  color: var(--text);
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

.split {
  display: flex;
}

.split :deep(.action-menu) {
  display: flex;
}

.split .send:not(:only-child) {
  border-radius: 8px 0 0 8px;
}

.split :deep(.send-more) {
  width: 28px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-left: 1px solid color-mix(in srgb, var(--on-accent-solid) 20%, transparent);
  border-radius: 0 8px 8px 0;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  cursor: pointer;
}

.split :deep(.menu) {
  top: auto;
  bottom: calc(100% + 6px);
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

.composer.note .send {
  background: var(--c-warn);
  color: var(--on-warn);
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
.btn:focus-visible,
.tab:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: 1px;
}

@media (max-width: 768px) {
  .composer-wrap {
    margin: 0 12px calc(12px + var(--safe-bottom, 0px));
  }

  kbd,
  .caption {
    display: none;
  }
}
</style>
