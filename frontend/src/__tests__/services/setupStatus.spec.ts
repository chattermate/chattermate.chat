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

const api = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/services/api', () => ({ default: api }))

describe('getSetupStatus', () => {
  it('asks until setup is done, then never again', async () => {
    const { getSetupStatus } = await import('@/services/organization')
    api.get.mockResolvedValueOnce({ data: { is_setup: false } })
    expect(await getSetupStatus()).toBe(false)
    api.get.mockRejectedValueOnce(new Error('down'))
    expect(await getSetupStatus()).toBe(false)
    api.get.mockResolvedValueOnce({ data: { is_setup: true } })
    expect(await getSetupStatus()).toBe(true)

    expect(await getSetupStatus()).toBe(true)
    expect(await getSetupStatus()).toBe(true)
    expect(api.get).toHaveBeenCalledTimes(3)
  })
})
