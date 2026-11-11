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

import { describe, it, expect, afterEach } from 'vitest'
import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { useChatScroll } from '@/composables/useChatScroll'

let scope: EffectScope | null = null

const setup = () => {
    const messages = ref<unknown[]>([])
    const confirmCard = ref(false)
    const typing = ref(false)
    scope = effectScope()
    const scroll = scope.run(() => useChatScroll(messages, [confirmCard, typing]))!
    // A list taller than its box, scrolled to the top.
    const list = { scrollTop: 0, scrollHeight: 800 }
    scroll.messagesContainer.value = list as unknown as HTMLElement
    return { ...scroll, list, messages, confirmCard, typing }
}

// The watcher runs on the next tick, then scrolls on the tick after.
const settle = async () => {
    await nextTick()
    await nextTick()
}

describe('useChatScroll', () => {
    afterEach(() => {
        scope?.stop()
        scope = null
    })

    it('scrolls to the bottom when a message arrives', async () => {
        const chat = setup()
        chat.messages.value.push({ message: 'hi' })
        await settle()
        expect(chat.list.scrollTop).toBe(800)
    })

    it('scrolls when any follower turns on', async () => {
        const chat = setup()
        chat.typing.value = true
        await settle()
        expect(chat.list.scrollTop).toBe(800)
    })

    it('does not scroll when the last follower turns off', async () => {
        const chat = setup()
        chat.confirmCard.value = true
        await settle()
        chat.list.scrollTop = 0
        chat.confirmCard.value = false
        await settle()
        expect(chat.list.scrollTop).toBe(0)
    })

    it('scrolls when one turns off while another is still on', async () => {
        const chat = setup()
        chat.confirmCard.value = true
        chat.typing.value = true
        await settle()
        chat.list.scrollTop = 0
        chat.typing.value = false
        await settle()
        expect(chat.list.scrollTop).toBe(800)
    })

    it('does nothing before the list is rendered', () => {
        const chat = setup()
        chat.messagesContainer.value = null
        expect(() => chat.scrollToBottom()).not.toThrow()
    })
})
