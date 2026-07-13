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
import FaqGenerateBar from '../../../components/faq/FaqGenerateBar.vue'

const createWrapper = (props = {}) =>
  mount(FaqGenerateBar, {
    props: {
      phase: 'idle' as const,
      sourceCount: 5,
      pageCount: 9,
      faqCount: 12,
      publishedCount: 7,
      ...props,
    },
  })

describe('FaqGenerateBar', () => {
  it('shows knowledge base counts and Generate when idle', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.generate-bar__title').text()).toBe('Generate FAQs')
    expect(wrapper.find('.generate-bar__sub').text()).toContain('Reading from 5 sources · 9 pages')
    expect(wrapper.find('.btn--generate').text()).toContain('Generate')
    expect(wrapper.find('.btn--generate').attributes('disabled')).toBeUndefined()
  })

  it('shows FAQ counts and Regenerate when ready', () => {
    const wrapper = createWrapper({ phase: 'ready' })
    expect(wrapper.find('.generate-bar__title').text()).toBe('FAQs ready to publish')
    expect(wrapper.find('.generate-bar__sub').text()).toContain('12 FAQs · 7 published')
    expect(wrapper.find('.btn--generate').text()).toContain('Regenerate')
  })

  it('disables the generate button while generating', () => {
    const wrapper = createWrapper({ phase: 'generating' })
    expect(wrapper.find('.generate-bar__title').text()).toBe('Generating FAQs…')
    expect(wrapper.find('.btn--generate').text()).toContain('Generating…')
    expect(wrapper.find('.btn--generate').attributes('disabled')).toBeDefined()
  })

  it('respects the disabled prop', () => {
    const wrapper = createWrapper({ disabled: true })
    expect(wrapper.find('.btn--generate').attributes('disabled')).toBeDefined()
  })

  it('emits generate, import and add', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.btn--generate').trigger('click')
    const ghostButtons = wrapper.findAll('.btn--ghost')
    await ghostButtons[0].trigger('click')
    await ghostButtons[1].trigger('click')
    expect(wrapper.emitted('generate')).toHaveLength(1)
    expect(wrapper.emitted('import')).toHaveLength(1)
    expect(wrapper.emitted('add')).toHaveLength(1)
  })

  it('does not emit generate when disabled', async () => {
    const wrapper = createWrapper({ phase: 'generating' })
    await wrapper.find('.btn--generate').trigger('click')
    expect(wrapper.emitted('generate')).toBeUndefined()
  })
})
