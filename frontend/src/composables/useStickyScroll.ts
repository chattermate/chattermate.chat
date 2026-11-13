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

import { nextTick, onScopeDispose, ref, watch, type WatchSource } from 'vue'

/** How close to the end still counts as "at the bottom", in px. */
export const STICKY_THRESHOLD = 32

/** Whether a scroll box shows its last pixels (within the threshold). */
export const isAtBottom = (el: HTMLElement, threshold = STICKY_THRESHOLD): boolean =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= threshold

const nextFrame = (run: () => void): number =>
    typeof requestAnimationFrame === 'function' ? requestAnimationFrame(run) : (setTimeout(run, 16) as unknown as number)

const cancelFrame = (id: number) => {
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id)
    else clearTimeout(id)
}

/**
 * The message list's scrolling for the redesigned panel: it follows new content
 * only while the visitor is already at the bottom (reading older messages is never
 * interrupted), at most once per frame, and it remembers where the visitor was
 * across the widget being hidden and shown again.
 *
 * `followers` are sources whose change may add content at the end (new messages,
 * the typing indicator, a confirm card...). Content that grows by itself (an image
 * loading, a card unfolding, the composer growing) is caught by a ResizeObserver
 * on the scroll box and its content, where the browser has one.
 */
export function useStickyScroll(followers: WatchSource<unknown>[]) {
    // Bound to the scroll box in the view (ref="scroller") and to the element
    // wrapping everything inside it (ref="content").
    const scroller = ref<HTMLElement | null>(null)
    const content = ref<HTMLElement | null>(null)
    // Starts pinned: an empty list is at its bottom.
    const pinned = ref(true)
    // Something arrived below while the visitor read further up ("New messages").
    const unseen = ref(false)
    let frame: number | null = null
    let remembered: number | null = null
    // Where the list last was, by the visitor's scroll or our own.
    let lastTop = 0

    const scrollTo = (el: HTMLElement, top: number) => {
        el.scrollTop = top
        lastTop = el.scrollTop
    }

    const pinNow = () => {
        const el = scroller.value
        if (el) scrollTo(el, el.scrollHeight)
    }

    /**
     * The list scrolled: back at the bottom pins it; moving up (the visitor reading
     * back) unpins it. Nothing else does: the browser reports our own scroll a frame
     * late, and content that landed in between (a confirm card after the visitor's
     * answer) leaves that report short of the end without anyone having moved.
     */
    const onScroll = () => {
        const el = scroller.value
        if (!el) return
        if (isAtBottom(el)) pinned.value = true
        else if (el.scrollTop < lastTop) pinned.value = false
        lastTop = el.scrollTop
        if (pinned.value) unseen.value = false
    }

    /** New content: keep the end in view, but only if the visitor was there (once per frame). */
    const follow = () => {
        if (!pinned.value) {
            unseen.value = true
            return
        }
        if (frame !== null) return
        frame = nextFrame(() => {
            frame = null
            if (pinned.value) pinNow()
        })
    }

    /** Go to the end whatever the position (the visitor just sent a message). */
    const scrollToBottom = () => {
        pinned.value = true
        unseen.value = false
        nextTick(pinNow)
    }

    /** The widget is being hidden: note the position. */
    const remember = () => {
        if (scroller.value) remembered = scroller.value.scrollTop
    }

    /** The widget is shown again: put the visitor back where they were. */
    const restore = () => {
        const el = scroller.value
        if (!el || remembered === null) return
        if (pinned.value) pinNow()
        else scrollTo(el, remembered)
        remembered = null
    }

    watch(followers, () => nextTick(follow))
    // A newly bound box starts from wherever it is.
    watch(scroller, (el) => { lastTop = el?.scrollTop ?? 0 }, { flush: 'sync' })

    // Either box changing size may move the end out of view.
    let sizes: ResizeObserver | null = null
    const observeSizes = () => {
        sizes?.disconnect()
        sizes = null
        if (typeof ResizeObserver === 'undefined') return
        sizes = new ResizeObserver(() => follow())
        for (const el of [scroller.value, content.value]) if (el) sizes.observe(el)
    }
    watch([scroller, content], observeSizes, { flush: 'post' })

    onScopeDispose(() => {
        if (frame !== null) cancelFrame(frame)
        sizes?.disconnect()
    })

    return { scroller, content, pinned, unseen, onScroll, follow, scrollToBottom, remember, restore }
}
