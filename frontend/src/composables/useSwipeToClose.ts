/*
 * Copyright 2024-2026 ChatterMate
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { onScopeDispose, toValue, type MaybeRefOrGetter } from 'vue'
import { postToHost } from '../webclient/host-bridge'

/**
 * Swipe down to close, on a phone: a touch drag on the header (and its grabber)
 * tells the loader how far the finger moved (WIDGET_DRAG {dy}), and the loader
 * moves the whole panel with it; on release it closes or springs back
 * (loader/panelHost.js decides, past DRAG_CLOSE_PX or on a flick).
 *
 * Distances are measured on the screen, not in the frame: the frame moves with the
 * panel, so the finger's position inside it would lag behind by the drag itself.
 */

/** A drag starts once the finger moved this far, mostly downwards. */
export const DRAG_START_PX = 8
/** Downward speed, px per ms, that closes the panel however short the drag. */
export const FLICK_PX_PER_MS = 0.5
/** How long after a drag a click is taken for the drag's own (phones send it late). */
export const CLICK_GUARD_MS = 400

interface Drag {
    id: number
    startY: number
    startX: number
    dragging: boolean
    // The last two samples, for the release speed
    lastY: number
    lastT: number
    prevY: number
    prevT: number
}

export interface SwipeToClose {
    onPointerDown: (event: PointerEvent) => void
}

/**
 * `enabled`: the loader said the panel can be swiped away (HOST_CAPABILITIES.swipe).
 * Bind onPointerDown to the header; moves and the release are followed on the
 * frame's window, so a finger that leaves the header keeps dragging.
 */
export function useSwipeToClose(enabled: MaybeRefOrGetter<boolean>, win: Window = window): SwipeToClose {
    let drag: Drag | null = null
    let frame = 0
    let pendingDy = 0
    let clicksBlockedUntil = 0

    const post = (dy: number, end = false, flick = false) =>
        postToHost(end ? { type: 'WIDGET_DRAG', dy, end: true, flick } : { type: 'WIDGET_DRAG', dy })

    // At most one move per animation frame reaches the page.
    const postMove = (dy: number) => {
        pendingDy = dy
        if (frame) return
        frame = win.requestAnimationFrame(() => {
            frame = 0
            if (drag?.dragging) post(pendingDy)
        })
    }

    const stopListening = () => {
        win.removeEventListener('pointermove', onMove)
        win.removeEventListener('pointerup', onEnd)
        win.removeEventListener('pointercancel', onCancel)
        win.removeEventListener('lostpointercapture', onCancel)
    }

    // A tap that turned into a drag must not also press the button it started on:
    // any click shortly after a drag is the drag's.
    const onClick = (event: Event) => {
        if (win.performance.now() >= clicksBlockedUntil) return
        event.stopPropagation()
        event.preventDefault()
    }
    win.addEventListener('click', onClick, { capture: true })

    // Let go of a drag whose release will never come (the header went away, or a
    // new touch began): the panel springs back.
    const abandon = () => {
        if (drag?.dragging) post(0, true)
        drag = null
        stopListening()
    }

    function onMove(event: PointerEvent) {
        if (!drag || event.pointerId !== drag.id) return
        const dy = event.screenY - drag.startY
        if (!drag.dragging) {
            const dx = Math.abs(event.screenX - drag.startX)
            if (dy < DRAG_START_PX || dy < dx) return
            drag.dragging = true
            // Measured from here on, so the panel doesn't jump the slop
            drag.startY += DRAG_START_PX
        }
        drag.prevY = drag.lastY
        drag.prevT = drag.lastT
        drag.lastY = event.screenY
        drag.lastT = event.timeStamp
        event.preventDefault()
        postMove(Math.max(0, event.screenY - drag.startY))
    }

    function finish(event: PointerEvent, cancelled: boolean) {
        if (!drag || event.pointerId !== drag.id) return
        const { dragging, startY, prevY, prevT } = drag
        drag = null
        stopListening()
        if (!dragging) return
        const dy = cancelled ? 0 : Math.max(0, event.screenY - startY)
        const elapsed = event.timeStamp - prevT
        const speed = elapsed > 0 ? (event.screenY - prevY) / elapsed : 0
        post(dy, true, !cancelled && speed >= FLICK_PX_PER_MS)
        clicksBlockedUntil = win.performance.now() + CLICK_GUARD_MS
    }

    function onEnd(event: PointerEvent) {
        finish(event, false)
    }

    function onCancel(event: PointerEvent) {
        finish(event, true)
    }

    function onPointerDown(event: PointerEvent) {
        if (!toValue(enabled) || event.pointerType !== 'touch') return
        if (drag) abandon()
        drag = {
            id: event.pointerId, startY: event.screenY, startX: event.screenX, dragging: false,
            lastY: event.screenY, lastT: event.timeStamp, prevY: event.screenY, prevT: event.timeStamp,
        }
        win.addEventListener('pointermove', onMove, { passive: false })
        win.addEventListener('pointerup', onEnd)
        win.addEventListener('pointercancel', onCancel)
        // Keep the finger's events coming even if the element under it goes away;
        // losing them anyway ends the drag.
        const target = event.currentTarget as Element | null
        try {
            target?.setPointerCapture?.(event.pointerId)
        } catch {
            // An already released pointer: the window listeners still follow it
        }
        win.addEventListener('lostpointercapture', onCancel)
    }

    onScopeDispose(() => {
        if (frame) win.cancelAnimationFrame(frame)
        abandon()
        win.removeEventListener('click', onClick, { capture: true })
    })

    return { onPointerDown }
}
