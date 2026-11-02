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

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionConfirmCard from '@/webclient/ActionConfirmCard.vue'

const pending = (preview: unknown = null) => ({
  request: { call_id: 'c1', name: 'send_invoice', label: 'Send an invoice', args: { to: 'a@b.co', amount: 120 }, confirm: 'always' as const, timeout_s: 5 },
  preview: preview as any,
})

describe('ActionConfirmCard', () => {
  it('lists the arguments for an always-ask action', async () => {
    const wrapper = mount(ActionConfirmCard, { props: { pending: pending() } })
    expect(wrapper.text()).toContain('Send an invoice')
    expect(wrapper.find('dl').text()).toContain('a@b.co')
    expect(wrapper.find('.cm-action-cancel').text()).toBe('Cancel')
    await wrapper.find('.cm-action-apply').trigger('click')
    expect(wrapper.emitted('approve')).toHaveLength(1)
  })

  it('shows before and after when overwriting', async () => {
    const wrapper = mount(ActionConfirmCard, { props: { pending: pending({ before: 'USD', after: { code: 'GBP' } }) } })
    expect(wrapper.find('.before').text()).toContain('USD')
    expect(wrapper.find('.after').text()).toContain('GBP')
    expect(wrapper.find('.cm-action-cancel').text()).toBe('Keep current')
    await wrapper.find('.cm-action-cancel').trigger('click')
    expect(wrapper.emitted('decline')).toHaveLength(1)
  })

  it('renders page text as text, never HTML', () => {
    const wrapper = mount(ActionConfirmCard, { props: { pending: pending({ before: '<img src=x onerror=alert(1)>', after: '' }) } })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.after').text()).toContain('—')
  })
})
