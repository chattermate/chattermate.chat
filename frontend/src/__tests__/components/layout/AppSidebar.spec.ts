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
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { SETTINGS_GROUP_STORAGE_KEY } from '@/components/layout/useSettingsGroup'
import { PAGE_TITLES } from '@/router/pageTitles'

const ADMIN = [
  'manage_agents', 'manage_users', 'view_all_chats', 'manage_all_chats', 'view_people',
  'manage_knowledge', 'view_analytics', 'view_tickets', 'manage_organization',
  'manage_ai_config', 'manage_subscription',
]

// Real permission checks, driven by the cached user (see navItems.spec)
const currentUser = await vi.hoisted(async () => ({ value: null as unknown }))
vi.mock('@/services/user', () => ({
  userService: { getCurrentUser: () => currentUser.value },
}))

vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({
    hasEnterpriseModule: false,
    moduleImports: {},
    enterpriseComponent: () => ({ name: 'EnterpriseEmpty', render: () => null }),
  }),
}))

vi.mock('@/composables/useMyAvatar', () => ({
  useMyAvatar: () => ({ src: { value: null }, failed: { value: false }, onError: vi.fn() }),
}))

import { userWithPermissions } from '../../fixtures/permissions'

const routes = [...Object.keys(PAGE_TITLES), '/'].map((path) => ({ path, component: { template: '<div />' } }))

const mountSidebar = async (path = '/analytics', props: Record<string, unknown> = {}) => {
  const router = createRouter({ history: createWebHistory(), routes })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(AppSidebar, {
    props: {
      isCollapsed: false,
      user: { id: 'u1', full_name: 'Jordan Lee', email: 'jordan@example.com', is_online: true },
      role: 'Admin',
      isOnline: true,
      statusUpdating: false,
      ...props,
    },
    global: { plugins: [router] },
    attachTo: document.body,
  })
  return { wrapper, router }
}

const linkNames = (wrapper: Awaited<ReturnType<typeof mountSidebar>>['wrapper']) =>
  wrapper.findAll('nav.sidebar-nav a').map((a) => a.find('.nav-label').text())

const settingsToggle = (wrapper: Awaited<ReturnType<typeof mountSidebar>>['wrapper']) =>
  wrapper.find('.settings-toggle')

