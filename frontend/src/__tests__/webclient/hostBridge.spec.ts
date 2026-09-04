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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hostOrigin, postToHost, resetHostOrigin } from '@/webclient/host-bridge'

/**
 * The widget's messages to the embedding page carry the visitor's conversation token,
 * so they are addressed to a specific origin rather than broadcast. The widget must
 * still reach a loader it cannot name, though - being unable to talk to the host is
 * worse than the broadcast this replaces.
 */
describe('host-bridge', () => {
  let post: ReturnType<typeof vi.fn>

  /** Stand in for the embedding page: framed, with the given parent origin. */
  function embeddedIn(parentOrigin: string | null, { referrer = '', ancestors = [] as string[] } = {}) {
    post = vi.fn()
    const parent = {
      postMessage: post,
      get location() {
        if (parentOrigin === null) throw new DOMException('cross-origin', 'SecurityError')
        return { origin: parentOrigin }
      },
    }
    vi.stubGlobal('window', {
      ...window,
      parent,
      location: { origin: 'null', ancestorOrigins: ancestors },
    })
    vi.stubGlobal('document', { ...document, referrer })
  }

  beforeEach(() => resetHostOrigin())

  afterEach(() => {
    vi.unstubAllGlobals()
    resetHostOrigin()
  })

  it('addresses the srcdoc frame’s same-origin parent', () => {
    embeddedIn('https://shop.example')

    postToHost({ type: 'TOKEN_UPDATE', token: 'tok' })

    expect(post).toHaveBeenCalledWith({ type: 'TOKEN_UPDATE', token: 'tok' }, 'https://shop.example')
  })

  it('falls back to the ancestor origin when the parent is cross-origin', () => {
    embeddedIn(null, { ancestors: ['https://ancestor.example'] })

    expect(hostOrigin()).toBe('https://ancestor.example')
  })

  it('falls back to the referrer when there are no ancestor origins', () => {
    embeddedIn(null, { referrer: 'https://referrer.example/support/page?q=1' })

    expect(hostOrigin()).toBe('https://referrer.example')
  })

  it('broadcasts rather than going silent when the host cannot be named', () => {
    embeddedIn(null)

    // A widget that cannot reach its loader is broken; "*" is what shipped before.
    expect(hostOrigin()).toBe('*')
  })

  it('ignores an opaque parent origin', () => {
    embeddedIn('null', { referrer: 'https://referrer.example/' })

    expect(hostOrigin()).toBe('https://referrer.example')
  })

  it('uses its own origin when the widget is not framed at all', () => {
    // The dashboard preview renders the widget inline, so parent === window.
    post = vi.fn()
    const fake: any = { location: { origin: 'https://app.chattermate.chat' }, postMessage: post }
    fake.parent = fake
    vi.stubGlobal('window', fake)

    expect(hostOrigin()).toBe('https://app.chattermate.chat')
  })

  it('resolves the origin once and reuses it', () => {
    embeddedIn('https://shop.example')
    const spy = vi.spyOn(window.parent, 'location', 'get')

    hostOrigin()
    hostOrigin()
    postToHost({ type: 'UNREAD_COUNT', count: 1 })

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
