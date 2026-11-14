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

import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { chatService } from '@/services/chat'
import { socketService } from '@/services/socket'
import { userService } from '@/services/user'
import type { ChatDetail, Message } from '@/types/chat'
import emitter from '@/utils/emitter'

/** chat_reply: a new message in a conversation this agent's room hears about. */
export interface ChatReplyEvent {
  message: string
  type: string
  agent_name?: string
  created_at: string
  session_id: string
  attributes?: Record<string, any>
  attachments?: Message['attachments']
}

/** room_event: who holds a conversation changed somewhere else. */
interface RoomEvent {
  type?: string
  session_id?: string
}

/** Room events that move a conversation into or out of someone's inbox */
const OWNERSHIP_EVENTS = new Set(['reassigned', 'reassigned_from_you', 'released_to_ai'])

/** chat_reply's types, as stored messages spell them */
const REPLY_TYPES: Record<string, string> = { user_message: 'user', agent_message: 'agent', bot_message: 'bot' }

/** The message a chat_reply event adds to the open thread. */
export function messageFromReply(data: ChatReplyEvent): Message {
  const message: Message = {
    message: data.message,
    message_type: REPLY_TYPES[data.type] ?? data.type,
    created_at: new Date(data.created_at).toISOString(),
    session_id: data.session_id,
    attributes: data.attributes || {},
    agent_name: data.agent_name,
    attachments: data.attachments || undefined,
  }
  if (data.attributes?.shopify_output && typeof data.attributes.shopify_output === 'object') {
    message.message_type = 'product'
    message.shopify_output = data.attributes.shopify_output
  }
  return message
}

/**
 * The open conversation, and the live messages for every conversation this
 * agent is in the room of (their own chats): appended to the open thread,
 * counted as unread on the others' rows.
 */
export function useInboxThread(onReply?: (data: ChatReplyEvent) => void) {
  const chat = ref<ChatDetail | null>(null)
  const selectedId = ref<string | null>(null)
  const loadingChat = ref(false)
  const unread = reactive<Record<string, number>>({})
  // The same reply can arrive twice (the user room and the org room)
  const seen = new Set<string>()

  /** Open a conversation; `force` refetches the open one (the AI's latest turns aren't streamed). */
  async function open(sessionId: string, force = false): Promise<void> {
    if (!force && chat.value?.session_id === sessionId) return
    selectedId.value = sessionId
    delete unread[sessionId]
    loadingChat.value = true
    try {
      const detail = await chatService.getChatDetail(sessionId)
      // Another conversation was opened while this one loaded
      if (selectedId.value === sessionId) chat.value = detail
    } catch (err) {
      console.error('Failed to load conversation:', err)
    } finally {
      if (selectedId.value === sessionId) loadingChat.value = false
    }
  }

  function close(): void {
    chat.value = null
    selectedId.value = null
  }

  /** Replace the open conversation with a newer copy of it (after an action). */
  function update(next: ChatDetail): void {
    if (chat.value?.session_id === next.session_id) chat.value = next
  }

  function handleReply(data: ChatReplyEvent): void {
    const key = `${data.session_id}-${data.created_at}`
    if (seen.has(key)) return
    seen.add(key)

    if (selectedId.value !== data.session_id) {
      unread[data.session_id] = (unread[data.session_id] ?? 0) + 1
    } else if (chat.value) {
      chat.value = { ...chat.value, messages: [...chat.value.messages, messageFromReply(data)], updated_at: data.created_at }
    }
    onReply?.(data)
  }

  // A teammate reassigned or released a chat: the views' counts and rows
  // change, and the open thread may no longer be ours to answer.
  function handleRoomEvent(data: RoomEvent): void {
    if (!data?.type || !OWNERSHIP_EVENTS.has(data.type)) return
    emitter.emit('inbox-changed')
    if (data.session_id && data.session_id === selectedId.value) void open(data.session_id, true)
  }

  const userRoom = () => {
    const userId = userService.getUserId()
    return userId ? `user_${userId}` : null
  }

  function listen(): void {
    socketService.on('chat_reply', handleReply)
    socketService.on('room_event', handleRoomEvent)
  }

  function unlisten(): void {
    socketService.off('chat_reply', handleReply)
    socketService.off('room_event', handleRoomEvent)
  }

  function rejoin(): void {
    unlisten()
    listen()
    const room = userRoom()
    if (room) socketService.emit('join_room', { session_id: room })
  }

  onMounted(() => {
    socketService.connect()
    listen()
    socketService.onReconnect(rejoin)
    const room = userRoom()
    if (room) socketService.emit('join_room', { session_id: room })
  })

  onBeforeUnmount(() => {
    const room = userRoom()
    if (room) socketService.emit('leave_room', { session_id: room })
    unlisten()
    socketService.offReconnect(rejoin)
  })

  return { chat, selectedId, loadingChat, unread, open, close, update }
}
