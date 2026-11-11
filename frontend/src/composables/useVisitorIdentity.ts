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

import { postToHost } from '../webclient/host-bridge'
import { hostSharesIdentity, isFramed, tokenStoreFor } from '../webclient/frame-session'
import { useConversationToken, sanitizeToken } from './useConversationToken'

export interface VisitorIdentityOptions {
    /** The widget whose token store this is (read once, at setup). */
    widgetId: string
    /** Hands a new token to the open socket. */
    setSocketToken: (token: string) => void
    /** Authorizes and reconnects with whatever token is current now. */
    reauthorize: () => Promise<unknown>
}

/**
 * The visitor's conversation token and the identity hand-offs with the host page:
 * the token is rotated before it lapses, the host hears about every change, and
 * an identity nobody can renew gives way to an anonymous visitor.
 */
export function useVisitorIdentity({ widgetId, setSocketToken, reauthorize }: VisitorIdentityOptions) {
    // The conversation token, kept alive by useConversationToken: it rotates before the
    // token lapses so a page left open for hours doesn't drop an identified visitor.
    const {
        token,
        start: startTokenLifecycle,
        stop: stopTokenLifecycle,
        setToken: adoptToken,
        ensureFresh: ensureFreshToken
    } = useConversationToken({
        onTokenChanged: (next) => {
            if (hostSharesIdentity()) postToHost({ type: 'TOKEN_UPDATE', token: next })
            // The open socket authenticated with the previous token and re-checks it on
            // later events; without this a conversation that outlives its token starts
            // failing authentication mid-chat.
            setSocketToken(next)
        },
        onIdentityExpired: () => {
            handleIdentityExpired()
        },
        // A framed widget holds the token only in memory: the host page keeps it, so
        // it must hear when the widget lets it go.
        onTokenCleared: () => {
            if (isFramed() && hostSharesIdentity()) postToHost({ type: 'TOKEN_CLEAR' })
        },
        store: tokenStoreFor(widgetId)
    })

    /**
     * The visitor's identity ran out and the widget cannot renew it on its own: only the
     * host page can mint a token (that needs the org's API key). Tell it, and let it
     * answer with TOKEN_REFRESH. Nothing is destroyed here - the conversation on screen
     * stays exactly where it is.
     */
    const handleIdentityExpired = () => {
        // A page that can't share identity will never answer: carry on anonymously
        if (!hostSharesIdentity()) {
            void continueAnonymously()
            return
        }
        postToHost({ type: 'IDENTITY_EXPIRED' })
    }

    /** Drop an identity nobody can renew and carry on as an anonymous visitor. */
    const continueAnonymously = async () => {
        if (!token.value) return
        adoptToken(null)
        await reauthorize()
    }

    /** Adopt a token the host page supplied, then re-authorize without a rebuild. */
    const adoptHostToken = async (hostToken: unknown) => {
        const next = sanitizeToken(hostToken)
        if (!next || next === token.value) return
        adoptToken(next)
        await reauthorize()
    }

    return {
        token,
        startTokenLifecycle,
        stopTokenLifecycle,
        adoptToken,
        ensureFreshToken,
        handleIdentityExpired,
        continueAnonymously,
        adoptHostToken,
    }
}
