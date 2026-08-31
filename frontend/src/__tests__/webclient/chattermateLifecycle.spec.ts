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
 * The loader's identity and lifecycle API. A single-page app logs in, logs out and
 * unmounts without ever reloading the page, so the widget has to swap identities —
 * and disappear entirely — in place. The token is baked into the document the
 * backend renders, which means a new identity is always a new frame fetched with a
 * new Authorization header.
 */
describe('ChatterMate identity and lifecycle API', () => {
  const WIDGET_ID = 'w-123'
  const BASE_URL = 'https://api.example.com/api/v1'

  let fetchMock: ReturnType<typeof vi.fn>

  // The widget document the backend would render; its contents don't matter here.
  const html = '<!DOCTYPE html><html><body>widget</body></html>'

  function okResponse() {
    return { ok: true, status: 200, text: () => Promise.resolve(html) }
  }

  // Let the loader's fetch().then() chain run to completion.
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

  async function loadLoader() {
    vi.resetModules()
    await import('@/webclient/chattermate.js')
    await flush()
  }

  function authHeaders(callIndex: number) {
    return (fetchMock.mock.calls[callIndex][1] as RequestInit).headers as Record<string, string>
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
    fetchMock = vi.fn(() => Promise.resolve(okResponse()))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    // @ts-expect-error cleanup loader globals
    delete window.ChatterMate
  })

  it('exposes identify, logout, reload and destroy', async () => {
    await loadLoader()
    const api = (window as any).ChatterMate
    expect(typeof api.identify).toBe('function')
    expect(typeof api.logout).toBe('function')
    expect(typeof api.reload).toBe('function')
    expect(typeof api.destroy).toBe('function')
  })

  it('loads anonymously when no token is stored', async () => {
    await loadLoader()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(authHeaders(0).Authorization).toBeUndefined()
  })

  it('identify() reloads the frame with the new token', async () => {
    await loadLoader()
    const first = document.querySelector('.chattermate-iframe')
    expect(first).not.toBeNull()

    ;(window as any).ChatterMate.identify('tok-1')
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(authHeaders(1).Authorization).toBe('Bearer tok-1')
    expect(localStorage.getItem('ctid')).toBe('tok-1')
    // The old frame — the previous visitor's conversation — is gone, not hidden.
    const frames = document.querySelectorAll('.chattermate-iframe')
    expect(frames).toHaveLength(1)
    expect(frames[0]).not.toBe(first)
  })

  it('identify() with the token already in use is a no-op', async () => {
    await loadLoader()
    ;(window as any).ChatterMate.identify('tok-1')
    await flush()
    ;(window as any).ChatterMate.identify('tok-1')
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('identify() ignores an empty or non-string token', async () => {
    await loadLoader()
    ;(window as any).ChatterMate.identify('')
    ;(window as any).ChatterMate.identify('undefined')
    ;(window as any).ChatterMate.identify(null)
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('ctid')).toBeNull()
  })

  it('logout() clears the identity and reloads anonymously', async () => {
    await loadLoader()
    ;(window as any).ChatterMate.identify('tok-1')
    await flush()

    ;(window as any).ChatterMate.logout()
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(authHeaders(2).Authorization).toBeUndefined()
    expect(localStorage.getItem('ctid')).toBeNull()
    expect((window as any).chattermateToken).toBeNull()
  })

  it('closes an open widget when the identity changes', async () => {
    await loadLoader()
    const api = (window as any).ChatterMate
    api.open()
    expect(api.isOpen()).toBe(true)

    api.logout()
    await flush()

    expect(api.isOpen()).toBe(false)
  })

  it('reload() rebuilds the frame with the current token', async () => {
    await loadLoader()
    ;(window as any).ChatterMate.reload()
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(document.querySelectorAll('.chattermate-iframe')).toHaveLength(1)
  })

  it('keeps a single frame message listener across reloads', async () => {
    await loadLoader()
    ;(window as any).ChatterMate.reload()
    await flush()

    const frame = document.querySelector('.chattermate-iframe') as HTMLIFrameElement
    const post = vi.spyOn(frame.contentWindow as Window, 'postMessage')
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'TOKEN_UPDATE', token: 'tok-frame' },
        source: frame.contentWindow,
      })
    )

    // Registering the handler per load would confirm the token once per load.
    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0][0]).toEqual({ type: 'TOKEN_RECEIVED', token: 'tok-frame' })
    expect(localStorage.getItem('ctid')).toBe('tok-frame')
  })

  it('destroy() leaves nothing of the widget on the page', async () => {
    await loadLoader()
    ;(window as any).ChatterMate.destroy()

    expect(document.getElementById('chattermate-button')).toBeNull()
    expect(document.getElementById('chattermate-container')).toBeNull()
    expect(document.getElementById('chattermate-backdrop')).toBeNull()
    expect(document.getElementById('chattermate-mobile-close')).toBeNull()
    expect(document.getElementById('chattermate-mobile-topbar')).toBeNull()
    expect(document.getElementById('chattermate-styles')).toBeNull()
    expect(document.querySelector('.chattermate-iframe')).toBeNull()
  })

  it('ignores the destroyed frame and queues nothing after destroy()', async () => {
    await loadLoader()
    const frame = document.querySelector('.chattermate-iframe') as HTMLIFrameElement
    const frameWindow = frame.contentWindow
    const api = (window as any).ChatterMate

    api.destroy()
    // The frame is gone, so its late messages must not reach the loader.
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'TOKEN_UPDATE', token: 'tok-late' },
        source: frameWindow,
      })
    )
    // Calls against a destroyed widget are dropped, not queued for a later rebuild.
    api.open()

    expect(localStorage.getItem('ctid')).toBeNull()
    expect(api.isOpen()).toBe(false)

    api.reload()
    await flush()
    expect(api.isOpen()).toBe(false)
  })

  it('reload() brings a destroyed widget back', async () => {
    await loadLoader()
    ;(window as any).ChatterMate.destroy()
    ;(window as any).ChatterMate.reload()
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const button = document.getElementById('chattermate-button')
    expect(button).not.toBeNull()
    expect(document.querySelectorAll('.chattermate-iframe')).toHaveLength(1)

    // The rebuilt launcher starts hidden and needs its own reveal — the reveal
    // state has to be reset by destroy(), or it stays invisible forever.
    expect(button?.classList.contains('chattermate-pending')).toBe(true)
    const frame = document.querySelector('.chattermate-iframe') as HTMLIFrameElement
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'CUSTOMIZATION_UPDATE', data: { chat_bubble_color: '#123456' } },
        source: frame.contentWindow,
      })
    )
    expect(button?.classList.contains('chattermate-pending')).toBe(false)
  })

  it('identify() does not resurrect a destroyed widget', async () => {
    await loadLoader()
    ;(window as any).ChatterMate.destroy()
    ;(window as any).ChatterMate.identify('tok-1')
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(document.getElementById('chattermate-button')).toBeNull()
    // The identity is still recorded, so a later reload() runs as that visitor.
    expect(localStorage.getItem('ctid')).toBe('tok-1')
  })

  it('drops a response that a later identity change superseded', async () => {
    let resolveSlow: (value: unknown) => void = () => {}
    fetchMock.mockImplementationOnce(() => new Promise((resolve) => { resolveSlow = resolve }))

    await loadLoader()
    expect(document.querySelector('.chattermate-iframe')).toBeNull()

    ;(window as any).ChatterMate.identify('tok-1')
    await flush()

    // The anonymous load finally lands — it must not overwrite the identified frame.
    resolveSlow(okResponse())
    await flush()

    const frames = document.querySelectorAll('.chattermate-iframe')
    expect(frames).toHaveLength(1)
    expect(authHeaders(1).Authorization).toBe('Bearer tok-1')
  })
})
