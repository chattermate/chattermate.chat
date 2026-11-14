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

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@/services/api', () => ({ default: api }))

import { chatService } from '@/services/chat'
import emitter from '@/utils/emitter'

const counts = { open: 2, waiting_for_human: 1, assigned_to_me: 0, ai_handling: 1, negative: 0, resolved_by_ai_today: 0, channels: {} }

describe('chatService.getInboxCounts', () => {
  beforeEach(() => api.get.mockReset())

  it("shares one request between callers at the same moment, and tells the app what it got", async () => {
    let answer!: (value: unknown) => void
    api.get.mockReturnValueOnce(new Promise((resolve) => { answer = resolve }))
    const heard = vi.fn()
    emitter.on('inbox-counts', heard)

    const first = chatService.getInboxCounts()
    const second = chatService.getInboxCounts()
    answer({ data: counts })

    expect(await first).toEqual(counts)
    expect(await second).toEqual(counts)
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(api.get).toHaveBeenCalledWith('/chats/counts', { params: { today_start: expect.any(String) } })
    expect(heard).toHaveBeenCalledWith(counts)
    emitter.off('inbox-counts', heard)
  })

  it('asks again once the last answer is in, and after a failure', async () => {
    api.get.mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce({ data: counts })

    await expect(chatService.getInboxCounts()).rejects.toThrow('down')
    await expect(chatService.getInboxCounts()).resolves.toEqual(counts)
    expect(api.get).toHaveBeenCalledTimes(2)
  })
})
