/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { NAV_COUNTS_POLL_MS, useNavCounts } from '@/composables/useNavCounts'
import { chatService } from '@/services/chat'
import { ticketService } from '@/services/tickets'
import emitter from '@/utils/emitter'

const access = vi.hoisted(() => ({ paths: new Set(['/conversations', '/tickets']), embedded: false }))

vi.mock('@/router/routePermissions', () => ({
  canAccessPath: (path: string) => access.paths.has(path),
}))
vi.mock('@/utils/shopifyEmbed', () => ({ isEmbeddedShopify: () => access.embedded }))
vi.mock('@/services/chat', () => ({ chatService: { getInboxCounts: vi.fn() } }))
vi.mock('@/services/tickets', () => ({ ticketService: { getCounts: vi.fn() } }))

const refusal = (status: number) => Object.assign(new Error('refused'), { response: { status } })

const mounted: Array<{ unmount: () => void }> = []

const mountCounts = () => {
  let api!: ReturnType<typeof useNavCounts>
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useNavCounts()
        return () => null
      },
    }),
  )
  mounted.push(wrapper)
  return { wrapper, api }
}

const setHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('useNavCounts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    access.paths = new Set(['/conversations', '/tickets'])
    access.embedded = false
    vi.mocked(chatService.getInboxCounts).mockReset().mockResolvedValue({ open: 9, waiting_for_human: 3, assigned_to_me: 2 })
    vi.mocked(ticketService.getCounts).mockReset().mockResolvedValue({ open: 4 })
    setHidden(false)
  })

  afterEach(() => {
    // Each mount leaves a timer and a visibility listener behind until unmounted
    mounted.splice(0).forEach((wrapper) => {
      try {
        wrapper.unmount()
      } catch {
        /* the test unmounted it already */
      }
    })
    vi.useRealTimers()
  })

  it('fetches both counts on mount', async () => {
    const { api } = mountCounts()
    await flushPromises()

    expect(api.waitingForHuman.value).toBe(3)
    expect(api.openTickets.value).toBe(4)
  })

  it('refreshes on a timer and stops when unmounted', async () => {
    const { wrapper } = mountCounts()
    await flushPromises()
    expect(chatService.getInboxCounts).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(NAV_COUNTS_POLL_MS)
    expect(chatService.getInboxCounts).toHaveBeenCalledTimes(2)

    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(NAV_COUNTS_POLL_MS * 3)
    expect(chatService.getInboxCounts).toHaveBeenCalledTimes(2)
  })

  it('pauses while the tab is hidden and catches up when it returns', async () => {
    mountCounts()
    await flushPromises()

    setHidden(true)
    await vi.advanceTimersByTimeAsync(NAV_COUNTS_POLL_MS * 3)
    expect(chatService.getInboxCounts).toHaveBeenCalledTimes(1)

    setHidden(false)
    await flushPromises()
    expect(chatService.getInboxCounts).toHaveBeenCalledTimes(2)
  })

  it('asks for nothing the user may not open', async () => {
    access.paths = new Set()
    const { api } = mountCounts()
    await flushPromises()
    await vi.advanceTimersByTimeAsync(NAV_COUNTS_POLL_MS)

    expect(chatService.getInboxCounts).not.toHaveBeenCalled()
    expect(ticketService.getCounts).not.toHaveBeenCalled()
    expect(api.waitingForHuman.value).toBeNull()
  })

  it('asks for nothing inside the Shopify admin', async () => {
    access.embedded = true
    mountCounts()
    await flushPromises()

    expect(chatService.getInboxCounts).not.toHaveBeenCalled()
  })

  it('stops asking for tickets once the org turns out not to have them', async () => {
    vi.mocked(ticketService.getCounts).mockRejectedValue(refusal(403))
    const { api } = mountCounts()
    await flushPromises()
    await vi.advanceTimersByTimeAsync(NAV_COUNTS_POLL_MS * 2)

    expect(ticketService.getCounts).toHaveBeenCalledTimes(1)
    expect(api.openTickets.value).toBeNull()
    // The inbox count carries on regardless
    expect(chatService.getInboxCounts).toHaveBeenCalledTimes(3)
  })

  it('keeps the last count through a passing failure', async () => {
    const { api } = mountCounts()
    await flushPromises()

    vi.mocked(chatService.getInboxCounts).mockRejectedValueOnce(refusal(503))
    await vi.advanceTimersByTimeAsync(NAV_COUNTS_POLL_MS)
    expect(api.waitingForHuman.value).toBe(3)

    vi.mocked(chatService.getInboxCounts).mockResolvedValue({ open: 9, waiting_for_human: 5, assigned_to_me: 2 })
    await vi.advanceTimersByTimeAsync(NAV_COUNTS_POLL_MS)
    expect(api.waitingForHuman.value).toBe(5)
  })

  it('refetches at once when this agent changes a conversation, and stops listening when gone', async () => {
    const { wrapper, api } = mountCounts()
    await flushPromises()

    vi.mocked(chatService.getInboxCounts).mockResolvedValue({ open: 8, waiting_for_human: 2, assigned_to_me: 3 })
    emitter.emit('inbox-changed')
    await flushPromises()
    expect(api.waitingForHuman.value).toBe(2)

    wrapper.unmount()
    emitter.emit('inbox-changed')
    await flushPromises()
    expect(chatService.getInboxCounts).toHaveBeenCalledTimes(2)
  })
})
