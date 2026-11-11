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
import { effectScope, ref, type EffectScope } from 'vue'
import { OPEN_FOCUS_DELAY_MS, usePanelVisibility } from '@/composables/usePanelVisibility'

let scope: EffectScope | null = null

/** hostVisible starts true, as in the widget (direct iframes never report it). */
const setup = () => {
    const hostVisible = ref(true)
    const hooks = { focus: vi.fn(), onHide: vi.fn(), onShow: vi.fn() }
    scope = effectScope()
    const visibility = scope.run(() => usePanelVisibility(hostVisible, hooks))!
    // What the controller does on WIDGET_VISIBILITY: set hostVisible, then report.
    const pageSays = (open: boolean) => {
        hostVisible.value = open
        visibility.report(open)
    }
    return { hostVisible, hooks, pageSays, ...visibility }
}

describe('usePanelVisibility', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => {
        scope?.stop()
        scope = null
        vi.useRealTimers()
        document.body.innerHTML = ''
    })

    it('focuses once the 520ms open motion has played, not before', async () => {
        const panel = setup()
        panel.pageSays(false)
        panel.pageSays(true)
        expect(panel.hooks.onShow).toHaveBeenCalledTimes(1)
        await vi.advanceTimersByTimeAsync(519)
        expect(panel.hooks.focus).not.toHaveBeenCalled()
        await vi.advanceTimersByTimeAsync(1)
        expect(panel.hooks.focus).toHaveBeenCalledTimes(1)
        expect(OPEN_FOCUS_DELAY_MS).toBe(520)
    })

    it('focuses on a first "open" even though the panel already counted as shown', async () => {
        const panel = setup()
        panel.pageSays(true)
        await vi.advanceTimersByTimeAsync(OPEN_FOCUS_DELAY_MS)
        expect(panel.hooks.focus).toHaveBeenCalledTimes(1)
    })

    it('ignores a repeated "open" (no second focus, no second restore)', async () => {
        const panel = setup()
        panel.pageSays(true)
        await vi.advanceTimersByTimeAsync(OPEN_FOCUS_DELAY_MS)
        panel.pageSays(true)
        await vi.advanceTimersByTimeAsync(OPEN_FOCUS_DELAY_MS)
        expect(panel.hooks.focus).toHaveBeenCalledTimes(1)
        expect(panel.hooks.onShow).toHaveBeenCalledTimes(1)
    })

    it('never takes focus on mount, without a report', async () => {
        const panel = setup()
        await vi.advanceTimersByTimeAsync(2000)
        expect(panel.hooks.focus).not.toHaveBeenCalled()
    })

    it('does not take focus from something the visitor already focused', async () => {
        const panel = setup()
        const chip = document.createElement('button')
        document.body.appendChild(chip)
        panel.pageSays(true)
        chip.focus()
        await vi.advanceTimersByTimeAsync(OPEN_FOCUS_DELAY_MS)
        expect(panel.hooks.focus).not.toHaveBeenCalled()
    })

    it('does not focus when the panel is hidden again before the delay', async () => {
        const panel = setup()
        panel.pageSays(true)
        panel.pageSays(false)
        await vi.advanceTimersByTimeAsync(2000)
        expect(panel.hooks.focus).not.toHaveBeenCalled()
        expect(panel.hooks.onHide).toHaveBeenCalledTimes(1)
    })

    it('focuses on request only while shown (a page prefill)', () => {
        const panel = setup()
        panel.pageSays(false)
        panel.focusIfShown()
        expect(panel.hooks.focus).not.toHaveBeenCalled()
        panel.hostVisible.value = true
        panel.focusIfShown()
        expect(panel.hooks.focus).toHaveBeenCalledTimes(1)
    })

    it('drops a pending focus when the panel goes away', async () => {
        const panel = setup()
        panel.pageSays(true)
        scope?.stop()
        scope = null
        await vi.advanceTimersByTimeAsync(2000)
        expect(panel.hooks.focus).not.toHaveBeenCalled()
    })
})
