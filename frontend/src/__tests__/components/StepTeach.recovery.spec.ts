// @vitest-environment jsdom
// What the Teach step does after a website couldn't be read: every way out of
// the failure panel, and that it never outlives the attempt it describes.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const getOrganization = vi.fn()
const getKnowledgeByAgent = vi.fn()
const getKnowledgeByOrganization = vi.fn()
const getAgentQueueItems = vi.fn()
const addUrls = vi.fn()
const addText = vi.fn()
const uploadPdfFiles = vi.fn()
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
    uploadPdfFiles: (...a: unknown[]) => uploadPdfFiles(...a),
    getAgentQueueItems: (...a: unknown[]) => getAgentQueueItems(...a)
  }
}))
vi.mock('@/utils/storage', () => ({
  subscriptionStorage: { getPlanLimits: () => planLimits() }
}))

import StepTeach from '@/components/aiagent/onboarding/steps/StepTeach.vue'

const empty = { knowledge: [], pagination: { total_pages: 0 } }
const failed = (id: number, source: string, reason = 'This site could not be found.') => ({
  id, source, source_type: 'website', status: 'failed', created_at: '', error: 'raw', reason,
})
const firstSite = failed(7, 'https://erfanpv.com')

let wrapper: VueWrapper<any>

const mountStep = async () => {
  wrapper = mount(StepTeach, {
    props: { agentId: 'agent-1', organizationId: 'org-1' },
    global: { plugins: [createPinia()], stubs: { 'font-awesome-icon': true } },
    attachTo: document.body,
  })
  await flushPromises()
  return wrapper
}

const button = (label: string) => wrapper.findAll('button').find((b) => b.text() === label)
const primary = () => wrapper.find('.btn-accent')
const panel = () => wrapper.find('.crawl-failure')
const staged = () => wrapper.findAll('.source-list:not(.indexed) .source-name').map((n) => n.text())

const clickContinue = async () => {
  await primary().trigger('click')
  await flushPromises()
}

const typeAndAdd = async (url: string) => {
  await wrapper.find('input[type="text"]').setValue(url)
  await button('Add')!.trigger('click')
  await flushPromises()
}

const pickPdfs = async (...names: string[]) => {
  const input = wrapper.find('input[type="file"]')
  const picked = names.map((n) => new File(['%PDF'], n, { type: 'application/pdf' }))
  Object.defineProperty(input.element, 'files', { value: picked, configurable: true })
  await input.trigger('change')
  await flushPromises()
}

// Mount with the signup domain staged, Continue, and have it fail fast.
const failFirst = async () => {
  getAgentQueueItems.mockResolvedValueOnce({ queue_items: [] }).mockResolvedValue({ queue_items: [firstSite] })
  await mountStep()
  await clickContinue()
  expect(panel().exists()).toBe(true)
}

const openPaste = async () => {
  await button('Paste some text instead')!.trigger('click')
  await flushPromises()
}

