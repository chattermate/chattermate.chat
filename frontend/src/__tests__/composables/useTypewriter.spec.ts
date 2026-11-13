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
import { effectScope, nextTick, ref } from 'vue'
import { useTypewriter } from '@/composables/useTypewriter'

const run = (byWord: boolean) => {
    const messages = ref<any[]>([])
    const scope = effectScope()
    const typewriter = scope.run(() => useTypewriter(messages, undefined, { byWord: () => byWord }))!
    return { messages, typewriter, stop: () => scope.stop() }
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('useTypewriter', () => {
    it('reveals a live reply a word at a time for the redesigned panel', async () => {
        const { messages, typewriter, stop } = run(true)
        messages.value = [{ message: 'Returns are free', stream: true }]
        await nextTick()
        vi.advanceTimersByTime(0)
        expect(typewriter.displayText(0, 'Returns are free')).toBe('Returns')
        vi.advanceTimersByTime(42)
        expect(typewriter.displayText(0, 'Returns are free')).toBe('Returns are')
        vi.advanceTimersByTime(42 * 3)
        expect(typewriter.displayText(0, 'Returns are free')).toBe('Returns are free')
        expect(typewriter.isStreaming(0)).toBe(false)
        stop()
    })

    it('reveals a character at a time for the classic widget', async () => {
        const { messages, typewriter, stop } = run(false)
        messages.value = [{ message: 'Hi there', stream: true }]
        await nextTick()
        vi.advanceTimersByTime(0)
        expect(typewriter.displayText(0, 'Hi there')).toBe('H')
        stop()
    })

    it('shows history in full', async () => {
        const { messages, typewriter, stop } = run(true)
        messages.value = [{ message: 'Old reply' }]
        await nextTick()
        expect(typewriter.displayText(0, 'Old reply')).toBe('Old reply')
        expect(typewriter.isStreaming(0)).toBe(false)
        stop()
    })
})
