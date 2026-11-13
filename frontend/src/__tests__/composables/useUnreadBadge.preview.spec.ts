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

import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { PREVIEW_MAX_CHARS, previewText, useUnreadBadge, type UnreadPreview } from '@/composables/useUnreadBadge'

/** The unread preview the redesigned panel sends the loader for its peek. */

let wrapper: any
afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
})

const setup = (preview?: UnreadPreview) => {
    const messages = ref<any[]>([])
    const post = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
    wrapper = mount(defineComponent({ setup: () => { useUnreadBadge(messages, preview); return () => h('div') } }))
    // Hidden, as the loader says on load.
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'WIDGET_VISIBILITY', open: false } }))
    const previews = () => post.mock.calls.map(([m]) => m as any).filter(m => m.type === 'UNREAD_PREVIEW')
    return { messages, previews }
}

describe('the unread preview', () => {
    it('turns a reply into one line of plain text, cut to the limit', () => {
        expect(previewText('**Your order** shipped.\n\n- tracking [here](https://x.test)')).toBe('Your order shipped. tracking here')
        expect(previewText('<img src=x onerror="alert(1)">Hi')).toBe('Hi')
        const long = previewText('word '.repeat(100))
        expect(long.length).toBe(PREVIEW_MAX_CHARS)
        expect(long.endsWith('…')).toBe(true)
    })

    it('sends a reply that lands while the panel is hidden, with who it is from', async () => {
        const { messages, previews } = setup({ agentName: () => 'Ada' })
        await nextTick()
        messages.value.push({ message_type: 'bot', message: 'Your order **shipped**' })
        await nextTick()
        expect(previews()).toEqual([{ type: 'UNREAD_PREVIEW', text: 'Your order shipped', agentName: 'Ada' }])
        messages.value.push({ message_type: 'agent', message: 'Hi', agent_name: 'Priya' })
        await nextTick()
        expect(previews().at(-1).agentName).toBe('Priya')
    })

    it('sends nothing for the visitor\'s own messages, or while shown', async () => {
        const panel = setup({ agentName: () => 'Ada' })
        panel.messages.value.push({ message_type: 'user', message: 'Hi' })
        await nextTick()
        window.dispatchEvent(new MessageEvent('message', { data: { type: 'WIDGET_VISIBILITY', open: true } }))
        panel.messages.value.push({ message_type: 'bot', message: 'Hello' })
        await nextTick()
        expect(panel.previews()).toEqual([])
    })
})
