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

const { DEFAULT, lock } = vi.hoisted(() => ({
  DEFAULT: "We're offline right now. Leave a message and our team will reply as soon as we're back.",
  lock: { locked: false },
}))

vi.mock('@/services/agent', () => ({
  agentService: {
    getGuardrailDefault: vi.fn().mockResolvedValue(''),
    getOfflineMessageDefault: vi.fn().mockResolvedValue(DEFAULT),
  },
}))
vi.mock('@/composables/useFeatureLock', () => ({
  useFeatureLock: () => ({ isLocked: (key: string) => key === 'offline-message' && lock.locked }),
}))

import AgentInstructionsTab from '@/components/agent/AgentInstructionsTab.vue'

const mountTab = async (props: Record<string, unknown> = {}) => {
  const wrapper = mount(AgentInstructionsTab, {
    props: { instructions: 'Be helpful', transferToHuman: false, askForRating: false, isEditing: true,
             agent: { id: 'agent-1', name: 'Ava', display_name: 'Ava' }, userGroups: [], selectedGroupIds: [],
             ...props },
    global: { directives: { tooltip: {} }, stubs: { 'font-awesome-icon': true, 'router-link': true } },
  })
  await flushPromises()
  return wrapper
}

const box = (wrapper: any) => wrapper.find('textarea[aria-label="Offline message"]')
const saved = async (wrapper: any) => {
  await wrapper.find('.save-button').trigger('click')
  return wrapper.emitted('save-agent')!.at(-1)![0]
}

describe('AgentInstructionsTab offline message', () => {
  beforeEach(() => { lock.locked = false })

  it('shows the default when the agent has no text of its own, and keeps it the default', async () => {
    const wrapper = await mountTab()
    expect(box(wrapper).attributes('placeholder')).toBe(DEFAULT)
    expect((box(wrapper).element as HTMLTextAreaElement).value).toBe('')
    expect(await saved(wrapper)).toMatchObject({ offlineMessage: null })
  })

  it("saves the agent's own text, and an emptied box goes back to the default", async () => {
    const wrapper = await mountTab({ offlineMessage: 'Back Monday.' })
    expect((box(wrapper).element as HTMLTextAreaElement).value).toBe('Back Monday.')
    await box(wrapper).setValue('  Closed for the holidays.  ')
    expect(await saved(wrapper)).toMatchObject({ offlineMessage: 'Closed for the holidays.' })
    await box(wrapper).setValue('   ')
    expect(await saved(wrapper)).toMatchObject({ offlineMessage: null })
  })

  it('is read-only with an upgrade line on a plan without it', async () => {
    lock.locked = true
    const wrapper = await mountTab()
    expect(box(wrapper).attributes('readonly')).toBeDefined()
    expect(wrapper.find('.offline-message-section .locked-note').text()).toContain('to write your own offline message.')
  })

  it('is editable with no upgrade line where the plan has it', async () => {
    const wrapper = await mountTab()
    expect(box(wrapper).attributes('readonly')).toBeUndefined()
    expect(wrapper.find('.offline-message-section .locked-note').exists()).toBe(false)
  })
})
