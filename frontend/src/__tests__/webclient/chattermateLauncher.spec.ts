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
import { BRAND_COLORS } from '@/config/brand'
import { BASE_URL, WIDGET_ID, api, bringUp, cleanupPage, flush, fromFrame, handshake, loadLoader, resetPage } from './loaderHarness'

const LOGO = 'https://bucket.s3.amazonaws.com/agents/o/logo.webp?X-Amz-Signature=abc'
// What the image loads: the loader's own redirect route, never the relayed address.
const LOGO_SRC = `${BASE_URL}/widgets/${WIDGET_ID}/launcher-logo?v=1`
const BRAND = '#2F5BEA'

const button = () => document.getElementById('chattermate-button') as HTMLElement
const css = () => document.getElementById('chattermate-styles')?.textContent ?? ''
const holder = () => button().querySelector('.cm-icon') as HTMLElement
const logo = () => holder().querySelector('img') as HTMLImageElement | null

function customize(launcher?: unknown, logoUrl?: unknown, extra: Record<string, unknown> = {}) {
  fromFrame({
    type: 'CUSTOMIZATION_UPDATE',
    data: { chat_bubble_color: BRAND, launcher, launcher_logo_url: logoUrl, ...extra },
  })
}

const widthRule = (px: number) => `width: ${px}px;`

