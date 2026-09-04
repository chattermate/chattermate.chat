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

/**
 * Keeping an identified visitor identified, from the embed loader's side.
 *
 * A signed-in visitor who starts a new chat must stay signed in, the host page has to
 * be told when a conversation is created, and re-authenticating the same visitor must
 * not cost them the chat they are in.
 */
describe('ChatterMate identity continuity', () => {
  const WIDGET_ID = 'w-123'
  const BASE_URL = 'https://api.example.com/api/v1'

  let fetchMock: ReturnType<typeof vi.fn>

  const html = '<!DOCTYPE html><html><body>widget</body></html>'
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

  /** A token for `subject`, shaped like the ones /generate-token issues. */
  function tokenFor(subject: string, nonce = '1') {
    return `header.${btoa(JSON.stringify({ sub: subject, nonce }))}.signature`
  }

  async function loadLoader() {
    vi.resetModules()
    await import('@/webclient/chattermate.js')
    await flush()
  }

  function frameWindow(): Window {
    const frame = document.querySelector('.chattermate-iframe') as HTMLIFrameElement
    return frame.contentWindow as Window
  }

  /** A message as the widget frame would post it. */
  function fromFrame(data: Record<string, unknown>) {
    window.dispatchEvent(new MessageEvent('message', { data, source: frameWindow() }))
  }

  beforeEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    localStorage.clear()
    // @ts-expect-error loader globals set by the embed snippet
    window.chattermateId = WIDGET_ID
    // @ts-expect-error loader globals set by the embed snippet
    window.chattermateBaseUrl = BASE_URL
    // @ts-expect-error a previous test's identity must not leak in
    window.chattermateToken = undefined
    // @ts-expect-error config from a previous test must not leak in
    window.chattermateConfig = undefined
    fetchMock = vi.fn(() => Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(html) }))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    // @ts-expect-error cleanup loader globals
    delete window.ChatterMate
  })

  it('reports a new conversation to the host page', async () => {
    await loadLoader()
    const created = vi.fn()
    ;(window as any).ChatterMate.on('chatCreated', created)

    fromFrame({ type: 'CHAT_SESSION', sessionId: 's-1', authenticated: true, created: true })

    expect(created).toHaveBeenCalledWith({ sessionId: 's-1', authenticated: true })
  })

  it('says when the new conversation is no longer the identified visitor', async () => {
    await loadLoader()
    const created = vi.fn()
    ;(window as any).ChatterMate.on('chatCreated', created)

    fromFrame({ type: 'CHAT_SESSION', sessionId: 's-2', authenticated: false, created: true })

    expect(created).toHaveBeenCalledWith({ sessionId: 's-2', authenticated: false })
  })

  it('stays quiet when the frame merely reconnects to the conversation in progress', async () => {
    await loadLoader()
    const created = vi.fn()
    ;(window as any).ChatterMate.on('chatCreated', created)

    fromFrame({ type: 'CHAT_SESSION', sessionId: 's-3', authenticated: true, created: false })

    expect(created).not.toHaveBeenCalled()
  })

  it('asks the host for a token when the identity expires, without rebuilding the frame', async () => {
    const replacement = tokenFor('cust-1', 'fresh')
    ;(window as any).chattermateConfig = { tokenProvider: () => Promise.resolve(replacement) }
    await loadLoader()
    const expired = vi.fn()
    ;(window as any).ChatterMate.on('identityExpired', expired)
    const post = vi.spyOn(frameWindow(), 'postMessage')
    const framesBefore = document.querySelector('.chattermate-iframe')

    fromFrame({ type: 'IDENTITY_EXPIRED' })
    await flush()

    expect(expired).toHaveBeenCalled()
    expect(post).toHaveBeenCalledWith({ type: 'TOKEN_REFRESH', token: replacement }, '*')
    expect(localStorage.getItem('ctid')).toBe(replacement)
    // The visitor is looking at a conversation; fixing the token must not take it away.
    expect(document.querySelector('.chattermate-iframe')).toBe(framesBefore)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('lets the frame carry on anonymously when the host has no tokenProvider', async () => {
    await loadLoader()
    const expired = vi.fn()
    ;(window as any).ChatterMate.on('identityExpired', expired)
    const post = vi.spyOn(frameWindow(), 'postMessage')

    fromFrame({ type: 'IDENTITY_EXPIRED' })
    await flush()

    expect(expired).toHaveBeenCalled()
    // Nothing can replace the identity, so the widget must not sit there stuck.
    expect(post).toHaveBeenCalledWith({ type: 'IDENTITY_UNAVAILABLE' }, '*')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('survives a tokenProvider that throws', async () => {
    ;(window as any).chattermateConfig = {
      tokenProvider: () => Promise.reject(new Error('no session')),
    }
    await loadLoader()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const post = vi.spyOn(frameWindow(), 'postMessage')

    fromFrame({ type: 'IDENTITY_EXPIRED' })
    await flush()

    expect(document.querySelector('.chattermate-iframe')).not.toBeNull()
    expect(post).toHaveBeenCalledWith({ type: 'IDENTITY_UNAVAILABLE' }, '*')
  })

  it('asks the host only once per load, so a bad token cannot loop', async () => {
    const stale = tokenFor('cust-1', 'stale')
    const provider = vi.fn().mockResolvedValue(stale)
    ;(window as any).chattermateConfig = { tokenProvider: provider }
    await loadLoader()

    fromFrame({ type: 'IDENTITY_EXPIRED' })
    await flush()
    fromFrame({ type: 'IDENTITY_EXPIRED' })
    await flush()

    expect(provider).toHaveBeenCalledTimes(1)
  })

  it('swaps a fresher token for the same visitor in place', async () => {
    const first = tokenFor('cust-1', 'a')
    ;(window as any).chattermateToken = first
    await loadLoader()
    const post = vi.spyOn(frameWindow(), 'postMessage')
    const frameBefore = document.querySelector('.chattermate-iframe')
    const rotated = tokenFor('cust-1', 'b')

    ;(window as any).ChatterMate.identify(rotated)
    await flush()

    expect(post).toHaveBeenCalledWith({ type: 'TOKEN_REFRESH', token: rotated }, '*')
    // Same person, so the conversation stays: no second document fetch, same frame.
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(document.querySelector('.chattermate-iframe')).toBe(frameBefore)
    expect(localStorage.getItem('ctid')).toBe(rotated)
  })

  it('still rebuilds the frame for a different visitor', async () => {
    ;(window as any).chattermateToken = tokenFor('cust-1')
    await loadLoader()
    const frameBefore = document.querySelector('.chattermate-iframe')

    ;(window as any).ChatterMate.identify(tokenFor('cust-2'))
    await flush()

    expect(document.querySelector('.chattermate-iframe')).not.toBe(frameBefore)
  })

  it('closes the conversation it leaves behind on logout', async () => {
    const token = tokenFor('cust-1')
    ;(window as any).chattermateToken = token
    await loadLoader()
    fromFrame({ type: 'CHAT_SESSION', sessionId: 's-9', authenticated: true, created: true })

    ;(window as any).ChatterMate.logout()
    await flush()

    const endChatCall = fetchMock.mock.calls.find((call) => String(call[0]).includes('/end-chat'))
    expect(endChatCall).toBeDefined()
    expect(String(endChatCall![0])).toContain('session_id=s-9')
    // Closed as the visitor who owned it, not as the anonymous one replacing them.
    expect((endChatCall![1] as RequestInit).headers).toEqual({ Authorization: `Bearer ${token}` })
  })

  it('does not try to close a conversation it never had', async () => {
    ;(window as any).chattermateToken = tokenFor('cust-1')
    await loadLoader()

    ;(window as any).ChatterMate.logout()
    await flush()

    expect(fetchMock.mock.calls.some((call) => String(call[0]).includes('/end-chat'))).toBe(false)
  })
})