describe('StepTeach - after a website could not be read', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getKnowledgeByAgent.mockResolvedValue(empty)
    getKnowledgeByOrganization.mockResolvedValue(empty)
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'erfanpv.com' })
    planLimits.mockReturnValue({ maxKnowledgeSources: 0 })
    addUrls.mockResolvedValue({ message: 'Queued' })
    uploadPdfFiles.mockResolvedValue({ message: 'Uploaded' })
  })

  afterEach(() => wrapper?.unmount())

  it('moves focus to the address box so another site can be tried', async () => {
    await failFirst()
    expect(document.activeElement).toBe(wrapper.find('input[type="text"]').element)
  })

  it('staging a new URL clears the panel and brings back Continue, which checks again', async () => {
    await failFirst()
    expect(primary().text()).toContain('Continue without it')

    await typeAndAdd('chattermate.chat')

    expect(panel().exists()).toBe(false)
    expect(primary().text()).toMatch(/^Continue\s*→$/)
    expect(staged()).toEqual(['https://chattermate.chat'])

    await clickContinue()
    expect(addUrls).toHaveBeenLastCalledWith('org-1', ['https://chattermate.chat'], 'agent-1', expect.any(Function))
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('a URL typed but not added yet already reads as Continue', async () => {
    await failFirst()
    await wrapper.find('input[type="text"]').setValue('chattermate.chat')
    expect(primary().text()).toMatch(/^Continue\s*→$/)

    await clickContinue()
    expect(addUrls).toHaveBeenLastCalledWith('org-1', ['https://chattermate.chat'], 'agent-1', expect.any(Function))
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('removing the new source leaves nothing to send, so it moves on without the site', async () => {
    await failFirst()
    await typeAndAdd('chattermate.chat')
    await wrapper.find('.source-remove').trigger('click')

    expect(staged()).toEqual([])
    expect(document.activeElement).toBe(wrapper.find('input[type="text"]').element)
    expect(primary().text()).toMatch(/^Continue\s*→$/)
    await clickContinue()
    expect(addUrls).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('a second failure replaces the first and starts from the choice again', async () => {
    await failFirst()
    await openPaste()
    expect(wrapper.find('textarea').exists()).toBe(true)
    // Leave the paste box open, then retry with another site that also fails.
    await typeAndAdd('erfanpv.in')
    getAgentQueueItems.mockResolvedValue({ queue_items: [failed(8, 'https://erfanpv.in', 'Nothing answered there.'), firstSite] })

    await clickContinue()

    expect(wrapper.emitted('next')).toBeFalsy()
    expect(panel().text()).toContain("We couldn't read https://erfanpv.in. Nothing answered there.")
    expect(panel().text()).not.toContain('erfanpv.com')
    expect(wrapper.find('textarea').exists()).toBe(false)
    expect(button('Paste some text instead')).toBeTruthy()
    expect(primary().text()).toContain('Continue without it')
  })

  it('a URL already staged says so and keeps the panel', async () => {
    await failFirst()
    await typeAndAdd('chattermate.chat')
    await typeAndAdd('chattermate.chat')
    expect(wrapper.find('[role="alert"]').text()).toContain('already been added')
    expect(staged()).toEqual(['https://chattermate.chat'])
  })

  it('a duplicate URL with nothing new staged keeps the failure on screen', async () => {
    getKnowledgeByOrganization.mockResolvedValue({ knowledge: [{ id: 1, name: 'https://docs.erfanpv.com' }], pagination: { total_pages: 1, total: 1 } })
    await failFirst()
    await typeAndAdd('docs.erfanpv.com')
    expect(wrapper.text()).toContain('already exists in your knowledge base')
    expect(panel().exists()).toBe(true)
    expect(primary().text()).toContain('Continue without it')
  })

  it('the plan cap message keeps the failure on screen when nothing could be staged', async () => {
    planLimits.mockReturnValue({ maxKnowledgeSources: 1 })
    getKnowledgeByOrganization.mockResolvedValue({ knowledge: [{ id: 1, name: 'https://elsewhere.com' }], pagination: { total_pages: 1, total: 1 } })
    getOrganization.mockResolvedValue({ id: 'org-1', domain: '' })
    getAgentQueueItems.mockResolvedValueOnce({ queue_items: [] }).mockResolvedValue({ queue_items: [firstSite] })
    await mountStep()
    await typeAndAdd('erfanpv.com')
    // The cap is used up, so nothing was staged and nothing was sent.
    expect(wrapper.find('[role="alert"]').text()).toContain('already in use')
    expect(panel().exists()).toBe(false)
  })

  it('picking a PDF from the panel clears it and Continue uploads it', async () => {
    await failFirst()
    await pickPdfs('menu.pdf')

    expect(panel().exists()).toBe(false)
    expect(staged()).toEqual(['menu.pdf'])
    expect(primary().text()).toMatch(/^Continue\s*→$/)
    await clickContinue()
    expect(uploadPdfFiles).toHaveBeenCalled()
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('continue without it moves on and sends nothing', async () => {
    await failFirst()
    await clickContinue()
    expect(addUrls).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('back on the step later, shows the failure again instead of re-staging the same site', async () => {
    getAgentQueueItems.mockResolvedValue({ queue_items: [firstSite] })
    await mountStep()

    expect(staged()).toEqual([])
    expect(panel().text()).toContain("We couldn't read https://erfanpv.com")
    expect(button('Paste some text instead')).toBeTruthy()
    expect(primary().text()).toContain('Continue without it')
  })

  it('back on the step with something already indexed, the old failure stays out of the way', async () => {
    getKnowledgeByAgent.mockResolvedValue({ knowledge: [{ id: 3, name: 'About us' }], pagination: { total_pages: 1 } })
    getAgentQueueItems.mockResolvedValue({ queue_items: [firstSite] })
    await mountStep()
    expect(panel().exists()).toBe(false)
  })
})

describe('StepTeach - paste text instead', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getKnowledgeByAgent.mockResolvedValue(empty)
    getKnowledgeByOrganization.mockResolvedValue(empty)
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'erfanpv.com' })
    planLimits.mockReturnValue({ maxKnowledgeSources: 0 })
    addUrls.mockResolvedValue({ message: 'Queued' })
  })

  afterEach(() => wrapper?.unmount())

  const longText = 'We sell handmade candles and ship across India within five days.'

  it('opens with the box focused', async () => {
    await failFirst()
    await openPaste()
    expect(document.activeElement).toBe(wrapper.find('textarea').element)
  })

  it('can be cancelled back to the choice, focus returned to it', async () => {
    await failFirst()
    await openPaste()
    await button('Cancel')!.trigger('click')
    await flushPromises()

    expect(wrapper.find('textarea').exists()).toBe(false)
    expect(panel().text()).toContain("We couldn't read")
    expect(document.activeElement).toBe(button('Paste some text instead')!.element)
    expect(primary().text()).toContain('Continue without it')
  })

  it('Esc cancels too', async () => {
    await failFirst()
    await openPaste()
    await wrapper.find('textarea').trigger('keydown', { key: 'Escape' })
    await flushPromises()
    expect(wrapper.find('textarea').exists()).toBe(false)
    expect(button('Paste some text instead')).toBeTruthy()
  })

  it('Esc cancels from the buttons as well, e.g. after a too-short attempt', async () => {
    await failFirst()
    await openPaste()
    await wrapper.find('textarea').setValue('Too short.')
    await button('Add this text')!.trigger('click')
    await button('Add this text')!.trigger('keydown', { key: 'Escape' })
    await flushPromises()
    expect(wrapper.find('textarea').exists()).toBe(false)
  })

  it('adds the text and moves on', async () => {
    addText.mockResolvedValue({ message: 'ok' })
    await failFirst()
    await openPaste()
    await wrapper.find('textarea').setValue(longText)
    await button('Add this text')!.trigger('click')
    await flushPromises()
    expect(addText).toHaveBeenCalledWith('org-1', expect.stringMatching(/^About us \(/), longText, 'agent-1')
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('says why when the text is too short, and sends nothing', async () => {
    await failFirst()
    await openPaste()
    await wrapper.find('textarea').setValue('We sell candles.')
    await button('Add this text')!.trigger('click')
    await flushPromises()

    expect(addText).not.toHaveBeenCalled()
    expect(wrapper.find('.text-fallback [role="alert"]').text()).toContain('Add a few sentences')
    // Typing more clears it.
    await wrapper.find('textarea').setValue(longText)
    expect(wrapper.find('.text-fallback [role="alert"]').exists()).toBe(false)
  })

  it('keeps the text and stays put when the server refuses it', async () => {
    addText.mockRejectedValue(new Error('A source with this title already exists'))
    await failFirst()
    await openPaste()
    await wrapper.find('textarea').setValue(longText)
    await button('Add this text')!.trigger('click')
    await flushPromises()

    expect(wrapper.emitted('next')).toBeFalsy()
    expect(wrapper.find('.text-fallback [role="alert"]').text()).toContain('already exists')
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe(longText)
  })

  it('holds the rest of the step still while the text is saving', async () => {
    let finish!: (v: unknown) => void
    addText.mockReturnValue(new Promise((resolve) => (finish = resolve)))
    await failFirst()
    await openPaste()
    await wrapper.find('textarea').setValue(longText)
    await button('Add this text')!.trigger('click')
    await flushPromises()

    expect(button('Adding…')!.attributes('disabled')).toBeDefined()
    expect(button('Cancel')!.attributes('disabled')).toBeDefined()
    expect(button('Back')!.attributes('disabled')).toBeDefined()
    expect(primary().attributes('disabled')).toBeDefined()

    finish({ message: 'ok' })
    await flushPromises()
    expect(wrapper.emitted('next')).toBeTruthy()
  })
})

describe('StepTeach - staged PDFs', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getKnowledgeByAgent.mockResolvedValue(empty)
    getKnowledgeByOrganization.mockResolvedValue(empty)
    getAgentQueueItems.mockResolvedValue({ queue_items: [] })
    getOrganization.mockResolvedValue({ id: 'org-1', domain: '' })
    planLimits.mockReturnValue({ maxKnowledgeSources: 0 })
  })

  afterEach(() => wrapper?.unmount())

  it('a second pick adds to the list, and the same PDF twice says so', async () => {
    await mountStep()
    await pickPdfs('menu.pdf')
    await pickPdfs('prices.pdf')
    expect(staged()).toEqual(['menu.pdf', 'prices.pdf'])

    await pickPdfs('menu.pdf')
    expect(staged()).toEqual(['menu.pdf', 'prices.pdf'])
    expect(wrapper.find('[role="alert"]').text()).toContain('already in the list')
  })

  it('removing a source clears an error about the batch', async () => {
    addUrls.mockResolvedValue({ error: 'Some URLs already exist in your knowledge base' })
    await mountStep()
    await typeAndAdd('acme.com')
    await clickContinue()
    expect(wrapper.text()).toContain('Some URLs already exist')

    await wrapper.find('button[aria-label="Remove https://acme.com"]').trigger('click')
    expect(wrapper.text()).not.toContain('Some URLs already exist')
  })

  it('a site that failed is still reported when a PDF in the same batch fails', async () => {
    getAgentQueueItems.mockResolvedValueOnce({ queue_items: [] }).mockResolvedValue({ queue_items: [firstSite] })
    uploadPdfFiles.mockRejectedValue(new Error('That PDF is too large.'))
    addUrls.mockResolvedValue({ message: 'Queued' })
    await mountStep()
    await typeAndAdd('https://erfanpv.com')
    await pickPdfs('menu.pdf')
    await clickContinue()

    expect(panel().exists()).toBe(true)
    expect(panel().text()).toContain("We couldn't read https://erfanpv.com.")
    expect(wrapper.text()).toContain('That PDF is too large.')
    expect(wrapper.emitted('next')).toBeFalsy()
  })

  it('a PDF that fails keeps the step even when the site is fine', async () => {
    const reading = { ...firstSite, status: 'pending', reason: null }
    getAgentQueueItems.mockResolvedValueOnce({ queue_items: [] }).mockResolvedValue({ queue_items: [reading] })
    uploadPdfFiles.mockRejectedValue(new Error('That PDF is too large.'))
    addUrls.mockResolvedValue({ message: 'Queued' })
    await mountStep()
    await typeAndAdd('https://erfanpv.com')
    await pickPdfs('menu.pdf')
    await clickContinue()

    expect(addUrls).toHaveBeenCalled() // the site went in
    expect(panel().exists()).toBe(false)
    expect(wrapper.text()).toContain('That PDF is too large.')
    expect(wrapper.emitted('next')).toBeFalsy()
  })
})
