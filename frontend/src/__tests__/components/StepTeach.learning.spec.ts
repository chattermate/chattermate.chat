// @vitest-environment jsdom
// A source that has been sent stays on the Teach step while it is read: it may
// have come from the setup assistant, with the step reloading around it.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const getOrganization = vi.fn()
const getKnowledgeByAgent = vi.fn()
const getKnowledgeByOrganization = vi.fn()
const getAgentQueueItems = vi.fn()
const addUrls = vi.fn()

vi.mock('@/services/organization', () => ({
  organizationService: { getOrganization: (id: string) => getOrganization(id) }
}))
vi.mock('@/services/knowledge', () => ({
  knowledgeService: {
    getKnowledgeByAgent: (...a: unknown[]) => getKnowledgeByAgent(...a),
    getKnowledgeByOrganization: (...a: unknown[]) => getKnowledgeByOrganization(...a),
    addUrls: (...a: unknown[]) => addUrls(...a),
    getAgentQueueItems: (...a: unknown[]) => getAgentQueueItems(...a)
  }
}))
vi.mock('@/utils/storage', () => ({
  subscriptionStorage: { getPlanLimits: () => ({ maxKnowledgeSources: 0 }) }
}))

import StepTeach from '@/components/aiagent/onboarding/steps/StepTeach.vue'
import { LEARNING_POLL_MS, queueItemName } from '@/composables/useLearningWatch'
import type { QueueItem } from '@/types/knowledge'

const SITE = 'https://pedalco.example.com'
const row = (id: number, status: QueueItem['status'], extra: Partial<QueueItem> = {}): QueueItem => ({
  id, source: SITE, source_type: 'website', status, created_at: '', ...extra,
})
const queue = (...items: QueueItem[]) => ({ queue_items: items })
const empty = { knowledge: [], pagination: { total_pages: 0, total: 0 } }
const indexed = { knowledge: [{ id: 1, name: SITE }], pagination: { total_pages: 1, total: 1 } }

let wrapper: VueWrapper<any>

const mountStep = async (props: { followAssistant?: boolean } = {}) => {
  wrapper = mount(StepTeach, {
    props: { agentId: 'agent-1', organizationId: 'org-1', ...props },
    global: { plugins: [createPinia()], stubs: { 'font-awesome-icon': true } },
    attachTo: document.body,
  })
  await flushPromises()
}

const names = (list: string) => wrapper.findAll(`${list} .source-name`).map((n) => n.text())
const learning = () => names('.source-list.learning')
const done = () => names('.source-list.indexed')
const staged = () => wrapper.findAll('[aria-label="To add"] .source-name').map((n) => n.text())
const failure = () => wrapper.find('.crawl-failure')

const nextPoll = async () => {
  await vi.advanceTimersByTimeAsync(LEARNING_POLL_MS)
  await flushPromises()
}

