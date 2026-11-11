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
import { api, bringUp, cleanupPage, frame, fromFrame, loadLoader, resetPage, spyOnFrame } from './loaderHarness'
import { resolvedStyle } from './cascade'

/**
 * The redesigned panel in every display mode the loader has: the floating window,
 * the drawers, the Ask AI palette, the search-bar trigger and phones. What it can
 * expand to, Escape and focus, and how the page's whole stylesheet resolves (the
 * classic rules and the redesign's together, by specificity: see cascade.ts).
 */

const V2 = { ui: 2, radius: 22, elevation: 'dark', glow: 'rgba(157,140,255,.26)', glass: true }

const button = () => document.getElementById('chattermate-button') as HTMLElement
const container = () => document.getElementById('chattermate-container') as HTMLElement

type Post = ReturnType<typeof spyOnFrame>
const capabilities = (post: Post) =>
    post.mock.calls.map(([m]) => m as any).filter(m => m.type === 'HOST_CAPABILITIES')

const REDUCED = '(prefers-reduced-motion: reduce)'
const DESKTOP = '(min-width: 769px)'
const PHONE = '(max-width: 768px)'
/** What a browser would resolve `property` on `el` to, on a desktop window. */
const style = (el: Element, property: string, media: string[] = []) => resolvedStyle(el, property, [DESKTOP, ...media])

async function upIn(options: Record<string, unknown>, data: Record<string, unknown> = {}) {
    ;(window as any).chattermateConfig = options
    await loadLoader()
    bringUp()
    const post = spyOnFrame()
    fromFrame({ type: 'CUSTOMIZATION_UPDATE', data: { chat_bubble_color: '#2F5BEA', panel: V2, ...data } })
    return post
}

beforeEach(() => {
    resetPage()
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('innerWidth', 1280)
})
afterEach(() => {
    api()?.destroy()
    cleanupPage()
})

describe('the resolver these checks use', () => {
    it('follows !important and specificity, not just source order', () => {
        const el = document.createElement('div')
        el.id = 'probe'
        el.className = 'b'
        document.body.appendChild(el)
        const tag = document.createElement('style')
        tag.textContent = '#probe.b { color: blue } #probe { color: red } #probe.b { opacity: 1 !important } #probe { opacity: 0 !important }'
            + ` @media ${REDUCED} { #probe.b { width: 1px } } #probe { width: 2px }`
        document.head.appendChild(tag)
        expect(resolvedStyle(el, 'color')).toBe('blue')
        expect(resolvedStyle(el, 'opacity')).toBe('1')
        expect(resolvedStyle(el, 'width')).toBe('2px')
        expect(resolvedStyle(el, 'width', [REDUCED])).toBe('1px')
    })
})

describe('the floating window', () => {
    it('can expand, and does', async () => {
        const post = await upIn({})
        expect(capabilities(post).at(-1)).toMatchObject({ expand: true })
        expect(style(container(), 'width')).toBe('400px')
        expect(style(container(), 'border-radius')).toBe('22px')
        fromFrame({ type: 'WIDGET_EXPAND', expanded: true })
        expect(style(container(), 'width')).toContain('600px')
    })

    it('fades in place for reduced motion, the classic sheet\'s transition: none !important notwithstanding', async () => {
        await upIn({})
        api().open()
        expect(style(container(), 'transition', [REDUCED])).toBe('opacity 150ms linear')
        expect(style(container(), 'transform', [REDUCED])).toBe('none')
        api().close()
        expect(style(container(), 'transition', [REDUCED])).toBe('opacity 150ms linear, visibility 0s linear 150ms')
        expect(style(container(), 'transform', [REDUCED])).toBe('none')
        // And with motion, the open motion out of the launcher's corner.
        expect(style(container(), 'transform')).toBe('translateY(16px) scale(.94)')
    })

    it('goes full screen on a phone, whatever the redesign\'s size and corners', async () => {
        await upIn({})
        expect(resolvedStyle(container(), 'width', [PHONE])).toBe('100vw')
        expect(resolvedStyle(container(), 'border-radius', [PHONE])).toBe('0')
        expect(resolvedStyle(frame(), 'border-radius', [PHONE])).toBe('0')
    })
})

