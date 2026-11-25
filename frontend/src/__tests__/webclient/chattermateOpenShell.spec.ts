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
import { api, bringUp, cleanupPage, flush, frame, fromFrame, handshake, loadLoader, resetPage } from './loaderHarness'
import { CLOSE_LABEL, SHELL_CLASS, SHELL_LABEL, createOpenShell, shellCss } from '@/webclient/loader/openShell.js'

// A visitor who opens the chat before the widget inside the frame has started sees
// the chat window's outline at once, instead of an empty window.

const container = () => document.getElementById('chattermate-container') as HTMLElement
const shell = () => container().querySelector(`.${SHELL_CLASS}`) as HTMLElement | null
const css = () => document.getElementById('chattermate-styles')?.textContent ?? ''

describe('chat window while the widget starts', () => {
  beforeEach(() => {
    resetPage()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    api()?.destroy()
    cleanupPage()
  })

  it('is not drawn while the chat is closed', async () => {
    await loadLoader()
    expect(shell()).toBeNull()
  })

  it('shows at once when the chat opens early, and says it is loading', async () => {
    await loadLoader()
    api().open()
    expect(shell()).not.toBeNull()
    expect(shell()!.getAttribute('aria-busy')).toBe('true')
    const status = shell()!.querySelector('[role="status"]')!
    expect(status.textContent).toBe(SHELL_LABEL)
    // The close button is beside the status, not read out as part of it
    expect(status.querySelector('button')).toBeNull()
  })

  it('can be closed from its own button, which hands focus back to the launcher', async () => {
    await loadLoader()
    api().open()
    const close = shell()!.querySelector('button') as HTMLButtonElement
    expect(close.getAttribute('aria-label')).toBe(CLOSE_LABEL)
    expect(close.type).toBe('button')

    close.click()
    expect(api().isOpen()).toBe(false)
    expect(shell()).toBeNull()
    expect(document.activeElement).toBe(document.getElementById('chattermate-button'))
  })

  it('goes once the widget is ready, and doesn\'t come back on reopening', async () => {
    await loadLoader()
    api().open()
    bringUp()
    expect(shell()).toBeNull()
    api().close()
    api().open()
    expect(shell()).toBeNull()
  })

  it('goes when the chat is closed early, and comes back when it reopens', async () => {
    await loadLoader()
    api().open()
    api().close()
    expect(shell()).toBeNull()
    api().open()
    expect(shell()).not.toBeNull()
  })

  it('sits beside the frame, never in place of it', async () => {
    await loadLoader()
    const theFrame = frame()
    api().open()
    expect(theFrame.parentNode).toBe(container())
    expect(container().querySelectorAll(`.${SHELL_CLASS}`)).toHaveLength(1)
  })

  it('makes way for the error card when the chat can\'t start, and comes back on the retry', async () => {
    vi.useFakeTimers()
    await loadLoader({ fakeTimers: true })
    api().open()
    expect(shell()).not.toBeNull()

    // A frame that said hello but never mounted
    handshake()
    await vi.advanceTimersByTimeAsync(20000)
    expect(document.querySelector('.chattermate-error-ui')).not.toBeNull()
    expect(shell()).toBeNull()

    // Opening again retries: a new frame, and the shell while it starts
    api().close()
    api().open()
    expect(document.querySelector('.chattermate-error-ui')).toBeNull()
    expect(shell()).not.toBeNull()
    bringUp()
    expect(shell()).toBeNull()
    vi.useRealTimers()
  })

  it('comes back over a frame that restarts itself while open', async () => {
    await loadLoader()
    api().open()
    bringUp()
    expect(shell()).toBeNull()
    handshake()
    expect(shell()).not.toBeNull()
  })

  it('a new visitor\'s frame: the chat closes, and opening it early shows the shell again', async () => {
    await loadLoader()
    api().open()
    bringUp()
    api().identify('tok-1')
    await flush()
    // identify() closes the chat while the new visitor's frame loads
    expect(shell()).toBeNull()
    api().open()
    expect(shell()).not.toBeNull()
    bringUp()
    expect(shell()).toBeNull()
  })

  it('is coloured from the dashboard\'s launcher colour', async () => {
    await loadLoader()
    handshake()
    fromFrame({ type: 'CUSTOMIZATION_UPDATE', data: { chat_bubble_color: '#2F5BEA', panel: { elevation: 'dark' } } })
    expect(css()).toMatch(/cm-shell-avatar \{[^}]*background: #2F5BEA/)
    expect(css()).toContain('background: #16141F')
  })
})

describe('createOpenShell', () => {
  it('draws once however often it is shown, and redraws into an emptied container', () => {
    const host = document.createElement('div')
    const open = createOpenShell(document, host, { onClose: () => {} })
    open.show()
    open.show()
    expect(host.querySelectorAll(`.${SHELL_CLASS}`)).toHaveLength(1)
    host.textContent = ''
    expect(open.isShown()).toBe(false)
    open.show()
    expect(host.querySelectorAll(`.${SHELL_CLASS}`)).toHaveLength(1)
    open.hide()
    expect(host.children).toHaveLength(0)
  })

  it('shows only the input row for the Ask AI palette', () => {
    expect(shellCss('c', { accent: '#000000', elevation: 'light', palette: true })).toMatch(/#c \.cm-open-shell \.cm-shell-body \{ display: none; \}/)
    expect(shellCss('c', { accent: '#000000', elevation: 'light', palette: false })).not.toContain('cm-shell-body { display: none')
  })

  it('follows the panel\'s dark elevation and holds still for reduced motion', () => {
    expect(shellCss('c', { accent: '#000000', elevation: 'dark' })).toContain('background: #16141F')
    expect(shellCss('c', { accent: '#000000', elevation: 'light' })).toContain('background: #FFFFFF')
    expect(shellCss('c', { accent: '#000000', elevation: 'light' })).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*#c \.cm-open-shell \.cm-shell-bar \{ animation: none; \}/)
  })
})
