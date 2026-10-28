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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { marked } from 'marked'
import { sanitizeHtml } from '@/utils/sanitize'
import { orbSvgDataUri } from '@/utils/orb'
import { resolveUploadUrl } from '@/config/api'
import { themeCssVars } from '@/webclient/widget-theme'
import '@/webclient/widget-surface.css'
import { widgetService } from '@/services/widget'
import { knowledgeService } from '@/services/knowledge'
import { useOnboardingTestChat } from '@/composables/useOnboardingTestChat'
import { newestPerSource } from '@/composables/useCrawlCheck'
import type { QueueItem } from '@/types/knowledge'
import type { AgentCustomization } from '@/types/agent'

const props = defineProps<{
  agentId: string
  agentName: string
  widgetId: string | null
  customization?: AgentCustomization | null
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

// An empty chat leaves people unsure what to ask, and they move on without
// trying it. One click sends any of these; they suit every agent type.
const STARTER_QUESTIONS = [
  'What do you do?',
  'What can you help me with?',
  'How can I get in touch?',
]
const DEFAULT_WELCOME = 'Hi! How can I help you today?'

// Only these presets have rules of their own in the shared surface CSS
const SURFACE_THEME_CLASS: Record<string, string> = {
  GLASS: 'theme-glass',
  TERMINAL: 'theme-terminal',
}

const input = ref('')
const setupError = ref('')
const scrollEl = ref<HTMLElement | null>(null)

// The test chat wears the agent's widget theme (the same tokens and surface CSS
// as the real widget), so it reads as the chat their visitors will get.
const themeVars = computed(() =>
  themeCssVars(props.customization?.chat_style, props.customization ?? undefined)
)
const themeClass = computed(() => SURFACE_THEME_CLASS[props.customization?.chat_style ?? ''] ?? '')

const avatarUrl = computed(() =>
  props.customization?.photo_url
    ? resolveUploadUrl(props.customization.photo_url)
    : orbSvgDataUri(props.agentName, props.customization?.customization_metadata?.orb_variant)
)

const welcome = computed(() => props.customization?.welcome_message?.trim() || DEFAULT_WELCOME)

// Their own quick actions when they've set some, as the widget would show them
const starters = computed(() => {
  const own = (props.customization?.quick_actions ?? []).filter(a => a?.trim())
  return own.length ? own : STARTER_QUESTIONS
})

const chatError = computed(() => setupError.value || connectionError.value || '')

const showStarters = computed(() =>
  !messages.value.length && !loading.value && !connecting.value && !chatError.value
)

const presence = computed(() => {
  if (connecting.value) return 'Connecting to your agent…'
  return chatError.value ? 'Offline' : 'Online · replies instantly'
})

// Knowledge ingestion runs in the background. While it's queued/processing the
// agent can still answer general questions; we poll the queue and let the user
// know it'll get smarter once indexing finishes.
const knowledgeProcessing = ref(false)
const knowledgeJustFinished = ref(false)
// Nothing indexed and nothing indexing: answers can only be generic
const noKnowledge = ref(false)
// The newest source that failed, to say why when nothing was learned. A crawl
// often fails long after Teach moved on: this is where the user finds out.
const failure = ref<QueueItem | null>(null)
let knowledgePoll: ReturnType<typeof setInterval> | null = null

const checkKnowledgeStatus = async () => {
  try {
    const data = await knowledgeService.getAgentQueueItems(props.agentId)
    const items = (data?.queue_items ?? []) as QueueItem[]
    const pending = items.filter(i => i.status === 'pending' || i.status === 'processing').length
    failure.value = newestPerSource(items).find(i => i.status === 'failed') ?? null
    const wasProcessing = knowledgeProcessing.value
    knowledgeProcessing.value = pending > 0
    if (wasProcessing && pending === 0) {
      stopKnowledgePoll()
      // Finished is not the same as learned: every source may have failed
      await checkHasKnowledge()
      knowledgeJustFinished.value = !noKnowledge.value
    }
  } catch (err) {
    console.error('Failed to check knowledge status:', err)
  }
}

const checkHasKnowledge = async () => {
  if (knowledgeProcessing.value) return
  try {
    const page = await knowledgeService.getKnowledgeByAgent(props.agentId, 1, 1)
    noKnowledge.value = !(page?.pagination?.total_count || page?.knowledge?.length)
  } catch (err) {
    console.error('Failed to check agent knowledge:', err)
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
    const widget = await widgetService.createAgentWidget(props.agentId, props.agentName)
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
  await checkHasKnowledge()
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

const askStarter = (question: string) => {
  if (loading.value) return
  send(question)
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
        Still reading your knowledge. <strong>Ask a question now</strong> — answers get more
        specific as each page is added.
      </span>
    </div>
    <div v-else-if="knowledgeJustFinished" class="kb-note done">
      <span class="kb-check" aria-hidden="true">✓</span>
      <span>Knowledge indexed — your agent can now answer from it.</span>
    </div>
    <div v-else-if="noKnowledge" class="kb-note empty" role="status">
      <span>
        <template v-if="failure">We couldn't read {{ failure.source }}. {{ failure.reason }}</template>
        It hasn't learned anything about your business yet, so answers will be generic.
        <button type="button" class="kb-link" @click="emit('back')">Add your website or some text</button>
      </span>
    </div>

    <div class="test-window chat-container cm-surface" :class="themeClass" :style="themeVars">
      <div class="chat-panel">
        <div class="chat-header">
          <img :src="avatarUrl" :alt="agentName" class="header-avatar" />
          <div class="header-info">
            <h3>{{ agentName }}</h3>
            <span class="status">
              <span class="status-indicator" :class="{ online: !connecting && !chatError }"></span>
              <span class="status-text">{{ presence }}</span>
            </span>
          </div>
        </div>

        <div ref="scrollEl" class="chat-messages">
          <div v-if="!chatError" class="message agent-message">
            <img :src="avatarUrl" alt="" class="cm-msg-avatar-img" />
            <div class="message-bubble">{{ welcome }}</div>
          </div>
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="message"
            :class="msg.message_type === 'user' ? 'user-message' : 'agent-message'"
          >
            <img v-if="msg.message_type !== 'user'" :src="avatarUrl" alt="" class="cm-msg-avatar-img" />
            <div class="message-bubble" v-html="formatMessage(msg.message || '')"></div>
          </div>
          <div v-if="loading" class="message agent-message">
            <img :src="avatarUrl" alt="" class="cm-msg-avatar-img" />
            <div class="message-bubble typing" aria-label="Typing">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
          <p v-if="chatError" class="chat-error" role="alert">{{ chatError }}</p>
        </div>

        <div v-if="showStarters" class="cm-quick-actions-bar">
          <button
            v-for="question in starters"
            :key="question"
            type="button"
            class="cm-quick-action starter"
            @click="askStarter(question)"
          >
            {{ question }}
          </button>
        </div>

        <form class="chat-input" @submit.prevent="handleSend">
          <div class="message-input">
            <input
              v-model="input"
              type="text"
              placeholder="Type a message…"
              aria-label="Message your agent"
              :disabled="connecting || !!setupError"
            />
            <button
              type="submit"
              class="send-button"
              :disabled="connecting || loading || !!setupError"
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>
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

.kb-note.empty {
  border-color: var(--c-warn);
}

.kb-link {
  background: none;
  border: 0;
  padding: 0;
  color: var(--accent-ink);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
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

/* Structure only: colours, radii and fonts come from the shared widget surface
   (widget-surface.css + the --cm-* vars), exactly as on the real widget. */
.test-window {
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius);
  box-shadow: 0 24px 60px -30px var(--cm-glow);
  overflow: hidden;
}

.chat-panel {
  display: flex;
  flex-direction: column;
  height: 440px;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 11px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.header-info h3 {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cm-muted);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.chat-error {
  margin: auto;
  max-width: 320px;
  text-align: center;
  font-size: 13px;
  color: var(--cm-muted);
}

.typing {
  display: flex;
  gap: 4px;
  padding: 14px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cm-muted);
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.cm-quick-actions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 12px;
}

.cm-quick-action:focus-visible {
  outline: 2px solid var(--cm-accent);
  outline-offset: 2px;
}

.chat-input {
  padding: 12px 16px 14px;
}

.message-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-input input {
  flex: 1;
  min-width: 0;
  height: 42px;
  padding: 0 14px;
  outline: none;
}

.message-input input:disabled {
  opacity: 0.6;
}

.send-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.send-button:hover:not(:disabled) {
  filter: brightness(1.05);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.arrow {
  font-size: 17px;
}
</style>
