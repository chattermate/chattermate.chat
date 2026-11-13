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

import { computed, getCurrentScope, onScopeDispose, ref, watch, type Ref } from 'vue'
import type { HumanAgent } from '../types/widget'
import { NEW_CHAT_CONFIRM_TIMEOUT_MS, NEW_CHAT_FAILED_TEXT } from '../webclient/new-chat'

/** The parts of the widget socket a new chat touches. */
export interface NewChatConversation {
    messages: Ref<unknown[]>
    humanAgent: Ref<HumanAgent>
    /** Closes the session on the server; resolves false when it was not confirmed. */
    endChat: () => Promise<boolean>
    getWorkflowState: () => Promise<unknown>
}

export interface NewChatOptions {
    conversation: NewChatConversation
    showEmailGate: Readonly<Ref<boolean>>
    /** Authorizes and reconnects into a fresh conversation. */
    initializeWidget: () => Promise<unknown>
    /** Empties the message box and drops staged attachments. */
    clearComposer: () => void
}

/**
 * The "New chat" control (every visitor's: their past chats stay in the history) and the workflow's
 * "start a new conversation" button. Ending a chat closes the session, and history
 * is scoped to the active session, so the control asks first, inside the widget; the
 * question withdraws itself if it is left unanswered.
 */
export function useNewChat({
    conversation,
    showEmailGate,
    initializeWidget,
    clearComposer,
}: NewChatOptions) {
    const { messages, humanAgent, endChat, getWorkflowState } = conversation

    // Hidden until there is something to clear, and while a human agent is on the
    // conversation: closing the session would drop the visitor out of a live handover.
    const canStartNewChat = computed(() =>
        messages.value.length > 0
        && !humanAgent.value?.human_agent_name
        && !showEmailGate.value
    )

    const startingNewChat = ref(false)
    const newChatError = ref('')
    const newChatArmed = ref(false)
    let newChatArmTimer: ReturnType<typeof setTimeout> | null = null

    const clearArmTimer = () => {
        if (newChatArmTimer) {
            clearTimeout(newChatArmTimer)
            newChatArmTimer = null
        }
    }
    // The confirm withdraws itself on a timer; don't leave it running after unmount.
    if (getCurrentScope()) onScopeDispose(clearArmTimer)

    const disarmNewChat = () => {
        newChatArmed.value = false
        newChatError.value = ''
        clearArmTimer()
    }

    const requestNewChat = () => {
        if (startingNewChat.value) return
        if (newChatArmed.value) {
            disarmNewChat()
            return
        }
        newChatArmed.value = true
        newChatError.value = ''
        newChatArmTimer = setTimeout(disarmNewChat, NEW_CHAT_CONFIRM_TIMEOUT_MS)
    }

    // A human agent taking the chat over (or the last message going away) hides the
    // control; the open question goes with it, or a visitor could confirm their way
    // out of a live handover the moment a person joined.
    watch(canStartNewChat, (can) => {
        if (!can) disarmNewChat()
    })

    // Close the session, drop the local conversation, and reconnect into a fresh one.
    const handleStartNewChat = async () => {
        if (startingNewChat.value) return
        startingNewChat.value = true
        newChatError.value = ''
        try {
            // Only a confirmed close makes the next conversation a new one. Clearing the
            // transcript after a failed close would show an empty chat that the server
            // still considers open, and the old messages would come back on reconnect.
            const closed = await endChat()
            if (!closed) {
                newChatError.value = NEW_CHAT_FAILED_TEXT
                return
            }
            humanAgent.value = {}
            clearComposer()
            await initializeWidget()
        } catch (error) {
            console.error('Failed to start a new chat:', error)
            newChatError.value = NEW_CHAT_FAILED_TEXT
        } finally {
            startingNewChat.value = false
        }
    }

    // The visitor answered the confirmation.
    const confirmNewChat = async () => {
        if (startingNewChat.value) return
        clearArmTimer()
        await handleStartNewChat()
        // Keep the bar up when it failed, so the message has somewhere to live.
        if (!newChatError.value) newChatArmed.value = false
    }

    const startNewConversationWorkflow = async () => {
        try {
            await initializeWidget()
            await getWorkflowState()
        } catch (error) {
            console.error('Failed to start new conversation:', error)
            throw error
        }
    }

    // The workflow's "start a new conversation" button, shown once a rating is in.
    const handleStartNewConversation = async () => {
        // The workflow's offer (a computed) goes away with the messages.
        messages.value = []
        // humanAgent is only ever set (on takeover, and from loaded history), never
        // cleared, so without this the fresh AI-handled chat would keep the old
        // agent's name in the header, keep attachments enabled, and hide the AI
        // disclaimer while the AI is answering.
        humanAgent.value = {}
        await startNewConversationWorkflow()
    }

    return {
        canStartNewChat,
        startingNewChat,
        newChatError,
        newChatArmed,
        disarmNewChat,
        requestNewChat,
        confirmNewChat,
        handleStartNewChat,
        handleStartNewConversation,
    }
}
