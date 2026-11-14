/*
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
*/

import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { ChatDetail, Message } from '@/types/chat'
import { formatDistanceToNow } from 'date-fns'
import { chatService } from '@/services/chat'
import { userService } from '@/services/user'
import { socketService } from '@/services/socket'
import { toast } from 'vue-sonner'
import { canRequestRating, endChatMessage as endChatMessageFor } from '@/utils/endChat'
import { canTakeOverChat, chatHandler } from '@/utils/chatState'
import { routeChatToHuman } from '@/utils/chatActions'
import { permissionChecks } from '@/utils/permissions'
import { findMessage, newClientId } from '@/utils/messageMatch'
import { withVisitorFeedback } from '@/utils/visitorFeedback'
import { useOrgInboxRoom } from '@/composables/useOrgInboxRoom'

// Define valid chat statuses
type ChatStatus = 'open' | 'closed' | 'transferred'

/** Emitted by the backend when a reply was saved but never reached the customer. */
interface DeliveryErrorEvent {
  error?: string
  type?: string
  session_id?: string
  can_template?: boolean
  client_id?: string | null
  message_id?: number
}

/** Tells the sender which stored row their message became. */
interface AgentMessageStoredEvent {
  session_id?: string
  client_id?: string | null
  message_id?: number
}

/** A channel's delivery receipt for a stored message (sent → delivered → read). */
interface MessageStatusEvent {
  session_id?: string
  message_id?: number
  external_message_id?: string | null
  channel_status?: Message['channel_status']
  delivery_status?: string | null
}

/** message_feedback: the visitor's thumb on an AI reply (null: taken back). */
interface MessageFeedbackEvent {
  session_id?: string
  message_id?: number
  value?: string | null
}

