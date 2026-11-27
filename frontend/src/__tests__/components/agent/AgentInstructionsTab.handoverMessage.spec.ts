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
  DEFAULT: "You're now connected with a member of our team.",
  lock: { locked: false },
}))

vi.mock('@/services/agent', () => ({
  agentService: {
    getGuardrailDefault: vi.fn().mockResolvedValue(''),
    getOfflineMessageDefault: vi.fn().mockResolvedValue(''),
    getHandoverMessageDefault: vi.fn().mockResolvedValue(DEFAULT),
  },
}))
vi.mock('@/composables/useFeatureLock', () => ({
  useFeatureLock: () => ({ isLocked: (key: string) => key === 'handover-message' && lock.locked }),
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

const section = (wrapper: any) => wrapper.find('.handover-message-section')
const toggle = (wrapper: any) => wrapper.find('input[aria-label="Teammate joined message"]')
const box = (wrapper: any) => wrapper.find('textarea[aria-label="Teammate joined message text"]')
const saved = async (wrapper: any) => {
  await wrapper.find('.save-button').trigger('click')
  return wrapper.emitted('save-agent')!.at(-1)![0]
}

describe('AgentInstructionsTab teammate joined message', () => {
  beforeEach(() => { lock.locked = false })

  it('is on with the default text, and saves as the default', async () => {
    const wrapper = await mountTab()
    expect((toggle(wrapper).element as HTMLInputElement).checked).toBe(true)
    expect(box(wrapper).attributes('placeholder')).toBe(DEFAULT)
    expect((box(wrapper).element as HTMLTextAreaElement).value).toBe('')
    expect(await saved(wrapper)).toMatchObject({ handoverNoticeEnabled: true, handoverMessage: null })
  })

  it("saves the agent's own text, and an emptied box goes back to the default", async () => {
    const wrapper = await mountTab({ handoverMessage: 'Hi, this is the Thailiving team.' })
    expect((box(wrapper).element as HTMLTextAreaElement).value).toBe('Hi, this is the Thailiving team.')
    await box(wrapper).setValue('  A lawyer has joined.  ')
    expect(await saved(wrapper)).toMatchObject({ handoverMessage: 'A lawyer has joined.' })
    await box(wrapper).setValue('   ')
    expect(await saved(wrapper)).toMatchObject({ handoverMessage: null })
  })

  it('switches off on every plan and hides the text while off', async () => {
    lock.locked = true
    const wrapper = await mountTab({ handoverMessage: 'Kept for later.' })
    await toggle(wrapper).setValue(false)
    expect(box(wrapper).exists()).toBe(false)
    expect(section(wrapper).text()).not.toContain(DEFAULT)
    expect(await saved(wrapper)).toMatchObject({ handoverNoticeEnabled: false })
  })

  it('shows a switched-off agent as off', async () => {
    const wrapper = await mountTab({ handoverNoticeEnabled: false })
    expect((toggle(wrapper).element as HTMLInputElement).checked).toBe(false)
    expect(box(wrapper).exists()).toBe(false)
  })

  it('shows the default text and an upgrade line, with no box, on a plan without own text', async () => {
    lock.locked = true
    const wrapper = await mountTab()
    expect(box(wrapper).exists()).toBe(false)
    expect(section(wrapper).text()).toContain(DEFAULT)
    expect(section(wrapper).find('.locked-note').text()).toContain('to write your own message.')
  })
})
