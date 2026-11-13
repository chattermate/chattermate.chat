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

import { nextTick, ref, watch, type Ref, type WatchSource } from 'vue'

/**
 * Keeps the message list scrolled to the bottom: on every change to the messages,
 * and whenever something that sits after them (the confirm card, a page message,
 * a receipt, the typing bubble) shows up.
 */
export function useChatScroll(messages: Readonly<Ref<unknown[]>>, followers: WatchSource<unknown>[]) {
    // Bound to the message list in the view (ref="messagesContainer").
    const messagesContainer = ref<HTMLElement | null>(null)

    const scrollToBottom = () => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    }

    // Scroll to bottom when new messages arrive
    watch(() => messages.value, () => {
        nextTick(() => {
            scrollToBottom()
        })
    }, { deep: true })

    // The confirm card, a page or journey message and the typing bubble can sit after
    // the messages, so a new one is below the fold unless the list follows it.
    watch(followers, (values) => {
        if (values.some(Boolean)) nextTick(() => scrollToBottom())
    })

    return { messagesContainer, scrollToBottom }
}
