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
import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { usePanelEmail } from '@/composables/usePanelEmail'

let scope: EffectScope | null = null

const setup = ({ collect = true, started = false, apiKeyRequired = false } = {}) => {
    const state = {
        shouldCollectEmail: ref(collect),
        hasStartedChat: ref(started),
        auth: { isApiKeyAuthRequired: ref(apiKeyRequired), showAuthError: ref(true), authError: ref<string | null>('Server error') },
    }
    scope = effectScope()
    const panel = scope.run(() => usePanelEmail(state))!
    return { ...state, ...panel }
}

describe('usePanelEmail', () => {
    afterEach(() => {
        scope?.stop()
        scope = null
    })

    it('awaits the email while the agent collects it and nothing started', () => {
        expect(setup().awaitingEmail.value).toBe(true)
        expect(setup({ collect: false }).awaitingEmail.value).toBe(false)
        expect(setup({ started: true }).awaitingEmail.value).toBe(false)
    })

    it('stays done after the conversation started once, through a new chat\'s reset', async () => {
        const panel = setup()
        panel.hasStartedChat.value = true
        await nextTick()
        expect(panel.awaitingEmail.value).toBe(false)
        panel.hasStartedChat.value = false
        await nextTick()
        expect(panel.awaitingEmail.value).toBe(false)
    })

    it('recovers a refused email by clearing the widget-wide error', () => {
        const panel = setup()
        expect(panel.recoverRefusal()).toBe(true)
        expect(panel.auth.showAuthError.value).toBe(false)
        expect(panel.auth.authError.value).toBeNull()
    })

    it('lets the error show for a widget that is not set up', () => {
        const panel = setup({ apiKeyRequired: true })
        expect(panel.recoverRefusal()).toBe(false)
        expect(panel.auth.showAuthError.value).toBe(true)
    })
})
