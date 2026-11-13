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
import { flushPromises, mount } from '@vue/test-utils'
import AgentPanelPreview from '@/components/agent/AgentPanelPreview.vue'
import { PREVIEW_SAMPLE_COPY } from '@/webclient/copy'

/**
 * The redesigned widget's dashboard preview, mounted for real (PanelWidget, and the
 * Ask AI palette for the Ask AI styles): it is a guest on the dashboard's page. It
 * never takes focus or scrolls the page, posts nothing to a host, and leaves the
 * dashboard's keys alone.
 */

const customization = (chat_style: string) => ({
    chat_style,
    chat_background_color: '#ffffff',
    customization_metadata: { widget_ui: { version: 2 } },
}) as never

const mountPreview = (chat_style: string) => mount(AgentPanelPreview, {
    props: {
        customization: customization(chat_style),
        agentId: 'agent-1',
        agentName: 'Ada',
        photoUrl: '',
        showBranding: true,
    },
    attachTo: document.body,
})

let dashboardField: HTMLInputElement
let posts: unknown[]
const record = (event: MessageEvent) => posts.push(event.data)

beforeEach(() => {
    vi.useFakeTimers()
    dashboardField = document.createElement('input')
    document.body.appendChild(dashboardField)
    dashboardField.focus()
    posts = []
    window.addEventListener('message', record)
    vi.spyOn(window, 'postMessage')
    vi.spyOn(window.parent, 'postMessage')
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
})
afterEach(() => {
    window.removeEventListener('message', record)
    dashboardField.remove()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe('AgentPanelPreview', () => {
    it.each(['ASK_ANYTHING', 'AURORA', 'SUNRISE'])('stays a guest on the dashboard\'s page with %s', async (style) => {
        const wrapper = mountPreview(style)
        await flushPromises()
        await vi.advanceTimersByTimeAsync(1500)

        // Rendered: the palette for the Ask AI styles, the panel with the sample otherwise.
        if (style === 'SUNRISE') expect(wrapper.text()).toContain(PREVIEW_SAMPLE_COPY.question)
        else expect(wrapper.find('.askai').exists()).toBe(true)

        // Focus stays where the dashboard put it.
        expect(document.activeElement).toBe(dashboardField)
        // Nothing went to a host page.
        await vi.advanceTimersByTimeAsync(0)
        expect(window.postMessage).not.toHaveBeenCalled()
        expect(window.parent.postMessage).not.toHaveBeenCalled()
        expect(posts).toEqual([])

        // Escape belongs to the dashboard (its dialogs, its drawers).
        const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
        document.body.dispatchEvent(escape)
        expect(escape.defaultPrevented).toBe(false)
        wrapper.unmount()
    })

    it('stays put when the style changes under it, as a style chip click does', async () => {
        const wrapper = mountPreview('SUNRISE')
        await flushPromises()
        await wrapper.setProps({ customization: customization('ASK_ANYTHING') })
        await vi.advanceTimersByTimeAsync(1500)
        expect(wrapper.find('.askai').exists()).toBe(true)
        expect(document.activeElement).toBe(dashboardField)
        expect(window.parent.postMessage).not.toHaveBeenCalled()
        wrapper.unmount()
    })
})
