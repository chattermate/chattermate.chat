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
import { ref } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import type { TicketActivity } from '@/types/ticket'
import { ticketInitials } from './ticketMeta'

defineProps<{ activities: TicketActivity[]; canComment: boolean; isSaving: boolean }>()
const emit = defineEmits<{ (e: 'comment', body: string, isInternal: boolean): void }>()

const draft = ref('')
const customerVisible = ref(false)

function submit() {
  if (!draft.value.trim()) return
  emit('comment', draft.value, !customerVisible.value)
  draft.value = ''
  customerVisible.value = false
}

const timeAgo = (iso?: string | null) =>
  iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : ''

function actorName(activity: TicketActivity): string {
  if (activity.actor_name) return activity.actor_name
  if (activity.actor_type === 'ai') return 'ChatterMate AI'
  if (activity.actor_type === 'customer') return 'Customer'
  return 'System'
}

function avatarText(activity: TicketActivity): string {
  if (activity.actor_type === 'ai') return 'AI'
  if (activity.actor_type === 'system') return '◇'
  return ticketInitials(actorName(activity))
}
</script>

<template>
  <div class="activity-feed">
    <div class="feed-header">Activity</div>
    <div class="feed-body">
      <div v-if="!activities.length" class="feed-empty">No activity yet.</div>
      <div v-for="activity in activities" :key="activity.id" class="feed-item">
        <span
          class="avatar"
          :class="{ ai: activity.actor_type === 'ai', system: activity.actor_type === 'system' }"
        >
          {{ avatarText(activity) }}
        </span>
        <div class="item-main">
          <div class="item-header">
            <span class="author">{{ actorName(activity) }}</span>
            <span v-if="activity.actor_type === 'ai'" class="ai-tag">AI</span>
            <span
              v-if="activity.activity_type === 'comment' && !activity.is_internal"
              class="visible-tag"
            >
              sent to customer
            </span>
            <span class="time">{{ timeAgo(activity.created_at) }}</span>
          </div>
          <div class="item-text" :class="{ muted: activity.actor_type === 'system' }">
            {{ activity.body || activity.activity_type.replace(/_/g, ' ') }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="canComment" class="composer">
      <textarea
        v-model="draft"
        class="composer-input"
        :placeholder="customerVisible ? 'Reply to the customer…' : 'Add an internal comment…'"
        @keydown.meta.enter="submit"
        @keydown.ctrl.enter="submit"
      ></textarea>
      <div class="composer-actions">
        <label class="visibility-toggle">
          <input v-model="customerVisible" type="checkbox" />
          Send to customer
        </label>
        <button class="post-btn" :disabled="!draft.trim() || isSaving" @click="submit">
          {{ isSaving ? 'Posting…' : 'Comment' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-feed {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 15px;
  overflow: hidden;
}
.feed-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--o07);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--faint);
}
.feed-body {
  padding: 6px 20px;
  max-height: 480px;
  overflow-y: auto;
}
.feed-empty {
  padding: 20px 0;
  font-size: 13px;
  color: var(--muted);
}
.feed-item {
  display: flex;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid var(--o05);
}
.feed-item:last-child {
  border-bottom: none;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--c-coral);
  color: var(--on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}
.avatar.ai {
  border-radius: 8px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}
.avatar.system {
  border-radius: 8px;
  background: var(--o08);
  color: var(--muted);
}
.item-main {
  flex: 1;
  min-width: 0;
}
.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}
.author {
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  color: var(--text2);
}
.ai-tag {
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: var(--font-weight-semibold);
  color: var(--c-info);
  background: color-mix(in srgb, var(--c-info) 14%, transparent);
  padding: 1px 6px;
  border-radius: 5px;
}
.visible-tag {
  font-size: 10px;
  color: var(--c-teal);
  background: var(--teal-bg-10);
  padding: 1px 7px;
  border-radius: 5px;
}
.time {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--faint);
  white-space: nowrap;
}
.item-text {
  font-size: 13px;
  color: var(--text3);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.item-text.muted {
  color: var(--muted);
}
.composer {
  padding: 14px 20px;
  border-top: 1px solid var(--o07);
}
.composer-input {
  width: 100%;
  min-height: 58px;
  resize: vertical;
  background: var(--bg2);
  border: 1px solid var(--o08);
  border-radius: 10px;
  padding: 9px 12px;
  color: var(--text);
  font-size: 13px;
  line-height: 1.5;
  outline: none;
}
.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 9px;
}
.visibility-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
}
.post-btn {
  padding: 8px 16px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: 9px;
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
.post-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
