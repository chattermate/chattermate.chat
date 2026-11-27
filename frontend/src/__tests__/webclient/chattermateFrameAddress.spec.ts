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
import { BASE_URL, WIDGET_ID, api, cleanupPage, frame, frames, handshake, loadLoader, resetPage } from './loaderHarness'
import { frameBase } from '@/webclient/loader/frameAddress.js'

// A loader built with the frame host asks it for the frame directly, skipping the
// API host's redirect, but only for the API it was built for.

const FRAME_HOST = 'https://widget.example.com'
const API_ORIGIN = 'https://api.example.com'

describe('frameBase', () => {
  it('puts the API path on the built frame host', () => {
    expect(frameBase(BASE_URL, BASE_URL, FRAME_HOST)).toBe(`${FRAME_HOST}/api/v1`)
  })

  it('ignores trailing slashes on either side', () => {
    expect(frameBase(`${BASE_URL}/`, BASE_URL, `${FRAME_HOST}/`)).toBe(`${FRAME_HOST}/api/v1`)
  })

  it('matches the API whatever the case or a default port written', () => {
    expect(frameBase('https://API.example.com:443/api/v1', BASE_URL, FRAME_HOST)).toBe(`${FRAME_HOST}/api/v1`)
  })

  it('keeps a path prefix on the frame host, as the redirect does', () => {
    expect(frameBase(BASE_URL, BASE_URL, `${FRAME_HOST}/chat`)).toBe(`${FRAME_HOST}/chat/api/v1`)
  })

  it.each([
    ['no frame host built in', BASE_URL, BASE_URL, ''],
    ['no API built in', BASE_URL, '', FRAME_HOST],
    ['the page uses another backend', 'https://self.example/api/v1', BASE_URL, FRAME_HOST],
    ['the page uses another path on the same host', 'https://api.example.com/v2', BASE_URL, FRAME_HOST],
    ['the page uses a relative address', '/api/v1', BASE_URL, FRAME_HOST],
    ['the frame host is not a web address', BASE_URL, BASE_URL, 'javascript:alert(1)'],
    ['the frame host is not a URL', BASE_URL, BASE_URL, 'not a url'],
  ])('keeps the API base when %s', (_case, apiUrl, builtApi, builtFrame) => {
    expect(frameBase(apiUrl, builtApi, builtFrame)).toBe(apiUrl)
  })
})

describe('loader frame address', () => {
  beforeEach(() => {
    resetPage()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    api()?.destroy()
    cleanupPage()
  })

  function buildWith(frameUrl: string) {
    vi.stubGlobal('__CHATTERMATE_API_URL__', BASE_URL)
    vi.stubGlobal('__CHATTERMATE_FRAME_URL__', frameUrl)
  }

  const hrefs = () =>
    Array.from(document.head.querySelectorAll('link[rel="preconnect"]')).map((link) => link.getAttribute('href'))

  it('asks the built frame host directly', async () => {
    buildWith(FRAME_HOST)
    await loadLoader()
    const src = new URL(frame().src)
    expect(src.origin).toBe(FRAME_HOST)
    expect(src.pathname).toBe(`/api/v1/widgets/${WIDGET_ID}/frame`)
    expect(src.searchParams.get('host')).toBe('1')
  })

  it('warms up the frame host on a first visit', async () => {
    buildWith(FRAME_HOST)
    await loadLoader()
    expect(hrefs()).toEqual([API_ORIGIN, FRAME_HOST])
  })

  it('hands the visitor to the frame once it says hello from there', async () => {
    buildWith(FRAME_HOST)
    await loadLoader()
    expect(handshake({ origin: FRAME_HOST })?.targetOrigin).toBe(FRAME_HOST)
  })

  it('a page on another backend keeps that backend’s address', async () => {
    buildWith(FRAME_HOST)
    ;(window as any).chattermateBaseUrl = 'https://self.example/api/v1'
    await loadLoader()
    expect(new URL(frame().src).origin).toBe('https://self.example')
    expect(hrefs()).toEqual(['https://self.example'])
  })

  it('a loader built without a frame host goes through the API', async () => {
    buildWith('')
    await loadLoader()
    expect(new URL(frame().src).origin).toBe(API_ORIGIN)
  })

  describe('when the frame host never starts the frame', () => {
    const errorCard = () => document.querySelector('.chattermate-error-ui')

    async function frameLoadsButNeverSaysHello() {
      frame().dispatchEvent(new Event('load'))
      await vi.advanceTimersByTimeAsync(3000)
    }

    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('asks once more through the API', async () => {
      buildWith(FRAME_HOST)
      await loadLoader({ fakeTimers: true })
      await frameLoadsButNeverSaysHello()

      expect(frames()).toHaveLength(1)
      expect(new URL(frame().src).origin).toBe(API_ORIGIN)
      expect(errorCard()).toBeNull()
    })

    it('starts the chat from wherever the API sends it', async () => {
      buildWith(FRAME_HOST)
      await loadLoader({ fakeTimers: true })
      await frameLoadsButNeverSaysHello()

      expect(handshake({ origin: FRAME_HOST })?.targetOrigin).toBe(FRAME_HOST)
    })

    it('says the chat could not load if the API address fails too', async () => {
      buildWith(FRAME_HOST)
      await loadLoader({ fakeTimers: true })
      await frameLoadsButNeverSaysHello()
      await frameLoadsButNeverSaysHello()

      expect(frames()).toHaveLength(0)
      expect(errorCard()).not.toBeNull()
    })

    it('keeps going through the API when the widget is rebuilt', async () => {
      buildWith(FRAME_HOST)
      await loadLoader({ fakeTimers: true })
      await frameLoadsButNeverSaysHello()
      api().reload()
      await vi.advanceTimersByTimeAsync(0)

      expect(new URL(frame().src).origin).toBe(API_ORIGIN)
    })

    it('a loader built without a frame host has nothing to retry', async () => {
      buildWith('')
      await loadLoader({ fakeTimers: true })
      await frameLoadsButNeverSaysHello()

      expect(frames()).toHaveLength(0)
      expect(errorCard()).not.toBeNull()
    })
  })
})
