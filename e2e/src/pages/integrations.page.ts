import { expect, type Locator, type Page } from '@playwright/test'
import { step } from '../support/step'

/** `text` as a literal inside a RegExp (account names carry +, parentheses). */
const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** /settings/integrations: one card per integration, with Connect or Manage/Disconnect. */
export class IntegrationsPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings/integrations')
    await expect(this.card('Jira')).toBeVisible()
  }

  card(name: string): Locator {
    return this.page.locator('.integration-card').filter({ has: this.page.getByText(name, { exact: true }) })
  }

  /**
   * Matches the card's "Access expired for …" warning when it names `account`.
   * The warning lists every account that needs reconnecting, and other tests
   * share the org, so this checks for one name within it.
   */
  expiredAccessFor(account: string): RegExp {
    const name = escapeRegExp(account)
    return new RegExp(`Access expired for [^—]*${name}[^—]*— reconnect to resume replies\\.`)
  }

  /** The card's warning for a number the platform won't let send. */
  cannotSendFor(account: string): RegExp {
    const name = escapeRegExp(account)
    return new RegExp(`${name}[^—]*can't send replies — open it to see why\\.`)
  }

  /** The Manage dialog's explanation of why WhatsApp won't send from a number, quoting Meta. */
  cannotSendPrompt(): Locator {
    return this.page.getByText(/WhatsApp can't send replies from this number\. Meta said:/)
  }

  /** Opens the card's Manage dialog. */
  async manage(name: string): Promise<void> {
    await step(`Manage ${name}`, async () => {
      await this.card(name).getByRole('button', { name: 'Manage' }).click()
    })
  }

  /** The WhatsApp card's Manage dialog: every connected number. */
  whatsAppNumbers(): Locator {
    return this.page.getByRole('dialog', { name: 'WhatsApp numbers' })
  }

  /** One number's row in the WhatsApp numbers dialog, by its display name. */
  whatsAppNumber(name: string): Locator {
    return this.whatsAppNumbers().getByRole('listitem').filter({ hasText: name })
  }

  /** "1 of 2 numbers on your plan", or "3 numbers connected" with no limit. */
  whatsAppNumbersUsage(): Locator {
    return this.whatsAppNumbers().getByTestId('whatsapp-numbers-usage')
  }

  addWhatsAppNumberButton(): Locator {
    return this.whatsAppNumbers().getByRole('button', { name: 'Add number' })
  }

  /** Opens the connect form for one number (Reconnect when its access expired). */
  async manageWhatsAppNumber(name: string, action: 'Manage' | 'Reconnect' = 'Manage'): Promise<void> {
    await step(`${action} WhatsApp number ${name}`, async () => {
      await this.whatsAppNumber(name).getByRole('button', { name: `${action} ${name}` }).click()
    })
  }

  async addWhatsAppNumber(): Promise<void> {
    await step('Add a WhatsApp number', async () => {
      await this.addWhatsAppNumberButton().click()
    })
  }

  async disconnectWhatsAppNumber(name: string): Promise<void> {
    await step(`Disconnect WhatsApp number ${name}`, async () => {
      const row = this.whatsAppNumber(name)
      await row.getByRole('button', { name: `Disconnect ${name}` }).click()
      await row.getByRole('button', { name: 'Disconnect', exact: true }).click()
      await expect(row).toHaveCount(0)
    })
  }

  /** The connect form a WhatsApp number opens: blank for a new number. */
  whatsAppConnectForm(): Locator {
    return this.page.getByRole('dialog', { name: 'Connect WhatsApp' })
  }

  async closeWhatsAppConnectForm(): Promise<void> {
    await step('Close the WhatsApp connect form', async () => {
      await this.whatsAppConnectForm().getByRole('button', { name: 'Close' }).click()
      await expect(this.whatsAppConnectForm()).toHaveCount(0)
    })
  }

  /** The Manage dialog's prompt to reconnect an account Meta stopped accepting. */
  reconnectPrompt(): Locator {
    return this.page.getByText('Meta stopped accepting this account\'s access. Reconnect to resume replies.')
  }

  /** Starts the integration's OAuth flow; the provider's consent screen sends the browser back here. */
  async connect(name: string): Promise<void> {
    await step(`Connect ${name}`, async () => {
      await this.card(name).getByRole('button', { name: 'Connect' }).click()
      await expect(this.page).toHaveURL(/\/settings\/integrations/)
    })
  }
}
