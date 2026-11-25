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

import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'

const mocks = vi.hoisted(() => ({
  requestNotificationPermission: vi.fn(),
}))

vi.mock('@/services/firebase', () => ({
  requestNotificationPermission: mocks.requestNotificationPermission,
  refreshFCMToken: vi.fn(),
  getMessagingIfSupported: vi.fn().mockResolvedValue(null),
  notificationPermission: ref('granted'),
}))
vi.mock('vue-sonner', () => ({ toast: Object.assign(vi.fn(), { error: vi.fn() }) }))

describe('enableNotifications', () => {
  it('shares one run between the button and the permission-change event', async () => {
    let answer: (granted: boolean) => void = () => {}
    mocks.requestNotificationPermission.mockReturnValueOnce(new Promise<boolean>((resolve) => { answer = resolve }))
    const { enableNotifications } = await import('@/composables/useNotifications')

    const fromButton = enableNotifications()
    const fromEvent = enableNotifications()
    answer(true)

    expect(await fromButton).toBe(true)
    expect(await fromEvent).toBe(true)
    expect(mocks.requestNotificationPermission).toHaveBeenCalledTimes(1)

    // Once settled, a later tap runs afresh
    mocks.requestNotificationPermission.mockResolvedValueOnce(true)
    await enableNotifications()
    expect(mocks.requestNotificationPermission).toHaveBeenCalledTimes(2)
  })
})
