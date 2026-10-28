import { expect, type Locator, type Page } from '@playwright/test'
import { SingleSignOn } from '../components/single-sign-on'
import { step } from '../support/step'

export class LoginPage {
  readonly page: Page
  readonly sso: SingleSignOn

  constructor(page: Page) {
    this.page = page
    this.sso = new SingleSignOn(page)
  }

  async goto(): Promise<void> {
    await this.page.goto('/login')
    await expect(this.page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  }

  async signIn(email: string, password: string): Promise<void> {
    await step(`Sign in as ${email}`, async () => {
      await this.page.getByLabel('Email', { exact: true }).fill(email)
      await this.page.getByLabel('Password', { exact: true }).fill(password)
      await this.page.getByRole('button', { name: 'Sign In' }).click()
    })
  }

  get error(): Locator {
    return this.page.getByRole('alert')
  }
}
