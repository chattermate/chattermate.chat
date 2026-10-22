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
import { mount, VueWrapper, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createWebHistory, Router } from 'vue-router'
import LoginView from '../../views/LoginView.vue'
import { createPinia, setActivePinia } from 'pinia'

// Mock the services
vi.mock('@/services/auth', () => ({
  authService: {
    login: vi.fn()
  }
}))

// SSO: no providers unless a test configures some
const ssoProviders = vi.hoisted(() => ({ value: [] as { key: string; label: string }[] }))
const passwordLogin = vi.hoisted(() => ({ value: true }))
vi.mock('@/services/sso', () => ({
  ssoService: {
    getConfig: vi.fn(async () => ({ providers: ssoProviders.value, passwordLogin: passwordLogin.value })),
    startUrl: vi.fn((provider: string, query: Record<string, string>) => `http://api.test/api/v1/sso/${provider}/start?${new URLSearchParams(query)}`),
    completeSignIn: vi.fn(),
    errorMessage: vi.fn((code: string | null) => (code === 'no_account' ? 'No team account matches that e-mail address.' : 'Single sign-on failed.')),
  },
}))

// The landing route is resolved from the real permission checks reading the
// cached user, so this drives the user rather than mocking the checks away.
const currentUser = vi.hoisted(() => ({ value: null as unknown }))

vi.mock('@/services/user', () => ({
  userService: {
    getCurrentUser: () => currentUser.value,
    setCurrentUser: vi.fn(),
    getUserId: () => 'user-1',
  },
}))

// Mock enterprise features
vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: vi.fn(() => ({
    hasEnterpriseModule: false,
    loadModule: vi.fn().mockResolvedValue(null)
  }))
}))

// Mock forgot password composable
vi.mock('@/composables/useForgotPassword', () => ({
  useForgotPassword: vi.fn(() => ({
    isLoading: { value: false },
    error: { value: '' },
    success: { value: '' },
    currentStep: { value: 1 },
    email: { value: '' },
    otp: { value: '' },
    newPassword: { value: '' },
    confirmPassword: { value: '' },
    passwordValidation: { value: { score: 0, hasMinLength: false, hasUpperCase: false, hasLowerCase: false, hasNumber: false, hasSpecialChar: false } },
    requestPasswordReset: vi.fn(),
    verifyAndResetPassword: vi.fn(),
    resetForm: vi.fn(),
    goBackToEmailStep: vi.fn()
  }))
}))

// Mock Firebase services
vi.mock('@/services/firebase', () => ({
  messaging: {},
  requestNotificationPermission: vi.fn()
}))

vi.mock('@/composables/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    requestPermission: vi.fn(),
    hasPermission: { value: false }
  }))
}))

// Import the mocked modules
import { authService } from '@/services/auth'
import { ssoService } from '@/services/sso'
import { userWithPermissions } from '../fixtures/permissions'

