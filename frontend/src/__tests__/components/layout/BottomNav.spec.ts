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
import { createRouter, createWebHistory } from 'vue-router'
import BottomNav from '@/components/layout/BottomNav.vue'

vi.mock('@/utils/permissions', async () => {
  const { createPermissionMocks } = await import('../../fixtures/permissions')
  return { permissionChecks: createPermissionMocks() }
})

vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({ hasEnterpriseModule: false }),
}))

const routes = ['/conversations', '/people', '/ai-agents', '/analytics', '/knowledge'].map(
  (path) => ({ path, component: { template: '<div />' } })
)
routes.push({ path: '/', component: { template: '<div />' } })

const makeRouter = () => createRouter({ history: createWebHistory(), routes })

const mountNav = async (props = {}, path = '/conversations') => {
  const router = makeRouter()
  await router.push(path)
  await router.isReady()
  return mount(BottomNav, { props, global: { plugins: [router] } })
}

describe('BottomNav', () => {
  it('renders the four primary items plus More', async () => {
    const wrapper = await mountNav()
    const labels = wrapper.findAll('.bottom-nav-label').map((n) => n.text())
    expect(labels).toEqual(['Inbox', 'People', 'AI Agents', 'Analytics', 'More'])
  })

  it('marks the current route active', async () => {
    const wrapper = await mountNav({}, '/analytics')
    const active = wrapper.findAll('.bottom-nav-item.active')
    expect(active).toHaveLength(1)
    expect(active[0].text()).toContain('Analytics')
  })

  it('marks More active when on an overflow route', async () => {
    const wrapper = await mountNav({}, '/knowledge')
    const active = wrapper.findAll('.bottom-nav-item.active')
    expect(active).toHaveLength(1)
    expect(active[0].text()).toContain('More')
  })

  it('shows an unread badge on More and caps it at 99+', async () => {
    const wrapper = await mountNav({ unreadCount: 3 })
    expect(wrapper.find('.bottom-nav-badge').text()).toBe('3')

    await wrapper.setProps({ unreadCount: 120 })
    expect(wrapper.find('.bottom-nav-badge').text()).toBe('99+')

    await wrapper.setProps({ unreadCount: 0 })
    expect(wrapper.find('.bottom-nav-badge').exists()).toBe(false)
  })

  it('emits more when the More button is tapped', async () => {
    const wrapper = await mountNav()
    await wrapper.find('button.bottom-nav-item').trigger('click')
    expect(wrapper.emitted('more')).toHaveLength(1)
  })
})
