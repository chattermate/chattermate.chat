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

import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import {
    useEmailGate,
    EMAIL_MISSING_TEXT,
    EMAIL_INVALID_TEXT,
    EMAIL_GATE_FAILED_TEXT,
} from '@/composables/useEmailGate'

const setup = (collect = true, authorize = vi.fn().mockResolvedValue(true), askAnything = false) => {
    const hasStartedChat = ref(false)
    const gate = useEmailGate({
        customization: ref({ collect_email: collect }),
        isAskAnythingStyle: ref(askAnything),
        hasStartedChat,
        authorize,
    })
    return { ...gate, authorize, hasStartedChat }
}

describe('useEmailGate', () => {
    it('shows the gate only when the agent collects email', () => {
        expect(setup(true).showEmailGate.value).toBe(true)
        expect(setup(false).showEmailGate.value).toBe(false)
    })

    it('never shows the gate for the Ask AI style', () => {
        const gate = setup(true, vi.fn(), true)
        expect(gate.shouldCollectEmail.value).toBe(false)
        expect(gate.showEmailGate.value).toBe(false)
    })

    it('hides the gate once the chat has started', () => {
        const gate = setup()
        gate.hasStartedChat.value = true
        expect(gate.showEmailGate.value).toBe(false)
    })

    it('rejects a missing or malformed email without authorizing', async () => {
        const gate = setup()
        await gate.submitEmailGate()
        expect(gate.emailGateError.value).toBe(EMAIL_MISSING_TEXT)
        gate.emailInput.value = 'nope'
        await gate.submitEmailGate()
        expect(gate.emailGateError.value).toBe(EMAIL_INVALID_TEXT)
        expect(gate.authorize).not.toHaveBeenCalled()
    })

    it('authorizes a valid email and drops the gate', async () => {
        const gate = setup()
        gate.emailInput.value = ' ada@example.com '
        await gate.submitEmailGate()
        expect(gate.authorize).toHaveBeenCalledOnce()
        expect(gate.showEmailGate.value).toBe(false)
        expect(gate.submittingEmail.value).toBe(false)
    })

    it('marks the gate as submitting while the request is in flight', async () => {
        let finish: (value: unknown) => void = () => {}
        const authorize = vi.fn(() => new Promise(resolve => { finish = resolve }))
        const gate = setup(true, authorize)
        gate.emailInput.value = 'ada@example.com'

        const submitting = gate.submitEmailGate()
        expect(gate.submittingEmail.value).toBe(true)
        expect(gate.showEmailGate.value).toBe(true)

        finish(true)
        await submitting
        expect(gate.submittingEmail.value).toBe(false)
        expect(gate.showEmailGate.value).toBe(false)
    })

    it('keeps the gate and says so when authorizing throws', async () => {
        const gate = setup(true, vi.fn().mockRejectedValue(new Error('down')))
        gate.emailInput.value = 'ada@example.com'
        await gate.submitEmailGate()
        expect(gate.emailGateError.value).toBe(EMAIL_GATE_FAILED_TEXT)
        expect(gate.showEmailGate.value).toBe(true)
    })

    describe('for the redesigned panel', () => {
        const panelGate = (authorize: any, recover = vi.fn(() => true)) => {
            const gate = useEmailGate({
                customization: ref({ collect_email: true }),
                isAskAnythingStyle: ref(false),
                hasStartedChat: ref(false),
                authorize,
                recoverRefusal: recover,
            })
            gate.emailInput.value = 'ada@example.com'
            return { ...gate, recover }
        }

        it('keeps the gate up with a retryable error when the server refuses or fails the email', async () => {
            const gate = panelGate(vi.fn().mockResolvedValue(false))
            await gate.submitEmailGate()
            expect(gate.recover).toHaveBeenCalledTimes(1)
            expect(gate.emailCollected.value).toBe(false)
            expect(gate.emailGateError.value).toBe(EMAIL_GATE_FAILED_TEXT)
            expect(gate.submittingEmail.value).toBe(false)
        })

        it('lifts the gate as the classic one does when the refusal must show (widget not set up)', async () => {
            const gate = panelGate(vi.fn().mockResolvedValue(false), vi.fn(() => false))
            await gate.submitEmailGate()
            expect(gate.emailCollected.value).toBe(true)
            expect(gate.emailGateError.value).toBe('')
        })

        it('accepts an email the server took', async () => {
            const gate = panelGate(vi.fn().mockResolvedValue(true))
            await gate.submitEmailGate()
            expect(gate.recover).not.toHaveBeenCalled()
            expect(gate.emailCollected.value).toBe(true)
        })

        it('ignores a second submit while one is in flight (submitEmailOnce)', async () => {
            let finish = (_ok: boolean) => {}
            const authorize = vi.fn(() => new Promise<boolean>((resolve) => { finish = resolve }))
            const gate = panelGate(authorize)
            const first = gate.submitEmailOnce()
            await gate.submitEmailOnce()
            finish(true)
            await first
            expect(authorize).toHaveBeenCalledTimes(1)
        })
    })

    it('keeps the classic gate lifting on any answer (no recoverRefusal)', async () => {
        const gate = setup(true, vi.fn().mockResolvedValue(false))
        gate.emailInput.value = 'ada@example.com'
        await gate.submitEmailGate()
        expect(gate.emailCollected.value).toBe(true)
    })
})