describe('LoginView', () => {
  let wrapper: VueWrapper
  let router: Router

  beforeEach(async () => {
    // Create a fresh router instance for each test
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/ai-agents', name: 'ai-agents', component: { template: '<div>AI Agents</div>' } },
        { path: '/conversations', name: 'conversations', component: { template: '<div>Conversations</div>' } },
        { path: '/human-agents', name: 'human-agents', component: { template: '<div>Human Agents</div>' } },
        { path: '/settings/organization', name: 'org-settings', component: { template: '<div>Organization Settings</div>' } },
        { path: '/settings/ai-config', name: 'ai-config', component: { template: '<div>AI Config</div>' } },
        { path: '/settings/user', name: 'user-settings', component: { template: '<div>User Settings</div>' } },
        { path: '/403', name: 'forbidden', component: { template: '<div>403</div>' } },
        { path: '/shopify/auth-complete', name: 'shopify-auth-complete', component: { template: '<div>Shopify</div>' } }
      ]
    })

    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Reset router to initial state and wait for it to be ready
    await router.push('/')
    await router.isReady()
    
    // A user with no grants unless a test says otherwise
    currentUser.value = userWithPermissions([])
    ssoProviders.value = []
    passwordLogin.value = true
    
    wrapper = mount(LoginView, {
      global: {
        plugins: [router],
        stubs: {
          RouterView: true
        }
      }
    })

    // Wait for component to be ready
    await nextTick()
  })

  it('renders login form properly', () => {
    expect(wrapper.find('.auth-page').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('updates email and password inputs', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')

    expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com')
    expect((passwordInput.element as HTMLInputElement).value).toBe('password123')
  })

  it('shows loading state during login', async () => {
    const mockLogin = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    ;(authService.login as any) = mockLogin

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    
    const submitButton = wrapper.find('button[type="submit"]')
    await submitButton.trigger('submit')

    expect(submitButton.text()).toBe('Signing in…')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('handles successful login and redirects based on permissions', async () => {
    // Mock successful login
    ;(authService.login as any).mockResolvedValue({ id: 1, email: 'test@example.com' })
    
    // User can manage agents
    currentUser.value = userWithPermissions(['manage_agents'])

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')

    // Verify login was called
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123')
    
    // Wait for all promises to resolve
    await flushPromises()
    
    expect(router.currentRoute.value.path).toBe('/ai-agents')
  })

  it('shows the backend message authService.login rethrows', async () => {
    // What the real service throws: a plain Error carrying the API's detail.
    ;(authService.login as any).mockRejectedValue(new Error('Incorrect email or password'))
    await wrapper.find('input[type="email"]').setValue('someone@example.com')
    await wrapper.find('input[type="password"]').setValue('wrong')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('.auth-error').text()).toBe('Incorrect email or password')
  })

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials'
    ;(authService.login as any).mockRejectedValue({
      response: {
        data: {
          detail: errorMessage
        }
      }
    })

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('wrong-password')
    await wrapper.find('form').trigger('submit')

    // Wait for error to be displayed
    await flushPromises()
    expect(wrapper.find('.auth-error').text()).toBe(errorMessage)
  })

  it('redirects to correct route based on permissions', async () => {
    ;(authService.login as any).mockResolvedValue({ id: 1, email: 'test@example.com' })

    const testCases = [
      { permission: 'manage_agents', route: '/ai-agents' },
      { permission: 'view_assigned_chats', route: '/conversations' },
      { permission: 'manage_users', route: '/human-agents' },
      { permission: 'view_organization', route: '/settings/organization' },
      { permission: 'view_ai_config', route: '/settings/ai-config' },
    ]

    for (const testCase of testCases) {
      currentUser.value = userWithPermissions([testCase.permission])

      // Reset router and wait for it to be ready
      await router.push('/')
      await router.isReady()
      await nextTick()

      await wrapper.find('input[type="email"]').setValue('test@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await wrapper.find('form').trigger('submit')

      // Wait for all promises to resolve
      await flushPromises()
      
      expect(router.currentRoute.value.path).toBe(testCase.route)
    }
  })

  // Used to land on /403 — which was not a registered route, so the user
  // silently ended up on /ai-agents, a page they had just been refused.
  it('lands a permissionless user on their own settings, never on 403', async () => {
    ;(authService.login as any).mockResolvedValue({ id: 1, email: 'test@example.com' })
    currentUser.value = userWithPermissions([])

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')

    // Wait for all promises to resolve
    await flushPromises()
    
    expect(router.currentRoute.value.path).toBe('/settings/user')
  })

  // --- single sign-on -------------------------------------------------------

  // Mount at `path` with window.location.href assignments captured instead of followed.
  const remountCapturingNavigation = async (path: string) => {
    const assign = vi.fn()
    const original = window.location
    wrapper.unmount()
    await router.push(path)
    Object.defineProperty(window, 'location', { value: { ...original, search: original.search, set href(url: string) { assign(url) } }, writable: true, configurable: true })
    const restore = () => Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true })
    wrapper = mount(LoginView, { global: { plugins: [router], stubs: { RouterView: true } } })
    await flushPromises()
    return { assign, restore }
  }

  const remountAt = async (path: string) => {
    wrapper.unmount()
    await router.push(path)
    wrapper = mount(LoginView, { global: { plugins: [router], stubs: { RouterView: true } } })
    await flushPromises()
  }

  it('shows no SSO buttons when no provider is configured', async () => {
    await flushPromises()
    expect(wrapper.find('.sso-btn').exists()).toBe(false)
    expect(wrapper.find('.auth-divider').exists()).toBe(false)
  })

  it('offers one button per configured provider and sends the browser to the backend', async () => {
    ssoProviders.value = [{ key: 'google', label: 'Google' }, { key: 'microsoft', label: 'Microsoft' }]
    await remountAt('/?redirect=/conversations')
    const buttons = wrapper.findAll('.sso-btn')
    expect(buttons.map(b => b.text())).toEqual(['Continue with Google', 'Continue with Microsoft'])

    const assign = vi.fn()
    const original = window.location
    Object.defineProperty(window, 'location', { value: { ...original, set href(url: string) { assign(url) } }, writable: true, configurable: true })
    try {
      await buttons[1].trigger('click')
      // The login page's own query goes along; the backend hands it back.
      expect(ssoService.startUrl).toHaveBeenCalledWith('microsoft', { redirect: '/conversations' })
      expect(assign).toHaveBeenCalledWith('http://api.test/api/v1/sso/microsoft/start?redirect=%2Fconversations')
    } finally {
      Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true })
    }
  })

  it('completes a sign-in when the backend sends the browser back with sso=ok', async () => {
    currentUser.value = userWithPermissions(['manage_agents'])
    ;(ssoService.completeSignIn as any).mockResolvedValue({ id: 1, email: 'sso@example.com' })
    await remountAt('/?sso=ok')
    expect(ssoService.completeSignIn).toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/ai-agents')
  })

  it('lands on the requested page after a sign-in that started with ?redirect=', async () => {
    ;(ssoService.completeSignIn as any).mockResolvedValue({ id: 1, email: 'sso@example.com' })
    await remountAt('/?sso=ok&redirect=%2Fconversations')
    expect(router.currentRoute.value.path).toBe('/conversations')
  })

  it('finishes the Shopify install flow after a sign-in that started from it', async () => {
    ;(ssoService.completeSignIn as any).mockResolvedValue({ id: 1, email: 'sso@example.com' })
    await remountAt('/?sso=ok&shopify_flow=1&shop=s.myshopify.com&shop_id=7&host=aG9zdA')
    expect(router.currentRoute.value.path).toBe('/shopify/auth-complete')
    expect(router.currentRoute.value.query).toEqual({ shop: 's.myshopify.com', shop_id: '7', host: 'aG9zdA' })
  })

  it('completes a sign-in without waiting for the provider list', async () => {
    ;(ssoService.getConfig as any).mockReturnValueOnce(new Promise(() => {}))
    ;(ssoService.completeSignIn as any).mockResolvedValue({ id: 1, email: 'sso@example.com' })
    await remountAt('/?sso=ok&redirect=%2Fconversations')
    expect(router.currentRoute.value.path).toBe('/conversations')
  })

  it('says it is completing the sign-in even before the providers load', async () => {
    ;(ssoService.getConfig as any).mockReturnValueOnce(new Promise(() => {}))
    ;(ssoService.completeSignIn as any).mockReturnValueOnce(new Promise(() => {}))
    await remountAt('/?sso=ok')
    expect(wrapper.find('.sso-status').text()).toBe('Completing sign-in…')
  })

  it('reports a failed session pickup and stays on the login page', async () => {
    ;(ssoService.completeSignIn as any).mockRejectedValueOnce(new Error('401'))
    await remountAt('/?sso=ok')
    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.find('.auth-error').text()).toContain('Single sign-on failed')
    expect(wrapper.find('.sso-status').exists()).toBe(false)
  })

  it('explains an sso_error instead of signing in', async () => {
    await remountAt('/?sso_error=no_account')
    expect(ssoService.completeSignIn).not.toHaveBeenCalled()
    expect(wrapper.find('.auth-error').text()).toContain('No team account matches')
  })

  it('shows the redirect on the clicked provider button, not on the password button', async () => {
    ssoProviders.value = [{ key: 'google', label: 'Google' }]
    await remountAt('/')
    const original = window.location
    Object.defineProperty(window, 'location', { value: { ...original, set href(_url: string) {} }, writable: true, configurable: true })
    try {
      await wrapper.find('.sso-btn').trigger('click')
      expect(wrapper.find('.sso-btn').text()).toBe('Redirecting to Google…')
      expect(wrapper.find('.auth-submit').text()).toBe('Sign In')
      expect(wrapper.find('.auth-submit').attributes('disabled')).toBeDefined()
    } finally {
      Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true })
    }
  })

  it('leads with SSO once an operator made it the way in, keeping the password a click away', async () => {
    ssoProviders.value = [{ key: 'google', label: 'Google' }]
    passwordLogin.value = false
    await remountAt('/')
    expect(wrapper.find('#email').exists()).toBe(false)
    expect(wrapper.find('.auth-submit').exists()).toBe(false)
    expect(wrapper.find('.auth-divider').exists()).toBe(false)
    expect(wrapper.find('.sso-btn').text()).toBe('Continue with Google')

    // Someone who hasn't linked an account yet still has their password.
    await wrapper.find('.password-toggle').trigger('click')
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('.auth-submit').exists()).toBe(true)
    expect(wrapper.find('.auth-divider').exists()).toBe(true)
    expect(wrapper.find('.password-toggle').exists()).toBe(false)
  })

  it('offers no password toggle while the form already leads', async () => {
    ssoProviders.value = [{ key: 'google', label: 'Google' }]
    await remountAt('/')
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('.password-toggle').exists()).toBe(false)
  })

  it('hides SSO inside the embedded Shopify app, where the providers cannot load', async () => {
    ssoProviders.value = [{ key: 'google', label: 'Google' }]
    passwordLogin.value = false
    await remountAt('/?embedded=true&shop_id=7')
    expect(wrapper.find('.sso-btn').exists()).toBe(false)
    expect(wrapper.find('#email').exists()).toBe(true)
  })

  it('hides SSO when the login page is framed', async () => {
    ssoProviders.value = [{ key: 'google', label: 'Google' }]
    const top = Object.getOwnPropertyDescriptor(window, 'top')
    Object.defineProperty(window, 'top', { value: {}, configurable: true })
    try {
      await remountAt('/')
      expect(wrapper.find('.sso-btn').exists()).toBe(false)
    } finally {
      if (top) Object.defineProperty(window, 'top', top)
    }
  })

  it('never follows a return_to that leaves the dashboard', async () => {
    ;(ssoService.completeSignIn as any).mockResolvedValue({ id: 1, email: 'sso@example.com' })
    const { assign, restore } = await remountCapturingNavigation(
      '/?sso=ok&shopify_flow=1&shop=s.myshopify.com&shop_id=7&host=aG9zdA&return_to=https%3A%2F%2Fevil.example%2F')
    try {
      expect(assign).not.toHaveBeenCalled()
      expect(router.currentRoute.value.path).toBe('/shopify/auth-complete')
      expect(router.currentRoute.value.query.return_to).toBeUndefined()
    } finally {
      restore()
    }
  })

  it('follows a return_to that is a page of the dashboard', async () => {
    ;(ssoService.completeSignIn as any).mockResolvedValue({ id: 1, email: 'sso@example.com' })
    const { assign, restore } = await remountCapturingNavigation(
      '/?sso=ok&shopify_flow=1&shop_id=7&return_to=%2Fshopify%2Fagent-selection%3Fshop_id%3D7')
    try {
      expect(assign).toHaveBeenCalledWith('/shopify/agent-selection?shop_id=7')
    } finally {
      restore()
    }
  })

  it('does not route to a protocol-relative ?redirect=', async () => {
    ;(ssoService.completeSignIn as any).mockResolvedValue({ id: 1, email: 'sso@example.com' })
    const push = vi.spyOn(router, 'push')
    await remountAt('/?sso=ok&redirect=%2F%2Fevil.example')
    expect(push).not.toHaveBeenCalledWith('//evil.example')
  })

  it('keeps the password form when SSO-only is set but no provider is configured', async () => {
    passwordLogin.value = false
    await remountAt('/')
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('.auth-submit').exists()).toBe(true)
  })
})
