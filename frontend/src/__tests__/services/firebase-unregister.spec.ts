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

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  // Never resolves — stands in for getSWRegistration()'s 8s timeout when no
  // service worker is ready.
  getSWRegistration: vi.fn(() => new Promise<unknown>(() => {})),
  isSupported: vi.fn().mockResolvedValue(true),
  getToken: vi.fn().mockResolvedValue('device_token'),
  deleteToken: vi.fn().mockResolvedValue(true),
  updateFCMToken: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/pwa/register', () => ({
  getSWRegistration: mocks.getSWRegistration,
  isShopifyEmbedded: () => false,
}))
vi.mock('firebase/messaging', () => ({
  isSupported: mocks.isSupported,
  getMessaging: vi.fn(() => ({})),
  getToken: mocks.getToken,
  deleteToken: mocks.deleteToken,
  onMessage: vi.fn(),
}))
vi.mock('@/services/user', () => ({
  userService: { updateFCMToken: mocks.updateFCMToken },
}))

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('logout push cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'granted' },
      configurable: true,
    })
  })

  it('hands logout the token this load registered, without minting one', async () => {
    mocks.getSWRegistration.mockResolvedValueOnce({})
    const { refreshFCMToken, thisDeviceFCMToken } = await import('@/services/firebase')

    expect(thisDeviceFCMToken()).toBeNull()
    await refreshFCMToken()
    expect(thisDeviceFCMToken()).toBe('device_token')
    expect(mocks.getToken).toHaveBeenCalledTimes(1)
  })

  it('returns at once on a stalled service worker instead of holding logout open', async () => {
    // Regression: logout used to wait on getToken(), which sits behind
    // getSWRegistration's 8s timeout when no worker is ready.
    const { thisDeviceFCMToken, dropFCMSubscription } = await import('@/services/firebase')

    expect(thisDeviceFCMToken()).toBeNull()
    dropFCMSubscription()
    expect(mocks.getSWRegistration).not.toHaveBeenCalled()

    await flush()
    expect(mocks.deleteToken).toHaveBeenCalledTimes(1)
  })

  it('forgets the token, so the next account cannot name this device', async () => {
    mocks.getSWRegistration.mockResolvedValueOnce({})
    const { refreshFCMToken, thisDeviceFCMToken, dropFCMSubscription } = await import('@/services/firebase')
    await refreshFCMToken()

    dropFCMSubscription()
    expect(thisDeviceFCMToken()).toBeNull()
  })

  it('a sign-in right after waits for the deletion instead of racing it', async () => {
    let finishDelete!: () => void
    mocks.deleteToken.mockReturnValueOnce(new Promise((resolve) => { finishDelete = () => resolve(true) }))
    mocks.getSWRegistration.mockResolvedValueOnce({})
    const { refreshFCMToken, dropFCMSubscription } = await import('@/services/firebase')

    dropFCMSubscription()
    const registering = refreshFCMToken()
    await flush()
    expect(mocks.getToken).not.toHaveBeenCalled()

    finishDelete()
    await registering
    expect(mocks.getToken).toHaveBeenCalledTimes(1)
  })

  it('a registration that straddles a logout does not hand its token to the next account', async () => {
    let finishToken!: (t: string) => void
    mocks.getToken.mockReturnValueOnce(new Promise((resolve) => { finishToken = resolve }))
    mocks.getSWRegistration.mockResolvedValueOnce({})
    const { refreshFCMToken, thisDeviceFCMToken, dropFCMSubscription } = await import('@/services/firebase')

    const registering = refreshFCMToken()
    await flush()
    dropFCMSubscription()
    await flush()
    // Deleting mid-getToken could leave the new subscription alive
    expect(mocks.deleteToken).not.toHaveBeenCalled()

    finishToken('old_token')
    await registering
    await flush()
    expect(thisDeviceFCMToken()).toBeNull()
    expect(mocks.deleteToken).toHaveBeenCalledTimes(1)
  })

  it('leaves FCM alone when notification permission was never granted', async () => {
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'default' },
      configurable: true,
    })
    const { dropFCMSubscription } = await import('@/services/firebase')

    dropFCMSubscription()
    await flush()
    expect(mocks.deleteToken).not.toHaveBeenCalled()
  })
})
