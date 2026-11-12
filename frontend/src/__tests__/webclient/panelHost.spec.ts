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
import { createPanelHost } from '@/webclient/loader/panelHost.js'

/**
 * The redesigned panel's side of the embed loader, on its own: the classes its
 * rules hang on, what it tells the frame, its messages, the peek and Escape.
 */

function setUp(overrides: Record<string, unknown> = {}) {
    const button = document.createElement('div')
    button.id = 'chattermate-button'
    const container = document.createElement('div')
    container.id = 'chattermate-container'
    container.appendChild(document.createElement('iframe'))
    document.body.append(button, container)
    const state = { open: false, mounted: true, expand: true }
    const config = { peekId: 'chattermate-peek', launcher: true, panelExpanded: false }
    const post = vi.fn()
    const open = vi.fn(() => { state.open = true })
    const host = createPanelHost({
        doc: document,
        config,
        button,
        container,
        isOpen: () => state.open,
        open,
        post,
        canAnnounce: () => state.mounted,
        canExpand: () => state.expand,
        ...overrides,
    })
    return { host, button, container, state, config, post, open }
}

const peek = () => document.getElementById('chattermate-peek')
const shown = () => !!peek()?.classList.contains('show')

beforeEach(() => {
    document.body.innerHTML = ''
    vi.stubGlobal('requestAnimationFrame', (run: () => void) => { run(); return 0 })
})
afterEach(() => {
    vi.unstubAllGlobals()
})

