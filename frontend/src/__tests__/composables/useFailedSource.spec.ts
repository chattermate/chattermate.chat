// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

const getOrgQueueItems = vi.fn()
const getKnowledgeByOrganization = vi.fn()

vi.mock('@/services/knowledge', () => ({
  knowledgeService: {
    getOrgQueueItems: (...a: unknown[]) => getOrgQueueItems(...a),
    getKnowledgeByOrganization: (...a: unknown[]) => getKnowledgeByOrganization(...a),
  },
}))
vi.mock('@/services/user', () => ({
  userService: { getCurrentUser: () => ({ organization_id: 'org-1' }) },
}))

const failed = { id: 3, source: 'https://rede.vc', source_type: 'website', status: 'failed', reason: 'Refused.' }
const processing = { ...failed, status: 'processing' }

const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

describe('useFailedSource', () => {
  let useFailedSource: typeof import('@/composables/useFailedSource').useFailedSource

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    localStorage.clear()
    useFailedSource = (await import('@/composables/useFailedSource')).useFailedSource
    getKnowledgeByOrganization.mockResolvedValue({ knowledge: [], pagination: { total: 0 } })
  })

  it('keeps the newest answer when an earlier request finishes last', async () => {
    const slow = deferred<{ queue_items: unknown[] }>()
    getOrgQueueItems.mockReturnValueOnce(slow.promise).mockResolvedValueOnce({ queue_items: [failed] })
    const { failure, refresh } = useFailedSource()

    const first = refresh() // sees the site still being read...
    await new Promise((r) => setTimeout(r, 0)) // (its queue request is now in flight)
    await refresh() // ...the second look sees it failed
    expect(failure.value?.id).toBe(3)

    slow.resolve({ queue_items: [processing] }) // the slow first answer arrives last
    await first

    expect(failure.value?.id).toBe(3)
  })

  it('hides a failure once dismissed, and the choice survives a reload', async () => {
    getOrgQueueItems.mockResolvedValue({ queue_items: [failed] })
    const first = useFailedSource()
    await first.refresh()
    first.dismiss()
    expect(first.failure.value).toBeNull()

    const reloaded = useFailedSource()
    await reloaded.refresh()
    expect(reloaded.failure.value).toBeNull()
  })
})
