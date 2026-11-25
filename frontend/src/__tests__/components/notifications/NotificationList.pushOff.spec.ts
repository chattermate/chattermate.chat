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
import NotificationList from '@/components/notifications/NotificationList.vue'
import MoreSheet from '@/components/layout/MoreSheet.vue'

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('@/services/notification', () => ({
  notificationService: { getNotifications: vi.fn().mockResolvedValue([]) },
}))
vi.mock('@/components/layout/navItems', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/components/layout/navItems')>()),
  useNavItems: () => ({ moreNavGroups: { value: [] } }),
}))

describe('push-off line in the notification drawer', () => {
  it('sits between the drawer header and the All/Unread filter', () => {
    const wrapper = mount(NotificationList, {
      props: { isOpen: true },
      global: { stubs: { PushOffNotice: true } },
    })

    const line = wrapper.findComponent({ name: 'PushOffNotice' })
    expect(line.props('variant')).toBe('panel')
    expect(line.element.previousElementSibling?.classList.contains('drawer-header')).toBe(true)
    expect(line.element.nextElementSibling?.classList.contains('drawer-filter')).toBe(true)
  })
})

describe('push-off mark in the More sheet', () => {
  const mountSheet = (pushOff: boolean) =>
    mount(MoreSheet, {
      props: { open: true, pushOff },
      global: { stubs: { teleport: true, InstallPrompt: true } },
    })

  it('says notifications are off on this device beside the Notifications row', () => {
    expect(mountSheet(true).find('.row-push-off').text()).toBe('Off on this device')
    expect(mountSheet(false).find('.row-push-off').exists()).toBe(false)
  })
})
