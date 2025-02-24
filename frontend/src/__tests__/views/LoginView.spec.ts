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

// Mock the permission checks
vi.mock('@/utils/permissions', () => ({
  permissionChecks: {
    canManageAgents: vi.fn().mockReturnValue(false),
    canViewChats: vi.fn().mockReturnValue(false),
    canManageUsers: vi.fn().mockReturnValue(false),
    canViewOrganization: vi.fn().mockReturnValue(false),
    canViewAIConfig: vi.fn().mockReturnValue(false)
  }
}))

// Import the mocked modules
import { authService } from '@/services/auth'
import { permissionChecks } from '@/utils/permissions'

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
        { path: '/403', name: 'forbidden', component: { template: '<div>403</div>' } }
      ]
    })

    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Reset router to initial state and wait for it to be ready
    await router.push('/')
    await router.isReady()
    
    // Reset all permission checks to false
    Object.keys(permissionChecks).forEach(key => {
      ;(permissionChecks[key as keyof typeof permissionChecks] as any).mockReturnValue(false)
    })
    
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
    expect(wrapper.find('.login-container').exists()).toBe(true)
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

    expect(submitButton.text()).toBe('Signing in...')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('handles successful login and redirects based on permissions', async () => {
    // Mock successful login
    ;(authService.login as any).mockResolvedValue({ id: 1, email: 'test@example.com' })
    
    // Mock permissions - user can manage agents
    ;(permissionChecks.canManageAgents as any).mockReturnValue(true)

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')

    // Verify login was called
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123')
    
    // Wait for all promises to resolve
    await flushPromises()
    
    expect(router.currentRoute.value.path).toBe('/ai-agents')
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
    expect(wrapper.find('.error-message').text()).toBe(errorMessage)
  })

  it('redirects to correct route based on permissions', async () => {
    ;(authService.login as any).mockResolvedValue({ id: 1, email: 'test@example.com' })

    const testCases = [
      {
        permission: 'canManageAgents',
        route: '/ai-agents'
      },
      {
        permission: 'canViewChats',
        route: '/conversations'
      },
      {
        permission: 'canManageUsers',
        route: '/human-agents'
      },
      {
        permission: 'canViewOrganization',
        route: '/settings/organization'
      },
      {
        permission: 'canViewAIConfig',
        route: '/settings/ai-config'
      }
    ]

    for (const testCase of testCases) {
      // Reset all permission checks to false
      Object.keys(permissionChecks).forEach(key => {
        ;(permissionChecks[key as keyof typeof permissionChecks] as any).mockReturnValue(false)
      })
      
      // Set the current permission to true
      ;(permissionChecks[testCase.permission as keyof typeof permissionChecks] as any).mockReturnValue(true)

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

  it('redirects to 403 when no permissions are granted', async () => {
    ;(authService.login as any).mockResolvedValue({ id: 1, email: 'test@example.com' })
    
    // Set all permissions to false
    Object.keys(permissionChecks).forEach(key => {
      ;(permissionChecks[key as keyof typeof permissionChecks] as any).mockReturnValue(false)
    })

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')

    // Wait for all promises to resolve
    await flushPromises()
    
    expect(router.currentRoute.value.path).toBe('/403')
  })
}) 