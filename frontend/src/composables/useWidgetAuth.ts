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

import { ref, type Ref } from 'vue'
import { isReauthorizingRefusal } from '../types/widget'
import type { AgentCustomization } from '../types/agent'
import { postToHost } from '../webclient/host-bridge'
import { useVisitorIdentity } from './useVisitorIdentity'
import { useWidgetAuthorize } from './useWidgetAuthorize'
import type { WidgetSocket } from './useWidgetSocket'

export interface WidgetAuthOptions {
    widgetId: Readonly<Ref<string | null | undefined>>
    /** An auth error widget.ts already hit before mounting. */
    initialAuthError?: string | null
    /** The email the visitor typed; sent with the authorize call when valid. */
    emailInput: Ref<string>
    /** Turned on or off by the agent's allow_attachments setting. */
    allowAttachments: Ref<boolean>
    agentName: Ref<string>
    applyCustomization: (customization: Partial<AgentCustomization>) => void
    socket: Pick<WidgetSocket,
        'setToken' | 'setWidgetId' | 'connect' | 'reconnect' | 'refusal' | 'hasStartedChat'
        | 'loadChatHistory' | 'humanAgent' | 'getWorkflowState' | 'connectionStatus'
        | 'onTakeover' | 'onReauthorize' | 'onSessionState'>
}

/**
 * Who the visitor is: the conversation token (kept alive by useConversationToken),
 * the authorize call that binds it to a customer and connects the socket, and the
 * identity hand-offs with the host page. Owns the auth-error state the views show.
 */
export function useWidgetAuth({
    widgetId,
    initialAuthError,
    emailInput,
    allowAttachments,
    agentName,
    applyCustomization,
    socket,
}: WidgetAuthOptions) {
    const hasConversationToken = ref(false)
    const isInitializing = ref(true)

    // The conversation token and the identity hand-offs with the host page.
    const identity = useVisitorIdentity({
        widgetId: widgetId.value || '',
        setSocketToken: (next) => socket.setToken(next),
        reauthorize: () => initializeWidget(),
    })

    // Authentication error state
    const authError = ref<string | null>(null)
    const showAuthError = ref(false)
    const isApiKeyAuthRequired = ref(false) // Specific error for missing API key configuration

    // Check if there's an initial auth error from widget.ts
    if (initialAuthError) {
        authError.value = initialAuthError
        showAuthError.value = true
        isInitializing.value = false
    }

    /** Starts the token lifecycle with the token the page was served with. */
    const startTokenLifecycle = () => {
        const initialData = window.__INITIAL_DATA__
        identity.startTokenLifecycle(initialData?.widgetId || '', initialData?.initialToken)
        if (identity.token.value) {
            hasConversationToken.value = true
        }
    }

    // The authorize call: binds the token to a customer and connects the socket.
    const { checkAuthorization } = useWidgetAuthorize({
        widgetId,
        emailInput,
        allowAttachments,
        agentName,
        applyCustomization,
        socket,
        identity,
        state: { hasConversationToken, isInitializing, authError, showAuthError, isApiKeyAuthRequired },
        // Declared just below; it only runs once the authorize call succeeded.
        fetchChatHistory: () => fetchChatHistory(),
    })

    // Load history when chat starts
    const fetchChatHistory = async () => {
        if (!socket.hasStartedChat.value && hasConversationToken.value) {
            socket.hasStartedChat.value = true
            await socket.loadChatHistory()
        }
    }

    // Initialize widget - main initialization logic
    const initializeWidget = async () => {
        try {
            // Wait for window.__INITIAL_DATA__ to be available
            let attempts = 0
            const maxAttempts = 50 // 5 seconds max wait
            while (!window.__INITIAL_DATA__?.widgetId && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100))
                attempts++
            }

            if (!window.__INITIAL_DATA__?.widgetId) {
                console.error('Widget data not available after waiting')
                return false
            }

            // Set widget ID for socket authentication (supports anonymous access)
            socket.setWidgetId(window.__INITIAL_DATA__.widgetId)

            const isAuthorized = await checkAuthorization()

            if (!isAuthorized) {
                socket.connectionStatus.value = 'connected'
                return false
            }

            // For refresh cases, also check if we need to get workflow state
            if (window.__INITIAL_DATA__?.workflow && hasConversationToken.value) {
                await socket.getWorkflowState()
            }

            return true
        } catch (error) {
            console.error('Failed to initialize widget:', error)
            return false
        }
    }

    // The connection banner's retry: reconnect, then authorize again when that worked
    // or was refused for a reason authorizing fixes.
    const handleReconnect = async () => {
        const connected = await socket.reconnect()
        if (connected || isReauthorizingRefusal(socket.refusal.value)) {
            await checkAuthorization()
        }
    }

    // Registered once the widget is initialized.
    const registerSocketCallbacks = () => {
        // A takeover authorizes again (it binds the human agent).
        socket.onTakeover(async () => {
            await checkAuthorization()
        })

        // A reconnect refused for a token authorizing again fixes - it expired while
        // the page stayed open - instead of retrying the dead token forever.
        socket.onReauthorize(async () => {
            await checkAuthorization()
        })

        // Tell the host page which conversation this connection is in, whether it was
        // just created (a visitor starting a new chat used to be invisible to the host)
        // and whether it still belongs to the identified visitor.
        socket.onSessionState(({ session_id, authenticated, created }) => {
            postToHost({
                type: 'CHAT_SESSION',
                sessionId: session_id,
                authenticated,
                created
            })
        })
    }

    return {
        token: identity.token,
        stopTokenLifecycle: identity.stopTokenLifecycle,
        handleIdentityExpired: identity.handleIdentityExpired,
        continueAnonymously: identity.continueAnonymously,
        adoptHostToken: identity.adoptHostToken,
        hasConversationToken,
        isInitializing,
        authError,
        showAuthError,
        isApiKeyAuthRequired,
        startTokenLifecycle,
        checkAuthorization,
        fetchChatHistory,
        initializeWidget,
        handleReconnect,
        registerSocketCallbacks,
    }
}
