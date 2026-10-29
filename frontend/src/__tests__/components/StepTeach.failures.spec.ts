// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const getOrganization = vi.fn()
const getKnowledgeByAgent = vi.fn()
const getKnowledgeByOrganization = vi.fn()
const getAgentQueueItems = vi.fn()
const addUrls = vi.fn()
const addText = vi.fn()
const planLimits = vi.fn()

vi.mock('@/services/organization', () => ({
  organizationService: { getOrganization: (id: string) => getOrganization(id) }
}))
vi.mock('@/services/knowledge', () => ({
  knowledgeService: {
    getKnowledgeByAgent: (...a: unknown[]) => getKnowledgeByAgent(...a),
    getKnowledgeByOrganization: (...a: unknown[]) => getKnowledgeByOrganization(...a),
    addUrls: (...a: unknown[]) => addUrls(...a),
    addText: (...a: unknown[]) => addText(...a),
    getAgentQueueItems: (...a: unknown[]) => getAgentQueueItems(...a)
  }
}))
vi.mock('@/utils/storage', () => ({
  subscriptionStorage: { getPlanLimits: () => planLimits() }
}))

import StepTeach from '@/components/aiagent/onboarding/steps/StepTeach.vue'

const empty = { knowledge: [], pagination: { total_pages: 0 } }

const mountStep = async () => {
  const wrapper = mount(StepTeach, {
    props: { agentId: 'agent-1', organizationId: 'org-1' },
    global: { plugins: [createPinia()], stubs: { 'font-awesome-icon': true } }
  })
  await flushPromises()
  return wrapper
}

const clickContinue = async (wrapper: any) => {
  const cont = wrapper.findAll('button').find((b: any) => b.text().includes('Continue'))!
  await cont.trigger('click')
  await flushPromises()
}

const typeAndAdd = async (wrapper: any, url: string) => {
  await wrapper.find('input[type="text"]').setValue(url)
  await wrapper.findAll('button').find((b: any) => b.text() === 'Add')!.trigger('click')
}

const staged = (wrapper: any) =>
  wrapper.findAll('.source-list:not(.indexed) .source-name').map((n: any) => n.text())

describe('StepTeach - only advances when the sources were accepted', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getKnowledgeByAgent.mockResolvedValue(empty)
    getKnowledgeByOrganization.mockResolvedValue(empty)
    getAgentQueueItems.mockResolvedValue({ queue_items: [] })
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'teeckbox.com' })
    planLimits.mockReturnValue({ maxKnowledgeSources: 0 })
  })

  it('stays on the step and shows the server reason when the add is refused', async () => {
    addUrls.mockRejectedValue(new Error('Cannot add URLs: Maximum number of knowledge sources (1) would be exceeded'))
    const wrapper = await mountStep()

    await clickContinue(wrapper)

    expect(wrapper.emitted('next')).toBeFalsy()
    expect(wrapper.find('.step-error').text()).toContain('Maximum number of knowledge sources')
    // The batch stays staged so the user can fix it.
    expect(staged(wrapper)).toEqual(['https://teeckbox.com'])
  })

  it('stays on the step when the URL already exists', async () => {
    addUrls.mockResolvedValue({ error: 'Some URLs already exist in your knowledge base', duplicate_urls: ['https://teeckbox.com'] })
    const wrapper = await mountStep()

    await clickContinue(wrapper)

    expect(wrapper.emitted('next')).toBeFalsy()
    expect(wrapper.find('.step-error').text()).toContain('already exist')
  })

  it('advances once the add is accepted', async () => {
    addUrls.mockResolvedValue({ message: 'Queued' })
    const wrapper = await mountStep()

    await clickContinue(wrapper)

    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('advances with nothing staged', async () => {
    getOrganization.mockResolvedValue({ id: 'org-1', domain: '' })
    const wrapper = await mountStep()

    await clickContinue(wrapper)

    expect(addUrls).not.toHaveBeenCalled()
    expect(wrapper.emitted('next')).toBeTruthy()
  })
})

