import { expect, type Page } from '@playwright/test'
import { step } from '../support/step'

export type SsoProvider = 'Google' | 'Microsoft'

/** The directory personal Microsoft accounts (outlook.com, hotmail.com, …) sign in from. */
export const MICROSOFT_PERSONAL_DIRECTORY = '9188040d-6c67-4c5b-b112-36a304b66dad'

/** Who someone is at the provider: what its ID token will say. */
export interface ProviderAccount {
  email: string
  name?: string
  /** The provider's id for the account. Defaults to one derived from `email`, so the same address is the same account. */
  accountId?: string
  /** Google: whether it verified the address (default true). */
  emailVerified?: boolean
  /** Google: the Workspace domain the account belongs to (`hd`); none for a consumer account. */
  workspaceDomain?: string
  /** Microsoft: 'personal' for a personal account, otherwise a work directory id (default: one fixed work directory). */
  directory?: 'personal' | string
  /** Microsoft: the address's domain is one Microsoft has verified for that directory (`xms_edov`). */
  domainVerified?: boolean
}

/** The provider's own sign-in page (services/fake-sso), where the browser lands after "Continue with …". */
export class ProviderSignIn {
  readonly page: Page
  readonly provider: SsoProvider

  constructor(page: Page, provider: SsoProvider) {
    this.page = page
    this.provider = provider
  }

  async waitUntilShown(): Promise<void> {
    const title = this.provider === 'Google' ? 'Sign in with Google' : 'Sign in to Microsoft'
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible()
  }

  async signInAs(account: ProviderAccount): Promise<void> {
    await step(`Sign in to ${this.provider} as ${account.email || 'an account without an email'}`, async () => {
      const field = (label: string) => this.page.getByLabel(label, { exact: true })
      await field('Email').fill(account.email)
      await field('Name').fill(account.name ?? '')
      await field('Account ID').fill(account.accountId ?? '')
      if (this.provider === 'Google') {
        await field('Email verified').setChecked(account.emailVerified ?? true)
        await field('Workspace domain').fill(account.workspaceDomain ?? '')
      } else {
        const directory = account.directory === 'personal' ? MICROSOFT_PERSONAL_DIRECTORY : account.directory
        await field('Directory').fill(directory ?? '')
        await field('Domain verified by Microsoft').setChecked(account.domainVerified ?? false)
      }
      await this.page.getByRole('button', { name: 'Continue', exact: true }).click()
    })
  }

  /**
   * Signs in and returns the link the provider sent the browser back on (the
   * backend's callback, with the one-time code), as someone could copy it.
   */
  async signInKeepingReturnLink(account: ProviderAccount): Promise<string> {
    const callback = this.page.waitForRequest((request) => /\/sso\/[a-z]+\/callback\?/.test(request.url()))
    await this.signInAs(account)
    return (await callback).url()
  }

  /** Backs out at the provider, which sends the browser back with an error. */
  async cancel(): Promise<void> {
    await step(`Cancel at ${this.provider}`, async () => {
      await this.page.getByRole('button', { name: 'Cancel', exact: true }).click()
    })
  }
}
