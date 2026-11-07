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
  list: vi.fn(), templates: vi.fn(), contextKeys: vi.fn(), create: vi.fn(), fromTemplate: vi.fn(),
  update: vi.fn(), setStatus: vi.fn(), reorder: vi.fn(), remove: vi.fn(), funnel: vi.fn(),
  stuckUsers: vi.fn(), stuckUsersCsv: vi.fn(), forPerson: vi.fn(),
}))
vi.mock('@/services/journeys', () => ({ journeysService: service }))
const actionsService = vi.hoisted(() => ({ list: vi.fn() }))
vi.mock('@/services/agentActions', () => ({ agentActionsService: actionsService }))
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('vue-sonner', () => ({ toast }))
vi.mock('@/utils/permissions', () => ({ permissionChecks: { canManageAgents: () => true } }))

import AgentJourneysTab from '@/components/agent/journeys/AgentJourneysTab.vue'
import JourneyEditor from '@/components/agent/journeys/JourneyEditor.vue'
import {
  audienceSummary, blankJourney, conditionSource, formatDuration, journeyProblems, renderPreview, startSummary, stepProblems, unknownVariables,
} from '@/components/agent/journeys/journeyModel'

const journey = (overrides: Record<string, unknown> = {}) => ({
  ...blankJourney(), id: 'j1', agent_id: 'a1', version: 1, created_at: null, updated_at: null,
  key: 'first_invoice', name: 'First invoice', status: 'live', ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  actionsService.list.mockResolvedValue({ actions: [{ name: 'send_invoice', confirm: 'always' }], cap: 30 })
  service.templates.mockResolvedValue([
    { key: 'trial_to_paid', name: 'Trial to paid', group: 'Growth', summary: 'S', goal_event: 'subscription_started', steps: ['A', 'B'], actions: { open_checkout: 'never' } },
  ])
  service.contextKeys.mockResolvedValue([{ key: 'plan', source: 'context', last_seen_at: '' }])
})

describe('journey model', () => {
  it('summarises audience and start', () => {
    const definition = blankJourney().definition
    expect(startSummary(definition)).toBe('Page /')
    definition.audience = { kind: 'rules', rules: [{ kind: 'ctx', value: 'plan', op: 'eq', operand: 'free' }] }
    expect(audienceSummary(definition)).toBe('Rule · ctx.plan is free')
    definition.start = { kind: 'manual' }
    expect(startSummary(definition)).toBe('From your code')
  })

  it('renders previews like the server', () => {
    expect(renderPreview('Hi {{user.first_name}}, on {{ctx.plan}} {{ ctx.x }}.', { user: { first_name: 'Maya' }, ctx: { plan: 'free' } }, { 'ctx.x': 'now' }))
      .toBe('Hi Maya, on free now.')
  })

  it('finds step and journey problems', () => {
    const step = { ...blankJourney().definition.steps[0], title: ' ', chips: [{ label: 'Go', kind: 'action' as const, value: 'send_invoice' }] }
    expect(stepProblems(step)).toEqual(['Give the step a title.', "send_invoice isn't allowed on this step."])
    expect(journeyProblems({ ...blankJourney(), key: 'Bad Key' })).toContain('The key uses lowercase letters, digits and underscores.')
  })

  it('flags variables no page sends and with no fallback', () => {
    const step = { ...blankJourney().definition.steps[0], message: 'Hi {{user.first_name}} on {{ctx.plan}} with {{ctx.bank_name}}' }
    expect(unknownVariables(step, new Set(['plan']), {})).toEqual(['ctx.bank_name'])
    expect(unknownVariables(step, new Set(['plan']), { 'ctx.bank_name': 'your bank' })).toEqual([])
  })

  it('says where each kind of condition gets its value', () => {
    expect(conditionSource('event', 'invoice_sent')).toEqual({ text: 'Your page reports it:', code: "ChatterMate.notify('invoice_sent')" })
    expect(conditionSource('ctx', ' plan ').code).toBe('ChatterMate.setContext({ plan: … })')
    expect(conditionSource('ctx', '').text).toContain('not verified')
    expect(conditionSource('user', 'email').text).toContain('identity token')
    expect(conditionSource('url', '/x').code).toBeUndefined()
  })

  it('formats durations in their two largest units', () => {
    expect(formatDuration(null)).toBe('—')
    expect(formatDuration(42.4)).toBe('42s')
    expect(formatDuration(200)).toBe('3m 20s')
    expect(formatDuration(180)).toBe('3m')
    expect(formatDuration(7500)).toBe('2h 5m')
    expect(formatDuration(86400)).toBe('1d')
    expect(formatDuration(97200)).toBe('1d 3h')
  })
})

