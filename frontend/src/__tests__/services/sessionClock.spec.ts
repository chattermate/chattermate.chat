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

import { afterEach, describe, expect, it, vi } from 'vitest'
import { accessTokenExpired, forgetAccessToken, noteAccessTokenIssued } from '@/services/sessionClock'

const MINUTE = 60 * 1000
const lasting = (seconds: string) => ({ 'x-access-token-expires-in': seconds })

describe('sessionClock', () => {
  afterEach(() => {
    forgetAccessToken()
    vi.restoreAllMocks()
  })

  it('knows nothing until a token is issued', () => {
    expect(accessTokenExpired()).toBe(false)
  })

  it('counts a token live until a minute before the lifetime the server gave', () => {
    noteAccessTokenIssued(lasting('1800'), 0)

    expect(accessTokenExpired(28 * MINUTE)).toBe(false)
    expect(accessTokenExpired(29 * MINUTE)).toBe(true)
  })

  it('follows the server when it changes the lifetime', () => {
    noteAccessTokenIssued(lasting('900'), 0)

    expect(accessTokenExpired(14 * MINUTE)).toBe(true)
  })

  it('reads axios response headers', () => {
    noteAccessTokenIssued({ get: (name: string) => (name === 'x-access-token-expires-in' ? '1800' : undefined) }, 0)

    expect(accessTokenExpired(29 * MINUTE)).toBe(true)
  })

  it.each([undefined, {}, lasting(''), lasting('soon'), lasting('0')])(
    'leaves the clock alone for a response without a lifetime (%o)',
    (headers) => {
      noteAccessTokenIssued(lasting('1800'), 0)
      noteAccessTokenIssued(headers, 10 * MINUTE)

      expect(accessTokenExpired(29 * MINUTE)).toBe(true)
    },
  )

  it('forgets the deadline', () => {
    noteAccessTokenIssued(lasting('1800'), 0)
    forgetAccessToken()

    expect(accessTokenExpired(60 * MINUTE)).toBe(false)
  })

  it('treats blocked storage as unknown', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(accessTokenExpired()).toBe(false)
  })
})
