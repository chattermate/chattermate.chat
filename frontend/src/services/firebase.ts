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

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { isSupported, type Messaging } from 'firebase/messaging'
import { userService } from './user'
import { getSWRegistration } from '@/pwa/register'
import {
  getFirebaseApiKey,
  getFirebaseAuthDomain,
  getFirebaseProjectId,
  getFirebaseMessagingSenderId,
  getFirebaseAppId,
  getFirebaseStorageBucket,
  getFirebaseMeasurementId,
  getFirebaseVapidKey,
} from '@/config/api'

// Runtime config (window.APP_CONFIG, docker-substituted) with build-time fallback
const firebaseConfig = () => ({
  apiKey: getFirebaseApiKey(),
  authDomain: getFirebaseAuthDomain(),
  projectId: getFirebaseProjectId(),
  messagingSenderId: getFirebaseMessagingSenderId(),
  appId: getFirebaseAppId(),
  storageBucket: getFirebaseStorageBucket(),
  measurementId: getFirebaseMeasurementId(),
})

let app: FirebaseApp | null = null

export const initializeFirebase = () => {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig())
  }
  return app
}

/**
 * Lazy, guarded messaging init. Never touch getMessaging() at module scope:
 * on iOS Safari (not installed to Home Screen) the Push API doesn't exist and
 * getMessaging() throws, taking the whole app bundle down with it.
 */
// Memoized: firebase's isSupported() probes IndexedDB on every call
let pushSupported: Promise<boolean> | null = null
export const isPushSupported = () =>
  (pushSupported ??= isSupported().catch(() => false))

export const getMessagingIfSupported = async (): Promise<Messaging | null> => {
  if (!(await isPushSupported())) return null
  const { getMessaging } = await import('firebase/messaging')
  return getMessaging(initializeFirebase() ?? undefined)
}

// Set by registerFCMToken, read and cleared by logout (see thisDeviceFCMToken)
let deviceToken: string | null = null
let pendingDrop: Promise<void> | null = null
let pendingRegister: Promise<boolean> | null = null
// Bumped by each logout, so a registration that straddles one can tell
let signOuts = 0

// The token for this browser install, or null if push can't run here (no
// support, no service worker, permission not granted).
const getCurrentToken = async (): Promise<string | null> => {
  const messaging = await getMessagingIfSupported()
  if (!messaging) return null

  // Reuse the app service worker so Firebase never registers a second one;
  // without a registration (dev, failed install) there is nothing to bind to.
  const serviceWorkerRegistration = await getSWRegistration()
  if (!serviceWorkerRegistration) return null

  const { getToken } = await import('firebase/messaging')
  return await getToken(messaging, {
    vapidKey: getFirebaseVapidKey(),
    serviceWorkerRegistration,
  })
}

// Mint an FCM token against the app service worker and store it server-side.
// Requires notification permission to already be granted.
//
// This posts on every call rather than caching "already synced" in
// localStorage. FCM returns the same token for the life of a browser install,
// so a cache keyed on it never invalidates — and the server value can change
// without the client knowing (a logout elsewhere used to clear it, and dead
// tokens get pruned server-side). A stale cache meant the device believed it
// was registered while the server had nothing, and push stayed dead until site
// data was cleared. One small POST per app load is the cheaper failure mode.
const registerFCMToken = (): Promise<boolean> => {
  const run = async (): Promise<boolean> => {
    // A logout's deleteToken() still in flight would void the token minted here
    await pendingDrop
    const startedIn = signOuts
    const token = await getCurrentToken()
    if (!token) return false

    await userService.updateFCMToken(token)
    // Signed out meanwhile: the token belongs to no one now, and the next
    // account must not name it on its own logout.
    if (startedIn === signOuts) deviceToken = token
    return true
  }
  const registering = run().finally(() => {
    if (pendingRegister === registering) pendingRegister = null
  })
  pendingRegister = registering
  return registering
}

/**
 * Ask for notification permission and register the FCM token.
 * Call from a user gesture (button tap) — on installed iOS PWAs a request
 * outside a gesture silently fails.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!('Notification' in window)) {
      console.error("Browser doesn't support notifications")
      return false
    }
    if (Notification.permission === 'denied') return false

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    return await registerFCMToken()
  } catch (err) {
    console.error('Failed to get notification permission:', err)
    return false
  }
}

/**
 * Re-mint the FCM token for users whose permission is already granted. Needed
 * after the migration off firebase-messaging-sw.js: the old worker (and the
 * push subscription the stored token was bound to) is unregistered on upgrade,
 * so without this existing users would silently stop receiving pushes. Also
 * keeps tokens fresh across normal FCM rotation.
 */
export const refreshFCMToken = async (): Promise<void> => {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    await registerFCMToken()
  } catch (err) {
    console.error('Failed to refresh FCM token:', err)
  }
}

/**
 * This browser's token as last registered, for the logout request to name.
 *
 * Logout must not mint it afresh: getToken() waits on the service worker and
 * can call out to FCM, and signing out used to sit behind that for seconds.
 * Every app load registers (refreshFCMToken), so this is already in hand. If it
 * isn't, the server row can't be named — dropFCMSubscription() still kills the
 * subscription, so the next send fails as Unregistered and prunes the row.
 */
export const thisDeviceFCMToken = (): string | null => deviceToken

/**
 * Kill this browser's subscription at FCM on logout, without holding it up.
 *
 * Needed even though the server row goes with the logout request: otherwise a
 * shared computer keeps rendering the signed-out account's notifications. It
 * needs no session, so it runs after sign-out in the background; a sign-in
 * that follows quickly waits for it (registerFCMToken) instead of racing it.
 */
export const dropFCMSubscription = (): void => {
  deviceToken = null
  signOuts++
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const registering = pendingRegister
  pendingDrop = (async () => {
    // Deleting while getToken() runs can leave the new subscription alive
    await registering?.catch(() => false)
    try {
      const messaging = await getMessagingIfSupported()
      if (!messaging) return
      const { deleteToken } = await import('firebase/messaging')
      await deleteToken(messaging)
    } catch (err) {
      console.error('Failed to delete FCM token:', err)
    }
  })().finally(() => {
    pendingDrop = null
  })
}
