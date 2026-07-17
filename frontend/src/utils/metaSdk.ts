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

const SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js'
const SDK_SCRIPT_ID = 'facebook-jssdk'

/**
 * Origins Embedded Signup posts its result from.
 *
 * Meta's own sample checks `origin.endsWith('facebook.com')`, which any
 * attacker can satisfy by registering evil-facebook.com. The signup result
 * names the WhatsApp number we then connect, so this is an exact allowlist.
 */
const TRUSTED_ORIGINS = [
  'https://www.facebook.com',
  'https://web.facebook.com',
  'https://business.facebook.com',
]

/** Channels connectable through a Meta login popup. */
export type SignupChannel = 'whatsapp' | 'messenger' | 'instagram'

export interface SignupSession {
  waba_id: string
  phone_number_id: string
}

interface FacebookSdk {
  init(options: Record<string, unknown>): void
  login(
    callback: (response: { authResponse?: { code?: string } }) => void,
    options: Record<string, unknown>,
  ): void
}

declare global {
  interface Window {
    FB?: FacebookSdk
    fbAsyncInit?: () => void
  }
}

let sdkPromise: Promise<FacebookSdk> | null = null

/** Load and initialise Meta's JS SDK once per page, for a given app. */
export const loadMetaSdk = (appId: string, graphVersion: string): Promise<FacebookSdk> => {
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise<FacebookSdk>((resolve, reject) => {
    if (window.FB) {
      resolve(window.FB)
      return
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        autoLogAppEvents: true,
        xfbml: false,
        version: graphVersion,
      })
      if (window.FB) resolve(window.FB)
      else reject(new Error('Meta SDK loaded without initialising'))
    }

    if (document.getElementById(SDK_SCRIPT_ID)) return

    const script = document.createElement('script')
    script.id = SDK_SCRIPT_ID
    script.src = SDK_SRC
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => {
      // Let a later attempt retry rather than caching the failure forever —
      // and take the dead tag with it. Left in place, the retry's `already
      // present?` check above would find it and return from inside the promise
      // executor without resolving or rejecting, so `await loadMetaSdk()` would
      // hang forever: the Embedded Signup button simply never appears, and no
      // catch ever runs to say why.
      script.remove()
      sdkPromise = null
      reject(new Error('Could not load the Meta SDK'))
    }
    document.body.appendChild(script)
  })

  return sdkPromise
}

/**
 * Read a signup result out of a postMessage, or null if it isn't one.
 *
 * WhatsApp Embedded Signup only: it reports the created WABA and phone number
 * through postMessage while the authorization code comes back via the FB.login
 * callback, so the two halves must be correlated by the caller. Facebook Login
 * for Business (Messenger/Instagram) has no postMessage — its code alone is
 * enough — so this is not part of that flow.
 */
export const parseSignupMessage = (event: MessageEvent): SignupSession | null => {
  if (!TRUSTED_ORIGINS.includes(event.origin)) return null
  if (typeof event.data !== 'string') return null
  try {
    const payload = JSON.parse(event.data)
    if (payload?.type !== 'WA_EMBEDDED_SIGNUP' || payload.event !== 'FINISH') return null
    const { waba_id: wabaId, phone_number_id: phoneNumberId } = payload.data ?? {}
    if (!wabaId || !phoneNumberId) return null
    return { waba_id: String(wabaId), phone_number_id: String(phoneNumberId) }
  } catch {
    // Facebook posts unrelated non-JSON messages on these origins too.
    return null
  }
}

/**
 * Options for the Meta login popup that onboards a channel.
 *
 * `extras.setup` is WhatsApp Embedded Signup's own parameter — Facebook Login
 * for Business is a plain permissions grant and takes none, so passing it would
 * open the wrong flow.
 */
export const signupLoginOptions = (configId: string, channel: SignupChannel = 'whatsapp') => ({
  config_id: configId,
  response_type: 'code',
  override_default_response_type: true,
  ...(channel === 'whatsapp' ? { extras: { setup: {} } } : {}),
})
