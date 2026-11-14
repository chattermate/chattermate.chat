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
import { chatService, inboxChanged } from '@/services/chat'
import { socketService } from '@/services/socket'
import { userService } from '@/services/user'
import type { ChatDetail, Message } from '@/types/chat'

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
  /** note_added: who wrote it */
  author_id?: string
}

/** Room events that change a conversation (who holds it, a teammate's note):
 * the counts and rows refresh, and the open thread with them */
const OWNERSHIP_EVENTS = new Set(['reassigned', 'reassigned_from_you', 'released_to_ai', 'note_added', 'reopened', 'closed', 'message_edited'])

/** conversation_activity: a conversation got a message (any, from anyone). */
interface ActivityEvent {
  session_id?: string
}

/** Several messages in a moment (the customer's, then the AI's) make one refetch */
export const ACTIVITY_REFETCH_MS = 250

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

const textOf = (m: Message) => m.message ?? ''

// A message the team sent, by its kind and words (a reply, or a system line such as the close)
const keyOf = (m: Message) => `${m.message_type}|${m.message ?? ''}`

function countByKey(messages: Message[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const m of messages) counts.set(keyOf(m), (counts.get(keyOf(m)) ?? 0) + 1)
  return counts
}

/**
 * A refetched conversation, plus the replies still on their way to the server:
 * a refresh (a teammate's note, a reassign) must not make one vanish. One the
 * server already stored comes back in the detail and is not added twice.
 *
 * The server doesn't echo client ids, so copies are counted: a pending "Thanks!"
 * was stored only if the detail holds more of them than were already confirmed
 * (a second "Thanks!" in one chat is ordinary).
 */
export function keepPending(detail: ChatDetail, previous: Message[]): ChatDetail {
  const pending = previous.filter((m) => m.client_id && !m.id)
  if (!pending.length) return detail
  const stored = countByKey(detail.messages)
  const confirmed = countByKey(previous.filter((m) => m.id))
  const missing = pending.filter((m) => {
    const key = keyOf(m)
    if ((stored.get(key) ?? 0) <= (confirmed.get(key) ?? 0)) return true
    confirmed.set(key, (confirmed.get(key) ?? 0) + 1)
    return false
  })
  return missing.length ? { ...detail, messages: [...detail.messages, ...missing] } : detail
}

/** Live messages heard while the detail was loading, unless it already has them. */
export function withEarlyReplies(detail: ChatDetail, early: Message[]): ChatDetail {
  const at = (m: Message) => `${Date.parse(m.created_at)}|${textOf(m)}`
  const known = new Set(detail.messages.map(at))
  const missing = early.filter((m) => !known.has(at(m)))
  return missing.length ? { ...detail, messages: [...detail.messages, ...missing] } : detail
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
  // Live replies for the conversation being opened, heard before its detail arrived
  let early: Message[] = []
  // Only the latest load is shown: refetches overlap, and an older one may answer last
  let latestLoad = 0

  /** Open a conversation; `force` refetches the open one (the AI's latest turns aren't streamed). */
  async function open(sessionId: string, force = false): Promise<void> {
    if (!force && chat.value?.session_id === sessionId) {
      // Already on screen. Still select it: a quick J then K comes back to it
      // while the other one loads, and that load is then dropped
      selectedId.value = sessionId
      loadingChat.value = false
      return
    }
    selectedId.value = sessionId
    delete unread[sessionId]
    loadingChat.value = true
    if (chat.value?.session_id !== sessionId) early = []
    const load = ++latestLoad
    try {
      const detail = await chatService.getChatDetail(sessionId)
      // Another conversation was opened, or this one refetched, while this loaded
      if (load !== latestLoad || selectedId.value !== sessionId) return
      // Replies sent from here that the server had not confirmed by the time
      // the detail came back: read now, so one sent while it loaded counts
      const previous = chat.value?.session_id === sessionId ? chat.value.messages : []
      chat.value = withEarlyReplies(keepPending(detail, previous), early)
      early = []
    } catch (err) {
      console.error('Failed to load conversation:', err)
    } finally {
      if (load === latestLoad && selectedId.value === sessionId) loadingChat.value = false
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
    } else if (chat.value?.session_id === data.session_id) {
      chat.value = { ...chat.value, messages: [...chat.value.messages, messageFromReply(data)], updated_at: data.created_at }
    } else {
      // Selected but still loading: the thread on screen is another conversation's
      early.push(messageFromReply(data))
    }
    onReply?.(data)
  }

  // A message in a chat you don't hold: the AI's turns, the queue and a
  // teammate's chat aren't streamed to you as chat_reply, so the open thread
  // refetches. Your own chat streams its messages to you already.
  let activityTimer: ReturnType<typeof setTimeout> | null = null
  function handleActivity(data: ActivityEvent): void {
    const sessionId = data?.session_id
    if (!sessionId || sessionId !== selectedId.value) return
    if (chat.value?.session_id === sessionId && chat.value.user_id && chat.value.user_id === userService.getUserId()) return
    if (activityTimer) clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
      activityTimer = null
      if (selectedId.value === sessionId) void open(sessionId, true)
    }, ACTIVITY_REFETCH_MS)
  }

  // A teammate reassigned or released a chat: the views' counts and rows
  // change, and the open thread may no longer be ours to answer.
  function handleRoomEvent(data: RoomEvent): void {
    if (!data?.type || !OWNERSHIP_EVENTS.has(data.type)) return
    // Our own note is on screen already; refetching could drop a reply that
    // is still on its way to the server
    if (data.type === 'note_added' && data.author_id && data.author_id === userService.getUserId()) return
    inboxChanged()
    if (data.session_id && data.session_id === selectedId.value) void open(data.session_id, true)
  }

  const userRoom = () => {
    const userId = userService.getUserId()
    return userId ? `user_${userId}` : null
  }

  function listen(): void {
    socketService.on('chat_reply', handleReply)
    socketService.on('room_event', handleRoomEvent)
    socketService.on('conversation_activity', handleActivity)
  }

  function unlisten(): void {
    socketService.off('chat_reply', handleReply)
    socketService.off('room_event', handleRoomEvent)
    socketService.off('conversation_activity', handleActivity)
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
    if (activityTimer) clearTimeout(activityTimer)
  })

  return { chat, selectedId, loadingChat, unread, open, close, update }
}
