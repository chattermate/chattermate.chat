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

import { describe, it, expect, vi, afterEach } from 'vitest'
import { createApp, nextTick, ref, type App } from 'vue'
import { useHostPrompt } from '@/composables/useHostPrompt'
import type { Message } from '@/types/chat'
import type { HostPrompt, PageChip, PendingConfirm } from '@/webclient/actions/hostActionsClient'

const chatMessage = (message: string, message_type = 'bot'): Message => ({
    message, message_type, created_at: '2026-01-01T00:00:00Z', session_id: 's1',
})

const prompt = (message: string, source: HostPrompt['source'], chips: PageChip[] = []): HostPrompt =>
    ({ message, chips, open: true, source })

let app: App | null = null

// useHostActions registers an unmount hook, so the composable runs inside a component.
const setup = (initial: Message[] = [], answersShowChoices?: () => boolean) => {
    const messages = ref<Message[]>(initial)
    const loading = ref(false)
    const revealing = ref(false)
    const sendQuickAction = vi.fn()
    let result!: ReturnType<typeof useHostPrompt>
    app = createApp({
        setup() {
            result = useHostPrompt({ messages, loading, revealing, answersShowChoices, on: vi.fn(), emit: vi.fn(), sendQuickAction })
            return () => null
        },
    })
    app.mount(document.createElement('div'))
    return { ...result, messages, loading, revealing, sendQuickAction }
}

const actionChip: PageChip = { label: 'Apply coupon', kind: 'action', value: 'apply_coupon' }

