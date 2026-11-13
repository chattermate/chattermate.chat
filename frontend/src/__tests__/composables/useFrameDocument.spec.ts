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

import { describe, expect, it } from 'vitest'
import { fitFrameDocument, isWidgetFrame } from '@/composables/useFrameDocument'

const page = () => document.implementation.createHTMLDocument('frame')
const framed = { parent: {} } as unknown as Window
const topLevel = (() => { const w = {} as any; w.parent = w; return w as Window })()

describe('fitting the frame page to the panel', () => {
    it('drops the default body margin inside the widget frame', () => {
        const doc = page()
        fitFrameDocument(doc, framed)
        expect(doc.body.style.margin).toBe('0px')
    })

    it('leaves a top-level page (the dashboard preview) alone', () => {
        const doc = page()
        fitFrameDocument(doc, topLevel)
        expect(doc.body.style.margin).toBe('')
    })

    it('treats a parent it cannot read as a frame', () => {
        const blocked = { get parent() { throw new Error('cross-origin') } } as unknown as Window
        expect(isWidgetFrame(blocked)).toBe(true)
    })
})
