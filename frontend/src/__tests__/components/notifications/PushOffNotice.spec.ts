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
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PushOffNotice from '@/components/notifications/PushOffNotice.vue'
import type { PushOffReason } from '@/composables/usePushStatus'

const push = vi.hoisted(() => ({
  reason: null as unknown as { value: PushOffReason | null },
  landing: null as unknown as { value: boolean },
  turnOn: vi.fn(),
  snoozeLanding: vi.fn(),
}))

vi.mock('@/composables/usePushStatus', async () => {
  const { ref } = await import('vue')
  push.reason = ref<PushOffReason | null>('off')
  push.landing = ref(true)
  return {
    usePushStatus: () => ({
      reason: push.reason,
      showLandingNotice: push.landing,
      busy: ref(false),
      turnOn: push.turnOn,
      snoozeLanding: push.snoozeLanding,
    }),
  }
})

const browser = vi.hoisted(() => ({ kind: 'chrome' as string }))
vi.mock('@/utils/browserKind', () => ({ detectBrowser: () => browser.kind }))

const stubs = { 'font-awesome-icon': true, teleport: true }
const mountNotice = (variant: 'panel' | 'banner' | 'strip') =>
  mount(PushOffNotice, { props: { variant }, global: { stubs } })

describe('PushOffNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    push.reason.value = 'off'
    push.landing.value = true
    browser.kind = 'chrome'
  })

  it.each([
    ['off', 'Notifications are off on this device', "You won't hear about new chats until you turn them on.", 'Turn on'],
    ['blocked', 'Notifications are blocked in this browser', 'Click the icon left of the address bar and allow notifications.', 'Show me how'],
    ['install', 'Add ChatterMate to your Home Screen', 'iPhone only sends notifications to installed apps. Tap Share, then Add to Home Screen.', null],
    ['failed', "Couldn't set up notifications", "This device isn't receiving them yet.", 'Try again'],
  ] as const)('panel line reads the %s state', (reason, title, body, action) => {
    push.reason.value = reason
    const wrapper = mountNotice('panel')

    expect(wrapper.find('.push-off-title').text()).toBe(title)
    expect(wrapper.find('.push-off-body').text()).toBe(body)
    const cta = wrapper.find('.push-off-cta')
    expect(cta.exists() ? cta.text() : null).toBe(action)
    // The panel line can't be dismissed
    expect(wrapper.find('.push-off-dismiss').exists()).toBe(false)
    expect(wrapper.find('.push-off-close').exists()).toBe(false)
  })

  it('blocked: Show me how opens the steps for this browser, not the enable flow', async () => {
    push.reason.value = 'blocked'
    browser.kind = 'safari'
    const wrapper = mountNotice('panel')
    expect(wrapper.find('.push-off-body').text()).toBe('Allow them for this site in Safari → Settings → Websites.')

    await wrapper.find('.push-off-cta').trigger('click')

    expect(push.turnOn).not.toHaveBeenCalled()
    const guide = wrapper.find('[role="dialog"]')
    expect(guide.attributes('aria-label')).toBe('Turn notifications back on')
    expect(guide.findAll('.ug-step').map((step) => step.find('.ug-step-text').text())).toEqual([
      '1In the menu bar, choose Safari → Settings.',
      '2Open Websites → Notifications and set this site to Allow.',
      '3Reload this page.',
    ])
  })

  it('the steps close by themselves once notifications are allowed', async () => {
    push.reason.value = 'blocked'
    const wrapper = mountNotice('banner')
    await wrapper.find('.push-off-cta').trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    push.reason.value = 'failed'
    await nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('in Brave, a failed registration names the setting that blocks it', () => {
    push.reason.value = 'failed'
    browser.kind = 'brave'
    const wrapper = mountNotice('panel')

    expect(wrapper.find('.push-off-body').text()).toBe(
      'In Brave, turn on "Use Google services for push messaging" in Settings → Privacy, then try again.'
    )
    expect(wrapper.find('.push-off-cta').text()).toBe('Try again')
  })

  it('panel line stays while the landing notice is snoozed, and goes when push works', async () => {
    push.landing.value = false
    const wrapper = mountNotice('panel')
    expect(wrapper.find('.push-off').exists()).toBe(true)

    push.reason.value = null
    await nextTick()
    expect(wrapper.find('.push-off').exists()).toBe(false)
  })

  it('Turn on runs the enable flow', async () => {
    const wrapper = mountNotice('panel')
    await wrapper.find('.push-off-cta').trigger('click')
    expect(push.turnOn).toHaveBeenCalledTimes(1)
  })

  it('banner speaks to the team and can be put off', async () => {
    const wrapper = mountNotice('banner')

    expect(wrapper.text()).toContain("Notifications are off on this device. You won't hear about chats waiting for your team.")
    await wrapper.find('.push-off-dismiss').trigger('click')
    expect(push.snoozeLanding).toHaveBeenCalledTimes(1)
    await wrapper.find('.push-off-cta').trigger('click')
    expect(push.turnOn).toHaveBeenCalledTimes(1)
  })

  it('banner follows the other states too', () => {
    push.reason.value = 'blocked'
    const wrapper = mountNotice('banner')

    expect(wrapper.text()).toContain('Notifications are blocked in this browser.')
    expect(wrapper.find('.push-off-cta').text()).toBe('Show me how')
    expect(wrapper.find('.push-off-dismiss').exists()).toBe(true)
  })

  it('inbox strip is one short line with Turn on, and nothing to put it off', () => {
    const wrapper = mountNotice('strip')

    expect(wrapper.find('.push-off-text').text()).toBe('Notifications are off')
    expect(wrapper.find('.push-off-cta').text()).toBe('Turn on')
    expect(wrapper.findAll('button').map((button) => button.text())).toEqual(['Turn on'])
  })

  it('"Not now" hides the banner, but the inbox strip stays while push is off', () => {
    push.landing.value = false
    expect(mountNotice('banner').find('.push-off').exists()).toBe(false)
    expect(mountNotice('strip').find('.push-off').exists()).toBe(true)
  })

  it('shows nothing anywhere while push works', () => {
    push.reason.value = null
    for (const variant of ['panel', 'banner', 'strip'] as const) {
      expect(mountNotice(variant).find('.push-off').exists()).toBe(false)
    }
  })
})

