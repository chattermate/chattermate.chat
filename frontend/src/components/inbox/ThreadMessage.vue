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
 * One message in the thread. The customer on the left in neutral; the AI on
 * the right in lime with an "AI" label; a person from the team on the right in
 * coral; system lines centred.
 */
import { computed, ref } from 'vue'
import type { Message } from '@/types/chat'
import { getInitials } from '@/utils/text'
import { renderChatMarkdown } from '@/utils/chatMarkdown'
import { visitorFeedbackIn } from '@/utils/visitorFeedback'
import { navIconSvg } from '@/components/layout/navIcons'
import MessageStatusTicks from '@/components/conversations/MessageStatusTicks.vue'
import QuickReplyChips from '@/components/conversations/QuickReplyChips.vue'
import MessageTag from '@/components/conversations/MessageTag.vue'
import VisitorFeedbackMark from '@/components/conversations/VisitorFeedbackMark.vue'
import MessageEditor from './MessageEditor.vue'
import { sentByMe } from './threadContent'

type Attachment = NonNullable<Message['attachments']>[number]

const props = defineProps<{
  message: Message & { timeAgo?: string }
  customerName: string
  agentName: string
  currentUserId: string | null
  /** Where "Correct this answer" goes; none when the viewer can't edit knowledge */
  correctionLink?: string | null
  isImage: (contentType: string) => boolean
  imageUrl: (fileUrl: string) => string
  downloadUrl: (fileUrl: string) => string
  fileSize: (bytes: number) => string
  /** Your reply, still editable: Edit shows, and saves through \`saveEdit\` */
  editable?: boolean
  saveEdit?: (text: string) => Promise<void>
}>()

const editing = ref(false)
const edited = computed(() => !!props.message.attributes?.edited_at)

defineEmits<{ (e: 'view-product', productId: string): void }>()

type Side = 'customer' | 'ai' | 'team' | 'system'

// Live events spell some types differently (user_message, agent_message)
const SIDES: Record<string, Side> = {
  user: 'customer', user_message: 'customer',
  bot: 'ai', bot_message: 'ai', product: 'ai',
  agent: 'team', agent_message: 'team',
}

const side = computed<Side>(() => SIDES[props.message.message_type] ?? 'system')

/** The old class names, kept for the e2e page object and the delivery spec */
const legacyClass = computed(() => ({ customer: 'user', ai: 'bot', team: 'agent', system: 'system' })[side.value])

const teamLabel = computed(() => {
  if (sentByMe(props.message, props.currentUserId)) return 'You'
  return props.message.user_name || 'Teammate'
})

const products = computed(() => props.message.attributes?.shopify_output?.products ?? props.message.shopify_output?.products ?? [])
const feedback = computed(() => (side.value === 'ai' ? visitorFeedbackIn(props.message.attributes) : null))
const attachments = computed<Attachment[]>(() => props.message.attachments ?? [])
</script>

