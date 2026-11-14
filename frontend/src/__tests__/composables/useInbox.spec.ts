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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, reactive } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import emitter from '@/utils/emitter'

const route = reactive<{ query: Record<string, unknown> }>({ query: {} })
const router = {
  replace: vi.fn(({ query }) => { route.query = query }),
  push: vi.fn(),
  // patchQuery reads the URL as the last change left it
  currentRoute: { get value() { return route } },
}
vi.mock('vue-router', () => ({ useRoute: () => route, useRouter: () => router }))

const chat = vi.hoisted(() => ({ getRecentChats: vi.fn(), getInboxCounts: vi.fn(), getChatDetail: vi.fn() }))
vi.mock('@/services/chat', () => ({ chatService: chat, localDayStart: () => '2026-11-13T00:00:00.000Z' }))

const socket = vi.hoisted(() => {
  const handlers: Record<string, (data: unknown) => void> = {}
  return {
    handlers,
    connect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn((event: string, fn: (data: unknown) => void) => { handlers[event] = fn }),
    off: vi.fn(),
    onReconnect: vi.fn(),
    offReconnect: vi.fn(),
  }
})
vi.mock('@/services/socket', () => ({ socketService: socket }))
vi.mock('@/services/user', () => ({ userService: { getUserId: () => 'me' } }))

import { INBOX_PAGE_SIZE, INBOX_POLL_MS, LIST_REFRESH_EVERY, SEARCH_DEBOUNCE_MS, useInboxList } from '@/composables/useInboxList'
import { ACTIVITY_REFETCH_MS, keepPending, useInboxThread } from '@/composables/useInboxThread'
import { useInboxShortcuts } from '@/composables/useInboxShortcuts'

const rows = (n: number, from = 0) => Array.from({ length: n }, (_, i) => ({ session_id: `s${from + i}` }))
const counts = { open: 2, waiting_for_human: 1, assigned_to_me: 0, ai_handling: 1, negative: 0, resolved_by_ai_today: 0, channels: { web: 2 } }

function host<T>(use: () => T) {
  let result!: T
  const wrapper = mount(defineComponent({ setup() { result = use(); return () => h('div') } }), { attachTo: document.body })
  return { wrapper, result: () => result }
}

