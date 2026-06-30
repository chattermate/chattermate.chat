import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Tracks unread agent/bot messages that arrive while the widget is minimized and
 * reports the running count to the embedder (which renders it on the launcher
 * badge). The embedder drives visibility via `WIDGET_VISIBILITY` messages and
 * shows the nudge count until the chat is first opened, then this unread count.
 */
export function useUnreadBadge(messages: Ref<any[]>) {
    const visible = ref(true)
    let unread = 0

    const post = () => {
        window.parent.postMessage({ type: 'UNREAD_COUNT', count: unread }, '*')
    }

    const onMessage = (e: MessageEvent) => {
        if (e?.data?.type !== 'WIDGET_VISIBILITY') return
        visible.value = !!e.data.open
        // Opening the chat clears the unread count.
        if (visible.value && unread !== 0) {
            unread = 0
            post()
        }
    }

    // Count agent/bot replies that land while the chat is closed.
    watch(() => messages.value.length, (len, prev) => {
        if (len <= (prev ?? 0) || visible.value) return
        const m = messages.value[len - 1]
        if (m && (m.message_type === 'bot' || m.message_type === 'agent')) {
            unread += 1
            post()
        }
    })

    onMounted(() => window.addEventListener('message', onMessage))
    onUnmounted(() => window.removeEventListener('message', onMessage))
}
