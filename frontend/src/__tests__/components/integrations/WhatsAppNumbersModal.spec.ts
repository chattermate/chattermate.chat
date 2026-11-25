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
import { flushPromises, mount } from '@vue/test-utils'

import WhatsAppNumbersModal from '../../../components/integrations/WhatsAppNumbersModal.vue'
import type { ChannelAccount } from '../../../services/channels'

const { disconnectMeta } = vi.hoisted(() => ({ disconnectMeta: vi.fn() }))
vi.mock('vue-sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/services/channels', () => ({ default: { disconnectMeta } }))
vi.mock('@/services/agent', () => ({
  agentService: {
    getOrganizationAgents: vi.fn().mockResolvedValue([
      { id: 'ag-1', name: 'support', display_name: 'Support Bot' },
      { id: 'ag-2', name: 'sales', display_name: null },
    ]),
  },
}))

const number = (id: string, overrides: Partial<ChannelAccount> = {}): ChannelAccount => ({
  id, channel_type: 'whatsapp', external_account_id: `PN-${id}`,
  display_name: `Number ${id}`, is_active: true, agent_id: 'ag-1', ...overrides,
})

const mountModal = async (accounts: ChannelAccount[], limit: number | null) => {
  const wrapper = mount(WhatsAppNumbersModal, {
    props: { accounts, limit },
    global: { stubs: { teleport: true, 'font-awesome-icon': true } },
  })
  await flushPromises()
  return wrapper
}

const addButton = (wrapper: Awaited<ReturnType<typeof mountModal>>) =>
  wrapper.findAll('button').find(b => b.text() === 'Add number')!

describe('WhatsAppNumbersModal', () => {
  beforeEach(() => { disconnectMeta.mockReset() })

  it('lists each number with the agent that answers it', async () => {
    const wrapper = await mountModal([
      number('1', { agent_id: 'ag-1' }),
      number('2', { agent_id: 'ag-2' }),
      number('3', { agent_id: null }),
    ], 5)

    expect(wrapper.find('[data-testid="whatsapp-number-PN-1"]').text()).toContain('Answered by Support Bot')
    expect(wrapper.find('[data-testid="whatsapp-number-PN-2"]').text()).toContain('Answered by sales')
    expect(wrapper.find('[data-testid="whatsapp-number-PN-3"]').text()).toContain("No agent: messages wait in your inbox.")
  })

  it('leads a number without an agent to its agent picker', async () => {
    const unassigned = number('3', { agent_id: null })
    const wrapper = await mountModal([number('1'), unassigned], 5)
    const assign = wrapper.find('button[aria-label="Assign agent Number 3"]')

    expect(wrapper.find('[data-testid="whatsapp-number-PN-3"] .wan-meta').classes()).toContain('warn')
    expect(assign.classes()).toContain('wan-btn-primary')
    await assign.trigger('click')
    expect(wrapper.emitted('manage')![0]).toEqual([unassigned])
    expect(wrapper.find('button[aria-label="Manage Number 1"]').exists()).toBe(true)
  })

  it('flags a number whose access expired', async () => {
    const wrapper = await mountModal([number('1', { needs_reconnect: true })], 2)
    expect(wrapper.text()).toContain('Access expired: reconnect to resume replies')
  })

  it('flags a number Meta won\'t let send, and leads to it', async () => {
    const wrapper = await mountModal([number('1', { send_problem: 'Payment method missing' })], 2)
    const manage = wrapper.find('button[aria-label="Manage Number 1"]')

    expect(wrapper.text()).toContain("Can't send replies: open it to see why")
    expect(manage.classes()).toContain('wan-btn-primary')
  })

  it('adds a number while the plan has room', async () => {
    const wrapper = await mountModal([number('1')], 2)

    expect(wrapper.find('[data-testid="whatsapp-numbers-usage"]').text()).toBe('1 of 2 numbers on your plan')
    expect(addButton(wrapper).attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).not.toContain('Upgrade for more')
    await addButton(wrapper).trigger('click')
    expect(wrapper.emitted('add')).toHaveLength(1)
  })

  it('offers an upgrade instead once the plan is full', async () => {
    const wrapper = await mountModal([number('1'), number('2')], 2)

    expect(addButton(wrapper).attributes('disabled')).toBeDefined()
    expect(addButton(wrapper).attributes('title')).toBe('Your plan includes 2 WhatsApp numbers.')
    expect(wrapper.find('a.wan-upgrade').attributes('href')).toBe('/settings/subscription')
  })

  it('has no limit to show when the plan sets none', async () => {
    const wrapper = await mountModal([number('1'), number('2')], null)

    expect(wrapper.find('[data-testid="whatsapp-numbers-usage"]').text()).toBe('2 numbers connected')
    expect(addButton(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('opens the connect form for the number being managed', async () => {
    const two = number('2')
    const wrapper = await mountModal([number('1'), two], 5)

    await wrapper.find('[data-testid="whatsapp-number-PN-2"]').findAll('button')
      .find(b => b.text() === 'Manage')!.trigger('click')
    expect(wrapper.emitted('manage')).toEqual([[two]])
  })

  it('disconnects only the confirmed number', async () => {
    disconnectMeta.mockResolvedValue(undefined)
    const one = number('1')
    const wrapper = await mountModal([one, number('2')], 5)
    const row = () => wrapper.find('[data-testid="whatsapp-number-PN-1"]')

    await row().find('button[aria-label="Disconnect Number 1"]').trigger('click')
    expect(disconnectMeta).not.toHaveBeenCalled()
    await row().findAll('button').find(b => b.text() === 'Disconnect')!.trigger('click')
    await flushPromises()

    expect(disconnectMeta).toHaveBeenCalledWith('1')
    expect(wrapper.emitted('disconnected')).toEqual([[one]])
  })

  it('backs out of a disconnect', async () => {
    const wrapper = await mountModal([number('1')], 5)
    const row = () => wrapper.find('[data-testid="whatsapp-number-PN-1"]')

    await row().find('button[aria-label="Disconnect Number 1"]').trigger('click')
    await row().findAll('button').find(b => b.text() === 'Cancel')!.trigger('click')

    expect(row().text()).toContain('Manage')
    expect(disconnectMeta).not.toHaveBeenCalled()
  })

  it('keeps the number listed when the disconnect fails', async () => {
    disconnectMeta.mockRejectedValue({ response: { data: { detail: 'Meta said no' } } })
    const wrapper = await mountModal([number('1')], 5)
    const row = () => wrapper.find('[data-testid="whatsapp-number-PN-1"]')

    await row().find('button[aria-label="Disconnect Number 1"]').trigger('click')
    await row().findAll('button').find(b => b.text() === 'Disconnect')!.trigger('click')
    await flushPromises()

    const { toast } = await import('vue-sonner')
    expect(toast.error).toHaveBeenCalledWith('Meta said no')
    expect(wrapper.emitted('disconnected')).toBeUndefined()
    expect(row().text()).toContain('Manage')
  })
})
