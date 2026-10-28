import { expect, type Locator, type Page } from '@playwright/test'
import { step } from '../support/step'

/** The add dialog's "None for now": the source is added for no agent. */
export const NO_AGENT = 'None for now'

/**
 * The knowledge explorer, in both places it lives: the organization's
 * /knowledge page and an agent's Knowledge tab (/ai-agents?agent=<id>&tab=knowledge).
 */
export class KnowledgePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(): Promise<void> {
    await this.page.goto('/knowledge')
    await expect(this.page.getByRole('heading', { name: 'Knowledge base' })).toBeVisible()
  }

  async gotoAgent(agentId: string): Promise<void> {
    await this.page.goto(`/ai-agents?agent=${agentId}&tab=knowledge`)
    await expect(this.page.getByRole('button', { name: 'Link existing' })).toBeVisible()
  }

  /** An agent tab's "this agent isn't using any knowledge" warning. */
  get noKnowledgeWarning(): Locator {
    return this.page.getByRole('status').filter({ hasText: 'isn’t using any knowledge' })
  }

  /** A source in the tree; its "No agent" tag shows when no agent answers from it. */
  source(name: string): Locator {
    return this.page.getByRole('group', { name, exact: true })
  }

  unlinkedTag(name: string): Locator {
    return this.source(name).getByText('No agent', { exact: true })
  }

  /** From the agent tab's warning, link an organization source to this agent. */
  async linkFromWarning(sourceName: string): Promise<void> {
    await step(`Link "${sourceName}" from the no-knowledge warning`, async () => {
      await this.noKnowledgeWarning.getByRole('button', { name: 'Link knowledge' }).click()
      const dialog = this.page.getByRole('dialog', { name: 'Link existing knowledge' })
      await dialog.getByPlaceholder('Search knowledge sources…').fill(sourceName)
      const row = dialog.getByRole('listitem').filter({ hasText: sourceName })
      await row.getByRole('button', { name: 'Link', exact: true }).click()
      await expect(row.getByRole('button', { name: 'Unlink' })).toBeVisible()
      await dialog.getByRole('button', { name: 'Done' }).click()
      await expect(dialog).toBeHidden()
    })
  }

  /**
   * Adds pasted text through the "Add source" dialog. `agent` is the agent's name
   * as the org page's picker lists it, or NO_AGENT.
   */
  async addText(source: { title: string; content: string; agent: string }): Promise<void> {
    await step(`Add the text source "${source.title}" for ${source.agent}`, async () => {
      await this.page.getByRole('button', { name: 'Add source' }).click()
      const dialog = this.page.getByRole('dialog', { name: 'Add knowledge source' })
      await dialog.getByRole('button', { name: /^Text/ }).click()
      await dialog.getByLabel('Title').fill(source.title)
      await dialog.getByLabel('Content').fill(source.content)
      await dialog.getByLabel('Which agent answers from it').selectOption({ label: source.agent })
      await dialog.getByRole('button', { name: 'Add page' }).click()
      await expect(dialog).toBeHidden()
    })
  }
}
