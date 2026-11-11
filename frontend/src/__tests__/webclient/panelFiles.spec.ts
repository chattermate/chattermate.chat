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
import AttachmentList from '@/webclient/panel/messages/AttachmentList.vue'
import StagedFiles from '@/webclient/panel/StagedFiles.vue'
import PreviewModal from '@/webclient/panel/PreviewModal.vue'
import { fakeController, mountWithController, stagedFile, type FakeController } from './panelFakeController'

/** Files on messages, files staged in the composer, and the image preview. */

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController

afterEach(() => {
    vi.restoreAllMocks()
    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''
})

const mountPart = (component: any, overrides: Partial<FakeController> = {}, props: Record<string, unknown> = {}) => {
    ctrl = fakeController(overrides)
    wrapper = mountWithController(component, ctrl, props)
    return wrapper
}

const ATTACHMENTS = [
    { id: 1, filename: 'shot.png', file_url: 'f/1', content_type: 'image/png', file_size: 12 },
    { id: 2, filename: 'invoice.pdf', file_url: 'f/2', content_type: 'application/pdf', file_size: 30 },
]

describe('files on a message', () => {
    it('shows images as thumbnails that open the preview, and every file as a download link', async () => {
        mountPart(AttachmentList, {}, { attachments: ATTACHMENTS })
        const thumb = wrapper!.get('button[aria-label="Preview shot.png"]')
        expect(thumb.get('img').attributes('src')).toBe('https://files.test/f/1')
        await thumb.trigger('click')
        expect(ctrl.openPreview).toHaveBeenCalledWith(expect.objectContaining({
            filename: 'shot.png', type: 'image/png', file_url: 'https://files.test/f/1',
        }))
        const links = wrapper!.findAll('a.cm-attachments__link')
        expect(links).toHaveLength(2)
        expect(links[1].attributes('href')).toBe('https://files.test/f/2')
        expect(links[1].attributes('target')).toBe('_blank')
        expect(links[1].text()).toContain('invoice.pdf (30 B)')
        // A PDF has no thumbnail.
        expect(wrapper!.findAll('button')).toHaveLength(1)
    })
})

describe('files staged in the composer', () => {
    it('shows a thumbnail for an image (opening the preview) and an icon for anything else', async () => {
        const image = { ...stagedFile('shot.png', 'image/png'), url: 'blob:1' }
        mountPart(StagedFiles, { uploadedAttachments: ref([image, stagedFile('invoice.pdf')]) })
        const items = wrapper!.findAll('li')
        expect(items).toHaveLength(2)
        expect(items[0].get('img').attributes('src')).toBe('https://files.test/blob:1')
        await items[0].get('button[aria-label="Preview shot.png"]').trigger('click')
        expect(ctrl.openPreview).toHaveBeenCalledWith(image)
        expect(items[1].find('img').exists()).toBe(false)
        expect(items[1].text()).toContain('9 B')
    })

    it('removes a file with its named button', async () => {
        mountPart(StagedFiles, { uploadedAttachments: ref([stagedFile('a.pdf'), stagedFile('b.pdf')]) })
        await wrapper!.get('button[aria-label="Remove b.pdf"]').trigger('click')
        expect(ctrl.removeAttachment).toHaveBeenCalledWith(1)
    })

    it('tells two files of the same name apart (two pasted screenshots are both image.png)', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const shot = (url: string) => ({ ...stagedFile('image.png', 'image/png'), url })
        mountPart(StagedFiles, { uploadedAttachments: ref([shot('blob:1'), shot('blob:2')]) })
        const removes = wrapper!.findAll('button[aria-label="Remove image.png"]')
        expect(removes).toHaveLength(2)
        await removes[1].trigger('click')
        expect(ctrl.removeAttachment).toHaveBeenCalledWith(1)
        expect(warn.mock.calls.some(([text]) => String(text).includes('Duplicate keys'))).toBe(false)
    })

    it('shows nothing when no file is staged', () => {
        mountPart(StagedFiles)
        expect(wrapper!.find('ul').exists()).toBe(false)
    })
})

describe('the image preview', () => {
    const FILE = { url: 'f/1', filename: 'shot.png', type: 'image/png' }

    const openPreview = async () => {
        const opener = document.createElement('button')
        document.body.appendChild(opener)
        opener.focus()
        mountPart(PreviewModal)
        ctrl.previewFile.value = FILE
        ctrl.previewModal.value = true
        await nextTick()
        await nextTick()
        return opener
    }

    it('is a modal dialog named by the file, with focus on Close', async () => {
        await openPreview()
        const dialog = wrapper!.get('[role="dialog"]')
        expect(dialog.attributes('aria-modal')).toBe('true')
        expect(dialog.attributes('aria-label')).toBe('shot.png')
        expect(dialog.get('img').attributes('src')).toBe('https://files.test/f/1')
        expect(document.activeElement).toBe(wrapper!.get('button[aria-label="Close preview"]').element)
    })

    it('closes on Escape without letting the page close the widget, and keeps Tab inside', async () => {
        await openPreview()
        const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
        wrapper!.get('[role="dialog"]').element.dispatchEvent(escape)
        expect(ctrl.closePreview).toHaveBeenCalledTimes(1)
        expect(escape.defaultPrevented).toBe(true)

        const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
        wrapper!.get('[role="dialog"]').element.dispatchEvent(tab)
        expect(tab.defaultPrevented).toBe(true)
    })

    it('closes from the backdrop and Close, not from the picture', async () => {
        await openPreview()
        await wrapper!.get('img').trigger('click')
        expect(ctrl.closePreview).not.toHaveBeenCalled()
        await wrapper!.get('.cm-preview').trigger('click')
        await wrapper!.get('button[aria-label="Close preview"]').trigger('click')
        expect(ctrl.closePreview).toHaveBeenCalledTimes(2)
    })

    it('gives focus back to what opened it', async () => {
        const opener = await openPreview()
        ctrl.previewModal.value = false
        await nextTick()
        expect(document.activeElement).toBe(opener)
    })
})
