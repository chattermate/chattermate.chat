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

vi.mock('@/services/agent', () => ({
  agentService: { getGuardrailDefault: vi.fn().mockResolvedValue('') },
}))

import AgentInstructionsTab from '@/components/agent/AgentInstructionsTab.vue'

const mountTab = async (props: Record<string, unknown> = {}) => {
  const wrapper = mount(AgentInstructionsTab, {
    props: { instructions: 'Be helpful', transferToHuman: false, askForRating: false, isEditing: true,
             agent: { id: 'agent-1', name: 'Ava', display_name: 'Ava' }, userGroups: [], selectedGroupIds: [],
             ...props },
    global: { directives: { tooltip: {} }, stubs: { 'font-awesome-icon': true } },
  })
  await flushPromises()
  return wrapper
}

const buttonsSwitch = (wrapper: any) => wrapper.find('input[aria-label="Reply buttons"]')

describe('AgentInstructionsTab reply buttons', () => {
  it('is off by default and named for the channels it covers', async () => {
    const wrapper = await mountTab()
    expect((buttonsSwitch(wrapper).element as HTMLInputElement).checked).toBe(false)
    expect(wrapper.text()).toContain('in the website chat, WhatsApp, Messenger, Instagram and Telegram.')
  })

  it('is hidden when the AI does not answer', async () => {
    const wrapper = await mountTab({ aiRepliesEnabled: false })
    expect(buttonsSwitch(wrapper).exists()).toBe(false)
  })

  it('saves the choice', async () => {
    const wrapper = await mountTab()
    await buttonsSwitch(wrapper).setValue(true)
    await wrapper.find('.save-button').trigger('click')
    expect(wrapper.emitted('save-agent')![0][0]).toMatchObject({ channelQuickReplies: true })
  })

  it('reflects an agent that has it on', async () => {
    const wrapper = await mountTab({ channelQuickReplies: true })
    expect((buttonsSwitch(wrapper).element as HTMLInputElement).checked).toBe(true)
  })
})
