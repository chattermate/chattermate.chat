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
import { reactive } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'

const route = reactive<{ query: Record<string, unknown> }>({ query: {} })
const router = {
  replace: vi.fn(({ query }) => { route.query = query }),
  push: vi.fn(({ query }) => { route.query = query }),
  back: vi.fn(),
}
vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRoute: () => route,
  useRouter: () => router,
}))

const screen = vi.hoisted(() => ({ mobile: false, tablet: false, belowWide: false }))
vi.mock('@/composables/useBreakpoint', async () => {
  const { ref: vueRef } = await import('vue')
  return {
    useBreakpoint: () => ({ isMobile: vueRef(screen.mobile), isTablet: vueRef(screen.tablet), isBelowWide: vueRef(screen.belowWide) }),
  }
})
vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({
    hasEnterpriseModule: false,
    moduleImports: { promoUsageCard: 'promo' },
    enterpriseComponent: () => ({ render: () => null }),
  }),
}))

const chat = vi.hoisted(() => ({ getRecentChats: vi.fn(), getInboxCounts: vi.fn(), getChatDetail: vi.fn() }))
vi.mock('@/services/chat', () => ({ chatService: chat, localDayStart: () => '2026-11-13T00:00:00.000Z' }))
vi.mock('@/services/socket', () => ({
  socketService: { connect: vi.fn(), emit: vi.fn(), on: vi.fn(), off: vi.fn(), onReconnect: vi.fn(), offReconnect: vi.fn() },
}))
vi.mock('@/services/user', () => ({ userService: { getUserId: () => 'me' } }))
vi.mock('@/services/users', () => ({ listTeammates: vi.fn().mockResolvedValue([]) }))
vi.mock('@/services/agent', () => ({ agentService: { getAgentRoster: vi.fn().mockResolvedValue([]) } }))
vi.mock('@/services/channels', () => ({ default: { listActiveWhatsAppAccounts: vi.fn().mockResolvedValue([]) } }))

import InboxShell from '@/components/inbox/InboxShell.vue'

const conversation = (id: string, name: string) => ({
  session_id: id,
  customer: { id: `c-${id}`, email: `${id}@example.com`, full_name: name },
  agent: { id: 'a', name: 'Bot', display_name: null },
  last_message: 'Hello',
  updated_at: '2026-11-13T11:59:00Z',
  message_count: 1,
  user_id: null,
  status: 'open',
  channel: 'web',
})

const ThreadPaneStub = {
  name: 'ThreadPane',
  props: ['chat', 'detailsOpen'],
  emits: ['toggle-details', 'back'],
  setup: () => ({ requestClose: vi.fn() }),
  template: '<section class="thread-stub">{{ chat.session_id }} <button class="toggle" @click="$emit(\'toggle-details\')">details</button></section>',
}
const DetailsStub = { name: 'DetailsPanel', props: ['chat', 'overlay'], template: '<aside class="details-stub" :data-overlay="overlay"></aside>' }

const mountShell = () =>
  mount(InboxShell, {
    attachTo: document.body,
    global: { stubs: { ThreadPane: ThreadPaneStub, DetailsPanel: DetailsStub, NewWhatsAppConversation: true, ShortcutsSheet: true } },
  })

beforeEach(() => {
  Object.assign(screen, { mobile: false, tablet: false, belowWide: false })
  route.query = {}
  router.replace.mockClear()
  router.push.mockClear()
  localStorage.clear()
  chat.getRecentChats.mockReset().mockResolvedValue([conversation('s1', 'Maya'), conversation('s2', 'Daniel')])
  chat.getInboxCounts.mockReset().mockResolvedValue({ open: 2, waiting_for_human: 0, assigned_to_me: 0, ai_handling: 2, negative: 0, resolved_by_ai_today: 0, channels: { web: 2 } })
  chat.getChatDetail.mockReset().mockImplementation(async (id: string) => ({ ...conversation(id, 'X'), messages: [], created_at: '', group_id: null }))
})

afterEach(() => { document.body.innerHTML = '' })

describe('InboxShell', () => {
  it('opens the first conversation on a wide screen, beside the details', async () => {
    const wrapper = mountShell()
    await flushPromises()

    expect(router.replace).toHaveBeenCalledWith({ query: { session: 's1', info: undefined } })
    expect(wrapper.find('.thread-stub').text()).toContain('s1')
    expect(wrapper.find('.details-stub').attributes('data-overlay')).toBe('false')
    expect(wrapper.find('.views').exists()).toBe(true)
    wrapper.unmount()
  })

  it('opens the conversation the URL names, even one the view does not list', async () => {
    route.query = { session: 'elsewhere' }
    const wrapper = mountShell()
    await flushPromises()

    expect(chat.getChatDetail).toHaveBeenCalledWith('elsewhere')
    expect(router.replace).not.toHaveBeenCalledWith(expect.objectContaining({ query: expect.objectContaining({ session: 's1' }) }))
    wrapper.unmount()
  })

  it('moves to the next and previous conversation with J and K', async () => {
    const wrapper = mountShell()
    await flushPromises()

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', bubbles: true }))
    await flushPromises()
    expect(route.query.session).toBe('s2')
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', bubbles: true }))
    await flushPromises()
    expect(route.query.session).toBe('s2')
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }))
    await flushPromises()
    expect(route.query.session).toBe('s1')
    wrapper.unmount()
  })

  it('remembers closing the details on a wide screen', async () => {
    const wrapper = mountShell()
    await flushPromises()
    await wrapper.find('.toggle').trigger('click')

    expect(wrapper.find('.details-stub').exists()).toBe(false)
    expect(localStorage.getItem('cm-inbox-details-hidden')).toBe('1')
    wrapper.unmount()
  })

  it('below 1440px opens the details as a drawer, closed until asked for', async () => {
    screen.belowWide = true
    const wrapper = mountShell()
    await flushPromises()
    expect(wrapper.find('.details-stub').exists()).toBe(false)

    await wrapper.find('.toggle').trigger('click')
    expect(wrapper.find('.details-stub').attributes('data-overlay')).toBe('true')
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(wrapper.find('.details-stub').exists()).toBe(false)
    wrapper.unmount()
  })

  it('below 1024px folds the views into the picker', async () => {
    screen.tablet = true
    screen.belowWide = true
    const wrapper = mountShell()
    await flushPromises()
    expect(wrapper.find('.views').exists()).toBe(false)
    expect(wrapper.find('.view-picker').exists()).toBe(true)
    wrapper.unmount()
  })

  it('on a phone stays on the list, and a tap pushes the conversation so back returns', async () => {
    Object.assign(screen, { mobile: true, tablet: true, belowWide: true })
    const wrapper = mountShell()
    await flushPromises()

    expect(router.replace).not.toHaveBeenCalled()
    expect(wrapper.find('.inbox').classes()).toContain('mobile-list')
    await wrapper.find('.row').trigger('click')
    await flushPromises()
    expect(router.push).toHaveBeenCalledWith({ query: { session: 's1', info: undefined } })
    expect(wrapper.find('.inbox').classes()).toContain('mobile-thread')
    wrapper.unmount()
  })
})