describe('StepTeach while sources are read', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getOrganization.mockResolvedValue({ domain: 'pedalco.example.com' })
    getKnowledgeByAgent.mockResolvedValue(empty)
    getKnowledgeByOrganization.mockResolvedValue(empty)
    getAgentQueueItems.mockResolvedValue(queue())
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
  })

  it.each(['pending', 'processing'] as const)('shows a %s site as learning, not staged again', async (status) => {
    getAgentQueueItems.mockResolvedValue(queue(row(1, status)))
    await mountStep()

    expect(learning()).toEqual([SITE])
    expect(wrapper.find('.source-list.learning .source-tag').text()).toBe('learning…')
    expect(staged()).toEqual([])
  })

  it('shows nothing and never polls when nothing is being read', async () => {
    getAgentQueueItems.mockResolvedValue(queue(row(1, 'completed'), row(2, 'failed')))
    await mountStep()
    const calls = getAgentQueueItems.mock.calls.length

    await nextPoll()

    expect(wrapper.find('.source-list.learning').exists()).toBe(false)
    expect(getAgentQueueItems).toHaveBeenCalledTimes(calls)
  })

  it('names a PDF by its own name', async () => {
    const source = 'https://bucket.example/uploads/1818d52a33ba48668068120f9ed38698_menu.pdf'
    getAgentQueueItems.mockResolvedValue(queue(row(1, 'pending', { source, source_type: 'pdf_file' })))
    await mountStep()

    expect(learning()).toEqual(['menu.pdf'])
  })

  it.each(['website', 'sitemap'])('shows a %s by its whole address', (source_type) => {
    const source = 'https://pedalco.example.com/sitemap.xml'
    expect(queueItemName(row(1, 'pending', { source, source_type }))).toBe(source)
  })

  it('names a PDF kept in S3 without the signature on its link', () => {
    const source = 'https://bucket.s3.amazonaws.com/knowledge/org/1818d52a33ba48668068120f9ed38698_menu.pdf?X-Amz-Signature=abc&X-Amz-Expires=3600'
    expect(queueItemName(row(1, 'pending', { source, source_type: 'pdf_url' }))).toBe('menu.pdf')
  })

  it('falls back to the link for a PDF address with no file name', () => {
    const source = 'https://acme.example/download/?id=7'
    expect(queueItemName(row(1, 'pending', { source, source_type: 'pdf_url' }))).toBe(source)
  })

  it('names a failed PDF by its file name, not its signed link', async () => {
    const source = 'https://bucket.s3.amazonaws.com/org/1818d52a33ba48668068120f9ed38698_menu.pdf?X-Amz-Signature=abc'
    getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing', { source, source_type: 'pdf_url' })))
    await mountStep()

    getAgentQueueItems.mockResolvedValue(queue(row(1, 'failed', { source, source_type: 'pdf_url', reason: 'It could not be read.' })))
    await nextPoll()

    expect(failure().text()).toContain("We couldn't read menu.pdf. It could not be read.")
    expect(failure().text()).not.toContain('X-Amz')
  })

  it('names a PDF linked from the web by its file name', () => {
    expect(queueItemName(row(1, 'pending', { source: 'https://pedalco.example.com/docs/menu.pdf', source_type: 'pdf_url' }))).toBe('menu.pdf')
  })

  it('keeps a filename that only looks like it has a prefix', () => {
    expect(queueItemName(row(1, 'pending', { source: 'menu_2026.pdf', source_type: 'pdf_file' }))).toBe('menu_2026.pdf')
  })

  it('moves a finished site to the indexed list and stops polling', async () => {
    getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
    await mountStep()

    getAgentQueueItems.mockResolvedValue(queue(row(1, 'completed')))
    getKnowledgeByAgent.mockResolvedValue(indexed)
    await nextPoll()

    expect(learning()).toEqual([])
    expect(done()).toEqual([SITE])
    expect(failure().exists()).toBe(false)

    const calls = getAgentQueueItems.mock.calls.length
    await nextPoll()
    expect(getAgentQueueItems).toHaveBeenCalledTimes(calls)
  })

  it('lists an indexed PDF by the name they gave it', async () => {
    getKnowledgeByAgent.mockResolvedValue({
      knowledge: [{ id: 2, name: '1818d52a33ba48668068120f9ed38698_menu' }],
      pagination: { total_pages: 1, total: 1 },
    })
    await mountStep()

    expect(done()).toEqual(['menu'])
  })

  it('says why a site could not be read, even with another source already indexed', async () => {
    getKnowledgeByAgent.mockResolvedValue({ knowledge: [{ id: 9, name: 'Our FAQ' }], pagination: { total_pages: 1, total: 1 } })
    getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
    await mountStep()

    getAgentQueueItems.mockResolvedValue(queue(row(1, 'failed', { reason: 'This site could not be found.' })))
    await nextPoll()

    expect(learning()).toEqual([])
    expect(failure().text()).toContain(`We couldn't read ${SITE}. This site could not be found.`)
  })

  it('keeps showing the rest when one of two sources finishes', async () => {
    const other = 'https://docs.pedalco.example.com'
    getAgentQueueItems.mockResolvedValue(queue(row(2, 'pending', { source: other }), row(1, 'processing')))
    await mountStep()

    getAgentQueueItems.mockResolvedValue(queue(row(2, 'pending', { source: other }), row(1, 'completed')))
    getKnowledgeByAgent.mockResolvedValue(indexed)
    await nextPoll()

    expect(learning()).toEqual([other])
    expect(done()).toEqual([SITE])

    getAgentQueueItems.mockResolvedValue(queue(row(2, 'completed', { source: other }), row(1, 'completed')))
    await nextPoll()
    expect(learning()).toEqual([])
  })

  it('rides out a failed look at the queue and carries on', async () => {
    getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
    await mountStep()

    getAgentQueueItems.mockRejectedValueOnce(new Error('502'))
    await nextPoll()
    expect(learning()).toEqual([SITE])

    getAgentQueueItems.mockResolvedValue(queue(row(1, 'completed')))
    getKnowledgeByAgent.mockResolvedValue(indexed)
    await nextPoll()
    expect(done()).toEqual([SITE])
  })

  it('leaves a failure on screen alone, so text being pasted is not lost', async () => {
    const other = 'https://docs.pedalco.example.com'
    getOrganization.mockResolvedValue({ domain: null })
    getAgentQueueItems.mockResolvedValue(queue(row(2, 'failed', { source: other, source_type: 'website', reason: 'First.' })))
    await mountStep()
    await wrapper.findAll('button').find((b) => b.text() === 'Paste some text instead')!.trigger('click')
    expect(wrapper.findComponent({ name: 'TeachTextFallback' }).exists()).toBe(true)

    getAgentQueueItems.mockResolvedValue(queue(row(3, 'processing'), row(2, 'failed', { source: other, reason: 'First.' })))
    await wrapper.vm.$nextTick()
    await (wrapper.vm as any).$.setupState.fetchKnowledge()
    await flushPromises()
    getAgentQueueItems.mockResolvedValue(queue(row(3, 'failed', { reason: 'Second.' }), row(2, 'failed', { source: other, reason: 'First.' })))
    await nextPoll()

    expect(failure().text()).toContain('First.')
    expect(wrapper.findComponent({ name: 'TeachTextFallback' }).exists()).toBe(true)
  })

  describe('after the assistant added a source', () => {
    const follow = { followAssistant: true }
    const movedOn = () => wrapper.emitted('next')?.length ?? 0
    const other = 'https://docs.pedalco.example.com'

    const finishReading = async () => {
      getAgentQueueItems.mockResolvedValue(queue(row(1, 'completed')))
      getKnowledgeByAgent.mockResolvedValue(indexed)
      await nextPoll()
    }

    it('moves on once the site has been read', async () => {
      getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
      await mountStep(follow)
      expect(movedOn()).toBe(0)

      await finishReading()

      expect(movedOn()).toBe(1)
    })

    it('stays when the assistant had no part in it', async () => {
      getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
      await mountStep()

      await finishReading()

      expect(movedOn()).toBe(0)
      expect(done()).toEqual([SITE])
    })

    it('moves on at once for text, which is learned as it is added', async () => {
      getKnowledgeByAgent.mockResolvedValue(indexed)
      await mountStep(follow)

      expect(movedOn()).toBe(1)
      expect(getOrganization).not.toHaveBeenCalled()
    })

    it('stays when the site could not be read, and says why', async () => {
      getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
      await mountStep(follow)

      getAgentQueueItems.mockResolvedValue(queue(row(1, 'failed', { reason: 'Not found.' })))
      await nextPoll()

      expect(movedOn()).toBe(0)
      expect(failure().text()).toContain('Not found.')
    })

    it('stays when one source was read and another failed', async () => {
      getAgentQueueItems.mockResolvedValue(queue(row(2, 'pending', { source: other }), row(1, 'processing')))
      await mountStep(follow)

      getAgentQueueItems.mockResolvedValue(queue(row(2, 'failed', { source: other, reason: 'Not found.' }), row(1, 'completed')))
      getKnowledgeByAgent.mockResolvedValue(indexed)
      await nextPoll()

      expect(movedOn()).toBe(0)
      expect(failure().text()).toContain('Not found.')
    })

    it('waits for the last source', async () => {
      getAgentQueueItems.mockResolvedValue(queue(row(2, 'pending', { source: other }), row(1, 'processing')))
      await mountStep(follow)

      getAgentQueueItems.mockResolvedValue(queue(row(2, 'pending', { source: other }), row(1, 'completed')))
      getKnowledgeByAgent.mockResolvedValue(indexed)
      await nextPoll()
      expect(movedOn()).toBe(0)

      getAgentQueueItems.mockResolvedValue(queue(row(2, 'completed', { source: other }), row(1, 'completed')))
      await nextPoll()
      expect(movedOn()).toBe(1)
    })

    it('stays when finishing left nothing learned', async () => {
      getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
      await mountStep(follow)

      getAgentQueueItems.mockResolvedValue(queue(row(1, 'completed')))
      await nextPoll()

      expect(movedOn()).toBe(0)
    })

    it('leaves an address they typed but have not sent', async () => {
      getOrganization.mockResolvedValue({ domain: null })
      getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
      await mountStep(follow)
      await wrapper.find('input[type="text"]').setValue('https://shop.pedalco.example.com')

      await finishReading()

      expect(movedOn()).toBe(0)
      expect((wrapper.find('input[type="text"]').element as HTMLInputElement).value).toBe('https://shop.pedalco.example.com')
    })

    it('leaves a source they staged', async () => {
      getOrganization.mockResolvedValue({ domain: null })
      getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
      await mountStep(follow)
      await wrapper.find('input[type="text"]').setValue('https://shop.pedalco.example.com')
      await wrapper.findAll('button').find((b) => b.text() === 'Add')!.trigger('click')
      await flushPromises()

      await finishReading()

      expect(movedOn()).toBe(0)
      expect(staged()).toEqual(['https://shop.pedalco.example.com'])
    })

    it('does nothing with no knowledge at all', async () => {
      await mountStep(follow)

      expect(movedOn()).toBe(0)
    })
  })

  it('stops polling when the step goes away mid-crawl', async () => {
    getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
    await mountStep()
    wrapper.unmount()
    const calls = getAgentQueueItems.mock.calls.length

    await nextPoll()

    expect(getAgentQueueItems).toHaveBeenCalledTimes(calls)
  })

  it('drops a late answer that arrives after the step went away', async () => {
    getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
    await mountStep()
    let answer!: (value: unknown) => void
    getAgentQueueItems.mockReturnValue(new Promise((resolve) => { answer = resolve }))
    await vi.advanceTimersByTimeAsync(LEARNING_POLL_MS)
    wrapper.unmount()
    const knowledgeCalls = getKnowledgeByAgent.mock.calls.length

    answer(queue(row(1, 'completed')))
    await flushPromises()

    expect(getKnowledgeByAgent).toHaveBeenCalledTimes(knowledgeCalls)
  })

  it('counts a site being read against the plan cap as before', async () => {
    getAgentQueueItems.mockResolvedValue(queue(row(1, 'processing')))
    await mountStep()

    expect((wrapper.vm as any).$.setupState.inUseCount).toBe(1)
  })
})
