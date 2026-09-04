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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useConversationToken } from '@/composables/useConversationToken'

/**
 * The widget's conversation token has to outlive the page it loads on. A visitor who
 * leaves the tab open past the token's TTL used to come back as a brand-new anonymous
 * customer; here the token is rotated before it lapses, and a token that is already
 * gone is handed to the host page rather than replaced behind the visitor's back.
 */
describe('useConversationToken', () => {
  const WIDGET_ID = 'w-1'

  /** A conversation token whose lifetime is `ttl`, `age` seconds old. */
  function makeToken(ttl: number, age = 0, extra: Record<string, unknown> = {}) {
    const now = Math.floor(Date.now() / 1000)
    const claims = { sub: 'cust-1', iat: now - age, exp: now - age + ttl, ...extra }
    return `header.${btoa(JSON.stringify(claims))}.signature`
  }

  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  function rotatedResponse(token: string) {
    return { ok: true, status: 200, json: () => Promise.resolve({ data: { token } }) }
  }

  it('adopts the token the backend rendered into the frame', () => {
    const initial = makeToken(3600)
    const { token, start, stop } = useConversationToken()

    start(WIDGET_ID, initial)

    expect(token.value).toBe(initial)
    expect(localStorage.getItem('ctid')).toBe(initial)
    stop()
  })

  it('falls back to the stored token, and ignores stringified nothings', () => {
    const stored = makeToken(3600)
    localStorage.setItem('ctid', stored)
    const { token, start, stop } = useConversationToken()

    start(WIDGET_ID, 'undefined')

    expect(token.value).toBe(stored)
    stop()
  })

  it('leaves a token with plenty of life alone', async () => {
    const { start, ensureFresh, stop } = useConversationToken()
    start(WIDGET_ID, makeToken(3600))

    await ensureFresh(WIDGET_ID)

    expect(fetchMock).not.toHaveBeenCalled()
    stop()
  })

  it('rotates a token that is near the end of its life', async () => {
    const rotated = makeToken(3600)
    fetchMock.mockResolvedValue(rotatedResponse(rotated))
    const onTokenChanged = vi.fn()
    const { token, start, ensureFresh, stop } = useConversationToken({ onTokenChanged })
    // 55 minutes into a one-hour token: past the refresh point.
    start(WIDGET_ID, makeToken(3600, 3300))

    await ensureFresh(WIDGET_ID)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toContain('/refresh-token')
    expect(token.value).toBe(rotated)
    // The host page stores the token too, so a later reload keeps the identity.
    expect(onTokenChanged).toHaveBeenCalledWith(rotated)
    expect(localStorage.getItem('ctid')).toBe(rotated)
    stop()
  })

  it('tells the host page when the identity is past rotating', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, json: () => Promise.resolve({}) })
    const onIdentityExpired = vi.fn()
    const { token, start, ensureFresh, stop } = useConversationToken({ onIdentityExpired })
    const expiring = makeToken(3600, 3599)
    start(WIDGET_ID, expiring)

    const ok = await ensureFresh(WIDGET_ID)

    expect(ok).toBe(false)
    expect(onIdentityExpired).toHaveBeenCalledTimes(1)
    // The dead token is kept rather than swapped: only the host can replace it.
    expect(token.value).toBe(expiring)
    stop()
  })

  it('keeps the current token when the network is down', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    const current = makeToken(3600, 3599)
    const { token, start, ensureFresh, stop } = useConversationToken()
    start(WIDGET_ID, current)

    expect(await ensureFresh(WIDGET_ID)).toBe(false)
    expect(token.value).toBe(current)
    stop()
  })

  it('rotates once when several callers ask at the same time', async () => {
    const rotated = makeToken(3600)
    fetchMock.mockResolvedValue(rotatedResponse(rotated))
    const { start, ensureFresh, stop } = useConversationToken()
    start(WIDGET_ID, makeToken(3600, 3500))

    await Promise.all([ensureFresh(WIDGET_ID), ensureFresh(WIDGET_ID), ensureFresh(WIDGET_ID)])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    stop()
  })

  it('does nothing without a token', async () => {
    const { start, ensureFresh, stop } = useConversationToken()
    start(WIDGET_ID, null)

    expect(await ensureFresh(WIDGET_ID)).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
    stop()
  })

  it('schedules a rotation before the token expires', async () => {
    vi.useFakeTimers()
    const rotated = makeToken(3600)
    fetchMock.mockResolvedValue(rotatedResponse(rotated))
    const { token, start, stop } = useConversationToken()
    start(WIDGET_ID, makeToken(600))

    // 80% of a ten-minute token: the visitor never has to touch anything. The clock
    // moves with the timers, or the tick would find the token nowhere near expiry.
    vi.setSystemTime(Date.now() + 8 * 60 * 1000)
    await vi.advanceTimersByTimeAsync(8 * 60 * 1000 + 100)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(token.value).toBe(rotated)
    stop()
  })

  it('stops the rotation timer when the widget goes away', async () => {
    vi.useFakeTimers()
    fetchMock.mockResolvedValue(rotatedResponse(makeToken(3600)))
    const { start, stop } = useConversationToken()
    start(WIDGET_ID, makeToken(600))

    stop()
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000)

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
