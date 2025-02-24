import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../../layouts/DashboardLayout.vue'
import { createPinia, setActivePinia } from 'pinia'
import type { ComponentPublicInstance } from 'vue'

// Define interface for component instance
interface DashboardLayoutInstance extends ComponentPublicInstance {
  toggleSidebar: () => void
  currentUser: {
    is_online: boolean
  }
  showSettings: boolean
  showUserMenu: boolean
  showNotifications: boolean
  userName: string
  userRole: string
  refreshUserInfo: () => void
}

// Mock the composables
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    logout: vi.fn()
  })
}))

vi.mock('@/composables/useNotifications', () => ({
  useNotifications: vi.fn()
}))

// Mock the services
vi.mock('@/services/user', () => ({
  userService: {
    getCurrentUser: () => ({
      id: '1',
      profile_pic: null,
      is_online: true,
      last_seen: new Date().toISOString()
    }),
    getUserName: () => 'Test User',
    getUserRole: () => 'Admin',
    setCurrentUser: vi.fn()
  }
}))

vi.mock('@/services/notification', () => ({
  notificationService: {
    getUnreadCount: () => Promise.resolve(5)
  }
}))

vi.mock('@/services/users', () => ({
  updateUserStatus: vi.fn()
}))

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
})

describe('DashboardLayout', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    // Create a fresh Pinia instance
    setActivePinia(createPinia())

    // Mount component with required props and plugins
    wrapper = mount(DashboardLayout, {
      global: {
        plugins: [router],
        stubs: {
          'AppSidebar': true,
          'NotificationList': true,
          'UserSettings': true
        }
      }
    })
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.dashboard-layout').exists()).toBe(true)
  })

  it('toggles sidebar correctly', async () => {
    const vm = wrapper.vm as unknown as DashboardLayoutInstance
    expect(wrapper.classes()).not.toContain('sidebar-collapsed')
    await vm.toggleSidebar()
    expect(wrapper.classes()).toContain('sidebar-collapsed')
  })

  it('displays user information correctly', () => {
    const vm = wrapper.vm as unknown as DashboardLayoutInstance
    expect(vm.userName).toBe('Test User')
    expect(vm.userRole).toBe('Admin')
    
    // Find name element in the sidebar-open state
    expect(wrapper.find('.user-info .name').text()).toBe('Test User')
  })

  it('shows user menu when clicking profile', async () => {
    const profileTrigger = wrapper.find('.profile-trigger')
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
    
    await profileTrigger.trigger('click')
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true)
  })

  it('shows notification badge with correct count', async () => {
    await wrapper.vm.$nextTick() // Wait for mounted hook
    const badge = wrapper.find('.notification-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('5')
  })

  it('toggles online status correctly', async () => {
    const vm = wrapper.vm as unknown as DashboardLayoutInstance
    const profileTrigger = wrapper.find('.profile-trigger')
    await profileTrigger.trigger('click')
    
    const statusToggle = wrapper.find('.status-toggle')
    expect(statusToggle.classes()).toContain('online')
    
    await statusToggle.trigger('click')
    expect(vm.currentUser.is_online).toBe(false)
  })

  it('opens settings panel', async () => {
    const vm = wrapper.vm as unknown as DashboardLayoutInstance
    const profileTrigger = wrapper.find('.profile-trigger')
    await profileTrigger.trigger('click')
    
    const settingsButton = wrapper.find('.menu-item')
    await settingsButton.trigger('click')
    
    expect(vm.showSettings).toBe(true)
  })

  it('closes menus when route changes', async () => {
    const vm = wrapper.vm as unknown as DashboardLayoutInstance
    // Open menus first
    vm.showSettings = true
    vm.showUserMenu = true
    vm.showNotifications = true
    
    // Trigger route change
    await router.push('/new-route')
    
    expect(vm.showSettings).toBe(false)
    expect(vm.showUserMenu).toBe(false)
    expect(vm.showNotifications).toBe(false)
  })

  it('provides required methods', () => {
    const vm = wrapper.vm as any
    expect(typeof vm.$.provides.refreshUserInfo).toBe('function')
    expect(typeof vm.$.provides.openSettings).toBe('function')
    expect(vm.$.provides.showSettings).toBeDefined()
  })

  it('refreshes user info correctly', async () => {
    const vm = wrapper.vm as unknown as DashboardLayoutInstance
    await vm.refreshUserInfo()
    expect(vm.userName).toBe('Test User')
    expect(vm.userRole).toBe('Admin')
  })
}) 