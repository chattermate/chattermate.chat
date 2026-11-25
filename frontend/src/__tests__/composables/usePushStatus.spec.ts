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
import { ref, computed } from 'vue'

const state = vi.hoisted(() => ({
  embedded: false,
  ios: false,
  standalone: false,
  supported: true,
}))

const mocks = vi.hoisted(() => ({
  enableNotifications: vi.fn(),
  refreshFCMToken: vi.fn(),
}))

// Plain refs stand in for the firebase service's readonly ones
const firebase = vi.hoisted(() => ({
  permission: null as unknown as { value: NotificationPermission | null },
  registration: null as unknown as { value: string },
}))

vi.mock('@/services/firebase', () => {
  firebase.permission = ref<NotificationPermission | null>('default')
  firebase.registration = ref('idle')
  return {
    notificationPermission: firebase.permission,
    deviceRegistration: firebase.registration,
    isPushSupported: () => Promise.resolve(state.supported),
    refreshFCMToken: mocks.refreshFCMToken,
    syncNotificationPermission: () => {
      firebase.permission.value = (globalThis as { Notification?: { permission: NotificationPermission } })
        .Notification?.permission ?? null
    },
  }
})
vi.mock('@/composables/useNotifications', () => ({
  enableNotifications: mocks.enableNotifications,
}))
vi.mock('@/pwa/register', () => ({
  isShopifyEmbedded: () => state.embedded,
}))
vi.mock('@/composables/usePWAInstall', () => ({
  usePWAInstall: () => ({ isIOS: state.ios, isStandalone: computed(() => state.standalone) }),
}))

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const load = async () => {
  const mod = await import('@/composables/usePushStatus')
  const status = mod.usePushStatus()
  await flush() // isPushSupported settles
  return { mod, status }
}

// Each fresh module adds its own focus listener; drop them between tests
const focusListeners: EventListenerOrEventListenerObject[] = []
const realAdd = window.addEventListener.bind(window)

describe('usePushStatus', () => {
  afterEach(() => {
    focusListeners.splice(0).forEach((fn) => window.removeEventListener('focus', fn))
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    vi.spyOn(window, 'addEventListener').mockImplementation((type, fn, opts) => {
      if (type === 'focus' && fn) focusListeners.push(fn)
      realAdd(type, fn as EventListener, opts)
    })
    vi.resetModules()
    vi.clearAllMocks()
    localStorage.clear()
    Object.assign(state, { embedded: false, ios: false, standalone: false, supported: true })
    // vi.mock factories run once; reset what they handed out
    if (firebase.permission) firebase.permission.value = 'default'
    if (firebase.registration) firebase.registration.value = 'idle'
    vi.stubGlobal('Notification', { permission: 'default' })
  })

  it('reads off while permission was never given', async () => {
    const { status } = await load()
    firebase.permission.value = 'default'

    expect(status.reason.value).toBe('off')
    expect(status.pushOff.value).toBe(true)
    expect(status.showLandingNotice.value).toBe(true)
  })

  it('reads blocked once the browser denied it', async () => {
    const { status } = await load()
    firebase.permission.value = 'denied'

    expect(status.reason.value).toBe('blocked')
  })

  it('asks iPhone Safari to install first, before anything else', async () => {
    state.ios = true
    state.supported = false
    const { status } = await load()

    expect(status.reason.value).toBe('install')
  })

  it('is quiet in the installed iPhone app once granted and registered', async () => {
    state.ios = true
    state.standalone = true
    const { status } = await load()
    firebase.permission.value = 'granted'
    firebase.registration.value = 'registered'

    expect(status.reason.value).toBeNull()
    expect(status.pushOff.value).toBe(false)
  })

  it('reads failed only when a granted device failed to register', async () => {
    const { status } = await load()
    firebase.permission.value = 'granted'

    for (const settled of ['idle', 'registering', 'registered', 'unsupported']) {
      firebase.registration.value = settled
      expect(status.reason.value).toBeNull()
    }
    firebase.registration.value = 'failed'
    expect(status.reason.value).toBe('failed')
  })

  it('shows nothing inside the Shopify admin', async () => {
    state.embedded = true
    state.ios = true
    const { status } = await load()

    expect(status.reason.value).toBeNull()
  })

  it('shows nothing where the browser has no push to turn on', async () => {
    state.supported = false
    const { status } = await load()
    firebase.permission.value = 'default'

    expect(status.reason.value).toBeNull()
  })

  it('turns on by asking for permission', async () => {
    const { status } = await load()
    firebase.permission.value = 'default'

    await status.turnOn()

    expect(mocks.enableNotifications).toHaveBeenCalledTimes(1)
    expect(mocks.refreshFCMToken).not.toHaveBeenCalled()
  })

  it('tries the registration again after a failure, without asking again', async () => {
    const { status } = await load()
    firebase.permission.value = 'granted'
    firebase.registration.value = 'failed'

    await status.turnOn()

    expect(mocks.refreshFCMToken).toHaveBeenCalledTimes(1)
    expect(mocks.enableNotifications).not.toHaveBeenCalled()
  })

  it('ignores a second tap while the first is still running', async () => {
    let finish = () => {}
    mocks.enableNotifications.mockReturnValueOnce(new Promise<void>((resolve) => { finish = resolve }))
    const { status } = await load()

    const first = status.turnOn()
    expect(status.busy.value).toBe(true)
    await status.turnOn()
    finish()
    await first

    expect(mocks.enableNotifications).toHaveBeenCalledTimes(1)
    expect(status.busy.value).toBe(false)
  })

  it('"Not now" hides the landing notice for 7 days, but not the off state', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      const { status } = await load()
      status.snoozeLanding()

      expect(status.showLandingNotice.value).toBe(false)
      expect(status.pushOff.value).toBe(true)

      // A fresh page load still remembers it
      vi.resetModules()
      const again = (await load()).status
      expect(again.showLandingNotice.value).toBe(false)

      vi.setSystemTime(Date.now() + 7 * 24 * 60 * 60 * 1000 + 1000)
      vi.resetModules()
      const later = (await load()).status
      expect(later.showLandingNotice.value).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps the landing notice back while the first-time card is asking', async () => {
    const { mod, status } = await load()

    mod.setFloatingPromptOpen(true)
    expect(status.showLandingNotice.value).toBe(false)
    expect(status.pushOff.value).toBe(true)

    mod.setFloatingPromptOpen(false)
    expect(status.showLandingNotice.value).toBe(true)
  })

  it('registers straight away when permission is granted in site settings', async () => {
    await load()
    firebase.permission.value = 'denied'

    vi.stubGlobal('Notification', { permission: 'granted' })
    window.dispatchEvent(new Event('focus'))

    expect(firebase.permission.value).toBe('granted')
    expect(mocks.enableNotifications).toHaveBeenCalledTimes(1)

    // Already granted: a later focus does nothing
    window.dispatchEvent(new Event('focus'))
    expect(mocks.enableNotifications).toHaveBeenCalledTimes(1)
  })
})
