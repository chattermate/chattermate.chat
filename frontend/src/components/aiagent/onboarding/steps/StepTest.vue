<!--
ChatterMate - Onboarding Step: Test
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
-->

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { marked } from 'marked'
import { sanitizeHtml } from '@/utils/sanitize'
import { widgetService } from '@/services/widget'
import { knowledgeService } from '@/services/knowledge'
import { useOnboardingTestChat } from '@/composables/useOnboardingTestChat'

const props = defineProps<{
  agentId: string
  agentName: string
  widgetId: string | null
}>()

const emit = defineEmits<{
  (e: 'next'): void
  (e: 'back'): void
  (e: 'widget-created', widgetId: string): void
}>()

const {
  messages,
  loading,
  connecting,
  connectionError,
  start,
  send,
  cleanup,
} = useOnboardingTestChat()

const input = ref('')
const setupError = ref('')
const scrollEl = ref<HTMLElement | null>(null)

// Knowledge ingestion runs in the background. While it's queued/processing the
// agent can still answer general questions; we poll the queue and let the user
// know it'll get smarter once indexing finishes.
const knowledgeProcessing = ref(false)
const knowledgeJustFinished = ref(false)
let knowledgePoll: ReturnType<typeof setInterval> | null = null

const checkKnowledgeStatus = async () => {
  try {
    const data = await knowledgeService.getAgentQueueItems(props.agentId)
    const items = (data?.queue_items ?? []) as Array<{ status: string }>
    const pending = items.filter(i => i.status === 'pending' || i.status === 'processing').length
    const wasProcessing = knowledgeProcessing.value
    knowledgeProcessing.value = pending > 0
    if (wasProcessing && pending === 0) {
      knowledgeJustFinished.value = true
      stopKnowledgePoll()
    }
  } catch (err) {
    console.error('Failed to check knowledge status:', err)
  }
}

const stopKnowledgePoll = () => {
  if (knowledgePoll) {
    clearInterval(knowledgePoll)
    knowledgePoll = null
  }
}

const ensureWidget = async (): Promise<string | null> => {
  if (props.widgetId) return props.widgetId
  try {
    const widget = await widgetService.createWidget({
      name: `${props.agentName} Widget`,
      agent_id: props.agentId,
    })
    emit('widget-created', widget.id)
    return widget.id
  } catch (err: any) {
    setupError.value = err?.response?.data?.detail || 'Failed to prepare a test session.'
    return null
  }
}

onMounted(async () => {
  const widgetId = await ensureWidget()
  if (widgetId) await start(widgetId)
  // Watch the knowledge queue and poll while anything is still indexing
  await checkKnowledgeStatus()
  if (knowledgeProcessing.value) {
    knowledgePoll = setInterval(checkKnowledgeStatus, 5000)
  }
})

onBeforeUnmount(() => {
  cleanup()
  stopKnowledgePoll()
})

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  })
}

watch(() => messages.value.length, scrollToBottom)
watch(loading, scrollToBottom)

const handleSend = () => {
  const text = input.value.trim()
  if (!text || loading.value) return
  send(text)
  input.value = ''
}

const formatMessage = (content: string) => sanitizeHtml(marked(content) as string)
</script>

<template>
  <div class="step">
    <header class="step-head">
      <h2 class="step-title">Try it out</h2>
      <p class="step-sub">Ask a question the way a customer would. This is exactly how it'll answer.</p>
    </header>

    <!-- Knowledge indexing status -->
    <div v-if="knowledgeProcessing" class="kb-note processing">
      <span class="kb-spinner" aria-hidden="true"></span>
      <span>
        Your knowledge is still being indexed in the background. Your agent can answer
        <strong>general questions</strong> now — knowledge-based answers will kick in once it's done,
        and we'll notify you.
      </span>
    </div>
    <div v-else-if="knowledgeJustFinished" class="kb-note done">
      <span class="kb-check" aria-hidden="true">✓</span>
      <span>Knowledge indexed — your agent can now answer from it.</span>
    </div>

    <div class="test-chat">
      <div v-if="connecting" class="chat-state">Connecting to your agent…</div>
      <div v-else-if="setupError || connectionError" class="chat-state error">
        {{ setupError || connectionError }}
      </div>

      <div ref="scrollEl" class="chat-scroll">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="bubble-row"
          :class="msg.message_type === 'user' ? 'from-user' : 'from-bot'"
        >
          <div class="bubble" v-html="formatMessage(msg.message || '')"></div>
        </div>
        <div v-if="loading" class="bubble-row from-bot">
          <div class="bubble typing">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-compose">
      <input
        v-model="input"
        class="text-input"
        type="text"
        placeholder="Ask your agent anything…"
        :disabled="connecting || !!setupError"
        @keydown.enter.prevent="handleSend"
      />
      <button type="button" class="send-btn" :disabled="connecting || loading || !!setupError" @click="handleSend" aria-label="Send">↑</button>
    </div>

    <div class="step-actions">
      <button type="button" class="btn-ghost" @click="emit('back')">Back</button>
      <button type="button" class="btn-accent" @click="emit('next')">
        Looks good <span class="arrow">→</span>
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

.kb-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 11px;
  font-size: 13px;
  line-height: 1.5;
}

.kb-note.processing {
  background: var(--purple-bg);
  border: 1px solid var(--purple-border);
  color: var(--text3);
}

.kb-note.done {
  background: var(--accent-bg-08);
  border: 1px solid var(--accent-border);
  color: var(--text3);
}

.kb-note strong {
  color: var(--text);
  font-weight: 600;
}

.kb-spinner {
  width: 14px;
  height: 14px;
  margin-top: 2px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid var(--o20);
  border-top-color: var(--c-purple);
  animation: kb-spin 0.8s linear infinite;
}

.kb-check {
  margin-top: 1px;
  flex-shrink: 0;
  color: var(--accent-ink);
  font-weight: 700;
}

@keyframes kb-spin {
  to { transform: rotate(360deg); }
}

.test-chat {
  background: var(--bg);
  border: 1px solid var(--o10);
  border-radius: var(--radius-input);
  overflow: hidden;
}

.chat-state {
  padding: 12px 16px;
  font-size: 13px;
  color: var(--muted);
  border-bottom: 1px solid var(--o08);
}

.chat-state.error {
  color: var(--error-color);
}

.chat-scroll {
  height: 300px;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bubble-row {
  display: flex;
  max-width: 85%;
}

.from-user {
  align-self: flex-end;
}

.from-bot {
  align-self: flex-start;
}

.bubble {
  padding: 10px 14px;
  font-size: 13.5px;
  line-height: 1.5;
  border-radius: 14px 14px 14px 4px;
}

.from-bot .bubble {
  background: var(--surface);
  border: 1px solid var(--o08);
  color: var(--text);
}

.from-user .bubble {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-radius: 14px 14px 4px 14px;
}

.typing {
  display: flex;
  gap: 4px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--muted2);
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-compose {
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
  font-size: 15px;
  font-family: var(--font-sans);
  outline: none;
  transition: var(--transition-fast);
}

.text-input:focus {
  border-color: var(--accent-ink);
  box-shadow: var(--ring-focus);
}

.send-btn {
  flex-shrink: 0;
  width: 50px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-input);
  font-size: 18px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.send-btn:hover:not(:disabled) {
  filter: brightness(1.05);
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

.btn-ghost:hover {
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

.btn-accent:hover {
  filter: brightness(1.05);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.arrow {
  font-size: 17px;
}
</style>
