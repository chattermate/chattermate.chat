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

import { onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * The redesigned panel's side of the embed loader's motion: the open cascade, the
 * expand (the loader resizes; the panel fades around it, since size never
 * animates) and the working dot on the launcher while the panel is hidden.
 */

/** How long the open cascade runs: header, body and composer 40ms apart, plus the rise. */
export const CASCADE_MS = 700
/** The panel fades out this fast before the loader resizes it... */
export const EXPAND_FADE_OUT_MS = 90
/** ...and comes back once the new size has had a frame to apply (the fade in is CSS, 180ms). */
export const EXPAND_SETTLE_MS = 40

type Post = (message: Record<string, unknown>) => void

/** The open cascade: on while it plays, restarted by every open. */
export function usePanelCascade() {
    const cascading = ref(false)
    let timer: ReturnType<typeof setTimeout> | null = null

    const play = () => {
        if (timer) clearTimeout(timer)
        // Off for a frame first, so a second open restarts the animations.
        cascading.value = false
        requestAnimationFrame(() => {
            cascading.value = true
            timer = setTimeout(() => { cascading.value = false }, CASCADE_MS)
        })
    }

    onScopeDispose(() => { if (timer) clearTimeout(timer) })
    return { cascading, play }
}

/** The header's expand: fade out, ask the loader for the other size, fade back in. */
export function usePanelExpand(post: Post) {
    const expanded = ref(false)
    const resizing = ref(false)
    const timers: ReturnType<typeof setTimeout>[] = []

    const toggleExpand = () => {
        if (resizing.value) return
        resizing.value = true
        timers.push(setTimeout(() => {
            expanded.value = !expanded.value
            post({ type: 'WIDGET_EXPAND', expanded: expanded.value })
            timers.push(setTimeout(() => { resizing.value = false }, EXPAND_SETTLE_MS))
        }, EXPAND_FADE_OUT_MS))
    }

    onScopeDispose(() => timers.forEach(clearTimeout))
    return { expanded, resizing, toggleExpand }
}

/** Tells the loader when a reply is being worked on while the panel is hidden. */
export function usePanelActivity(loading: Readonly<Ref<boolean>>, hostVisible: Readonly<Ref<boolean>>, post: Post) {
    let last = false
    watch([loading, hostVisible], ([working, visible]) => {
        const busy = working && !visible
        if (busy === last) return
        last = busy
        post({ type: 'WIDGET_ACTIVITY', busy })
    })
}
