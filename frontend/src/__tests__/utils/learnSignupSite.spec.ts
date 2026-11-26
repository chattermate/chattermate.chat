import { describe, it, expect, vi, beforeEach } from 'vitest'

const getOrganization = vi.fn()
const addUrls = vi.fn()
vi.mock('@/services/organization', () => ({
  organizationService: { getOrganization: (id: string) => getOrganization(id) }
}))
vi.mock('@/services/knowledge', () => ({
  knowledgeService: { addUrls: (...a: unknown[]) => addUrls(...a) }
}))

import { learnSignupSite, SIGNUP_SITE_TIMEOUT_MS } from '@/utils/learnSignupSite'

describe('learnSignupSite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    addUrls.mockResolvedValue({ message: 'Queued' })
  })

  it.each([
    ['acme.com', 'https://acme.com'],
    ['http://acme.com', 'https://acme.com'],
    ['https://docs.acme.com/help', 'https://docs.acme.com/help'],
  ])('sends %s as %s for the agent', async (domain, url) => {
    getOrganization.mockResolvedValue({ domain })
    await learnSignupSite('org-1', 'agent-1')
    expect(addUrls).toHaveBeenCalledWith('org-1', [url], 'agent-1')
  })

  it.each(['', 'localhost', 'not a website', null])('sends nothing for %s', async (domain) => {
    getOrganization.mockResolvedValue({ domain })
    await learnSignupSite('org-1', 'agent-1')
    expect(addUrls).not.toHaveBeenCalled()
  })

  it('never throws: a full plan or a failed lookup is left to the Teach step', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getOrganization.mockResolvedValue({ domain: 'acme.com' })
    addUrls.mockRejectedValue(new Error('403'))
    await expect(learnSignupSite('org-1', 'agent-1')).resolves.toBe(false)
    getOrganization.mockRejectedValue(new Error('boom'))
    await expect(learnSignupSite('org-1', 'agent-1')).resolves.toBe(false)
  })

  it('says whether the server took it', async () => {
    getOrganization.mockResolvedValue({ domain: 'acme.com' })
    await expect(learnSignupSite('org-1', 'agent-1')).resolves.toBe(true)
    addUrls.mockResolvedValue({ error: 'Some URLs already exist' })
    await expect(learnSignupSite('org-1', 'agent-1')).resolves.toBe(false)
  })

  it('gives up on a request that never answers', async () => {
    vi.useFakeTimers()
    getOrganization.mockReturnValue(new Promise(() => {}))
    const sent = learnSignupSite('org-1', 'agent-1')
    await vi.advanceTimersByTimeAsync(SIGNUP_SITE_TIMEOUT_MS)
    await expect(sent).resolves.toBe(false)
    vi.useRealTimers()
  })
})
