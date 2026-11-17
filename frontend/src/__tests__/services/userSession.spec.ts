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

import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/api', () => ({ default: {} }))
vi.mock('@/services/users', () => ({ uploadProfilePic: vi.fn() }))

const forgetAccessToken = vi.fn()
vi.mock('@/services/sessionClock', () => ({
  forgetAccessToken: () => forgetAccessToken(),
}))

import { userService } from '@/services/user'
import type { User } from '@/types/user'

const someone = { id: 'u1', email: 'a@example.test', full_name: 'A' } as User

describe('userService session deadline', () => {
  beforeEach(() => {
    userService.clearCurrentUser()
    vi.clearAllMocks()
  })

  it('leaves the clock alone when the user is stored or updated', () => {
    userService.setCurrentUser(someone)
    userService.setCurrentUser({ ...someone, full_name: 'B' })

    expect(forgetAccessToken).not.toHaveBeenCalled()
  })

  it('forgets the clock on sign-out', () => {
    userService.setCurrentUser(someone)
    userService.clearCurrentUser()

    expect(forgetAccessToken).toHaveBeenCalledTimes(1)
  })
})
