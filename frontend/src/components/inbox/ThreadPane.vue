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
 * The open conversation: its header, who is answering (and the action that
 * changes it), the messages with the handover summary where it happened, and
 * the reply box once you hold it.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import type { ChatDetail } from '@/types/chat'
import type { Teammate } from '@/services/users'
import { chatService } from '@/services/chat'
import { ticketService } from '@/services/tickets'
import { userService } from '@/services/user'
import { useConversationChat } from '@/composables/useConversationChat'
import { useConversationFiles } from '@/composables/useConversationFiles'
import { useJiraTicket } from '@/composables/useJiraTicket'
import { useVisualViewport } from '@/composables/useVisualViewport'
import { chatHandler } from '@/utils/chatState'
import { permissionChecks } from '@/utils/permissions'
import { canAccessPath } from '@/router/routePermissions'
import FileUpload from '@/components/common/FileUpload.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'
import JiraTicketModal from '@/components/jira/JiraTicketModal.vue'
import TicketCreateModal from '@/components/tickets/TicketCreateModal.vue'
import WhatsAppTemplatePicker from '@/components/conversations/WhatsAppTemplatePicker.vue'
import ThreadHeader from './ThreadHeader.vue'
import ThreadBanner from './ThreadBanner.vue'
import ThreadMessage from './ThreadMessage.vue'
import ThreadComposer from './ThreadComposer.vue'
import HandoverSummaryCard from './HandoverSummaryCard.vue'
import { customerName } from './inboxPresentation'
import { daySeparators, handoverIndex, questionBefore } from './threadContent'

const props = defineProps<{
  chat: ChatDetail
  detailsOpen: boolean
  teammates: Teammate[]
  now: Date
  showBack: boolean
}>()

const emit = defineEmits<{
  (e: 'chat-updated', chat: ChatDetail): void
  (e: 'refresh'): void
  (e: 'toggle-details'): void
  (e: 'back'): void
}>()

const router = useRouter()
const currentUserId = userService.getUserId()
const canManage = permissionChecks.canTakeOverChats()
const canEditKnowledge = canAccessPath('/faq') && permissionChecks.canManageKnowledge()
const canUseNativeTickets = permissionChecks.canManageTickets()

const currentChat = ref(props.chat)

// What the thread's composable reports, passed up (unread is the list's job)
function onChatEvent(event: 'refresh'): void
function onChatEvent(event: 'chatUpdated', data: ChatDetail): void
function onChatEvent(event: 'clearUnread', sessionId: string): void
function onChatEvent(event: string, data?: ChatDetail | string): void {
  if (event === 'chatUpdated' && data && typeof data !== 'string') emit('chat-updated', data)
  else if (event === 'refresh') emit('refresh')
}

const {
  newMessage,
  messagesContainer,
  formattedMessages,
  isLoading,
  canSendMessage,
  scrollToBottom,
  handleTakeover,
  handleRouteToHuman,
  replaceChatFromProps,
  endChat,
  templateCanReopen,
  clearTemplateSuggestion,
} = useConversationChat(props.chat, onChatEvent)

const {
  fileUploadRef,
  uploadedFiles,
  handleFilesUploaded,
  handleFileUploadError,
  handleChatPaste,
  handleSendMessageWithAttachments,
  formatFileSize,
  isImageAttachment,
  getDownloadUrl,
  getImageUrl,
} = useConversationFiles(currentChat, newMessage, canSendMessage, scrollToBottom)

watch(() => props.chat, (next) => {
  currentChat.value = next
  replaceChatFromProps(next)
}, { immediate: true })

// Keep the reply box above the on-screen keyboard on installed iOS PWAs
useVisualViewport(() => scrollToBottom())

const handler = computed(() => chatHandler(props.chat, currentUserId))
const holdsIt = computed(() => handler.value.kind === 'human' && props.chat.user_id === currentUserId)
const aiCapable = computed(() => props.chat.agent.ai_replies_enabled !== false)
const agentName = computed(() => props.chat.agent.display_name || props.chat.agent.name || 'The AI')
const name = computed(() => customerName(props.chat.customer))

