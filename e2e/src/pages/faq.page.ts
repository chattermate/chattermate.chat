import { type Locator, type Page } from '@playwright/test'

/** /faq — the help center's questions and answers, and the editor for one. */
export class FaqPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /** The question field of the FAQ being written */
  get question(): Locator {
    return this.page.getByPlaceholder('Question', { exact: true })
  }

  /** The answer being written. The Markdown editor's box has no accessible name. */
  get answer(): Locator {
    return this.page.locator('.edit-answer textarea')
  }
}
