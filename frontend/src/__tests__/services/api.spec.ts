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
import { AxiosError } from 'axios'
import type { AxiosAdapter, AxiosRequestConfig } from 'axios'

// The 401 handling below is the app's whole session-recovery story, and it
// leans on axios internals: the error carries the original request config, the
// config survives a retry, and our own `_retry` flag rides along on it. Those
// are exactly the parts an axios upgrade can move, so they are pinned here.

const push = vi.fn()
vi.mock('@/router', () => ({ default: { push } }))

const isAuthenticated = vi.fn()
const clearCurrentUser = vi.fn()
vi.mock('@/services/user', () => ({
  userService: {
    isAuthenticated: () => isAuthenticated(),
    clearCurrentUser: () => clearCurrentUser(),
  },
}))

vi.mock('@/config/api', () => ({ getApiUrl: () => 'http://api.test/api/v1' }))

vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({
    hasEnterpriseModule: false,
    loadModule: vi.fn(),
    moduleImports: {},
  }),
}))

/** An adapter that answers each call with the next queued status.
 *
 * A custom adapter has to settle the response itself — axios only rejects
 * non-2xx replies from inside its own adapters — so this raises the same
 * AxiosError shape (config + response attached) the real ones do.
 */
function adapterQueue(statuses: number[]) {
  const seen: AxiosRequestConfig[] = []
  const adapter: AxiosAdapter = async (config) => {
    seen.push(config)
    const status = statuses.shift() ?? 200
    const response = {
      data: { status },
      status,
      statusText: String(status),
      headers: {},
      config,
    }
    if (status >= 200 && status < 300) return response
    throw new AxiosError(
      `Request failed with status code ${status}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response,
    )
  }
  return { adapter, seen }
}

async function loadApi() {
  vi.resetModules()
  const [{ default: api }, axiosModule] = await Promise.all([
    import('@/services/api'),
    import('axios'),
  ])
  return { api, axios: axiosModule.default }
}

describe('api client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isAuthenticated.mockReturnValue(true)
    document.cookie = 'user_info=someone'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends requests to the configured API base URL', async () => {
    const { api } = await loadApi()
    const { adapter, seen } = adapterQueue([200])

    await api.get('/agents', { adapter })

    expect(seen).toHaveLength(1)
    expect(seen[0].baseURL).toBe('http://api.test/api/v1')
    expect(seen[0].withCredentials).toBe(true)
  })

  it('does not attach a bearer token outside the Shopify embedded context', async () => {
    const { api } = await loadApi()
    const { adapter, seen } = adapterQueue([200])

    await api.get('/chats/1', { adapter })

    expect(seen[0].headers?.Authorization).toBeUndefined()
  })

  it('refreshes the session once on a 401 and replays the request', async () => {
    const { api, axios } = await loadApi()
    const refresh = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} } as never)
    const { adapter, seen } = adapterQueue([401, 200])

    const response = await api.get('/agents', { adapter })

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(refresh.mock.calls[0][0]).toBe('/users/refresh')
    expect(response.status).toBe(200)
    expect(seen).toHaveLength(2)
    expect(seen[1]._retry).toBe(true)
  })

  it('does not loop when the replayed request is also rejected', async () => {
    const { api, axios } = await loadApi()
    const refresh = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} } as never)
    const { adapter, seen } = adapterQueue([401, 401])

    await expect(api.get('/agents', { adapter })).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(seen).toHaveLength(2)
  })

  it('signs the user out when the refresh itself fails', async () => {
    const { api, axios } = await loadApi()
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh expired'))
    const { adapter } = adapterQueue([401])

    await expect(api.get('/agents', { adapter })).rejects.toThrow('refresh expired')

    expect(clearCurrentUser).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/login')
    expect(document.cookie).not.toContain('user_info=someone')
  })

  it('goes straight to login on a 401 when nobody is signed in', async () => {
    isAuthenticated.mockReturnValue(false)
    const { api, axios } = await loadApi()
    const refresh = vi.spyOn(axios, 'post')
    const { adapter, seen } = adapterQueue([401])

    await expect(api.get('/agents', { adapter })).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(refresh).not.toHaveBeenCalled()
    expect(seen).toHaveLength(1)
    expect(push).toHaveBeenCalledWith('/login')
  })

  it('passes other error statuses through untouched', async () => {
    const { api, axios } = await loadApi()
    const refresh = vi.spyOn(axios, 'post')
    const { adapter, seen } = adapterQueue([500])

    await expect(api.get('/agents', { adapter })).rejects.toMatchObject({
      response: { status: 500 },
    })

    expect(refresh).not.toHaveBeenCalled()
    expect(seen).toHaveLength(1)
    expect(push).not.toHaveBeenCalled()
  })
})
