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

const service = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() }))
vi.mock('@/services/savedReplies', () => ({ savedReplyService: service }))
const access = vi.hoisted(() => ({ manage: true }))
vi.mock('@/utils/permissions', () => ({ permissionChecks: { canTakeOverChats: () => access.manage } }))
vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import SavedRepliesSettings from '@/views/settings/SavedRepliesSettings.vue'
import { resetSavedReplies } from '@/composables/useSavedReplies'

const REFUND = { id: 1, title: 'EU refund', body: 'Returns within the EU are free.', shortcut: 'refund-eu', updated_at: '' }

const mountPage = () => mount(SavedRepliesSettings, {
  global: { stubs: { DashboardLayout: { template: '<div><slot /></div>' } } },
  attachTo: document.body,
})

describe('Settings › Saved replies', () => {
  beforeEach(() => {
    resetSavedReplies()
    access.manage = true
    Object.values(service).forEach((fn) => fn.mockReset())
    service.list.mockResolvedValue([REFUND])
    document.body.innerHTML = ''
  })

  it('lists the replies with their shortcut', async () => {
    const wrapper = mountPage()
    await flushPromises()
    expect(wrapper.find('.item-title').text()).toBe('EU refund /refund-eu')
    wrapper.unmount()
  })

  it('adds one through the form, and shows a refused shortcut', async () => {
    service.create.mockRejectedValueOnce({ response: { data: { detail: 'Another saved reply already uses this shortcut' } } })
    service.create.mockResolvedValueOnce({ ...REFUND, id: 2, title: 'Delivery', shortcut: 'delivery' })
    const wrapper = mountPage()
    await flushPromises()
    await wrapper.find('.page-header .btn.primary').trigger('click')
    const form = document.querySelector('form')!
    const [title, shortcut] = Array.from(form.querySelectorAll('input'))
    title.value = 'Delivery'
    title.dispatchEvent(new Event('input'))
    shortcut.value = 'refund-eu'
    shortcut.dispatchEvent(new Event('input'))
    const body = form.querySelector('textarea')!
    body.value = 'Orders ship in 2 days.'
    body.dispatchEvent(new Event('input'))
    form.dispatchEvent(new Event('submit'))
    await flushPromises()
    expect(document.querySelector('[role="alert"]')?.textContent).toBe('Another saved reply already uses this shortcut')

    shortcut.value = 'delivery'
    shortcut.dispatchEvent(new Event('input'))
    form.dispatchEvent(new Event('submit'))
    await flushPromises()
    expect(service.create).toHaveBeenLastCalledWith({ title: 'Delivery', body: 'Orders ship in 2 days.', shortcut: 'delivery' })
    expect(wrapper.findAll('.item-title').map((t) => t.text())).toEqual(['Delivery /delivery', 'EU refund /refund-eu'])
    wrapper.unmount()
  })

  it('removes one only after asking', async () => {
    service.remove.mockResolvedValue(undefined)
    const wrapper = mountPage()
    await flushPromises()
    await wrapper.find('[aria-label="Remove EU refund"]').trigger('click')
    expect(service.remove).not.toHaveBeenCalled()
    ;(document.querySelector('.btn.danger-solid') as HTMLButtonElement).click()
    await flushPromises()
    expect(service.remove).toHaveBeenCalledWith(1)
    expect(wrapper.find('.empty').exists()).toBe(true)
    wrapper.unmount()
  })

  it('is read-only for someone who can only view chats', async () => {
    access.manage = false
    const wrapper = mountPage()
    await flushPromises()
    expect(wrapper.find('.page-header .btn.primary').exists()).toBe(false)
    expect(wrapper.find('.item-actions').exists()).toBe(false)
    wrapper.unmount()
  })
})
