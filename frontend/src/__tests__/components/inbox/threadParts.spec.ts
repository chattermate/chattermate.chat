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

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import ThreadHeader from '@/components/inbox/ThreadHeader.vue'
import ThreadBanner from '@/components/inbox/ThreadBanner.vue'
import HandoverSummaryCard from '@/components/inbox/HandoverSummaryCard.vue'
import ThreadMessage from '@/components/inbox/ThreadMessage.vue'
import ActionMenu from '@/components/common/ActionMenu.vue'
import DetailsPanel from '@/components/inbox/DetailsPanel.vue'
import ThreadComposer from '@/components/inbox/ThreadComposer.vue'
import type { ChatDetail, Message } from '@/types/chat'

const people = vi.hoisted(() => ({ getPerson: vi.fn() }))
vi.mock('@/services/people', () => ({ peopleService: people }))
vi.mock('@/utils/permissions', () => ({
  permissionChecks: { canViewTickets: () => false, canViewPeople: () => true },
}))
vi.mock('@/services/user', () => ({ userService: { getUserId: () => 'me' } }))

const NOW = new Date('2026-11-13T12:00:00Z')
const ago = (m: number) => new Date(NOW.getTime() - m * 60_000).toISOString()

const chat = (fields: Partial<ChatDetail> = {}): ChatDetail => ({
  session_id: 's1',
  customer: { id: 'c1', email: 'maya@example.com', full_name: 'Maya Richter', phone: '+49 30 1234' },
  agent: { id: 'a1', name: 'Shop bot', display_name: 'Shop assistant', ai_replies_enabled: true },
  messages: [],
  created_at: ago(30),
  updated_at: ago(6),
  user_id: null,
  group_id: null,
  status: 'transferred',
  channel: 'whatsapp',
  handed_over_at: ago(6),
  transfer_reason: 'KNOWLEDGE_GAP',
  ...fields,
})

describe('ThreadHeader', () => {
  const mountHeader = (props: Record<string, unknown> = {}) =>
    mount(ThreadHeader, {
      props: { chat: chat(), currentUserId: 'me', detailsOpen: true, assignees: null, moreActions: [], canClose: false, showBack: false, ...props },
    })

  it('names the customer, the channel and what it is about', () => {
    const wrapper = mountHeader({ chat: chat({ title: 'Refund for order' }) })
    expect(wrapper.find('h2').text()).toBe('Maya Richter')
    expect(wrapper.find('.subtitle').text()).toBe('WhatsApp · Refund for order')
  })

  it('says who has it, and opens the assignee menu only when the viewer may assign', async () => {
    expect(mountHeader().find('.assignee.static').attributes('aria-label')).toBe('Assignee: Unassigned')
    const held = mountHeader({
      chat: chat({ status: 'open', user_id: 'asha', user_name: 'Asha' }),
      assignees: [{ id: 'asha', label: 'Asha', checked: true }, { id: 'me', label: 'Me (you)', checked: false }],
    })
    const trigger = held.find('button[aria-haspopup="menu"]')
    expect(trigger.attributes('aria-label')).toBe('Assignee: Asha. Change assignee')

    await trigger.trigger('click')
    await held.findAll('[role="menuitemradio"]')[1].trigger('click')
    expect(held.emitted('assign')).toEqual([['me']])
  })

  it('offers Close only to whoever holds it, and toggles the details', async () => {
    expect(mountHeader().find('.close-btn').exists()).toBe(false)
    const wrapper = mountHeader({ canClose: true })
    await wrapper.find('.close-btn').trigger('click')
    const toggle = wrapper.find('.details-toggle')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    await toggle.trigger('click')
    expect(wrapper.emitted('close-chat')).toHaveLength(1)
    expect(wrapper.emitted('toggle-details')).toHaveLength(1)
  })
})

