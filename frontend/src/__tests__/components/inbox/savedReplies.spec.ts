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
import { fillReply, matchReplies } from '@/components/inbox/savedReplyText'
import SavedReplyPicker from '@/components/inbox/SavedReplyPicker.vue'
import ThreadComposer from '@/components/inbox/ThreadComposer.vue'
import type { SavedReply } from '@/services/savedReplies'

const service = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() }))
vi.mock('@/services/savedReplies', () => ({ savedReplyService: service }))

import { resetSavedReplies, useSavedReplies } from '@/composables/useSavedReplies'

const reply = (id: number, title: string, body: string, shortcut: string | null = null): SavedReply =>
  ({ id, title, body, shortcut, updated_at: '' })
const LIBRARY = [
  reply(1, 'EU refund', 'Hi {{customer.first_name}}, returns within the EU are free. {{agent.first_name}}', 'refund-eu'),
  reply(2, 'Delivery times', 'Orders ship in 2 working days.', 'delivery'),
  reply(3, 'Talk to a person', 'You can always ask for a refund in person too.'),
]

describe('filling a saved reply', () => {
  it('puts the customer and agent in, and "there" for a name nobody gave', () => {
    expect(fillReply(LIBRARY[0].body, { customerName: 'Maya Richter', agentName: 'Sam Lee' }))
      .toBe('Hi Maya, returns within the EU are free. Sam')
    expect(fillReply('Hi {{customer.first_name}} / {{ customer.name }}', {})).toBe('Hi there / there')
  })

  it('leaves a variable it does not know as written, so the typo shows', () => {
    expect(fillReply('Hi {{customer.firstname}}', { customerName: 'Maya' })).toBe('Hi {{customer.firstname}}')
  })
})

describe('matching saved replies', () => {
  it('ranks a shortcut first, then a title, then the text', () => {
    expect(matchReplies(LIBRARY, 'refund').map((r) => r.id)).toEqual([1, 3])
    expect(matchReplies(LIBRARY, 'deliv').map((r) => r.id)).toEqual([2])
    expect(matchReplies(LIBRARY, 'person').map((r) => r.id)).toEqual([3])
    expect(matchReplies(LIBRARY, 'zzz')).toEqual([])
    expect(matchReplies(LIBRARY, '').length).toBe(3)
  })
})

describe('SavedReplyPicker', () => {
  const mountPicker = (props: Record<string, unknown> = {}) =>
    mount(SavedReplyPicker, {
      props: { replies: LIBRARY, query: null, loaded: true, canManage: true, ...props },
      global: { stubs: { RouterLink: RouterLinkStub } },
      attachTo: document.body,
    })

  it('searches in its own box and picks with the keyboard', async () => {
    const wrapper = mountPicker()
    await flushPromises()
    const box = wrapper.find('input[type="search"]')
    expect(document.activeElement).toBe(box.element)
    await box.setValue('ship')
    expect(wrapper.findAll('[role="option"]').map((o) => o.find('.title').text())).toEqual(['Delivery times'])
    await box.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('pick')?.[0][0]).toMatchObject({ id: 2 })
    await box.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('says when there is nothing yet, and offers to add one to those who may', () => {
    const empty = mountPicker({ replies: [] })
    expect(empty.find('.empty').text()).toContain('No saved replies yet.')
    expect(empty.findComponent(RouterLinkStub).props('to')).toBe('/settings/saved-replies')
    expect(mountPicker({ replies: [], canManage: false }).findComponent(RouterLinkStub).exists()).toBe(false)
    expect(mountPicker({ query: 'zzz' }).find('.empty').text()).toBe('No saved reply matches “zzz”.')
  })
})

describe('the composer with saved replies', () => {
  const mountComposer = (props: Record<string, unknown> = {}) =>
    mount(ThreadComposer, {
      props: {
        modelValue: '', mode: 'reply', canReply: true, canTakeOver: false, canSend: true, hasFiles: false,
        showTemplateNotice: false, teammates: [], savedReplies: LIBRARY, savedRepliesLoaded: true,
        replyContext: { customerName: 'Maya Richter', agentName: 'Sam Lee' }, canManageReplies: true, ...props,
      },
      global: { stubs: { RouterLink: RouterLinkStub } },
      attachTo: document.body,
    })

  it('"/" in an empty reply searches, and Enter puts the filled reply in the box', async () => {
    const wrapper = mountComposer({ modelValue: '/refund' })
    await flushPromises()
    expect(wrapper.emitted('open-saved-replies')).toHaveLength(1)
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['Hi Maya, returns within the EU are free. Sam'])
    expect(wrapper.emitted('send')).toBeUndefined()
    wrapper.unmount()
  })

  it('the ⚡ button opens the picker; a pick goes in at the caret of what is written', async () => {
    const wrapper = mountComposer({ modelValue: 'Thanks! ' })
    const box = wrapper.find('textarea').element as HTMLTextAreaElement
    box.setSelectionRange(8, 8)
    await wrapper.find('[aria-label="Saved replies"]').trigger('click')
    expect(wrapper.find('[role="dialog"][aria-label="Saved replies"]').exists()).toBe(true)
    await wrapper.findAll('[role="option"]')[0].trigger('mousedown')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['Thanks! Hi Maya, returns within the EU are free. Sam'])
    wrapper.unmount()
  })

  it('offers Save as saved reply for what is written, to those who may, and not in a note', async () => {
    const wrapper = mountComposer({ modelValue: 'We ship to Canada in 5 to 8 days.' })
    await wrapper.find('[aria-label="Save as saved reply"]').trigger('click')
    expect(wrapper.emitted('save-reply')).toEqual([['We ship to Canada in 5 to 8 days.']])
    expect(mountComposer({ modelValue: 'x', canManageReplies: false }).find('[aria-label="Save as saved reply"]').exists()).toBe(false)
    expect(mountComposer({ modelValue: 'x', mode: 'note' }).find('[aria-label="Saved replies"]').exists()).toBe(false)
  })
})

describe('useSavedReplies', () => {
  beforeEach(() => {
    resetSavedReplies()
    Object.values(service).forEach((fn) => fn.mockReset())
  })

  it('loads once for the whole app, keeps it sorted through edits', async () => {
    service.list.mockResolvedValue([LIBRARY[1], LIBRARY[0]])
    const first = useSavedReplies()
    const second = useSavedReplies()
    await Promise.all([first.load(), second.load()])
    expect(service.list).toHaveBeenCalledTimes(1)
    expect(first.replies.value.map((r) => r.title)).toEqual(['Delivery times', 'EU refund'])

    service.create.mockResolvedValue(reply(9, 'Apology', 'Sorry!'))
    await first.create({ title: 'Apology', body: 'Sorry!' })
    expect(second.replies.value.map((r) => r.title)).toEqual(['Apology', 'Delivery times', 'EU refund'])

    service.update.mockResolvedValue(reply(9, 'Zz apology', 'Sorry!'))
    await first.update(9, { title: 'Zz apology', body: 'Sorry!' })
    service.remove.mockResolvedValue(undefined)
    await first.remove(2)
    expect(first.replies.value.map((r) => r.title)).toEqual(['EU refund', 'Zz apology'])
  })

  it('asks again after a failed load', async () => {
    service.list.mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce([])
    const { load, loaded } = useSavedReplies()
    await expect(load()).rejects.toThrow('down')
    await load()
    expect(loaded.value).toBe(true)
  })
})
