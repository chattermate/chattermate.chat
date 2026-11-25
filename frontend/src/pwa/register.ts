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
 * How long to wait for the new worker to take control before forcing a reload.
 * Activation is normally well under a second; this only covers a worker that
 * fails to activate or a browser that withholds controllerchange, so the user
 * is never stranded on the old build.
 */
const UPDATE_TAKEOVER_TIMEOUT_MS = 4000

/**
 * Offer the new build rather than forcing it: an agent mid-reply should not
 * have the page reloaded under them. vue-sonner is imported lazily so the
 * registration path stays off the startup critical path.
 */
async function promptForUpdate(reload: (reloadPage?: boolean) => Promise<void>) {
  try {
    const { toast } = await import('vue-sonner')
    const id = toast('A new version of ChatterMate is available', {
      description: 'Reload to pick up the latest changes.',
      duration: Number.POSITIVE_INFINITY,
      action: {
        label: 'Reload',
        onClick: () => {
          // Do NOT reload here. registerSW's updateSW ignores its reloadPage
          // argument and only posts SKIP_WAITING, without awaiting activation
          // — it resolves within a tick. The page refresh is done by the
          // `controlling` listener registerSW arms just before it calls us.
          //
          // Reloading here raced that handshake and always won: the document
          // came back under the OLD worker with the new one still in `waiting`,
          // so the next load re-dispatched `waiting` and the prompt returned.
          // That is why the toast reappeared on every release and no amount of
          // clicking Reload cleared it.
          toast.dismiss(id)
          void reload()
          window.setTimeout(() => window.location.reload(), UPDATE_TAKEOVER_TIMEOUT_MS)
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
// Generous enough for a cold first install on most devices; past it, a worker
// still installing is waited for (see below).
const SW_READY_TIMEOUT_MS = 8000

export async function getSWRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator) || isShopifyEmbedded()) return undefined
  const ready = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), SW_READY_TIMEOUT_MS)),
  ])
  if (ready) return ready

  // A slow first install is still a worker on its way: wait it out, so push
  // registers this visit instead of reading as failed. No worker at all (vite
  // dev, a failed registration) is still undefined.
  const pending = await navigator.serviceWorker.getRegistration().catch(() => undefined)
  const worker = pending?.installing ?? pending?.waiting
  if (!pending || !worker) return undefined
  return (await activates(worker)) ? pending : undefined
}

// Resolves true once the worker activates, false if it is thrown away
const activates = (worker: ServiceWorker): Promise<boolean> =>
  new Promise((resolve) => {
    const check = () => {
      if (worker.state === 'activated') resolve(true)
      else if (worker.state === 'redundant') resolve(false)
    }
    worker.addEventListener('statechange', check)
    check()
  })
