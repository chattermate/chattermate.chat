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

const pending = (preview: unknown = null, details: Array<{ key: string; value: string }> | null = null) => ({
  request: { call_id: 'c1', name: 'send_invoice', label: 'Send an invoice', args: { to: 'a@b.co', amount: 120 }, confirm: 'always' as const, timeout_s: 5 },
  preview: preview as any,
  details,
})

describe('ActionConfirmCard', () => {
  it('lists the arguments for an always-ask action', async () => {
    const wrapper = mount(ActionConfirmCard, { props: { pending: pending() } })
    expect(wrapper.text()).toContain('Send an invoice')
    expect(wrapper.find('dl').text()).toContain('a@b.co')
    expect(wrapper.find('.cm-action-head').text()).toBe('Send an invoice?')
    expect(wrapper.find('dt').text()).toBe('To')
    expect(wrapper.find('.cm-action-apply').text()).toBe('Send an invoice')
    expect(wrapper.find('.cm-action-cancel').text()).toBe('Not now')
    await wrapper.find('.cm-action-apply').trigger('click')
    expect(wrapper.emitted('approve')).toHaveLength(1)
  })

  it('shows the page\'s details instead of the arguments', () => {
    const wrapper = mount(ActionConfirmCard, { props: { pending: pending(null, [{ key: 'Invoice', value: 'INV-001' }, { key: 'To', value: '<b>x</b>' }]) } })
    expect(wrapper.findAll('dt').map((d) => d.text())).toEqual(['Invoice', 'To'])
    expect(wrapper.find('dl').text()).not.toContain('a@b.co')
    expect(wrapper.find('b').exists()).toBe(false)
  })

  it('shows before and after when overwriting', async () => {
    const wrapper = mount(ActionConfirmCard, { props: { pending: pending({ before: 'USD', after: { code: 'GBP' } }) } })
    expect(wrapper.find('.before').text()).toContain('USD')
    expect(wrapper.find('.after').text()).toContain('GBP')
    // An object can't be quoted on a button, so the wording stays generic.
    expect(wrapper.find('.cm-action-apply').text()).toBe('Change it')
    expect(wrapper.find('.cm-action-cancel').text()).toBe('Keep USD')
    await wrapper.find('.cm-action-cancel').trigger('click')
    expect(wrapper.emitted('decline')).toHaveLength(1)
  })

  it('names both values on the buttons when they are short', () => {
    const wrapper = mount(ActionConfirmCard, { props: { pending: pending({ before: 'USD', after: 'GBP' }) } })
    expect(wrapper.find('.cm-action-apply').text()).toBe('Change to GBP')
    expect(wrapper.find('.cm-action-cancel').text()).toBe('Keep USD')
  })

  it('renders page text as text, never HTML', () => {
    const wrapper = mount(ActionConfirmCard, { props: { pending: pending({ before: '<img src=x onerror=alert(1)>', after: '' }) } })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.after').text()).toContain('—')
  })
})
