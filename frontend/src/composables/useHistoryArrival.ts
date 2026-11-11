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

import { computed, onScopeDispose, ref, watch, type Ref } from 'vue'

/** How long the start state waits for a history answer before showing anyway. */
export const HISTORY_WAIT_MS = 3000

/**
 * Whether the conversation's history was asked for and has not answered yet, so
 * a returning visitor does not see the empty start state flash before their
 * messages. The socket's loadingHistory only blinks true while the request goes
 * out (the answer arrives later as a fresh messages list), so a request is noticed
 * synchronously and the answer is the list being replaced. A visitor whose history
 * was never asked for waits for nothing; a server that never answers is waited for
 * at most HISTORY_WAIT_MS.
 */
export function useHistoryArrival(loadingHistory: Readonly<Ref<boolean>>, messages: Readonly<Ref<unknown[]>>) {
    const requested = ref(false)
    const answered = ref(false)
    let timer: ReturnType<typeof setTimeout> | null = null

    const stopWaiting = () => {
        if (timer) clearTimeout(timer)
        timer = null
    }

    watch(loadingHistory, (loading) => {
        if (!loading || requested.value) return
        requested.value = true
        timer = setTimeout(() => { answered.value = true }, HISTORY_WAIT_MS)
    }, { flush: 'sync' })

    // Replaced, not pushed to: the history answer (or a new chat's reset).
    watch(messages, () => {
        if (!requested.value) return
        answered.value = true
        stopWaiting()
    })

    onScopeDispose(stopWaiting)

    const awaitingHistory = computed(() => requested.value && !answered.value)
    return { awaitingHistory }
}
