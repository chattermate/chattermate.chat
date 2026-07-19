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

/// <reference lib="webworker" />

/**
 * Single app service worker: precaching/app-shell (installable PWA) plus
 * Firebase Cloud Messaging background push. Replaces the old standalone
 * public/firebase-messaging-sw.js — Firebase is bundled (the nginx CSP blocks
 * importScripts from the gstatic CDN) and its config is inlined at build time
 * (exactly what the generated swenv.js used to provide).
 */

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst } from 'workbox-strategies'
import { clientsClaim } from 'workbox-core'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { SW_MESSAGE, conversationSessionUrl } from './pwa/pushContract'
import { NAVIGATION_DENYLIST } from './pwa/navigationDenylist'

declare let self: ServiceWorkerGlobalScope

// A new worker waits until the page asks it to take over, so an agent is
// never reloaded mid-reply. The page prompts and then posts SKIP_WAITING.
// Calling skipWaiting() unconditionally here activated the new worker while
// the open tab kept running the previous bundle's CSS and JS — the app looked
// stale until someone happened to reload.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// SPA navigation fallback. What it must not swallow lives in
// ./pwa/navigationDenylist, which is testable without ServiceWorker globals.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    denylist: NAVIGATION_DENYLIST,
  }),
)

// Runtime config is substituted per-environment at container start, so it must
// never be precached. NetworkFirst (not StaleWhileRevalidate): online clients
// must always boot on the CURRENT environment's config — a stale cached copy
// could keep credentialed traffic pointed at a rotated-away endpoint. The
// cache only serves offline boots.
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname === '/config.js',
  new NetworkFirst({ cacheName: 'runtime-config', networkTimeoutSeconds: 3 }),
)

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({ cacheName: 'google-fonts' }),
)

// ---- Firebase Cloud Messaging (background push) ----

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

if (firebaseConfig.apiKey) {
  const messaging = getMessaging(initializeApp(firebaseConfig))

  onBackgroundMessage(messaging, (payload) => {
    // Messages are data-only (title/body in data): a notification payload
    // would make the Firebase SDK auto-display a duplicate copy that also
    // swallows clicks. The notification?. fallbacks keep older senders working.
    const title = payload.data?.title || payload.notification?.title || 'ChatterMate'
    const body = payload.data?.body || payload.notification?.body
    const sessionId = payload.data?.session_id

    self.registration.showNotification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      // One stacked notification per conversation (or per notification otherwise)
      tag: sessionId || payload.data?.notification_id || undefined,
      data: payload.data,
    })

    // Let any open windows refresh their in-app notification state
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) =>
        client.postMessage({ eventType: SW_MESSAGE.BACKGROUND_NOTIFICATION, data: payload.data }),
      )
    })
  })
}

// Deep-link straight into the conversation on tap (default action)
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = conversationSessionUrl(event.notification.data?.session_id)

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
      // Prefer the focused window so a background tab isn't yanked to the session
      const client = clients.find((c) => c.focused) ?? clients[0]
      if (client) {
        await client.focus()
        try {
          // navigate() rejects for windows this SW doesn't control
          // (hard-reloaded or first-visit tabs) — fall back to messaging the
          // page so the in-app router performs the navigation.
          await client.navigate(url)
        } catch {
          client.postMessage({ eventType: SW_MESSAGE.OPEN_CONVERSATION, url })
        }
        return
      }
      return self.clients.openWindow(url)
    }),
  )
})
