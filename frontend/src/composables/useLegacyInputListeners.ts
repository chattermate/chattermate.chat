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

export interface LegacyInputOptions {
    /** The message box text. */
    newMessage: Ref<string>
    sendMessage: () => unknown
    connectionStatus: Readonly<Ref<string>>
    messages: Readonly<Ref<unknown[]>>
}

// Fields to hook, most specific first; the first selector that matches wins.
const INPUT_SELECTORS = [
    '.widget-container input[type="text"]',
    '.chat-container input[type="text"]',
    '.message-input input',
    '.welcome-message-field',
    '.ask-anything-field',
    'input[placeholder*="message"]',
    'input[placeholder*="Type"]',
    'input[placeholder*="Ask"]',
    'input.message-input',
    'textarea',
    // More specific selectors for the widget context
    '.widget-container input',
    '.chat-input input',
    'input'
]

const hasInputField = (node: Node) =>
    node.nodeType === Node.ELEMENT_NODE &&
    ((node as Element).matches('input, textarea') ||
    !!(node as Element).querySelector?.('input, textarea'))

// Inputs inside a rendered form (contact/handoff/workflow forms) manage their own state —
// the message-box native listeners must never hijack them (would steal focus + the value).
const isFormField = (el: EventTarget | null) =>
    !!(el && (el as HTMLElement).closest && (el as HTMLElement).closest('.form-message, .form-fullscreen, .cm-email-gate'))

/**
 * The classic view's input workaround: native listeners on the message fields
 * (found with querySelector, re-attached by a MutationObserver as the DOM changes)
 * keep the message box in sync and send on Enter, bypassing Vue. Classic view only;
 * the panel composer uses plain v-model.
 */
