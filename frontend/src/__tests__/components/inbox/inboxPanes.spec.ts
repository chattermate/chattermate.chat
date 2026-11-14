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

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ConversationRow from '@/components/inbox/ConversationRow.vue'
import InboxViews from '@/components/inbox/InboxViews.vue'
import InboxList from '@/components/inbox/InboxList.vue'
import { inboxViewGroups, selectedViewItem } from '@/components/inbox/inboxViews'
import { AGENT_STATUS_KEY } from '@/composables/useAgentStatus'
import type { Conversation, InboxCounts } from '@/types/chat'

const NOW = new Date('2026-11-13T12:00:00Z')

const conversation = (fields: Partial<Conversation> = {}): Conversation => ({
  session_id: 's1',
  customer: { id: 'c1', email: 'maya@example.com', full_name: 'Maya Richter' },
  agent: { id: 'a1', name: 'Shop bot', display_name: null, ai_replies_enabled: true },
  last_message: 'Berlin is in the EU though.',
  updated_at: new Date(NOW.getTime() - 6 * 60_000).toISOString(),
  message_count: 3,
  user_id: null,
  status: 'transferred',
  channel: 'whatsapp',
  handed_over_at: new Date(NOW.getTime() - 6 * 60_000).toISOString(),
  sentiment_label: 'negative',
  ...fields,
})

const counts: InboxCounts = {
  open: 27, waiting_for_human: 3, assigned_to_me: 4, ai_handling: 18,
  negative: 2, resolved_by_ai_today: 46, channels: { web: 19, whatsapp: 5 },
}

describe('ConversationRow', () => {
  const mountRow = (props: Record<string, unknown> = {}) =>
    mount(ConversationRow, { props: { conversation: conversation(), active: false, currentUserId: 'me', now: NOW, ...props } })

  it('is a button named after the customer, with the channel and unread count described', () => {
    const row = mountRow({ unread: 2 }).find('button')

    expect(row.attributes('aria-label')).toBe('Conversation with Maya Richter')
    expect(row.attributes('aria-description')).toBe('WhatsApp, 2 unread')
    expect(row.find('.unread-count').text()).toBe('2')
  })

  it('shows when, the title with the preview, and who has it', () => {
    const wrapper = mountRow({ conversation: conversation({ title: 'Refund for order', status: 'closed' }) })

    expect(wrapper.find('.time').text()).toBe('6m')
    expect(wrapper.find('.summary').text()).toBe('Refund for order · Berlin is in the EU though.')
    expect(wrapper.findAll('.chip').map((c) => c.text())).toEqual(['Closed', 'Negative'])
  })

  it('shows the wait for a waiting chat, with no title yet', () => {
    const wrapper = mountRow()

    expect(wrapper.find('.title').exists()).toBe(false)
    expect(wrapper.findAll('.chip').map((c) => c.text())).toEqual(['Waiting 6m', 'Negative'])
  })

  it('marks the open one and tells the list when picked', async () => {
    const wrapper = mountRow({ active: true })

    expect(wrapper.find('button').attributes('aria-current')).toBe('true')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('select')).toEqual([['s1']])
  })
})

describe('InboxViews', () => {
  const status = { isOnline: ref(true), statusUpdating: ref(false), toggleOnline: vi.fn(), setOnline: vi.fn() }
  const mountViews = (props: Record<string, unknown> = {}, provideStatus = true) =>
    mount(InboxViews, {
      props: { groups: inboxViewGroups(counts), selectedId: 'open', canStartConversation: false, ...props },
      global: { provide: provideStatus ? { [AGENT_STATUS_KEY as symbol]: status } : {} },
    })

  it('lists each view with its count, the selected one current', () => {
    const wrapper = mountViews()
    const waiting = wrapper.find('[data-view="waiting"]')

    expect(waiting.attributes('aria-label')).toBe('Waiting for a human, 3')
    expect(waiting.find('.count').text()).toBe('3')
    expect(wrapper.find('[data-view="open"]').attributes('aria-current')).toBe('true')
    expect(wrapper.find('[data-view="closed"] .count').exists()).toBe(false)
    expect(wrapper.findAll('.group-heading').map((h) => h.text())).toEqual(['AI agents', 'Channels', 'Saved views'])
  })

  it('selects a view and hides itself on request', async () => {
    const wrapper = mountViews()

    await wrapper.find('[data-view="channel:whatsapp"]').trigger('click')
    await wrapper.find('[aria-label="Hide views"]').trigger('click')

    expect(wrapper.emitted('select')?.[0][0]).toMatchObject({ selection: { view: 'open', channel: 'whatsapp' } })
    expect(wrapper.emitted('hide')).toHaveLength(1)
  })

  it("changes the layout's status, the same one the sidebar shows", async () => {
    const wrapper = mountViews()
    const button = wrapper.find('.status')

    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.text()).toBe("You're online")
    await button.trigger('click')
    expect(status.toggleOnline).toHaveBeenCalled()
  })

  it('has no status button outside the dashboard layout, and New conversation only with a WhatsApp number', () => {
    expect(mountViews({}, false).find('.status').exists()).toBe(false)
    expect(mountViews().find('[aria-label="New conversation"]').exists()).toBe(false)
    expect(mountViews({ canStartConversation: true }).find('[aria-label="New conversation"]').exists()).toBe(true)
  })
})

