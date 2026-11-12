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
import { nextTick, ref } from 'vue'

const refreshSession = vi.hoisted(() => vi.fn())
vi.mock('@/services/api', () => ({ refreshSession }))
vi.mock('@/config/api', () => ({
  myAvatarUrl: (v?: number) => `/api/v1/users/me/avatar?t=${v}`,
}))

import { useMyAvatar } from '@/composables/useMyAvatar'

describe('useMyAvatar', () => {
  const fetchStatus = (status: number) =>
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status }))

  beforeEach(() => {
    refreshSession.mockReset()
    vi.spyOn(Date, 'now').mockReturnValue(1)
    fetchStatus(401)
  })

  it('has no URL when the user has no picture', () => {
    const { src } = useMyAvatar(() => undefined)
    expect(src.value).toBeNull()
  })

  it('renews the lapsed session and asks again when the image fails', async () => {
    // The access cookie lasts 30 minutes and an <img> can't refresh it
    refreshSession.mockResolvedValue({})
    const { src, failed, onError } = useMyAvatar(() => 'profile_pics/me.png')
    const before = src.value
    vi.mocked(Date.now).mockReturnValue(2)

    await onError()

    expect(refreshSession).toHaveBeenCalledTimes(1)
    expect(src.value).not.toBe(before)
    expect(failed.value).toBe(false)
  })

  it('falls back without touching the session when the picture is just gone', async () => {
    fetchStatus(404)
    const { failed, onError } = useMyAvatar(() => 'profile_pics/me.png')

    await onError()

    expect(refreshSession).not.toHaveBeenCalled()
    expect(failed.value).toBe(true)
  })

  it('gives up after one retry so a missing picture cannot loop', async () => {
    refreshSession.mockResolvedValue({})
    const { failed, onError } = useMyAvatar(() => 'profile_pics/me.png')

    await onError()
    await onError()

    expect(refreshSession).toHaveBeenCalledTimes(1)
    expect(failed.value).toBe(true)
  })

  it('falls back when the session cannot be renewed', async () => {
    refreshSession.mockRejectedValue(new Error('401'))
    const { failed, onError } = useMyAvatar(() => 'profile_pics/me.png')

    await onError()

    expect(failed.value).toBe(true)
  })

  it('a new picture gets a fresh URL and a fresh retry', async () => {
    refreshSession.mockRejectedValue(new Error('401'))
    const pic = ref('profile_pics/a.png')
    const { src, failed, onError } = useMyAvatar(() => pic.value)
    await onError()
    expect(failed.value).toBe(true)

    vi.mocked(Date.now).mockReturnValue(5)
    pic.value = 'profile_pics/b.png'
    await nextTick()

    expect(failed.value).toBe(false)
    expect(src.value).toBe('/api/v1/users/me/avatar?t=5')
  })
})
