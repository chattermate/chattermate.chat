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
const router = { replace: vi.fn(({ query }) => { route.query = query }), push: vi.fn() }
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

import { INBOX_PAGE_SIZE, INBOX_POLL_MS, SEARCH_DEBOUNCE_MS, useInboxList } from '@/composables/useInboxList'
import { useInboxThread } from '@/composables/useInboxThread'
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
    expect(result().loading.value).toBe(false)

    vi.advanceTimersByTime(INBOX_POLL_MS)
    await flushPromises()
    expect(chat.getInboxCounts).toHaveBeenCalledTimes(2)
    expect(chat.getRecentChats).toHaveBeenCalledTimes(2)

    wrapper.unmount()
    emitter.emit('inbox-changed')
    vi.advanceTimersByTime(INBOX_POLL_MS)
    expect(chat.getInboxCounts).toHaveBeenCalledTimes(2)
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