describe('useHostPrompt', () => {
    afterEach(() => {
        app?.unmount()
        app = null
    })

    it('hides a journey message that is already in the chat', () => {
        const host = setup([chatMessage('Pick a plan')])
        host.hostPrompt.value = prompt('Pick a plan', 'journey')
        expect(host.shownPrompt.value).toBeNull()
    })

    it('still shows a page message whose text is already in the chat', () => {
        const host = setup([chatMessage('Pick a plan')])
        host.hostPrompt.value = prompt('Pick a plan', 'host')
        expect(host.shownPrompt.value?.message).toBe('Pick a plan')
    })

    it('hides the message while a reply is still typing out', () => {
        const host = setup()
        host.hostPrompt.value = prompt('Need help?', 'host')
        host.revealing.value = true
        expect(host.shownPrompt.value).toBeNull()
    })

    describe('reply buttons', () => {
        const offered = (...choices: string[]): Message =>
            ({ ...chatMessage('Which size?'), attributes: { quick_replies: choices } })

        it('offers the choices the agent sent with its last reply, once it has typed out', async () => {
            const host = setup([offered('Small', 'Large')])
            host.revealing.value = true
            expect(host.replyChips.value).toEqual([])
            host.revealing.value = false
            expect(host.replyChips.value.map(c => c.label)).toEqual(['Small', 'Large'])
            expect(host.replyChips.value[0]).toEqual({ label: 'Small', kind: 'text', value: 'Small' })
        })

        it('leaves them to the answer where the view shows its choices under it (the panel)', () => {
            const host = setup([offered('Small', 'Large')], () => true)
            expect(host.replyChips.value).toEqual([])
        })

        it('retires them once anyone writes after them', () => {
            const host = setup([offered('Small', 'Large')])
            host.messages.value.push(chatMessage('Large', 'user'))
            expect(host.replyChips.value).toEqual([])
        })

        it('puts the choices before a step\'s own replies', () => {
            const host = setup([offered('Small')])
            host.hostPrompt.value = prompt('Pick a plan', 'host', [{ label: 'Basic', kind: 'text', value: 'Basic' }])
            expect(host.replyChips.value.map(c => c.label)).toEqual(['Small'])
        })

        it('hides them the moment one is tapped, until what it started has typed out', async () => {
            const host = setup([offered('Small', 'Large')])
            host.onPageChip(host.replyChips.value[0])
            expect(host.sendQuickAction).toHaveBeenCalledWith('Small')
            expect(host.replyChips.value).toEqual([])
            host.revealing.value = true
            await nextTick()
            host.revealing.value = false
            await nextTick()
            // The reply typed out with no new choices: the old ones are still the last message's
            expect(host.replyChips.value.map(c => c.label)).toEqual(['Small', 'Large'])
        })

        it('brings them back if nothing comes of a tap', async () => {
            vi.useFakeTimers()
            try {
                const host = setup([offered('Small')])
                host.onPageChip(host.replyChips.value[0])
                await nextTick()
                expect(host.replyChips.value).toEqual([])
                await vi.advanceTimersByTimeAsync(10_000)
                expect(host.replyChips.value.map(c => c.label)).toEqual(['Small'])
            } finally {
                vi.useRealTimers()
            }
        })
    })

    it('hides the message while a reply is being written', () => {
        const host = setup()
        host.hostPrompt.value = prompt('Need help?', 'host')
        host.loading.value = true
        expect(host.shownPrompt.value).toBeNull()
    })

    describe('takeAnsweredPrompt', () => {
        it('stores an answered page message and clears it', () => {
            const host = setup()
            host.hostPrompt.value = prompt('Need help?', 'host')
            expect(host.takeAnsweredPrompt()).toEqual({ host_prompt: 'Need help?', host_prompt_source: 'host' })
            expect(host.hostPrompt.value).toBeNull()
            expect(host.messages.value.map(m => m.message)).toEqual(['Need help?'])
        })

        it('keeps a journey step until the step moves on', () => {
            const host = setup()
            host.hostPrompt.value = prompt('Pick a plan', 'journey')
            expect(host.takeAnsweredPrompt()).toEqual({ host_prompt: 'Pick a plan', host_prompt_source: 'journey' })
            expect(host.hostPrompt.value?.message).toBe('Pick a plan')
            // Now in the chat, so it isn't shown (or stored) a second time.
            expect(host.shownPrompt.value).toBeNull()
            expect(host.takeAnsweredPrompt()).toEqual({})
        })

        it('adds nothing when no message is shown', () => {
            const host = setup([chatMessage('Hi')])
            expect(host.takeAnsweredPrompt()).toEqual({})
            expect(host.messages.value).toHaveLength(1)
        })

        it('puts the message where it appeared, before anything that arrived since', async () => {
            const host = setup([chatMessage('Hello')])
            host.hostPrompt.value = prompt('Need help?', 'host')
            await nextTick()
            host.messages.value.push(chatMessage('A reply'))
            await nextTick()
            host.takeAnsweredPrompt()
            expect(host.messages.value.map(m => m.message)).toEqual(['Hello', 'Need help?', 'A reply'])
        })
    })

    describe('an action reply', () => {
        it('joins the chat with the step message when nothing else is under way', () => {
            const host = setup()
            host.hostPrompt.value = prompt('Want a discount?', 'journey', [actionChip])
            host.onPageChip(actionChip)
            expect(host.messages.value.map(m => [m.message, m.message_type])).toEqual([
                ['Want a discount?', 'bot'],
                ['Apply coupon', 'user'],
            ])
        })

        it('stays out of the chat while another action is running', () => {
            const host = setup()
            host.hostPrompt.value = prompt('Want a discount?', 'journey', [actionChip])
            host.chipBusy.value = true
            host.onPageChip(actionChip)
            expect(host.messages.value).toEqual([])
        })

        it('stays out of the chat (and the replies are withdrawn) while an action awaits confirmation', () => {
            const host = setup()
            host.hostPrompt.value = prompt('Want a discount?', 'journey', [actionChip])
            host.pendingConfirm.value = { request: {} } as PendingConfirm
            host.onPageChip(actionChip)
            expect(host.messages.value).toEqual([])
            expect(host.replyChips.value).toEqual([])
        })
    })

    it('sends a text reply through the message box', () => {
        const host = setup()
        const chip: PageChip = { label: 'Yes please', kind: 'text', value: 'Yes please' }
        host.hostPrompt.value = prompt('Want a tour?', 'journey', [chip])
        host.onPageChip(chip)
        expect(host.sendQuickAction).toHaveBeenCalledWith('Yes please')
        expect(host.messages.value).toEqual([])
    })
})
