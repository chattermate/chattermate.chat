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

import { computed, ref } from 'vue'
import {
  deviceRegistration,
  isPushSupported,
  notificationPermission,
  refreshFCMToken,
  syncNotificationPermission,
} from '@/services/firebase'
import { isShopifyEmbedded } from '@/pwa/register'
import { onSignedOut } from '@/utils/sessionEvents'
import { enableNotifications } from './useNotifications'
import { usePWAInstall } from './usePWAInstall'

/**
 * Why this browser isn't receiving push, or null when it is (or when there is
 * nothing the user could do about it here).
 * - off: never asked, or the first-time card was snoozed
 * - blocked: the user denied permission in the browser
 * - install: iPhone Safari tab; push only exists once added to the Home Screen
 * - failed: permission granted, but the token never reached the server
 */
export type PushOffReason = 'off' | 'blocked' | 'install' | 'failed'

/** "Not now" on the landing banner hides it (not the drawer line, inbox strip or bell dot) for this long. */
export const LANDING_SNOOZE_KEY = 'cm-push-banner-snoozed-at'
export const LANDING_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000

const readSnoozedAt = (): number => {
  try {
    return Number(localStorage.getItem(LANDING_SNOOZE_KEY) || 0)
  } catch {
    return 0
  }
}

// Module-level: the panel line, bell dot and landing banners all read one state
const pushSupported = ref<boolean | null>(null)
const snoozedAt = ref(readSnoozedAt())
const busy = ref(false)
// The first-time floating card is up: the landing banner would only repeat it
const floatingPromptOpen = ref(false)
const { isIOS, isStandalone } = usePWAInstall()
let watching = false

// Permission can change under us in the browser's site settings. Coming back
// as granted, register this device straight away rather than waiting for a reload.
const onPermissionMaybeChanged = () => {
  const before = notificationPermission.value
  syncNotificationPermission()
  if (before !== 'granted' && notificationPermission.value === 'granted') {
    enableNotifications()
  }
}

let permissionStatus: PermissionStatus | null = null

const startWatching = () => {
  if (watching || typeof window === 'undefined') return
  watching = true
  isPushSupported().then((supported) => { pushSupported.value = supported })
  navigator.permissions
    ?.query({ name: 'notifications' as PermissionName })
    .then((status) => {
      permissionStatus = status
      status.addEventListener('change', onPermissionMaybeChanged)
    })
    .catch(() => { /* no Permissions API for notifications: the focus check covers it */ })
  window.addEventListener('focus', onPermissionMaybeChanged)
}

// Signed out, there's no one to register for; the next dashboard mount watches again
onSignedOut(() => {
  if (!watching) return
  watching = false
  permissionStatus?.removeEventListener('change', onPermissionMaybeChanged)
  permissionStatus = null
  window.removeEventListener('focus', onPermissionMaybeChanged)
})

const deviceReason = computed<PushOffReason | null>(() => {
  if (isIOS && !isStandalone.value) return 'install'
  // Unknown yet, or a browser with no push at all: nothing to offer
  if (pushSupported.value !== true) return null
  switch (notificationPermission.value) {
    case 'default':
      return 'off'
    case 'denied':
      return 'blocked'
    case 'granted':
      return deviceRegistration.value === 'failed' ? 'failed' : null
    default:
      return null
  }
})

const landingSnoozed = computed(
  () => snoozedAt.value > 0 && Date.now() - snoozedAt.value < LANDING_SNOOZE_MS
)

/** Turn on (asks for permission) or, after a failed registration, try again. */
const turnOn = async (): Promise<void> => {
  if (busy.value) return
  busy.value = true
  try {
    if (deviceReason.value === 'failed') await refreshFCMToken()
    else await enableNotifications()
  } finally {
    busy.value = false
  }
}

const snoozeLanding = () => {
  const now = Date.now()
  snoozedAt.value = now
  try {
    localStorage.setItem(LANDING_SNOOZE_KEY, String(now))
  } catch {
    /* storage blocked: hidden for this page load only */
  }
}

/** The first-time floating card reports whether it's showing. */
export const setFloatingPromptOpen = (open: boolean) => {
  floatingPromptOpen.value = open
}

/**
 * Whether push works on this device, for every "notifications are off"
 * surface: the notification panel line, the bell dot and the landing banners.
 */
export function usePushStatus() {
  startWatching()
  // Per caller, not module-wide: the same tab can move between the dashboard
  // and /shopify pages, and each surface asks as it mounts
  const reason = computed(() => (isShopifyEmbedded() ? null : deviceReason.value))

  return {
    reason,
    pushOff: computed(() => reason.value !== null),
    showLandingNotice: computed(
      () => reason.value !== null && !landingSnoozed.value && !floatingPromptOpen.value
    ),
    busy,
    turnOn,
    snoozeLanding,
  }
}
