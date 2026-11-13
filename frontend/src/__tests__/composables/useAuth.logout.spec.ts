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
  push: vi.fn(),
  logout: vi.fn(),
  drop: vi.fn(),
  calls: [] as string[],
}))

vi.mock('vue-router', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/services/user', () => ({ userService: { getCurrentUser: () => null } }))
vi.mock('@/services/auth', () => ({ authService: { logout: mocks.logout } }))
vi.mock('@/services/firebase', () => ({
  thisDeviceFCMToken: () => 'device_token',
  dropFCMSubscription: mocks.drop,
}))

import { useAuth } from '@/composables/useAuth'

describe('useAuth.logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.calls.length = 0
    mocks.logout.mockImplementation(async () => { mocks.calls.push('logout') })
    mocks.drop.mockImplementation(() => { mocks.calls.push('drop') })
    mocks.push.mockImplementation(() => { mocks.calls.push('push') })
  })

  it('sends this device token with the logout, then cleans up FCM without waiting', async () => {
    await useAuth().logout()

    expect(mocks.logout).toHaveBeenCalledWith('device_token')
    expect(mocks.calls).toEqual(['logout', 'drop', 'push'])
  })

  it('keeps push and stays put when the logout request fails', async () => {
    mocks.logout.mockRejectedValue(new Error('Logout failed'))
    const { logout, error } = useAuth()

    await logout()

    expect(mocks.drop).not.toHaveBeenCalled()
    expect(mocks.push).not.toHaveBeenCalled()
    expect(error.value).toBe('Logout failed')
  })
})
