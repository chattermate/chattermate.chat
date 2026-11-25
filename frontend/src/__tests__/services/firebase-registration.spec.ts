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

const mocks = vi.hoisted(() => ({
  getSWRegistration: vi.fn(),
  isSupported: vi.fn(),
  getToken: vi.fn(),
  updateFCMToken: vi.fn(),
  requestPermission: vi.fn(),
}))

vi.mock('@/pwa/register', () => ({
  getSWRegistration: mocks.getSWRegistration,
  isShopifyEmbedded: () => false,
}))
vi.mock('firebase/messaging', () => ({
  isSupported: mocks.isSupported,
  getMessaging: vi.fn(() => ({})),
  getToken: mocks.getToken,
  deleteToken: vi.fn().mockResolvedValue(true),
  onMessage: vi.fn(),
}))
vi.mock('@/services/user', () => ({
  userService: { updateFCMToken: mocks.updateFCMToken },
}))

const setPermission = (permission: NotificationPermission) => {
  Object.defineProperty(window, 'Notification', {
    value: { permission, requestPermission: mocks.requestPermission },
    configurable: true,
  })
}

describe('device registration state', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    // A production build, which ships the app service worker
    vi.stubEnv('DEV', false)
    mocks.getSWRegistration.mockResolvedValue({})
    mocks.isSupported.mockResolvedValue(true)
    mocks.getToken.mockResolvedValue('device_token')
    mocks.updateFCMToken.mockResolvedValue({})
    setPermission('granted')
  })

  it('reads registered once the server has the token', async () => {
    const { refreshFCMToken, deviceRegistration } = await import('@/services/firebase')
    expect(deviceRegistration.value).toBe('idle')

    const pending = refreshFCMToken()
    await Promise.resolve()
    expect(deviceRegistration.value).toBe('registering')
    expect(await pending).toBe(true)
    expect(deviceRegistration.value).toBe('registered')
  })

  it('reads failed when the server rejects the token', async () => {
    mocks.updateFCMToken.mockRejectedValueOnce(new Error('500'))
    const { refreshFCMToken, deviceRegistration } = await import('@/services/firebase')

    expect(await refreshFCMToken()).toBe(false)
    expect(deviceRegistration.value).toBe('failed')
  })

  it('stays quiet on the vite dev server, which has no service worker by design', async () => {
    vi.stubEnv('DEV', true)
    const { refreshFCMToken, deviceRegistration } = await import('@/services/firebase')

    expect(await refreshFCMToken()).toBe(false)
    expect(deviceRegistration.value).toBe('unsupported')
    expect(mocks.getToken).not.toHaveBeenCalled()
  })

  it('reads failed when no service worker is there to bind to', async () => {
    mocks.getSWRegistration.mockResolvedValueOnce(undefined)
    const { refreshFCMToken, deviceRegistration } = await import('@/services/firebase')

    expect(await refreshFCMToken()).toBe(false)
    expect(deviceRegistration.value).toBe('failed')
  })

  it('reads unsupported in a browser without push', async () => {
    mocks.isSupported.mockResolvedValueOnce(false)
    const { refreshFCMToken, deviceRegistration } = await import('@/services/firebase')

    expect(await refreshFCMToken()).toBe(false)
    expect(deviceRegistration.value).toBe('unsupported')
  })

  it('recovers on a second try', async () => {
    mocks.getToken.mockRejectedValueOnce(new Error('fcm down'))
    const { refreshFCMToken, deviceRegistration } = await import('@/services/firebase')

    await refreshFCMToken()
    expect(deviceRegistration.value).toBe('failed')
    expect(await refreshFCMToken()).toBe(true)
    expect(deviceRegistration.value).toBe('registered')
  })

  it('goes back to idle on logout, and a registration that straddles it leaves no state', async () => {
    let release: (token: string) => void = () => {}
    mocks.getToken.mockReturnValueOnce(new Promise<string>((resolve) => { release = resolve }))
    const { refreshFCMToken, dropFCMSubscription, deviceRegistration } = await import('@/services/firebase')

    const pending = refreshFCMToken()
    await new Promise((resolve) => setTimeout(resolve, 0))
    dropFCMSubscription()
    expect(deviceRegistration.value).toBe('idle')

    release('device_token')
    await pending
    expect(deviceRegistration.value).toBe('idle')
  })

  it('tracks the permission the user gives', async () => {
    setPermission('default')
    mocks.requestPermission.mockImplementationOnce(async () => {
      setPermission('denied')
      return 'denied'
    })
    const { requestNotificationPermission, notificationPermission } = await import('@/services/firebase')
    expect(notificationPermission.value).toBe('default')

    expect(await requestNotificationPermission()).toBe(false)
    expect(notificationPermission.value).toBe('denied')
  })
})
