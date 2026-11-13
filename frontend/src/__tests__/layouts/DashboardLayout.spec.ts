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
import { flushPromises, mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import DashboardLayout from '../../layouts/DashboardLayout.vue'
import { createPinia, setActivePinia } from 'pinia'
import { updateUserStatus } from '@/services/users'
import { toast } from 'vue-sonner'

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    logout: vi.fn()
  })
}))

vi.mock('@/composables/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    hasPermission: { value: false },
    enableNotifications: vi.fn()
  }))
}))

vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({
    hasEnterpriseModule: false,
    subscriptionStore: { value: { fetchCurrentPlan: vi.fn().mockResolvedValue(undefined) } },
    initializeSubscriptionStore: vi.fn().mockResolvedValue(undefined),
    moduleImports: {},
    enterpriseComponent: () => ({ name: 'EnterpriseEmpty', render: () => null }),
  })
}))

const navCounts = vi.hoisted(() => ({ waiting: 3, tickets: 2 }))
vi.mock('@/composables/useNavCounts', () => ({
  useNavCounts: () => ({
    waitingForHuman: ref(navCounts.waiting),
    openTickets: ref(navCounts.tickets),
    refresh: vi.fn(),
  })
}))

vi.mock('@/services/user', () => ({
  userService: {
    getCurrentUser: () => ({
      id: '1',
      full_name: 'Test User',
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

vi.mock('vue-sonner', () => ({
  toast: { error: vi.fn() }
}))

const Page = { template: '<div>Page</div>' }
const makeRouter = () =>
  createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: Page },
      { path: '/analytics', component: Page },
      { path: '/conversations', component: Page },
      { path: '/knowledge', name: 'knowledge', component: Page },
    ]
  })

const mountAt = async (path: string, props: Record<string, unknown> = {}) => {
  const router = makeRouter()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(DashboardLayout, {
    props,
    global: {
      plugins: [router],
      stubs: { AppSidebar: true, NotificationList: true, FailedSourceNotice: true }
    }
  })
  await flushPromises()
  return { wrapper, router }
}

describe('DashboardLayout', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1920 })
    setActivePinia(createPinia())
    vi.mocked(updateUserStatus).mockReset()
    vi.mocked(toast.error).mockReset()
    ;({ wrapper } = await mountAt('/analytics'))
  })

  it('renders the shell without the old page footer', () => {
    expect(wrapper.find('.dashboard-layout').exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(false)
  })

  it('toggles the sidebar', async () => {
    expect(wrapper.classes()).not.toContain('sidebar-collapsed')
    await wrapper.findComponent({ name: 'AppSidebar' }).vm.$emit('toggle')
    expect(wrapper.classes()).toContain('sidebar-collapsed')
  })

  it('hands the sidebar its badge counts and the signed-in user', () => {
    const sidebar = wrapper.findComponent({ name: 'AppSidebar' })
    expect(sidebar.props('inboxCount')).toBe(3)
    expect(sidebar.props('ticketsCount')).toBe(2)
    expect(sidebar.props('user')).toMatchObject({ full_name: 'Test User' })
    expect(sidebar.props('role')).toBe('Admin')
    expect(sidebar.props('isOnline')).toBe(true)
  })

  it('names the current page in the header breadcrumb', () => {
    expect(wrapper.find('.breadcrumb [aria-current="page"]').text()).toBe('Analytics')
  })

  it('shows the unread notification count on the bell', () => {
    expect(wrapper.find('.notification-badge').text()).toBe('5')
  })

  it('goes offline from the header pill once the server accepts it', async () => {
    vi.mocked(updateUserStatus).mockResolvedValue(undefined)
    const pill = wrapper.find('.status-pill')
    expect(pill.text()).toBe('Online')

    await pill.trigger('click')
    await flushPromises()

    expect(updateUserStatus).toHaveBeenCalledWith('1', false)
    expect(wrapper.find('.status-pill').text()).toBe('Offline')
    expect(wrapper.findComponent({ name: 'AppSidebar' }).props('isOnline')).toBe(false)
  })

  it('keeps the status and says so when the change fails', async () => {
    vi.mocked(updateUserStatus).mockRejectedValue(new Error('offline'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await wrapper.find('.status-pill').trigger('click')
    await flushPromises()

    expect(wrapper.find('.status-pill').text()).toBe('Online')
    expect(toast.error).toHaveBeenCalled()
  })

  it('changes status from the sidebar account menu too', async () => {
    vi.mocked(updateUserStatus).mockResolvedValue(undefined)
    await wrapper.findComponent({ name: 'AppSidebar' }).vm.$emit('toggle-status')
    await flushPromises()
    expect(updateUserStatus).toHaveBeenCalledWith('1', false)
  })
})

describe('DashboardLayout - tab title', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('names the page in the browser tab', async () => {
    await mountAt('/analytics')
    expect(document.title).toBe('Analytics · ChatterMate')
  })

  it('prefixes the Inbox with the chats waiting for a human', async () => {
    await mountAt('/conversations')
    expect(document.title).toBe('(3) Inbox · ChatterMate')
  })

  it('follows navigation and resets when the dashboard closes', async () => {
    const { wrapper, router } = await mountAt('/analytics')
    await router.push('/conversations')
    await flushPromises()
    expect(document.title).toBe('(3) Inbox · ChatterMate')

    wrapper.unmount()
    expect(document.title).toBe('ChatterMate')
  })

  it('falls back to the app name on a page without a title', async () => {
    await mountAt('/')
    expect(document.title).toBe('ChatterMate')
  })
})

describe('DashboardLayout - menus', () => {
  it('closes the notification drawer when the route changes', async () => {
    setActivePinia(createPinia())
    const { wrapper, router } = await mountAt('/analytics')
    await wrapper.find('.notification-button').trigger('click')
    expect(wrapper.findComponent({ name: 'NotificationList' }).props('isOpen')).toBe(true)

    await router.push('/conversations')
    await flushPromises()

    expect(wrapper.findComponent({ name: 'NotificationList' }).props('isOpen')).toBe(false)
  })
})

describe('DashboardLayout - unreadable website notice', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows on an ordinary page', async () => {
    const { wrapper } = await mountAt('/')

    expect(wrapper.findComponent({ name: 'FailedSourceNotice' }).exists()).toBe(true)
  })

  it('is left off the knowledge page, which lists the failed source itself', async () => {
    const { wrapper } = await mountAt('/knowledge')

    expect(wrapper.findComponent({ name: 'FailedSourceNotice' }).exists()).toBe(false)
  })

  it('is left off full-page layouts, whose content is a fixed viewport height', async () => {
    const { wrapper } = await mountAt('/', { hideHeader: true })

    expect(wrapper.findComponent({ name: 'FailedSourceNotice' }).exists()).toBe(false)
  })
})
