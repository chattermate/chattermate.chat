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

import { computed, reactive, toRaw, watch, onUnmounted, type Ref } from 'vue'

/**
 * Client-side "streaming" reveal for agent/bot replies. The full message already
 * arrived over the socket; this composable reveals it character-by-character with
 * a single shared timer (no per-character re-mount) so it reads like live typing.
 *
 * Only messages flagged `stream: true` animate — history and user/system messages
 * render in full immediately. Honors `prefers-reduced-motion`.
 */

// Reveal cadence (ms) — slightly slower after spaces, matching the design comp.
const CHAR_DELAY = 13
const SPACE_DELAY = 24

interface StreamState {
    shown: number
    done: boolean
}

export function useTypewriter(messages: Ref<any[]>, onReveal?: () => void) {
    // Keyed by the message itself, not its place: history loaded above a reply,
    // or a journey step placed before it, moves it without typing it again.
    const state = reactive(new Map<object, StreamState>())
    const queue: object[] = []
    let timer: ReturnType<typeof setTimeout> | null = null

    const reduceMotion = typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scheduleNext = (delay: number) => {
        if (timer || queue.length === 0) return
        timer = setTimeout(tick, delay)
    }

    const tick = () => {
        timer = null
        const msg = queue[0] as any
        if (msg === undefined) return
        const st = state.get(msg)
        const full: string = (msg?.message ?? '') as string
        if (!st) {
            queue.shift()
            scheduleNext(0)
            return
        }
        if (st.shown >= full.length) {
            st.done = true
            queue.shift()
            scheduleNext(0)
            return
        }
        st.shown += 1
        const ch = full[st.shown - 1]
        onReveal?.()
        scheduleNext(ch === ' ' ? SPACE_DELAY : CHAR_DELAY)
    }

    // Register streamable messages the first time they appear; forget ones that left.
    watch(() => [...messages.value], (list) => {
        const present = new Set<object>(list.map(m => toRaw(m)))
        for (const key of [...state.keys()]) {
            if (!present.has(toRaw(key))) state.delete(key)
        }
        for (let i = queue.length - 1; i >= 0; i--) {
            if (!present.has(toRaw(queue[i]))) queue.splice(i, 1)
        }
        for (const m of list) {
            if (!m || !m.stream || state.has(m)) continue
            const full: string = (m.message ?? '') as string
            if (reduceMotion || !full) {
                state.set(m, { shown: full.length, done: true })
            } else {
                state.set(m, { shown: 0, done: false })
                queue.push(m)
            }
        }
        scheduleNext(0)
    }, { immediate: true })

    const at = (index: number): StreamState | undefined => {
        const msg = messages.value[index]
        return msg ? state.get(msg) : undefined
    }

    /** Visible (partial) text for a message at `index`; non-streamed → full text. */
    const displayText = (index: number, fullText: string): string => {
        const st = at(index)
        return st ? fullText.slice(0, st.shown) : fullText
    }

    /** Whether the message at `index` is still revealing (caret should show). */
    const isStreaming = (index: number): boolean => {
        const st = at(index)
        return !!st && !st.done
    }

    /** Some reply is still being revealed: what follows it waits until it's read. */
    const typing = computed(() => [...state.values()].some(st => !st.done))

    onUnmounted(() => {
        if (timer) clearTimeout(timer)
    })

    return { displayText, isStreaming, typing }
}