describe('InboxList', () => {
  const groups = inboxViewGroups(counts)
  const mountList = (props: Record<string, unknown> = {}) =>
    mount(InboxList, {
      props: {
        view: selectedViewItem(groups, { view: 'waiting', channel: null }),
        groups,
        conversations: [conversation()],
        selectedSessionId: null,
        unread: {},
        currentUserId: 'me',
        now: NOW,
        loading: false,
        loadingMore: false,
        hasMore: false,
        error: '',
        showViewPicker: false,
        canRestoreViews: false,
        canStartConversation: false,
        showNavButton: false,
        narrowed: false,
        filterAgents: [{ id: 'a1', label: 'Shop bot' }, { id: 'a2', label: 'Returns bot' }],
        filterTeammates: [{ id: 'me', label: 'Me (you)' }],
        sort: 'waiting_longest',
        search: '',
        filters: { agentId: '', assigneeId: '' },
        ...props,
      },
    })

  it('titles the list with the view and its size', () => {
    expect(mountList().find('#inbox-list-title').text()).toBe('Waiting for a human 3')
  })

  it('says why the list is empty: the view, a search, or an error with a retry', async () => {
    expect(mountList({ conversations: [] }).find('.state').text()).toBe('Nobody is waiting for a person.')
    expect(mountList({ conversations: [], search: 'zed' }).find('.state').text()).toBe('No conversations match “zed”.')

    const failed = mountList({ error: 'Conversations could not be loaded.' })
    await failed.find('.link-btn').trigger('click')
    expect(failed.emitted('retry')).toHaveLength(1)
  })

  it('reports a new sort and search', async () => {
    const wrapper = mountList()

    await wrapper.find('.sort-select').setValue('newest')
    await wrapper.find('input[type="search"]').setValue('priya')

    expect(wrapper.emitted('update:sort')).toEqual([['newest']])
    expect(wrapper.emitted('update:search')).toEqual([['priya']])
  })

  it('offers the views as a picker once their pane is folded away', async () => {
    const wrapper = mountList({ showViewPicker: true, canRestoreViews: true, canStartConversation: true })

    await wrapper.find('.view-picker select').setValue('channel:whatsapp')
    await wrapper.find('[aria-label="Show views"]').trigger('click')
    await wrapper.find('[aria-label="New conversation"]').trigger('click')

    expect(wrapper.emitted('select-view')?.[0][0]).toMatchObject({ id: 'channel:whatsapp' })
    expect(wrapper.emitted('restore-views')).toHaveLength(1)
    expect(wrapper.emitted('new-conversation')).toHaveLength(1)
  })

  it("offers the app's navigation where the sidebar is off-canvas", async () => {
    const wrapper = mountList({ showNavButton: true })
    await wrapper.find('[aria-label="Open navigation"]').trigger('click')
    expect(wrapper.emitted('open-nav')).toHaveLength(1)
    expect(mountList().find('[aria-label="Open navigation"]').exists()).toBe(false)
  })

  it("drops the view's count while a search or filter narrows the list", () => {
    expect(mountList({ narrowed: true }).find('#inbox-list-title').text()).toBe('Waiting for a human')
  })

  it('filters by agent once there is more than one to choose from, and clears', async () => {
    const wrapper = mountList()
    await wrapper.find('[aria-controls="inbox-filters"]').trigger('click')
    const [agentSelect] = wrapper.findAll('#inbox-filters select')
    await agentSelect.setValue('a2')
    expect(wrapper.emitted('update:filters')?.[0]).toEqual([{ agentId: 'a2', assigneeId: '' }])

    const filtered = mountList({ filters: { agentId: 'a2', assigneeId: '' } })
    const toggle = filtered.find('[aria-controls="inbox-filters"]')
    expect(toggle.attributes('aria-label')).toBe('Filters, 1 on')
    await toggle.trigger('click')
    await filtered.find('.clear').trigger('click')
    expect(filtered.emitted('update:filters')?.[0]).toEqual([{ agentId: '', assigneeId: '' }])

    expect(mountList({ filterAgents: [{ id: 'a1', label: 'Shop bot' }] }).find('[aria-controls="inbox-filters"]').exists()).toBe(false)
  })

  it('passes a picked row up', async () => {
    const wrapper = mountList()
    await wrapper.find('.row').trigger('click')
    expect(wrapper.emitted('select')).toEqual([['s1']])
  })
})
