import { reactive, watch, onUnmounted, type Ref } from 'vue'

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
    // Keyed by message array index.
    const state = reactive<Record<number, StreamState>>({})
    const queue: number[] = []
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
        const idx = queue[0]
        if (idx === undefined) return

        const msg = messages.value[idx]
        const st = state[idx]
        const full: string = (msg?.message ?? '') as string

        if (!st || !msg) {
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

    // Register any newly-appended streamable messages.
    watch(() => messages.value.length, (len, prev) => {
        // The list shrank/reset (e.g. a new conversation) — clear index-keyed state
        // so old entries can't bleed onto reused indices.
        if (prev !== undefined && len < prev) {
            Object.keys(state).forEach(k => { delete state[Number(k)] })
            queue.length = 0
        }
        for (let i = prev ?? 0; i < len; i++) {
            const m = messages.value[i]
            if (!m || !m.stream || i in state) continue

            const full: string = (m.message ?? '') as string
            if (reduceMotion || !full) {
                state[i] = { shown: full.length, done: true }
            } else {
                state[i] = { shown: 0, done: false }
                queue.push(i)
            }
        }
        scheduleNext(0)
    })

    /** Visible (partial) text for a message at `index`; non-streamed → full text. */
    const displayText = (index: number, fullText: string): string => {
        const st = state[index]
        return st ? fullText.slice(0, st.shown) : fullText
    }

    /** Whether the message at `index` is still revealing (caret should show). */
    const isStreaming = (index: number): boolean => {
        const st = state[index]
        return !!st && !st.done
    }

    onUnmounted(() => {
        if (timer) clearTimeout(timer)
    })

    return { displayText, isStreaming }
}
