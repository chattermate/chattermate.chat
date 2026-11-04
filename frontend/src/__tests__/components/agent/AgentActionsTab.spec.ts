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

const service = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  modelView: vi.fn(),
  setEnabled: vi.fn(),
}))
const perms = vi.hoisted(() => ({ canManage: true }))
vi.mock('@/utils/permissions', () => ({ permissionChecks: { canManageAgents: () => perms.canManage } }))
vi.mock('@/services/agentActions', () => ({ agentActionsService: service }))
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('vue-sonner', () => ({ toast }))

import AgentActionsTab from '@/components/agent/actions/AgentActionsTab.vue'
import ActionEditor from '@/components/agent/actions/ActionEditor.vue'
import { parseParameters } from '@/components/agent/actions/actionPolicies'

const action = (overrides: Record<string, unknown> = {}) => ({
  id: 'a1',
  agent_id: 'agent-1',
  name: 'open_page',
  label: 'Go to a page',
  description: 'Navigates.',
  parameters: { type: 'object', properties: {} },
  confirm: 'never',
  timeout_s: 20,
  sensitive_form: false,
  enabled: true,
  last_registered_at: null,
  created_at: null,
  updated_at: null,
  ...overrides,
})

const mountTab = async () => {
  const wrapper = mount(AgentActionsTab, {
    props: { agentId: 'agent-1' },
    global: { stubs: { 'font-awesome-icon': true, teleport: true } },
  })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  perms.canManage = true
  service.modelView.mockResolvedValue({ name: 'open_page', description: 'Navigates.', parameters: {} })
})

describe('AgentActionsTab', () => {
  it('shows the empty state with the register example', async () => {
    service.list.mockResolvedValue({ actions: [], cap: 30 })
    const wrapper = await mountTab()
    expect(wrapper.text()).toContain('No actions yet')
    expect(wrapper.text()).toContain('ChatterMate.registerActions')
    expect(wrapper.text()).toContain('0 of 30 actions')
  })

  it('shows a load error with a retry', async () => {
    service.list.mockRejectedValueOnce({ response: { data: { detail: 'No active subscription found' } } })
    const wrapper = await mountTab()
    expect(wrapper.text()).toContain('No active subscription found')
    service.list.mockResolvedValue({ actions: [], cap: 3 })
    await wrapper.find('.state.error .link').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('No actions yet')
  })

  it('lists actions with policy and an unregistered warning', async () => {
    service.list.mockResolvedValue({ actions: [action({ confirm: 'always' })], cap: 30 })
    const wrapper = await mountTab()
    expect(wrapper.text()).toContain('open_page')
    expect(wrapper.text()).toContain('Always asks')
    expect(wrapper.find('.seen.warn').text()).toBe('Not registered')
  })

  it('disables New action at the plan cap', async () => {
    service.list.mockResolvedValue({ actions: [action()], cap: 1 })
    const wrapper = await mountTab()
    expect(wrapper.find('.tab-head .btn.accent').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Upgrade to add more.')
  })

  it('creates an action from the form', async () => {
    service.list.mockResolvedValue({ actions: [], cap: 30 })
    service.create.mockResolvedValue(action({ id: 'new', name: 'send_invoice' }))
    const wrapper = await mountTab()
    await wrapper.find('.tab-head .btn.accent').trigger('click')
    await wrapper.find('#action-name').setValue('send_invoice')
    await wrapper.find('#action-label').setValue('Send an invoice')
    await wrapper.find('#action-description').setValue('Emails an invoice.')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    const [, payload] = service.create.mock.calls[0]
    expect(payload).toMatchObject({ name: 'send_invoice', label: 'Send an invoice', confirm: 'never' })
    expect(payload.timeout_s).toBeUndefined()
    expect(toast.success).toHaveBeenCalledWith('Saved send_invoice')
  })

  it('reports a server rejection on save', async () => {
    service.list.mockResolvedValue({ actions: [], cap: 30 })
    service.create.mockRejectedValue({ response: { data: { detail: "This agent already has an action named 'x'" } } })
    const wrapper = await mountTab()
    await wrapper.find('.tab-head .btn.accent').trigger('click')
    await wrapper.find('#action-name').setValue('x')
    await wrapper.find('#action-label').setValue('X')
    await wrapper.find('#action-description').setValue('Does x.')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(toast.error).toHaveBeenCalledWith("This agent already has an action named 'x'")
  })

  it('toggles an action off without opening the editor', async () => {
    service.list.mockResolvedValue({ actions: [action()], cap: 30 })
    service.setEnabled.mockResolvedValue(action({ enabled: false }))
    const wrapper = await mountTab()
    await wrapper.find('[role="switch"]').trigger('click')
    await flushPromises()
    expect(service.setEnabled).toHaveBeenCalledWith('agent-1', 'a1', false)
    expect(service.update).not.toHaveBeenCalled()
    expect(wrapper.findComponent(ActionEditor).exists()).toBe(false)
  })

  it('deletes only after confirming', async () => {
    service.list.mockResolvedValue({ actions: [action()], cap: 30 })
    service.remove.mockResolvedValue(undefined)
    const wrapper = await mountTab()
    await wrapper.find('.icon-btn').trigger('click')
    expect(service.remove).not.toHaveBeenCalled()
    await wrapper.find('.btn.danger').trigger('click')
    await flushPromises()
    expect(service.remove).toHaveBeenCalledWith('agent-1', 'a1')
    expect(wrapper.text()).toContain('No actions yet')
  })
})

describe('AgentActionsTab for viewers', () => {
  it('hides editing controls and makes the editor read-only', async () => {
    perms.canManage = false
    service.list.mockResolvedValue({ actions: [action()], cap: 30 })
    const wrapper = await mountTab()
    expect(wrapper.find('.tab-head .btn.accent').exists()).toBe(false)
    expect(wrapper.find('.icon-btn').exists()).toBe(false)
    expect(wrapper.find('[role="switch"]').attributes('disabled')).toBeDefined()
    await wrapper.find('.row:not(.head)').trigger('click')
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
    expect(wrapper.find('fieldset.editor-body').attributes('disabled')).toBeDefined()
  })
})

describe('ActionEditor validation', () => {
  const mountEditor = (props: Record<string, unknown> = {}) =>
    mount(ActionEditor, {
      props: { agentId: 'agent-1', action: null, saving: false, ...props },
      global: { stubs: { 'font-awesome-icon': true } },
    })

  it('blocks a bad name and bad JSON', async () => {
    const wrapper = mountEditor()
    await wrapper.find('#action-name').setValue('Bad-Name')
    await wrapper.find('#action-parameters').setValue('{nope')
    expect(wrapper.text()).toContain('Use lowercase letters')
    expect(wrapper.text()).toContain('Arguments must be valid JSON.')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('loads the model preview for a saved action', async () => {
    const wrapper = mountEditor({ action: action() })
    await flushPromises()
    expect(service.modelView).toHaveBeenCalledWith('agent-1', 'a1')
    expect(wrapper.find('.model-view').text()).toContain('open_page: Navigates.')
  })
})

describe('parseParameters', () => {
  it.each([
    ['[]', 'Arguments must be a JSON object.'],
    ['{"type": "string"}', 'Arguments need "type": "object".'],
    ['null', 'Arguments must be a JSON object.'],
  ])('rejects %s', (text, error) => {
    expect(parseParameters(text).error).toBe(error)
  })

  it('accepts an object schema', () => {
    expect(parseParameters('{"type": "object"}').value).toEqual({ type: 'object' })
  })
})
