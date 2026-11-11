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
import { ref } from 'vue'
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
vi.mock('@/composables/useAgentChat', () => ({
  useAgentChat: () => ({
    messages: ref([]), isLoading: ref(false), error: ref(null), currentInput: ref(''),
    initChat: vi.fn(), sendMessage: vi.fn(), cleanup: vi.fn(),
  }),
}))
vi.mock('webfontloader', () => ({ default: { load: vi.fn() } }))
vi.mock('@/services/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

import AgentChatPreviewPanel from '@/components/agent/AgentChatPreviewPanel.vue'
import { PREVIEW_SAMPLE_COPY } from '@/webclient/copy'

const CLASSIC = { chat_style: 'CHATBOT', chat_background_color: '#ffffff' }
// The redesigned widget (widget_ui 2), as the agent stored it.
const NEW_DESIGN = { ...CLASSIC, chat_style: 'SUNRISE', customization_metadata: { widget_ui: { version: 2 } } }

const render = (customization: Record<string, unknown> = CLASSIC) => mount(AgentChatPreviewPanel, {
  props: {
    isActive: true,
    customization: customization as never,
    agentType: 'CUSTOMER_SUPPORT',
    agentName: 'Ada',
    agentId: 'agent-1',
  },
  attachTo: document.body,
})

// The new design's preview is loaded on demand (defineAsyncComponent).
const loaded = async () => { await vi.dynamicImportSettled(); await flushPromises() }

const onPlan = (features: Record<string, unknown>) => { state.currentPlan = { plan: { features } } }

describe('AgentChatPreviewPanel branding', () => {
  beforeEach(() => {
    state.currentPlan = null
    state.hasEnterpriseModule = true
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('drops "Powered by" when the plan includes custom branding, like the live widget', () => {
    onPlan({ custom_branding: true })
    expect(render().text()).not.toContain('Powered by')
  })

  it('keeps it on a plan without custom branding, and with no plan cached', () => {
    onPlan({ custom_branding: false })
    expect(render().text()).toContain('Powered by')
    state.currentPlan = null
    expect(render().text()).toContain('Powered by')
  })

  it('always shows it in the open-source build', () => {
    state.hasEnterpriseModule = false
    onPlan({ custom_branding: true })
    expect(render().text()).toContain('Powered by')
  })

  describe('for an agent on the new design', () => {
    it('previews the redesigned panel with the sample conversation, not the classic window', async () => {
      const wrapper = render(NEW_DESIGN)
      await loaded()
      expect(wrapper.find('[data-testid="panel-preview"] .chat-container.cm-ui-2').exists()).toBe(true)
      expect(wrapper.find('.chat-panel').exists()).toBe(false)
      expect(wrapper.text()).toContain(PREVIEW_SAMPLE_COPY.question)
      expect(wrapper.text()).toContain(PREVIEW_SAMPLE_COPY.answer)
      expect(wrapper.text()).toContain(PREVIEW_SAMPLE_COPY.receipt)
      wrapper.unmount()
    })

    it('follows the plan\'s branding the same way', async () => {
      onPlan({ custom_branding: true })
      const branded = render(NEW_DESIGN)
      await loaded()
      expect(branded.text()).not.toContain('Powered by')
      branded.unmount()
      onPlan({ custom_branding: false })
      const plain = render(NEW_DESIGN)
      await loaded()
      expect(plain.text()).toContain('Powered by')
      plain.unmount()
    })

    it('shows the edits as they are made: quick actions on the start state, and back to classic', async () => {
      const wrapper = render(NEW_DESIGN)
      await loaded()
      await wrapper.setProps({ customization: { ...NEW_DESIGN, quick_actions: ['Track my order'] } as never })
      expect(wrapper.text()).toContain('Track my order')
      expect(wrapper.text()).not.toContain(PREVIEW_SAMPLE_COPY.question)

      await wrapper.setProps({ customization: { ...CLASSIC, customization_metadata: { widget_ui: { version: 1 } } } as never })
      expect(wrapper.find('[data-testid="panel-preview"]').exists()).toBe(false)
      expect(wrapper.find('.chat-container').exists()).toBe(true)
      wrapper.unmount()
    })

    it('keeps the composer looking real but sends nothing', async () => {
      const wrapper = render(NEW_DESIGN)
      await loaded()
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
})
