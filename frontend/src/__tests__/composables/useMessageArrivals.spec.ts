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

import { afterEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick, reactive, ref, type EffectScope } from 'vue'
import { useMessageArrivals } from '@/composables/useMessageArrivals'

let scope: EffectScope | null = null

const setup = (initial: object[] = []) => {
    const messages = ref<object[]>(initial)
    scope = effectScope()
    const arrivals = scope.run(() => useMessageArrivals(messages))!
    return { messages, ...arrivals }
}

describe('useMessageArrivals', () => {
    afterEach(() => {
        scope?.stop()
        scope = null
    })

    it('treats what is there on first show as already seen', () => {
        const first = { message: 'only one' }
        const list = setup([first])
        expect(list.isFresh(first)).toBe(false)
    })

    it('marks a message that arrives on its own as fresh', async () => {
        const list = setup()
        list.messages.value.push({ message: 'hi' })
        await nextTick()
        expect(list.isFresh(list.messages.value[0])).toBe(true)
    })

    it('does not animate history that arrives as a batch', async () => {
        const list = setup()
        list.messages.value = [{ message: 'one' }, { message: 'two' }, { message: 'three' }]
        await nextTick()
        expect(list.messages.value.map(list.isFresh)).toEqual([false, false, false])
    })

    it('keeps a fresh message fresh when history loads above it', async () => {
        const list = setup()
        list.messages.value.push({ message: 'live' })
        await nextTick()
        list.messages.value = [{ message: 'old 1' }, { message: 'old 2' }, ...list.messages.value]
        await nextTick()
        expect(list.messages.value.map(list.isFresh)).toEqual([false, false, true])
    })

    it('knows a message by itself, through reactive proxies', async () => {
        const list = setup()
        const raw = { message: 'hello' }
        list.messages.value.push(raw)
        await nextTick()
        expect(list.isFresh(reactive(raw))).toBe(true)
        expect(list.isFresh({ message: 'hello' })).toBe(false)
    })
})