describe('launcher customization', () => {
  beforeEach(() => {
    resetPage()
    vi.stubGlobal('fetch', vi.fn())
  })

  // Each test's loader must go, or its resize listener repaints the next one's launcher.
  afterEach(() => {
    api()?.destroy()
    cleanupPage()
  })

  async function up() {
    await loadLoader()
    bringUp()
  }

  describe('nothing saved', () => {
    it('is the original launcher', async () => {
      await up()
      customize()
      expect(css()).toContain(widthRule(64))
      expect(css()).toContain('border-radius: 20px 20px 20px 6px')
      expect(css()).toContain('animation: chattermate-float 4s ease-in-out infinite')
      expect(button().classList.contains('cm-has-icon')).toBe(false)
      expect(button().classList.contains('chattermate-pending')).toBe(false)
    })
  })

  describe('colour', () => {
    it('the ChatterMate colour shows the mark: lime and coral dots', async () => {
      await up()
      fromFrame({ type: 'CUSTOMIZATION_UPDATE', data: { chat_bubble_color: BRAND_COLORS.ink } })
      expect(css()).toContain(`.cm-dot:nth-child(1) { background: ${BRAND_COLORS.lime}; }`)
      expect(css()).toContain(`.cm-dot:nth-child(2) { background: ${BRAND_COLORS.coral}; }`)
    })

    it('any other colour keeps both dots in its contrast ink', async () => {
      await up()
      customize()
      expect(css()).not.toContain(`background: ${BRAND_COLORS.lime}; }`)
    })

    it('a pale colour gets an outline and a dark ring', async () => {
      await up()
      fromFrame({ type: 'CUSTOMIZATION_UPDATE', data: { chat_bubble_color: '#E9ECEF' } })
      expect(css()).toContain('inset 0 0 0 1px rgba(15,23,42,.12)')
      expect(css()).toContain('border: 1.5px solid #1F2937')
    })
  })

  describe('size', () => {
    it.each([['sm', 48], ['md', 56], ['lg', 64]])('%s sets the button and everything hung off it', async (size, px) => {
      await up()
      customize({ size })
      expect(css()).toContain(widthRule(px))
      expect(css()).toContain(`height: ${px}px;`)
      // The nudge sits 12px above the launcher, 20px from the page edge.
      expect(css()).toContain(`bottom: ${20 + px + 12}px !important`)
      // The window keeps its gap: 100 at full size.
      expect(css()).toContain(`bottom: ${100 - (64 - px)}px;`)
    })

    it('keeps Small on phones and caps Large', async () => {
      await up()
      customize({ size: 'sm' })
      expect(css()).toContain('width: 48px !important')
      customize({ size: 'lg' })
      expect(css()).toContain('width: 56px !important')
    })

    it('scales the dots and badge with it', async () => {
      await up()
      customize({ size: 'sm' })
      expect(css()).toContain('scale(0.75)')
      expect(css()).toContain('min-width: 16px;')
    })

    it('leaves the search bar at its own height', async () => {
      await loadLoader()
      api().init?.({ displayMode: 'search-bar' })
      bringUp()
      customize({ size: 'sm' })
      expect(css()).toContain(`bottom: ${20 + 48 + 12}px !important`)
      expect(css()).toContain('height: 48px;')
      expect(css()).toContain('.cm-has-icon .cm-icon')
    })

    it('stays white when open or loading', async () => {
      await loadLoader()
      api().init?.({ displayMode: 'search-bar' })
      bringUp()
      customize({ icon: 'logo', background: 'none' }, LOGO)
      const bar = css().slice(css().indexOf('Search-bar mode'))
      expect(bar).toMatch(/\.active,\s*#chattermate-button\.loading \{\s*background: #ffffff/)
    })

    it('adds no open or loading fill to an ordinary launcher', async () => {
      await up()
      customize()
      expect(css()).not.toMatch(/\.active,\s*#chattermate-button\.loading \{\s*background/)
    })

    it('keeps the original badge box at Large', async () => {
      await up()
      customize({ size: 'lg' })
      expect(css()).toContain('min-width: 22px;')
      expect(css()).toContain('padding: 0 6px;')
      expect(css()).toContain('font: 700 11.5px/1')
      expect(css().slice(css().indexOf('.cm-badge {')).split('}')[0]).not.toContain('box-sizing')
    })
  })

  describe('shape', () => {
    it('applies to the button and rings alike', async () => {
      await up()
      customize({ shape: 'circle' })
      expect(css()).toContain('border-radius: 50%;')
      expect(css()).toContain('border-radius: inherit;')
    })
  })

  describe('icon', () => {
    it.each(['chat', 'headset', 'help', 'sparkle'])('draws %s in place of the dots', async (icon) => {
      await up()
      customize({ icon })
      expect(button().classList.contains('cm-has-icon')).toBe(true)
      expect(holder().querySelector('svg')).not.toBeNull()
    })

    it('goes back to dots', async () => {
      await up()
      customize({ icon: 'chat' })
      customize({ icon: 'dots' })
      expect(button().classList.contains('cm-has-icon')).toBe(false)
      expect(holder().children.length).toBe(0)
    })

    it('ignores values it does not know', async () => {
      await up()
      customize({ icon: '<img src=x onerror=alert(1)>', size: '1234', shape: 'x;}', animation: 'evil' })
      expect(holder().children.length).toBe(0)
      expect(css()).toContain(widthRule(64))
      expect(css()).not.toContain('evil')
      expect(css()).not.toContain('1234')
    })
  })

  describe('logo', () => {
    it('renders the logo as a plain image', async () => {
      await up()
      customize({ icon: 'logo', background: 'white' }, LOGO)
      expect(logo()?.getAttribute('src')).toBe(LOGO_SRC)
      expect(logo()?.getAttribute('alt')).toBe('')
      expect(css()).toContain('background: #FFFFFF;')
    })

    it('holds the launcher back until the logo arrives', async () => {
      await up()
      customize({ icon: 'logo', background: 'white' }, LOGO)
      expect(button().classList.contains('chattermate-pending')).toBe(true)
      logo()!.dispatchEvent(new Event('load'))
      expect(button().classList.contains('chattermate-pending')).toBe(false)
    })

    it('stops waiting for a slow logo', async () => {
      vi.useFakeTimers()
      await loadLoader({ fakeTimers: true })
      bringUp()
      customize({ icon: 'logo', background: 'white' }, LOGO)
      await vi.advanceTimersByTimeAsync(1400)
      expect(button().classList.contains('chattermate-pending')).toBe(true)
      await vi.advanceTimersByTimeAsync(200)
      expect(button().classList.contains('chattermate-pending')).toBe(false)
    })

    it('does not wait when the launcher is hidden', async () => {
      await up()
      customize({ icon: 'logo' }, LOGO, { widget_display: { launcher: false } })
      expect(button().classList.contains('chattermate-pending')).toBe(false)
    })

    it('falls back to the dots when the image is blocked, and reveals', async () => {
      await up()
      customize({ icon: 'logo', background: 'none' }, LOGO)
      logo()!.dispatchEvent(new Event('error'))
      expect(logo()).toBeNull()
      expect(button().classList.contains('cm-has-icon')).toBe(false)
      expect(button().classList.contains('chattermate-pending')).toBe(false)
      expect(css()).toContain(`background: ${BRAND};`)
    })

    it('stays failed on the same address, but tries a new signature', async () => {
      await up()
      customize({ icon: 'logo' }, LOGO)
      logo()!.dispatchEvent(new Event('error'))
      customize({ icon: 'logo' }, LOGO)
      expect(logo()).toBeNull()
      customize({ icon: 'logo' }, LOGO.replace('abc', 'def'))
      expect(logo()?.getAttribute('src')).toBe(LOGO_SRC)
    })

    it('a new file gets a new image address', async () => {
      await up()
      customize({ icon: 'logo' }, LOGO)
      customize({ icon: 'logo' }, 'https://bucket.s3.amazonaws.com/agents/o/other.webp')
      expect(logo()?.getAttribute('src')).toBe(`${BASE_URL}/widgets/${WIDGET_ID}/launcher-logo?v=2`)
    })

    it('never puts the relayed address in the image', async () => {
      await up()
      customize({ icon: 'logo' }, 'https://evil.example/x.png?"><script>')
      const src = logo()!.getAttribute('src')!
      expect(src.startsWith(`${BASE_URL}/widgets/${WIDGET_ID}/launcher-logo?v=`)).toBe(true)
      expect(src).not.toContain('<')
    })

    it('does not reload the image for a new signature or a resize', async () => {
      await up()
      customize({ icon: 'logo' }, LOGO)
      const first = logo()
      customize({ icon: 'logo' }, LOGO.replace('abc', 'def'))
      window.dispatchEvent(new Event('resize'))
      expect(logo()).toBe(first)
      expect(logo()?.getAttribute('src')).toBe(LOGO_SRC)
    })

    it('shows the dots when the logo option has no file', async () => {
      await up()
      customize({ icon: 'logo', background: 'none', animation: 'classic' })
      expect(button().classList.contains('cm-has-icon')).toBe(false)
      expect(css()).toContain(`background: ${BRAND};`)
      expect(css()).toContain('animation: chattermate-float')
    })

    it.each(['javascript:alert(1)', 'data:image/svg+xml,<svg/>', 'http://evil.example/x.png', '/relative.png', 42])(
      'refuses the logo address %s', async (url) => {
        await up()
        customize({ icon: 'logo' }, url)
        expect(logo()).toBeNull()
      })

    it('allows http on an http install', async () => {
      ;(window as any).chattermateBaseUrl = 'http://localhost:8000/api/v1'
      await loadLoader()
      const origin = 'http://localhost:8000'
      handshake({ origin })
      fromFrame({
        type: 'CUSTOMIZATION_UPDATE',
        data: { launcher: { icon: 'logo' }, launcher_logo_url: `${origin}/api/v1/uploads/agents/o/a.webp` },
      }, { origin })
      expect(logo()).not.toBeNull()
    })

    describe('with no background', () => {
      const bare = { icon: 'logo', background: 'none' }

      it('drops the button but keeps one behind the chevron and spinner', async () => {
        await up()
        customize(bare, LOGO)
        expect(css()).toContain('background: transparent;')
        expect(css()).toContain('box-shadow: none;')
        expect(css()).toMatch(new RegExp(`\\.active,\\s*#chattermate-button\\.loading \\{\\s*background: ${BRAND}`))
      })

      it.each(['classic', 'glow'])('has no %s, which needs a button', async (animation) => {
        await up()
        customize({ ...bare, animation }, LOGO)
        expect(css()).not.toContain('animation: chattermate-float')
        expect(css()).not.toContain('animation: chattermate-launcher-glow')
      })

      it('keeps Swoosh', async () => {
        await up()
        customize({ ...bare, animation: 'swoosh' }, LOGO)
        expect(css()).toContain('animation: chattermate-launcher-dash')
      })
    })
  })

  describe('animation', () => {
    it.each([
      ['none', 'animation: none;'],
      ['bounce', 'animation: chattermate-launcher-bounce 12s'],
      ['swoosh', 'animation: chattermate-launcher-dash 12s'],
      ['glow', 'animation: chattermate-launcher-glow 12s'],
    ])('%s', async (animation, rule) => {
      await up()
      customize({ animation })
      expect(css()).toContain(rule)
      expect(css()).not.toContain('animation: chattermate-float 4s')
    })

    it('stops the attention animations once the chat has been opened', async () => {
      await up()
      customize({ animation: 'bounce' })
      expect(css()).toContain('.cm-opened { animation: none; }')
      expect(button().classList.contains('cm-opened')).toBe(false)
      button().click()
      expect(button().classList.contains('cm-opened')).toBe(true)
      button().click()
      expect(button().classList.contains('cm-opened')).toBe(true)
    })

    it('leaves Classic running as it always has', async () => {
      await up()
      customize({ animation: 'classic' })
      expect(css()).not.toContain('.cm-opened { animation: none; }')
    })

    it('mirrors Swoosh on the left', async () => {
      await up()
      customize({ animation: 'swoosh' }, undefined, { widget_display: { side: 'left' } })
      expect(css()).toContain('scaleX(-1)')
      expect(css()).toContain('left: calc(100% + 2px);')
    })

    it('never sets an inline animation that would outrank a preset on phones', async () => {
      vi.stubGlobal('innerWidth', 375)
      await up()
      customize({ animation: 'none' })
      window.dispatchEvent(new Event('resize'))
      button().click()
      button().click()
      expect(button().style.animation).toBe('')
    })

    it('respects reduced motion', async () => {
      await up()
      customize({ animation: 'swoosh' })
      expect(css()).toMatch(/prefers-reduced-motion: reduce\) \{[^}]*#chattermate-button,/)
      expect(css()).toContain('.cm-swoosh { display: none !important; }')
    })
  })

  describe('developer options', () => {
    it('launcherStyle wins over the dashboard, key by key', async () => {
      ;(window as any).chattermateConfig = { launcherStyle: { size: 'sm' } }
      await up()
      customize({ size: 'lg', icon: 'chat' })
      expect(css()).toContain(widthRule(48))
      expect(holder().querySelector('svg')).not.toBeNull()
    })

    it('cannot set a logo or a paid animation', async () => {
      ;(window as any).chattermateConfig = { launcherStyle: { icon: 'logo', animation: 'swoosh', background: 'none' } }
      await up()
      customize({ animation: 'bounce' })
      expect(css()).toContain('animation: chattermate-launcher-bounce')
      expect(css()).toContain(`background: ${BRAND};`)
    })

    it('leaves the launcher: false option alone', async () => {
      ;(window as any).chattermateConfig = { launcher: false, launcherStyle: { size: 'sm' } }
      await up()
      customize()
      expect(css()).toMatch(/#chattermate-button\s*\{\s*display: none/)
    })
  })

  describe('access', () => {
    it('is a named button that says whether it is open', async () => {
      await up()
      customize()
      expect(button().getAttribute('role')).toBe('button')
      expect(button().getAttribute('tabindex')).toBe('0')
      expect(button().getAttribute('aria-label')).toBe('Open chat')
      expect(button().getAttribute('aria-expanded')).toBe('false')
      button().click()
      expect(button().getAttribute('aria-label')).toBe('Close chat')
      expect(button().getAttribute('aria-expanded')).toBe('true')
    })

    it.each(['Enter', ' '])('opens with %j', async (key) => {
      await up()
      const event = new KeyboardEvent('keydown', { key, cancelable: true })
      button().dispatchEvent(event)
      expect(button().classList.contains('active')).toBe(true)
      expect(event.defaultPrevented).toBe(true)
    })

    it('a held key toggles once', async () => {
      await up()
      button().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }))
      button().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, repeat: true }))
      expect(button().classList.contains('active')).toBe(true)
    })

    it('leaves other keys to the page', async () => {
      await up()
      const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })
      button().dispatchEvent(event)
      expect(button().classList.contains('active')).toBe(false)
      expect(event.defaultPrevented).toBe(false)
    })
  })

  describe('rebuilds', () => {
    it('keeps the icon when the launcher is rebuilt', async () => {
      await up()
      customize({ icon: 'chat' })
      api().destroy()
      await api().reload()
      await flush()
      expect(button().classList.contains('cm-has-icon')).toBe(true)
      expect(holder().querySelector('svg')).not.toBeNull()
    })

    it('re-reveals a rebuilt launcher with a logo', async () => {
      await up()
      customize({ icon: 'logo' }, LOGO)
      logo()!.dispatchEvent(new Event('load'))
      api().destroy()
      await api().reload()
      await flush()
      bringUp()
      customize({ icon: 'logo' }, LOGO)
      logo()!.dispatchEvent(new Event('load'))
      expect(button().classList.contains('chattermate-pending')).toBe(false)
    })
  })
})
