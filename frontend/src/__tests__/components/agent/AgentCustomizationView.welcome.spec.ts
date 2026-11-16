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
import { flushPromises, mount } from '@vue/test-utils'

vi.mock('webfontloader', () => ({ default: { load: vi.fn() } }))
vi.mock('@/config/api', async (orig) => ({ ...(await orig<object>()), getGoogleFontsApiKey: () => '' }))
vi.mock('@/composables/useEnterpriseFeatures', async () => {
  const { ref } = await import('vue')
  return {
    useEnterpriseFeatures: () => ({
      hasEnterpriseModule: false,
      subscriptionStore: ref({ availablePlans: [] }),
      initializeSubscriptionStore: vi.fn(async () => undefined),
    }),
  }
})

import AgentCustomizationView from '@/components/agent/AgentCustomizationView.vue'

const agentWith = (chat_style: string) => ({
  id: 'a1', name: 'Sales Guide', display_name: 'GlideAgent', description: null,
  customization: { chat_style, welcome_title: 'Welcome to Bodhiorchard', welcome_subtitle: '' },
}) as never

const open = async (chatStyle: string) => {
  const wrapper = mount(AgentCustomizationView, {
    props: { agent: agentWith(chatStyle) },
    global: { stubs: { 'font-awesome-icon': true }, directives: { tooltip: {} } },
  })
  await flushPromises()
  return wrapper
}

describe('AgentCustomizationView welcome title', () => {
  it.each(['CHATBOT', 'ASK_ANYTHING'])('is editable in the %s design', async (style) => {
    const wrapper = await open(style)
    const title = wrapper.find<HTMLInputElement>('#welcome-title')

    expect(title.exists()).toBe(true)
    expect(title.element.value).toBe('Welcome to Bodhiorchard')
    expect(wrapper.find('#welcome-subtitle').exists()).toBe(true)
  })

  it("names the widget's real default for each design", async () => {
    expect((await open('CHATBOT')).find('#welcome-title').attributes('placeholder')).toBe('Hi there')
    expect((await open('ASK_ANYTHING')).find('#welcome-title').attributes('placeholder')).toBe('Ask GlideAgent')
  })
})
