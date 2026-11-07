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
import {
  BASE_URL, FRAME_ORIGIN, WIDGET_ID,
  api, bringUp, cleanupPage, flush, frame, frameWindow, frames, fromFrame, handshake,
  loadLoader, resetPage, spyOnFrame,
} from './loaderHarness'

/**
 * The loader's frame and lifecycle API. The widget runs on our own origin, in a frame
 * that takes the visitor's identity once, by handshake: so a single-page app that logs
 * in, logs out and unmounts swaps frames in place, and nothing secret is ever sent to a
 * frame before it has said who it is.
 */
describe('ChatterMate frame and lifecycle API', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    resetPage()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(cleanupPage)

  it('exposes identify, logout, reload and destroy', async () => {
    await loadLoader()
    for (const name of ['identify', 'logout', 'reload', 'destroy']) {
      expect(typeof api()[name]).toBe('function')
    }
  })

  describe('loading', () => {
    it('frames the widget page on our own origin, marked as loader-driven', async () => {
      await loadLoader()
      expect(frame().getAttribute('src')).toBe(`${BASE_URL}/widgets/${WIDGET_ID}/frame?host=1`)
      expect(frame().title).toBe('Chat')
      // '*': a bare feature name would only cover the URL's own origin, not the frame host it redirects to
      expect(frame().getAttribute('allow')).toBe('clipboard-write *')
    })

    it('never calls the API from the host page', async () => {
      await loadLoader()
      bringUp()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('answers the frame\'s hello with the visitor, addressed to the frame\'s origin', async () => {
      localStorage.setItem('ctid', 'tok-stored')
      await loadLoader()

      const init = handshake()

      expect(init?.targetOrigin).toBe(FRAME_ORIGIN)
      expect(init?.message).toEqual({ type: 'HOST_INIT', token: 'tok-stored', pageUrl: window.location.href })
    })

    it('loads anonymously when no token is stored', async () => {
      await loadLoader()
      expect(handshake()?.message.token).toBeNull()
    })

    it('prefers the token the page set over the stored one', async () => {
      localStorage.setItem('ctid', 'tok-stored')
      ;(window as any).chattermateToken = 'tok-page'
      await loadLoader()
      expect(handshake()?.message.token).toBe('tok-page')
    })

    it('sends nothing to the frame before it says hello', async () => {
      await loadLoader()
      const post = spyOnFrame()
      api().open()
      api().open({ message: 'hi' })
      api().identify('tok-1')
      // identify rebuilt the frame; check the one now on the page too
      const later = spyOnFrame()
      api().toggle()
      expect(post).not.toHaveBeenCalled()
      expect(later).not.toHaveBeenCalled()
    })

    it('follows the frame to wherever it was redirected', async () => {
      await loadLoader()
      const init = handshake({ origin: 'https://widget.example.com' })
      expect(init?.targetOrigin).toBe('https://widget.example.com')

      // …and from then on only that origin speaks for the frame
      const unread = vi.fn()
      api().on('unread', unread)
      fromFrame({ type: 'UNREAD_COUNT', count: 3 }, { origin: FRAME_ORIGIN })
      expect(unread).not.toHaveBeenCalled()
      fromFrame({ type: 'UNREAD_COUNT', count: 3 }, { origin: 'https://widget.example.com' })
      expect(unread).toHaveBeenCalledWith(3)
    })

    it('ignores a hello from an opaque origin', async () => {
      await loadLoader()
      expect(handshake({ origin: 'null' })).toBeNull()
    })

    it('answers again when the frame reloads itself, keeping the visitor', async () => {
      localStorage.setItem('ctid', 'tok-1')
      await loadLoader()
      handshake()
      expect(handshake()?.message.token).toBe('tok-1')
    })

    it('ignores messages from anything but the widget frame', async () => {
      await loadLoader()
      bringUp()
      const stranger = document.createElement('iframe')
      document.body.appendChild(stranger)

      fromFrame({ type: 'TOKEN_UPDATE', token: 'tok-evil' }, { source: stranger.contentWindow as Window })
      fromFrame({ type: 'TOKEN_UPDATE', token: 'tok-evil' }, { origin: 'https://evil.example' })

      expect(localStorage.getItem('ctid')).toBeNull()
    })
  })

  describe('readiness', () => {
    it('fires ready when the widget has mounted, not when the frame document loads', async () => {
      await loadLoader()
      const ready = vi.fn()
      api().on('ready', ready)

      frame().dispatchEvent(new Event('load'))
      handshake()
      expect(ready).not.toHaveBeenCalled()

      fromFrame({ type: 'WIDGET_READY' })
      expect(ready).toHaveBeenCalledTimes(1)
    })

    it('hands the mounted widget its display, visibility and any queued prefill', async () => {
      await loadLoader()
      api().open({ message: 'Where is my order?' })
      handshake()
      const post = spyOnFrame()

      fromFrame({ type: 'WIDGET_READY' })

      const sent = post.mock.calls.map(([message, target]) => [(message as any).type, target])
      expect(sent).toEqual(expect.arrayContaining([
        ['WIDGET_DISPLAY', FRAME_ORIGIN],
        ['WIDGET_VISIBILITY', FRAME_ORIGIN],
        ['PREFILL_MESSAGE', FRAME_ORIGIN],
      ]))
      expect(post.mock.calls.find(([m]) => (m as any).type === 'PREFILL_MESSAGE')?.[0])
        .toEqual({ type: 'PREFILL_MESSAGE', text: 'Where is my order?' })
    })

    it('drops the loading state once the widget is ready', async () => {
      await loadLoader()
      const button = document.getElementById('chattermate-button')!
      expect(button.classList.contains('loading')).toBe(true)
      bringUp()
      expect(button.classList.contains('loading')).toBe(false)
    })

    it('tells the frame the page it is on when the chat opens and on navigation', async () => {
      await loadLoader()
      bringUp()
      const post = spyOnFrame()

      api().open()
      window.dispatchEvent(new PopStateEvent('popstate'))
      window.dispatchEvent(new HashChangeEvent('hashchange'))

      const pages = post.mock.calls.filter(([m]) => (m as any).type === 'HOST_PAGE')
      expect(pages).toHaveLength(3)
      expect(pages[0]).toEqual([{ type: 'HOST_PAGE', url: window.location.href }, FRAME_ORIGIN])
    })

    it('tells the frame when a single-page app routes with pushState or replaceState, until destroyed', async () => {
      const start = window.location.href
      await loadLoader()
      bringUp()
      const post = spyOnFrame()
      const pages = () => post.mock.calls.filter(([m]) => (m as any).type === 'HOST_PAGE').map(([m]) => (m as any).url)

      window.history.pushState({}, '', '/app/invoices')
      window.history.replaceState({}, '', '/app/invoices/new')
      expect(pages()).toEqual([`${window.location.origin}/app/invoices`, `${window.location.origin}/app/invoices/new`])

      api().destroy()
      window.history.pushState({}, '', '/app/settings')
      expect(pages()).toHaveLength(2)
      window.history.replaceState({}, '', start)
    })
  })

  describe('before and after hello', () => {
    it('keeps talking to the frame after the page moves it', async () => {
      await loadLoader()
      const container = document.getElementById('chattermate-container')!
      const moved = document.createElement('div')
      document.body.appendChild(moved)
      moved.appendChild(container)

      expect(handshake()?.targetOrigin).toBe(FRAME_ORIGIN)
    })

    it('still answers hello on a page whose storage is blocked (sandboxed)', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError') })
      await loadLoader()
      expect(handshake()?.message.token).toBeNull()
      vi.restoreAllMocks()
    })

    it('closes a drawer on Escape pressed inside the frame', async () => {
      ;(window as any).chattermateConfig = { displayMode: 'sidebar-right' }
      await loadLoader()
      bringUp()
      api().open()

      fromFrame({ type: 'WIDGET_ESCAPE' })

      expect(api().isOpen()).toBe(false)
    })

    it('leaves a floating chat open on Escape inside the frame', async () => {
      await loadLoader()
      bringUp()
      api().open()

      fromFrame({ type: 'WIDGET_ESCAPE' })

      expect(api().isOpen()).toBe(true)
    })

    it('takes nothing but hello from the frame until it has said hello', async () => {
      await loadLoader()
      const unread = vi.fn()
      api().on('unread', unread)

      fromFrame({ type: 'TOKEN_UPDATE', token: 'tok-early' })
      fromFrame({ type: 'UNREAD_COUNT', count: 2 })

      expect(localStorage.getItem('ctid')).toBeNull()
      expect(unread).not.toHaveBeenCalled()
    })

    it('holds a prefill again while a reloaded frame mounts', async () => {
      await loadLoader()
      bringUp()
      handshake() // the frame reloaded itself
      const post = spyOnFrame()

      api().open({ message: 'Where is my order?' })
      expect(post.mock.calls.some(([m]) => (m as any).type === 'PREFILL_MESSAGE')).toBe(false)

      fromFrame({ type: 'WIDGET_READY' })
      expect(post).toHaveBeenCalledWith({ type: 'PREFILL_MESSAGE', text: 'Where is my order?' }, FRAME_ORIGIN)
    })

    it('hands focus to the frame when the chat opens, once it is mounted', async () => {
      await loadLoader()
      const focus = vi.spyOn(frame(), 'focus')
      api().open()
      api().close()
      expect(focus).not.toHaveBeenCalled()

      bringUp()
      api().open()
      expect(focus).toHaveBeenCalled()
    })

    it('hands focus to the frame with a prefill', async () => {
      await loadLoader()
      bringUp()
      const focus = vi.spyOn(frame(), 'focus')
      api().open({ message: 'hi' })
      expect(focus).toHaveBeenCalled()
    })
  })

  describe('a frame that cannot start', () => {
    it('shows where it was blocked when the frame loads but never says hello', async () => {
      vi.useFakeTimers()
      await loadLoader({ fakeTimers: true })
      frame().dispatchEvent(new Event('load'))

      await vi.advanceTimersByTimeAsync(3000)

      const card = document.querySelector('.chattermate-error-ui')
      expect(card?.textContent).toContain('If the widget is limited to certain domains, add this one in its settings; otherwise check the widget ID.')
      expect(frames()).toHaveLength(0)
    })

    it('waits as long as it takes for a frame that loaded and mounted', async () => {
      vi.useFakeTimers()
      await loadLoader({ fakeTimers: true })
      bringUp()
      frame().dispatchEvent(new Event('load'))

      await vi.advanceTimersByTimeAsync(60000)

      expect(document.querySelector('.chattermate-error-ui')).toBeNull()
      expect(frames()).toHaveLength(1)
    })

    it('gives up on a frame that never loads at all', async () => {
      vi.useFakeTimers()
      await loadLoader({ fakeTimers: true })
      await vi.advanceTimersByTimeAsync(19000)
      expect(document.querySelector('.chattermate-error-ui')).toBeNull()

      await vi.advanceTimersByTimeAsync(1000)
      expect(document.querySelector('.chattermate-error-ui')).not.toBeNull()
    })

    it('gives up on a frame that said hello but never mounted', async () => {
      vi.useFakeTimers()
      await loadLoader({ fakeTimers: true })
      handshake()

      await vi.advanceTimersByTimeAsync(19000)
      expect(document.querySelector('.chattermate-error-ui')).toBeNull()

      await vi.advanceTimersByTimeAsync(1000)
      expect(document.querySelector('.chattermate-error-ui')?.textContent).toContain('Chat is unavailable right now')
    })

    it('reveals the launcher so the card can be reached', async () => {
      vi.useFakeTimers()
      await loadLoader({ fakeTimers: true })
      await vi.advanceTimersByTimeAsync(20000)
      expect(document.getElementById('chattermate-button')?.classList.contains('chattermate-pending')).toBe(false)
    })
  })

  describe('identity', () => {
    it('identify() starts a new frame for the new visitor', async () => {
      await loadLoader()
      bringUp()
      const first = frame()

      api().identify('tok-1')
      await flush()

      expect(frames()).toHaveLength(1)
      expect(frame()).not.toBe(first)
      expect(localStorage.getItem('ctid')).toBe('tok-1')
      expect(handshake()?.message.token).toBe('tok-1')
    })

    it('identify() with the token already in use is a no-op', async () => {
      await loadLoader()
      api().identify('tok-1')
      await flush()
      const current = frame()

      api().identify('tok-1')
      await flush()

      expect(frame()).toBe(current)
    })

    it('identify() ignores an empty or non-string token', async () => {
      await loadLoader()
      const current = frame()
      api().identify('')
      api().identify('undefined')
      api().identify(null)
      await flush()

      expect(frame()).toBe(current)
      expect(localStorage.getItem('ctid')).toBeNull()
    })

    it('logout() clears the identity and starts anonymously', async () => {
      await loadLoader()
      api().identify('tok-1')
      await flush()

      api().logout()
      await flush()

      expect(localStorage.getItem('ctid')).toBeNull()
      expect((window as any).chattermateToken).toBeNull()
      expect(handshake()?.message.token).toBeNull()
    })

    it('closes an open widget when the identity changes', async () => {
      await loadLoader()
      api().open()
      expect(api().isOpen()).toBe(true)

      api().logout()
      await flush()

      expect(api().isOpen()).toBe(false)
    })

    it('stores a token the frame issued, and forgets one it dropped', async () => {
      await loadLoader()
      bringUp()

      fromFrame({ type: 'TOKEN_UPDATE', token: 'tok-frame' })
      expect(localStorage.getItem('ctid')).toBe('tok-frame')

      fromFrame({ type: 'TOKEN_CLEAR' })
      expect(localStorage.getItem('ctid')).toBeNull()
    })

    it('ignores a hello from a frame that was already replaced', async () => {
      await loadLoader()
      const old = frame()
      api().identify('tok-1')
      await flush()
      const oldPost = vi.spyOn(old.contentWindow as Window, 'postMessage')

      fromFrame({ type: 'FRAME_READY' }, { source: old.contentWindow as Window })

      expect(oldPost).not.toHaveBeenCalled()
    })
  })

  describe('reload and destroy', () => {
    it('reload() rebuilds the frame with the current token', async () => {
      localStorage.setItem('ctid', 'tok-1')
      await loadLoader()
      const first = frame()

      api().reload()
      await flush()

      expect(frames()).toHaveLength(1)
      expect(frame()).not.toBe(first)
      expect(handshake()?.message.token).toBe('tok-1')
    })

    it('keeps a single frame message listener across reloads', async () => {
      await loadLoader()
      api().reload()
      await flush()
      const post = spyOnFrame()

      fromFrame({ type: 'FRAME_READY' })

      // Registering the handler per load would answer the hello once per load.
      expect(post.mock.calls.filter(([m]) => (m as any).type === 'HOST_INIT')).toHaveLength(1)
    })

    it('destroy() leaves nothing of the widget on the page', async () => {
      await loadLoader()
      api().destroy()

      for (const id of ['chattermate-button', 'chattermate-container', 'chattermate-backdrop',
        'chattermate-mobile-close', 'chattermate-mobile-topbar', 'chattermate-styles']) {
        expect(document.getElementById(id)).toBeNull()
      }
      expect(frames()).toHaveLength(0)
    })

    it('ignores the destroyed frame and queues nothing after destroy()', async () => {
      await loadLoader()
      const destroyed = frameWindow()
      api().destroy()

      fromFrame({ type: 'TOKEN_UPDATE', token: 'tok-late' }, { source: destroyed })
      api().open()

      expect(localStorage.getItem('ctid')).toBeNull()
      expect(api().isOpen()).toBe(false)
      api().reload()
      await flush()
      expect(api().isOpen()).toBe(false)
    })

    it('reload() brings a destroyed widget back, launcher hidden until styled', async () => {
      await loadLoader()
      api().destroy()
      api().reload()
      await flush()

      const button = document.getElementById('chattermate-button')
      expect(button).not.toBeNull()
      expect(frames()).toHaveLength(1)
      expect(button?.classList.contains('chattermate-pending')).toBe(true)

      handshake()
      fromFrame({ type: 'CUSTOMIZATION_UPDATE', data: { chat_bubble_color: '#123456' } })
      expect(button?.classList.contains('chattermate-pending')).toBe(false)
    })

    it('identify() does not resurrect a destroyed widget', async () => {
      await loadLoader()
      api().destroy()
      api().identify('tok-1')
      await flush()

      expect(document.getElementById('chattermate-button')).toBeNull()
      // The identity is still recorded, so a later reload() runs as that visitor.
      expect(localStorage.getItem('ctid')).toBe('tok-1')
    })
  })
})
