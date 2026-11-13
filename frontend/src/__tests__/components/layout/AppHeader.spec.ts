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
import { mount } from '@vue/test-utils'
import AppHeader from '@/components/layout/AppHeader.vue'

const enterprise = vi.hoisted(() => ({ hasEnterpriseModule: false }))
vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({
    hasEnterpriseModule: enterprise.hasEnterpriseModule,
    moduleImports: { supportChatButton: 'support', promoHeaderPill: 'promo' },
    enterpriseComponent: (path: string) => ({ name: `Enterprise-${path}`, render: () => null }),
  }),
}))

const mountHeader = (props: Record<string, unknown> = {}) =>
  mount(AppHeader, {
    props: {
      pageTitle: 'Analytics',
      section: 'Workspace',
      isOnline: true,
      statusUpdating: false,
      unreadCount: 0,
      themeMode: 'dark',
      ...props,
    },
  })

describe('AppHeader', () => {
  it('shows a breadcrumb of the section and the current page', () => {
    const wrapper = mountHeader()

    const crumbs = wrapper.findAll('.breadcrumb .crumb').map((c) => c.text())
    expect(crumbs).toEqual(['Workspace', 'Analytics'])
    expect(wrapper.find('[aria-current="page"]').text()).toBe('Analytics')
  })

  it('shows just the page when it belongs to no section, and nothing without a title', () => {
    expect(mountHeader({ section: undefined }).findAll('.crumb').map((c) => c.text())).toEqual(['Analytics'])
    expect(mountHeader({ pageTitle: undefined }).find('.breadcrumb').exists()).toBe(false)
  })

  it('shows the status and asks to flip it', async () => {
    const wrapper = mountHeader()
    const pill = wrapper.find('.status-pill')

    expect(pill.text()).toBe('Online')
    expect(pill.attributes('aria-pressed')).toBe('true')
    expect(pill.attributes('aria-label')).toBe('Status: Online. Go offline')
    await pill.trigger('click')
    expect(wrapper.emitted('toggle-status')).toHaveLength(1)
  })

  it('reads Offline and blocks a second change while one is in flight', () => {
    const pill = mountHeader({ isOnline: false, statusUpdating: true }).find('.status-pill')

    expect(pill.text()).toBe('Offline')
    expect(pill.attributes('aria-label')).toBe('Status: Offline. Go online')
    expect(pill.attributes('disabled')).toBeDefined()
  })

  it('caps the notification count and names it for screen readers', () => {
    const wrapper = mountHeader({ unreadCount: 140 })

    expect(wrapper.find('.notification-badge').text()).toBe('99+')
    expect(wrapper.find('.notification-button').attributes('aria-label')).toBe('Notifications, 140 unread')
  })

  it('has no badge with nothing unread', () => {
    const wrapper = mountHeader()

    expect(wrapper.find('.notification-badge').exists()).toBe(false)
    expect(wrapper.find('.notification-button').attributes('aria-label')).toBe('Notifications')
  })

  it('names the current theme and the next one on the toggle', async () => {
    const wrapper = mountHeader({ themeMode: 'light' })
    const toggle = wrapper.findAll('.icon-btn').find((b) => b.attributes('aria-label')?.startsWith('Theme'))!

    expect(toggle.attributes('aria-label')).toBe('Theme: Light. Switch to System')
    await toggle.trigger('click')
    expect(wrapper.emitted('toggle-theme')).toHaveLength(1)
  })

  it('passes the bell and the tablet menu button up', async () => {
    const wrapper = mountHeader()

    await wrapper.find('.notification-button').trigger('click')
    await wrapper.find('.hamburger-menu').trigger('click')

    expect(wrapper.emitted('notifications')).toHaveLength(1)
    expect(wrapper.emitted('toggle-sidebar')).toHaveLength(1)
  })

  it('leaves the hosted-only slots out of the open-source build', () => {
    enterprise.hasEnterpriseModule = false
    const wrapper = mountHeader()

    expect(wrapper.findComponent({ name: 'Enterprise-support' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'Enterprise-promo' }).exists()).toBe(false)
  })

  it('mounts the help button and offer pill with the enterprise module', () => {
    enterprise.hasEnterpriseModule = true
    const wrapper = mountHeader()

    expect(wrapper.findComponent({ name: 'Enterprise-support' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'Enterprise-promo' }).exists()).toBe(true)
    enterprise.hasEnterpriseModule = false
  })
})
