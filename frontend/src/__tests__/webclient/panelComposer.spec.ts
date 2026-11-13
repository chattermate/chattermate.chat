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
import { nextTick, ref } from 'vue'
import type { VueWrapper } from '@vue/test-utils'
import Composer from '@/webclient/panel/Composer.vue'
import { COMPOSER_MAX_HEIGHT_PX, growToFit, isSendKey, refitOnWidthChange } from '@/webclient/panel/composer-input'
import { fakeController, mountWithController, stagedFile, type FakeController } from './panelFakeController'

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
})

const composer = (overrides: Partial<FakeController> = {}) => {
    ctrl = fakeController(overrides)
    wrapper = mountWithController(Composer, ctrl)
    return wrapper
}

const field = () => wrapper!.get('textarea')
const sendButton = () => wrapper!.get('.cm-send')

describe('the panel composer', () => {
    it('is a textarea named "Message" that keeps the classic placeholder', () => {
        composer()
        expect(field().attributes('aria-label')).toBe('Message')
        expect(field().attributes('placeholder')).toBe('Type a message...')
        expect(field().attributes('rows')).toBe('1')
    })

    it('types into the controller\'s message box', async () => {
        composer()
        await field().setValue('hello')
        expect(ctrl.newMessage.value).toBe('hello')
    })

    it('sends on Enter', async () => {
        composer({ newMessage: ref('hello') })
        await field().trigger('keydown', { key: 'Enter' })
        expect(ctrl.sendMessage).toHaveBeenCalledTimes(1)
    })

    it('keeps Shift+Enter for a new line', async () => {
        composer({ newMessage: ref('hello') })
        await field().trigger('keydown', { key: 'Enter', shiftKey: true })
        expect(ctrl.sendMessage).not.toHaveBeenCalled()
    })

    it('does not send while an input method is composing', async () => {
        composer({ newMessage: ref('ni') })
        await field().trigger('keydown', { key: 'Enter', isComposing: true })
        await field().trigger('keydown', { key: 'Enter', keyCode: 229 })
        expect(ctrl.sendMessage).not.toHaveBeenCalled()
    })

    it('enables send only for something sendable', async () => {
        composer()
        expect(sendButton().attributes('disabled')).toBeDefined()
        expect(sendButton().attributes('aria-label')).toBe('Send message')

        ctrl.newMessage.value = 'hi'
        await nextTick()
        expect(sendButton().attributes('disabled')).toBeUndefined()
        await sendButton().trigger('click')
        expect(ctrl.sendMessage).toHaveBeenCalledTimes(1)

        // No typing (not connected): no sending either.
        ctrl.canTypeMessage.value = false
        await nextTick()
        expect(sendButton().attributes('disabled')).toBeDefined()
    })

    it('lets the button send while a reply is coming, as Enter does (the controller holds it)', async () => {
        composer({ newMessage: ref('one more thing'), isMessageInputEnabled: ref(false), loading: ref(true) })
        expect(sendButton().attributes('disabled')).toBeUndefined()
        await sendButton().trigger('click')
        await field().trigger('keydown', { key: 'Enter' })
        expect(ctrl.sendMessage).toHaveBeenCalledTimes(2)
    })

    it('says when files are uploading', async () => {
        composer()
        expect(wrapper!.find('.cm-composer-note').exists()).toBe(false)
        ctrl.isUploading.value = true
        await nextTick()
        const note = wrapper!.get('.cm-composer-note')
        expect(note.attributes('role')).toBe('status')
        expect(note.text()).toBe('Uploading files...')
    })

    it('sends staged files without text', () => {
        composer({ uploadedAttachments: ref([stagedFile('a.pdf')]) })
        expect(sendButton().attributes('disabled')).toBeUndefined()
    })

    it('holds back a pasted secret and says why', async () => {
        composer({ newMessage: ref('my password is hunter2'), secretInMessage: ref(true) })
        expect(sendButton().attributes('disabled')).toBeDefined()
        expect(wrapper!.get('[role="alert"]').text()).toBe("Please don't paste passwords or keys here.")
    })

    it('turns into Stop while a reply is revealing, and Stop shows it in full', async () => {
        composer()
        ctrl.isRevealing.value = true
        await nextTick()
        expect(sendButton().attributes('aria-label')).toBe('Stop')
        expect(sendButton().attributes('disabled')).toBeUndefined()
        expect(sendButton().classes()).toContain('is-stop')
        await sendButton().trigger('click')
        expect(ctrl.skipReveal).toHaveBeenCalledTimes(1)
        expect(ctrl.sendMessage).not.toHaveBeenCalled()
    })

    it('shows the attach button only when files may be sent, and opens the picker', async () => {
        composer()
        expect(wrapper!.find('button[aria-label="Attach a file"]').exists()).toBe(false)
        // The file input is always there (the e2e page object sets files on it directly).
        expect(wrapper!.find('input[type="file"]').exists()).toBe(true)

        ctrl.canUploadMore.value = true
        await nextTick()
        const input = wrapper!.get('input[type="file"]').element as HTMLInputElement
        let opened = 0
        input.click = () => { opened++ }
        await wrapper!.get('button[aria-label="Attach a file"]').trigger('click')
        expect(opened).toBe(1)

        ctrl.isUploading.value = true
        await nextTick()
        expect(wrapper!.get('button[aria-label="Attach a file"]').attributes('disabled')).toBeDefined()
    })

    it('hands picked, pasted and dropped files to the controller while files may be sent', async () => {
        composer({ canUploadMore: ref(true) })
        await wrapper!.get('input[type="file"]').trigger('change')
        await field().trigger('paste')
        await field().trigger('dragover')
        await field().trigger('drop')
        expect(ctrl.handleFileSelect).toHaveBeenCalledTimes(1)
        expect(ctrl.handlePaste).toHaveBeenCalledTimes(1)
        expect(ctrl.handleDragOver).toHaveBeenCalledTimes(1)
        expect(ctrl.handleDrop).toHaveBeenCalledTimes(1)
    })

    it('ignores pasted and dropped files when files may not be sent', async () => {
        composer({ canUploadMore: ref(false) })
        await field().trigger('paste')
        await field().trigger('dragover')
        await field().trigger('dragleave')
        const drop = new Event('drop', { cancelable: true }) as DragEvent
        Object.defineProperty(drop, 'dataTransfer', { value: { types: ['Files'], files: [] } })
        field().element.dispatchEvent(drop)
        expect(ctrl.handlePaste).not.toHaveBeenCalled()
        expect(ctrl.handleDragOver).not.toHaveBeenCalled()
        expect(ctrl.handleDragLeave).not.toHaveBeenCalled()
        expect(ctrl.handleDrop).not.toHaveBeenCalled()
        // ...and a dropped file does not open in the frame instead of the chat.
        expect(drop.defaultPrevented).toBe(true)
    })

    it('leaves dropped text alone when files may not be sent', () => {
        composer({ canUploadMore: ref(false) })
        const drop = new Event('drop', { cancelable: true }) as DragEvent
        Object.defineProperty(drop, 'dataTransfer', { value: { types: ['text/plain'], files: [] } })
        field().element.dispatchEvent(drop)
        expect(drop.defaultPrevented).toBe(false)
    })

    it('lists staged files with a named remove button', async () => {
        composer({ uploadedAttachments: ref([stagedFile('invoice.pdf')]) })
        expect(wrapper!.get('.cm-staged').text()).toContain('invoice.pdf')
        await wrapper!.get('button[aria-label="Remove invoice.pdf"]').trigger('click')
        expect(ctrl.removeAttachment).toHaveBeenCalledWith(0)
    })

    it('refuses typing when the controller says so', () => {
        composer({ canTypeMessage: ref(false), placeholderText: ref('Connecting...') })
        expect(field().attributes('disabled')).toBeDefined()
        expect(field().attributes('placeholder')).toBe('Connecting...')
    })

    it('can be focused by the panel', () => {
        composer()
        wrapper!.vm.focus()
        expect(document.activeElement).toBe(field().element)
    })
})

