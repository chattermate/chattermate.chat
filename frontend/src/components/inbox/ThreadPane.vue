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
import type { ChatDetail, ConversationNote, Message } from '@/types/chat'
import type { Teammate } from '@/services/users'
import { chatService } from '@/services/chat'
import { ticketService } from '@/services/tickets'
import { userService } from '@/services/user'
import { useConversationChat } from '@/composables/useConversationChat'
import { useConversationFiles } from '@/composables/useConversationFiles'
import { useJiraTicket } from '@/composables/useJiraTicket'
import { useVisualViewport } from '@/composables/useVisualViewport'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
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
import ThreadComposer, { type ComposerMode } from './ThreadComposer.vue'
import ThreadNote from './ThreadNote.vue'
import HandoverSummaryCard from './HandoverSummaryCard.vue'
import { useComposerDrafts } from './composerDrafts'
import { customerName } from './inboxPresentation'
import { buildTimeline, canEditReply, faqEditorLink, handoverIndex, knowledgeDraft, type FaqDraft } from './threadContent'

const props = defineProps<{
  chat: ChatDetail
  detailsOpen: boolean
  teammates: Teammate[]
  now: Date
  showBack: boolean
}>()

const emit = defineEmits<{
  (e: 'chat-updated', chat: ChatDetail): void
  /** You closed it: the inbox moves on */
  (e: 'closed', sessionId: string): void
  (e: 'refresh'): void
  (e: 'toggle-details'): void
  (e: 'back'): void
}>()

const router = useRouter()
const currentUserId = userService.getUserId()
const canManage = permissionChecks.canTakeOverChats()
const canManageAll = permissionChecks.canManageAllChats()
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
  applyEditedMessage,
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
// A chat a teammate holds is theirs to give up, unless you manage every chat
const mayChangeHands = computed(() =>
  canManage && (!props.chat.user_id || props.chat.user_id === currentUserId || canManageAll)
)
const aiCapable = computed(() => props.chat.agent.ai_replies_enabled !== false)
const agentName = computed(() => props.chat.agent.display_name || props.chat.agent.name || 'The AI')
const name = computed(() => customerName(props.chat.customer))

