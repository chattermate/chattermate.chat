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
import { isAtBottom, useStickyScroll } from '@/composables/useStickyScroll'

/** A scroll box 400px tall showing `scrollTop` of `scrollHeight`. */
const makeBox = (scrollHeight = 1000, scrollTop = 600) =>
    ({ scrollHeight, scrollTop, clientHeight: 400 }) as unknown as HTMLElement & { scrollTop: number; scrollHeight: number }

let scope: EffectScope | null = null

const setup = () => {
    const count = ref(0)
    const typing = ref(false)
    scope = effectScope()
    const sticky = scope.run(() => useStickyScroll([count, typing]))!
    const box = makeBox()
    sticky.scroller.value = box
    return { ...sticky, box, count, typing }
}

// The follower watch runs on a tick, then waits for a frame.
const settle = async () => {
    await nextTick()
    await nextTick()
    await vi.advanceTimersByTimeAsync(20)
}

describe('useStickyScroll', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.stubGlobal('requestAnimationFrame', (run: () => void) => setTimeout(run, 16))
        vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id))
    })
    afterEach(() => {
        scope?.stop()
        scope = null
        vi.unstubAllGlobals()
        vi.useRealTimers()
    })

    it('counts the last few pixels as the bottom', () => {
        expect(isAtBottom(makeBox(1000, 600))).toBe(true)
        expect(isAtBottom(makeBox(1000, 580))).toBe(true)
        expect(isAtBottom(makeBox(1000, 500))).toBe(false)
    })

    it('follows new content while the visitor is at the bottom', async () => {
        const list = setup()
        list.box.scrollHeight = 1200
        list.count.value++
        await settle()
        expect(list.box.scrollTop).toBe(1200)
    })

    it('leaves a visitor who scrolled up where they are', async () => {
        const list = setup()
        list.box.scrollTop = 100
        list.onScroll()
        expect(list.pinned.value).toBe(false)

        list.box.scrollHeight = 1200
        list.count.value++
        list.typing.value = true
        list.follow()
        await settle()

        expect(list.box.scrollTop).toBe(100)
    })

    it('starts following again once the visitor is back at the bottom', async () => {
        const list = setup()
        list.box.scrollTop = 100
        list.onScroll()
        list.box.scrollTop = 600
        list.onScroll()
        list.box.scrollHeight = 1300
        list.follow()
        await settle()
        expect(list.box.scrollTop).toBe(1300)
    })

    it('scrolls at most once per frame however often it is asked', async () => {
        const list = setup()
        const writes: number[] = []
        let top = 600
        Object.defineProperty(list.box, 'scrollTop', {
            get: () => top,
            set: (value: number) => { writes.push(value); top = value },
        })
        for (let i = 0; i < 20; i++) list.follow()
        await settle()
        expect(writes).toHaveLength(1)
    })

    it('goes to the end when the visitor sends, even from higher up', async () => {
        const list = setup()
        list.box.scrollTop = 0
        list.onScroll()
        list.scrollToBottom()
        await nextTick()
        expect(list.box.scrollTop).toBe(1000)
        expect(list.pinned.value).toBe(true)
    })

    it('puts the visitor back where they were after the widget is hidden and shown', () => {
        const list = setup()
        list.box.scrollTop = 250
        list.onScroll()
        list.remember()
        // A hidden frame can lose its scroll position.
        list.box.scrollTop = 0
        list.restore()
        expect(list.box.scrollTop).toBe(250)
    })

    it('shows the newest content on return when the visitor was at the bottom', () => {
        const list = setup()
        list.remember()
        list.box.scrollHeight = 1500
        list.box.scrollTop = 0
        list.restore()
        expect(list.box.scrollTop).toBe(1500)
    })

    it('does nothing on show without a remembered position or a list', () => {
        const list = setup()
        list.box.scrollTop = 42
        list.restore()
        expect(list.box.scrollTop).toBe(42)
        list.scroller.value = null
        expect(() => { list.remember(); list.restore(); list.follow() }).not.toThrow()
    })

    describe('content that grows by itself', () => {
        /** A ResizeObserver stand-in the test can fire. */
        const installObserver = () => {
            const observers: Array<{ callback: () => void; targets: Element[]; disconnected: boolean }> = []
            vi.stubGlobal('ResizeObserver', class {
                record: { callback: () => void; targets: Element[]; disconnected: boolean }
                constructor(callback: () => void) {
                    this.record = { callback, targets: [], disconnected: false }
                    observers.push(this.record)
                }
                observe(el: Element) { this.record.targets.push(el) }
                disconnect() { this.record.disconnected = true }
            })
            return observers
        }

        it('follows a resize while the visitor is at the bottom, and not after they scroll up', async () => {
            const observers = installObserver()
            const list = setup()
            const inner = document.createElement('div')
            list.content.value = inner
            await nextTick()
            const live = observers.filter(o => !o.disconnected)
            expect(live).toHaveLength(1)
            expect(live[0].targets).toEqual([list.box, inner])

            list.box.scrollHeight = 1400
            live[0].callback()
            await settle()
            expect(list.box.scrollTop).toBe(1400)

            list.box.scrollTop = 100
            list.onScroll()
            list.box.scrollHeight = 1800
            live[0].callback()
            await settle()
            expect(list.box.scrollTop).toBe(100)
        })

        it('stops observing when the list goes away', async () => {
            const observers = installObserver()
            const list = setup()
            await nextTick()
            scope?.stop()
            scope = null
            expect(observers.every(o => o.disconnected)).toBe(true)
            void list
        })

        it('works without ResizeObserver', async () => {
            vi.stubGlobal('ResizeObserver', undefined)
            const list = setup()
            list.content.value = document.createElement('div')
            await nextTick()
            list.box.scrollHeight = 1200
            list.count.value++
            await settle()
            expect(list.box.scrollTop).toBe(1200)
        })
    })

    describe('"New messages"', () => {
        it('is offered when something arrives while the visitor reads further up, and goes at the bottom', async () => {
            const list = setup()
            list.box.scrollTop = 100
            list.onScroll()
            expect(list.unseen.value).toBe(false)
            list.follow()
            expect(list.unseen.value).toBe(true)
            list.box.scrollTop = 600
            list.onScroll()
            expect(list.unseen.value).toBe(false)
        })

        it('goes when the visitor is taken to the end', () => {
            const list = setup()
            list.box.scrollTop = 0
            list.onScroll()
            list.follow()
            list.scrollToBottom()
            expect(list.unseen.value).toBe(false)
        })

        it('is never offered at the bottom', async () => {
            const list = setup()
            list.follow()
            await settle()
            expect(list.unseen.value).toBe(false)
        })
    })
})
