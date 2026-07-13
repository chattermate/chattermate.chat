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

// FaqCard → MarkdownEditor → faqService → api → router → views → firebase,
// which cannot initialize in the test environment.
vi.mock('@/services/firebase', () => ({
  messaging: {},
  requestNotificationPermission: vi.fn(),
}))
vi.mock('@/services/faq', () => ({
  faqService: { uploadImage: vi.fn() },
}))

import FaqCard from '../../../components/faq/FaqCard.vue'
import MarkdownEditor from '../../../components/faq/MarkdownEditor.vue'
import type { FaqItem } from '../../../types/faq'

const faq: FaqItem = {
  id: 'f1',
  question: 'How does billing work?',
  answer: 'Plans are billed per seat, monthly or yearly.',
  category: 'Billing',
  status: 'published',
  knowledge_id: 1,
  source_label: 'Billing & refunds policy',
}

const createWrapper = (props = {}) =>
  mount(FaqCard, {
    props: {
      faq,
      editing: false,
      draftQuestion: '',
      draftAnswer: '',
      ...props,
    },
  })

describe('FaqCard display mode', () => {
  it('renders question, answer and source label', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.faq-card__question').text()).toBe('How does billing work?')
    expect(wrapper.find('.faq-card__answer').text()).toBe('Plans are billed per seat, monthly or yearly.')
    expect(wrapper.find('.faq-card__source').text()).toContain('Billing & refunds policy')
  })

  it('falls back to Generated when there is no source label', () => {
    const wrapper = createWrapper({ faq: { ...faq, source_label: null } })
    expect(wrapper.find('.faq-card__source').text()).toContain('Generated')
  })

  it('shows the publish pill state', () => {
    const published = createWrapper()
    expect(published.find('.pill').classes()).toContain('pill--published')
    expect(published.find('.pill').text()).toContain('Published')

    const draft = createWrapper({ faq: { ...faq, status: 'draft' } })
    expect(draft.find('.pill').classes()).toContain('pill--draft')
    expect(draft.find('.pill').text()).toContain('Draft')
  })

  it('emits toggle-status when the pill is clicked', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.pill').trigger('click')
    expect(wrapper.emitted('toggle-status')).toHaveLength(1)
  })

  it('emits edit and delete from the icon buttons', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.icon-btn--edit').trigger('click')
    await wrapper.find('.icon-btn--delete').trigger('click')
    expect(wrapper.emitted('edit')).toHaveLength(1)
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('hides edit and delete and disables the pill when locked', () => {
    const wrapper = createWrapper({ locked: true })
    expect(wrapper.find('.icon-btn--edit').exists()).toBe(false)
    expect(wrapper.find('.icon-btn--delete').exists()).toBe(false)
    expect(wrapper.find('.pill').attributes('disabled')).toBeDefined()
  })
})

describe('FaqCard edit mode', () => {
  it('renders inputs bound to the drafts', () => {
    const wrapper = createWrapper({
      editing: true,
      draftQuestion: 'Draft question?',
      draftAnswer: 'Draft answer.',
    })
    expect((wrapper.find('.edit-question').element as HTMLInputElement).value).toBe('Draft question?')
    // The answer is edited through the MarkdownEditor component.
    expect(wrapper.findComponent(MarkdownEditor).props('modelValue')).toBe('Draft answer.')
    expect(wrapper.find('.edit-label').text()).toBe('EDITING')
  })

  it('labels a new FAQ', () => {
    const wrapper = createWrapper({ editing: true, isNew: true })
    expect(wrapper.find('.edit-label').text()).toBe('NEW FAQ')
  })

  it('emits draft updates on input', async () => {
    const wrapper = createWrapper({ editing: true })
    await wrapper.find('.edit-question').setValue('New question')
    wrapper.findComponent(MarkdownEditor).vm.$emit('update:modelValue', 'New answer')
    expect(wrapper.emitted('update:draftQuestion')?.[0]).toEqual(['New question'])
    expect(wrapper.emitted('update:draftAnswer')?.[0]).toEqual(['New answer'])
  })

  it('emits save and cancel', async () => {
    const wrapper = createWrapper({ editing: true })
    await wrapper.find('.btn-save').trigger('click')
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('disables Save while saving', () => {
    const wrapper = createWrapper({ editing: true, saving: true })
    expect(wrapper.find('.btn-save').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.btn-save').text()).toBe('Saving…')
  })
})
