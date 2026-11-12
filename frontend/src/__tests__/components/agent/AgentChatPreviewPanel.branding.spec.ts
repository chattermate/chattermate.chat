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
import { mount } from '@vue/test-utils'

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

const render = () => mount(AgentChatPreviewPanel, {
  props: {
    isActive: true,
    customization: { chat_style: 'CHATBOT', chat_background_color: '#ffffff' } as never,
    agentType: 'CUSTOMER_SUPPORT',
    agentName: 'Ada',
    agentId: 'agent-1',
  },
})

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
})