describe('createPanelHost', () => {
    it('scopes the panel\'s classes to the launcher and the container', () => {
        const { host, button, container, config } = setUp()
        config.panelExpanded = true
        host.sync()
        expect(button.classList.contains('cm-v2')).toBe(true)
        expect(button.getAttribute('aria-controls')).toBe('chattermate-container')
        expect(container.className).toBe('cm-v2 cm-expanded')
        config.panelExpanded = false
        host.sync()
        expect(container.className).toBe('cm-v2')
    })

    it('tells the frame its capabilities once mounted, and again on a resize only when they change', () => {
        const { host, state, post } = setUp()
        state.mounted = false
        host.announce()
        expect(post).not.toHaveBeenCalled()

        state.mounted = true
        host.announce()
        expect(post).toHaveBeenLastCalledWith({ type: 'HOST_CAPABILITIES', v: 1, expand: true, backdrop: expect.any(Boolean), navigate: true, swipe: false })
        host.announce(true)
        expect(post).toHaveBeenCalledTimes(1)
        state.expand = false
        host.announce(true)
        expect(post).toHaveBeenLastCalledWith(expect.objectContaining({ expand: false }))
        // A mounting frame is always told, changed or not.
        host.announce()
        expect(post).toHaveBeenCalledTimes(3)
    })

    it('opens a same-site link from an answer in the page, and nothing else', () => {
        const { host } = setUp()
        const assign = vi.fn()
        const fakeWindow = { location: { href: 'https://shop.example/cart', origin: 'https://shop.example', assign } }
        const navigator = createPanelHost({
            doc: { ...document, defaultView: fakeWindow, getElementById: () => null } as unknown as Document,
            config: { peekId: 'p', launcher: true, panelExpanded: false },
            button: document.createElement('div'),
            container: document.createElement('div'),
            isOpen: () => true, open: vi.fn(), post: vi.fn(),
            canAnnounce: () => true, canExpand: () => true,
        })
        expect(navigator.handleMessage({ type: 'NAVIGATE', url: 'https://shop.example/returns' })).toBe(true)
        expect(assign).toHaveBeenCalledWith('https://shop.example/returns')
        for (const url of ['https://evil.example/x', 'javascript:alert(1)', 'data:text/html,hi', 42]) {
            navigator.handleMessage({ type: 'NAVIGATE', url })
        }
        expect(assign).toHaveBeenCalledTimes(1)
        expect(navigator.navigate('/help/returns')).toBe(true)
        expect(assign).toHaveBeenLastCalledWith('https://shop.example/help/returns')
        expect(host.handleMessage({ type: 'NAVIGATE' })).toBe(true)
    })

    it('holds the page still under the panel on a phone, and gives its scroll back', () => {
        document.body.style.overflow = 'auto'
        const phone = { value: true }
        const { host, state } = setUp({ isPhone: () => phone.value })
        state.open = true
        host.toggled(true)
        expect(document.documentElement.style.overflow).toBe('hidden')
        expect(document.body.style.overflow).toBe('hidden')
        host.toggled(false)
        expect(document.body.style.overflow).toBe('auto')
        expect(document.documentElement.style.overflow).toBe('')

        phone.value = false
        host.toggled(true)
        expect(document.body.style.overflow).toBe('auto')
        phone.value = true
        host.toggled(true)
        // A frame swapped while the panel is open keeps the page still
        host.reset()
        expect(document.body.style.overflow).toBe('hidden')
        host.destroy()
        expect(document.body.style.overflow).toBe('auto')
    })

    it('keeps an outgoing visitor\'s reply out of the peek', () => {
        const { host } = setUp()
        expect(host.handleMessage({ type: 'UNREAD_PREVIEW', text: 'Your refund is on its way', agentName: 'Ada' }, true)).toBe(true)
        expect(peek()).toBeNull()
    })

    it('shows the peek only while closed, with the launcher there to point at', () => {
        const { host, state, config } = setUp()
        config.launcher = false
        expect(host.show('', 'Hi')).toBe(false)
        config.launcher = true
        state.open = true
        expect(host.show('', 'Hi')).toBe(false)
        state.open = false
        expect(host.show('', '')).toBe(false)
        expect(host.show('', 'Hi')).toBe(true)
        expect(shown()).toBe(true)

        // Hiding the launcher takes the peek with it.
        config.launcher = false
        host.sync()
        expect(shown()).toBe(false)
    })

    it('opens the panel from the peek, and hides the peek as the panel opens', () => {
        const { host, open } = setUp()
        host.show('Ada', 'Hi')
        ;(peek()!.querySelector('.cm-peek-body') as HTMLButtonElement).click()
        expect(open).toHaveBeenCalledTimes(1)

        host.show('Ada', 'Hi again')
        host.toggled(true)
        expect(shown()).toBe(false)
    })

    it('closes on Escape on the page only while focus is the widget\'s, or nobody\'s', () => {
        const { host, button, container } = setUp()
        const siteDialog = document.createElement('input')
        document.body.appendChild(siteDialog)
        button.tabIndex = 0

        ;(document.activeElement as HTMLElement | null)?.blur()
        expect(host.ownsEscape()).toBe(true)
        siteDialog.focus()
        expect(host.ownsEscape()).toBe(false)
        button.focus()
        expect(host.ownsEscape()).toBe(true)
        ;(container.querySelector('iframe') as HTMLIFrameElement).focus()
        expect(host.ownsEscape()).toBe(true)
    })

    it('forgets the old frame\'s peek, working dot and size on reset', () => {
        const { host, button, container, config, state, post } = setUp()
        host.announce()
        host.handleMessage({ type: 'WIDGET_EXPAND', expanded: true }, false)
        host.handleMessage({ type: 'WIDGET_ACTIVITY', busy: true }, false)
        host.show('Ada', 'Hi')
        expect(container.classList.contains('cm-expanded')).toBe(true)
        expect(button.classList.contains('cm-busy')).toBe(true)

        host.reset()
        expect(config.panelExpanded).toBe(false)
        expect(container.classList.contains('cm-expanded')).toBe(false)
        expect(button.classList.contains('cm-busy')).toBe(false)
        expect(shown()).toBe(false)
        // The next frame is told its capabilities afresh, even unchanged.
        state.mounted = true
        host.announce(true)
        expect(post).toHaveBeenCalledTimes(2)
    })

    it('does nothing once destroyed, so a late timer can\'t bring a peek back', () => {
        const { host } = setUp()
        host.show('', 'Hi')
        host.destroy()
        expect(peek()).toBeNull()
        expect(host.show('', 'Hi')).toBe(false)
        expect(peek()).toBeNull()
    })
})

