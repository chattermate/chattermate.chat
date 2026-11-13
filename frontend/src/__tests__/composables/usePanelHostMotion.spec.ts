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
import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import {
    CASCADE_MS, EXPAND_FADE_OUT_MS, EXPAND_SETTLE_MS,
    usePanelActivity, usePanelCascade, usePanelExpand,
} from '@/composables/usePanelHostMotion'

let scope: EffectScope | null = null
const run = <T>(fn: () => T): T => {
    scope = effectScope()
    return scope.run(fn)!
}

describe('the panel side of the loader\'s motion', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.stubGlobal('requestAnimationFrame', (cb: () => void) => setTimeout(cb, 16))
    })
    afterEach(() => {
        scope?.stop()
        scope = null
        vi.unstubAllGlobals()
        vi.useRealTimers()
    })

    it('plays the open cascade for its length, restarting it on every open', async () => {
        const { cascading, play } = run(() => usePanelCascade())
        play()
        expect(cascading.value).toBe(false)
        await vi.advanceTimersByTimeAsync(16)
        expect(cascading.value).toBe(true)
        play()
        // Off for a frame, so the animations start over.
        expect(cascading.value).toBe(false)
        await vi.advanceTimersByTimeAsync(16 + CASCADE_MS)
        expect(cascading.value).toBe(false)
    })

    it('fades out, asks the loader for the other size, then fades back in', async () => {
        const post = vi.fn()
        const { expanded, resizing, toggleExpand } = run(() => usePanelExpand(post))
        toggleExpand()
        expect(resizing.value).toBe(true)
        expect(post).not.toHaveBeenCalled()
        await vi.advanceTimersByTimeAsync(EXPAND_FADE_OUT_MS)
        expect(post).toHaveBeenCalledWith({ type: 'WIDGET_EXPAND', expanded: true })
        expect(expanded.value).toBe(true)
        await vi.advanceTimersByTimeAsync(EXPAND_SETTLE_MS)
        expect(resizing.value).toBe(false)

        toggleExpand()
        await vi.advanceTimersByTimeAsync(EXPAND_FADE_OUT_MS + EXPAND_SETTLE_MS)
        expect(post).toHaveBeenLastCalledWith({ type: 'WIDGET_EXPAND', expanded: false })
    })

    it('ignores a second press while the panel is mid-resize', async () => {
        const post = vi.fn()
        const { toggleExpand } = run(() => usePanelExpand(post))
        toggleExpand()
        toggleExpand()
        await vi.advanceTimersByTimeAsync(500)
        expect(post).toHaveBeenCalledTimes(1)
    })

    it('says the panel is working only while a reply is worked on and the panel is hidden', async () => {
        const post = vi.fn()
        const loading = ref(false)
        const visible = ref(true)
        run(() => usePanelActivity(loading, visible, post))
        loading.value = true
        await nextTick()
        expect(post).not.toHaveBeenCalled()
        visible.value = false
        await nextTick()
        expect(post).toHaveBeenLastCalledWith({ type: 'WIDGET_ACTIVITY', busy: true })
        loading.value = false
        await nextTick()
        expect(post).toHaveBeenLastCalledWith({ type: 'WIDGET_ACTIVITY', busy: false })
        visible.value = true
        await nextTick()
        expect(post).toHaveBeenCalledTimes(2)
    })
})
