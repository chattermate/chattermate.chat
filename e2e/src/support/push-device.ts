import type { CDPSession, Page, Route } from '@playwright/test'
import { env } from '../env'

export type NotificationSetting = 'granted' | 'denied' | 'prompt'

const PROJECT_ID = 'chattermate-e2e'
// Any well-formed key: the stand-in push subscription never checks it
const VAPID_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
}

/**
 * One browser's push set-up, played by the test: the notification permission
 * (as if set in the browser's site settings), the answer to the permission
 * prompt, and Firebase Cloud Messaging.
 *
 * The e2e stack has no Firebase project and blocks every call off the machine,
 * so this hands the dashboard a made-up Firebase config, a stand-in push
 * subscription, and answers for the two Google endpoints FCM registration uses.
 * The token it mints is then stored by the real backend.
 *
 * Call `install()` before the first page load.
 */
export class PushDevice {
  private registrationsFail = false
  private minted: string[] = []
  private stored: string[] = []
  private promptAnswer: Exclude<NotificationSetting, 'prompt'> = 'denied'
  // Kept open: Chromium drops a session's permission overrides when it detaches
  private cdp: Promise<{ session: CDPSession; browserContextId?: string }> | null = null
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async install(): Promise<void> {
    const page = this.page
    await page.exposeFunction('__e2eNotificationPrompt', async () => {
      await this.setPermission(this.promptAnswer)
      return this.promptAnswer
    })
    await page.addInitScript(() => {
      // The browser's permission prompt: the test decides the answer
      // A browser only asks while undecided; otherwise it answers with the setting
      const ask = Notification.requestPermission.bind(Notification)
      Notification.requestPermission = () =>
        Notification.permission === 'default'
          ? (window as unknown as { __e2eNotificationPrompt: () => Promise<NotificationPermission> }).__e2eNotificationPrompt()
          : ask()

      // Headless Chromium has no push service to subscribe with; stand one in
      let subscription: PushSubscription | null = null
      const key = (length: number) => new Uint8Array(length).fill(7).buffer
      PushManager.prototype.getSubscription = async () => subscription
      PushManager.prototype.subscribe = async () => {
        subscription = {
          endpoint: `https://push.e2e.invalid/${crypto.randomUUID()}`,
          expirationTime: null,
          options: { applicationServerKey: null, userVisibleOnly: true },
          getKey: (name: string) => key(name === 'auth' ? 16 : 65),
          toJSON: () => ({}),
          unsubscribe: async () => { subscription = null; return true },
        } as unknown as PushSubscription
        return subscription
      }
    })

    // The stack's runtime config, plus a Firebase project for push
    await page.route('**/config.js', async (route) => {
      const response = await route.fetch()
      const firebase = {
        FIREBASE_API_KEY: 'e2e-api-key',
        FIREBASE_PROJECT_ID: PROJECT_ID,
        FIREBASE_MESSAGING_SENDER_ID: '1234567890',
        FIREBASE_APP_ID: '1:1234567890:web:e2e',
        FIREBASE_VAPID_KEY: VAPID_KEY,
      }
      await route.fulfill({
        response,
        body: `${await response.text()}\nObject.assign(self.APP_CONFIG, ${JSON.stringify(firebase)});\n`,
      })
    })

    await page.route('https://firebaseinstallations.googleapis.com/**', (route) =>
      answer(route, 200, route.request().url().includes('authTokens:generate')
        ? { token: 'e2e-auth-token', expiresIn: '604800s' }
        : {
            name: `projects/${PROJECT_ID}/installations/e2e-fid`,
            fid: 'e2e-fid',
            refreshToken: 'e2e-refresh-token',
            authToken: { token: 'e2e-auth-token', expiresIn: '604800s' },
          }))

    await page.route('https://fcmregistrations.googleapis.com/**', (route) => {
      if (this.registrationsFail) return answer(route, 503, { error: { code: 503, message: 'Unavailable', status: 'UNAVAILABLE' } })
      if (route.request().method() !== 'POST') return answer(route, 200, {})
      const token = `e2e-fcm-${crypto.randomUUID()}`
      this.minted.push(token)
      return answer(route, 200, { token })
    })

    // What the real backend accepted as this device's token
    page.on('response', (response) => {
      const request = response.request()
      if (request.method() === 'POST' && response.url().endsWith('/users/token/fcm-token') && response.ok()) {
        this.stored.push((request.postDataJSON() as { token: string }).token)
      }
    })
  }

  /** Tokens FCM minted for this browser that the backend then stored for the signed-in user. */
  storedTokens(): string[] {
    return this.stored.filter((token) => this.minted.includes(token))
  }

  /** The notification permission, as if changed in the browser's site settings. */
  async setPermission(setting: NotificationSetting): Promise<void> {
    const { session, browserContextId } = await (this.cdp ??= this.openCdp())
    await session.send('Browser.setPermission', {
      permission: { name: 'notifications' },
      setting,
      origin: new URL(env.frontendUrl).origin,
      browserContextId,
    })
  }

  private async openCdp() {
    const session = await this.page.context().newCDPSession(this.page)
    // Playwright contexts aren't the browser's default one: name it
    const { targetInfo } = await session.send('Target.getTargetInfo')
    return { session, browserContextId: targetInfo.browserContextId }
  }

  /** What the user picks when the browser asks to show notifications. */
  answerPromptWith(setting: Exclude<NotificationSetting, 'prompt'>): void {
    this.promptAnswer = setting
  }

  /** FCM refuses (or accepts again) to register this browser. */
  failRegistrations(fail = true): void {
    this.registrationsFail = fail
  }
}

function answer(route: Route, status: number, body: unknown): Promise<void> {
  if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
  return route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) })
}
