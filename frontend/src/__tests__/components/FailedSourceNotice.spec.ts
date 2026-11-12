// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'

const getOrgQueueItems = vi.fn()
const getKnowledgeByOrganization = vi.fn()
const push = vi.fn()
const canManageKnowledge = vi.fn()
const route = reactive({ fullPath: '/' })

vi.mock('@/services/knowledge', () => ({
  knowledgeService: {
    getOrgQueueItems: (...a: unknown[]) => getOrgQueueItems(...a),
    getKnowledgeByOrganization: (...a: unknown[]) => getKnowledgeByOrganization(...a),
  },
}))
vi.mock('@/services/user', () => ({
  userService: { getCurrentUser: () => ({ organization_id: 'org-1' }) },
}))
vi.mock('@/utils/permissions', () => ({
  permissionChecks: { canManageKnowledge: () => canManageKnowledge() },
}))
vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}))

import FailedSourceNotice from '@/components/knowledge/FailedSourceNotice.vue'

const failed = (over: Record<string, unknown> = {}) => ({
  id: 7,
  source: 'https://rede.vc',
  source_type: 'website',
  status: 'failed',
  reason: 'The site refused the connection.',
  created_at: '2026-11-11T13:21:07Z',
  ...over,
})
const none = { knowledge: [], pagination: { total: 0 } }

const mountNotice = async () => {
  const wrapper = mount(FailedSourceNotice, { global: { stubs: { 'font-awesome-icon': true } } })
  await flushPromises()
  return wrapper
}

describe('FailedSourceNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    route.fullPath = '/'
    canManageKnowledge.mockReturnValue(true)
    getKnowledgeByOrganization.mockResolvedValue(none)
    getOrgQueueItems.mockResolvedValue({ queue_items: [failed()] })
  })

  it('names the site and why it could not be read, when nothing has been learned', async () => {
    const wrapper = await mountNotice()

    expect(wrapper.text()).toContain("We couldn't read https://rede.vc")
    expect(wrapper.text()).toContain('The site refused the connection.')
    expect(wrapper.text()).toContain('answers will be generic')
  })

  it('takes them to the knowledge page to paste text or upload a PDF', async () => {
    const wrapper = await mountNotice()

    await wrapper.find('.failed-cta').trigger('click')

    expect(push).toHaveBeenCalledWith({ name: 'knowledge' })
  })

  it('stays quiet once something is indexed', async () => {
    getKnowledgeByOrganization.mockResolvedValue({ knowledge: [{ id: 1 }], pagination: { total: 1 } })

    expect((await mountNotice()).find('.failed-source').exists()).toBe(false)
  })

  it('stays quiet while another source is still being read', async () => {
    getOrgQueueItems.mockResolvedValue({
      queue_items: [failed(), failed({ id: 8, source: 'https://rede.vc/docs', status: 'processing' })],
    })

    expect((await mountNotice()).find('.failed-source').exists()).toBe(false)
  })

  it('judges a retried site by its newest attempt, not the old failure', async () => {
    getOrgQueueItems.mockResolvedValue({
      queue_items: [failed({ id: 9, status: 'pending' }), failed()],
    })

    expect((await mountNotice()).find('.failed-source').exists()).toBe(false)
  })

  it('ignores a failed PDF: the wizard reports those itself', async () => {
    getOrgQueueItems.mockResolvedValue({ queue_items: [failed({ source_type: 'pdf', source: 'guide.pdf' })] })

    expect((await mountNotice()).find('.failed-source').exists()).toBe(false)
  })

  it('does not ask at all for someone who cannot manage knowledge', async () => {
    canManageKnowledge.mockReturnValue(false)

    const wrapper = await mountNotice()

    expect(getOrgQueueItems).not.toHaveBeenCalled()
    expect(wrapper.find('.failed-source').exists()).toBe(false)
  })

  it('says nothing when the check itself fails', async () => {
    getOrgQueueItems.mockRejectedValue(new Error('Network Error'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect((await mountNotice()).find('.failed-source').exists()).toBe(false)
  })

  it('stays dismissed for that failure, and returns for a new one', async () => {
    const wrapper = await mountNotice()
    await wrapper.find('.failed-dismiss').trigger('click')
    expect(wrapper.find('.failed-source').exists()).toBe(false)

    const again = await mountNotice()
    expect(again.find('.failed-source').exists()).toBe(false)

    getOrgQueueItems.mockResolvedValue({ queue_items: [failed({ id: 12, source: 'https://other.example' })] })
    const fresh = await mountNotice()
    expect(fresh.text()).toContain('https://other.example')
  })

  it('looks again on the next page, so a crawl that fails later is reported', async () => {
    getOrgQueueItems.mockResolvedValue({ queue_items: [failed({ status: 'processing' })] })
    const wrapper = await mountNotice()
    expect(wrapper.find('.failed-source').exists()).toBe(false)

    getOrgQueueItems.mockResolvedValue({ queue_items: [failed()] })
    route.fullPath = '/conversations'
    await nextTick()
    await flushPromises()

    expect(wrapper.find('.failed-source').exists()).toBe(true)
  })
})
