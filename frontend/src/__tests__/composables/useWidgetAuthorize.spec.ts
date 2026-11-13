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
import { useWidgetAuthorize } from '@/composables/useWidgetAuthorize'
import { IDENTITY_EXPIRED_CODE } from '@/composables/useConversationToken'
import type { SocketError } from '@/types/widget'

/** A fetch answer: `body` undefined means the body is not JSON. */
const answer = (status: number, body?: unknown, statusText = '') => ({
    status,
    ok: status >= 200 && status < 300,
    statusText,
    json: body === undefined ? () => Promise.reject(new SyntaxError('not json')) : () => Promise.resolve(body),
})

const setup = ({ connected = true, refusal = null as SocketError['type'] | null } = {}) => {
    const calls: string[] = []
    const socket = {
        setToken: vi.fn(),
        connect: vi.fn(async () => connected),
        refusal: ref(refusal),
        humanAgent: ref({}),
        getWorkflowState: vi.fn(async () => undefined),
    }
    const identity = {
        token: ref<string | null>('tok-1'),
        adoptToken: vi.fn(),
        ensureFreshToken: vi.fn(async () => undefined),
        handleIdentityExpired: vi.fn(),
    }
    const state = {
        hasConversationToken: ref(true),
        isInitializing: ref(true),
        authError: ref<string | null>(null),
        showAuthError: ref(false),
        isApiKeyAuthRequired: ref(false),
    }
    const agentName = ref('')
    const authorize = useWidgetAuthorize({
        widgetId: ref('w1'),
        emailInput: ref(''),
        allowAttachments: ref(false),
        agentName,
        applyCustomization: vi.fn(() => { calls.push('customization') }),
        socket: socket as never,
        identity: identity as never,
        state,
        fetchChatHistory: vi.fn(async () => { calls.push('history') }),
    })
    return { ...authorize, socket, identity, state, agentName, calls }
}

const stubFetch = (...answers: ReturnType<typeof answer>[]) => {
    const fetchMock = vi.fn()
    answers.forEach((a) => fetchMock.mockResolvedValueOnce(a))
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
}

describe('useWidgetAuthorize', () => {
    beforeEach(() => {
        // An unreachable chat service is logged; keep the run quiet.
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('a 401', () => {
        it('for an expired identity asks the host page for a new one, with no error shown', async () => {
            stubFetch(answer(401, { detail: { code: IDENTITY_EXPIRED_CODE } }))
            const auth = setup()
            expect(await auth.checkAuthorization()).toBe(false)
            expect(auth.identity.handleIdentityExpired).toHaveBeenCalledOnce()
            expect(auth.identity.adoptToken).not.toHaveBeenCalled()
            expect(auth.state.showAuthError.value).toBe(false)
            expect(auth.state.hasConversationToken.value).toBe(false)
        })

        it('for a widget that needs token auth shows the setup overlay and drops the token', async () => {
            stubFetch(answer(401, { detail: 'Token required: call generate-token first' }))
            const auth = setup()
            expect(await auth.checkAuthorization()).toBe(false)
            expect(auth.state.isApiKeyAuthRequired.value).toBe(true)
            expect(auth.state.showAuthError.value).toBe(true)
            expect(auth.state.authError.value).toBe('Widget authentication not configured. Please contact the website administrator.')
            expect(auth.identity.adoptToken).toHaveBeenCalledWith(null)
        })

        it('that is a plain "Unauthorized" waits for the email without an error', async () => {
            stubFetch(answer(401, { detail: 'Unauthorized' }))
            const auth = setup()
            expect(await auth.checkAuthorization()).toBe(false)
            expect(auth.state.showAuthError.value).toBe(false)
            expect(auth.state.isApiKeyAuthRequired.value).toBe(false)
            expect(auth.identity.adoptToken).not.toHaveBeenCalled()
        })

        it('with an unreadable body is treated as a dead token', async () => {
            stubFetch(answer(401))
            const auth = setup()
            expect(await auth.checkAuthorization()).toBe(false)
            expect(auth.state.authError.value).toBe('Authentication required. Your token has expired or is invalid. Please refresh the page.')
            expect(auth.state.showAuthError.value).toBe(true)
            expect(auth.identity.adoptToken).toHaveBeenCalledWith(null)
        })
    })

    it('re-authorizes once when the socket refuses a token authorizing fixes, never twice', async () => {
        const fetchMock = stubFetch(answer(200, {}), answer(200, {}), answer(200, {}))
        const auth = setup({ connected: false, refusal: 'customer_required' })
        expect(await auth.checkAuthorization()).toBe(true)
        expect(fetchMock).toHaveBeenCalledTimes(2)
        expect(auth.socket.connect).toHaveBeenCalledTimes(2)
    })

    it('does not re-authorize for a refusal authorizing cannot fix', async () => {
        const fetchMock = stubFetch(answer(200, {}), answer(200, {}))
        const auth = setup({ connected: false, refusal: 'connection_error' })
        expect(await auth.checkAuthorization()).toBe(true)
        expect(fetchMock).toHaveBeenCalledOnce()
    })

    it('shows the server detail of a 500 with a JSON body', async () => {
        stubFetch(answer(500, { detail: 'Agent is offline' }, 'Internal Server Error'))
        const auth = setup()
        expect(await auth.checkAuthorization()).toBe(false)
        expect(auth.state.authError.value).toBe('Agent is offline')
        expect(auth.state.showAuthError.value).toBe(true)
        expect(auth.state.isInitializing.value).toBe(false)
    })

    it('shows the status text of a 500 without a JSON body', async () => {
        stubFetch(answer(500, undefined, 'Internal Server Error'))
        const auth = setup()
        expect(await auth.checkAuthorization()).toBe(false)
        expect(auth.state.authError.value).toBe('Error: Internal Server Error. Please try again.')
    })

    it('loads the history before it applies the agent settings', async () => {
        stubFetch(answer(200, { token: 'tok-2', agent: { name: 'Ava', customization: { chat_style: 'GLASS' } } }))
        const auth = setup()
        expect(await auth.checkAuthorization()).toBe(true)
        expect(auth.calls).toEqual(['history', 'customization'])
        expect(auth.agentName.value).toBe('Ava')
        expect(auth.identity.adoptToken).toHaveBeenCalledWith('tok-2')
        expect(auth.state.hasConversationToken.value).toBe(true)
    })
})
