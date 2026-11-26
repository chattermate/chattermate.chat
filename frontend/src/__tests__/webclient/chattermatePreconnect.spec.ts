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
import { WIDGET_ID, api, cleanupPage, frame, handshake, loadLoader, resetPage } from './loaderHarness'
import {
  FRAME_ORIGIN_PREFIX,
  createFrameOriginCache,
  preconnect,
  webOrigin,
} from '@/webclient/loader/preconnect.js'

// The loader opens the connections the widget frame needs before the frame asks:
// the API host on every visit, and the frame host the last frame came from.

const KEY = FRAME_ORIGIN_PREFIX + WIDGET_ID
const API_ORIGIN = 'https://api.example.com'
const FRAME_HOST = 'https://widget.example.com'

const hints = () =>
  Array.from(document.head.querySelectorAll('link[rel="preconnect"]')).map((link) => ({
    href: link.getAttribute('href'),
    crossorigin: link.hasAttribute('crossorigin'),
  }))
const hrefs = () => hints().map((hint) => hint.href)

describe('preconnect helpers', () => {
  beforeEach(() => resetPage())

  it('webOrigin keeps only http(s) origins', () => {
    expect(webOrigin('https://api.example.com/api/v1')).toBe(API_ORIGIN)
    expect(webOrigin('/api/v1', 'https://shop.example/page')).toBe('https://shop.example')
    expect(webOrigin('javascript:alert(1)')).toBeNull()
    expect(webOrigin('data:text/html,hi')).toBeNull()
    expect(webOrigin('not a url')).toBeNull()
  })

  it('the cache keeps an exact origin per widget', () => {
    const cache = createFrameOriginCache(localStorage, WIDGET_ID)
    cache.save(FRAME_HOST)
    expect(localStorage.getItem(KEY)).toBe(FRAME_HOST)
    expect(cache.read()).toBe(FRAME_HOST)
    expect(createFrameOriginCache(localStorage, 'other').read()).toBeNull()
  })

  it.each([
    'https://widget.example.com/path',
    'https://user:pw@widget.example.com',
    'javascript:alert(1)',
    'null',
    '',
  ])('the cache ignores %j', (value) => {
    const cache = createFrameOriginCache(localStorage, WIDGET_ID)
    cache.save(value)
    expect(localStorage.getItem(KEY)).toBeNull()
    localStorage.setItem(KEY, value)
    expect(cache.read()).toBeNull()
  })

  it('the cache survives storage that throws', () => {
    const broken = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
    } as unknown as Storage
    const cache = createFrameOriginCache(broken, WIDGET_ID)
    expect(() => cache.save(FRAME_HOST)).not.toThrow()
    expect(cache.read()).toBeNull()
    expect(createFrameOriginCache(null, WIDGET_ID).read()).toBeNull()
  })

  it('adds one hint per origin', () => {
    preconnect(document, FRAME_HOST)
    preconnect(document, FRAME_HOST)
    expect(hrefs()).toEqual([FRAME_HOST])
  })
})

describe('loader warm-up', () => {
  beforeEach(() => {
    resetPage()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    api()?.destroy()
    cleanupPage()
  })

  it('first visit: preconnects to the API host only', async () => {
    await loadLoader()
    // Credentialed, like the frame's own requests, so the connection can be reused
    expect(hints()).toEqual([{ href: API_ORIGIN, crossorigin: false }])
  })

  it('remembers the frame host from its handshake', async () => {
    await loadLoader()
    handshake({ origin: FRAME_HOST })
    expect(localStorage.getItem(KEY)).toBe(FRAME_HOST)
  })

  it('returning visit: also preconnects to the remembered frame host', async () => {
    localStorage.setItem(KEY, FRAME_HOST)
    await loadLoader()
    expect(hrefs()).toEqual([API_ORIGIN, FRAME_HOST])
  })

  it('never uses the remembered host as the frame address', async () => {
    localStorage.setItem(KEY, 'https://evil.example')
    await loadLoader()
    expect(new URL(frame().src).origin).toBe(API_ORIGIN)
    expect(hrefs()).toContain('https://evil.example')
  })

  it('ignores a stored value that is not an origin', async () => {
    localStorage.setItem(KEY, 'javascript:alert(1)')
    await loadLoader()
    expect(hrefs()).toEqual([API_ORIGIN])
  })

  it('a frame on the API host needs no second hint', async () => {
    await loadLoader()
    handshake({ origin: API_ORIGIN })
    api().destroy()
    api().reload()
    expect(hrefs()).toEqual([API_ORIGIN])
  })

  it('skips the page’s own origin', async () => {
    ;(window as any).chattermateBaseUrl = `${window.location.origin}/api/v1`
    await loadLoader()
    expect(hrefs()).toEqual([])
  })

  it('destroy leaves no hint behind', async () => {
    localStorage.setItem(KEY, FRAME_HOST)
    await loadLoader()
    api().destroy()
    expect(hrefs()).toEqual([])
  })

  it('a widget id set by init() gets its own remembered host', async () => {
    localStorage.setItem(FRAME_ORIGIN_PREFIX + 'w-late', FRAME_HOST)
    ;(window as any).chattermateId = undefined
    await loadLoader()
    api().init({ id: 'w-late' })
    expect(hrefs()).toContain(FRAME_HOST)
  })
})
