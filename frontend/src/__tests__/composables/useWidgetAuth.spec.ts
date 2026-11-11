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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

vi.mock('@/webclient/host-bridge', () => ({ postToHost: vi.fn() }))

import { useWidgetAuth } from '@/composables/useWidgetAuth'
import type { SocketError } from '@/types/widget'

const setup = ({ reconnected = false, refusal = null as SocketError['type'] | null } = {}) => {
    const socket = {
        setToken: vi.fn(),
        setWidgetId: vi.fn(),
        connect: vi.fn(async () => true),
        reconnect: vi.fn(async () => reconnected),
        refusal: ref(refusal),
        hasStartedChat: ref(false),
        loadChatHistory: vi.fn(async () => undefined),
        humanAgent: ref({}),
        getWorkflowState: vi.fn(async () => undefined),
        connectionStatus: ref<'connected' | 'connecting' | 'failed'>('connecting'),
        onTakeover: vi.fn(),
        onReauthorize: vi.fn(),
        onSessionState: vi.fn(),
    }
    const auth = useWidgetAuth({
        widgetId: ref('w1'),
        emailInput: ref(''),
        allowAttachments: ref(false),
        agentName: ref(''),
        applyCustomization: vi.fn(),
        socket: socket as never,
    })
    return { ...auth, socket }
}

const serverError = { status: 500, ok: false, statusText: 'Server Error', json: async () => ({ detail: 'Down' }) }

describe('useWidgetAuth', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => ({}) }))
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        delete window.__INITIAL_DATA__
        vi.useRealTimers()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('starts with the auth error widget.ts already hit', () => {
        const auth = useWidgetAuth({
            widgetId: ref('w1'), initialAuthError: 'Bad token', emailInput: ref(''),
            allowAttachments: ref(false), agentName: ref(''), applyCustomization: vi.fn(), socket: {} as never,
        })
        expect(auth.authError.value).toBe('Bad token')
        expect(auth.showAuthError.value).toBe(true)
        expect(auth.isInitializing.value).toBe(false)
    })

    describe('initializeWidget', () => {
        it('waits up to 50 tries (5 s) for the page data, then gives up', async () => {
            vi.useFakeTimers()
            const auth = setup()
            let result: boolean | undefined
            void auth.initializeWidget().then((r) => { result = r })
            await vi.advanceTimersByTimeAsync(4900)
            expect(result).toBeUndefined()
            await vi.advanceTimersByTimeAsync(100)
            expect(result).toBe(false)
            expect(fetch).not.toHaveBeenCalled()
            expect(auth.socket.setWidgetId).not.toHaveBeenCalled()
        })

        it('marks the connection connected when authorizing fails, so the chat is not stuck connecting', async () => {
            window.__INITIAL_DATA__ = { widgetId: 'w1' } as Window['__INITIAL_DATA__']
            vi.mocked(fetch).mockResolvedValue(serverError as Response)
            const auth = setup()
            expect(await auth.initializeWidget()).toBe(false)
            expect(auth.socket.setWidgetId).toHaveBeenCalledWith('w1')
            expect(auth.socket.connectionStatus.value).toBe('connected')
            expect(auth.authError.value).toBe('Down')
        })

        it('authorizes and loads history once the page data is there', async () => {
            window.__INITIAL_DATA__ = { widgetId: 'w1' } as Window['__INITIAL_DATA__']
            const auth = setup()
            auth.startTokenLifecycle()
            expect(await auth.initializeWidget()).toBe(true)
            expect(auth.socket.connect).toHaveBeenCalledOnce()
            expect(auth.socket.loadChatHistory).toHaveBeenCalledOnce()
            auth.stopTokenLifecycle()
        })
    })

    describe('handleReconnect', () => {
        it('re-authorizes after a reconnect that worked', async () => {
            const auth = setup({ reconnected: true })
            await auth.handleReconnect()
            expect(fetch).toHaveBeenCalledOnce()
        })

        it.each(['customer_required', 'token_invalid'] as const)(
            're-authorizes after a reconnect refused as %s (authorizing fixes it)', async (refusal) => {
                const auth = setup({ refusal })
                await auth.handleReconnect()
                expect(fetch).toHaveBeenCalledOnce()
            })

        it.each([null, 'connection_error', 'conversation_gone'] as const)(
            'does not re-authorize after a failed reconnect (%s)', async (refusal) => {
                const auth = setup({ refusal })
                await auth.handleReconnect()
                expect(fetch).not.toHaveBeenCalled()
            })
    })
})
