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

import type { Ref } from 'vue'
import { isValidEmail, isReauthorizingRefusal, type HumanAgent } from '../types/widget'
import type { AgentCustomization } from '../types/agent'
import { widgetEnv } from '../webclient/widget-env'
import { IDENTITY_EXPIRED_CODE } from './useConversationToken'
import type { useVisitorIdentity } from './useVisitorIdentity'
import type { WidgetSocket } from './useWidgetSocket'

/** The auth state the views show; owned by useWidgetAuth. */
export interface AuthState {
    hasConversationToken: Ref<boolean>
    isInitializing: Ref<boolean>
    authError: Ref<string | null>
    showAuthError: Ref<boolean>
    /** The widget needs token auth that nobody set up. */
    isApiKeyAuthRequired: Ref<boolean>
}

export interface WidgetAuthorizeOptions {
    widgetId: Readonly<Ref<string | null | undefined>>
    emailInput: Ref<string>
    allowAttachments: Ref<boolean>
    agentName: Ref<string>
    applyCustomization: (customization: Partial<AgentCustomization>) => void
    socket: Pick<WidgetSocket, 'setToken' | 'connect' | 'refusal' | 'humanAgent' | 'getWorkflowState'>
    identity: Pick<ReturnType<typeof useVisitorIdentity>, 'token' | 'adoptToken' | 'ensureFreshToken' | 'handleIdentityExpired'>
    state: AuthState
    fetchChatHistory: () => Promise<void>
}

/** What the authorize call answers with. */
export interface AuthorizeResponse {
    /** A replacement conversation token. */
    token?: string
    agent?: {
        name: string
        customization?: Partial<AgentCustomization>
        allow_attachments?: boolean
        workflow?: boolean
    }
    human_agent?: HumanAgent
}

// The 401 detail of a signed-in visitor whose identity ran out.
const isIdentityExpired = (detail: unknown) =>
    typeof detail === 'object' && detail !== null
    && (detail as { code?: unknown }).code === IDENTITY_EXPIRED_CODE

/**
 * The authorize call (GET /widgets/{id}): binds the visitor's token to a customer,
 * connects the socket, loads history and applies what it says about the agent.
 */
