import type { Locator, Page } from '@playwright/test'
import { step } from '../support/step'

/**
 * "Notifications are off on this device": the line in the notification
 * drawer, the landing banner (header pages) or inbox strip, the bell, and the
 * first-time card that asks.
 */
export class PushNotices {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /** The header bell; its name ends ", off on this device" while push is off. */
  get bell(): Locator {
    return this.page.getByRole('banner').getByRole('button', { name: /^Notifications/ })
  }

  /** The notification drawer. */
  get drawer(): Locator {
    return this.page.getByRole('region', { name: 'Notifications' })
  }

  /** The line under the drawer header. Named by its heading. */
  get drawerLine(): Locator {
    return this.drawer.getByRole('status')
  }

  /** The banner on header pages, or the slim strip above the inbox list. */
  get landing(): Locator {
    return this.page.getByRole('main').getByRole('status').filter({ has: this.page.getByRole('button', { name: 'Not now' }) })
  }

  /** The first-time floating card. */
  get firstAsk(): Locator {
    return this.page.getByRole('dialog', { name: 'Enable notifications' })
  }

  /** The More sheet's Notifications row (phones). */
  get moreSheetNotifications(): Locator {
    return this.page.getByRole('dialog', { name: 'More' }).getByRole('button', { name: /^Notifications/ })
  }

  async openDrawer(): Promise<void> {
    await step('Open the notifications', () => this.bell.click())
  }

  async openMoreSheet(): Promise<void> {
    await step('Open More', () => this.page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'More' }).click())
  }

  /** Turn on / Try again on a notice. */
  async act(notice: Locator, label: 'Turn on' | 'Try again'): Promise<void> {
    await step(label, () => notice.getByRole('button', { name: label }).click())
  }

  async notNow(notice: Locator): Promise<void> {
    await step('Not now', () => notice.getByRole('button', { name: 'Not now' }).click())
  }

  /**
   * A returning user who put off the first-time card some days ago (it stays
   * away for 14). The card's own snooze, as the app stores it.
   */
  async firstAskPutOff(daysAgo: number): Promise<void> {
    const at = Date.now() - daysAgo * 24 * 60 * 60 * 1000
    await this.page.addInitScript((value) => {
      localStorage.setItem('cm-push-prompt-snoozed-at', String(value))
    }, at)
  }
}
