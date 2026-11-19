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

// Off by default; the embedded-Shopify tests switch it on before loadApi().
const shopify = { enterprise: false, app: null as unknown, loadDelayMs: 0 }
const getSessionToken = vi.fn()
const forgetSessionToken = vi.fn()
vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({
    hasEnterpriseModule: shopify.enterprise,
    loadModule: async (name: string) => {
      if (shopify.loadDelayMs) await new Promise((resolve) => setTimeout(resolve, shopify.loadDelayMs))
      return name === 'bridge'
        ? { initShopifyApp: () => shopify.app }
        : { getSessionToken, forgetSessionToken }
    },
    moduleImports: { shopifyAppBridgeUtilities: 'utils', shopifyAppBridge: 'bridge' },
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

/** The refresh call answered with `status`, as axios rejects it. */
function refreshFailure(status: number) {
  return new AxiosError(`Request failed with status code ${status}`, AxiosError.ERR_BAD_RESPONSE, {} as never, {}, {
    data: {}, status, statusText: String(status), headers: {}, config: {} as never,
  })
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
    clearCurrentUser.mockReset()
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

  it('signs the user out when the refresh says the session is over', async () => {
    const { api, axios } = await loadApi()
    vi.spyOn(axios, 'post').mockRejectedValue(refreshFailure(401))
    const { adapter } = adapterQueue([401])

    await expect(api.get('/agents', { adapter })).rejects.toMatchObject({ response: { status: 401 } })

    expect(clearCurrentUser).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/login')
    expect(document.cookie).not.toContain('user_info=someone')
  })

  // Seen in production: a deploy's restart (502), the API rate limit (503) and
  // a dropped connection each signed people out mid-session.
  it.each([
    ['the API restarting on a deploy', refreshFailure(502)],
    ['the rate limit', refreshFailure(503)],
    ['a dropped connection', new AxiosError('Network Error', AxiosError.ERR_NETWORK)],
  ])('keeps the user signed in when the refresh fails from %s', async (_, failure) => {
    const { api, axios } = await loadApi()
    vi.spyOn(axios, 'post').mockRejectedValue(failure)
    const { adapter } = adapterQueue([401])

    await expect(api.get('/agents', { adapter })).rejects.toBe(failure)

    expect(clearCurrentUser).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(document.cookie).toContain('user_info=someone')
  })

  it('refreshes once for a burst of 401s, and replays every request', async () => {
    const { api, axios } = await loadApi()
    let finishRefresh: (value: unknown) => void = () => {}
    const refresh = vi.spyOn(axios, 'post').mockImplementation(
      () => new Promise((resolve) => { finishRefresh = resolve }) as never,
    )
    const { adapter, seen } = adapterQueue([401, 401, 401, 401, 401, 200, 200, 200, 200, 200])

    const burst = Promise.all(Array.from({ length: 5 }, (_, i) => api.get(`/page-${i}`, { adapter })))
    await vi.waitFor(() => expect(seen).toHaveLength(5))
    finishRefresh({ data: {} })
    const responses = await burst

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(responses.map((r) => r.status)).toEqual([200, 200, 200, 200, 200])
    expect(seen).toHaveLength(10)
  })

  it('refreshes again for a later 401, once the first refresh is over', async () => {
    const { api, axios } = await loadApi()
    const refresh = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} } as never)
    const { adapter } = adapterQueue([401, 200, 401, 200])

    await api.get('/agents', { adapter })
    await api.get('/agents', { adapter })

    expect(refresh).toHaveBeenCalledTimes(2)
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

  describe('with an access token known to have run out', () => {
    const DEADLINE_KEY = 'access_token_expires_at'
    const refreshed = { data: {}, headers: { 'x-access-token-expires-in': '1800' } }
    const realTop = window.top

    beforeEach(() => {
      localStorage.setItem(DEADLINE_KEY, String(Date.now() - 1000))
    })

    afterEach(() => {
      localStorage.removeItem(DEADLINE_KEY)
      Object.defineProperty(window, 'top', { value: realTop, configurable: true })
    })

    it('refreshes before sending, so the request goes out once', async () => {
      const { api, axios } = await loadApi()
      const refresh = vi.spyOn(axios, 'post').mockResolvedValue(refreshed as never)
      const { adapter, seen } = adapterQueue([200])

      const response = await api.get('/agents', { adapter })

      expect(refresh).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(seen).toHaveLength(1)
      expect(Number(localStorage.getItem(DEADLINE_KEY))).toBeGreaterThan(Date.now() + 25 * 60 * 1000)
    })

    // Seen in production: a page load after the token lapsed sent ~20 calls,
    // all 401, then replayed them, and the replays hit the rate limit (503).
    it('sends a page-load burst once, behind a single refresh', async () => {
      const { api, axios } = await loadApi()
      const refresh = vi.spyOn(axios, 'post').mockResolvedValue(refreshed as never)
      const { adapter, seen } = adapterQueue([])

      await Promise.all(Array.from({ length: 20 }, (_, i) => api.get(`/page-${i}`, { adapter })))

      expect(refresh).toHaveBeenCalledTimes(1)
      expect(seen).toHaveLength(20)
      expect(seen.every((config) => !config._retry)).toBe(true)
    })

    it('still sends a call that needs no session when the session is over', async () => {
      const { api, axios } = await loadApi()
      vi.spyOn(axios, 'post').mockRejectedValue(refreshFailure(401))
      const { adapter, seen } = adapterQueue([200])

      const response = await api.post('/users/forgot-password', {}, { adapter })

      expect(response.status).toBe(200)
      expect(seen).toHaveLength(1)
      expect(clearCurrentUser).toHaveBeenCalled()
      expect(push).not.toHaveBeenCalled()
    })

    it('goes to login without another refresh when a call needs the session that is over', async () => {
      const { api, axios } = await loadApi()
      const refresh = vi.spyOn(axios, 'post').mockRejectedValue(refreshFailure(401))
      clearCurrentUser.mockImplementation(() => isAuthenticated.mockReturnValue(false))
      const { adapter, seen } = adapterQueue([401])

      await expect(api.get('/agents', { adapter })).rejects.toMatchObject({ response: { status: 401 } })

      expect(refresh).toHaveBeenCalledTimes(1)
      expect(seen).toHaveLength(1)
      expect(push).toHaveBeenCalledWith('/login')
    })

    it('stops refreshing ahead after a refresh fails for another reason', async () => {
      const { api, axios } = await loadApi()
      const refresh = vi.spyOn(axios, 'post').mockRejectedValue(refreshFailure(503))
      const { adapter, seen } = adapterQueue([200, 200])

      const response = await api.get('/agents', { adapter })
      await api.get('/agents', { adapter })

      expect(response.status).toBe(200)
      expect(seen).toHaveLength(2)
      expect(refresh).toHaveBeenCalledTimes(1)
      expect(localStorage.getItem(DEADLINE_KEY)).toBeNull()
      expect(push).not.toHaveBeenCalled()
    })

    it.each(['/users/login', '/users/logout'])('does not refresh ahead of %s', async (path) => {
      const { api, axios } = await loadApi()
      const refresh = vi.spyOn(axios, 'post')
      const { adapter } = adapterQueue([200])

      await api.post(path, {}, { adapter })

      expect(refresh).not.toHaveBeenCalled()
    })

    it('does not refresh when nobody is signed in', async () => {
      isAuthenticated.mockReturnValue(false)
      const { api, axios } = await loadApi()
      const refresh = vi.spyOn(axios, 'post')
      const { adapter } = adapterQueue([200])

      await api.get('/agents', { adapter })

      expect(refresh).not.toHaveBeenCalled()
    })

    // App Bridge loads asynchronously; the first calls inside Shopify admin
    // go out before it is ready and must not use our cookie session.
    it('does not refresh inside a frame, even before App Bridge has loaded', async () => {
      Object.defineProperty(window, 'top', { value: {}, configurable: true })
      const { api, axios } = await loadApi()
      const refresh = vi.spyOn(axios, 'post')
      const { adapter } = adapterQueue([200])

      await api.get('/shopify/shop-config-status', { adapter })

      expect(refresh).not.toHaveBeenCalled()
      expect(push).not.toHaveBeenCalled()
    })
  })

  it('starts the clock from a sign-in response that gives the token lifetime', async () => {
    const { api } = await loadApi()
    const adapter: AxiosAdapter = async (config) => ({
      data: {}, status: 200, statusText: 'OK', config,
      headers: { 'x-access-token-expires-in': '1800' },
    })

    await api.post('/users/login', {}, { adapter })
    const deadline = Number(localStorage.getItem('access_token_expires_at'))
    localStorage.removeItem('access_token_expires_at')

    expect(deadline).toBeGreaterThan(Date.now() + 25 * 60 * 1000)
    expect(deadline).toBeLessThan(Date.now() + 30 * 60 * 1000)
  })

  it('does not refresh ahead when the deadline is unknown or still to come', async () => {
    const { api, axios } = await loadApi()
    const refresh = vi.spyOn(axios, 'post')
    const { adapter } = adapterQueue([200, 200])

    await api.get('/agents', { adapter })
    localStorage.setItem('access_token_expires_at', String(Date.now() + 60_000))
    await api.get('/agents', { adapter })
    localStorage.removeItem('access_token_expires_at')

    expect(refresh).not.toHaveBeenCalled()
  })

  describe('inside Shopify admin', () => {
    const realTop = window.top

    beforeEach(() => {
      shopify.enterprise = true
      shopify.app = { id: 'app-bridge' }
      getSessionToken.mockResolvedValue('shopify-token')
      // Shopify admin frames the app
      Object.defineProperty(window, 'top', { value: {}, configurable: true })
    })

    afterEach(() => {
      shopify.enterprise = false
      shopify.app = null
      Object.defineProperty(window, 'top', { value: realTop, configurable: true })
    })

    /** loadApi(), once its Shopify modules have finished loading. */
    async function loadEmbeddedApi() {
      const loaded = await loadApi()
      await new Promise((resolve) => setTimeout(resolve, 0))
      return loaded
    }

    // The address loses ?shop=&host= once the app navigates; the token must
    // still go out, or every later page gets a 401.
    it('attaches the session token on a page without the Shopify params', async () => {
      const { api } = await loadEmbeddedApi()
      const { adapter, seen } = adapterQueue([200])

      await api.get('/shopify/shop-config-status', { adapter })

      expect(window.location.search).toBe('')
      expect(seen[0].headers?.Authorization).toBe('Bearer shopify-token')
    })

    // A page can be ready to call before the Shopify modules have loaded
    it('a call made at once, before the Shopify modules load, still carries the token', async () => {
      shopify.loadDelayMs = 30
      try {
        const { api } = await loadApi()
        const { adapter, seen } = adapterQueue([200])

        await api.post('/shopify/exchange-token', {}, { adapter })

        expect(seen).toHaveLength(1)
        expect(seen[0].headers?.Authorization).toBe('Bearer shopify-token')
      } finally {
        shopify.loadDelayMs = 0
      }
    })

    it('keeps the bearer token off non-Shopify endpoints', async () => {
      const { api } = await loadEmbeddedApi()
      const { adapter, seen } = adapterQueue([200])

      await api.get('/users/me', { adapter })

      expect(seen[0].headers?.Authorization).toBeUndefined()
    })

    it('leaves a 401 to the page instead of sending the admin to our login', async () => {
      isAuthenticated.mockReturnValue(false)
      const { api, axios } = await loadEmbeddedApi()
      const refresh = vi.spyOn(axios, 'post')
      const { adapter } = adapterQueue([401, 401])

      await expect(api.get('/shopify/shop-config-status', { adapter })).rejects.toMatchObject({
        response: { status: 401 },
      })

      expect(refresh).not.toHaveBeenCalled()
      expect(push).not.toHaveBeenCalled()
      expect(clearCurrentUser).not.toHaveBeenCalled()
    })

    it('drops a refused session token and tries once more with a new one', async () => {
      forgetSessionToken.mockReset()
      getSessionToken.mockResolvedValueOnce('kept-token').mockResolvedValueOnce('new-token')
      const { api } = await loadEmbeddedApi()
      const { adapter, seen } = adapterQueue([401, 200])

      const response = await api.get('/shopify/shop-config-status', { adapter })

      expect(response.status).toBe(200)
      expect(forgetSessionToken).toHaveBeenCalledTimes(1)
      expect(seen.map((config) => config.headers?.Authorization)).toEqual(['Bearer kept-token', 'Bearer new-token'])
    })

    it('tries only once more: a second 401 goes to the page', async () => {
      const { api } = await loadEmbeddedApi()
      const { adapter, seen } = adapterQueue([401, 401])

      await expect(api.get('/shopify/shop-config-status', { adapter })).rejects.toMatchObject({ response: { status: 401 } })
      expect(seen).toHaveLength(2)
    })

    it('treats an unframed page as the dashboard', async () => {
      Object.defineProperty(window, 'top', { value: window, configurable: true })
      const { api } = await loadEmbeddedApi()
      const { adapter, seen } = adapterQueue([200])

      await api.get('/shopify/shop-config-status', { adapter })

      expect(seen[0].headers?.Authorization).toBeUndefined()
    })
  })
})
