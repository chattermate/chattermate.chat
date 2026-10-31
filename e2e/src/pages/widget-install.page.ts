import { expect, type Locator, type Page } from '@playwright/test'
import { allowClipboard, clipboardText } from '../support/clipboard'
import { step } from '../support/step'

/**
 * The agent editor's Widget tab: the embed code and the prompt that has an AI
 * website builder (Lovable, Bolt, v0…) install it.
 */
export class WidgetInstallPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(agentId: string): Promise<void> {
    await this.page.goto(`/ai-agents?agent=${agentId}&tab=widget`)
    // The editor applies ?tab= only after its integration checks answer; a person
    // would just click the tab
    await this.page.getByRole('button', { name: 'Widget', exact: true }).click()
    await expect(this.page.getByRole('heading', { name: 'Embed Code' })).toBeVisible()
  }

  get aiPromptButton(): Locator {
    return this.page.getByRole('button', { name: /^(Copy prompt for my AI builder|Prompt copied)$/ })
  }

  /** The prompt itself, inside the "What gets copied" disclosure. */
  get aiPrompt(): Locator {
    return this.page.getByText(/^Add the ChatterMate chat widget to every page/)
  }

  async showWhatGetsCopied(): Promise<void> {
    await step('Open "What gets copied"', async () => {
      await this.page.getByText('What gets copied', { exact: true }).click()
    })
  }

  /** Copies the AI builder prompt; returns what landed on the clipboard. */
  async copyAiPrompt(): Promise<string> {
    return step('Copy the prompt for the AI website builder', async () => {
      await allowClipboard(this.page)
      await this.aiPromptButton.click()
      return clipboardText(this.page)
    })
  }
}
