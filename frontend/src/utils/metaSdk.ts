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
 * Static page Meta redirects the Login-for-Business popup to (see
 * public/meta-oauth-callback.html). Its full URL — origin + this path — is the
 * redirect_uri, so it must be registered as a Valid OAuth Redirect URI and is
 * sent to the server to exchange the code against.
 */
export const META_OAUTH_CALLBACK_PATH = '/meta-oauth-callback.html'

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

export interface BusinessLoginConfig {
  appId: string
  configId: string
  graphVersion: string
  /** window.location.origin + META_OAUTH_CALLBACK_PATH */
  redirectUri: string
}

export interface InstagramLoginConfig {
  /** The Instagram app id — not the Meta one; Instagram Login is its own app. */
  appId: string
  /** window.location.origin + META_OAUTH_CALLBACK_PATH */
  redirectUri: string
}

/** What Instagram Login must grant us: read the account, and handle its DMs. */
const INSTAGRAM_SCOPES = 'instagram_business_basic,instagram_business_manage_messages'

/**
 * Run an OAuth authorization in a popup and resolve the code it returns.
 *
 * Why we drive the dialog ourselves rather than use FB.login: the JS SDK binds
 * the code to an internal xd_arbiter redirect that regenerates every login, so
 * it can never be a registered Valid OAuth Redirect URI — fatal once the app
 * enforces Strict Mode (which it does, non-negotiably). Owning the callback URL
 * means the code is bound to a value the server can reproduce at exchange time.
 *
 * `buildUrl` receives the CSRF state to embed; the provider echoes it back on
 * the redirect and we accept only a match. Resolves with the code, rejects on
 * error, popup-block, or the user closing the window ('cancelled').
 */
const runOAuthPopup = (buildUrl: (state: string) => string): Promise<string> =>
  new Promise((resolve, reject) => {
    const state = crypto.randomUUID()
    const popup = window.open(buildUrl(state), 'meta-login', 'width=600,height=720')
    if (!popup) {
      reject(new Error('Popup blocked — allow pop-ups for this site and try again'))
      return
    }

    const cleanup = () => {
      window.removeEventListener('message', onMessage)
      window.clearInterval(closedTimer)
    }
    const onMessage = (event: MessageEvent) => {
      // The callback page is same-origin, so anything else is not our reply.
      if (event.origin !== window.location.origin) return
      const data = event.data
      if (!data || data.source !== 'meta-oauth') return
      cleanup()
      try { popup.close() } catch { /* already closed */ }
      if (data.state !== state) reject(new Error('Login could not be verified'))
      else if (data.error) reject(new Error(data.error))
      else if (!data.code) reject(new Error('Login did not return a code'))
      else resolve(data.code)
    }
    const closedTimer = window.setInterval(() => {
      if (popup.closed) { cleanup(); reject(new Error('cancelled')) }
    }, 500)
    window.addEventListener('message', onMessage)
  })

/**
 * Facebook Login for Business — used by Messenger, which connects a Page.
 *
 * The same redirectUri must go to the token exchange, so the caller passes it
 * on to the server.
 */
export const runBusinessLogin = (config: BusinessLoginConfig): Promise<string> =>
  runOAuthPopup((state) =>
    `https://www.facebook.com/${config.graphVersion}/dialog/oauth?` +
    new URLSearchParams({
      client_id: config.appId,
      config_id: config.configId,
      response_type: 'code',
      override_default_response_type: 'true',
      redirect_uri: config.redirectUri,
      state,
      display: 'popup',
    }).toString())

/**
 * Instagram Business Login — a different provider entirely, not a Facebook
 * dialog: the business signs in with Instagram, so no Facebook Page is involved
 * and the resulting token is an Instagram user token.
 */
export const runInstagramLogin = (config: InstagramLoginConfig): Promise<string> =>
  runOAuthPopup((state) =>
    'https://www.instagram.com/oauth/authorize?' +
    new URLSearchParams({
      client_id: config.appId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: INSTAGRAM_SCOPES,
      state,
      // Keep it an Instagram sign-in rather than falling through to Facebook.
      enable_fb_login: '0',
      force_authentication: '1',
    }).toString())
