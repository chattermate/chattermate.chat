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
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'

/**
 * The widget's socket refused at startup because its token isn't bound to a
 * customer yet - a visitor whose authorization answer never reached the server
 * connected with the page's anonymous token. The widget has to authorize again
 * (which binds one) and finish starting up, not hang on "Initializing chat...".
 */

const socket = {
    messages: ref<any[]>([]),
    loading: ref(false),
    errorMessage: ref(''),
    showError: ref(false),
    loadingHistory: ref(false),
    hasStartedChat: ref(false),
    connectionStatus: ref('connecting'),
    humanAgent: ref({}),
    currentForm: ref(null),
    currentSessionId: ref(''),
    refusal: ref<string | null>(null)
}
const connect = vi.fn()
const onTakeover = vi.fn()
const onReauthorize = vi.fn()

vi.mock('@/composables/useWidgetSocket', () => ({
    useWidgetSocket: () => ({
        ...socket,
        connect,
        onTakeover,
        sendMessage: vi.fn(),
        sendFileAttachments: vi.fn(),
        endChat: vi.fn(),
        loadChatHistory: vi.fn(),
        reconnect: vi.fn(),
        cleanup: vi.fn(),
        onSessionState: vi.fn(),
        onReauthorize,
        submitRating: vi.fn(),
        submitForm: vi.fn(),
        getWorkflowState: vi.fn(),
        proceedWorkflow: vi.fn(),
        onWorkflowState: vi.fn(),
        onWorkflowProceeded: vi.fn(),
        setToken: vi.fn(),
        setWidgetId: vi.fn(),
        on: vi.fn(),
        emit: vi.fn()
    })
}))

/** One connect attempt: refused for a missing customer (or `reason`), or connected. */
let refusalReason = 'customer_required'
const refused = async () => {
    socket.refusal.value = refusalReason
    socket.connectionStatus.value = 'failed'
    return false
}
const connected = async () => {
    socket.refusal.value = null
    socket.connectionStatus.value = 'connected'
    return true
}

const authorized = (token: string) => ({
    ok: true, status: 200, json: async () => ({ agent: { name: 'Ada' }, token })
})

// Each test mounts the whole widget: unmount it afterwards (even when the test
// fails), or its timers and DOM observer fire after the environment is torn
// down and the run fails with "document is not defined".
enableAutoUnmount(afterEach)

describe('a widget whose socket is refused at startup', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        connect.mockReset()
        onTakeover.mockReset()
        onReauthorize.mockReset()
        refusalReason = 'customer_required'
        socket.refusal.value = null
        socket.connectionStatus.value = 'connecting'
        ;(window as any).__INITIAL_DATA__ = {
            widgetId: 'w-1',
            agentName: 'Ada',
            customization: {},
            customer: {},
            initialToken: 'anonymous'
        }
        fetchMock = vi.fn().mockResolvedValue(authorized('bound'))
        vi.stubGlobal('fetch', fetchMock)
        vi.resetModules()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    const start = async () => {
        const WidgetBuilder = (await import('@/webclient/WidgetBuilder.vue')).default
        const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1' } })
        await flushPromises()
        return wrapper
    }
    const authorizationCalls = () =>
        fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/widgets/w-1'))

    it('authorizes again and finishes starting up', async () => {
        connect.mockImplementationOnce(refused).mockImplementationOnce(connected)

        const wrapper = await start()

        expect(authorizationCalls()).toHaveLength(2)
        expect(connect).toHaveBeenCalledTimes(2)
        expect(wrapper.find('.initializing-overlay').exists()).toBe(false)
        expect(onTakeover).toHaveBeenCalled() // the rest of startup ran
    })

    it('authorizes again when the token it started with has expired', async () => {
        refusalReason = 'token_invalid'
        connect.mockImplementationOnce(refused).mockImplementationOnce(connected)

        const wrapper = await start()

        expect(authorizationCalls()).toHaveLength(2)
        expect(connect).toHaveBeenCalledTimes(2)
        expect(wrapper.find('.initializing-overlay').exists()).toBe(false)
    })

    it('authorizes again when a later reconnect is refused for an expired token', async () => {
        connect.mockImplementation(connected)
        await start()
        expect(authorizationCalls()).toHaveLength(1)

        // The socket reports a refusal nobody's connect() was waiting on: the token
        // lapsed while the page stayed open.
        await onReauthorize.mock.calls[0][0]()
        await flushPromises()

        expect(authorizationCalls()).toHaveLength(2)
        expect(connect).toHaveBeenCalledTimes(2)
    })

    it('never answers authorization from a stored copy', async () => {
        connect.mockImplementation(connected)
        await start()

        expect(authorizationCalls()[0][1]).toMatchObject({ cache: 'no-store' })
    })

    it('authorizes again only once, then offers the reconnect button', async () => {
        connect.mockImplementation(refused)

        const wrapper = await start()

        expect(authorizationCalls()).toHaveLength(2)
        expect(wrapper.find('.initializing-overlay').exists()).toBe(false)
        expect(wrapper.find('.reconnect-button').exists()).toBe(true)
        expect(onTakeover).toHaveBeenCalled()
    })

    it('shows the email form when authorizing again needs an email first', async () => {
        connect.mockImplementation(refused)
        fetchMock
            .mockResolvedValueOnce(authorized('anonymous'))
            .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ detail: 'Unauthorized' }) })

        const wrapper = await start()

        expect(authorizationCalls()).toHaveLength(2)
        expect(wrapper.find('.initializing-overlay').exists()).toBe(false)
        expect(wrapper.find('.reconnect-button').exists()).toBe(false)
        expect(onTakeover).toHaveBeenCalled()
    })
})
