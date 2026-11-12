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
import panelSource from '@/webclient/panel/PanelWidget.vue?raw'

/**
 * The panel builds on the shared widget surface (markdown resets, message rows,
 * the header name). It was only ever imported by the original widget, so retiring
 * that left a one-line "Hi" bubble 70px tall: guarded here, since tests load no CSS.
 */
describe('the panel\'s stylesheets', () => {
    const imports = [...panelSource.matchAll(/^import '([^']+\.css)'/gm)].map(m => m[1])

    it('loads the shared widget surface first, then its own', () => {
        expect(imports[0]).toBe('../widget-surface.css')
        expect(imports).toContain('../widget-panel-messages.css')
    })
})
