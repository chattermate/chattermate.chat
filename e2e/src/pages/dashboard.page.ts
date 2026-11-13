import { expect, type Locator, type Page } from '@playwright/test'
import { step } from '../support/step'

/** The signed-in shell around every dashboard screen. */
export class Dashboard {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async logout(): Promise<void> {
    await step('Log out', async () => {
      // The account menu sits at the foot of the sidebar (expanded or rail)
      await this.page.getByRole('button', { name: /^Account menu/ }).click()
      await this.page.getByRole('menuitem', { name: 'Log out' }).click()
      await expect(this.page).toHaveURL(/\/login/)
    })
  }

  /** The header pill that shows and flips the agent's online status. */
  get statusToggle(): Locator {
    return this.page.getByRole('button', { name: /^Status:/ })
  }

  /** The header's theme switch (dark → light → system). */
  get themeToggle(): Locator {
    return this.page.getByRole('button', { name: /^Theme:/ })
  }

  /** The current page's name in the header breadcrumb. CSS: a plain span marked aria-current. */
  get currentPageCrumb(): Locator {
    return this.page.getByRole('navigation', { name: 'Breadcrumb' }).locator('[aria-current="page"]')
  }

  /** The root element, which carries data-theme. CSS: <html> has no role. */
  get documentRoot(): Locator {
    return this.page.locator('html')
  }

  /** The favicon and app icon links. CSS: <link> elements in <head> have no role. */
  get iconLinks(): Locator {
    return this.page.locator('link[rel="icon"], link[rel="apple-touch-icon"]')
  }

  async goto(path: string): Promise<void> {
    await step(`Open ${path}`, async () => {
      await this.page.goto(path)
      await expect(this.page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
    })
  }

  get accessDenied(): Locator {
    return this.page.getByRole('heading', { name: 'Access Denied' })
  }
}
