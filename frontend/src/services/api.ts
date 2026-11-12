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

import axios, { AxiosError } from 'axios'
import router from '@/router'
import { getApiUrl } from '@/config/api'
import { userService } from '@/services/user'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

const { hasEnterpriseModule, loadModule, moduleImports } = useEnterpriseFeatures()

// Lazy load Shopify dependencies only if enterprise module is available
let getSessionToken: any = null
let initShopifyApp: any = null

if (hasEnterpriseModule) {
  // Load Shopify dependencies asynchronously
  ;(async () => {
    try {
      // Load Shopify App Bridge utilities via wrapper module
      const appBridgeUtilitiesModule = await loadModule(moduleImports.shopifyAppBridgeUtilities)
      if (appBridgeUtilitiesModule?.getSessionToken) {
        getSessionToken = appBridgeUtilitiesModule.getSessionToken
      }

      // Load Shopify app bridge plugin
      const shopifyAppBridgeModule = await loadModule(moduleImports.shopifyAppBridge)
      if (shopifyAppBridgeModule?.initShopifyApp) {
        initShopifyApp = shopifyAppBridgeModule.initShopifyApp
      }
    } catch (error) {
      console.warn('Failed to load Shopify dependencies:', error)
    }
  })()
}

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add session token for Shopify embedded app
api.interceptors.request.use(
  async (config) => {
    // Embedded in Shopify admin: App Bridge started on the first page load
    // (which carries ?shop=&host=) and stays up, so this holds on every page
    // the app moves to, even once the address no longer has those params.
    const app = embeddedShopifyApp()

    // Shopify endpoints, and the agent and chat ones the embedded app shares
    const isShopifyEndpoint =
      config.url?.includes('/shopify/') ||
      config.url?.endsWith('/shopify') ||
      config.url?.includes('/agent/') ||
      config.url?.includes('/chats/')

    if (app && isShopifyEndpoint && getSessionToken) {
      try {
        const token = await getSessionToken(app)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('✅ Added Shopify session token to request:', config.url)
        }
      } catch (error) {
        console.error('❌ Failed to add session token:', error)
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

/** The App Bridge app when this page runs inside Shopify admin, else null. */
function embeddedShopifyApp(): unknown {
  // Shopify admin always frames the app; the dashboard never is.
  if (!hasEnterpriseModule || !initShopifyApp || window.top === window) return null
  try {
    return initShopifyApp() || null
  } catch {
    return null
  }
}

/** Signs the user out locally and sends them to the login page. */
function signOut() {
  document.cookie = 'user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  // Remove any cached auth state so guards don't think we're logged in
  try {
    userService.clearCurrentUser()
  } catch {}
  router.push('/login')
}

/**
 * The refresh in flight, shared. A page opening with an expired access token
 * gets a 401 on every call it makes at once; each used to refresh on its own,
 * and the burst tripped the API rate limit, so one refresh got a 503 and the
 * user was signed out.
 */
let refreshing: Promise<unknown> | null = null

export function refreshSession(): Promise<unknown> {
  refreshing ??= axios
    .post('/users/refresh', {}, { withCredentials: true, baseURL: getApiUrl() })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

/**
 * Only the server saying the session is over (401/403 from the refresh) ends
 * it. A 502 while the API restarts on a deploy, a 503 from rate limiting or a
 * dropped connection says nothing about the session: the request fails, the
 * user stays signed in, and the next one retries.
 */
function sessionIsOver(refreshError: unknown): boolean {
  const status = (refreshError as AxiosError)?.response?.status
  return status === 401 || status === 403
}

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config

    // Inside Shopify admin the session is Shopify's: the page shows the
    // error (or asks to reopen the app) rather than leaving for our login.
    if (error.response?.status === 401 && embeddedShopifyApp()) return Promise.reject(error)

    // If error is 401 and we haven't tried to refresh token yet

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // If there's no authenticated user, do not attempt refresh. Go to login directly.
      if (!userService.isAuthenticated()) {
        signOut()
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        await refreshSession()
      } catch (refreshError) {
        if (sessionIsOver(refreshError)) signOut()
        return Promise.reject(refreshError)
      }

      // Retry original request
      return api(originalRequest)
    }

    return Promise.reject(error)
  },
)

export default api
// Add type for extended axios config
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean
  }
}
