// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const getProgress = vi.fn()
const getAgentById = vi.fn()
// The enterprise module's setup service; null when the module is absent
let enterprise = true
vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({
    moduleImports: { setupService: 'setup-service', setupAssistant: 'setup-assistant' },
    // The setup assistant renders nothing here.
    enterpriseComponent: () => ({ render: () => null }),
    loadModule: async () => (enterprise ? { setupService: { getProgress: () => getProgress() } } : null),
  })
}))
vi.mock('@/services/agent', () => ({
  agentService: { getAgentById: (id: string) => getAgentById(id) }
}))
const createAgentWidget = vi.fn()
vi.mock('@/services/widget', () => ({
  widgetService: { createAgentWidget: (...a: unknown[]) => createAgentWidget(...a) }
}))
vi.mock('@/services/user', () => ({
  userService: { getCurrentUser: () => ({ organization_id: 'org-1' }) }
}))
vi.mock('@/utils/permissions', () => ({ permissionChecks: { canManageAgents: () => true } }))

const STORAGE_KEY = 'chattermate:onboarding:v1'
const stubs = {
  StepCreate: {
    emits: ['created'],
    template: `<button class="step-create" @click="$emit('created', { id: 'agent-1', name: 'Tom', agent_type: 'CUSTOMER_SUPPORT' })" />`,
  },
  StepTeach: {
    props: ['agentId', 'followAssistant'],
    emits: ['back'],
    template: `<button class="step-teach" :data-follow="String(!!followAssistant)" @click="$emit('back')">{{ agentId }}</button>`,
  },
  StepTest: { props: ['widgetId'], template: '<div class="step-test">{{ widgetId }}</div>' },
  StepLaunch: { props: ['widgetId'], template: '<div class="step-launch">{{ widgetId }}</div>' },
  SetupAssistant: {
    emits: ['changed'],
    template: `<div class="assistant">
      <button class="taught" @click="$emit('changed', 'knowledge')" />
      <button class="restyled" @click="$emit('changed', 'look')" />
    </div>`,
  },
}

const mountWizard = async () => {
  vi.resetModules()
  const { default: AIAgentOnboarding } = await import('@/components/aiagent/onboarding/AIAgentOnboarding.vue')
  const wrapper = mount(AIAgentOnboarding, { global: { stubs } })
  await flushPromises()
  return wrapper
}

describe('AIAgentOnboarding - where it resumes', () => {
  beforeEach(() => {
    localStorage.clear()
    enterprise = true
    getProgress.mockReset()
    createAgentWidget.mockReset().mockResolvedValue({ id: 'w-new' })
    getAgentById.mockReset().mockResolvedValue({ id: 'agent-9', name: 'Tom', agent_type: 'CUSTOMER_SUPPORT' })
  })

  it('on a fresh device, opens at the step the server reports', async () => {
    getProgress.mockResolvedValue({ step: 'test', agent_id: 'agent-9', widget_id: 'w-9', hidden: false })
    const wrapper = await mountWizard()
    expect(wrapper.find('.step-test').text()).toBe('w-9')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)['org-1'].agentId).toBe('agent-9')
  })

  it('opens Launch for an org that has tested but is not live', async () => {
    getProgress.mockResolvedValue({ step: 'launch', agent_id: 'agent-9', widget_id: 'w-9', hidden: false })
    const wrapper = await mountWizard()
    expect(wrapper.find('.step-launch').exists()).toBe(true)
  })

  describe('Teach following the assistant', () => {
    const atTeach = async () => {
      getProgress.mockResolvedValue({ step: 'teach', agent_id: 'agent-9', widget_id: 'w-9', hidden: false })
      return mountWizard()
    }
    const following = (wrapper: Awaited<ReturnType<typeof mountWizard>>) =>
      wrapper.find('.step-teach').attributes('data-follow')
    const click = async (wrapper: Awaited<ReturnType<typeof mountWizard>>, selector: string) => {
      await wrapper.find(selector).trigger('click')
      await flushPromises()
    }

    it('does not by default', async () => {
      expect(following(await atTeach())).toBe('false')
    })

    it('does once the assistant has changed the knowledge', async () => {
      const wrapper = await atTeach()
      await click(wrapper, '.taught')
      expect(following(wrapper)).toBe('true')
    })

    it('does not for a change that is not about knowledge', async () => {
      const wrapper = await atTeach()
      await click(wrapper, '.restyled')
      expect(following(wrapper)).toBe('false')
    })

    it('stops when they come back to the step by hand', async () => {
      const wrapper = await atTeach()
      await click(wrapper, '.taught')
      await click(wrapper, '.step-teach')
      await click(wrapper, '.step-create')
      expect(following(wrapper)).toBe('false')
    })
  })

  it('starts at Create when the org has no agent', async () => {
    getProgress.mockResolvedValue({ step: 'create', agent_id: null, widget_id: null, hidden: false })
    const wrapper = await mountWizard()
    expect(wrapper.find('.step-create').exists()).toBe(true)
  })

  it("prefers this browser's own run over the server", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'org-1': { skipped: false, currentStep: 1, completedSteps: [0], agentId: 'agent-9', agentName: 'Tom', widgetId: null, updatedAt: 1 },
    }))
    const wrapper = await mountWizard()
    expect(getProgress).not.toHaveBeenCalled()
    expect(wrapper.find('.step-teach').text()).toBe('agent-9')
  })

  it('creates the widget with the agent, so it exists if they stop at Teach', async () => {
    getProgress.mockResolvedValue({ step: 'create', agent_id: null, widget_id: null, hidden: false })
    const wrapper = await mountWizard()
    await wrapper.find('.step-create').trigger('click')
    await flushPromises()
    expect(createAgentWidget).toHaveBeenCalledWith('agent-1', 'Tom')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)['org-1'].widgetId).toBe('w-new')
    expect(wrapper.find('.step-teach').exists()).toBe(true)
  })

  it('still moves on to Teach if the widget could not be created', async () => {
    getProgress.mockResolvedValue({ step: 'create', agent_id: null, widget_id: null, hidden: false })
    createAgentWidget.mockRejectedValue(new Error('500'))
    const wrapper = await mountWizard()
    await wrapper.find('.step-create').trigger('click')
    await flushPromises()
    expect(wrapper.find('.step-teach').exists()).toBe(true)
  })

  it('in open source, resumes only from this browser', async () => {
    enterprise = false
    const wrapper = await mountWizard()
    expect(getProgress).not.toHaveBeenCalled()
    expect(wrapper.find('.step-create').exists()).toBe(true)
  })
})