describe('AppSidebar', () => {
  beforeEach(() => {
    currentUser.value = userWithPermissions(ADMIN)
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('lists the workspace under its heading, with settings folded away', async () => {
    const { wrapper } = await mountSidebar()

    expect(wrapper.find('.nav-section-heading').text()).toBe('Workspace')
    expect(linkNames(wrapper).slice(0, 8)).toEqual([
      'AI Agents', 'Human Agents', 'Inbox', 'Tickets', 'People', 'Knowledge', 'Help center', 'Analytics',
    ])
    expect(settingsToggle(wrapper).attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('#sidebar-settings-items').isVisible()).toBe(false)
  })

  it('marks the current page, and a page beneath a link', async () => {
    const { wrapper } = await mountSidebar('/tickets/42')

    const current = wrapper.findAll('nav.sidebar-nav a[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0].text()).toContain('Tickets')
  })

  it('opens and closes the Settings group, and remembers the choice', async () => {
    const { wrapper } = await mountSidebar()

    await settingsToggle(wrapper).trigger('click')
    expect(settingsToggle(wrapper).attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('#sidebar-settings-items').isVisible()).toBe(true)
    expect(localStorage.getItem(SETTINGS_GROUP_STORAGE_KEY)).toBe('1')

    await settingsToggle(wrapper).trigger('click')
    expect(settingsToggle(wrapper).attributes('aria-expanded')).toBe('false')
    expect(localStorage.getItem(SETTINGS_GROUP_STORAGE_KEY)).toBe('0')
  })

  it('starts open where the user left it', async () => {
    localStorage.setItem(SETTINGS_GROUP_STORAGE_KEY, '1')
    const { wrapper } = await mountSidebar()

    expect(settingsToggle(wrapper).attributes('aria-expanded')).toBe('true')
  })

  it('is always open on one of its own pages, so the current page shows', async () => {
    const { wrapper, router } = await mountSidebar()
    expect(settingsToggle(wrapper).attributes('aria-expanded')).toBe('false')

    await router.push('/settings/organization')
    await flushPromises()

    expect(settingsToggle(wrapper).attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('#sidebar-settings-items a[aria-current="page"]').text()).toBe('Organization')
  })

  it('reopens on the next settings page after being closed on one', async () => {
    const { wrapper, router } = await mountSidebar('/settings/organization')
    await settingsToggle(wrapper).trigger('click')
    expect(settingsToggle(wrapper).attributes('aria-expanded')).toBe('false')

    await router.push('/settings/ticketing')
    await flushPromises()

    expect(settingsToggle(wrapper).attributes('aria-expanded')).toBe('true')
  })

  it('keeps personal pages out of the Settings group', async () => {
    const { wrapper } = await mountSidebar('/settings/organization')

    const groupLinks = wrapper.findAll('#sidebar-settings-items a').map((a) => a.text())
    expect(groupLinks).toContain('Organization')
    expect(groupLinks).not.toContain('User Settings')
  })

  it('has no Settings group for someone with no organization settings', async () => {
    currentUser.value = userWithPermissions(['view_assigned_chats'])
    const { wrapper } = await mountSidebar('/conversations')

    expect(settingsToggle(wrapper).exists()).toBe(false)
  })

  it('shows the Inbox and Tickets counts beside their names, but keeps the names clean', async () => {
    const { wrapper } = await mountSidebar('/analytics', { inboxCount: 3, ticketsCount: 120 })

    const inbox = wrapper.find('a[href="/conversations"]')
    expect(inbox.find('.nav-badge').text()).toBe('3')
    expect(inbox.find('.nav-badge').classes()).toContain('accent')
    expect(inbox.find('.nav-badge').attributes('title')).toBe('3 waiting for a human')
    expect(inbox.find('.nav-badge').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('a[href="/tickets"] .nav-badge').text()).toBe('99+')
  })

  it('shows no badge for a zero or unknown count', async () => {
    const { wrapper } = await mountSidebar('/analytics', { inboxCount: 0, ticketsCount: null })

    expect(wrapper.findAll('.nav-badge')).toHaveLength(0)
  })

  describe('collapsed to the rail', () => {
    it('keeps icon links named and drops the visible labels', async () => {
      const { wrapper } = await mountSidebar('/analytics', { isCollapsed: true })

      expect(wrapper.find('.nav-label').exists()).toBe(false)
      expect(wrapper.find('.nav-section-heading').exists()).toBe(false)
      const analytics = wrapper.find('a[href="/analytics"]')
      expect(analytics.attributes('aria-label')).toBe('Analytics')
      expect(analytics.attributes('title')).toBe('Analytics')
    })

    it('turns counts into dots', async () => {
      const { wrapper } = await mountSidebar('/analytics', { isCollapsed: true, inboxCount: 3 })

      expect(wrapper.find('a[href="/conversations"] .nav-dot').exists()).toBe(true)
      expect(wrapper.find('.nav-badge').exists()).toBe(false)
    })

    it('expands the sidebar with Settings open when the gear is clicked', async () => {
      const { wrapper } = await mountSidebar('/analytics', { isCollapsed: true })

      await settingsToggle(wrapper).trigger('click')

      expect(wrapper.emitted('toggle')).toHaveLength(1)
      expect(localStorage.getItem(SETTINGS_GROUP_STORAGE_KEY)).toBe('1')
    })
  })

  describe('account menu', () => {
    const openMenu = async (wrapper: Awaited<ReturnType<typeof mountSidebar>>['wrapper']) => {
      await wrapper.find('.account-trigger').trigger('click')
      return wrapper.find('[role="menu"]')
    }

    it('names the user and their status on the trigger', async () => {
      const { wrapper } = await mountSidebar()

      const trigger = wrapper.find('.account-trigger')
      expect(trigger.attributes('aria-label')).toBe('Account menu: Jordan Lee, online')
      expect(trigger.find('.account-meta').text()).toBe('Admin · Online')
    })

    it('holds the status switch, the personal pages and log out', async () => {
      const { wrapper } = await mountSidebar()
      const menu = await openMenu(wrapper)

      expect(menu.find('[role="menuitemcheckbox"]').attributes('aria-checked')).toBe('true')
      expect(menu.findAll('[role="menuitem"]').map((i) => i.text())).toEqual(['User Settings', 'Log out'])
    })

    it('passes the status switch and log out up, closing the menu', async () => {
      const { wrapper } = await mountSidebar()

      await (await openMenu(wrapper)).find('[role="menuitemcheckbox"]').trigger('click')
      expect(wrapper.emitted('toggle-status')).toHaveLength(1)
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)

      const logout = (await openMenu(wrapper)).findAll('[role="menuitem"]').at(-1)!
      await logout.trigger('click')
      expect(wrapper.emitted('logout')).toHaveLength(1)
    })

    it('locks the status switch while a change is in flight', async () => {
      const { wrapper } = await mountSidebar('/analytics', { statusUpdating: true })
      const menu = await openMenu(wrapper)

      expect(menu.find('[role="menuitemcheckbox"]').attributes('disabled')).toBeDefined()
    })

    it('follows the menu keyboard pattern: focus moves in, arrows cycle, Escape returns', async () => {
      const { wrapper } = await mountSidebar()
      const trigger = wrapper.find('.account-trigger')

      await trigger.trigger('keydown', { key: 'ArrowDown' })
      await flushPromises()
      const items = wrapper.findAll('[role^="menuitem"]')
      expect(document.activeElement).toBe(items[0].element)
      items.forEach((item) => expect(item.attributes('tabindex')).toBe('-1'))

      const menu = wrapper.find('[role="menu"]')
      await menu.trigger('keydown', { key: 'ArrowDown' })
      expect(document.activeElement).toBe(items[1].element)
      await menu.trigger('keydown', { key: 'End' })
      expect(document.activeElement).toBe(items.at(-1)!.element)
      await menu.trigger('keydown', { key: 'ArrowDown' })
      expect(document.activeElement).toBe(items[0].element)
      await menu.trigger('keydown', { key: 'ArrowUp' })
      expect(document.activeElement).toBe(items.at(-1)!.element)

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await flushPromises()
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
      expect(document.activeElement).toBe(trigger.element)
    })

    it('opens on the last item with ArrowUp, and closes on Tab', async () => {
      const { wrapper } = await mountSidebar()

      await wrapper.find('.account-trigger').trigger('keydown', { key: 'ArrowUp' })
      await flushPromises()
      expect(document.activeElement?.textContent).toContain('Log out')

      await wrapper.find('[role="menu"]').trigger('keydown', { key: 'Tab' })
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    })

    it('closes on Escape and on a click elsewhere', async () => {
      const { wrapper } = await mountSidebar()

      await openMenu(wrapper)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await flushPromises()
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)

      await openMenu(wrapper)
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      await flushPromises()
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    })
  })
})