describe('swipe down to close on a phone', () => {
    const phone = (open = true) => {
        const close = vi.fn()
        const env = setUp({ isPhone: () => true, close })
        env.state.open = open
        return { ...env, close }
    }

    afterEach(() => vi.useRealTimers())

    it('is offered to the frame on a phone only', () => {
        const { host, post } = phone()
        host.announce()
        expect(post).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'HOST_CAPABILITIES', swipe: true }))
        const desktop = setUp({ isPhone: () => false })
        desktop.host.announce()
        expect(desktop.post).toHaveBeenLastCalledWith(expect.objectContaining({ swipe: false }))
    })

    it('moves the panel with the finger, never above where it sits', () => {
        const { host, container } = phone()
        expect(host.handleMessage({ type: 'WIDGET_DRAG', dy: 64.4 }, false)).toBe(true)
        expect(container.style.transform).toBe('translateY(64px)')
        expect(container.style.transition).toBe('none')
        host.handleMessage({ type: 'WIDGET_DRAG', dy: -40 }, false)
        expect(container.style.transform).toBe('translateY(0px)')
    })

    it('closes past 120px, sliding down from where the finger let go', () => {
        vi.useFakeTimers()
        const { host, container, close } = phone()
        host.handleMessage({ type: 'WIDGET_DRAG', dy: 140 }, false)
        host.handleMessage({ type: 'WIDGET_DRAG', dy: 140, end: true }, false)
        expect(close).toHaveBeenCalledTimes(1)
        expect(container.style.transform).toBe('translateY(100%)')
        vi.advanceTimersByTime(400)
        expect(container.style.transform).toBe('')
        expect(container.style.transition).toBe('')
    })

    it('closes on a flick however short, and springs back otherwise', () => {
        vi.useFakeTimers()
        const flicked = phone()
        flicked.host.handleMessage({ type: 'WIDGET_DRAG', dy: 30, end: true, flick: true }, false)
        expect(flicked.close).toHaveBeenCalledTimes(1)

        const held = phone()
        held.host.handleMessage({ type: 'WIDGET_DRAG', dy: 80 }, false)
        held.host.handleMessage({ type: 'WIDGET_DRAG', dy: 80, end: true }, false)
        expect(held.close).not.toHaveBeenCalled()
        expect(held.container.style.transform).toBe('')
        expect(held.container.style.transition).toContain('transform')
        vi.advanceTimersByTime(400)
        expect(held.container.style.transition).toBe('')
    })

    it('ignores a drag while closed, off a phone, or with a dy that is not a number', () => {
        const closed = phone(false)
        closed.host.handleMessage({ type: 'WIDGET_DRAG', dy: 200, end: true }, false)
        expect(closed.close).not.toHaveBeenCalled()
        expect(closed.container.style.transform).toBe('')

        const close = vi.fn()
        const desktop = setUp({ isPhone: () => false, close })
        desktop.state.open = true
        desktop.host.handleMessage({ type: 'WIDGET_DRAG', dy: 200, end: true }, false)
        expect(close).not.toHaveBeenCalled()

        const odd = phone()
        odd.host.handleMessage({ type: 'WIDGET_DRAG', dy: 'calc(100vh)' }, false)
        expect(odd.container.style.transform).toBe('translateY(0px)')
    })

    it('lets the swipe\'s close finish when another touch comes in meanwhile', () => {
        vi.useFakeTimers()
        const { host, container, state } = phone()
        host.handleMessage({ type: 'WIDGET_DRAG', dy: 150, end: true }, false)
        state.open = false
        host.handleMessage({ type: 'WIDGET_DRAG', dy: 20 }, false)
        expect(container.style.transform).toBe('translateY(100%)')
        vi.advanceTimersByTime(400)
        expect(container.style.transform).toBe('')
    })

    it('lets go of a half-finished drag when the frame is replaced', () => {
        const { host, container } = phone()
        host.handleMessage({ type: 'WIDGET_DRAG', dy: 50 }, false)
        host.reset()
        expect(container.style.transform).toBe('')
    })
})
