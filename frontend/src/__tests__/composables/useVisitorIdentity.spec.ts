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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const page = vi.hoisted(() => ({ framed: false, sharesIdentity: true }))

vi.mock('@/webclient/host-bridge', () => ({ postToHost: vi.fn() }))
vi.mock('@/webclient/frame-session', () => ({
    isFramed: () => page.framed,
    hostSharesIdentity: () => page.sharesIdentity,
    // An in-memory store, so nothing leaks between tests.
    tokenStoreFor: () => {
        let saved: string | null = null
        return { read: () => saved, write: (t: string) => { saved = t }, clear: () => { saved = null } }
    },
}))

import { postToHost } from '@/webclient/host-bridge'
import { useVisitorIdentity } from '@/composables/useVisitorIdentity'

const posted = () => vi.mocked(postToHost).mock.calls.map(([message]) => message.type)

const setup = (initialToken: string | null = 'tok-1') => {
    const setSocketToken = vi.fn()
    const reauthorize = vi.fn(async () => true)
    const identity = useVisitorIdentity({ widgetId: 'w1', setSocketToken, reauthorize })
    if (initialToken) identity.adoptToken(initialToken)
    vi.mocked(postToHost).mockClear()
    setSocketToken.mockClear()
    return { ...identity, setSocketToken, reauthorize }
}

describe('useVisitorIdentity', () => {
    beforeEach(() => {
        page.framed = false
        page.sharesIdentity = true
    })

    afterEach(() => {
        vi.clearAllMocks()
        vi.useRealTimers()
    })

    describe('when the identity expires', () => {
        it('asks a host page that shares identity for a new token, keeping the current one', () => {
            const identity = setup()
            identity.handleIdentityExpired()
            expect(posted()).toEqual(['IDENTITY_EXPIRED'])
            expect(identity.token.value).toBe('tok-1')
            expect(identity.reauthorize).not.toHaveBeenCalled()
        })

        it('carries on anonymously when the host page cannot share identity', async () => {
            page.sharesIdentity = false
            const identity = setup()
            identity.handleIdentityExpired()
            await Promise.resolve()
            expect(posted()).not.toContain('IDENTITY_EXPIRED')
            expect(identity.token.value).toBeNull()
            expect(identity.reauthorize).toHaveBeenCalledOnce()
        })
    })

    it('continuing anonymously without a token does nothing', async () => {
        const identity = setup(null)
        await identity.continueAnonymously()
        expect(identity.reauthorize).not.toHaveBeenCalled()
    })

    describe('adoptHostToken', () => {
        it.each([
            ['nothing', undefined],
            ['an empty string', '   '],
            ['a stringified nothing', 'undefined'],
            ['the token it already holds', 'tok-1'],
        ])('ignores %s', async (_label, hostToken) => {
            const identity = setup()
            await identity.adoptHostToken(hostToken)
            expect(identity.token.value).toBe('tok-1')
            expect(identity.reauthorize).not.toHaveBeenCalled()
        })

        it('adopts a new token, hands it to the socket and the host, then re-authorizes', async () => {
            const identity = setup()
            await identity.adoptHostToken(' tok-2 ')
            expect(identity.token.value).toBe('tok-2')
            expect(identity.setSocketToken).toHaveBeenCalledWith('tok-2')
            expect(vi.mocked(postToHost)).toHaveBeenCalledWith({ type: 'TOKEN_UPDATE', token: 'tok-2' })
            expect(identity.reauthorize).toHaveBeenCalledOnce()
        })
    })

    describe('letting the token go', () => {
        it('tells the host page (TOKEN_CLEAR) when the widget is framed', async () => {
            page.framed = true
            const identity = setup()
            await identity.continueAnonymously()
            expect(posted()).toContain('TOKEN_CLEAR')
        })

        it('says nothing when the widget is not framed', async () => {
            const identity = setup()
            await identity.continueAnonymously()
            expect(identity.token.value).toBeNull()
            expect(posted()).not.toContain('TOKEN_CLEAR')
        })
    })
})