describe('ThreadBanner', () => {
  const mountBanner = (fields: Partial<ChatDetail> = {}, props: Record<string, unknown> = {}) =>
    mount(ThreadBanner, {
      props: { chat: chat(fields), currentUserId: 'me', now: NOW, canManage: true, assignees: [{ id: 'asha', label: 'Asha' }], busy: false, ...props },
    })

  it('waiting: for how long, who handed it over, take over or assign', async () => {
    const wrapper = mountBanner()
    expect(wrapper.text()).toContain('Maya Richter has been waiting 6 minutes.')
    expect(wrapper.text()).toContain('Shop assistant handed this over.')
    expect(wrapper.find('.waiting').classes()).not.toContain('late')

    await wrapper.find('.btn.primary').trigger('click')
    await wrapper.find('button[aria-haspopup="menu"]').trigger('click')
    await wrapper.find('[role="menuitem"]').trigger('click')
    expect(wrapper.emitted('take-over')).toHaveLength(1)
    expect(wrapper.emitted('assign')).toEqual([['asha']])
  })

  it('waiting long is late, and an agent without AI was never handed over', () => {
    expect(mountBanner({ handed_over_at: ago(30) }).find('.waiting').classes()).toContain('late')
    const human = mountBanner({ status: 'open', handed_over_at: null, updated_at: ago(2), agent: { id: 'a', name: 'Desk', display_name: null, ai_replies_enabled: false } })
    expect(human.text()).toContain('Nobody has picked it up yet.')
  })

  it("yours: the AI is paused, and can have it back", async () => {
    const wrapper = mountBanner({ status: 'open', user_id: 'me' })
    expect(wrapper.text()).toContain('Shop assistant is paused while you handle this chat')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('release')).toHaveLength(1)
  })

  it("the AI's: take it over or hand it to the team; nothing to do on someone else's or a closed one", async () => {
    const ai = mountBanner({ status: 'open', handed_over_at: null })
    const [handToTeam, takeOver] = ai.findAll('button')
    await handToTeam.trigger('click')
    await takeOver.trigger('click')
    expect(ai.emitted('route-to-team')).toHaveLength(1)
    expect(ai.emitted('take-over')).toHaveLength(1)

    expect(mountBanner({ status: 'open', user_id: 'asha', user_name: 'Asha' }).text()).toBe('Asha is handling this chat')
    expect(mountBanner({ status: 'closed' }).find('button').exists()).toBe(false)
  })

  it('offers no actions to someone who may not take chats over', () => {
    expect(mountBanner({}, { canManage: false, assignees: null }).find('button').exists()).toBe(false)
  })
})

describe('HandoverSummaryCard', () => {
  const mountCard = (props: Record<string, unknown> = {}) =>
    mount(HandoverSummaryCard, {
      props: { agentName: 'Shop assistant', reason: 'KNOWLEDGE_GAP', summary: 'Wants a refund.', handedOverAt: ago(6), knowledgeLink: '/faq?question=Refund', ...props },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })

  it('says who handed over and why, with the summary as text', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.handover-line').text()).toContain('Shop assistant handed over')
    expect(wrapper.find('.handover-line').text()).toContain('No answer in knowledge')
    expect(wrapper.find('.summary').text()).toBe('Wants a refund.')
  })

  it('reads a summary of "- " lines as a list', () => {
    const wrapper = mountCard({ summary: '- Wants a refund\n- Delivered to Berlin' })
    expect(wrapper.findAll('.points li').map((l) => l.text())).toEqual(['Wants a refund', 'Delivered to Berlin'])
  })

  it('links to the knowledge editor only for someone who can edit it', () => {
    expect(mountCard().findComponent(RouterLinkStub).props('to')).toBe('/faq?question=Refund')
    expect(mountCard({ knowledgeLink: null }).findComponent(RouterLinkStub).exists()).toBe(false)
  })
})

describe('ThreadMessage', () => {
  const mountMessage = (message: Partial<Message>, props: Record<string, unknown> = {}) =>
    mount(ThreadMessage, {
      props: {
        message: { message: 'Hello', message_type: 'user', created_at: ago(1), session_id: 's1', timeAgo: '1 minute ago', ...message },
        customerName: 'Maya Richter',
        agentName: 'Shop assistant',
        currentUserId: 'me',
        correctionLink: '/faq?question=Hi',
        isImage: () => false,
        imageUrl: (u: string) => u,
        downloadUrl: (u: string) => u,
        fileSize: () => '1 KB',
        ...props,
      },
      global: { stubs: { RouterLink: RouterLinkStub, 'font-awesome-icon': true } },
    })

  it('the customer on the left with their initials', () => {
    const wrapper = mountMessage({})
    expect(wrapper.find('.message').classes()).toEqual(expect.arrayContaining(['customer', 'user']))
    expect(wrapper.find('.avatar').text()).toBe('MR')
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false)
  })

  it('the AI labelled as such, with a way to correct its answer', () => {
    const wrapper = mountMessage({ message_type: 'bot' })
    expect(wrapper.find('.ai-who').text()).toBe('Shop assistant · AI')
    expect(wrapper.findComponent(RouterLinkStub).text()).toBe('Correct this answer')
  })

  it('a reply from the team: You for yours, their name for a teammate', () => {
    expect(mountMessage({ message_type: 'agent', user_id: 'me' }).find('.team-who').text()).toBe('You')
    expect(mountMessage({ message_type: 'agent', client_id: 'c-1' }).find('.team-who').text()).toBe('You')
    expect(mountMessage({ message_type: 'agent', user_id: 'asha', user_name: 'Asha' }).find('.team-who').text()).toBe('Asha')
    expect(mountMessage({ message_type: 'agent', user_id: 'asha' }).find('.team-who').text()).toBe('Teammate')
  })

  it('a system line centred, and a failed delivery said plainly', () => {
    expect(mountMessage({ message_type: 'system', message: 'Chat ended' }).find('.system-line').text()).toBe('Chat ended')
    expect(mountMessage({ message_type: 'agent', user_id: 'me', attributes: { delivery_status: 'failed' } }).find('.delivery-failed').text()).toBe('Not delivered')
  })
})

