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

const chat = vi.hoisted(() => ({ renameCustomer: vi.fn() }))
vi.mock('@/services/chat', () => ({ chatService: chat }))
vi.mock('@/services/user', () => ({ userService: { getUserId: () => 'me' } }))
vi.mock('@/utils/permissions', () => ({ permissionChecks: { canViewTickets: () => false } }))
const toastError = vi.hoisted(() => vi.fn())
vi.mock('vue-sonner', () => ({ toast: { error: toastError } }))
vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({ moduleImports: {}, enterpriseComponent: () => ({ render: () => null }) }),
}))

import DetailsPanel from '@/components/inbox/DetailsPanel.vue'

const detail = () => ({
  session_id: 's1',
  customer: { id: 'c1', email: 'U56cf1f8@line.channel', full_name: 'Line user U56cf1f8' },
  agent: { id: 'a1', name: 'Bot', display_name: null },
  messages: [],
  status: 'open',
  channel: 'line',
  user_id: null,
  group_id: null,
  created_at: '2026-11-26T08:00:00Z',
})

const mountPanel = () => mount(DetailsPanel, {
  props: { chat: detail() as any, overlay: false },
  global: { stubs: { LinkedTicketCard: true } },
})

describe('DetailsPanel customer name', () => {
  beforeEach(() => { chat.renameCustomer.mockReset(); toastError.mockReset() })

  it('lets a teammate name the customer, and reports the new record', async () => {
    chat.renameCustomer.mockResolvedValue({ id: 'c1', email: 'U56cf1f8@line.channel', full_name: 'Somchai Prasert' })
    const panel = mountPanel()

    await panel.find('button[aria-label="Edit customer name"]').trigger('click')
    const input = panel.find('input#details-customer-name')
    expect((input.element as HTMLInputElement).value).toBe('Line user U56cf1f8')
    await input.setValue('  Somchai Prasert ')
    await panel.find('form.name-edit').trigger('submit')
    await flushPromises()

    expect(chat.renameCustomer).toHaveBeenCalledWith('s1', 'Somchai Prasert')
    expect(panel.emitted('customer-renamed')?.[0]).toEqual(['s1', { id: 'c1', email: 'U56cf1f8@line.channel', full_name: 'Somchai Prasert' }])
    expect(panel.find('form.name-edit').exists()).toBe(false)
  })

  it('saves nothing for a blank name', async () => {
    const panel = mountPanel()
    await panel.find('button[aria-label="Edit customer name"]').trigger('click')
    await panel.find('input#details-customer-name').setValue('   ')
    await panel.find('form.name-edit').trigger('submit')
    expect(chat.renameCustomer).not.toHaveBeenCalled()
    expect(panel.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('keeps the form open and says why when saving fails', async () => {
    chat.renameCustomer.mockRejectedValue({ response: { data: { detail: 'Chat session not found' } } })
    const panel = mountPanel()
    await panel.find('button[aria-label="Edit customer name"]').trigger('click')
    await panel.find('input#details-customer-name').setValue('Somchai')
    await panel.find('form.name-edit').trigger('submit')
    await flushPromises()

    expect(toastError).toHaveBeenCalledWith('Could not save the name', { description: 'Chat session not found' })
    expect(panel.find('form.name-edit').exists()).toBe(true)
    expect(panel.emitted('customer-renamed')).toBeUndefined()
  })

  it('opening another chat drops the draft', async () => {
    const panel = mountPanel()
    await panel.find('button[aria-label="Edit customer name"]').trigger('click')
    await panel.find('input#details-customer-name').setValue('Somchai')
    await panel.setProps({ chat: { ...detail(), session_id: 's2' } as any })
    expect(panel.find('form.name-edit').exists()).toBe(false)
  })

  it('Escape cancels the edit', async () => {
    const panel = mountPanel()
    await panel.find('button[aria-label="Edit customer name"]').trigger('click')
    await panel.find('form.name-edit').trigger('keydown', { key: 'Escape' })
    expect(panel.find('form.name-edit').exists()).toBe(false)
  })
})