export function useLegacyInputListeners({ newMessage, sendMessage, connectionStatus, messages }: LegacyInputOptions) {
    // MutationObserver to detect DOM changes and re-setup listeners
    let domObserver: MutationObserver | null = null
    let resetupTimer: ReturnType<typeof setTimeout> | null = null
    // Keep track of current input fields for cleanup
    let currentInputFields: HTMLElement[] = []

    // Every deferred listener setup is tracked so unmount can cancel it: a bare
    // setTimeout outlives the component and then touches a document that is gone
    // (surfaced by the test runner as an error after environment teardown).
    const pendingListenerSetups = new Set<ReturnType<typeof setTimeout>>()
    // Set on unmount. The async onMounted can finish after the component is gone and
    // would start listening (or schedule a setup) after the unmount-time cleanup.
    let isUnmounted = false

    // Handle input synchronization (bound in the template)
    const handleInputSync = (event: Event) => {
        const target = event.target as HTMLInputElement
        newMessage.value = target.value
    }

    // Native input handler that bypasses Vue
    const handleNativeInput = (event: Event) => {
        if (isFormField(event.target)) return
        const target = event.target as HTMLInputElement
        newMessage.value = target.value
    }

    // Native keyboard event handlers. Keydown is a fallback for some browsers/contexts.
    const handleNativeKeyPress = (event: KeyboardEvent) => {
        if (isFormField(event.target)) return
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            event.stopPropagation()
            sendMessage()
        }
    }
    const handleNativeKeyDown = handleNativeKeyPress

    // Clean up native event listeners. Pinned current behaviour (bug): they were added
    // with capture=true but are removed without it, so nothing is actually removed.
    const cleanupNativeEventListeners = () => {
        currentInputFields.forEach((input) => {
            input.removeEventListener('input', handleNativeInput)
            input.removeEventListener('keyup', handleNativeInput)
            input.removeEventListener('change', handleNativeInput)
            input.removeEventListener('keypress', handleNativeKeyPress as EventListener)
            input.removeEventListener('keydown', handleNativeKeyDown as EventListener)
        })
        currentInputFields = []
    }

    // Setup native DOM event listeners as fallback
    const setupNativeEventListeners = () => {
        // Clean up existing listeners first
        cleanupNativeEventListeners()

        let inputFields: HTMLElement[] = []
        for (const selector of INPUT_SELECTORS) {
            const fields = document.querySelectorAll<HTMLElement>(selector)
            if (fields.length > 0) {
                inputFields = Array.from(fields)
                break
            }
        }
        if (inputFields.length === 0) return

        // Store reference for cleanup
        currentInputFields = inputFields

        inputFields.forEach((input) => {
            input.addEventListener('input', handleNativeInput, true)
            input.addEventListener('keyup', handleNativeInput, true)
            input.addEventListener('change', handleNativeInput, true)
            input.addEventListener('keypress', handleNativeKeyPress as EventListener, true)
            input.addEventListener('keydown', handleNativeKeyDown as EventListener, true)
        })
    }

    const scheduleNativeListenerSetup = (delayMs: number) => {
        if (isUnmounted) return
        const timer = setTimeout(() => {
            pendingListenerSetups.delete(timer)
            setupNativeEventListeners()
        }, delayMs)
        pendingListenerSetups.add(timer)
    }

    const setupDOMObserver = () => {
        if (domObserver) {
            domObserver.disconnect()
        }

        domObserver = new MutationObserver((mutations) => {
            let shouldResetup = false
            let hasNewInputFields = false

            mutations.forEach((mutation) => {
                // Check if input fields were added/removed
                if (mutation.type === 'childList') {
                    if (Array.from(mutation.addedNodes).some(hasInputField)) {
                        hasNewInputFields = true
                        shouldResetup = true
                    }
                    if (Array.from(mutation.removedNodes).some(hasInputField)) {
                        shouldResetup = true
                    }
                }
            })

            if (shouldResetup) {
                // Debounce to avoid excessive calls
                if (resetupTimer) clearTimeout(resetupTimer)
                resetupTimer = setTimeout(() => {
                    setupNativeEventListeners()
                }, hasNewInputFields ? 50 : 100) // Faster setup for new inputs
            }
        })

        // Observe the widget container for changes
        const widgetContainer = document.querySelector('.widget-container') || document.body
        domObserver.observe(widgetContainer, {
            childList: true,
            subtree: true
        })
    }

    // The DOM may have changed after a send: clear the visible field, then reattach
    // the native listeners.
    const afterMessageSent = () => {
        const inputField = document.querySelector('input[placeholder*="Type a message"]') as HTMLInputElement
        if (inputField) {
            inputField.value = ''
        }
        scheduleNativeListenerSetup(500)
    }

    // After a prefill: focus the chat or welcome input (never the palette's).
    const focusMessageInput = () => {
        const input = document.querySelector<HTMLInputElement>(
            '.message-input input, .welcome-message-field'
        )
        input?.focus()
    }

    // Set up the listeners once the socket connects or the chat gets its first message.
    watch(connectionStatus, (newStatus, oldStatus) => {
        if (newStatus === 'connected' && oldStatus !== 'connected') {
            scheduleNativeListenerSetup(100)
        }
    })
    watch(() => messages.value.length, (newLength, oldLength) => {
        if (newLength > 0 && oldLength === 0) {
            scheduleNativeListenerSetup(100)
        }
    })

    /** Called on mount, once the widget is initialized. Does nothing once stopped. */
    const start = () => {
        if (isUnmounted) return
        setupDOMObserver()

        // Only set up native event listeners if we're in a state where input is
        // expected; otherwise they follow the connection or the first message.
        const hasMessages = messages.value.length > 0
        const isConnected = connectionStatus.value === 'connected'
        const hasInputFields = document.querySelector('input[type="text"], textarea') !== null
        if (hasMessages || isConnected || hasInputFields) {
            scheduleNativeListenerSetup(100)
        }
    }

    /** Called on unmount. */
    const stop = () => {
        if (domObserver) {
            domObserver.disconnect()
            domObserver = null
        }
        if (resetupTimer) {
            clearTimeout(resetupTimer)
            resetupTimer = null
        }
        isUnmounted = true
        pendingListenerSetups.forEach(clearTimeout)
        pendingListenerSetups.clear()

        cleanupNativeEventListeners()
    }

    return { handleInputSync, afterMessageSent, focusMessageInput, start, stop }
}
