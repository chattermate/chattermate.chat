// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const getAgentQueueItems = vi.fn()
const getKnowledgeByAgent = vi.fn()

vi.mock('@/services/knowledge', () => ({
  knowledgeService: {
    getAgentQueueItems: (...a: unknown[]) => getAgentQueueItems(...a),
    getKnowledgeByAgent: (...a: unknown[]) => getKnowledgeByAgent(...a)
  }
}))
vi.mock('@/services/widget', () => ({ widgetService: { createAgentWidget: vi.fn() } }))
vi.mock('@/composables/useOnboardingTestChat', () => ({
  useOnboardingTestChat: () => ({
    messages: ref([]), loading: ref(false), connecting: ref(false), connectionError: ref(''),
    start: vi.fn(), send: vi.fn(), cleanup: vi.fn()
  })
}))

import StepTest from '@/components/aiagent/onboarding/steps/StepTest.vue'

const SITE = 'https://teeckbox.com'
const REASON = 'This site could not be found — the domain does not resolve.'
const queue = (status: string) => ({
  queue_items: [{ id: 1, source: SITE, source_type: 'website', status, created_at: '',
                  reason: status === 'failed' ? REASON : null }]
})
const knowledgePage = (count: number) => ({ knowledge: [], pagination: { total: count } })

const mountStep = async () => {
  const wrapper = mount(StepTest, { props: { agentId: 'agent-1', agentName: 'Rex', widgetId: 'w-1' } })
  await flushPromises()
  return wrapper
}

describe('StepTest - what the agent knows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('a crawl that fails after Teach says why, not "Knowledge indexed"', async () => {
    getAgentQueueItems.mockResolvedValueOnce(queue('pending')).mockResolvedValue(queue('failed'))
    getKnowledgeByAgent.mockResolvedValue(knowledgePage(0))
    const wrapper = await mountStep()
    expect(wrapper.text()).toContain('Still reading your knowledge')

    await vi.advanceTimersByTimeAsync(5000)
    await flushPromises()

    expect(wrapper.text()).not.toContain('Knowledge indexed')
    expect(wrapper.text()).toContain(`We couldn't read ${SITE}. ${REASON}`)
    expect(wrapper.text()).toContain("hasn't learned anything")
  })

  it('while indexing, asks them to try it now rather than wait to be notified', async () => {
    getAgentQueueItems.mockResolvedValue(queue('processing'))
    getKnowledgeByAgent.mockResolvedValue(knowledgePage(0))
    const wrapper = await mountStep()

    expect(wrapper.text()).toContain('Ask a question now')
    expect(wrapper.text()).not.toContain('notify')
  })

  it('a crawl that finishes says it is indexed', async () => {
    getAgentQueueItems.mockResolvedValueOnce(queue('pending')).mockResolvedValue(queue('completed'))
    getKnowledgeByAgent.mockResolvedValue(knowledgePage(1))
    const wrapper = await mountStep()

    await vi.advanceTimersByTimeAsync(5000)
    await flushPromises()

    expect(wrapper.text()).toContain('Knowledge indexed')
  })

  it('arriving after the failure shows it too', async () => {
    getAgentQueueItems.mockResolvedValue(queue('failed'))
    getKnowledgeByAgent.mockResolvedValue(knowledgePage(0))
    const wrapper = await mountStep()
    expect(wrapper.text()).toContain(`We couldn't read ${SITE}.`)
  })
})
