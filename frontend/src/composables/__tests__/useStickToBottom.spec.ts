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
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { useStickToBottom } from '../useStickToBottom'

/**
 * A chat log built while its frame was hidden scrolled when it had no size, so
 * it opens at the top of the history unless it follows the next size change.
 */

let resized: () => void = () => {}

class FakeResizeObserver {
    constructor(callback: () => void) { resized = callback }
    observe() {}
    disconnect() {}
}

const mountLog = () => {
    const scrollToBottom = vi.fn()
    const log = ref<HTMLElement | null>(null)
    const wrapper = mount(defineComponent({
        setup() {
            useStickToBottom(log, scrollToBottom)
            return () => h('div', { ref: log })
        },
    }), { attachTo: document.body })
    const el = log.value as HTMLElement
    const size = (scrollHeight: number, clientHeight: number, scrollTop: number) => {
        Object.defineProperty(el, 'scrollHeight', { configurable: true, value: scrollHeight })
        Object.defineProperty(el, 'clientHeight', { configurable: true, value: clientHeight })
        Object.defineProperty(el, 'scrollTop', { configurable: true, writable: true, value: scrollTop })
    }
    return { wrapper, el, size, scrollToBottom }
}

describe('useStickToBottom', () => {
    beforeEach(() => vi.stubGlobal('ResizeObserver', FakeResizeObserver))
    afterEach(() => vi.unstubAllGlobals())

    it('goes to the newest message when a log built hidden is shown', () => {
        const { wrapper, size, scrollToBottom } = mountLog()
        size(2000, 0, 0)
        size(2000, 800, 0)
        resized()
        expect(scrollToBottom).toHaveBeenCalledTimes(1)
        wrapper.unmount()
    })

    it('leaves a visitor who scrolled up to read where they are', () => {
        const { wrapper, el, size, scrollToBottom } = mountLog()
        size(2000, 800, 300)
        el.dispatchEvent(new Event('scroll'))
        resized()
        expect(scrollToBottom).not.toHaveBeenCalled()

        // Back at the end: it follows again
        size(2000, 800, 1190)
        el.dispatchEvent(new Event('scroll'))
        resized()
        expect(scrollToBottom).toHaveBeenCalledTimes(1)
        wrapper.unmount()
    })

    it('stops listening once the chat is gone', () => {
        const { wrapper, el } = mountLog()
        const removed = vi.spyOn(el, 'removeEventListener')
        wrapper.unmount()
        expect(removed).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('ignores scrolling while the log is hidden', () => {
        const { wrapper, el, size, scrollToBottom } = mountLog()
        size(2000, 0, 0)
        el.dispatchEvent(new Event('scroll'))
        resized()
        expect(scrollToBottom).toHaveBeenCalledTimes(1)
        wrapper.unmount()
    })
})
