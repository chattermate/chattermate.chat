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
import { useSwipeToClose } from '@/composables/useSwipeToClose'

/**
 * The frame's side of swipe down to close: a touch drag on the header becomes
 * WIDGET_DRAG messages to the page, measured on the screen.
 */

let scope: EffectScope
let posted: any[]

const pointer = (type: string, screenY: number, time: number, extra: Record<string, unknown> = {}) => {
    const event = new Event(type, { cancelable: true }) as any
    Object.assign(event, { pointerId: 1, pointerType: 'touch', screenX: 100, screenY, ...extra })
    Object.defineProperty(event, 'timeStamp', { value: time })
    return event as PointerEvent
}

const setUp = (enabled = ref(true)) => {
    scope = effectScope()
    return scope.run(() => useSwipeToClose(enabled))!
}

beforeEach(() => {
    posted = []
    vi.spyOn(window.parent, 'postMessage').mockImplementation((message: any) => { posted.push(message) })
    vi.stubGlobal('requestAnimationFrame', (run: () => void) => { run(); return 0 })
})
afterEach(() => {
    scope?.stop()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe('useSwipeToClose', () => {
    it('reports a downward drag as it moves, then the release', () => {
        const swipe = setUp()
        swipe.onPointerDown(pointer('pointerdown', 300, 0))
        window.dispatchEvent(pointer('pointermove', 340, 100))
        window.dispatchEvent(pointer('pointermove', 420, 400))
        window.dispatchEvent(pointer('pointerup', 430, 600))
        expect(posted).toEqual([
            // Measured from where the drag began, past the 8px slop: no jump
            { type: 'WIDGET_DRAG', dy: 32 },
            { type: 'WIDGET_DRAG', dy: 112 },
            { type: 'WIDGET_DRAG', dy: 122, end: true, flick: false },
        ])
    })

    it('calls a fast release a flick', () => {
        const swipe = setUp()
        swipe.onPointerDown(pointer('pointerdown', 300, 0))
        window.dispatchEvent(pointer('pointermove', 320, 20))
        window.dispatchEvent(pointer('pointermove', 340, 40))
        window.dispatchEvent(pointer('pointerup', 360, 60))
        expect(posted.at(-1)).toEqual({ type: 'WIDGET_DRAG', dy: 52, end: true, flick: true })
    })

    it('leaves taps, sideways and upward moves alone', () => {
        const swipe = setUp()
        swipe.onPointerDown(pointer('pointerdown', 300, 0))
        window.dispatchEvent(pointer('pointermove', 303, 10))
        window.dispatchEvent(pointer('pointermove', 290, 20))
        window.dispatchEvent(pointer('pointermove', 320, 30, { screenX: 180 }))
        window.dispatchEvent(pointer('pointerup', 320, 40, { screenX: 180 }))
        expect(posted).toEqual([])
    })

    it('springs back when the browser takes the touch away', () => {
        const swipe = setUp()
        swipe.onPointerDown(pointer('pointerdown', 300, 0))
        window.dispatchEvent(pointer('pointermove', 400, 100))
        window.dispatchEvent(pointer('pointercancel', 400, 120))
        expect(posted.at(-1)).toEqual({ type: 'WIDGET_DRAG', dy: 0, end: true, flick: false })
    })

    it('does nothing for a mouse, or where the loader cannot move the panel', () => {
        const enabled = ref(false)
        const swipe = setUp(enabled)
        swipe.onPointerDown(pointer('pointerdown', 300, 0))
        window.dispatchEvent(pointer('pointermove', 400, 100))
        enabled.value = true
        swipe.onPointerDown(pointer('pointerdown', 300, 0, { pointerType: 'mouse' }))
        window.dispatchEvent(pointer('pointermove', 400, 100))
        expect(posted).toEqual([])
    })

    it('keeps the press from also clicking the button the drag started on, even a late click', () => {
        let now = 1000
        vi.spyOn(performance, 'now').mockImplementation(() => now)
        const swipe = setUp()
        const clicked = vi.fn()
        const button = document.createElement('button')
        button.addEventListener('click', clicked)
        document.body.appendChild(button)
        swipe.onPointerDown(pointer('pointerdown', 300, 0))
        window.dispatchEvent(pointer('pointermove', 400, 100))
        window.dispatchEvent(pointer('pointerup', 400, 200))
        button.click()
        now += 300
        button.click()
        expect(clicked).not.toHaveBeenCalled()
        now += 200
        button.click()
        expect(clicked).toHaveBeenCalledTimes(1)
        button.remove()
    })

    it('stops following the finger once torn down, and lets go of a drag under way', () => {
        const idle = setUp()
        idle.onPointerDown(pointer('pointerdown', 300, 0))
        scope.stop()
        window.dispatchEvent(pointer('pointermove', 400, 100))
        expect(posted).toEqual([])

        // The header goes (a workflow screen replaces it) mid-drag: the panel springs back
        const swipe = setUp()
        swipe.onPointerDown(pointer('pointerdown', 300, 0))
        window.dispatchEvent(pointer('pointermove', 400, 100))
        scope.stop()
        expect(posted.at(-1)).toEqual({ type: 'WIDGET_DRAG', dy: 0, end: true, flick: false })
        window.dispatchEvent(pointer('pointermove', 450, 150))
        expect(posted.at(-1)).toEqual({ type: 'WIDGET_DRAG', dy: 0, end: true, flick: false })
    })

    it('springs back when the finger\'s events are lost, and takes the next touch', () => {
        const swipe = setUp()
        swipe.onPointerDown(pointer('pointerdown', 300, 0))
        window.dispatchEvent(pointer('pointermove', 400, 100))
        window.dispatchEvent(pointer('lostpointercapture', 400, 110))
        expect(posted.at(-1)).toEqual({ type: 'WIDGET_DRAG', dy: 0, end: true, flick: false })

        // A drag whose release never came does not block the next one
        swipe.onPointerDown(pointer('pointerdown', 300, 200))
        window.dispatchEvent(pointer('pointermove', 400, 300))
        swipe.onPointerDown(pointer('pointerdown', 300, 400, { pointerId: 2 }))
        expect(posted.at(-1)).toEqual({ type: 'WIDGET_DRAG', dy: 0, end: true, flick: false })
        window.dispatchEvent(pointer('pointermove', 360, 500, { pointerId: 2 }))
        expect(posted.at(-1)).toEqual({ type: 'WIDGET_DRAG', dy: 52 })
    })
})
