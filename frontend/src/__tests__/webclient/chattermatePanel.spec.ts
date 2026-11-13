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
import { api, bringUp, cleanupPage, flush, frame, fromFrame, handshake, loadLoader, resetPage, spyOnFrame, tokenFor, WIDGET_ID } from './loaderHarness'

/**
 * The embed loader framing the panel: capabilities, open/close, Escape and focus,
 * reopening where the visitor was, expand, the peek and the working dot.
 */

const V2 = { ui: 2, radius: 22, elevation: 'dark', glow: 'rgba(157,140,255,.26)', glass: true }

const button = () => document.getElementById('chattermate-button') as HTMLElement
const container = () => document.getElementById('chattermate-container') as HTMLElement
const peek = () => document.getElementById('chattermate-peek')
const css = () => document.getElementById('chattermate-styles')?.textContent ?? ''

const customize = (panel?: unknown, extra: Record<string, unknown> = {}) =>
    fromFrame({ type: 'CUSTOMIZATION_UPDATE', data: { chat_bubble_color: '#2F5BEA', panel, ...extra } })

const sentTypes = (post: ReturnType<typeof spyOnFrame>) => post.mock.calls.map(([m]) => (m as any).type)
const sent = (post: ReturnType<typeof spyOnFrame>, type: string) =>
    post.mock.calls.map(([m]) => m as any).filter(m => m.type === type)

