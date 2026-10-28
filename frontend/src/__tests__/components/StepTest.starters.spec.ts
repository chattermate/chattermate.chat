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

const mountStep = async (customization?: Record<string, unknown>) => {
  const wrapper = mount(StepTest, {
    props: { agentId: 'agent-1', agentName: 'Rex', widgetId: 'w-1', customization: customization as any }
  })
  await flushPromises()
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountStep>>
const starters = (wrapper: Wrapper) => wrapper.findAll('.starter')
const header = (wrapper: Wrapper) => wrapper.find('.chat-header').text()

describe('StepTest - looks like their widget', () => {
  beforeEach(() => {
    chat.messages = ref([])
    chat.loading = ref(false)
    chat.connecting = ref(false)
    chat.connectionError = ref<string | null>(null)
    chat.start = vi.fn().mockResolvedValue(true)
    chat.send = vi.fn()
  })

  it('shows the agent by name, online, with a greeting', async () => {
    const wrapper = await mountStep()
    expect(header(wrapper)).toContain('Rex')
    expect(header(wrapper)).toContain('Online')
    expect(wrapper.find('.agent-message').text()).toBe('Hi! How can I help you today?')
  })

  it('uses their welcome message and quick actions when they have set them', async () => {
    const wrapper = await mountStep({ welcome_message: 'Hey, ask me about plans', quick_actions: ['Pricing?', ' '] })
    expect(wrapper.find('.agent-message').text()).toBe('Hey, ask me about plans')
    expect(starters(wrapper).map(s => s.text())).toEqual(['Pricing?'])
  })

  it('wears the widget theme: its colours, and their photo as the avatar', async () => {
    const wrapper = await mountStep({ chat_style: 'TERMINAL', accent_color: '#123456', photo_url: 'https://cdn.example.com/rex.png' })
    const panel = wrapper.find('.test-window')
    expect(panel.classes()).toContain('theme-terminal')
    expect(panel.attributes('style')).toContain('--cm-accent: #123456')
    expect(wrapper.find('.header-avatar').attributes('src')).toBe('https://cdn.example.com/rex.png')
  })

  it('without a photo, the avatar is the generated orb', async () => {
    const wrapper = await mountStep()
    expect(wrapper.find('.header-avatar').attributes('src')).toMatch(/^data:image\/svg\+xml/)
  })

  it('user messages sit on the right, agent replies on the left with the avatar', async () => {
    const wrapper = await mountStep()
    chat.messages.value = [
      { message: 'What do you do?', message_type: 'user' },
      { message: 'We sell **plants**.', message_type: 'bot' },
    ]
    await flushPromises()
    const rows = wrapper.findAll('.message')
    expect(rows[1].classes()).toContain('user-message')
    expect(rows[1].find('img').exists()).toBe(false)
    expect(rows[2].classes()).toContain('agent-message')
    expect(rows[2].find('strong').text()).toBe('plants')
  })

  it('sending a message clears the box; a blank message is not sent', async () => {
    const wrapper = await mountStep()
    const field = wrapper.find('.message-input input')
    await field.setValue('   ')
    await wrapper.find('form.chat-input').trigger('submit')
    expect(chat.send).not.toHaveBeenCalled()
    await field.setValue('Do you deliver?')
    await wrapper.find('form.chat-input').trigger('submit')
    expect(chat.send).toHaveBeenCalledWith('Do you deliver?')
    expect((field.element as HTMLInputElement).value).toBe('')
  })

  it('while connecting the header says so and the box is disabled', async () => {
    chat.connecting.value = true
    const wrapper = await mountStep()
    expect(header(wrapper)).toContain('Connecting to your agent')
    expect(wrapper.find('.message-input input').attributes('disabled')).toBeDefined()
  })

  it('when the session cannot start it shows offline and why, with no greeting', async () => {
    chat.connectionError.value = 'Could not connect to the agent. Please try again.'
    const wrapper = await mountStep()
    expect(header(wrapper)).toContain('Offline')
    expect(wrapper.find('[role="alert"]').text()).toContain('Could not connect to the agent')
    expect(wrapper.find('.agent-message').exists()).toBe(false)
  })
})

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
    expect(starters(wrapper).map(s => s.text())).toEqual([
      'What do you do?', 'What can you help me with?', 'How can I get in touch?',
    ])
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