describe('AgentJourneysTab', () => {
  const mountTab = async () => {
    const wrapper = mount(AgentJourneysTab, { props: { agentId: 'a1' }, global: { stubs: { teleport: true, 'font-awesome-icon': true } } })
    await flushPromises()
    return wrapper
  }

  it('shows the empty state with the template count', async () => {
    service.list.mockResolvedValue([])
    const wrapper = await mountTab()
    expect(wrapper.text()).toContain('No journeys yet')
    expect(wrapper.text()).toContain('See 1 templates')
    expect(wrapper.text()).toContain('1 actions declared · 1 context fields seen')
  })

  it('lists journeys and pauses one', async () => {
    service.list.mockResolvedValue([journey()])
    service.setStatus.mockResolvedValue(journey({ status: 'paused' }))
    const wrapper = await mountTab()
    expect(wrapper.text()).toContain('First invoice')
    expect(wrapper.text()).toContain('Live')
    await wrapper.find('[role="switch"]').trigger('click')
    await flushPromises()
    expect(service.setStatus).toHaveBeenCalledWith('a1', 'j1', 'paused')
    expect(wrapper.text()).toContain('Paused')
  })

  it('adds a template as a draft and opens it', async () => {
    service.list.mockResolvedValue([])
    service.fromTemplate.mockResolvedValue(journey({ name: 'Trial to paid', status: 'draft' }))
    const wrapper = await mountTab()
    await wrapper.findAll('button').find((b) => b.text().startsWith('See'))!.trigger('click')
    await wrapper.find('button[aria-label="Use Trial to paid"]').trigger('click')
    await flushPromises()
    expect(service.fromTemplate).toHaveBeenCalledWith('a1', 'trial_to_paid')
    expect(wrapper.findComponent(JourneyEditor).exists()).toBe(true)
  })

  it('reports a load error', async () => {
    service.list.mockRejectedValue({ response: { data: { detail: 'Journeys are not available in your current plan.' } } })
    const wrapper = await mountTab()
    expect(wrapper.text()).toContain('Journeys are not available in your current plan.')
  })
})