// ---- Assigning ----
const assignees = computed<ActionMenuItem[] | null>(() => {
  if (!canManage || handler.value.kind === 'closed') return null
  return props.teammates.map((t) => ({
    id: t.id,
    label: t.id === currentUserId ? `${t.full_name || t.email} (you)` : (t.full_name || t.email),
    checked: props.chat.user_id === t.id,
  }))
})

const busy = ref(false)

async function run(action: () => Promise<ChatDetail | null | void>, success?: string) {
  if (busy.value) return
  busy.value = true
  try {
    const updated = await action()
    if (updated) emit('chat-updated', updated)
    if (success) toast.success(success)
  } catch (err: any) {
    console.error(err)
    toast.error(err?.response?.data?.detail || 'Something went wrong. Try again.')
  } finally {
    busy.value = false
  }
}

const assign = (userId: string) => {
  if (userId === props.chat.user_id) return
  const teammate = props.teammates.find((t) => t.id === userId)
  void run(() => chatService.reassignChat(props.chat.session_id, userId),
    `Assigned to ${teammate?.full_name || teammate?.email || 'your teammate'}`)
}

const releaseToAi = () =>
  run(() => chatService.releaseToAi(props.chat.session_id), `Handed back to ${agentName.value}`)

// Taking a chat over silences the AI and tells the customer a person joined:
// asked first, so a stray click on a busy inbox can't do it
const confirmingTakeover = ref(false)
const takeOver = () => { confirmingTakeover.value = true }
const confirmTakeover = () => {
  confirmingTakeover.value = false
  void run(() => handleTakeover())
}
const routeToTeam = () => run(() => handleRouteToHuman())

// ---- Closing ----
const canClose = computed(() => holdsIt.value)
const confirmingClose = ref(false)
const requestClose = () => {
  if (canClose.value) confirmingClose.value = true
}
// The reply goes now; closing still asks, as Close does
const sendAndClose = async () => {
  await handleSendMessageWithAttachments()
  requestClose()
}
const confirmClose = async () => {
  confirmingClose.value = false
  await endChat()
}

// ---- Tickets and templates ----
const { jiraConnected, checkJiraStatus } = useJiraTicket()
const linkedTicketId = ref<string | null>(null)
const showTicketModal = ref(false)
const showJiraModal = ref(false)
const showTemplatePicker = ref(false)
const canUseTemplates = computed(() => props.chat.channel === 'whatsapp' && !!props.chat.channel_account_id)

async function refreshLinkedTicket() {
  if (!canUseNativeTickets || !props.chat.session_id) return
  const ticket = await ticketService.getTicketBySession(props.chat.session_id)
  linkedTicketId.value = ticket?.id || null
}

const moreActions = computed<ActionMenuItem[]>(() => {
  const items: ActionMenuItem[] = []
  const open = handler.value.kind !== 'closed'
  if (linkedTicketId.value) items.push({ id: 'view-ticket', label: 'View ticket' })
  else if (holdsIt.value && open) {
    if (canUseNativeTickets) items.push({ id: 'create-ticket', label: 'Create ticket' })
    if (jiraConnected.value) items.push({ id: 'create-jira', label: 'Create Jira ticket' })
  }
  if (canUseTemplates.value && open) items.push({ id: 'send-template', label: 'Send WhatsApp template' })
  if (canManage && handler.value.kind === 'ai') items.push({ id: 'route-to-team', label: 'Hand to my team' })
  if (canManage && aiCapable.value && open && handler.value.kind !== 'ai') {
    items.push({ id: 'release', label: 'Hand back to AI' })
  }
  items.push({ id: 'refresh', label: 'Refresh conversation', separated: items.length > 0 })
  return items
})

