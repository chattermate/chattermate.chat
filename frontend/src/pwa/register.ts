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

import { registerSW } from 'virtual:pwa-register'

// Never register inside the Shopify admin iframe or on /shopify/* routes —
// the embedded app has its own lifecycle and must not install an app shell.
export const isShopifyEmbedded = (): boolean => {
  try {
    return window.top !== window.self || window.location.pathname.startsWith('/shopify')
  } catch {
    return true
  }
}

/**
 * Offer the new build rather than forcing it: an agent mid-reply should not
 * have the page reloaded under them. vue-sonner is imported lazily so the
 * registration path stays off the startup critical path.
 */
async function promptForUpdate(reload: (reloadPage?: boolean) => Promise<void>) {
  try {
    const { toast } = await import('vue-sonner')
    toast('A new version of ChatterMate is available', {
      description: 'Reload to pick up the latest changes.',
      duration: Number.POSITIVE_INFINITY,
      action: {
        label: 'Reload',
        onClick: async () => {
          // reload() hands SKIP_WAITING to the waiting worker, but its own
          // page-refresh depends on a controllerchange that doesn't fire
          // reliably when the SW already claimed this client — verified: the
          // new worker activated and precached the new build while the open
          // document kept running the old CSS. Reload explicitly so the
          // document actually picks the new assets up.
          try {
            await reload(true)
          } finally {
            window.location.reload()
          }
        },
      },
    })
  } catch (err) {
    console.error('Failed to show update prompt:', err)
  }
}

export function setupPWA() {
  if (!('serviceWorker' in navigator) || isShopifyEmbedded()) return

  // Clients from pre-PWA deployments still hold the Firebase-only worker that
  // Firebase's getToken() self-registered; drop it so only one SW owns scope /.
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      registrations.forEach((registration) => {
        const scriptUrl =
          registration.active?.scriptURL ||
          registration.waiting?.scriptURL ||
          registration.installing?.scriptURL ||
          ''
        if (scriptUrl.endsWith('firebase-messaging-sw.js')) {
          registration.unregister()
        }
      })
    })
    .catch(() => {})

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      promptForUpdate(updateSW)
    },
  })
}

/**
 * The single app SW registration — passed to Firebase's getToken() so it never
 * self-registers a second worker. navigator.serviceWorker.ready never settles
 * when no SW gets registered (vite dev, or a failed registration), so race it
 * against a timeout instead of hanging callers forever.
 */
// Generous enough for a cold first install on low-end devices; a miss only
// delays token registration to the next visit.
const SW_READY_TIMEOUT_MS = 8000

export async function getSWRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator) || isShopifyEmbedded()) return undefined
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), SW_READY_TIMEOUT_MS)),
  ])
}
