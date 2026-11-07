import { expect, type Locator, type Page } from '@playwright/test'
import { step } from '../support/step'

/** /people — visitors, leads and customers. */
export class PeoplePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(): Promise<void> {
    await this.page.goto('/people')
    await expect(this.page.getByRole('main').getByRole('heading', { name: 'People', exact: true })).toBeVisible()
  }

  async findLead(email: string): Promise<void> {
    await step(`Look up lead ${email}`, async () => {
      await this.page.getByRole('button', { name: 'Leads', exact: true }).click()
      await this.page.getByPlaceholder('Search name, email or company…').fill(email)
    })
  }

  /** The users the business's app signed in, apart from the lead directory. */
  async showSignedIn(): Promise<void> {
    await step('Open the Signed in tab', async () => {
      await this.page.getByRole('button', { name: /^Signed in/ }).click()
    })
  }

  async search(term: string): Promise<void> {
    await this.page.getByPlaceholder('Search name, email or company…').fill(term)
  }

  /** In the open person's drawer: one journey and how far they got. */
  journey(name: string): Locator {
    return this.page.getByRole('region', { name: 'Journeys' }).getByRole('group', { name })
  }

  /** Each person is a row button whose text includes their email and stage badge. */
  person(email: string): Locator {
    return this.page.getByRole('button').filter({ hasText: email })
  }
}