export function useConversationChat(
  initialChat: ChatDetail,
  emit: {
    (event: 'refresh'): void
    (event: 'chatUpdated', data: ChatDetail): void
    (event: 'clearUnread', sessionId: string): void
  }
) {
  const chat = ref<ChatDetail>(initialChat)
  // Delivery receipts for chats no agent owns arrive through the org room
  useOrgInboxRoom()
  const newMessage = ref('')
  const messagesContainer = ref<HTMLElement | null>(null)
  const isLoading = ref(false)
  const currentUserId = userService.getUserId()
  // Set once a send is refused because the messaging window closed and a
  // template would reopen it. The frontend can't tell the window has expired on
  // its own — it never sees the customer's last inbound time — so this is only
  // known after the backend refuses a send.
  const templateCanReopen = ref(false)

  // Claimable and allowed to claim. Shared with ChatInfoPanel via
  // canTakeOverChat so the chat screen and the info panel can't disagree —
  // this pane used to require status 'transferred', which left an AI-handled
  // chat claimable only from the info panel.
  const showTakeoverButton = computed(
    () => canTakeOverChat(chat.value) && permissionChecks.canTakeOverChats()
  )

  // Who is answering the customer. Derived once, shared with the inbox list and
  // the info panel through chatHandler, so the three surfaces cannot disagree.
  const handler = computed(() => chatHandler(chat.value, currentUserId))

  const handledByAI = computed(() => handler.value.kind === 'ai')

  // Nobody is answering yet: the AI queued it, or this agent never uses AI.
  const isWaitingForHuman = computed(() => handler.value.kind === 'waiting')

  const isChatClosed = computed(() => handler.value.kind === 'closed')

  // A colleague holds it: we can watch, but not reply.
  const showTakenOverStatus = computed(
    () => handler.value.kind === 'human' && chat.value.user_id !== currentUserId
  )

  /** One sentence explaining why the composer is unavailable, per handler. */
  const handlerCaption = computed(() => {
    switch (handler.value.kind) {
      case 'ai':
        return 'This chat is being handled by AI'
      case 'waiting':
        // Deliberately not "the AI handed this over": with AI switched off on
        // the agent there was never an AI in the conversation to hand it on.
        return 'This chat is waiting for someone to pick it up'
      case 'closed':
        return 'This chat has been closed'
      default:
        return `This chat is being handled by ${handler.value.label}`
    }
  })

  const canSendMessage = computed(() => {
    // Cannot send if chat is closed
    if (isChatClosed.value) return false
    
    // Cannot send if needs takeover or taken by another user
    return !showTakeoverButton.value && !showTakenOverStatus.value
  })

  const scrollToBottom = async () => {
    // Wait for the new message to render, otherwise scrollHeight is still the
    // pre-append height and the list stops short of the bottom.
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }

  // Watch for changes in messages and scroll to bottom
  watch(() => chat.value.messages, (messages) => {
    scrollToBottom()
    // A customer message reopens the messaging window, so the closed-window
    // notice must go — otherwise it sits above a composer that now works.
    if (messages?.[messages.length - 1]?.message_type === 'user') {
      templateCanReopen.value = false
    }
  }, { deep: true })

  // The same composable instance serves whichever chat is selected, so a
  // closed window learned about in one conversation must not follow us to the
  // next. Sending a template reopens the window, which also clears it.
  watch(() => chat.value.session_id, () => {
    templateCanReopen.value = false
  })

  const clearTemplateSuggestion = () => {
    templateCanReopen.value = false
  }

  const updateChat = (newChat: ChatDetail) => {
    chat.value = { ...newChat }
    // Emit event to clear unreads
    emit('clearUnread', newChat.session_id)
    // Emit chatUpdated event to ensure the parent component updates
    emit('chatUpdated', chat.value)
  }

  // Replace chat state from parent props without emitting events
  const replaceChatFromProps = (newChat: ChatDetail) => {
    chat.value = { ...newChat }
  }

  const sendMessage = async () => {
    if (!newMessage.value.trim() || !canSendMessage.value) return

    try {
      const messageText = newMessage.value
      // Clear input immediately for better UX
      newMessage.value = ''

      // Add message locally first
      const timestamp = new Date().toISOString()
      // Ties this optimistic message to the row the backend stores, so its
      // delivery receipts and errors find it exactly (agent_message_stored)
      const clientId = newClientId()
      const localMessage: Message = {
        message: messageText,
        message_type: 'agent',
        created_at: timestamp,
        session_id: chat.value.session_id,
        client_id: clientId
      }

      // Update chat with new message
      chat.value.messages.push(localMessage)
      chat.value.updated_at = timestamp

      // Emit message through socket
      socketService.emit('agent_message', {
        message: messageText,
        session_id: chat.value.session_id,
        message_type: 'agent',
        created_at: timestamp,
        client_id: clientId
      })

      scrollToBottom()
    } catch (err) {
      console.error('Failed to send message:', err)
      toast.error('Failed to send message', {
        description: 'Please try again',
        duration: 4000,
        closeButton: true
      })
    }
  }

  const handleTakeover = async () => {
    try {
      isLoading.value = true
      await chatService.takeoverChat(chat.value.session_id)
      
      // Show success toast
      toast.success('Chat taken over successfully', {
        description: 'You can now send messages in this chat',
        duration: 4000,
        closeButton: true
      })
      const userName = userService.getUserName()
      const userId = userService.getUserId()

      // Update local chat state
      chat.value = {
        ...chat.value,
        status: 'open',
        user_id: userId,
        user_name: userName
      }

      socketService.emit('taken_over', { session_id: chat.value.session_id, user_name: userName, profile_picture: userService.getCurrentUser()?.profile_pic ? userService.getCurrentUser()?.profile_pic : '' })
      
      // Emit refresh event to update chat status
      emit('refresh')
      // Also emit chatUpdated event to ensure the parent component updates
      emit('chatUpdated', chat.value)
    } catch (err: any) {
      console.error('Failed to takeover chat:', err)
      
      // Show error toast with specific message if available
      toast.error('Failed to take over chat', {
        description: err.response?.data?.detail || 'Please try again',
        duration: 4000,
        closeButton: true
      })
    } finally {
      isLoading.value = false
    }
  }

  const handleRouteToHuman = async () => {
    try {
      isLoading.value = true
      const updated = await routeChatToHuman(chat.value.session_id)
      if (!updated) return

      // The endpoint returns the whole thread back, so take its state rather
      // than guessing at a local patch.
      chat.value = updated
      emit('refresh')
      emit('chatUpdated', chat.value)
    } finally {
      isLoading.value = false
    }
  }

  /** Ends the chat; true once it is closed */
  const endChat = async (requestRating = true): Promise<boolean> => {
    try {
      isLoading.value = true

      // Only the web widget can render a rating; on external channels the ask
      // is dropped and the closing message says nothing about rating.
      const askRating = requestRating && canRequestRating(chat.value.channel)

      // Create end chat message
      const timestamp = new Date().toISOString()
      const clientId = newClientId()
      const endChatMessage = {
        message: endChatMessageFor(chat.value.channel),
        message_type: "system",
        created_at: timestamp,
        session_id: chat.value.session_id,
        client_id: clientId,
        end_chat: true,
        request_rating: askRating,
        end_chat_reason: "AGENT_REQUEST",
        end_chat_description: "Agent manually ended the chat"

      }

      // Add message locally
      chat.value.messages.push(endChatMessage)

      // Update chat status locally
      chat.value.status = 'closed'
      chat.value.updated_at = timestamp

      // Emit message through socket to end chat
      socketService.emit('agent_message', {
        message: endChatMessage.message,
        session_id: chat.value.session_id,
        message_type: endChatMessage.message_type,
        created_at: timestamp,
        client_id: clientId,
        end_chat: true,
        request_rating: askRating,
        end_chat_reason: "AGENT_REQUEST",
        end_chat_description: "Agent manually ended the chat"
      })

      // Show success toast
      toast.success('Chat ended successfully', {
        description: askRating ? 'Customer will be asked for feedback' : 'Chat has been closed',
        duration: 4000,
        closeButton: true
      })
      
      // Shown closed now; the inbox refetches once the server says it's
      // stored (room_event 'closed'): a refetch sooner gets it back open
      emit('chatUpdated', chat.value)
      
      scrollToBottom()
      return true
    } catch (err) {
      console.error('Failed to end chat:', err)
      toast.error('Failed to end chat', {
        description: 'Please try again',
        duration: 4000,
        closeButton: true
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  // On external channels a send can fail after the message is already stored
  // (typically once WhatsApp's 24h window closes). Without this the agent sees
  // their message sitting in the thread and assumes it arrived. The event names
  // the exact message; one not on screen is left for the next refetch.
  const handleDeliveryError = (data: DeliveryErrorEvent) => {
    if (data?.type !== 'delivery_error' || data.session_id !== chat.value.session_id) return
    const failed = findMessage(chat.value.messages, { messageId: data.message_id, clientId: data.client_id })
    if (failed) {
      failed.attributes = { ...failed.attributes, delivery_status: 'failed' }
    }
    if (data.can_template) templateCanReopen.value = true
    toast.error('Message not delivered', {
      description: data.error,
      duration: 6000,
      closeButton: true
    })
  }

  // An optimistic message learns its row id, which receipts are keyed by
  const handleAgentMessageStored = (data: AgentMessageStoredEvent) => {
    if (data?.session_id !== chat.value.session_id || data.message_id == null) return
    const message = findMessage(chat.value.messages, { clientId: data.client_id })
    if (message) message.id = data.message_id
  }

  const handleMessageStatus = (data: MessageStatusEvent) => {
    if (data?.session_id !== chat.value.session_id) return
    const message = findMessage(chat.value.messages, {
      messageId: data.message_id,
      externalId: data.external_message_id
    })
    if (!message) return
    message.external_message_id = data.external_message_id ?? message.external_message_id
    message.channel_status = data.channel_status
    if (data.delivery_status) {
      message.attributes = { ...message.attributes, delivery_status: data.delivery_status }
    }
  }

  // The visitor rated an AI reply (or took the rating back) while this chat is open
  const handleMessageFeedback = (data: MessageFeedbackEvent) => {
    if (data?.session_id !== chat.value.session_id) return
    const message = findMessage(chat.value.messages, { messageId: data.message_id })
    if (!message) return
    message.attributes = withVisitorFeedback(message.attributes, data.value)
  }

  const setupSocketListeners = () => {
    socketService.on('error', handleDeliveryError)
    socketService.on('agent_message_stored', handleAgentMessageStored)
    socketService.on('message_status', handleMessageStatus)
    socketService.on('message_feedback', handleMessageFeedback)
  }

  const cleanupSocketListeners = () => {
    socketService.off('error', handleDeliveryError)
    socketService.off('agent_message_stored', handleAgentMessageStored)
    socketService.off('message_status', handleMessageStatus)
    socketService.off('message_feedback', handleMessageFeedback)
  }

  const handleSocketReconnect = () => {
    cleanupSocketListeners()
    setupSocketListeners()
  }

  onMounted(() => {
    setupSocketListeners()
    socketService.onReconnect(handleSocketReconnect)
  })

  onBeforeUnmount(() => {
    cleanupSocketListeners()
    socketService.offReconnect(handleSocketReconnect)
  })

  const formattedMessages = computed(() => {
    const formatted = chat.value.messages.map(msg => ({
      ...msg,
      timeAgo: formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })
    }))
    
    // Debug: Log messages with attachments
    formatted.forEach((msg, idx) => {
      if (msg.attachments && msg.attachments.length > 0) {
        console.log(`[Message ${idx}] Has ${msg.attachments.length} attachments:`, msg.attachments)
      }
    })
    
    return formatted
  })

  return {
    newMessage,
    messagesContainer,
    formattedMessages,
    isLoading,
    showTakeoverButton,
    showTakenOverStatus,
    isChatClosed,
    canSendMessage,
    scrollToBottom,
    sendMessage,
    handleTakeover,
    handleRouteToHuman,
    isWaitingForHuman,
    handlerCaption,
    updateChat,
    replaceChatFromProps,
    handledByAI,
    endChat,
    templateCanReopen,
    clearTemplateSuggestion
  }
} 