beforeEach(() => {
    resetPage()
    vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => {
    api()?.destroy()
    cleanupPage()
})

/** Loader up, frame mounted, the frame's look applied; returns the frame spy. */
async function upWith(panel?: unknown, extra: Record<string, unknown> = {}) {
    await loadLoader()
    bringUp()
    const post = spyOnFrame()
    customize(panel, extra)
    return post
}

describe('the panel', () => {
    it('is framed as the panel before the frame says how, with the default corners', async () => {
        await loadLoader()
        bringUp()
        expect(button().classList.contains('cm-v2')).toBe(true)
        expect(container().classList.contains('cm-v2')).toBe(true)
        expect(css()).toContain('#chattermate-container.cm-v2')
        expect(css()).toContain('border-radius: 24px;')
    })

    it('is framed by its own rules, scoped to it, and the launcher names the panel it opens', async () => {
        await upWith(V2)
        expect(button().classList.contains('cm-v2')).toBe(true)
        expect(container().classList.contains('cm-v2')).toBe(true)
        expect(button().getAttribute('aria-controls')).toBe('chattermate-container')
        expect(css()).toContain('#chattermate-container.cm-v2')
        expect(css()).toContain('border-radius: 22px;')
    })

    it('tells the frame what it can do: the expand size and a frosted backdrop', async () => {
        const post = await upWith(V2)
        const capabilities = sent(post, 'HOST_CAPABILITIES').at(-1)
        expect(capabilities).toMatchObject({ type: 'HOST_CAPABILITIES', v: 1, expand: true })
        expect(typeof capabilities.backdrop).toBe('boolean')
    })

    it('announces again when the frame mounts after the look was cached', async () => {
        localStorage.setItem(`cm_look:${WIDGET_ID}`, JSON.stringify({ chat_bubble_color: '#2F5BEA', panel: V2 }))
        await loadLoader()
        expect(button().classList.contains('cm-v2')).toBe(true)
        handshake()
        const post = spyOnFrame()
        fromFrame({ type: 'WIDGET_READY' })
        expect(sentTypes(post)).toContain('HOST_CAPABILITIES')
    })

    it('keeps refused values out of the page\'s CSS', async () => {
        await upWith({ ...V2, glow: 'red;}body{display:none', radius: '9px;}*{opacity:0' })
        expect(css()).not.toContain('display:none')
        expect(css()).not.toContain('opacity:0')
        expect(css()).toContain('border-radius: 24px;')
    })

    it('opens with the cascade and never scrolls the visitor to the bottom', async () => {
        const post = await upWith(V2)
        api().open()
        expect(sent(post, 'WIDGET_VISIBILITY').at(-1)).toEqual({ type: 'WIDGET_VISIBILITY', open: true, cascade: true })
        api().close()
        api().open()
        expect(sentTypes(post)).not.toContain('SCROLL_TO_BOTTOM')
    })

    it('closes on Escape inside the frame in floating mode, focus back on the launcher', async () => {
        await upWith(V2)
        api().open()
        fromFrame({ type: 'WIDGET_ESCAPE' })
        expect(api().isOpen()).toBe(false)
        expect(document.activeElement).toBe(button())
    })

    it('closes on Escape with focus on the page, and from its own minimize, focus back on the launcher', async () => {
        await upWith(V2)
        api().open()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        expect(api().isOpen()).toBe(false)
        expect(document.activeElement).toBe(button())

        api().open()
        ;(document.activeElement as HTMLElement)?.blur()
        fromFrame({ type: 'WIDGET_MINIMIZE' })
        expect(api().isOpen()).toBe(false)
        expect(document.activeElement).toBe(button())
    })

    it('does not move focus when the close came from the page\'s own code', async () => {
        await upWith(V2)
        api().open()
        api().close()
        expect(document.activeElement).not.toBe(button())
    })

    it('leaves Escape to the site\'s own dialog when focus is there', async () => {
        await upWith(V2)
        api().open()
        const dialogInput = document.createElement('input')
        document.body.appendChild(dialogInput)
        dialogInput.focus()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        expect(api().isOpen()).toBe(true)

        // With focus in the panel it closes.
        frame().focus()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        expect(api().isOpen()).toBe(false)
        expect(document.activeElement).toBe(button())
    })

    it('grows to the expanded size when the header asks, and back', async () => {
        await upWith(V2)
        fromFrame({ type: 'WIDGET_EXPAND', expanded: true })
        expect(container().classList.contains('cm-expanded')).toBe(true)
        expect(css()).toContain('min(600px, calc(100vw - 48px))')
        fromFrame({ type: 'WIDGET_EXPAND', expanded: false })
        expect(container().classList.contains('cm-expanded')).toBe(false)
    })

    it('pulses the launcher while a reply is worked on with the panel hidden', async () => {
        await upWith(V2)
        fromFrame({ type: 'WIDGET_ACTIVITY', busy: true })
        expect(button().classList.contains('cm-busy')).toBe(true)
        fromFrame({ type: 'WIDGET_ACTIVITY', busy: false })
        expect(button().classList.contains('cm-busy')).toBe(false)
    })

    it('keeps the framing in the site\'s look cache', async () => {
        await upWith(V2)
        expect(JSON.parse(localStorage.getItem(`cm_look:${WIDGET_ID}`)!).panel).toEqual(V2)
    })
})

describe('the peek nudge', () => {
    beforeEach(() => {
        vi.stubGlobal('requestAnimationFrame', (run: () => void) => { run(); return 0 })
    })

    it('shows an unread reply as plain text, only while the panel is closed', async () => {
        await upWith(V2)
        fromFrame({ type: 'UNREAD_PREVIEW', text: '<img src=x onerror="alert(1)">Your order shipped', agentName: 'Ada' })
        const el = peek()!
        expect(el.querySelector('img')).toBeNull()
        expect(el.querySelector('.cm-peek-text')!.textContent).toBe('<img src=x onerror="alert(1)">Your order shipped')
        expect(el.querySelector('.cm-peek-from')!.textContent).toBe('Ada')
        expect(el.classList.contains('show')).toBe(true)

        api().open()
        expect(el.classList.contains('show')).toBe(false)
        fromFrame({ type: 'UNREAD_PREVIEW', text: 'Another', agentName: 'Ada' })
        expect(el.classList.contains('show')).toBe(false)
    })

    it('keeps a host page\'s emoji pictures at the size of the text', async () => {
        await upWith(V2)
        fromFrame({ type: 'UNREAD_PREVIEW', text: 'Need support? \u{1F468}\u200D\u{1F4BC}', agentName: '' })
        // WordPress skips this class; another host's swap is held to 1em.
        expect(peek()!.classList.contains('wp-exclude-emoji')).toBe(true)
        const css = [...document.querySelectorAll('style')].map(style => style.textContent).join('\n')
        expect(css).toMatch(/#chattermate-peek\.cm-v2 \.cm-peek-body img \{[^}]*width: 1em !important;[^}]*height: 1em !important;/)
    })

    it('cuts a long preview to 120 characters', async () => {
        await upWith(V2)
        fromFrame({ type: 'UNREAD_PREVIEW', text: 'x'.repeat(400), agentName: '' })
        expect(peek()!.querySelector('.cm-peek-text')!.textContent!.length).toBe(120)
    })

    it('opens the panel when clicked, and goes when dismissed', async () => {
        await upWith(V2)
        fromFrame({ type: 'UNREAD_PREVIEW', text: 'Hi', agentName: 'Ada' })
        ;(peek()!.querySelector('.cm-peek-body') as HTMLButtonElement).click()
        expect(api().isOpen()).toBe(true)
        api().close()
        fromFrame({ type: 'UNREAD_PREVIEW', text: 'Hi again', agentName: 'Ada' })
        ;(peek()!.querySelector('[aria-label="Dismiss"]') as HTMLButtonElement).click()
        expect(peek()!.classList.contains('show')).toBe(false)
        expect(api().isOpen()).toBe(false)
    })

    it('shows the page\'s prompt() while the panel is closed', async () => {
        await upWith(V2)
        api().prompt({ message: 'Need a hand with checkout?' })
        expect(peek()!.querySelector('.cm-peek-text')!.textContent).toBe('Need a hand with checkout?')
    })

    it('shows the agent\'s opening line once per session, after a 1.4s dwell', async () => {
        vi.useFakeTimers()
        await loadLoader({ fakeTimers: true })
        bringUp()
        customize(V2, { chat_initiation_messages: ['Brewing a pour-over?'] })
        await vi.advanceTimersByTimeAsync(1300)
        expect(peek()).toBeNull()
        await vi.advanceTimersByTimeAsync(200)
        expect(peek()!.querySelector('.cm-peek-text')!.textContent).toBe('Brewing a pour-over?')
        expect(sessionStorage.getItem('ctim_shown')).toBe('true')
        // The classic bubble never shows for the redesign.
        expect(document.getElementById('chattermate-initiation')).toBeNull()
    })
})

describe('a replaced frame (reload, identify, logout)', () => {
    beforeEach(() => {
        vi.stubGlobal('requestAnimationFrame', (run: () => void) => { run(); return 0 })
    })

    it('takes the old frame\'s peek, working dot and expanded size with it', async () => {
        await upWith(V2)
        fromFrame({ type: 'WIDGET_EXPAND', expanded: true })
        fromFrame({ type: 'WIDGET_ACTIVITY', busy: true })
        fromFrame({ type: 'UNREAD_PREVIEW', text: 'Your refund is on its way', agentName: 'Ada' })
        expect(peek()!.classList.contains('show')).toBe(true)

        api().reload()
        await flush()
        expect(peek()?.classList.contains('show') ?? false).toBe(false)
        expect(button().classList.contains('cm-busy')).toBe(false)
        expect(container().classList.contains('cm-expanded')).toBe(false)
        // Still the redesign, framed for the new frame.
        expect(container().classList.contains('cm-v2')).toBe(true)
    })

    it('keeps the outgoing visitor\'s reply out of the peek while their frame closes up', async () => {
        ;(window as any).chattermateToken = tokenFor('cust-1')
        await upWith(V2)
        fromFrame({ type: 'CHAT_SESSION', sessionId: 's-9', authenticated: true, created: true })
        api().logout()
        await flush()
        fromFrame({ type: 'UNREAD_PREVIEW', text: 'Your refund is on its way', agentName: 'Ada' })
        expect(peek()).toBeNull()
    })
})

describe('the peek with the launcher hidden', () => {
    beforeEach(() => {
        vi.stubGlobal('requestAnimationFrame', (run: () => void) => { run(); return 0 })
    })

    it('never floats over nothing, and goes when the launcher is hidden', async () => {
        await upWith(V2)
        fromFrame({ type: 'UNREAD_PREVIEW', text: 'Hi', agentName: 'Ada' })
        expect(peek()!.classList.contains('show')).toBe(true)
        api().hideLauncher()
        expect(peek()!.classList.contains('show')).toBe(false)

        fromFrame({ type: 'UNREAD_PREVIEW', text: 'Hi again', agentName: 'Ada' })
        api().prompt({ message: 'Need a hand?' })
        expect(peek()?.classList.contains('show') ?? false).toBe(false)
    })
})

describe('the opening-line peek for a returning visitor', () => {
    beforeEach(() => {
        vi.stubGlobal('requestAnimationFrame', (run: () => void) => { run(); return 0 })
        localStorage.setItem(`cm_look:${WIDGET_ID}`, JSON.stringify({ chat_bubble_color: '#2F5BEA', panel: V2 }))
    })

    it('still shows when the cached look revealed the launcher straight away', async () => {
        vi.useFakeTimers()
        await loadLoader({ fakeTimers: true })
        expect(button().classList.contains('chattermate-pending')).toBe(false)
        bringUp()
        customize(V2, { chat_initiation_messages: ['Welcome back'] })
        await vi.advanceTimersByTimeAsync(1500)
        expect(peek()!.querySelector('.cm-peek-text')!.textContent).toBe('Welcome back')
    })
})
