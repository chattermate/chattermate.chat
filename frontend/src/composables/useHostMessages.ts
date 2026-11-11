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

import { handleCartMessage } from '../webclient/shopify-cart'
import { postToHost } from '../webclient/host-bridge'
import { hostSharesIdentity, isFramed, setHostPageUrl } from '../webclient/frame-session'
import type { WidgetDisplay } from './useWidgetDisplay'

export interface HostMessageHandlers {
    scrollToBottom: () => void
    /** The host is replacing the visitor: close their session, then answer. */
    endChatForHost: (sessionId: unknown) => Promise<void>
    continueAnonymously: () => Promise<void>
    adoptHostToken: (token: unknown) => Promise<void>
    /** The loader reports whether the widget is open (WIDGET_VISIBILITY). */
    setHostVisible: (open: boolean) => void
    /** The loader's final display geometry (WIDGET_DISPLAY). */
    setParentDisplay: (display: WidgetDisplay) => void
    /** Prefill (never auto-send) the message box, e.g. ChatterMate.open({ message }). */
    prefill: (text: string) => void
}

/**
 * Messages from the embedding page, plus the Escape forwarder. Registers at once:
 * call it synchronously during setup — NOT from onMounted, which only runs after
 * initializeWidget()'s awaits; the embed loader posts WIDGET_DISPLAY/PREFILL_MESSAGE
 * on iframe load, which would race that gap and be dropped.
 *
 * Pinned current behaviour (bug): neither window listener is ever removed.
 */
export function useHostMessages(handlers: HostMessageHandlers) {
    // (The handler bodies run on later macrotasks, so whatever the handlers reach
    // that is set up later in the widget's setup is initialized by then.)
    window.addEventListener('message', (event) => {
        // Only the embedding page (the loader, or the dashboard preview) may drive the
        // widget; hostile sibling frames can reach this window via top.frames[i].
        if (event.source !== window.parent) return
        if (!event.data || typeof event.data.type !== 'string') return
        if (handleCartMessage(event.data)) return
        if (event.data.type === 'SCROLL_TO_BOTTOM') {
            handlers.scrollToBottom()
        }
        if (event.data.type === 'HOST_PAGE') {
            // The embedding page navigated (SPA route change): leads record where they came from.
            setHostPageUrl(event.data.url)
        }
        if (event.data.type === 'END_CHAT' && hostSharesIdentity()) {
            void handlers.endChatForHost(event.data.sessionId)
        }
        if (event.data.type === 'IDENTITY_UNAVAILABLE' && hostSharesIdentity()) {
            // The host page has no replacement identity for us. Start over as an
            // anonymous visitor rather than leaving the chat stuck: they can still talk
            // to the agent, they are just no longer signed in.
            void handlers.continueAnonymously()
        }
        if (event.data.type === 'TOKEN_REFRESH' && hostSharesIdentity()) {
            // The host page issued a replacement token (usually answering
            // IDENTITY_EXPIRED). Adopt it and re-authorize in place: rebuilding the frame
            // would throw away the conversation the visitor is looking at.
            void handlers.adoptHostToken(event.data.token)
        }
        if (event.data.type === 'WIDGET_VISIBILITY') {
            // The loader reports open/closed. Without this the Ask AI palette would
            // autofocus its input while the widget is still hidden — the iframe is
            // created eagerly on page load, so focus would leave the host page.
            handlers.setHostVisible(!!event.data.open)
        }
        if (event.data.type === 'WIDGET_DISPLAY') {
            // The embed loader's final display geometry (developer options merged with
            // dashboard defaults) — drives the fill-the-iframe sizing.
            handlers.setParentDisplay({
                mode: event.data.mode,
                width: event.data.width,
                height: event.data.height,
                hotkey: event.data.hotkey,
            })
        }
        if (event.data.type === 'PREFILL_MESSAGE' && typeof event.data.text === 'string') {
            handlers.prefill(event.data.text.slice(0, 2000))
        }
    })

    // Escape inside the frame never reaches the page's own key handlers, so the loader
    // is told (it closes a drawer on it). The Ask AI palette handles its own.
    // Pinned current behaviour (bug): this runs before the palette sees the key, so one
    // Escape in the palette posts both WIDGET_ESCAPE and WIDGET_MINIMIZE.
    window.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || event.defaultPrevented || !isFramed()) return
        postToHost({ type: 'WIDGET_ESCAPE' })
    })
}
