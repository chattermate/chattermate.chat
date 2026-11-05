import { expect, type Locator, type Page } from '@playwright/test'
import { step } from '../support/step'

/**
 * The first-agent setup wizard on /ai-agents: Create -> Teach -> Test -> Launch.
 * Shows by itself while the org has no agents; /ai-agents?setup=1 reopens it at
 * the step the server says the org has reached.
 */
export class SetupWizard {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async resume(): Promise<void> {
    await this.page.goto('/ai-agents?setup=1')
  }

  async createAgent(name: string): Promise<void> {
    await step(`Create the first agent "${name}"`, async () => {
      await expect(this.createHeading).toBeVisible()
      await this.page.getByLabel('Agent name').fill(name)
      await this.page.getByRole('button', { name: 'Continue' }).click()
      await expect(this.teachHeading).toBeVisible()
    })
  }

  /** Continue on the Teach step, sending whatever sources are staged. */
  async continueFromTeach(): Promise<void> {
    await step('Continue from the Teach step', async () => {
      await this.page.getByRole('button', { name: /^Continue/ }).click()
    })
  }

  async pasteTextInstead(text: string): Promise<void> {
    await step('Paste some text instead of the website', async () => {
      await this.openPasteText()
      await this.pasteTextBox.fill(text)
      await this.page.getByRole('button', { name: 'Add this text' }).click()
    })
  }

  async openPasteText(): Promise<void> {
    await step('Open "Paste some text instead"', async () => {
      await this.pasteTextChoice.click()
    })
  }

  async cancelPasteText(): Promise<void> {
    await step('Cancel pasting text', async () => {
      await this.page.getByRole('button', { name: 'Cancel' }).click()
    })
  }

  /** Picks a PDF in the Teach step's file picker. */
  async uploadPdf(name: string, pdf: Buffer): Promise<void> {
    await step(`Pick the PDF "${name}"`, async () => {
      // The picker is a hidden <input type=file> behind the "Upload PDF" button
      await this.page.locator('input[type="file"]').setInputFiles({ name, mimeType: 'application/pdf', buffer: pdf })
    })
  }

  /** "Looks good" on the Test step, on to Launch. */
  async continueFromTest(): Promise<void> {
    await step('Continue from the Test step', async () => {
      await this.page.getByRole('button', { name: /^Looks good/ }).click()
      await expect(this.launchHeading).toBeVisible()
    })
  }

  async back(): Promise<void> {
    await step('Go back a step', async () => {
      await this.page.getByRole('button', { name: 'Back' }).click()
    })
  }

  /** The step's main button: "Continue", "Continue without it", "Looks good"… */
  get continueButton(): Locator {
    return this.page.getByRole('button', { name: /^Continue/ })
  }

  /** The Test step's note when the agent has learned nothing yet (and why). */
  get knowledgeNotice(): Locator {
    return this.page.getByRole('status').filter({ hasText: "hasn't learned anything" })
  }

  get pasteTextChoice(): Locator {
    return this.page.getByRole('button', { name: 'Paste some text instead' })
  }

  get pasteTextBox(): Locator {
    return this.page.getByLabel('Text about your business')
  }

  /** A sent source on the Teach step, while it is being read. */
  learningSource(name: string): Locator {
    return this.page.getByRole('list', { name: 'Learning' }).getByText(name)
  }

  /** A source on the Teach step that has been read. */
  indexedSource(name: string): Locator {
    return this.page.getByRole('list', { name: 'Already added' }).getByText(name)
  }

  /** The Teach step saying a source could not be read. */
  readFailure(name: string): Locator {
    return this.page.getByRole('alert').filter({ hasText: `We couldn't read ${name}` })
  }

  /** A staged source on the Teach step, e.g. the signup domain. */
  stagedSource(url: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: url })
  }

  /** The explanation shown when a website couldn't be read. */
  get crawlFailure(): Locator {
    return this.page.getByRole('alert').filter({ hasText: "We couldn't read" })
  }

  get createHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Create your agent' })
  }

  get teachHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Teach it your business' })
  }

  get testHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Try it out' })
  }

  get launchHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Go live' })
  }
}