export function useWidgetAuthorize({
    widgetId,
    emailInput,
    allowAttachments,
    agentName,
    applyCustomization,
    socket,
    identity,
    state,
    fetchChatHistory,
}: WidgetAuthorizeOptions) {
    const { token, adoptToken, ensureFreshToken, handleIdentityExpired } = identity
    const { hasConversationToken, isInitializing, authError, showAuthError, isApiKeyAuthRequired } = state

    const fail = (message: string) => {
        authError.value = message
        showAuthError.value = true
    }

    // A 401 is either a signed-in visitor whose identity ran out, a widget that needs
    // token auth nobody set up, or a plain agent waiting for the visitor's email.
    // Synchronous on purpose: the authorize call keeps the same awaits as it always had.
    const handleUnauthorized = (detail: unknown) => {
        // The visitor was signed in and their token has run out. Ask the host
        // page for a new one instead of quietly becoming a new anonymous
        // customer - which is what used to happen here.
        if (isIdentityExpired(detail)) {
            handleIdentityExpired()
            return
        }

        const errorDetail = typeof detail === 'string' ? detail : ''

        // Check if this is specifically an API key/token authentication error
        // These indicate the widget requires token auth (require_token_auth=true)
        if (errorDetail.includes('generate-token') || errorDetail.includes('API key') || errorDetail.includes('Token required')) {
            isApiKeyAuthRequired.value = true
            fail('Widget authentication not configured. Please contact the website administrator.')
            adoptToken(null)
        }
        // For plain "Unauthorized" - this is a regular non-auth agent waiting for email
        // Don't show auth error, just let the email input display
    }

    // What the authorize call says about the agent: its look, name, attachments and
    // whether it runs a workflow. Synchronous, like handleUnauthorized.
    const applyAgent = (data: AuthorizeResponse) => {
        if (data.agent?.customization) {
            applyCustomization(data.agent.customization)
        }
        if (data.agent && !data?.human_agent) {
            agentName.value = data.agent.name
        }
        if (data?.human_agent) {
            socket.humanAgent.value = data.human_agent
        }

        // Set allow_attachments flag from agent data
        if (data.agent?.allow_attachments !== undefined) {
            allowAttachments.value = data.agent.allow_attachments
        }

        // Update workflow status in initial data if received from backend
        if (data.agent?.workflow !== undefined) {
            window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || ({} as NonNullable<Window['__INITIAL_DATA__']>)
            window.__INITIAL_DATA__.workflow = data.agent.workflow
        }
    }

    const checkAuthorization = async ({ afterRefusal = false } = {}): Promise<boolean> => {
        try {
            if (!widgetId.value) {
                console.error('Widget ID is not available')
                fail('Widget ID is not available. Please refresh and try again.')
                return false
            }

            // Rotate a token that is close to expiry BEFORE it is used to authorize
            // anything: this call is the only one a long-lived page makes after load.
            await ensureFreshToken(widgetId.value)

            const url = new URL(`${widgetEnv.API_URL}/widgets/${widgetId.value}`)
            if (emailInput.value.trim() && isValidEmail(emailInput.value.trim())) {
                url.searchParams.append('email', emailInput.value.trim())
            }

            const headers: Record<string, string> = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }

            if (token.value) {
                headers['Authorization'] = `Bearer ${token.value}`
            }

            // Never a stored copy: this call is what binds the visitor to a customer,
            // and a cached answer left the socket holding the page's anonymous token.
            const response = await fetch(url, {
                headers,
                cache: 'no-store'
            })

            if (response.status === 401) {
                // Check the error detail to determine the type of 401
                hasConversationToken.value = false
                try {
                    handleUnauthorized((await response.json()).detail)
                } catch {
                    // If we can't parse the error, assume it's a token issue
                    fail('Authentication required. Your token has expired or is invalid. Please refresh the page.')
                    adoptToken(null)
                }
                return false
            }

            if (!response.ok) {
                // Other error status
                try {
                    const errorData = await response.json()
                    authError.value = errorData.detail || `Error: ${response.statusText}`
                } catch {
                    authError.value = `Error: ${response.statusText}. Please try again.`
                }
                showAuthError.value = true
                return false
            }

            const data: AuthorizeResponse = await response.json()

            // Update token if new one is provided
            if (data.token) {
                adoptToken(data.token)
            }

            hasConversationToken.value = true
            authError.value = null
            showAuthError.value = false

            // 🔐 SECURITY: Pass token to WebSocket before connecting
            socket.setToken(token.value || undefined)

            // Connect the socket. A failure here is not fatal any more: the socket
            // keeps retrying in the background and the header shows the connection
            // banner, so replacing the whole widget with an error overlay would take
            // away the chat the visitor is about to get back.
            const connected = await socket.connect()
            // The socket was refused for a token authorizing again fixes - not bound to a
            // customer yet, or expired or revoked: authorizing again binds or replaces it. Once.
            if (!connected && isReauthorizingRefusal(socket.refusal.value) && !afterRefusal) {
                return await checkAuthorization({ afterRefusal: true })
            }
            if (!connected) {
                console.error('Chat service not reachable yet; retrying in the background')
            }

            await fetchChatHistory()
            applyAgent(data)

            // Get workflow state after successful connection
            if (data.agent?.workflow) {
                await socket.getWorkflowState()
            }

            return true
        } catch (error) {
            console.error('Error checking authorization:', error)
            fail('An unexpected error occurred. Please try again.')
            hasConversationToken.value = false
            return false
        } finally {
            isInitializing.value = false
        }
    }

    return { checkAuthorization }
}