function onAction(id: string) {
  if (id === 'view-ticket' && linkedTicketId.value) void router.push(`/tickets/${linkedTicketId.value}`)
  else if (id === 'create-ticket') showTicketModal.value = true
  else if (id === 'create-jira') showJiraModal.value = true
  else if (id === 'send-template') showTemplatePicker.value = true
  else if (id === 'route-to-team') void routeToTeam()
  else if (id === 'release') void releaseToAi()
  else if (id === 'refresh') emit('refresh')
}

const onTemplateSent = () => {
  showTemplatePicker.value = false
  clearTemplateSuggestion()
  emit('refresh')
}

const onJiraCreated = (ticketKey: string) => {
  newMessage.value = `Jira ticket created: ${ticketKey}`
  showJiraModal.value = false
}

// ---- The handover, and where to teach the answer ----
const showsHandover = computed(() => !!(props.chat.transfer_reason || props.chat.transfer_description))
const handoverAt = computed(() => handoverIndex(formattedMessages.value, props.chat.handed_over_at))

function faqLink(question: string | null): string | null {
  if (!canEditKnowledge || !question) return null
  return `/faq?question=${encodeURIComponent(question)}`
}
const knowledgeLink = computed(() => faqLink(questionBefore(formattedMessages.value, handoverAt.value)))
const separators = computed(() => daySeparators(formattedMessages.value, props.now))

// One pass: each AI answer links to the question just before it
const correctionLinks = computed(() => {
  let question: string | null = null
  return formattedMessages.value.map((m) => {
    if (m.message_type === 'user' && m.message?.trim()) question = m.message.trim()
    // A notice the system sent (handover, back to AI) is not an answer to correct
    return m.message_type === 'bot' && m.attributes?.source !== 'system' ? faqLink(question) : null
  })
})

// Only someone holding the chat can open a Jira ticket from it: ask Jira then,
// not for every conversation J/K passes through
let jiraChecked = false
watch(holdsIt, (holds) => {
  if (holds && !jiraChecked) {
    jiraChecked = true
    void checkJiraStatus()
  }
}, { immediate: true })

onMounted(async () => {
  scrollToBottom()
  await refreshLinkedTicket()
})
watch(() => props.chat.session_id, () => {
  confirmingClose.value = false
  confirmingTakeover.value = false
  void refreshLinkedTicket()
})

defineExpose({ requestClose })
</script>