describe('JourneyEditor', () => {
  const mountEditor = (props: Record<string, unknown> = {}) => mount(JourneyEditor, {
    props: { journey: journey(), actions: [{ name: 'send_invoice', confirm: 'always' }], contextKeys: [], journeys: [], saving: false, ...props },
    global: { stubs: { teleport: true, 'font-awesome-icon': true } },
  })
  const button = (wrapper: ReturnType<typeof mountEditor>, text: string) => wrapper.findAll('button').find((b) => b.text() === text)!

  it('saves the whole journey', async () => {
    const wrapper = mountEditor()
    await wrapper.find('#step-title').setValue('Set your currency')
    await wrapper.findAll('button').find((b) => b.text() === 'Save')!.trigger('click')
    const [saved] = wrapper.emitted('save')![0] as any[]
    expect(saved.definition.steps[0].title).toBe('Set your currency')
    expect(saved.key).toBe('first_invoice')
  })

  it('blocks saving with a problem and says why', async () => {
    const wrapper = mountEditor()
    await wrapper.find('#step-title').setValue('')
    expect(wrapper.find('[role="alert"]').text()).toContain('Give the step a title.')
    expect(wrapper.findAll('button').find((b) => b.text() === 'Save')!.attributes('disabled')).toBeDefined()
  })

  it('warns past five steps and previews with sample context', async () => {
    const wrapper = mountEditor()
    for (let i = 0; i < 5; i++) await wrapper.find('.add-step').trigger('click')
    expect(wrapper.text()).toContain('This journey has 6 steps. Shorter ones finish more often.')
    await wrapper.find('#step-message').setValue('Hi {{user.first_name}}')
    expect(wrapper.find('[aria-label="Preview message"]').text()).toBe('Hi Maya')
  })

  it('offers a fallback for a variable no page sends', async () => {
    const wrapper = mountEditor()
    await wrapper.find('#step-message').setValue('Connect {{ctx.bank_name}}')
    expect(wrapper.text()).toContain("ctx.bank_name isn't in your page context yet")
    const fallback = wrapper.find('input[aria-label="Fallback for ctx.bank_name"]')
    ;(fallback.element as HTMLInputElement).value = 'your bank'
    await fallback.trigger('change')
    expect(wrapper.text()).not.toContain("ctx.bank_name isn't in your page context yet")
  })

  it('clears a condition when its kind changes, and picks a declared action for "Action succeeds"', async () => {
    const wrapper = mountEditor()
    expect((wrapper.find('#done-value-0').element as HTMLInputElement).value).not.toBe('')
    await wrapper.find('#done-kind-0').setValue('action')
    const picker = wrapper.find('#done-value-0')
    expect(picker.element.tagName).toBe('SELECT')
    expect((picker.element as HTMLSelectElement).value).toBe('')
    expect(picker.findAll('option').map((o) => o.text())).toEqual(['Pick an action', 'send_invoice'])
    expect(wrapper.find('[role="alert"]').text()).toContain('Fill in every condition.')
    await picker.setValue('send_invoice')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('tells the business how its page sends what a condition checks', async () => {
    const wrapper = mountEditor()
    await wrapper.find('#done-kind-0').setValue('event')
    await wrapper.find('#done-value-0').setValue('invoice_sent')
    expect(wrapper.find('#done-source-0').text()).toContain("ChatterMate.notify('invoice_sent')")
    expect(wrapper.find('#done-value-0').attributes('aria-describedby')).toBe('done-source-0')
  })

  it('allows the action a chip runs on its step', async () => {
    const wrapper = mountEditor()
    await button(wrapper, '+ Add reply').trigger('click')
    await wrapper.find('input[aria-label="Chip 1 label"]').setValue('Send it')
    await wrapper.find('select[aria-label="Chip 1 does"]').setValue('action')
    await wrapper.find('select[aria-label="Chip 1 action"]').setValue('send_invoice')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    await button(wrapper, 'Save').trigger('click')
    const [saved] = wrapper.emitted('save')![0] as any[]
    expect(saved.definition.steps[0].allowed_actions).toEqual(['send_invoice'])
    expect(wrapper.find('.preview-chip').text()).toBe('Send it')
  })

  it('asks before leaving with unsaved changes, and leaves straight away without', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Back to journeys"]').trigger('click')
    expect(wrapper.emitted('back')).toHaveLength(1)

    await wrapper.find('#step-title').setValue('Changed')
    await wrapper.find('[aria-label="Back to journeys"]').trigger('click')
    expect(wrapper.text()).toContain('Leave without saving?')
    await button(wrapper, 'Keep editing').trigger('click')
    expect(wrapper.text()).not.toContain('Leave without saving?')
    expect(wrapper.emitted('back')).toHaveLength(1)

    await wrapper.find('[aria-label="Back to journeys"]').trigger('click')
    await button(wrapper, 'Leave').trigger('click')
    expect(wrapper.emitted('back')).toHaveLength(2)
  })

  it('is read-only for viewers', () => {
    const wrapper = mountEditor({ readOnly: true })
    expect(wrapper.findAll('button').some((b) => b.text() === 'Save')).toBe(false)
  })
})
