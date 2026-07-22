// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const getOrganization = vi.fn()

vi.mock('@/services/organization', () => ({
  organizationService: { getOrganization: (id: string) => getOrganization(id) }
}))
vi.mock('@/services/knowledge', () => ({
  knowledgeService: {
    getKnowledgeByAgent: vi.fn().mockResolvedValue({ knowledge: [], pagination: { total_pages: 0 } }),
    getKnowledgeByOrganization: vi
      .fn()
      .mockResolvedValue({ knowledge: [], pagination: { total_pages: 0 } }),
    getAgentQueueItems: vi.fn().mockResolvedValue({ queue_items: [] })
  }
}))

import StepTeach from '@/components/aiagent/onboarding/steps/StepTeach.vue'

const mountStep = () =>
  mount(StepTeach, {
    props: { agentId: 'agent-1', organizationId: 'org-1' },
    global: { plugins: [createPinia()] }
  })

describe('StepTeach - signup domain prefill', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('prefills the URL field with the signup domain, scheme added', async () => {
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'paywithatoa.co.uk' })

    const wrapper = mountStep()
    await flushPromises()

    expect(getOrganization).toHaveBeenCalledWith('org-1')
    expect((wrapper.find('input[type="text"]').element as HTMLInputElement).value).toBe(
      'https://paywithatoa.co.uk'
    )
  })

  it('leaves a domain that already has a scheme alone', async () => {
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'https://example.com' })

    const wrapper = mountStep()
    await flushPromises()

    expect((wrapper.find('input[type="text"]').element as HTMLInputElement).value).toBe(
      'https://example.com'
    )
  })

  it('renders normally when the org lookup fails', async () => {
    getOrganization.mockRejectedValue(new Error('boom'))

    const wrapper = mountStep()
    await flushPromises()

    expect((wrapper.find('input[type="text"]').element as HTMLInputElement).value).toBe('')
    expect(wrapper.text()).toContain('Teach it your business')
  })

  it('stages the prefilled URL on Continue without needing "+ Website"', async () => {
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'paywithatoa.co.uk' })

    const wrapper = mountStep()
    await flushPromises()

    const buttons = wrapper.findAll('button')
    const cont = buttons.find((b) => b.text().includes('Continue'))!
    await cont.trigger('click')
    await flushPromises()

    // It must not be silently dropped just because the user never pressed the
    // "+ Website" button — the URL was sitting in the box, visibly accepted.
    expect(wrapper.emitted('next')).toBeTruthy()
  })
})