<template>
  <section class="thread" :aria-label="`Conversation with ${name}`">
    <ThreadHeader
      :chat="chat"
      :current-user-id="currentUserId"
      :details-open="detailsOpen"
      :assignees="assignees"
      :more-actions="moreActions"
      :can-close="canClose"
      :show-back="showBack"
      @assign="assign"
      @close-chat="requestClose"
      @action="onAction"
      @toggle-details="emit('toggle-details')"
      @back="emit('back')"
    />

    <ThreadBanner
      v-if="holdsIt"
      :chat="chat"
      :current-user-id="currentUserId"
      :now="now"
      :can-manage="canManage"
      :assignees="null"
      :busy="busy"
      @release="releaseToAi"
    />

    <div ref="messagesContainer" class="messages" tabindex="0" aria-label="Messages">
      <template v-for="(message, index) in formattedMessages" :key="message.id ?? message.client_id ?? index">
        <div v-if="separators[index]" class="day" role="separator" :aria-label="separators[index]!">
          <span aria-hidden="true">{{ separators[index] }}</span>
        </div>
        <HandoverSummaryCard
          v-if="showsHandover && index === handoverAt"
          :agent-name="agentName"
          :reason="chat.transfer_reason"
          :summary="chat.transfer_description"
          :handed-over-at="chat.handed_over_at"
          :knowledge-link="knowledgeLink"
        />
        <ThreadMessage
          :message="message"
          :customer-name="name"
          :agent-name="agentName"
          :current-user-id="currentUserId"
          :correction-link="correctionLinks[index]"
          :is-image="isImageAttachment"
          :image-url="getImageUrl"
          :download-url="getDownloadUrl"
          :file-size="formatFileSize"
        />
      </template>
      <HandoverSummaryCard
        v-if="showsHandover && handoverAt >= formattedMessages.length"
        :agent-name="agentName"
        :reason="chat.transfer_reason"
        :summary="chat.transfer_description"
        :handed-over-at="chat.handed_over_at"
        :knowledge-link="knowledgeLink"
      />
    </div>

    <ThreadComposer
      v-if="holdsIt"
      v-model="newMessage"
      :can-send="canSendMessage"
      :has-files="uploadedFiles.length > 0"
      :show-template-notice="templateCanReopen && canUseTemplates"
      @send="handleSendMessageWithAttachments"
      @send-and-close="sendAndClose"
      @paste="handleChatPaste"
      @send-template="showTemplatePicker = true"
    >
      <template #attach>
        <FileUpload ref="fileUploadRef" :max-files="3" @files-uploaded="handleFilesUploaded" @error="handleFileUploadError" />
      </template>
    </ThreadComposer>
    <ThreadBanner
      v-else
      :chat="chat"
      :current-user-id="currentUserId"
      :now="now"
      :can-manage="canManage"
      :assignees="assignees"
      :busy="busy || isLoading"
      @take-over="takeOver"
      @route-to-team="routeToTeam"
      @assign="assign"
    />

    <BaseModal v-if="confirmingClose" title="Close this conversation?" width="420px" @close="confirmingClose = false">
      <p class="confirm-text">
        {{ name }} is told the conversation has ended{{ chat.channel === 'web' || !chat.channel ? ' and asked for a rating' : '' }}.
      </p>
      <template #actions>
        <button type="button" class="modal-btn" @click="confirmingClose = false">Cancel</button>
        <button type="button" class="modal-btn primary" @click="confirmClose">Close conversation</button>
      </template>
    </BaseModal>

    <BaseModal v-if="confirmingTakeover" title="Take over this chat?" width="420px" @close="confirmingTakeover = false">
      <p class="confirm-text">
        {{ aiCapable && handler.kind === 'ai' ? `${agentName} stops answering and you reply to ${name} instead.` : `You reply to ${name}.` }}
        {{ aiCapable ? 'You can hand it back to the AI at any time.' : '' }}
      </p>
      <template #actions>
        <button type="button" class="modal-btn" @click="confirmingTakeover = false">Cancel</button>
        <button type="button" class="modal-btn primary" @click="confirmTakeover">Take over chat</button>
      </template>
    </BaseModal>

    <JiraTicketModal
      v-if="showJiraModal"
      :chat-id="chat.session_id"
      :initial-summary="formattedMessages.slice(-3).map((m) => m.message).join(' ').substring(0, 100)"
      @close="showJiraModal = false"
      @ticket-created="onJiraCreated"
    />
    <TicketCreateModal
      :open="showTicketModal"
      :session-id="chat.session_id"
      :session-label="name"
      @close="showTicketModal = false"
      @created="refreshLinkedTicket"
    />
    <WhatsAppTemplatePicker
      v-if="showTemplatePicker && chat.channel_account_id"
      :account-id="chat.channel_account_id"
      :session-id="chat.session_id"
      @close="showTemplatePicker = false"
      @sent="onTemplateSent"
    />
  </section>
</template>

<style scoped>
.thread {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 24px;
}

.day {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--muted2);
}

.day::before,
.day::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--o07);
}

.messages:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: -2px;
}

.confirm-text {
  margin: 0;
  font-size: 14px;
  color: var(--text2);
}

.modal-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid var(--o12);
  background: var(--surface);
  color: var(--text2);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.modal-btn.primary {
  border: 0;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}

@media (max-width: 768px) {
  .messages {
    padding: 12px;
  }
}
</style>
