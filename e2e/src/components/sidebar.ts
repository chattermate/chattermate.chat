import type { Locator, Page } from '@playwright/test'

/** The dashboard's left navigation. */
export class Sidebar {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /** Every nav link the signed-in user can see, in order. */
  get links(): Locator {
    // Scoped to the desktop sidebar; the mobile bottom bar repeats some links.
    return this.page.locator('nav.sidebar-nav').getByRole('link')
  }

  /** A link by its page name. Its count badge is not part of the name. */
  link(name: string): Locator {
    return this.page.locator('nav.sidebar-nav').getByRole('link', { name, exact: true })
  }

  /** The collapsible Settings group's toggle. */
  get settingsToggle(): Locator {
    return this.page.locator('nav.sidebar-nav').getByRole('button', { name: 'Settings', exact: true })
  }

  /** A link's count badge. CSS: the count is aria-hidden, so the link's name stays the page name. */
  badge(name: string): Locator {
    return this.link(name).locator('.nav-badge')
  }

  /** A section heading (Workspace) — the rail drops them. */
  sectionHeading(name: string): Locator {
    return this.page.locator('nav.sidebar-nav').getByRole('heading', { name, exact: true })
  }

  /** The rail's toggle that brings the labels back. */
  get expandButton(): Locator {
    return this.page.getByRole('button', { name: 'Expand sidebar', exact: true })
  }

  /** The account button at the foot of the sidebar. */
  get accountMenuButton(): Locator {
    return this.page.getByRole('button', { name: /^Account menu/ })
  }

  /** The online/offline switch inside the open account menu. */
  get accountStatusSwitch(): Locator {
    return this.page.getByRole('menuitemcheckbox')
  }

  /** Open the Settings group so its links can be found (no-op when already open). */
  async openSettings(): Promise<void> {
    if ((await this.settingsToggle.getAttribute('aria-expanded')) !== 'true') {
      await this.settingsToggle.click()
    }
  }
}
