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
import { createdOnRedesign, widgetUiVersion } from '@/webclient/widget-ui'

describe('which widget design visitors get', () => {
    it('is the redesign only when the agent chose version 2', () => {
        expect(widgetUiVersion({ customization_metadata: { widget_ui: { version: 2 } } })).toBe(2)
    })

    it('is the classic widget otherwise', () => {
        expect(widgetUiVersion({ customization_metadata: { widget_ui: { version: 1 } } })).toBe(1)
        expect(widgetUiVersion({ customization_metadata: { widget_ui: { version: '2' } } })).toBe(1)
        expect(widgetUiVersion({ customization_metadata: { widget_ui: null } })).toBe(1)
        expect(widgetUiVersion({ customization_metadata: {} })).toBe(1)
        expect(widgetUiVersion({})).toBe(1)
        expect(widgetUiVersion(null)).toBe(1)
    })
})

describe('whether an agent was created on the redesign', () => {
    it('is only the server\'s created_on_ui 2', () => {
        expect(createdOnRedesign({ customization_metadata: { widget_ui: { version: 2, created_on_ui: 2 } } })).toBe(true)
        expect(createdOnRedesign({ customization_metadata: { widget_ui: { version: 2 } } })).toBe(false)
        expect(createdOnRedesign({ customization_metadata: { widget_ui: { version: 2, created_on_ui: '2' } } })).toBe(false)
        expect(createdOnRedesign({ customization_metadata: {} })).toBe(false)
        expect(createdOnRedesign(null)).toBe(false)
    })
})
