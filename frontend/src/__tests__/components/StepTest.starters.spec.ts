// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const chat = vi.hoisted(() => ({
  messages: null as any, loading: null as any, connecting: null as any, connectionError: null as any,
  start: null as any, send: null as any,
}))

vi.mock('@/services/knowledge', () => ({
  knowledgeService: {
    getAgentQueueItems: vi.fn().mockResolvedValue({ queue_items: [] }),
    getKnowledgeByAgent: vi.fn().mockResolvedValue({ knowledge: [], pagination: { total_count: 1 } })
  }
}))
vi.mock('@/services/widget', () => ({ widgetService: { createAgentWidget: vi.fn() } }))
vi.mock('@/composables/useOnboardingTestChat', () => ({
  useOnboardingTestChat: () => ({ ...chat, cleanup: vi.fn() })
}))

import StepTest from '@/components/aiagent/onboarding/steps/StepTest.vue'

const mountStep = async () => {
  const wrapper = mount(StepTest, { props: { agentId: 'agent-1', agentName: 'Rex', widgetId: 'w-1' } })
  await flushPromises()
  return wrapper
}

const starters = (wrapper: Awaited<ReturnType<typeof mountStep>>) => wrapper.findAll('.starter')

describe('StepTest - starter questions', () => {
  beforeEach(() => {
    chat.messages = ref([])
    chat.loading = ref(false)
    chat.connecting = ref(false)
    chat.connectionError = ref<string | null>(null)
    chat.start = vi.fn().mockResolvedValue(true)
    chat.send = vi.fn()
  })

  it('an empty chat offers questions to start with', async () => {
    const wrapper = await mountStep()
    expect(wrapper.text()).toContain('Try one of these')
    expect(starters(wrapper).length).toBeGreaterThan(0)
  })

  it('clicking one sends it as the visitor', async () => {
    const wrapper = await mountStep()
    const first = starters(wrapper)[0]
    await first.trigger('click')
    expect(chat.send).toHaveBeenCalledWith(first.text())
  })

  it('go away once the conversation has started', async () => {
    const wrapper = await mountStep()
    chat.messages.value = [{ message: 'What do you do?', message_type: 'user' }]
    await flushPromises()
    expect(starters(wrapper)).toHaveLength(0)
  })

  it('are hidden while the agent is answering, and a click then sends nothing', async () => {
    const wrapper = await mountStep()
    const first = starters(wrapper)[0]
    chat.loading.value = true
    await flushPromises()
    expect(starters(wrapper)).toHaveLength(0)
    // The guard, not just the hidden button: a click queued before the re-render
    await first.trigger('click')
    expect(chat.send).not.toHaveBeenCalled()
  })

  it('are not offered while connecting', async () => {
    chat.connecting.value = true
    const wrapper = await mountStep()
    expect(starters(wrapper)).toHaveLength(0)
    expect(wrapper.text()).toContain('Connecting to your agent')
  })

  it('are not offered when the test session could not start', async () => {
    chat.connectionError.value = 'Could not connect to the agent. Please try again.'
    const wrapper = await mountStep()
    expect(starters(wrapper)).toHaveLength(0)
    expect(wrapper.text()).toContain('Could not connect to the agent')
  })
})
