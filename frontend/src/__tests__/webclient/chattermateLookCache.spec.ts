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
import { WIDGET_ID, api, bringUp, cleanupPage, fromFrame, loadLoader, resetPage } from './loaderHarness'
import { LOOK_CACHE_PREFIX, createLookCache } from '@/webclient/loader/lookCache.js'

// A returning visitor's launcher shows straight away in the look the dashboard last
// sent, instead of waiting for the widget frame; the frame's settings still win.

const KEY = LOOK_CACHE_PREFIX + WIDGET_ID
const BRAND = '#2F5BEA'

const button = () => document.getElementById('chattermate-button') as HTMLElement
const css = () => document.getElementById('chattermate-styles')?.textContent ?? ''
const pending = () => button().classList.contains('chattermate-pending')
const widthRule = (px: number) => `width: ${px}px;`
const cached = () => JSON.parse(localStorage.getItem(KEY) || 'null')
const launcherAt = (bottom: string, side: string) =>
  new RegExp(`#chattermate-button \\{\\s*position: fixed;\\s*${bottom};\\s*${side};`)
const LOGO = 'https://bucket.s3.amazonaws.com/agents/o/logo.webp?X-Amz-Signature=abc'
const logo = () => button().querySelector('.cm-icon img') as HTMLImageElement | null

function remember(look: Record<string, unknown>, key = KEY) {
  localStorage.setItem(key, JSON.stringify(look))
}

function customize(data: Record<string, unknown>) {
  fromFrame({ type: 'CUSTOMIZATION_UPDATE', data })
}

describe('launcher look cache', () => {
  beforeEach(() => {
    resetPage()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    api()?.destroy()
    cleanupPage()
  })

  describe('first visit', () => {
    it('waits for the settings, then keeps them for next time', async () => {
      await loadLoader()
      expect(pending()).toBe(true)

      bringUp()
      customize({
        chat_bubble_color: BRAND,
        launcher: { size: 'sm' },
        widget_display: { side: 'left' },
        chat_initiation_messages: ['Hi there'],
      })
      expect(pending()).toBe(false)
      // Only what shapes the launcher is kept
      expect(cached()).toEqual({ chat_bubble_color: BRAND, launcher: { size: 'sm' }, widget_display: { side: 'left' } })
    })
  })

  describe('returning visit', () => {
    it('shows the launcher at once, in the remembered look', async () => {
      remember({ chat_bubble_color: BRAND, launcher: { size: 'sm' } })
      await loadLoader()
      expect(pending()).toBe(false)
      expect(css()).toContain(widthRule(48))
      expect(css()).toContain(`background: ${BRAND};`)
    })

    it('the live settings replace the remembered look, and are remembered', async () => {
      remember({ chat_bubble_color: BRAND, launcher: { size: 'sm' } })
      await loadLoader()
      bringUp()
      customize({ chat_bubble_color: '#10B981', launcher: { size: 'md' } })
      expect(css()).toContain(widthRule(56))
      expect(css()).toContain('background: #10B981;')
      expect(cached()).toEqual({ chat_bubble_color: '#10B981', launcher: { size: 'md' } })
    })

    it('a setting the live settings leave out goes back to its default', async () => {
      remember({ chat_bubble_color: BRAND, launcher: { size: 'sm', animation: 'bounce' }, widget_display: { side: 'left', offset_bottom: 80 } })
      await loadLoader()
      expect(css()).toContain('animation: chattermate-launcher-bounce')
      expect(css()).toMatch(launcherAt('bottom: 80px', 'left: 20px'))
      bringUp()
      customize({ chat_bubble_color: BRAND })
      expect(css()).toContain(widthRule(64))
      expect(css()).not.toContain('animation: chattermate-launcher-bounce')
      expect(css()).toMatch(launcherAt('bottom: 20px', 'right: 20px'))
    })

    it('a remembered logo that no longer loads falls back to the dots', async () => {
      remember({ chat_bubble_color: BRAND, launcher: { icon: 'logo', background: 'white' }, launcher_logo_url: LOGO })
      await loadLoader()
      // Held back a moment so the logo doesn't pop in…
      expect(logo()).not.toBeNull()
      expect(pending()).toBe(true)
      // …and a logo the plan no longer covers fails to load: dots, shown at once
      logo()!.dispatchEvent(new Event('error'))
      expect(logo()).toBeNull()
      expect(button().classList.contains('cm-has-icon')).toBe(false)
      expect(pending()).toBe(false)
    })

    it('a launcher the dashboard hides stays hidden', async () => {
      remember({ chat_bubble_color: BRAND, widget_display: { launcher: false } })
      await loadLoader()
      expect(css()).toMatch(/#chattermate-button\s*\{\s*display: none/)
    })

    it('the developer\'s options still win', async () => {
      ;(window as any).chattermateConfig = { launcherStyle: { size: 'lg' } }
      remember({ chat_bubble_color: BRAND, launcher: { size: 'sm' } })
      await loadLoader()
      expect(css()).toContain(widthRule(64))
    })

    it('another widget\'s look is not used', async () => {
      remember({ chat_bubble_color: BRAND, launcher: { size: 'sm' } }, LOOK_CACHE_PREFIX + 'other-widget')
      await loadLoader()
      expect(pending()).toBe(true)
      expect(css()).not.toContain(widthRule(48))
    })
  })

  describe('a bad entry', () => {
    it('that is not JSON is ignored', async () => {
      localStorage.setItem(KEY, '{nope')
      await loadLoader()
      expect(pending()).toBe(true)
    })

    it('gets the same checks as a live message', async () => {
      remember({ chat_bubble_color: 'red;}body{display:none', launcher: { size: '1234', shape: 'x;}' }, widget_display: { side: 'top', z_index: 'x' } })
      await loadLoader()
      expect(css()).not.toContain('red;}')
      expect(css()).not.toContain('x;}')
      expect(css()).toContain(widthRule(64))
    })
  })
})

describe('createLookCache', () => {
  const look = { chat_bubble_color: BRAND, launcher: { size: 'sm' } }

  it('reads back what it saved', () => {
    const cache = createLookCache(localStorage, 'w')
    cache.save(look)
    expect(cache.read()).toEqual(look)
  })

  it('does nothing without a widget ID or storage', () => {
    expect(createLookCache(localStorage, '').read()).toBeNull()
    expect(createLookCache(null, 'w').read()).toBeNull()
    expect(() => createLookCache(null, 'w').save(look)).not.toThrow()
  })

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('full') },
      removeItem: () => { throw new Error('denied') },
    }
    const cache = createLookCache(broken, 'w')
    expect(cache.read()).toBeNull()
    expect(() => cache.save(look)).not.toThrow()
  })

  it('drops an entry too big to be a look', () => {
    const cache = createLookCache(localStorage, 'w')
    cache.save(look)
    cache.save({ widget_display: { search_placeholder: 'x'.repeat(5000) } })
    expect(cache.read()).toBeNull()
  })

  it('reads anything but an object as nothing', () => {
    localStorage.setItem(LOOK_CACHE_PREFIX + 'w', '[1,2]')
    expect(createLookCache(localStorage, 'w').read()).toBeNull()
  })
})
