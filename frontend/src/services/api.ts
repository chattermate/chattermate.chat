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
    // Check if we're in embedded Shopify context
    const urlParams = new URLSearchParams(window.location.search)
    const hasShopParam = urlParams.has('shop') || urlParams.has('host')

    // Check if this is a Shopify-related endpoint
    const isShopifyEndpoint =
      config.url?.includes('/shopify/') ||
      config.url?.endsWith('/shopify') ||
      (config.url?.includes('/agent/') && hasShopParam) ||
      (config.url?.includes('/chats/') && hasShopParam)

    if (
      hasShopParam &&
      isShopifyEndpoint &&
      hasEnterpriseModule &&
      initShopifyApp &&
      getSessionToken
    ) {
      try {
        const app = initShopifyApp()
        if (app) {
          const token = await getSessionToken(app)
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log('✅ Added Shopify session token to request:', config.url)
          }
        }
      } catch (error) {
        console.error('❌ Failed to add session token:', error)
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // If there's no authenticated user, do not attempt refresh. Go to login directly.
      if (!userService.isAuthenticated()) {
        // Clear any stale user info
        document.cookie = 'user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        userService.clearCurrentUser()
        router.push('/login')
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        // Try to refresh token
        await axios.post(
          '/users/refresh',
          {},
          {
            withCredentials: true,
            baseURL: getApiUrl(),
          },
        )

        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // Clear user info cookie
        document.cookie = 'user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        // Remove any cached auth state so guards don't think we're logged in
        try {
          userService.clearCurrentUser()
        } catch {}

        // Redirect to login if refresh fails
        router.push('/login')
        return Promise.reject(refreshError)
      }
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
