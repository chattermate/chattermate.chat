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
 * The widget's side of the frame handshake: wait for the host's HOST_INIT (when the
 * loader made this frame), then fetch the start-up data from /bootstrap.
 */
describe('frame-session', () => {
  const WIDGET_ID = 'w-1'
  const HOST = 'https://shop.example'
  const API = 'https://api.example.com/api/v1'
  const DATA = { widgetId: WIDGET_ID, agentName: 'Ava', initialToken: 'tok-new', customerId: '' }

  // jsdom keeps `parent` as an own property of window; put the original back after each test
  const realParent = Object.getOwnPropertyDescriptor(window, 'parent')

  let host: Window
  let hostPost: ReturnType<typeof vi.fn>
  let fetchMock: ReturnType<typeof vi.fn>

  const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

  function ok(body: unknown) {
    return { ok: true, status: 200, json: () => Promise.resolve(body) }
  }
  function refused(status: number, body: unknown) {
    return { ok: false, status, json: () => Promise.resolve(body) }
  }

  /** Load the module as the /frame page would, at `query`. */
  async function loadFrame({ query = '?host=1', framed = true, boot = { widgetId: WIDGET_ID } as unknown | null } = {}) {
    vi.resetModules()
    window.history.replaceState(null, '', `/api/v1/widgets/${WIDGET_ID}/frame${query}`)
    ;(window as any).__CM_FRAME__ = boot ?? undefined
    ;(window as any).APP_CONFIG = { API_URL: API, WS_URL: 'wss://api.example.com' }
    if (framed) Object.defineProperty(window, 'parent', { value: host, configurable: true })
    return import('@/webclient/frame-session')
  }

  /** The host page answers the frame's hello. */
  function hostSays(data: Record<string, unknown>, { origin = HOST, source = host as Window | null } = {}) {
    window.dispatchEvent(new MessageEvent('message', { data, origin, source }))
  }

  const sentToHost = () => hostPost.mock.calls.map(([message, target]) => [message, target])

  beforeEach(() => {
    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    host = iframe.contentWindow as Window
    hostPost = vi.fn()
    vi.spyOn(host, 'postMessage').mockImplementation(hostPost as any)
    fetchMock = vi.fn(() => Promise.resolve(ok(DATA)))
    vi.stubGlobal('fetch', fetchMock)
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    if (realParent) Object.defineProperty(window, 'parent', realParent)
    delete (window as any).__CM_FRAME__
    delete (window as any).__INITIAL_DATA__
    document.body.innerHTML = ''
  })

  it('does nothing on a /data page, where everything is baked in', async () => {
    const session = await loadFrame({ boot: null })

    expect(await session.startFramedWidget()).toBe(true)
    expect(session.isFramed()).toBe(false)
    expect(session.hostSharesIdentity()).toBe(true) // as it always has
    expect(fetchMock).not.toHaveBeenCalled()
  })

  describe('driven by the loader (?host=1)', () => {
    it('says hello, then waits for the host before fetching anything', async () => {
      const session = await loadFrame()
      const started = session.startFramedWidget()
      await flush()

      expect(sentToHost()).toEqual([[{ type: 'FRAME_READY' }, '*']])
      expect(fetchMock).not.toHaveBeenCalled()

      hostSays({ type: 'HOST_INIT', token: 'tok-1', pageUrl: `${HOST}/pricing` })
      expect(await started).toBe(true)
    })

    it('bootstraps as the host\'s visitor and records where it is embedded', async () => {
      const session = await loadFrame()
      const started = session.startFramedWidget()
      hostSays({ type: 'HOST_INIT', token: 'tok-1', pageUrl: `${HOST}/pricing` })
      await started

      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe(`${API}/widgets/${WIDGET_ID}/bootstrap`)
      expect((init as RequestInit).method).toBe('POST')
      expect((init as any).headers.Authorization).toBe('Bearer tok-1')
      expect(JSON.parse((init as any).body)).toEqual({ host_origin: HOST, source: null })
      expect((window as any).__INITIAL_DATA__).toEqual(DATA)
      expect(session.reportedPageUrl()).toBe(`${HOST}/pricing`)
      expect(session.isHosted()).toBe(true)
    })

    it('hands a newly issued token to the host, addressed to it', async () => {
      const session = await loadFrame()
      const started = session.startFramedWidget()
      hostSays({ type: 'HOST_INIT', token: null, pageUrl: HOST })
      await started

      expect(sentToHost()).toContainEqual([{ type: 'TOKEN_UPDATE', token: 'tok-new' }, HOST])
    })

    it('does not echo the token the host already has', async () => {
      fetchMock.mockResolvedValueOnce(ok({ ...DATA, initialToken: 'tok-1' }))
      const session = await loadFrame()
      const started = session.startFramedWidget()
      hostSays({ type: 'HOST_INIT', token: 'tok-1', pageUrl: HOST })
      await started

      expect(sentToHost().some(([m]) => (m as any).type === 'TOKEN_UPDATE')).toBe(false)
    })

    it('listens only to its own parent, and only to the first HOST_INIT', async () => {
      const stranger = document.createElement('iframe')
      document.body.appendChild(stranger)
      const session = await loadFrame()
      const started = session.startFramedWidget()

      hostSays({ type: 'HOST_INIT', token: 'tok-evil' }, { source: stranger.contentWindow })
      hostSays({ type: 'SOMETHING_ELSE' })
      hostSays({ type: 'HOST_INIT', token: 'tok-1', pageUrl: HOST })
      hostSays({ type: 'HOST_INIT', token: 'tok-2', pageUrl: HOST })
      await started

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect((fetchMock.mock.calls[0][1] as any).headers.Authorization).toBe('Bearer tok-1')
    })

    it('runs anonymously under an opaque host it cannot address', async () => {
      const session = await loadFrame()
      const started = session.startFramedWidget()
      hostSays({ type: 'HOST_INIT', token: 'tok-1', pageUrl: 'about:srcdoc' }, { origin: 'null' })
      await started

      const init = fetchMock.mock.calls[0][1] as any
      expect(init.headers.Authorization).toBeUndefined()
      expect(JSON.parse(init.body).host_origin).toBeNull()
    })

    it('answers an opaque host with *, the only address it has', async () => {
      Object.defineProperty(document, 'referrer', { value: 'https://real-site.example/page', configurable: true })
      const session = await loadFrame()
      const started = session.startFramedWidget()
      hostSays({ type: 'HOST_INIT', token: null, pageUrl: 'about:srcdoc' }, { origin: 'null' })
      await started
      session.announceReady()

      // Readiness and layout, yes; a token, never - any page could be that parent
      expect(sentToHost()).toContainEqual([{ type: 'WIDGET_READY' }, '*'])
      expect(sentToHost().some(([m]) => (m as any).type === 'TOKEN_UPDATE')).toBe(false)
      expect(session.hostSharesIdentity()).toBe(false)
      // @ts-expect-error restore jsdom's own referrer
      delete document.referrer
    })

    it.each([
      [refused(401, { detail: { code: 'identity_expired' } }), 'identity_expired'],
      [refused(401, { detail: { code: 'token_required' } }), 'token_required'],
      [refused(429, { detail: { code: 'rate_limited' } }), 'rate_limited'],
      [refused(500, { detail: 'boom' }), 'unavailable'],
      [{ ok: false, status: 502, json: () => Promise.reject(new Error('html')) }, 'unavailable'],
    ])('tells the host why it could not start (%#)', async (response, code) => {
      fetchMock.mockResolvedValueOnce(response)
      const session = await loadFrame()
      const started = session.startFramedWidget()
      hostSays({ type: 'HOST_INIT', token: 'tok-1', pageUrl: HOST })

      expect(await started).toBe(false)
      expect(sentToHost()).toContainEqual([{ type: 'WIDGET_ERROR', code }, HOST])
      expect((window as any).__INITIAL_DATA__).toBeUndefined()
    })

    it('reports a network failure as unavailable', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('offline'))
      const session = await loadFrame()
      const started = session.startFramedWidget()
      hostSays({ type: 'HOST_INIT', token: null, pageUrl: HOST })

      expect(await started).toBe(false)
      expect(sentToHost()).toContainEqual([{ type: 'WIDGET_ERROR', code: 'unavailable' }, HOST])
    })

    it('keeps the token in memory only: the host owns it', async () => {
      localStorage.setItem('ctid', 'tok-left-by-a-help-center')
      const session = await loadFrame()
      const started = session.startFramedWidget()
      hostSays({ type: 'HOST_INIT', token: null, pageUrl: HOST })
      await started

      const store = session.tokenStoreFor(WIDGET_ID)
      expect(store.read()).toBeNull()
      store.write('tok-x')
      expect(localStorage.getItem('ctid')).toBe('tok-left-by-a-help-center')
    })

    it('shares identity with the loader on an addressable page', async () => {
      const session = await loadFrame()
      const started = session.startFramedWidget()
      hostSays({ type: 'HOST_INIT', token: null, pageUrl: HOST })
      await started
      expect(session.hostSharesIdentity()).toBe(true)
    })

    it('announces it is ready once mounted', async () => {
      const session = await loadFrame()
      const started = session.startFramedWidget()
      hostSays({ type: 'HOST_INIT', token: null, pageUrl: HOST })
      await started

      session.announceReady()
      expect(sentToHost()).toContainEqual([{ type: 'WIDGET_READY' }, HOST])
    })

    it('follows the host page as it navigates', async () => {
      const session = await loadFrame()
      session.setHostPageUrl(`${HOST}/checkout`)
      session.setHostPageUrl(42)
      expect(session.reportedPageUrl()).toBe(`${HOST}/checkout`)
    })

    it('gives each message the page the loader last reported, with its title', async () => {
      const session = await loadFrame()
      session.setHostPageUrl(`${HOST}/products/blue-hoodie`, 'Blue Hoodie')
      expect(session.currentHostPage()).toEqual({ url: `${HOST}/products/blue-hoodie`, title: 'Blue Hoodie' })
    })
  })

  describe('the page the visitor is on, without a loader report', () => {
    it('reads a same-origin parent page', async () => {
      host.document.title = 'Blue Hoodie'
      const session = await loadFrame({ query: '' })
      expect(session.currentHostPage()).toEqual({ url: host.location.href, title: 'Blue Hoodie' })
    })

    it('falls back to the referrer under a cross-origin parent', async () => {
      const session = await loadFrame({ query: '' })
      Object.defineProperty(window, 'parent', {
        value: { get location() { throw new DOMException('cross-origin', 'SecurityError') } }, configurable: true,
      })
      vi.spyOn(document, 'referrer', 'get').mockReturnValue(`${HOST}/products/x`)
      expect(session.currentHostPage()).toEqual({ url: `${HOST}/products/x`, title: null })
    })

    it('has no page when nothing embeds the widget', async () => {
      const session = await loadFrame({ query: '', framed: false })
      vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://google.com/')
      expect(session.currentHostPage()).toBeNull()
    })
  })

  describe('embedded without the loader', () => {
    it('starts at once with its own stored visitor', async () => {
      localStorage.setItem(`ctid:${WIDGET_ID}`, 'tok-raw')
      const session = await loadFrame({ query: '' })

      expect(await session.startFramedWidget()).toBe(true)
      expect(hostPost).not.toHaveBeenCalled()
      expect((fetchMock.mock.calls[0][1] as any).headers.Authorization).toBe('Bearer tok-raw')
      expect(session.isHosted()).toBe(false)
    })

    it('shares no identity with whatever page embedded it', async () => {
      const session = await loadFrame({ query: '' })
      await session.startFramedWidget()
      expect(session.hostSharesIdentity()).toBe(false)
    })

    it('keeps its visitor per widget, apart from the shared ctid', async () => {
      const session = await loadFrame({ query: '' })
      await session.startFramedWidget()

      session.tokenStoreFor(WIDGET_ID).write('tok-raw')
      expect(localStorage.getItem(`ctid:${WIDGET_ID}`)).toBe('tok-raw')
      expect(localStorage.getItem('ctid')).toBeNull()
    })

    it('never announces itself to a page that did not ask', async () => {
      const session = await loadFrame({ query: '' })
      await session.startFramedWidget()
      session.announceReady()
      expect(hostPost).not.toHaveBeenCalled()
    })

    it('shows a plain message when it cannot start', async () => {
      document.body.innerHTML = '<div id="app"></div>'
      fetchMock.mockResolvedValueOnce(refused(401, { detail: { code: 'token_required' } }))
      const session = await loadFrame({ query: '' })

      expect(await session.startFramedWidget()).toBe(false)
      expect(document.getElementById('app')?.textContent).toBe('Chat is unavailable right now.')
    })

    it('treats ?host=1 at the top level as not hosted', async () => {
      const session = await loadFrame({ framed: false })
      expect(await session.startFramedWidget()).toBe(true)
      expect(session.isHosted()).toBe(false)
    })
  })
})