describe('a drawer', () => {
    it('stays square and flush, cannot expand, and closes on Escape with focus back on the launcher', async () => {
        const post = await upIn({ displayMode: 'sidebar-right' })
        expect(capabilities(post).at(-1)).toMatchObject({ expand: false })
        expect(style(frame(), 'border-radius')).toBe('0')
        expect(style(container(), 'border-radius')).toBe('')
        expect(style(container(), 'transform-origin')).toBe('')
        expect(style(container(), 'box-shadow')).toContain('12px 0 40px')
        expect(style(container(), 'transform')).toBe('translateX(100%)')

        fromFrame({ type: 'WIDGET_EXPAND', expanded: true })
        expect(style(container(), 'width')).not.toContain('600px')

        api().open()
        fromFrame({ type: 'WIDGET_ESCAPE' })
        expect(api().isOpen()).toBe(false)
        expect(document.activeElement).toBe(button())

        api().open()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        expect(api().isOpen()).toBe(false)
    })
})

describe('the Ask AI palette', () => {
    it('keeps its own centring and corners, cannot expand, and can once it falls back to the chat panel', async () => {
        const post = await upIn({}, { chat_style: 'ASK_ANYTHING' })
        expect(capabilities(post).at(-1)).toMatchObject({ expand: false })
        api().open()
        expect(style(container(), 'transform')).toBe('translate(-50%, 0) scale(1)')
        expect(style(container(), 'transform', [REDUCED])).toBe('translate(-50%, 0) scale(1)')
        expect(style(container(), 'box-shadow')).toBe('')
        expect(style(frame(), 'border-radius')).toBe('16px')

        fromFrame({ type: 'WIDGET_SURFACE', palette: false })
        expect(capabilities(post).at(-1)).toMatchObject({ expand: true })
    })

    it('closes on Escape inside it, focus back on the launcher', async () => {
        await upIn({}, { chat_style: 'ASK_ANYTHING' })
        api().open()
        fromFrame({ type: 'WIDGET_ESCAPE' })
        expect(api().isOpen()).toBe(false)
        expect(document.activeElement).toBe(button())
    })
})

describe('the search-bar trigger', () => {
    it('keeps its dots and chevron hidden, open or closed', async () => {
        await upIn({ displayMode: 'search-bar' })
        const dots = button().querySelector('.cm-dots') as HTMLElement
        const chevron = button().querySelector('.cm-chevron') as HTMLElement
        expect(style(dots, 'display')).toBe('none')
        api().open()
        expect(style(dots, 'display')).toBe('none')
        expect(style(chevron, 'display')).toBe('none')
    })
})

describe('on a phone', () => {
    beforeEach(() => {
        vi.stubGlobal('innerWidth', 375)
    })

    it('cannot expand, and can again once the window is wide (told once)', async () => {
        const post = await upIn({})
        expect(capabilities(post).at(-1)).toMatchObject({ expand: false })
        vi.stubGlobal('innerWidth', 1280)
        window.dispatchEvent(new Event('resize'))
        window.dispatchEvent(new Event('resize'))
        const told = capabilities(post)
        expect(told.at(-1)).toMatchObject({ expand: true })
        expect(told.filter(m => m.expand === true)).toHaveLength(1)
    })

    it('hands focus back to the launcher only once it is showing again', async () => {
        await upIn({})
        api().open()
        let showingAtFocus: boolean | null = null
        vi.spyOn(button(), 'focus').mockImplementation(() => {
            showingAtFocus = button().classList.contains('mobile-closed')
        })
        fromFrame({ type: 'WIDGET_ESCAPE' })
        expect(api().isOpen()).toBe(false)
        expect(showingAtFocus).toBe(true)
    })
})
