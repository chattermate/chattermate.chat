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
import { FRAME_ORIGIN, WIDGET_ID, api, bringUp, cleanupPage, flush, fromFrame, handshake, loadLoader, resetPage, spyOnFrame } from './loaderHarness'
import { LOOK_CACHE_PREFIX } from '@/webclient/loader/lookCache.js'
import { DEFAULT_LAUNCHER_COLOR } from '@/webclient/launcher-style'

// The frame page posts the launcher's look (FRAME_LOOK) as it parses, so a first
// visitor's launcher shows without waiting for the widget inside it to start.

const BRAND = '#2F5BEA'
const KEY = LOOK_CACHE_PREFIX + WIDGET_ID

const button = () => document.getElementById('chattermate-button') as HTMLElement
const css = () => document.getElementById('chattermate-styles')?.textContent ?? ''
const pending = () => button().classList.contains('chattermate-pending')
const cached = () => JSON.parse(localStorage.getItem(KEY) || 'null')
// Its origin isn't known yet: the frame sends this before its handshake
const earlyLook = (data: unknown, options: Parameters<typeof fromFrame>[1] = { origin: 'https://anything.example' }) =>
  fromFrame({ type: 'FRAME_LOOK', data } as Record<string, unknown>, options)

describe('launcher look from the frame page', () => {
  beforeEach(() => {
    resetPage()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    api()?.destroy()
    cleanupPage()
  })

  it('shows the launcher in its look before the widget has started', async () => {
    await loadLoader()
    expect(pending()).toBe(true)

    earlyLook({ chat_bubble_color: BRAND, launcher: { size: 'sm' }, widget_display: { side: 'left' } })

    expect(pending()).toBe(false)
    expect(css()).toContain(`background: ${BRAND};`)
    expect(css()).toContain('width: 48px;')
  })

  it('uses the default colour for an agent without one, as the widget does', async () => {
    remember({ chat_bubble_color: BRAND })
    await loadLoader()
    earlyLook({ chat_bubble_color: null, launcher: { size: 'md' } })
    expect(css()).toContain(`background: ${DEFAULT_LAUNCHER_COLOR};`)
  })

  it('is kept for the next visit once the frame\'s handshake comes from the same origin', async () => {
    await loadLoader()
    earlyLook({ chat_bubble_color: BRAND, launcher: { size: 'sm' } }, { origin: FRAME_ORIGIN })
    expect(cached()).toBeNull()

    handshake()
    expect(cached()).toMatchObject({ chat_bubble_color: BRAND, launcher: { size: 'sm' } })

    // The widget's own settings then replace it
    fromFrame({ type: 'WIDGET_READY' })
    fromFrame({ type: 'CUSTOMIZATION_UPDATE', data: { chat_bubble_color: '#10B981', launcher: { size: 'md' } } })
    expect(cached()).toEqual({ chat_bubble_color: '#10B981', launcher: { size: 'md' } })
  })

  it('a look from a frame that was replaced before its handshake is not kept', async () => {
    await loadLoader()
    earlyLook({ chat_bubble_color: BRAND }, { origin: FRAME_ORIGIN })
    // A new visitor: the old frame goes before it said hello
    api().identify('tok-1')
    await flush()
    handshake()
    expect(cached()).toBeNull()
  })

  it('is not kept when the handshake comes from another origin', async () => {
    await loadLoader()
    // The frame was navigated elsewhere before our page's look arrived
    earlyLook({ chat_bubble_color: BRAND }, { origin: 'https://spoof.example' })
    handshake()
    expect(cached()).toBeNull()
  })

  it('leaves the panel framing the loader already has', async () => {
    const panel = { radius: 12, elevation: 'dark', glow: null, glass: false }
    remember({ chat_bubble_color: BRAND, panel })
    await loadLoader()
    const before = css()
    earlyLook({ chat_bubble_color: BRAND })
    expect(css()).toBe(before)
  })

  it('is ignored after the handshake, so the widget\'s own settings always win', async () => {
    await loadLoader()
    bringUp()
    fromFrame({ type: 'CUSTOMIZATION_UPDATE', data: { chat_bubble_color: '#10B981' } })
    // A late or replayed one, even from the frame's real origin
    earlyLook({ chat_bubble_color: BRAND }, {})
    expect(css()).toContain('background: #10B981;')
    expect(css()).not.toContain(`background: ${BRAND};`)
  })

  it('comes only from the widget\'s own frame', async () => {
    await loadLoader()
    const other = document.createElement('iframe')
    document.body.appendChild(other)
    earlyLook({ chat_bubble_color: BRAND }, { origin: 'https://anything.example', source: other.contentWindow! })
    expect(pending()).toBe(true)
    expect(css()).not.toContain(`background: ${BRAND};`)
    other.remove()
  })

  it('gets the same checks as the widget\'s message', async () => {
    await loadLoader()
    earlyLook({ chat_bubble_color: 'red;}body{display:none', launcher: { size: '1234', shape: 'x;}' }, widget_display: { z_index: 'x' } })
    expect(css()).not.toContain('red;}')
    expect(css()).not.toContain('x;}')
    expect(css()).toContain(`background: ${DEFAULT_LAUNCHER_COLOR};`)
  })

  it('ignores one with no look in it', async () => {
    await loadLoader()
    earlyLook('nope')
    earlyLook(null)
    // A list would reset every launcher setting, as an empty look does
    earlyLook([])
    expect(pending()).toBe(true)
  })

  it('a launcher the dashboard hides stays hidden', async () => {
    await loadLoader()
    earlyLook({ chat_bubble_color: BRAND, widget_display: { launcher: false } })
    expect(css()).toMatch(/#chattermate-button\s*\{\s*display: none/)
  })

  it('the developer\'s options still win', async () => {
    ;(window as any).chattermateConfig = { launcherStyle: { size: 'lg' }, chatBubbleColor: '#000000' }
    await loadLoader()
    earlyLook({ chat_bubble_color: BRAND, launcher: { size: 'sm' } })
    expect(css()).toContain('width: 64px;')
  })

  it('sends nothing to the frame and doesn\'t start the handshake', async () => {
    await loadLoader()
    const post = spyOnFrame()
    earlyLook({ chat_bubble_color: BRAND })
    expect(post).not.toHaveBeenCalled()
    // The handshake still happens normally afterwards
    expect(handshake()).not.toBeNull()
  })

  it('never calls the API from the host page', async () => {
    await loadLoader()
    earlyLook({ chat_bubble_color: BRAND })
    expect(fetch).not.toHaveBeenCalled()
  })
})

function remember(look: Record<string, unknown>) {
  localStorage.setItem(KEY, JSON.stringify(look))
}
