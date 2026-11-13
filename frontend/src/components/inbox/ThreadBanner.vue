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
 * Who is answering, and the action that changes it. Yours: the AI is paused,
 * hand it back. Waiting: for how long, assign or take it over. The AI's: take
 * it over or hand it to the team. Someone else's, or closed: just which.
 */
import { computed } from 'vue'
import type { ChatDetail } from '@/types/chat'
import { chatHandler } from '@/utils/chatState'
import { navIconSvg } from '@/components/layout/navIcons'
import ActionMenu, { type ActionMenuItem } from '@/components/common/ActionMenu.vue'
import { customerName } from './inboxPresentation'
import { WAITING_LATE_MINUTES, minutesSince, waitDuration } from './inboxTime'

const props = defineProps<{
  chat: ChatDetail
  currentUserId: string | null
  now: Date
  /** May take chats over (and so hand them to the team or back to the AI) */
  canManage: boolean
  /** Teammates to assign a waiting chat to; null when the viewer can't */
  assignees: ActionMenuItem[] | null
  busy: boolean
}>()

const emit = defineEmits<{
  (e: 'take-over'): void
  (e: 'release'): void
  (e: 'route-to-team'): void
  (e: 'assign', userId: string): void
}>()

const handler = computed(() => chatHandler(props.chat, props.currentUserId))
const agentName = computed(() => props.chat.agent.display_name || props.chat.agent.name || 'The AI')
const aiCapable = computed(() => props.chat.agent.ai_replies_enabled !== false)
const isMine = computed(() => handler.value.kind === 'human' && props.chat.user_id === props.currentUserId)

const waitedMinutes = computed(() => {
  const since = props.chat.handed_over_at || props.chat.updated_at
  return since ? minutesSince(since, props.now) : 0
})
const late = computed(() => waitedMinutes.value >= WAITING_LATE_MINUTES)

const variant = computed(() => {
  if (handler.value.kind === 'closed') return 'closed'
  if (isMine.value) return 'mine'
  return handler.value.kind
})
</script>

<template>
  <div v-if="variant === 'mine'" class="banner mine" role="status">
    <span class="icon" aria-hidden="true" v-html="navIconSvg('pause', 14)"></span>
    <span class="text">
      {{ aiCapable ? `${agentName} is paused while you handle this chat` : 'You are handling this chat' }}
    </span>
    <button v-if="aiCapable && canManage" type="button" class="btn" :disabled="busy" @click="emit('release')">
      Hand back to AI
    </button>
  </div>

  <div v-else-if="variant === 'waiting'" class="banner waiting" :class="{ late }" role="status">
    <span class="icon" aria-hidden="true" v-html="navIconSvg('clock', 18)"></span>
    <span class="text">
      <strong>{{ customerName(chat.customer) }} has been waiting {{ waitDuration(waitedMinutes) }}.</strong>
      {{ aiCapable ? ` ${agentName} handed this over.` : ' Nobody has picked it up yet.' }}
    </span>
    <ActionMenu
      v-if="assignees && assignees.length"
      label="Assign to…"
      :items="assignees"
      trigger-class="btn"
      @select="emit('assign', $event)"
    >Assign to…</ActionMenu>
    <button v-if="canManage" type="button" class="btn primary" :disabled="busy" @click="emit('take-over')">
      Take over chat
    </button>
  </div>

  <div v-else-if="variant === 'ai'" class="banner ai" role="status">
    <span class="icon" aria-hidden="true" v-html="navIconSvg('sparkle', 14)"></span>
    <span class="text">{{ agentName }} is answering this chat</span>
    <button v-if="canManage" type="button" class="btn" :disabled="busy" @click="emit('route-to-team')">
      Hand to my team
    </button>
    <button v-if="canManage" type="button" class="btn primary" :disabled="busy" @click="emit('take-over')">
      Take over chat
    </button>
  </div>

  <div v-else-if="variant === 'human'" class="banner" role="status">
    <span class="text">{{ handler.label }} is handling this chat</span>
  </div>

  <div v-else class="banner" role="status">
    <span class="icon" aria-hidden="true" v-html="navIconSvg('check', 14)"></span>
    <span class="text">This conversation is closed</span>
  </div>
</template>

<style scoped>
.banner {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin: 0 20px 16px;
  padding: 8px 8px 8px 14px;
  min-height: 48px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid var(--o10);
  background: var(--o04);
  font-size: 13px;
  color: var(--text2);
}

.banner.mine {
  margin: 0;
  min-height: 40px;
  padding: 6px 16px 6px 20px;
  border: 0;
  border-bottom: 1px solid var(--o07);
  border-radius: 0;
}

.banner.waiting {
  border-color: var(--waiting-border);
  background: var(--waiting-bg);
}

.banner.waiting.late {
  background: color-mix(in srgb, var(--c-warn) 16%, transparent);
}

.banner.waiting .icon {
  color: var(--c-warn);
}

.banner.ai .icon {
  color: var(--accent-ink);
}

.icon {
  flex: 0 0 auto;
  display: inline-flex;
  color: var(--muted);
}

.text {
  flex: 1 1 160px;
  min-width: 0;
}

.banner.mine .text {
  color: var(--text3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

strong {
  color: var(--text);
}

.btn,
.banner :deep(.btn) {
  flex-shrink: 0;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--o12);
  background: var(--surface);
  color: var(--text2);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
}

.banner.mine .btn {
  height: 28px;
  padding: 0 10px;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
}

.btn.primary {
  border: 0;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  font-weight: 600;
}

.btn:disabled {
  opacity: 0.6;
  cursor: progress;
}

.btn:focus-visible,
.banner :deep(.btn:focus-visible) {
  outline: 2px solid var(--accent-border);
  outline-offset: 1px;
}

@media (max-width: 768px) {
  .banner:not(.mine) {
    margin: 0 12px 12px;
  }
}
</style>
