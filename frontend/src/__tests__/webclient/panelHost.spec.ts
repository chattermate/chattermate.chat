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
    const state = { v2: true, open: false, mounted: true, expand: true }
    const config = { peekId: 'chattermate-peek', launcher: true, panelExpanded: false }
    const post = vi.fn()
    const open = vi.fn(() => { state.open = true })
    const host = createPanelHost({
        doc: document,
        config,
        button,
        container,
        isV2: () => state.v2,
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
    it('scopes the redesign\'s classes to it, and takes them off again for the classic widget', () => {
        const { host, button, container, state, config } = setUp()
        config.panelExpanded = true
        host.sync()
        expect(button.classList.contains('cm-v2')).toBe(true)
        expect(button.getAttribute('aria-controls')).toBe('chattermate-container')
        expect(container.className).toBe('cm-v2 cm-expanded')

        button.classList.add('cm-busy')
        host.show('Ada', 'Your order shipped')
        state.v2 = false
        host.sync()
        expect(button.classList.contains('cm-v2')).toBe(false)
        expect(button.classList.contains('cm-busy')).toBe(false)
        expect(button.hasAttribute('aria-controls')).toBe(false)
        expect(container.className).toBe('')
        expect(shown()).toBe(false)
    })

    it('tells the frame its capabilities once mounted, and again on a resize only when they change', () => {
        const { host, state, post } = setUp()
        state.mounted = false
        host.announce()
        expect(post).not.toHaveBeenCalled()

        state.mounted = true
        host.announce()
        expect(post).toHaveBeenLastCalledWith({ type: 'HOST_CAPABILITIES', v: 1, expand: true, backdrop: expect.any(Boolean) })
        host.announce(true)
        expect(post).toHaveBeenCalledTimes(1)
        state.expand = false
        host.announce(true)
        expect(post).toHaveBeenLastCalledWith(expect.objectContaining({ expand: false }))
        // A mounting frame is always told, changed or not.
        host.announce()
        expect(post).toHaveBeenCalledTimes(3)
    })

    it('says nothing to, and handles nothing from, a classic frame', () => {
        const { host, state, post } = setUp()
        state.v2 = false
        host.announce()
        expect(post).not.toHaveBeenCalled()
        for (const type of ['WIDGET_EXPAND', 'UNREAD_PREVIEW', 'WIDGET_ACTIVITY']) {
            expect(host.handleMessage({ type, expanded: true, text: 'Hi', busy: true }, false)).toBe(false)
        }
        expect(peek()).toBeNull()
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
