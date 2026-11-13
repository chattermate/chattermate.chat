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

import { computed, ref, watch, type Ref } from 'vue'
import { isValidEmail } from '../types/widget'
import { looksSecret } from '../utils/secretGuard'
import { revokeBlobUrls } from './useWidgetFiles'

/** A file staged in the composer (see useWidgetFiles). */
export interface StagedAttachment {
    content: string
    filename: string
    type: string
    size: number
    url?: string
    file_url?: string
}

export interface OutgoingFile {
    content: string
    filename: string
    content_type: string
    size: number
}

/** The parts of the widget socket the composer reads and sends through. */
export interface ComposerSocket {
    loading: Ref<boolean>
    hasStartedChat: Ref<boolean>
    connectionStatus: Ref<string>
    sendMessage: (text: string, email: string, files: OutgoingFile[], extra: Record<string, unknown>) => Promise<unknown>
}

export interface ComposerOptions {
    socket: ComposerSocket
    emailGate: { emailInput: Ref<string>; shouldCollectEmail: Readonly<Ref<boolean>> }
    hasConversationToken: Ref<boolean>
    isAskAnythingStyle: Readonly<Ref<boolean>>
    uploadedAttachments: Ref<StagedAttachment[]>
    /** Authorizes the visitor; runs before the first message once an email is typed. */
    authorize: () => Promise<unknown>
    /** Runs just before a message goes out; returns extra fields to send with it. */
    beforeSend: () => Record<string, unknown>
    /** Runs once the message is out and the box is cleared. */
    afterSend: () => void
    /**
     * Whether this is a workflow agent, which opens the box before the email is in.
     * Read at call time: the authorize call can turn workflow mode on.
     */
    isWorkflowAgent: () => boolean
    /**
     * The redesigned panel keeps the box and the suggestions usable while it asks
     * for the email: while this is true a send is held, not sent, and goes out by
     * itself once it turns false (the email is in). Absent for the classic widget,
     * which hides the box behind its email gate instead.
     */
    holdForEmail?: Readonly<Ref<boolean>>
    /** A send was just held for the email: ask for it (submit what was typed). */
    askForEmail?: () => void
}

const toOutgoingFile = (file: StagedAttachment): OutgoingFile => ({
    content: file.content, // base64 content
    filename: file.filename,
    content_type: file.type,
    size: file.size,
})

/**
 * The message box: what is typed, whether it can be typed into or sent, and the
 * send itself. A message typed while a reply is still coming is held and sent the
 * moment the reply lands.
 */
export function useComposer({
    socket,
    emailGate,
    hasConversationToken,
    isAskAnythingStyle,
    uploadedAttachments,
    authorize,
    beforeSend,
    afterSend,
    isWorkflowAgent,
    holdForEmail = computed(() => false),
    askForEmail = () => {},
}: ComposerOptions) {
    const { loading, hasStartedChat, connectionStatus } = socket
    const { emailInput, shouldCollectEmail } = emailGate

    const newMessage = ref('')

    // Neither sending a second agent run nor dropping what the visitor typed is
    // right while a reply is in flight: hold it (see the watch below).
    const pendingSend = ref(false)

    // A pasted password, key or card number is held back (the server also hides them).
    const secretInMessage = computed(() => looksSecret(newMessage.value))

    const canSendWhenIdle = () => connectionStatus.value === 'connected' && !loading.value

    // A message held until the email is in (redesigned panel only, see holdForEmail).
    const heldForEmail = ref(false)

    const isMessageInputEnabled = computed(() => {
        // While the panel holds sends for the email, the box stays usable whatever
        // the connection does (accepting the email reconnects it): a send only
        // waits, and goes out once the email is in and the socket is connected.
        if (holdForEmail.value) return true
        // A conversation already started, or no email to collect (Ask AI, or
        // collect_email off): only the connection and a reply in flight matter.
        if ((hasStartedChat.value && hasConversationToken.value) || !shouldCollectEmail.value) {
            return canSendWhenIdle()
        }
        return (isValidEmail(emailInput.value.trim()) && canSendWhenIdle()) || isWorkflowAgent()
    })

    // Whether the field accepts typing. Same as sending, except a reply in flight
    // does not close the field: disabling an input blurs it, so the visitor lost
    // their cursor after every reply (#316). Sending stays gated on
    // isMessageInputEnabled, so a second message cannot jump the queue.
    const canTypeMessage = computed(() => isMessageInputEnabled.value || (
        loading.value && connectionStatus.value === 'connected' && hasStartedChat.value
    ))

    const placeholderText = computed(() => {
        if (connectionStatus.value !== 'connected') return 'Connecting...'
        return isAskAnythingStyle.value ? 'Ask me anything...' : 'Type a message...'
    })

    const sendMessage = async () => {
        if (!newMessage.value.trim() && uploadedAttachments.value.length === 0) return
        if (secretInMessage.value) return

        // Nothing reaches the agent before the email does: hold it and ask.
        if (holdForEmail.value) {
            heldForEmail.value = true
            askForEmail()
            return
        }

        if (loading.value && hasStartedChat.value) {
            pendingSend.value = true
            return
        }

        // The first message authorizes with the email the visitor typed.
        if (!hasStartedChat.value && emailInput.value) {
            await authorize()
        }

        const files = uploadedAttachments.value.map(toOutgoingFile)
        const extra = beforeSend()

        await socket.sendMessage(newMessage.value, emailInput.value, files, extra)

        uploadedAttachments.value.forEach(revokeBlobUrls)
        newMessage.value = ''
        uploadedAttachments.value = []
        afterSend()
    }

    // Release a queued message once the reply lands. Ending a chat also clears
    // `loading`, so hasStartedChat tells the two apart: a conversation the visitor
    // just closed must not receive the message typed into the one before it. A drop
    // leaves it in the box, where the composer shows it has not been sent.
    watch(loading, (isReplying) => {
        if (isReplying || !pendingSend.value) return
        pendingSend.value = false
        if (connectionStatus.value === 'connected' && hasStartedChat.value) void sendMessage()
    })

    // Release a message held for the email once the email is in and the socket is
    // connected: accepting the email reconnects it with the visitor's token, so the
    // email usually lands a moment before the connection does. Until then (or while
    // the connection is down) it waits, visibly, in the box.
    watch([holdForEmail, connectionStatus], ([holding, status]) => {
        if (holding || !heldForEmail.value || status !== 'connected') return
        heldForEmail.value = false
        void sendMessage()
    })

    // The visitor emptied the box while a message waited for the email: nothing waits now.
    watch([newMessage, () => uploadedAttachments.value.length], () => {
        if (heldForEmail.value && !newMessage.value.trim() && uploadedAttachments.value.length === 0) {
            heldForEmail.value = false
        }
    })

    // Send a predefined quick action (a suggestion, a page's text reply): the normal
    // send path with the label text. Not while a typed message waits for the email:
    // the label would replace it, and only the label would go out.
    const sendQuickAction = (label: string) => {
        if (!isMessageInputEnabled.value || heldForEmail.value) return
        newMessage.value = label
        sendMessage()
    }

    // Empties the box and drops staged files (a new chat starts clean).
    const clearComposer = () => {
        newMessage.value = ''
        uploadedAttachments.value = []
        heldForEmail.value = false
    }

    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            event.stopPropagation()
            sendMessage()
        }
    }

    return {
        newMessage,
        pendingSend,
        heldForEmail,
        secretInMessage,
        isMessageInputEnabled,
        canTypeMessage,
        placeholderText,
        sendMessage,
        sendQuickAction,
        handleKeyPress,
        clearComposer,
    }
}
