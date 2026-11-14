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
 * Beside the thread: who the customer is, the facts of this conversation and
 * its linked ticket. The enterprise module adds to it (customer history,
 * Shopify orders, previous conversations); in open source those slots are
 * empty. Scrolls on its own; below 1440px it opens over the thread as a
 * drawer (InboxShell).
 */
import { computed, ref } from 'vue'
import type { ChatDetail } from '@/types/chat'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { userService } from '@/services/user'
import { permissionChecks } from '@/utils/permissions'
import { channelLabel } from '@/utils/channelGlyphs'
import { chatHandler } from '@/utils/chatState'
import { getInitials } from '@/utils/text'
import { formatShortDate } from '@/utils/shortDate'
import { navIconSvg } from '@/components/layout/navIcons'
import LinkedTicketCard from '@/components/tickets/LinkedTicketCard.vue'
import DetailsFacts from './DetailsFacts.vue'
import { avatarTone, customerName, transferReasonLabel, type DetailsFact } from './inboxPresentation'

const props = defineProps<{
  chat: ChatDetail
  /** Drawn over the thread (below 1440px), with its own close button */
  overlay: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-conversation', sessionId: string): void
}>()

const currentUserId = userService.getUserId()
const canViewTickets = permissionChecks.canViewTickets()

// Each renders nothing in open source
const { enterpriseComponent, moduleImports } = useEnterpriseFeatures()
const InboxCustomerFacts = enterpriseComponent(moduleImports.inboxCustomerFacts)
const InboxDetailsSections = enterpriseComponent(moduleImports.inboxDetailsSections)

const name = computed(() => customerName(props.chat.customer))
const contact = computed(() => {
  const { email, full_name: fullName } = props.chat.customer
  return fullName && email ? email : null
})

/** Integrator-supplied fields (POST /generate-token custom_data), labelled */
const customerFacts = computed(() => {
  const facts: DetailsFact[] = []
  if (props.chat.customer.phone) facts.push({ label: 'Phone', value: props.chat.customer.phone })
  const metaData = props.chat.customer.meta_data
  if (metaData && typeof metaData === 'object') {
    for (const [key, value] of Object.entries(metaData)) {
      if (value === null || value === undefined || value === '') continue
      facts.push({
        label: key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      })
    }
  }
  return facts
})

const STATUS_LABELS: Record<string, string> = { ai: 'AI answering', waiting: 'Waiting for a human', human: 'With a person', closed: 'Closed' }

const conversationFacts = computed(() => {
  const handler = chatHandler(props.chat, currentUserId)
  const facts: DetailsFact[] = [
    { label: 'Status', value: STATUS_LABELS[handler.kind], tone: handler.kind },
    { label: 'AI agent', value: props.chat.agent.display_name || props.chat.agent.name },
  ]
  if (handler.kind === 'human') facts.push({ label: 'Handled by', value: handler.label })
  facts.push({ label: 'Channel', value: channelLabel(props.chat.channel) })
  const reason = transferReasonLabel(props.chat.transfer_reason)
  if (reason) facts.push({ label: 'Handover', value: reason })
  if (props.chat.sentiment_label) {
    const label = props.chat.sentiment_label
    facts.push({ label: 'Sentiment', value: label.charAt(0).toUpperCase() + label.slice(1), tone: label })
  }
  const started = formatShortDate(props.chat.created_at)
  if (started) facts.push({ label: 'Started', value: started })
  return facts
})

const hasHandover = computed(() => !!(props.chat.transfer_reason || props.chat.transfer_description))
const conversationOpen = ref(true)

function jumpToHandover() {
  document.getElementById('handover')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

</script>

<template>
  <aside id="inbox-details" class="details" :class="{ overlay }" aria-label="Customer and conversation details">
    <div class="customer">
      <div class="identity">
        <span class="avatar" :style="{ background: avatarTone(chat.session_id) }" aria-hidden="true">{{ getInitials(name) }}</span>
        <div class="identity-text">
          <span class="customer-name">{{ name }}</span>
          <span v-if="contact" class="customer-contact">{{ contact }}</span>
        </div>
        <button v-if="overlay" type="button" class="icon-btn" aria-label="Close details" @click="emit('close')">
          <span aria-hidden="true" v-html="navIconSvg('close', 16)"></span>
        </button>
      </div>
      <DetailsFacts :facts="customerFacts" />
      <InboxCustomerFacts :chat="chat" />
    </div>

    <section class="section">
      <h3 class="section-heading">
        <button
          type="button"
          class="section-toggle"
          :aria-expanded="conversationOpen"
          aria-controls="details-conversation"
          @click="conversationOpen = !conversationOpen"
        >
          Conversation
          <span class="chevron" :class="{ open: conversationOpen }" aria-hidden="true" v-html="navIconSvg('chevronDown', 12)"></span>
        </button>
      </h3>
      <div v-show="conversationOpen" id="details-conversation" class="section-body">
        <DetailsFacts :facts="conversationFacts" />
        <button v-if="hasHandover" type="button" class="link-btn" @click="jumpToHandover">Jump to handover summary</button>
      </div>
    </section>

    <section v-if="canViewTickets" class="section ticket-section">
      <LinkedTicketCard :session-id="chat.session_id" />
    </section>

    <InboxDetailsSections :chat="chat" @open-conversation="emit('open-conversation', $event)" />
  </aside>
</template>

<style scoped>
.details {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: var(--bg2);
  border-left: 1px solid var(--o07);
}

.details.overlay {
  box-shadow: var(--shadow-lg, -12px 0 32px rgba(0, 0, 0, 0.35));
}

.customer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid var(--o07);
}

.identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.avatar {
  flex: 0 0 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
}

.identity-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  white-space: nowrap;
}

.customer-name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-contact {
  font-size: 12px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 8px;
  border: 1px solid var(--o10);
  background: var(--o04);
  color: var(--text3);
  cursor: pointer;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px 14px;
  border-bottom: 1px solid var(--o07);
}

.section:last-child {
  border-bottom: 0;
}

/* The card renders nothing without a ticket (a comment, which :empty ignores) */
.ticket-section:empty {
  display: none;
}

.section-heading {
  margin: 0;
}

.section-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--muted2);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}

.chevron {
  display: inline-flex;
  transition: transform var(--transition-fast, 0.15s);
}

.chevron.open {
  transform: rotate(180deg);
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-btn {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent-ink);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.section-toggle:focus-visible,
.link-btn:focus-visible,
.icon-btn:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: 2px;
}
</style>
