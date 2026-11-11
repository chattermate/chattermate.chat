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

/**
 * Shared harness for mounting WidgetBuilder with a fake socket.
 *
 * Specs mock `@/composables/useWidgetSocket` with `socketModule` (vi.mock is hoisted,
 * so each spec declares the mock itself and imports this file inside the factory):
 *
 *   vi.mock('@/composables/useWidgetSocket', async () =>
 *       (await import('./widgetHarness')).socketModule())
 *
 * Then `resetSocket()` in beforeEach and `mountWidget()` per test. `socket` holds the
 * reactive state the widget reads; `socketCalls` holds the spies it calls.
 * Use `postFromParent` for host→frame messages.
 */

import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

const createFakeSocket = () => ({
    socket: {
        messages: ref<any[]>([]),
        loading: ref(false),
        errorMessage: ref(''),
        showError: ref(false),
        loadingHistory: ref(false),
        hasStartedChat: ref(true),
        connectionStatus: ref('connected'),
        humanAgent: ref<any>({}),
        currentForm: ref<any>(null),
        currentSessionId: ref('session-1'),
        refusal: ref<any>(null),
    },
    socketCalls: {
        sendMessage: vi.fn(),
        sendFileAttachments: vi.fn(),
        endChat: vi.fn(),
        loadChatHistory: vi.fn(),
        connect: vi.fn(),
        reconnect: vi.fn(),
        cleanup: vi.fn(),
        onTakeover: vi.fn(),
        onSessionState: vi.fn(),
        onReauthorize: vi.fn(),
        submitRating: vi.fn(),
        submitForm: vi.fn(),
        getWorkflowState: vi.fn(),
        proceedWorkflow: vi.fn(),
        onWorkflowState: vi.fn(),
        onWorkflowProceeded: vi.fn(),
        setToken: vi.fn(),
        setWidgetId: vi.fn(),
        on: vi.fn(),
        emit: vi.fn(),
    },
    /** Removes the window listeners the previous test's widgets added. */
    releaseListeners: null as null | (() => void),
})

// mountWidget calls vi.resetModules() so each mount reads fresh __INITIAL_DATA__,
// and that also reloads this file inside the mocked module. Keeping the fake on
// globalThis means the spec and the widget always share one instance.
const shared = ((globalThis as any).__cmWidgetFakeSocket ??= createFakeSocket()) as ReturnType<typeof createFakeSocket>

export const socket = shared.socket
export const socketCalls = shared.socketCalls

/** The module the specs hand to vi.mock for `@/composables/useWidgetSocket`. */
export const socketModule = () => ({
    useWidgetSocket: () => ({ ...socket, ...socketCalls }),
})

/**
 * Back to a connected, started, empty conversation with fresh spies. Also takes
 * off the window listeners earlier widgets added (WidgetBuilder never removes its
 * own), so a widget from a previous test can't answer this test's messages.
 */
export const resetSocket = () => {
    shared.releaseListeners?.()
    shared.releaseListeners = trackWindowListeners()
    socket.messages.value = []
    socket.loading.value = false
    socket.errorMessage.value = ''
    socket.showError.value = false
    socket.loadingHistory.value = false
    socket.hasStartedChat.value = true
    socket.connectionStatus.value = 'connected'
    socket.humanAgent.value = {}
    socket.currentForm.value = null
    socket.currentSessionId.value = 'session-1'
    socket.refusal.value = null
    Object.values(socketCalls).forEach((spy) => spy.mockReset())
    socketCalls.connect.mockResolvedValue(true)
}

export interface MountOptions {
    /** Merged into window.__INITIAL_DATA__.customization. */
    customization?: Record<string, any>
    /** Extra keys on window.__INITIAL_DATA__ (workflow, hideBranding, …). */
    initialData?: Record<string, any>
    /** Body the stubbed fetch resolves with (the authorize call reads `agent`). */
    fetchBody?: Record<string, any>
}

/** A response the stubbed fetch returns for every request. */
export const jsonResponse = (body: Record<string, any>, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
})

/**
 * Mount a fresh WidgetBuilder. Modules are reset so each mount reads the
 * window.__INITIAL_DATA__ set here, as the real frame does on load.
 */
export const mountWidget = async (options: MountOptions = {}) => {
    ;(window as any).__INITIAL_DATA__ = {
        widgetId: 'w-1',
        agentName: 'Ada',
        customization: { ...(options.customization || {}) },
        customerId: 'c-1',
        customer: {},
        initialToken: 'tok-1',
        ...(options.initialData || {}),
    }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(options.fetchBody || { agent: { name: 'Ada' } }))
    vi.stubGlobal('fetch', fetchMock)
    vi.resetModules()
    const WidgetBuilder = (await import('@/webclient/WidgetBuilder.vue')).default
    const wrapper = mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })
    return { wrapper, fetchMock }
}

/** Let pending promises and Vue updates settle. */
export const settle = async (wrapper: any, rounds = 3) => {
    for (let i = 0; i < rounds; i++) {
        await Promise.resolve()
        await wrapper.vm.$nextTick()
    }
}

/**
 * Post a message with no `event.source`, as another frame or script on the page
 * could. WidgetBuilder ignores these; use it to check that it does.
 */
export const postFromStranger = async (wrapper: any, data: Record<string, any>) => {
    window.dispatchEvent(new MessageEvent('message', { data, origin: window.location.origin }))
    await settle(wrapper)
}

/**
 * Post a message as the embedding page itself. WidgetBuilder drops anything whose
 * `event.source` is not `window.parent` (a sibling frame could reach it otherwise),
 * so `postFromStranger` above, which sends no source, is ignored by its listener.
 */
export const postFromParent = async (wrapper: any, data: Record<string, any>) => {
    window.dispatchEvent(new MessageEvent('message', {
        data,
        origin: window.location.origin,
        source: window.parent as any,
    }))
    await settle(wrapper)
}

/**
 * Record every window listener added from now on; the returned function removes
 * them. WidgetBuilder never takes its window `message`/`keydown` listeners off on
 * unmount, so without this a widget from an earlier test still answers messages.
 */
export const trackWindowListeners = () => {
    const added: Array<[string, any, any]> = []
    const original = window.addEventListener.bind(window)
    const spy = vi.spyOn(window, 'addEventListener').mockImplementation(((type: string, listener: any, options?: any) => {
        added.push([type, listener, options])
        return original(type, listener, options)
    }) as any)
    return () => {
        spy.mockRestore()
        added.forEach(([type, listener, options]) => window.removeEventListener(type, listener, options))
    }
}
