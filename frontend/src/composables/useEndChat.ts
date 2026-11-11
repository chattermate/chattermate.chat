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

import { watch, type Ref } from 'vue'
import type { Message } from '../types/chat'
import type { HumanAgent } from '../types/widget'
import { isEndChatMessage } from '../utils/endChat'
import { widgetEnv } from '../webclient/widget-env'
import { postToHost } from '../webclient/host-bridge'

export interface EndChatOptions {
    widgetId: Readonly<Ref<string | null | undefined>>
    token: Ref<string | null>
    messages: Ref<Message[]>
    humanAgent: Ref<HumanAgent>
    agentName: Ref<string>
    /** The session a rating is submitted for. */
    currentSessionId: Ref<string>
}

interface CloseOptions {
    reason?: string
    description?: string
    keepalive?: boolean
}

/**
 * The end of a conversation: the agent's end-chat message closes the session on
 * the server and may ask for a rating; the host page can close it too, before it
 * replaces the visitor.
 */
export function useEndChat({ widgetId, token, messages, humanAgent, agentName, currentSessionId }: EndChatOptions) {
    /**
     * Close a session on the backend. `keepalive` lets the request finish while the
     * frame is being torn down (the host ending a chat before switching visitor).
     */
    const closeSessionOnServer = (sessionId: string, { reason, description, keepalive = false }: CloseOptions = {}) => {
        const url = new URL(`${widgetEnv.API_URL}/widgets/${widgetId.value}/end-chat`)
        url.searchParams.append('session_id', sessionId)
        if (reason) url.searchParams.append('reason', reason)
        if (description) url.searchParams.append('description', description)
        return fetch(url, {
            method: 'POST',
            keepalive,
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'Content-Type': 'application/json'
            }
        })
    }

    /**
     * The host page is about to replace this visitor (identify() as someone else, or
     * logout()): close their session first, then say so. Always answers, so the host
     * never waits on a frame that had nothing to close.
     */
    const endChatForHost = async (sessionId: unknown) => {
        try {
            if (typeof sessionId === 'string' && sessionId && token.value && widgetId.value) {
                await closeSessionOnServer(sessionId, { reason: 'CUSTOMER_REQUEST', keepalive: true })
            }
        } catch {
            /* the host carries on either way */
        } finally {
            postToHost({ type: 'END_CHAT_DONE' })
        }
    }

    const handleEndChat = async (message: Message) => {
        // Defence in depth: this closes the session server-side, so it must never
        // run for a message that is not an end-chat, whoever calls it.
        if (!isEndChatMessage(message)) return

        // Call backend API to acknowledge end_chat and close the session
        try {
            if (message.session_id && token.value && widgetId.value) {
                const response = await closeSessionOnServer(message.session_id, {
                    reason: message.attributes?.end_chat_reason,
                    description: message.attributes?.end_chat_description,
                })

                if (response.ok) {
                    const data = await response.json()
                    console.info(`✓ Chat session closed on backend: ${data.session_id}`)
                } else {
                    console.warn(`Failed to close session on backend: ${response.status}`)
                }
            }
        } catch (error) {
            console.error('Error calling end-chat API:', error)
        }

        // Show rating if requested
        if (message.attributes?.end_chat && message.attributes?.request_rating) {
            // Determine the agent name with proper fallbacks
            const displayAgentName = message.agent_name || humanAgent.value?.human_agent_name || agentName.value || 'our agent'

            messages.value.push({
                message: `Rate the chat session that you had with ${displayAgentName}`,
                message_type: 'rating',
                created_at: new Date().toISOString(),
                session_id: message.session_id,
                agent_name: displayAgentName,
                showFeedback: false
            } as Message)
            currentSessionId.value = message.session_id
        }
    }

    // Close the session only when the last message is genuinely an end-chat.
    // This watch is deep, so it re-runs on every mutation — including each
    // character of a streamed reply — hence both the isEndChatMessage guard and
    // the already-handled check. Without the guard, ordinary messages that carry a
    // real session_id (the takeover notice, form prompts) ended the conversation.
    let endedMessage: unknown = null
    watch(() => messages.value, (newMessages) => {
        const lastMessage = newMessages[newMessages.length - 1]
        if (!isEndChatMessage(lastMessage) || lastMessage === endedMessage) return

        endedMessage = lastMessage
        handleEndChat(lastMessage)
    }, { deep: true })

    return { closeSessionOnServer, endChatForHost }
}
