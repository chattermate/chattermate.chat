import type { Locator, Page } from '@playwright/test'
import { ProviderSignIn, type SsoProvider } from '../pages/provider-sign-in.page'
import { step } from '../support/step'

/** The "Continue with Google / Microsoft" buttons on the login and signup pages. */
export class SingleSignOn {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  button(provider: SsoProvider): Locator {
    return this.page.getByRole('group', { name: 'Single sign-on' }).getByRole('button', { name: `Continue with ${provider}` })
  }

  /** Sends the browser to the provider's sign-in page. */
  async continueWith(provider: SsoProvider): Promise<ProviderSignIn> {
    return step(`Continue with ${provider}`, async () => {
      await this.button(provider).click()
      const signIn = new ProviderSignIn(this.page, provider)
      await signIn.waitUntilShown()
      return signIn
    })
  }
}