<template>
  <p v-if="side === 'system'" class="system-line">{{ message.message }}</p>

  <div v-else class="message" :class="[side, legacyClass]">
    <span v-if="side === 'customer'" class="avatar" aria-hidden="true">{{ getInitials(customerName) }}</span>
    <div class="stack">
      <span v-if="side === 'ai'" class="who ai-who">
        <span aria-hidden="true" v-html="navIconSvg('sparkle', 12)"></span>
        {{ message.agent_name || agentName }} · AI
      </span>
      <span v-else-if="side === 'team'" class="who team-who">{{ teamLabel }}</span>

      <MessageEditor
        v-if="editing && saveEdit"
        :text="message.message || ''"
        :save="saveEdit"
        @done="editing = false"
      />
      <div v-else class="message-bubble">
        <template v-if="message.message_type === 'product' && products.length">
          <div class="markdown" v-html="renderChatMarkdown(message.message || '')"></div>
          <ul class="products">
            <li v-for="product in products" :key="product.id" class="product">
              <img v-if="product.image?.src" :src="product.image.src" :alt="product.title || ''" />
              <span class="product-text">
                <span class="product-title">{{ product.title }}</span>
                <span class="product-price">{{ product.price }}</span>
              </span>
              <button type="button" class="link-btn" @click="$emit('view-product', String(product?.id || 'unknown'))">View</button>
            </li>
          </ul>
        </template>
        <template v-else>
          <MessageTag v-if="message.attributes?.interactive_reply" icon="fa-solid fa-hand-pointer" label="Button reply" />
          <MessageTag
            v-if="message.attributes?.source === 'app'"
            icon="fa-solid fa-plug"
            :label="`Sent by ${message.attributes?.app_name || 'an app'}`"
          />
          <MessageTag v-if="message.attributes?.source === 'journey'" icon="fa-solid fa-route" label="Journey step" />
          <MessageTag v-if="message.attributes?.source === 'host'" icon="fa-solid fa-window-maximize" label="Shown by the site" />
          <div class="markdown" v-html="renderChatMarkdown(message.message || '')"></div>
          <QuickReplyChips :sent="message.attributes?.interactive_sent" />
          <ul v-if="attachments.length" class="attachments">
            <li v-for="attachment in attachments" :key="attachment.id">
              <img
                v-if="isImage(attachment.content_type)"
                :src="imageUrl(attachment.file_url)"
                :alt="attachment.filename"
                class="attachment-image"
              />
              <a :href="downloadUrl(attachment.file_url)" target="_blank" rel="noopener" class="attachment-link">
                {{ attachment.filename }}
                <span class="attachment-size">({{ fileSize(attachment.file_size) }})</span>
              </a>
            </li>
          </ul>
        </template>
      </div>

      <span class="meta">
        <span>{{ message.timeAgo }}</span>
        <MessageStatusTicks :status="message.channel_status" />
        <VisitorFeedbackMark v-if="feedback" :value="feedback" />
        <span v-if="message.attributes?.delivery_status" class="delivery-failed">Not delivered</span>
        <router-link v-if="side === 'ai' && correctionLink" :to="correctionLink" class="correct">Correct this answer</router-link>
        <span v-if="edited" class="edited">Edited</span>
        <button v-if="editable && saveEdit && !editing" type="button" class="edit-btn" @click="editing = true">Edit</button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.system-line {
  margin: 0;
  align-self: center;
  max-width: 80%;
  text-align: center;
  font-size: 12px;
  color: var(--muted);
}

.message {
  display: flex;
  gap: 8px;
  max-width: 76%;
}

.message.ai,
.message.team {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  flex: 0 0 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--teal-bg);
  color: var(--text);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
}

.stack {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message.ai .stack,
.message.team .stack {
  align-items: flex-end;
}

.who {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.ai-who {
  color: var(--accent-ink);
}

.team-who {
  color: var(--c-coral);
}

.message-bubble {
  max-width: 100%;
  padding: 9px 12px;
  border-radius: 4px 12px 12px 12px;
  background: var(--thread-customer-bg);
  color: var(--text2);
  font-size: 13px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.message.ai .message-bubble {
  border-radius: 12px 4px 12px 12px;
  background: var(--thread-ai-bg);
  border: 1px solid var(--thread-ai-border);
}

.message.team .message-bubble {
  border-radius: 12px 4px 12px 12px;
  background: var(--thread-you-bg);
  border: 1px solid var(--thread-you-border);
}

.markdown :deep(p) {
  margin: 0;
}

.markdown :deep(p + p) {
  margin-top: 6px;
}

.markdown :deep(a) {
  color: var(--accent-ink);
}

.meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--muted2);
  white-space: nowrap;
}

.delivery-failed {
  color: var(--c-warn);
  font-weight: 600;
}

.correct {
  color: var(--accent-ink);
  font-weight: 600;
  text-decoration: none;
}

.correct:hover {
  text-decoration: underline;
}

.edit-btn {
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent-ink);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.edit-btn:hover {
  text-decoration: underline;
}

.edit-btn:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: 2px;
}

.products,
.attachments {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 8px;
  background: var(--o05);
}

.product img {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
}

.product-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.product-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.product-price {
  color: var(--muted);
  font-size: 12px;
}

.attachment-image {
  display: block;
  max-width: 240px;
  max-height: 200px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.attachment-link {
  color: var(--text2);
  font-size: 12px;
}

.attachment-size {
  color: var(--muted2);
}

.link-btn {
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent-ink);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
</style>
