// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const getOrganization = vi.fn()
const getKnowledgeByAgent = vi.fn()
const getKnowledgeByOrganization = vi.fn()

vi.mock('@/services/organization', () => ({
  organizationService: { getOrganization: (id: string) => getOrganization(id) }
}))
vi.mock('@/services/knowledge', () => ({
  knowledgeService: {
    getKnowledgeByAgent: (...a: unknown[]) => getKnowledgeByAgent(...a),
    getKnowledgeByOrganization: (...a: unknown[]) => getKnowledgeByOrganization(...a),
    getAgentQueueItems: vi.fn().mockResolvedValue({ queue_items: [] })
  }
}))

import StepTeach from '@/components/aiagent/onboarding/steps/StepTeach.vue'

const empty = { knowledge: [], pagination: { total_pages: 0 } }

const mountStep = async () => {
  const wrapper = mount(StepTeach, {
    props: { agentId: 'agent-1', organizationId: 'org-1' },
    global: { plugins: [createPinia()] }
  })
  await flushPromises()
  return wrapper
}

const urlInput = (wrapper: any) =>
  wrapper.find('input[type="text"]').element as HTMLInputElement

describe('StepTeach - signup domain prefill', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getKnowledgeByAgent.mockResolvedValue(empty)
    getKnowledgeByOrganization.mockResolvedValue(empty)
  })

  it('stages the signup domain as a source, scheme added', async () => {
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'testypo.com' })

    const wrapper = await mountStep()

    // Visible as an added source, not parked in the input where it reads as a
    // placeholder the user must still press "Add" to accept.
    expect(wrapper.find('.source-list').text()).toContain('https://testypo.com')
    expect(urlInput(wrapper).value).toBe('')
  })

  it('lets the suggestion be removed', async () => {
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'testypo.com' })

    const wrapper = await mountStep()
    await wrapper.find('.source-remove').trigger('click')

    expect(wrapper.find('.source-list').exists()).toBe(false)
  })

  it('leaves a domain that already has a scheme alone', async () => {
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'https://example.com' })

    const wrapper = await mountStep()

    expect(wrapper.find('.source-list').text()).toContain('https://example.com')
  })

  it('does not re-add a domain that is already indexed, or nag about it', async () => {
    getKnowledgeByAgent.mockResolvedValue({
      knowledge: [{ id: 1, name: 'https://testypo.com' }],
      pagination: { total_pages: 1 }
    })
    getOrganization.mockResolvedValue({ id: 'org-1', domain: 'testypo.com' })

    const wrapper = await mountStep()

    expect(wrapper.find('.step-error').exists()).toBe(false)
    // Present once, as the already-indexed entry — not staged a second time.
    expect(wrapper.findAll('.source-row')).toHaveLength(1)
  })

  it('renders normally when the org lookup fails', async () => {
    getOrganization.mockRejectedValue(new Error('boom'))

    const wrapper = await mountStep()

    expect(urlInput(wrapper).value).toBe('')
    expect(wrapper.find('.source-list').exists()).toBe(false)
    expect(wrapper.text()).toContain('Teach it your business')
  })

  it('stages a typed URL on Continue without needing "Add"', async () => {
    getOrganization.mockResolvedValue({ id: 'org-1', domain: '' })

    const wrapper = await mountStep()
    await wrapper.find('input[type="text"]').setValue('docs.company.com')

    const cont = wrapper.findAll('button').find((b: any) => b.text().includes('Continue'))!
    await cont.trigger('click')
    await flushPromises()

    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('does not advance when the typed URL is invalid', async () => {
    getOrganization.mockResolvedValue({ id: 'org-1', domain: '' })

    const wrapper = await mountStep()
    await wrapper.find('input[type="text"]').setValue('not a url')

    const cont = wrapper.findAll('button').find((b: any) => b.text().includes('Continue'))!
    await cont.trigger('click')
    await flushPromises()

    expect(wrapper.emitted('next')).toBeFalsy()
    expect(wrapper.find('.step-error').text()).toContain('valid URL')
  })
})
