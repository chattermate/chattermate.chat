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

import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import InvestigationNoteForm from '@/components/tickets/InvestigationNoteForm.vue'

// attachTo puts the component in the real document so focus can be asserted,
// and VTU only takes it back out on unmount — without this the forms pile up
// and whichever mounted last owns document.activeElement.
const mounted: VueWrapper[] = []
afterEach(() => {
  while (mounted.length) mounted.pop()!.unmount()
})

const mountForm = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
  const wrapper = mount(InvestigationNoteForm, {
    props: { placeholder: 'Why?', submitLabel: 'Go', ...props },
    slots,
    attachTo: document.body,
  })
  mounted.push(wrapper)
  return wrapper
}

describe('InvestigationNoteForm', () => {
  it('trims the note before emitting', async () => {
    const wrapper = mountForm()
    await wrapper.find('textarea').setValue('   use fields.order_ref   ')
    await wrapper.find('.submit-btn').trigger('click')

    expect(wrapper.emitted('submit')?.[0]).toEqual(['use fields.order_ref'])
  })

  it('allows an empty note', async () => {
    // Re-running unchanged is legitimate, and the reject flow has always
    // permitted a reason-less rejection.
    const wrapper = mountForm()
    await wrapper.find('.submit-btn').trigger('click')

    expect(wrapper.emitted('submit')?.[0]).toEqual([''])
  })

  it('submits on Cmd+Enter and Ctrl+Enter', async () => {
    const meta = mountForm()
    await meta.find('textarea').setValue('a')
    await meta.find('textarea').trigger('keydown', { key: 'Enter', metaKey: true })
    expect(meta.emitted('submit')?.[0]).toEqual(['a'])

    const ctrl = mountForm()
    await ctrl.find('textarea').setValue('b')
    await ctrl.find('textarea').trigger('keydown', { key: 'Enter', ctrlKey: true })
    expect(ctrl.emitted('submit')?.[0]).toEqual(['b'])
  })

  it('cancels on Escape', async () => {
    const wrapper = mountForm()
    await wrapper.find('textarea').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('focuses the textarea so the operator can just type', () => {
    // Mounted alone in this test, so activeElement can only be this one.
    const wrapper = mountForm()
    expect(document.activeElement).toBe(wrapper.find('textarea').element)
  })

  it('blocks a second submit while one is in flight', async () => {
    const wrapper = mountForm({ busy: true })
    expect(wrapper.find('.submit-btn').attributes('disabled')).toBeDefined()
  })

  it('colours the action by tone', () => {
    expect(mountForm({ tone: 'danger' }).find('.submit-btn').classes()).toContain('danger')
    // Accent is the default, so the panel's re-run needs no tone prop.
    expect(mountForm().find('.submit-btn').classes()).toContain('accent')
  })

  it('renders extra controls passed by the caller', () => {
    const wrapper = mountForm({}, { default: '<label class="extra">Re-run too</label>' })
    expect(wrapper.find('.extra').exists()).toBe(true)
  })
})
