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
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { ticketService } from '@/services/tickets'
import type { TicketDetail, TicketPriority } from '@/types/ticket'
import { PRIORITIES, priorityMeta } from './ticketMeta'

const props = defineProps<{
  open: boolean
  // Present when creating from a conversation: enables the AI-drafted prefill.
  sessionId?: string | null
  sessionLabel?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', detail: TicketDetail): void
}>()

const title = ref('')
const description = ref('')
const priority = ref<TicketPriority>('medium')
const fromConversation = ref(false)
const isDrafting = ref(false)
const isSubmitting = ref(false)

watch(
  () => props.open,
  (open) => {
    if (open) {
      title.value = ''
      description.value = ''
      priority.value = 'medium'
      fromConversation.value = false
      if (props.sessionId) useConversationDraft()
    }
  },
)

async function useConversationDraft() {
  if (!props.sessionId) return
  fromConversation.value = true
  isDrafting.value = true
  try {
    const draft = await ticketService.draftFromSession(props.sessionId)
    if (!title.value) title.value = draft.title
    if (!description.value) description.value = draft.description
  } catch {
    // Draft is best-effort; the form still works blank.
  } finally {
    isDrafting.value = false
  }
}

async function submit() {
  if (!title.value.trim() || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const detail = await ticketService.createTicket({
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      priority: priority.value,
      session_id: fromConversation.value && props.sessionId ? props.sessionId : undefined,
    })
    toast.success(`Ticket ${detail.ticket.display_number} created`)
    emit('created', detail)
    emit('close')
  } catch (e: any) {
    toast.error(e?.message || 'Failed to create the ticket')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click="emit('close')">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">New ticket</div>
          <button class="close-btn" @click="emit('close')">×</button>
        </div>
        <div class="modal-body">
          <div v-if="sessionId" class="source-toggle">
            <button
              class="source-option"
              :class="{ active: !fromConversation }"
              @click="fromConversation = false"
            >
              Blank
            </button>
            <button
              class="source-option"
              :class="{ active: fromConversation }"
              @click="useConversationDraft"
            >
              From conversation
            </button>
          </div>

          <div v-if="fromConversation" class="draft-note">
            <span class="draft-glyph">✎</span>
            <span v-if="isDrafting">Drafting from the conversation…</span>
            <span v-else>
              Drafted from
              <span class="mono">{{ sessionLabel || 'the conversation' }}</span>
              — edit anything.
            </span>
          </div>

          <label class="field-label">Title</label>
          <input
            v-model="title"
            class="field-input"
            placeholder="Short summary of the issue…"
            maxlength="500"
          />

          <label class="field-label">Description</label>
          <textarea
            v-model="description"
            class="field-textarea"
            placeholder="What's happening? Include any error, customer impact, and steps…"
          ></textarea>

          <label class="field-label">Priority</label>
          <div class="priority-pills">
            <button
              v-for="p in PRIORITIES"
              :key="p"
              class="priority-pill"
              :class="{ active: priority === p }"
              :style="{ '--pill-color': priorityMeta(p).color }"
              @click="priority = p"
            >
              <span class="dot"></span>{{ priorityMeta(p).label }}
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="emit('close')">Cancel</button>
          <button class="btn-primary" :disabled="!title.trim() || isSubmitting" @click="submit">
            {{ isSubmitting ? 'Creating…' : 'Create ticket' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--scrim, rgba(4, 5, 8, 0.62));
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 8vh 20px 20px;
}
.modal {
  width: 560px;
  max-width: 100%;
  background: var(--bg2);
  border: 1px solid var(--o12);
  border-radius: 18px;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--o07);
}
.modal-title {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: 17px;
  color: var(--text);
}
.close-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  cursor: pointer;
  font-size: 16px;
}
.modal-body {
  padding: 22px;
}
.source-toggle {
  display: flex;
  gap: 5px;
  padding: 3px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 10px;
  margin-bottom: 18px;
}
.source-option {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 7px;
  font-size: 12.5px;
  cursor: pointer;
  background: transparent;
  color: var(--muted);
}
.source-option.active {
  background: var(--o08);
  color: var(--text);
  font-weight: var(--font-weight-semibold);
}
.draft-note {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  background: var(--accent-bg-08);
  border: 1px solid var(--accent-border);
  border-radius: 11px;
  margin-bottom: 16px;
  font-size: 12px;
  color: var(--text3);
  line-height: 1.4;
}
.draft-glyph {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 6px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.mono {
  font-family: var(--font-mono);
  color: var(--text);
}
.field-label {
  display: block;
  font-size: 11.5px;
  color: var(--faint);
  margin-bottom: 6px;
}
.field-input,
.field-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 10px;
  color: var(--text);
  font-size: 13.5px;
  outline: none;
  margin-bottom: 16px;
}
.field-textarea {
  min-height: 96px;
  resize: vertical;
  line-height: 1.5;
}
.priority-pills {
  display: flex;
  gap: 8px;
}
.priority-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  border: 1px solid var(--o10);
  background: var(--surface);
  color: var(--muted);
}
.priority-pill .dot {
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--pill-color);
}
.priority-pill.active {
  border-color: var(--pill-color);
  color: var(--pill-color);
  background: var(--o05);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid var(--o07);
  background: var(--surface);
}
.btn-secondary {
  padding: 9px 17px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--text);
  border-radius: 9px;
  font-size: 13px;
  cursor: pointer;
}
.btn-primary {
  padding: 9px 20px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: 9px;
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
