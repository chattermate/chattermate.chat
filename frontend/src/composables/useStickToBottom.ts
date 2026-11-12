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

import { onMounted, onUnmounted, type Ref } from 'vue'

// Within this of the end still counts as reading the newest message.
const NEAR_BOTTOM_PX = 40

/**
 * Keeps the chat log on its newest message when the log changes size. The chat
 * can load its history while its frame is still hidden or being sized (a help
 * drawer opened from the page), and the scroll made then lands at the top. A
 * visitor who scrolled up to read stays where they are.
 */
export function useStickToBottom(container: Ref<HTMLElement | null>, scrollToBottom: () => void) {
    let atBottom = true
    let observer: ResizeObserver | null = null

    const onScroll = () => {
        const el = container.value
        // A hidden log has no size to judge by
        if (!el || el.clientHeight === 0) return
        atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX
    }

    onMounted(() => {
        const el = container.value
        if (!el || typeof ResizeObserver === 'undefined') return
        el.addEventListener('scroll', onScroll, { passive: true })
        observer = new ResizeObserver(() => { if (atBottom) scrollToBottom() })
        observer.observe(el)
    })

    onUnmounted(() => {
        observer?.disconnect()
        container.value?.removeEventListener('scroll', onScroll)
    })
}