describe('StepTeach - plan source cap', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getKnowledgeByAgent.mockResolvedValue(empty)
    getKnowledgeByOrganization.mockResolvedValue(empty)
    getAgentQueueItems.mockResolvedValue({ queue_items: [] })
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'teeckbox.com' })
    addUrls.mockResolvedValue({ message: 'Queued' })
  })

  it('on a one-source plan, a typed URL replaces the staged signup domain', async () => {
    planLimits.mockReturnValue({ maxKnowledgeSources: 1 })
    const wrapper = await mountStep()

    await typeAndAdd(wrapper, 'www.teeckbox.com')

    expect(staged(wrapper)).toEqual(['https://www.teeckbox.com'])
    expect(wrapper.find('.step-error').exists()).toBe(false)
    await clickContinue(wrapper)
    expect(addUrls.mock.calls[0][1]).toEqual(['https://www.teeckbox.com'])
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('says so when the cap is already used by a source on any agent', async () => {
    planLimits.mockReturnValue({ maxKnowledgeSources: 1 })
    getKnowledgeByOrganization.mockResolvedValue({
      knowledge: [{ id: 1, name: 'https://elsewhere.com' }],
      pagination: { total_pages: 1, total: 1 }
    })
    const wrapper = await mountStep()

    await typeAndAdd(wrapper, 'docs.teeckbox.com')

    expect(staged(wrapper)).toEqual([])
    expect(wrapper.find('.step-error').text()).toContain('already in use')
  })

  it('keeps every staged source when the plan has room', async () => {
    planLimits.mockReturnValue({ maxKnowledgeSources: 5 })
    const wrapper = await mountStep()

    await typeAndAdd(wrapper, 'docs.teeckbox.com')

    expect(staged(wrapper)).toEqual(['https://teeckbox.com', 'https://docs.teeckbox.com'])
  })
  it('counts a crawl that is still running against the cap', async () => {
    planLimits.mockReturnValue({ maxKnowledgeSources: 1 })
    getAgentQueueItems.mockResolvedValue({
      queue_items: [{ id: 9, source: 'https://docs.other.com', source_type: 'website', status: 'processing', created_at: '' }]
    })
    const wrapper = await mountStep()

    await typeAndAdd(wrapper, 'blog.teeckbox.com')

    expect(staged(wrapper)).toEqual([])
    expect(wrapper.find('.step-error').text()).toContain('already in use')
  })

  it('back from a later step, does not re-stage a domain that is still crawling', async () => {
    planLimits.mockReturnValue({ maxKnowledgeSources: 1 })
    getAgentQueueItems.mockResolvedValue({
      queue_items: [{ id: 9, source: 'https://teeckbox.com', source_type: 'website', status: 'pending', created_at: '' }]
    })
    const wrapper = await mountStep()

    expect(staged(wrapper)).toEqual([])
    await clickContinue(wrapper)
    expect(addUrls).not.toHaveBeenCalled()
    expect(wrapper.emitted('next')).toBeTruthy()
  })
})

describe('StepTeach - a website that fails fast', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getKnowledgeByAgent.mockResolvedValue(empty)
    getKnowledgeByOrganization.mockResolvedValue(empty)
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'erfanpv.com' })
    planLimits.mockReturnValue({ maxKnowledgeSources: 0 })
    addUrls.mockResolvedValue({ message: 'Queued' })
  })

  const failedItem = {
    id: 7, source: 'https://erfanpv.com', source_type: 'website', status: 'failed', created_at: '',
    error: 'raw', reason: 'This site could not be found. Check the address for typos.',
  }

  it('stays, explains, and offers to paste text instead', async () => {
    getAgentQueueItems.mockResolvedValueOnce({ queue_items: [] }).mockResolvedValue({ queue_items: [failedItem] })
    const wrapper = await mountStep()

    await clickContinue(wrapper)

    expect(wrapper.emitted('next')).toBeFalsy()
    expect(wrapper.find('.crawl-failure').text()).toContain("We couldn't read https://erfanpv.com. This site could not be found")
    expect(wrapper.find('.btn-accent').text()).toContain('Continue without it')

    await wrapper.findAll('button').find((b: any) => b.text().includes('Paste some text instead'))!.trigger('click')
    addText.mockResolvedValue({ message: 'ok' })
    await wrapper.find('textarea').setValue('We sell handmade candles and ship across India within five days.')
    await wrapper.findAll('button').find((b: any) => b.text() === 'Add this text')!.trigger('click')
    await flushPromises()

    expect(addText).toHaveBeenCalledWith('org-1', expect.stringMatching(/^About us \(/), expect.stringContaining('handmade candles'), 'agent-1')
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('offers a PDF upload too', async () => {
    getAgentQueueItems.mockResolvedValueOnce({ queue_items: [] }).mockResolvedValue({ queue_items: [failedItem] })
    const wrapper = await mountStep()
    await clickContinue(wrapper)
    const picker = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})

    await wrapper.find('.crawl-failure').findAll('button').find((b: any) => b.text() === 'Upload a PDF')!.trigger('click')

    expect(picker).toHaveBeenCalled()
    picker.mockRestore()
  })

  it('lets them continue without it', async () => {
    getAgentQueueItems.mockResolvedValueOnce({ queue_items: [] }).mockResolvedValue({ queue_items: [failedItem] })
    const wrapper = await mountStep()
    await clickContinue(wrapper)
    await clickContinue(wrapper)
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('locks the step while the sources are being sent', async () => {
    getAgentQueueItems.mockResolvedValue({ queue_items: [] })
    let accept!: (v: unknown) => void
    addUrls.mockReturnValue(new Promise((resolve) => (accept = resolve)))
    const wrapper = await mountStep()
    await clickContinue(wrapper)

    expect(wrapper.find('.btn-accent').text()).toContain('Reading your site')
    expect(wrapper.find('.btn-accent').attributes('disabled')).toBeDefined()
    for (const label of ['Add', 'Upload PDF', 'Back']) {
      expect(wrapper.findAll('button').find((b: any) => b.text() === label)!.attributes('disabled')).toBeDefined()
    }
    expect(wrapper.find('input[type="text"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.source-remove').attributes('disabled')).toBeDefined()
    expect(wrapper.emitted('next')).toBeFalsy()

    accept({ message: 'URLs queued for processing' })
    await flushPromises()
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('a crawl that is still running does not hold the step: Continue moves on at once', async () => {
    getAgentQueueItems.mockResolvedValueOnce({ queue_items: [] }).mockResolvedValue({
      queue_items: [{ id: 1, source: 'https://erfanpv.com', source_type: 'website', status: 'pending', created_at: '' }]
    })
    const wrapper = await mountStep()
    await clickContinue(wrapper)
    expect(wrapper.emitted('next')).toBeTruthy()
    expect(wrapper.find('.crawl-failure').exists()).toBe(false)
  })
})
