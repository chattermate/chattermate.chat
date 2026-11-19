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
import DeleteAgentModal from '@/components/agent/DeleteAgentModal.vue'
import type { Agent } from '@/types/agent'

const { getRemovalImpact, deleteAgent, toastError } = vi.hoisted(() => ({
  getRemovalImpact: vi.fn(),
  deleteAgent: vi.fn(),
  toastError: vi.fn(),
}))
vi.mock('vue-sonner', () => ({ toast: { error: toastError, success: vi.fn() } }))
vi.mock('@/services/agent', () => ({ agentService: { getRemovalImpact, deleteAgent } }))

const agent = { id: 'ag-1', name: 'support', display_name: 'Support Bot' } as Agent

const mountModal = async () => {
  const wrapper = mount(DeleteAgentModal, { props: { agent }, global: { stubs: { teleport: true, 'font-awesome-icon': true } } })
  await flushPromises()
  return wrapper
}
const deleteButton = (wrapper: Awaited<ReturnType<typeof mountModal>>) =>
  wrapper.findAll('button').find(b => b.text().startsWith('Delete agent'))!

describe('DeleteAgentModal', () => {
  beforeEach(() => {
    getRemovalImpact.mockReset()
    deleteAgent.mockReset()
    toastError.mockReset()
  })

  it('says what goes with the agent and what stays', async () => {
    getRemovalImpact.mockResolvedValue({ widgets: 1, channels: 2, workflows: 0 })
    const wrapper = await mountModal()

    expect(wrapper.text()).toContain('Delete this agent?')
    expect(wrapper.find('.dam-agent').text()).toContain('Support Bot')
    expect(wrapper.find('.dam-agent').text()).toContain('support')
    expect(wrapper.find('[data-testid="agent-removal-impact"]').text())
      .toContain("Its chat widget stops working on any site where it's installed.")
    expect(wrapper.text()).toContain('2 channels it answers are left without an agent.')
    expect(wrapper.text()).toContain('Past conversations, tickets and leads stay in your inbox.')
  })

  it('still says what a delete removes when the preview fails', async () => {
    getRemovalImpact.mockRejectedValue(new Error('offline'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountModal()

    expect(wrapper.text()).toContain('Its widgets and workflows are deleted with it')
    expect(deleteButton(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('says when nothing else is set up on the agent', async () => {
    getRemovalImpact.mockResolvedValue({ widgets: 0, channels: 0, workflows: 0 })
    const wrapper = await mountModal()

    expect(wrapper.text()).toContain('Nothing else is set up on this agent.')
    expect(wrapper.find('[data-testid="agent-removal-impact"]').exists()).toBe(false)
  })

  it('waits for the preview before allowing the delete', async () => {
    getRemovalImpact.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(DeleteAgentModal, { props: { agent }, global: { stubs: { teleport: true, 'font-awesome-icon': true } } })
    await flushPromises()

    expect(deleteButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('deletes on confirm and says so', async () => {
    getRemovalImpact.mockResolvedValue({ widgets: 0, channels: 0, workflows: 0 })
    deleteAgent.mockResolvedValue(undefined)
    const wrapper = await mountModal()

    await deleteButton(wrapper).trigger('click')
    await flushPromises()

    expect(deleteAgent).toHaveBeenCalledWith('ag-1')
    expect(wrapper.emitted('deleted')).toEqual([[agent]])
  })

  it('shows the server\'s reason and stays open when the delete is refused', async () => {
    getRemovalImpact.mockResolvedValue({ widgets: 0, channels: 0, workflows: 0 })
    deleteAgent.mockRejectedValue({ response: { data: { detail: 'This is your only agent. Create another one before deleting it.' } } })
    const wrapper = await mountModal()

    await deleteButton(wrapper).trigger('click')
    await flushPromises()

    expect(toastError).toHaveBeenCalledWith('This is your only agent. Create another one before deleting it.')
    expect(wrapper.emitted('deleted')).toBeUndefined()
  })

  it('cancel closes without deleting', async () => {
    getRemovalImpact.mockResolvedValue({ widgets: 0, channels: 0, workflows: 0 })
    const wrapper = await mountModal()

    await wrapper.findAll('button').find(b => b.text() === 'Cancel')!.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(deleteAgent).not.toHaveBeenCalled()
  })
})