describe('ActionMenu', () => {
  const items = [{ id: 'a', label: 'First' }, { id: 'b', label: 'Second', separated: true }, { id: 'c', label: 'Off', disabled: true }]
  const mountMenu = () => mount(ActionMenu, { props: { label: 'More actions', items }, slots: { default: '…' }, attachTo: document.body })

  beforeEach(() => { document.body.innerHTML = '' })

  it('opens with focus on the first item, moves with the arrows and skips disabled ones', async () => {
    const wrapper = mountMenu()
    await wrapper.find('button').trigger('click')
    await flushPromises()
    const menuItems = wrapper.findAll('[role="menuitem"]')
    expect(document.activeElement).toBe(menuItems[0].element)

    await wrapper.find('[role="menu"]').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(menuItems[1].element)
    await wrapper.find('[role="menu"]').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(menuItems[0].element)
    expect(wrapper.find('[role="separator"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('picks an item, closes and returns focus to the trigger', async () => {
    const wrapper = mountMenu()
    await wrapper.find('button').trigger('click')
    await flushPromises()
    await wrapper.findAll('[role="menuitem"]')[1].trigger('click')

    expect(wrapper.emitted('select')).toEqual([['b']])
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    expect(document.activeElement).toBe(wrapper.find('button').element)
    wrapper.unmount()
  })

  it('closes on Escape', async () => {
    const wrapper = mountMenu()
    await wrapper.find('button').trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })
})

describe('DetailsPanel', () => {
  const mountPanel = (fields: Partial<ChatDetail> = {}, props: Record<string, unknown> = {}) =>
    mount(DetailsPanel, { props: { chat: chat(fields), overlay: false, ...props } })

  beforeEach(() => {
    people.getPerson.mockReset()
    people.getPerson.mockResolvedValue({
      conversations: [
        { session_id: 's1', last_message: 'this one' },
        { session_id: 's0', last_message: 'Where is my parcel?', agent_name: 'Shop bot', status: 'closed', created_at: '2026-10-01T10:00:00Z' },
      ],
    })
  })

  it('shows the customer, their contact facts and the integrator fields', () => {
    const wrapper = mountPanel({ customer: { id: 'c1', email: 'maya@example.com', full_name: 'Maya', phone: '+49', meta_data: { student_name: 'Ana', empty: '' } } })
    expect(wrapper.find('.customer-name').text()).toBe('Maya')
    expect(wrapper.find('.customer-contact').text()).toBe('maya@example.com')
    const facts = wrapper.find('.customer .facts').findAll('.fact').map((f) => f.text())
    expect(facts).toEqual(['Phone+49', 'Student NameAna'])
  })

  it("lists the conversation's facts, and folds them away", async () => {
    const wrapper = mountPanel({ sentiment_label: 'negative' })
    const facts = () => wrapper.find('#details-conversation').findAll('.fact').map((f) => f.find('dt').text())
    expect(facts()).toEqual(['Status', 'AI agent', 'Channel', 'Handover', 'Sentiment', 'Started'])

    const toggle = wrapper.find('.section-toggle')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('#details-conversation').isVisible()).toBe(false)
  })

  it("lists the customer's other conversations and opens one", async () => {
    const wrapper = mountPanel()
    await flushPromises()

    const items = wrapper.findAll('.history-item')
    expect(items.map((i) => i.find('.history-title').text())).toEqual(['Where is my parcel?'])
    await items[0].trigger('click')
    expect(wrapper.emitted('open-conversation')).toEqual([['s0']])
  })

  it('has a close button only as a drawer', async () => {
    expect(mountPanel().find('[aria-label="Close details"]').exists()).toBe(false)
    const drawer = mountPanel({}, { overlay: true })
    await drawer.find('[aria-label="Close details"]').trigger('click')
    expect(drawer.emitted('close')).toHaveLength(1)
  })
})

describe('ThreadComposer', () => {
  const mountComposer = (props: Record<string, unknown> = {}) =>
    mount(ThreadComposer, {
      props: { modelValue: '', canSend: true, hasFiles: false, showTemplateNotice: false, ...props },
      attachTo: document.body,
    })

  it('sends on Enter, breaks the line with Shift+Enter', async () => {
    const wrapper = mountComposer({ modelValue: 'Hi' })
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter', shiftKey: true })
    expect(wrapper.emitted('send')).toHaveLength(1)
    wrapper.unmount()
  })

  it('offers Send and close once there is something to send', async () => {
    expect(mountComposer().find('[aria-label="More send options"]').exists()).toBe(false)
    const wrapper = mountComposer({ modelValue: 'Done, refund sent.' })
    await wrapper.find('[aria-label="More send options"]').trigger('click')
    await wrapper.find('[role="menuitem"]').trigger('click')
    expect(wrapper.emitted('send-and-close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('keeps Send off when it may not send, and says when only a template reopens the chat', async () => {
    const wrapper = mountComposer({ modelValue: 'Hi', canSend: false, showTemplateNotice: true })
    expect(wrapper.find('.send').attributes('disabled')).toBeDefined()
    await wrapper.find('.window-closed .btn').trigger('click')
    expect(wrapper.emitted('send-template')).toHaveLength(1)
    wrapper.unmount()
  })
})
