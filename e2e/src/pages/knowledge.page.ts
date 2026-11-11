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

  /** A source's "still being read" marker: it is searchable, and more is on the way. */
  crawlingTag(name: string): Locator {
    return this.source(name).getByTitle('Crawling')
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

  /** The "Add source" dialog. */
  get addDialog(): Locator {
    return this.page.getByRole('dialog', { name: 'Add knowledge source' })
  }

  /** The dialog's refusal when every source the plan allows is in use. */
  get sourceLimit(): Locator {
    return this.addDialog.getByRole('alert')
  }

  /** The source meter's note when the plan's sources are all in use. */
  get allSourcesInUse(): Locator {
    return this.page.getByText('All your plan’s sources are in use.')
  }

  /**
   * Fills the "Add source" dialog with pasted text and submits it. The dialog
   * stays open when the add is refused. `agent` is the agent's name as the
   * picker lists it, or NO_AGENT; leave it out when the org has one agent
   * (the dialog shows no picker then).
   */
  async submitText(source: { title: string; content: string; agent?: string }): Promise<void> {
    await this.page.getByRole('button', { name: 'Add source' }).click()
    await this.addDialog.getByRole('button', { name: /^Text/ }).click()
    await this.addDialog.getByLabel('Title').fill(source.title)
    await this.addDialog.getByLabel('Content').fill(source.content)
    if (source.agent) await this.addDialog.getByLabel('Which agent answers from it').selectOption({ label: source.agent })
    await this.addDialog.getByRole('button', { name: 'Add page' }).click()
  }

  /**
   * Adds pasted text through the "Add source" dialog. `agent` is the agent's name
   * as the org page's picker lists it, or NO_AGENT; leave it out for an org
   * with one agent.
   */
  async addText(source: { title: string; content: string; agent?: string }): Promise<void> {
    await step(`Add the text source "${source.title}" for ${source.agent ?? 'the only agent'}`, async () => {
      await this.submitText(source)
      await expect(this.addDialog).toBeHidden()
    })
  }

  /** From the source-limit refusal, swap `sourceName` for the source being added. */
  async replaceSource(sourceName: string): Promise<void> {
    await step(`Replace "${sourceName}" with the new source`, async () => {
      await this.sourceLimit.getByRole('listitem').filter({ hasText: sourceName }).getByRole('button', { name: 'Replace' }).click()
      await expect(this.addDialog).toBeHidden()
    })
  }
}
