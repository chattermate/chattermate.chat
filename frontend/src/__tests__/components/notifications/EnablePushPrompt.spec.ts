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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EnablePushPrompt from '@/components/notifications/EnablePushPrompt.vue'

// visible flips in onMounted — flush the resulting DOM update before asserting
const mountPrompt = async () => {
  const wrapper = mount(EnablePushPrompt)
  await nextTick()
  return wrapper
}

vi.mock('@/pwa/register', () => ({
  isShopifyEmbedded: vi.fn(() => false),
}))

const setNotificationPermission = (permission: string | null) => {
  if (permission === null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).Notification
  } else {
    vi.stubGlobal('Notification', { permission })
  }
}

describe('EnablePushPrompt', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the enable card when permission is default', async () => {
    setNotificationPermission('default')
    const wrapper = await mountPrompt()
    expect(wrapper.find('.push-prompt').exists()).toBe(true)
    expect(wrapper.text()).toContain('Enable notifications')
  })

  it('stays hidden when permission is already granted', async () => {
    setNotificationPermission('granted')
    const wrapper = await mountPrompt()
    expect(wrapper.find('.push-prompt').exists()).toBe(false)
  })

  it('stays hidden when permission is denied', async () => {
    setNotificationPermission('denied')
    const wrapper = await mountPrompt()
    expect(wrapper.find('.push-prompt').exists()).toBe(false)
  })

  it('stays hidden while snoozed', async () => {
    setNotificationPermission('default')
    localStorage.setItem('cm-push-prompt-snoozed-at', String(Date.now()))
    const wrapper = await mountPrompt()
    expect(wrapper.find('.push-prompt').exists()).toBe(false)
  })

  it('emits enable and hides on the primary button', async () => {
    setNotificationPermission('default')
    const wrapper = await mountPrompt()
    await wrapper.find('.primary-btn').trigger('click')
    expect(wrapper.emitted('enable')).toHaveLength(1)
    expect(wrapper.find('.push-prompt').exists()).toBe(false)
  })

  it('snoozes on "Not now"', async () => {
    setNotificationPermission('default')
    const wrapper = await mountPrompt()
    await wrapper.find('.secondary-btn').trigger('click')
    expect(wrapper.find('.push-prompt').exists()).toBe(false)
    expect(localStorage.getItem('cm-push-prompt-snoozed-at')).toBeTruthy()
  })

  it('shows install-first guidance on iOS Safari (not installed)', async () => {
    setNotificationPermission(null)
    vi.stubGlobal('navigator', { userAgent: 'iPhone Safari' })
    const wrapper = await mountPrompt()
    expect(wrapper.text()).toContain('Add ChatterMate to your Home Screen')
    expect(wrapper.find('.primary-btn').exists()).toBe(false)
  })
})