// ---- Assigning ----
const assignees = computed<ActionMenuItem[] | null>(() => {
  if (!mayChangeHands.value || handler.value.kind === 'closed') return null
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

// ---- Notes ----
// Anyone who may manage the chat can leave a note, holding it or not; replying
// needs holding it, so the composer opens on Note until you do
const canNote = computed(() => canManage && handler.value.kind !== 'closed')
const showComposer = computed(() => holdsIt.value || canNote.value)
const composerMode = ref<ComposerMode>(holdsIt.value ? 'reply' : 'note')
watch(holdsIt, (holds) => { composerMode.value = holds ? 'reply' : 'note' })
const { text: composerText, note: noteDraft } = useComposerDrafts(composerMode, newMessage, () => props.chat.session_id)
const mentionables = computed(() =>
  props.teammates
    .filter((t) => t.id !== currentUserId)
    .map((t) => ({ id: t.id, name: t.full_name || t.email }))
)

async function addNote(body: string, mentions: string[]) {
  try {
    const note: ConversationNote = await chatService.addNote(props.chat.session_id, body, mentions)
    noteDraft.value = ''
    emit('chat-updated', { ...props.chat, notes: [...(props.chat.notes ?? []), note] })
    scrollToBottom()
  } catch (err: any) {
    toast.error(err?.response?.data?.detail || 'The note could not be added. Try again.')
  }
}

// ---- The enterprise module's tools (each renders nothing in open source) ----
// Snooze in the header and its notice; saved replies and Improve in the
// composer; Refresh and the AI-drafted article on the handover summary
const { hasEnterpriseModule, enterpriseComponent, moduleImports } = useEnterpriseFeatures()
const InboxThreadTools = enterpriseComponent(moduleImports.inboxThreadTools)
const InboxThreadNotice = enterpriseComponent(moduleImports.inboxThreadNotice)
const InboxComposerTools = enterpriseComponent(moduleImports.inboxComposerTools)
const InboxSummaryTools = enterpriseComponent(moduleImports.inboxSummaryTools)
/** A Refresh's summary, for this conversation only */
const latestSummary = ref<string | null>(null)
const onChatUpdated = (updated: ChatDetail) => emit('chat-updated', updated)

// ---- Closing ----
const canClose = computed(() => holdsIt.value)
const confirmingClose = ref(false)
const requestClose = () => {
  if (canClose.value) confirmingClose.value = true
  // E on a chat that isn't yours to close: say so rather than do nothing
  else toast.info(props.chat.status === 'closed' ? 'This conversation is already closed' : 'Only the person handling this chat can close it')
}
// The reply goes now; closing still asks, as Close does
const sendAndClose = async () => {
  await handleSendMessageWithAttachments()
  requestClose()
}
const confirmClose = async () => {
  confirmingClose.value = false
  const sessionId = props.chat.session_id
  if (await endChat()) emit('closed', sessionId)
}
// Held by you again, so you can reply; the customer isn't told
const reopen = () => run(() => chatService.reopenChat(props.chat.session_id), 'Chat reopened')

// ---- Editing a reply you sent ----
// Yours, for a few minutes, where the channel can change a sent message
const isEditable = (message: Message) =>
  props.chat.status !== 'closed' && canEditReply(message, currentUserId, props.chat.message_edit_minutes, props.now)

async function saveEdit(message: Message, text: string) {
  if (typeof message.id !== 'number') return
  try {
    applyEditedMessage(await chatService.editMessage(props.chat.session_id, message.id, text))
  } catch (err: any) {
    toast.error(err?.response?.data?.detail || 'The reply could not be changed. Try again.')
    throw err
  }
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
  if (mayChangeHands.value && aiCapable.value && open && handler.value.kind !== 'ai') {
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

/** The help center editor with a question and its answer filled in, when the
 * conversation has both; nothing for someone who can't edit knowledge. */
function faqLink(draft: FaqDraft | null): string | null {
  return canEditKnowledge && draft ? faqEditorLink(draft) : null
}

// The team answered what the AI couldn't: that answer, for the next customer
const teamAnswer = computed<FaqDraft | null>(() =>
  canEditKnowledge ? knowledgeDraft(formattedMessages.value, handoverAt.value, 'team') : null
)
const knowledgeLink = computed(() => faqLink(teamAnswer.value))

// Each AI answer can be corrected: its question, and the answer to fix
const correctionLinks = computed(() =>
  formattedMessages.value.map((m, index) =>
    m.message_type === 'bot' && m.attributes?.source !== 'system'
      ? faqLink(knowledgeDraft(formattedMessages.value, index, 'this'))
      : null
  )
)

const timeline = computed(() => buildTimeline(formattedMessages.value, props.chat.notes ?? [], {
  handoverAt: showsHandover.value ? handoverAt.value : null,
  handedOverAt: props.chat.handed_over_at,
  now: props.now,
}))

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
  latestSummary.value = null
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
    >
      <template v-if="hasEnterpriseModule" #tools>
        <InboxThreadTools :chat="chat" :now="now" :may-change-hands="mayChangeHands" @chat-updated="onChatUpdated" />
      </template>
    </ThreadHeader>

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

    <InboxThreadNotice
      v-if="hasEnterpriseModule"
      :chat="chat"
      :now="now"
      :may-change-hands="mayChangeHands"
      @chat-updated="onChatUpdated"
    />

    <div ref="messagesContainer" class="messages" tabindex="0" aria-label="Messages">
      <template v-for="entry in timeline" :key="entry.key">
        <div v-if="entry.kind === 'day'" class="day" role="separator" :aria-label="entry.label">
          <span aria-hidden="true">{{ entry.label }}</span>
        </div>
        <HandoverSummaryCard
          v-else-if="entry.kind === 'handover'"
          :agent-name="agentName"
          :reason="chat.transfer_reason"
          :summary="chat.transfer_description"
          :handed-over-at="chat.handed_over_at"
          :knowledge-link="knowledgeLink"
          :latest-summary="latestSummary"
        >
          <template v-if="hasEnterpriseModule" #actions>
            <InboxSummaryTools
              :chat="chat"
              :plain-draft="teamAnswer"
              :can-manage="canManage"
              @summary="latestSummary = $event"
            />
          </template>
        </HandoverSummaryCard>
        <ThreadNote v-else-if="entry.kind === 'note'" :note="entry.note" :current-user-id="currentUserId" />
        <ThreadMessage
          v-else
          :message="formattedMessages[entry.index]"
          :customer-name="name"
          :agent-name="agentName"
          :current-user-id="currentUserId"
          :correction-link="correctionLinks[entry.index]"
          :editable="isEditable(formattedMessages[entry.index])"
          :save-edit="(text: string) => saveEdit(formattedMessages[entry.index], text)"
          :is-image="isImageAttachment"
          :image-url="getImageUrl"
          :download-url="getDownloadUrl"
          :file-size="formatFileSize"
        />
      </template>
    </div>

    <ThreadBanner
      v-if="!holdsIt"
      :chat="chat"
      :current-user-id="currentUserId"
      :now="now"
      :can-manage="canManage"
      :assignees="assignees"
      :busy="busy || isLoading"
      @take-over="takeOver"
      @route-to-team="routeToTeam"
      @assign="assign"
      @reopen="reopen"
    />
    <ThreadComposer
      v-if="showComposer"
      v-model="composerText"
      v-model:mode="composerMode"
      :can-reply="holdsIt"
      :can-take-over="!holdsIt && canManage"
      :can-send="canSendMessage"
      :has-files="uploadedFiles.length > 0"
      :show-template-notice="templateCanReopen && canUseTemplates"
      :teammates="mentionables"
      @send="handleSendMessageWithAttachments"
      @send-and-close="sendAndClose"
      @send-note="addNote"
      @take-over="takeOver"
      @paste="handleChatPaste"
      @send-template="showTemplatePicker = true"
    >
      <template #attach>
        <FileUpload ref="fileUploadRef" :max-files="3" @files-uploaded="handleFilesUploaded" @error="handleFileUploadError" />
      </template>
      <template v-if="hasEnterpriseModule" #tools>
        <InboxComposerTools :chat="chat" :can-manage="canManage" />
      </template>
    </ThreadComposer>

    <BaseModal v-if="confirmingClose" title="Close this conversation?" width="420px" @close="confirmingClose = false">
      <p class="confirm-text">
        {{ name }} is told the conversation has ended{{ chat.channel === 'web' || !chat.channel ? ' and asked for a rating' : '' }}.
      </p>
      <template #actions>
        <button type="button" class="modal-btn" @click="confirmingClose = false">Cancel</button>
        <button type="button" class="modal-btn primary" data-autofocus @click="confirmClose">Close conversation</button>
      </template>
    </BaseModal>

    <BaseModal v-if="confirmingTakeover" title="Take over this chat?" width="420px" @close="confirmingTakeover = false">
      <p class="confirm-text">
        {{ aiCapable && handler.kind === 'ai' ? `${agentName} stops answering and you reply to ${name} instead.` : `You reply to ${name}.` }}
        {{ aiCapable ? 'You can hand it back to the AI at any time.' : '' }}
      </p>
      <template #actions>
        <button type="button" class="modal-btn" @click="confirmingTakeover = false">Cancel</button>
        <button type="button" class="modal-btn primary" data-autofocus @click="confirmTakeover">Take over chat</button>
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