describe('the composer keys and sizing', () => {
    const key = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init)

    it('sends on a plain Enter only', () => {
        expect(isSendKey(key({ key: 'Enter' }))).toBe(true)
        expect(isSendKey(key({ key: 'Enter', shiftKey: true }))).toBe(false)
        expect(isSendKey(key({ key: 'Enter', isComposing: true }))).toBe(false)
        expect(isSendKey(key({ key: 'a' }))).toBe(false)
    })

    const boxWithText = (scrollHeight: number) => {
        const box = document.createElement('textarea')
        Object.defineProperty(box, 'scrollHeight', { value: scrollHeight })
        growToFit(box)
        return box
    }

    it('grows the box to its text without a scrollbar', () => {
        const box = boxWithText(76)
        expect(box.style.height).toBe('76px')
        expect(box.style.overflowY).toBe('hidden')
        expect(() => growToFit(null)).not.toThrow()
    })

    it('stops at five lines and scrolls past them', () => {
        // Five 20px lines plus 16px of padding.
        expect(COMPOSER_MAX_HEIGHT_PX).toBe(5 * 20 + 16)
        const fiveLines = boxWithText(COMPOSER_MAX_HEIGHT_PX)
        expect(fiveLines.style.height).toBe('116px')
        expect(fiveLines.style.overflowY).toBe('hidden')
        const tenLines = boxWithText(216)
        expect(tenLines.style.height).toBe('116px')
        expect(tenLines.style.overflowY).toBe('auto')
    })
})