beforeEach(() => {
  route.query = {}
  router.replace.mockClear()
  router.push.mockClear()
  chat.getRecentChats.mockReset().mockResolvedValue(rows(2))
  chat.getInboxCounts.mockReset().mockResolvedValue(counts)
  chat.getChatDetail.mockReset().mockImplementation(async (id: string) => ({ session_id: id, messages: [] }))
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('useInboxList', () => {
  it("loads All open, newest first, with the viewer's day start, and every view's count", async () => {
    const { result, wrapper } = host(useInboxList)
    await flushPromises()

    expect(chat.getRecentChats).toHaveBeenCalledWith({
      view: 'open', channel: undefined, q: undefined, agent_id: undefined, user_id: undefined, sort: 'newest',
      today_start: '2026-11-13T00:00:00.000Z', skip: 0, limit: INBOX_PAGE_SIZE,
    })
    expect(result().conversations.value).toHaveLength(2)
    expect(result().currentView.value).toMatchObject({ id: 'open', count: 2 })
    wrapper.unmount()
  })

  it('opens the view in the URL, and the older closed-chats link', async () => {
    route.query = { view: 'channel:whatsapp' }
    const first = host(useInboxList)
    await flushPromises()
    expect(chat.getRecentChats).toHaveBeenLastCalledWith(expect.objectContaining({ view: 'open', channel: 'whatsapp' }))
    first.wrapper.unmount()

    route.query = { status: 'closed' }
    const second = host(useInboxList)
    await flushPromises()
    expect(chat.getRecentChats).toHaveBeenLastCalledWith(expect.objectContaining({ view: 'closed' }))
    second.wrapper.unmount()
  })

  it('selecting a view reloads it in its own order and keeps it in the URL', async () => {
    const { result, wrapper } = host(useInboxList)
    await flushPromises()

    result().select({ view: 'waiting', channel: null })
    await flushPromises()

    expect(chat.getRecentChats).toHaveBeenLastCalledWith(expect.objectContaining({ view: 'waiting', sort: 'waiting_longest' }))
    expect(router.replace).toHaveBeenLastCalledWith({ query: { view: 'waiting' } })
    result().select({ view: 'open', channel: null })
    await flushPromises()
    expect(router.replace).toHaveBeenLastCalledWith({ query: { view: undefined } })
    wrapper.unmount()
  })

  it('searches once typing pauses', async () => {
    vi.useFakeTimers()
    const { result, wrapper } = host(useInboxList)
    await flushPromises()
    chat.getRecentChats.mockClear()

    result().search.value = 'pri'
    await flushPromises()
    result().search.value = 'priya  '
    await flushPromises()
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
    await flushPromises()

    expect(chat.getRecentChats).toHaveBeenCalledTimes(1)
    expect(chat.getRecentChats).toHaveBeenCalledWith(expect.objectContaining({ q: 'priya' }))
    wrapper.unmount()
  })

  it("drops an older view's answer that arrives after the newer one", async () => {
    const { result, wrapper } = host(useInboxList)
    await flushPromises()
    let finishSlow!: (value: unknown) => void
    chat.getRecentChats.mockImplementationOnce(() => new Promise((resolve) => { finishSlow = resolve }))
    chat.getRecentChats.mockImplementationOnce(async () => rows(1, 50))

    result().select({ view: 'mine', channel: null })
    await flushPromises()
    result().select({ view: 'ai', channel: null })
    await flushPromises()
    finishSlow(rows(3, 90))
    await flushPromises()

    expect(result().conversations.value.map((c) => c.session_id)).toEqual(['s50'])
    wrapper.unmount()
  })

  it('loads more as you scroll, without repeating a row that moved up a page', async () => {
    chat.getRecentChats.mockResolvedValueOnce(rows(INBOX_PAGE_SIZE))
    const { result, wrapper } = host(useInboxList)
    await flushPromises()
    expect(result().hasMore.value).toBe(true)

    chat.getRecentChats.mockResolvedValueOnce([{ session_id: 's24' }, ...rows(3, 100)])
    await result().loadMore()

    expect(chat.getRecentChats).toHaveBeenLastCalledWith(expect.objectContaining({ skip: INBOX_PAGE_SIZE }))
    expect(result().conversations.value).toHaveLength(INBOX_PAGE_SIZE + 3)
    expect(result().hasMore.value).toBe(false)
    wrapper.unmount()
  })

  it('says so when the list fails, and keeps the views without counts when those fail', async () => {
    chat.getRecentChats.mockRejectedValueOnce(new Error('down'))
    chat.getInboxCounts.mockRejectedValueOnce(new Error('down'))
    const { result, wrapper } = host(useInboxList)
    await flushPromises()

    expect(result().error.value).toBe('Conversations could not be loaded.')
    expect(result().counts.value).toBeNull()
    expect(result().viewGroups.value.length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('refreshes quietly when this tab changes a chat, and on a timer while visible', async () => {
    vi.useFakeTimers()
    const { result, wrapper } = host(useInboxList)
    await flushPromises()
    chat.getInboxCounts.mockClear()
    chat.getRecentChats.mockClear()

    emitter.emit('inbox-changed')
    await flushPromises()
    expect(chat.getInboxCounts).toHaveBeenCalledTimes(1)
    expect(chat.getRecentChats).toHaveBeenCalledTimes(1)
    expect(result().loading.value).toBe(false)

    wrapper.unmount()
    emitter.emit('inbox-changed')
    vi.advanceTimersByTime(INBOX_POLL_MS)
    expect(chat.getInboxCounts).toHaveBeenCalledTimes(1)
  })

  it('polls the counts, and the list only when they moved or every few polls', async () => {
    vi.useFakeTimers()
    const { wrapper } = host(useInboxList)
    await flushPromises()
    chat.getInboxCounts.mockClear()
    chat.getRecentChats.mockClear()

    vi.advanceTimersByTime(INBOX_POLL_MS)
    await flushPromises()
    expect(chat.getInboxCounts).toHaveBeenCalledTimes(1)
    expect(chat.getRecentChats).not.toHaveBeenCalled()

    chat.getInboxCounts.mockResolvedValueOnce({ open: 99 })
    vi.advanceTimersByTime(INBOX_POLL_MS)
    await flushPromises()
    expect(chat.getRecentChats).toHaveBeenCalledTimes(1)

    chat.getInboxCounts.mockResolvedValue({ open: 99 })
    for (let i = 0; i < LIST_REFRESH_EVERY; i++) {
      vi.advanceTimersByTime(INBOX_POLL_MS)
      await flushPromises()
    }
    expect(chat.getRecentChats).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('narrows the view to an agent and a teammate, and says so', async () => {
    const { result, wrapper } = host(useInboxList)
    await flushPromises()
    expect(result().narrowed.value).toBe(false)

    result().filters.value = { agentId: 'a1', assigneeId: 'u2' }
    await flushPromises()

    expect(chat.getRecentChats).toHaveBeenLastCalledWith(expect.objectContaining({ agent_id: 'a1', user_id: 'u2' }))
    expect(result().narrowed.value).toBe(true)
    wrapper.unmount()
  })

  describe('presets (saved views)', () => {
    const preset = (id: string, fields: Record<string, unknown> = {}) => ({
      id, label: 'Refunds on WhatsApp', title: 'Refunds on WhatsApp', selection: { view: 'waiting', channel: 'whatsapp' },
      count: null, tone: 'plain', empty: 'No conversations match this view.',
      preset: { selection: { view: 'waiting', channel: 'whatsapp' }, sort: 'waiting_longest', search: 'refund', agentId: 'a1', assigneeId: '', ...fields },
    }) as never

    it('are listed under Saved views, after the built-in ones', async () => {
      const { result, wrapper } = host(useInboxList)
      result().setPresets([preset('saved:1')])
      const saved = result().viewGroups.value.find((g) => g.heading === 'Saved views')
      expect(saved?.items.map((i) => i.id)).toEqual(['negative', 'saved:1'])
      wrapper.unmount()
    })

    it('bring back the whole list state, and stay selected while it holds', async () => {
      const { result, wrapper } = host(useInboxList)
      await flushPromises()
      const item = preset('saved:1')
      result().setPresets([item])
      result().applyPreset(item)
      await flushPromises()

      expect(chat.getRecentChats).toHaveBeenLastCalledWith(expect.objectContaining({
        view: 'waiting', channel: 'whatsapp', sort: 'waiting_longest', q: 'refund', agent_id: 'a1',
      }))
      expect(router.replace).toHaveBeenLastCalledWith({ query: { view: 'saved:1' } })
      expect(result().selectedId.value).toBe('saved:1')
      expect(result().currentView.value.title).toBe('Refunds on WhatsApp')

      // A change of filter: the list no longer shows the view
      result().search.value = 'exchange'
      expect(result().selectedId.value).toBe('channel:whatsapp')
      expect(result().currentView.value.id).toBe('channel:whatsapp')
      wrapper.unmount()
    })

    it('a built-in view takes over from the preset', async () => {
      const { result, wrapper } = host(useInboxList)
      const item = preset('saved:1')
      result().setPresets([item])
      result().applyPreset(item)
      result().select({ view: 'mine', channel: null })
      expect(result().selectedId.value).toBe('mine')
      expect(result().search.value).toBe('')
      wrapper.unmount()
    })

    it('a link to one applies it once the presets arrive, and only then', async () => {
      route.query = { view: 'saved:2' }
      const { result, wrapper } = host(useInboxList)
      await flushPromises()
      expect(result().selectedId.value).toBe('open')

      result().setPresets([preset('saved:1')])
      expect(result().selectedId.value).toBe('open')
      result().setPresets([preset('saved:1'), preset('saved:2', { search: 'late' })])
      expect(result().selectedId.value).toBe('saved:2')
      expect(result().search.value).toBe('late')
      // A later refresh of the list doesn't snap back to it
      result().select({ view: 'mine', channel: null })
      result().setPresets([preset('saved:2')])
      expect(result().selectedId.value).toBe('mine')
      wrapper.unmount()
    })

    it('one just saved from the list is selected without reloading it', async () => {
      const { result, wrapper } = host(useInboxList)
      await flushPromises()
      chat.getRecentChats.mockClear()
      result().setPresets([preset('saved:3', { selection: { view: 'open', channel: null }, sort: 'newest', search: '', agentId: '' })])
      result().markPreset('saved:3')
      await flushPromises()
      expect(result().selectedId.value).toBe('saved:3')
      expect(chat.getRecentChats).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  it('patches a row in place', async () => {
    const { result, wrapper } = host(useInboxList)
    await flushPromises()
    result().patchConversation('s1', { user_id: 'me' })
    result().patchConversation('missing', { user_id: 'me' })
    expect(result().conversations.value[1]).toMatchObject({ session_id: 's1', user_id: 'me' })
    wrapper.unmount()
  })
})

describe('useInboxThread', () => {
  it('opens a conversation once, and again when forced', async () => {
    const { result, wrapper } = host(() => useInboxThread())
    await result().open('s1')
    await result().open('s1')
    await result().open('s1', true)
    expect(chat.getChatDetail).toHaveBeenCalledTimes(2)
    expect(result().chat.value?.session_id).toBe('s1')
    wrapper.unmount()
  })

  it('comes back to the conversation on screen while another one loads (J then K)', async () => {
    const { result, wrapper } = host(() => useInboxThread())
    await result().open('s1')
    let finishOther!: (value: unknown) => void
    chat.getChatDetail.mockImplementationOnce(() => new Promise((resolve) => { finishOther = resolve }))
    const other = result().open('s2')
    await result().open('s1')
    expect(result().selectedId.value).toBe('s1')
    expect(result().loadingChat.value).toBe(false)
    finishOther({ session_id: 's2', messages: [] })
    await other
    expect(result().chat.value?.session_id).toBe('s1')
    wrapper.unmount()
  })

  it('keeps the last one asked for when an older detail arrives late', async () => {
    const { result, wrapper } = host(() => useInboxThread())
    let finishSlow!: (value: unknown) => void
    chat.getChatDetail.mockImplementationOnce(() => new Promise((resolve) => { finishSlow = resolve }))
    const slow = result().open('s1')
    await result().open('s2')
    finishSlow({ session_id: 's1', messages: [] })
    await slow
    expect(result().chat.value?.session_id).toBe('s2')
    wrapper.unmount()
  })

  it("adds a live reply to the open thread and counts others' as unread, once each", async () => {
    const onReply = vi.fn()
    const { result, wrapper } = host(() => useInboxThread(onReply))
    await result().open('s1')

    const reply = (session_id: string, created_at: string) => ({ message: 'hi', type: 'user', session_id, created_at })
    socket.handlers.chat_reply(reply('s1', '2026-11-13T11:00:00Z'))
    socket.handlers.chat_reply(reply('s1', '2026-11-13T11:00:00Z'))
    socket.handlers.chat_reply(reply('s2', '2026-11-13T11:01:00Z'))

    expect(result().chat.value?.messages).toHaveLength(1)
    expect(result().unread).toEqual({ s2: 1 })
    expect(onReply).toHaveBeenCalledTimes(2)

    await result().open('s2')
    expect(result().unread).toEqual({})
    wrapper.unmount()
  })

  it("refreshes when a teammate moves a chat, and the open one if it's that chat", async () => {
    const changed = vi.fn()
    emitter.on('inbox-changed', changed)
    const { result, wrapper } = host(() => useInboxThread())
    await result().open('s1')
    chat.getChatDetail.mockClear()

    socket.handlers.room_event({ type: 'released_to_ai', session_id: 's1' })
    socket.handlers.room_event({ type: 'typing', session_id: 's1' })
    await flushPromises()

    expect(changed).toHaveBeenCalledTimes(1)
    expect(chat.getChatDetail).toHaveBeenCalledTimes(1)
    emitter.off('inbox-changed', changed)
    wrapper.unmount()
  })

  it('keeps a reply still on its way to the server through a refresh, without doubling a stored one', () => {
    const msg = (message: string, extra: object) => ({ message, message_type: 'agent', created_at: '', session_id: 's1', ...extra })
    const detail = { session_id: 's1', messages: [msg('Stored', { id: 1 })] } as never
    const previous = [msg('Stored', { client_id: 'a' }), msg('On its way', { client_id: 'b' })]
    expect(keepPending(detail, previous as never).messages.map((m) => m.message)).toEqual(['Stored', 'On its way'])
    expect(keepPending(detail, [])).toBe(detail)
  })

  it('keeps a second "Thanks!" that is still on its way, though an earlier one is stored', () => {
    const msg = (extra: object) => ({ message: 'Thanks!', message_type: 'agent', created_at: '', session_id: 's1', ...extra })
    const detail = { session_id: 's1', messages: [msg({ id: 1 })] } as never
    const previous = [msg({ id: 1 }), msg({ client_id: 'b' })]
    expect(keepPending(detail, previous as never).messages).toHaveLength(2)
  })

  it('holds a reply heard while the conversation loads, and never shows it in the old one', async () => {
    const { result, wrapper } = host(() => useInboxThread())
    await result().open('s1')
    let finish!: (value: unknown) => void
    chat.getChatDetail.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve }))
    const opening = result().open('s2')

    socket.handlers.chat_reply({ message: 'Where is my order?', type: 'user', session_id: 's2', created_at: '2026-11-13T11:00:00Z' })
    expect(result().chat.value?.session_id).toBe('s1')
    expect(result().chat.value?.messages).toHaveLength(0)

    finish({ session_id: 's2', messages: [] })
    await opening
    expect(result().chat.value?.messages.map((m) => m.message)).toEqual(['Where is my order?'])
    wrapper.unmount()
  })

  it("ignores its own note, refreshes for a teammate's", async () => {
    const changed = vi.fn()
    emitter.on('inbox-changed', changed)
    const { result, wrapper } = host(() => useInboxThread())
    await result().open('s1')
    socket.handlers.room_event({ type: 'note_added', session_id: 's1', author_id: 'me' })
    socket.handlers.room_event({ type: 'note_added', session_id: 's1', author_id: 'asha' })
    expect(changed).toHaveBeenCalledTimes(1)
    emitter.off('inbox-changed', changed)
    wrapper.unmount()
  })

  it('refetches the open chat nobody holds when it gets a message, once for a burst', async () => {
    vi.useFakeTimers()
    const { result, wrapper } = host(() => useInboxThread())
    await result().open('s1')
    chat.getChatDetail.mockClear().mockResolvedValue({
      session_id: 's1', user_id: null,
      messages: [{ message: 'Hello! How can I help?', message_type: 'bot', created_at: '2026-11-14T10:00:00Z' }],
    })

    // The customer's message, then the AI's answer
    socket.handlers.conversation_activity({ session_id: 's1' })
    socket.handlers.conversation_activity({ session_id: 's1' })
    // Another conversation: not open here
    socket.handlers.conversation_activity({ session_id: 's2' })
    socket.handlers.conversation_activity({})
    await vi.advanceTimersByTimeAsync(ACTIVITY_REFETCH_MS)

    expect(chat.getChatDetail).toHaveBeenCalledTimes(1)
    expect(result().chat.value?.messages.map((m) => m.message)).toEqual(['Hello! How can I help?'])
    expect(result().unread).toEqual({})
    wrapper.unmount()
  })

  it('leaves a chat a person holds to its live replies', async () => {
    vi.useFakeTimers()
    chat.getChatDetail.mockResolvedValue({ session_id: 's1', user_id: 'me', messages: [] })
    const { result, wrapper } = host(() => useInboxThread())
    await result().open('s1')
    chat.getChatDetail.mockClear()

    socket.handlers.conversation_activity({ session_id: 's1' })
    await vi.advanceTimersByTimeAsync(ACTIVITY_REFETCH_MS)

    expect(chat.getChatDetail).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('drops a pending refetch when another chat is opened, or the inbox closes', async () => {
    vi.useFakeTimers()
    const { result, wrapper } = host(() => useInboxThread())
    await result().open('s1')
    socket.handlers.conversation_activity({ session_id: 's1' })
    await result().open('s2')
    chat.getChatDetail.mockClear()
    await vi.advanceTimersByTimeAsync(ACTIVITY_REFETCH_MS)
    expect(chat.getChatDetail).not.toHaveBeenCalled()

    socket.handlers.conversation_activity({ session_id: 's2' })
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(ACTIVITY_REFETCH_MS)
    expect(chat.getChatDetail).not.toHaveBeenCalled()
  })

  it("joins the agent's own room for live replies, and leaves it", () => {
    const { wrapper } = host(() => useInboxThread())
    expect(socket.emit).toHaveBeenCalledWith('join_room', { session_id: 'user_me' })
    wrapper.unmount()
    expect(socket.emit).toHaveBeenCalledWith('leave_room', { session_id: 'user_me' })
  })
})

describe('useInboxShortcuts', () => {
  const handlers = () => ({ next: vi.fn(), previous: vi.fn(), close: vi.fn(), search: vi.fn(), dismiss: vi.fn(), help: vi.fn() })
  const press = (key: string, target: EventTarget = document.body, init: KeyboardEventInit = {}) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }))

  it('maps J, K, E, /, Esc and ? to their actions', () => {
    const h = handlers()
    const { wrapper } = host(() => useInboxShortcuts(h))

    for (const key of ['j', 'K', 'e', '/', 'Escape', '?']) press(key)

    expect([h.next, h.previous, h.close, h.search, h.dismiss, h.help].map((f) => f.mock.calls.length)).toEqual([1, 1, 1, 1, 1, 1])
    wrapper.unmount()
    press('j')
    expect(h.next).toHaveBeenCalledTimes(1)
  })

  it('leaves letters alone while typing, with a modifier, or under a dialog or menu', () => {
    const h = handlers()
    const { wrapper } = host(() => useInboxShortcuts(h))
    const input = document.createElement('textarea')
    document.body.appendChild(input)

    press('j', input)
    press('e', document.body, { metaKey: true })
    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'dialog')
    dialog.setAttribute('aria-modal', 'true')
    document.body.appendChild(dialog)
    press('j')
    press('Escape')

    expect(h.next).not.toHaveBeenCalled()
    expect(h.close).not.toHaveBeenCalled()
    expect(h.dismiss).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('still closes the drawer with Escape from inside a box', () => {
    const h = handlers()
    const { wrapper } = host(() => useInboxShortcuts(h))
    const input = document.createElement('input')
    document.body.appendChild(input)
    press('Escape', input)
    expect(h.dismiss).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})
