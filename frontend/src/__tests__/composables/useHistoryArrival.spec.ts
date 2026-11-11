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
import { HISTORY_WAIT_MS, useHistoryArrival } from '@/composables/useHistoryArrival'

let scope: EffectScope | null = null

const setup = () => {
    const loadingHistory = ref(false)
    const messages = ref<unknown[]>([])
    scope = effectScope()
    const arrival = scope.run(() => useHistoryArrival(loadingHistory, messages))!
    /** What the socket does: the flag blinks in one tick while the request goes out. */
    const requestHistory = () => {
        loadingHistory.value = true
        loadingHistory.value = false
    }
    return { loadingHistory, messages, requestHistory, ...arrival }
}

describe('useHistoryArrival', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => {
        scope?.stop()
        scope = null
        vi.useRealTimers()
    })

    it('waits for nothing when no history was asked for', async () => {
        const history = setup()
        history.messages.value = []
        await nextTick()
        expect(history.awaitingHistory.value).toBe(false)
    })

    it('waits from the request until the answer replaces the list', async () => {
        const history = setup()
        history.requestHistory()
        expect(history.awaitingHistory.value).toBe(true)
        history.messages.value = [{ message: 'earlier' }]
        await nextTick()
        expect(history.awaitingHistory.value).toBe(false)
    })

    it('counts an empty answer as an answer', async () => {
        const history = setup()
        history.requestHistory()
        history.messages.value = []
        await nextTick()
        expect(history.awaitingHistory.value).toBe(false)
    })

    it('stops waiting for a server that never answers', async () => {
        const history = setup()
        history.requestHistory()
        await vi.advanceTimersByTimeAsync(HISTORY_WAIT_MS - 1)
        expect(history.awaitingHistory.value).toBe(true)
        await vi.advanceTimersByTimeAsync(1)
        expect(history.awaitingHistory.value).toBe(false)
    })

    it('waits only once per page', async () => {
        const history = setup()
        history.requestHistory()
        history.messages.value = []
        await nextTick()
        history.requestHistory()
        expect(history.awaitingHistory.value).toBe(false)
    })
})