describe('the composer after the panel changes width', () => {
    /** A ResizeObserver the test drives: notify() is a layout change. */
    class FakeObserver {
        static last: FakeObserver | null = null
        disconnected = false
        constructor(private readonly callback: () => void) { FakeObserver.last = this }
        observe() {}
        disconnect() { this.disconnected = true }
        notify() { this.callback() }
    }

    afterEach(() => {
        vi.unstubAllGlobals()
        FakeObserver.last = null
    })

    /** A box whose placeholder wraps over more lines the narrower it is. */
    const boxAt = (start: number) => {
        const box = document.createElement('textarea')
        let width = start
        Object.defineProperty(box, 'clientWidth', { get: () => width })
        Object.defineProperty(box, 'scrollHeight', { get: () => (width < 100 ? COMPOSER_MAX_HEIGHT_PX : 36) })
        return { box, resize: (to: number) => { width = to } }
    }

    it('fits again when the box gets wider, so a narrow first load does not stay tall', () => {
        vi.stubGlobal('ResizeObserver', FakeObserver)
        const { box, resize } = boxAt(14)
        growToFit(box)
        expect(box.style.height).toBe('116px')
        refitOnWidthChange(box)
        resize(360)
        FakeObserver.last!.notify()
        expect(box.style.height).toBe('36px')
    })

    it('leaves it alone when only its height changed', () => {
        vi.stubGlobal('ResizeObserver', FakeObserver)
        const { box } = boxAt(360)
        refitOnWidthChange(box)
        box.style.height = '76px'
        FakeObserver.last!.notify()
        expect(box.style.height).toBe('76px')
    })

    it('stops watching when asked, and does nothing without ResizeObserver', () => {
        vi.stubGlobal('ResizeObserver', FakeObserver)
        const stop = refitOnWidthChange(boxAt(360).box)
        stop()
        expect(FakeObserver.last!.disconnected).toBe(true)
        vi.stubGlobal('ResizeObserver', undefined)
        expect(() => refitOnWidthChange(boxAt(360).box)()).not.toThrow()
        expect(() => refitOnWidthChange(null)()).not.toThrow()
    })

    it('stops watching when the composer goes away', () => {
        vi.stubGlobal('ResizeObserver', FakeObserver)
        composer()
        const observer = FakeObserver.last!
        expect(observer.disconnected).toBe(false)
        wrapper!.unmount()
        wrapper = undefined
        expect(observer.disconnected).toBe(true)
    })
})
