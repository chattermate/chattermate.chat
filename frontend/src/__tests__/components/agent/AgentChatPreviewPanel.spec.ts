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

const state = vi.hoisted(() => ({
  hasEnterpriseModule: true,
  currentPlan: null as null | { plan: { features: Record<string, unknown> } },
}))

vi.mock('@/composables/useEnterpriseFeatures', async () => {
  const { computed } = await import('vue')
  return {
    useEnterpriseFeatures: () => ({
      hasEnterpriseModule: state.hasEnterpriseModule,
      subscriptionStore: computed(() => ({ currentPlan: state.currentPlan })),
      initializeSubscriptionStore: vi.fn().mockResolvedValue(undefined),
    }),
  }
})
vi.mock('@/services/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

import AgentChatPreviewPanel from '@/components/agent/AgentChatPreviewPanel.vue'
import { PREVIEW_SAMPLE_COPY } from '@/webclient/copy'

const LOOK = { chat_style: 'SUNRISE', chat_background_color: '#ffffff' }

const render = (customization: Record<string, unknown> = LOOK) => mount(AgentChatPreviewPanel, {
  props: {
    customization: customization as never,
    agentName: 'Ada',
    agentId: 'agent-1',
  },
  attachTo: document.body,
})

const onPlan = (features: Record<string, unknown>) => { state.currentPlan = { plan: { features } } }

describe('AgentChatPreviewPanel', () => {
  beforeEach(() => {
    state.currentPlan = null
    state.hasEnterpriseModule = true
  })

  it('previews the panel with the sample conversation', async () => {
    const wrapper = render()
    await flushPromises()
    expect(wrapper.find('[data-testid="panel-preview"] .chat-container.cm-ui-2').exists()).toBe(true)
    expect(wrapper.text()).toContain(PREVIEW_SAMPLE_COPY.question)
    expect(wrapper.text()).toContain(PREVIEW_SAMPLE_COPY.answer)
    expect(wrapper.text()).toContain(PREVIEW_SAMPLE_COPY.receipt)
    wrapper.unmount()
  })

  it('previews the panel for an agent that once chose the classic widget too', async () => {
    const wrapper = render({ ...LOOK, customization_metadata: { widget_ui: { version: 1 } } })
    await flushPromises()
    expect(wrapper.find('[data-testid="panel-preview"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('drops "Powered by" when the plan includes custom branding, like the live widget', async () => {
    onPlan({ custom_branding: true })
    const wrapper = render()
    await flushPromises()
    expect(wrapper.text()).not.toContain('Powered by')
    wrapper.unmount()
  })

  it('keeps it on a plan without custom branding, and with no plan cached', async () => {
    onPlan({ custom_branding: false })
    const plain = render()
    await flushPromises()
    expect(plain.text()).toContain('Powered by')
    plain.unmount()
    state.currentPlan = null
    const uncached = render()
    await flushPromises()
    expect(uncached.text()).toContain('Powered by')
    uncached.unmount()
  })

  it('always shows it in the open-source build', async () => {
    state.hasEnterpriseModule = false
    onPlan({ custom_branding: true })
    const wrapper = render()
    await flushPromises()
    expect(wrapper.text()).toContain('Powered by')
    wrapper.unmount()
  })

  it('shows the edits as they are made: quick actions on the start state', async () => {
    onPlan({ quick_actions: true })
    const wrapper = render()
    await flushPromises()
    await wrapper.setProps({ customization: { ...LOOK, quick_actions: ['Track my order'] } as never })
    expect(wrapper.text()).toContain('Track my order')
    expect(wrapper.text()).not.toContain(PREVIEW_SAMPLE_COPY.question)
    wrapper.unmount()
  })

  it('shows no quick actions on a plan without them (Free), like the live widget', async () => {
    onPlan({ quick_actions: false })
    const wrapper = render({ ...LOOK, quick_actions: ['Track my order'] })
    await flushPromises()
    expect(wrapper.text()).not.toContain('Track my order')
    wrapper.unmount()
  })

  it('shows them in the open-source build', async () => {
    state.hasEnterpriseModule = false
    const wrapper = render()
    await flushPromises()
    await wrapper.setProps({ customization: { ...LOOK, quick_actions: ['Track my order'] } as never })
    expect(wrapper.text()).toContain('Track my order')
    wrapper.unmount()
  })

  it('uses the agent photo, or the orb when there is none', async () => {
    const withPhoto = render({ ...LOOK, photo_url: 'https://cdn.test/ada.png' })
    await flushPromises()
    expect(withPhoto.html()).toContain('https://cdn.test/ada.png')
    withPhoto.unmount()
  })

  it('keeps the composer looking real but sends nothing', async () => {
    const wrapper = render()
    await flushPromises()
    const box = wrapper.find('textarea')
    expect(box.exists()).toBe(true)
    expect(box.attributes('disabled')).toBeUndefined()
    await box.setValue('Hello?')
    await box.trigger('keydown', { key: 'Enter' })
    expect(wrapper.text()).not.toContain('Hello?')
    expect((box.element as HTMLTextAreaElement).value).toBe('Hello?')
    wrapper.unmount()
  })
})
