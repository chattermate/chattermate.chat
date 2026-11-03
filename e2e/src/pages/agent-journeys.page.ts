import { expect, type Locator, type Page } from '@playwright/test'
import { step } from '../support/step'

/** The agent editor's Journeys tab: the list, the template gallery, the editor and the funnel. */
export class AgentJourneysTab {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async open(agentId: string): Promise<void> {
    await this.page.goto(`/ai-agents?agent=${agentId}&tab=journeys`)
    await expect(this.heading).toBeVisible()
  }

  /** The whole tab, below the tab bar. */
  get content(): Locator {
    return this.page.getByRole('region', { name: 'Journeys', exact: true })
  }

  /** Where the agent's header starts; the tab's content lines up with it. */
  get headerStart(): Locator {
    return this.page.getByRole('button', { name: 'Back to agents' })
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Journeys', exact: true })
  }

  // ── List ────────────────────────────────────────────────────────────

  get table(): Locator {
    return this.page.getByRole('table', { name: 'Journeys' })
  }

  row(name: string): Locator {
    return this.table.getByRole('row').filter({ has: this.page.getByRole('button', { name, exact: true }) })
  }

  statusSwitch(name: string): Locator {
    return this.row(name).getByRole('switch')
  }

  async addFromTemplate(templateName: string): Promise<void> {
    await step(`Add the "${templateName}" template`, async () => {
      await this.page.getByRole('button', { name: 'Templates', exact: true }).click()
      await this.page.getByRole('button', { name: `Use ${templateName}` }).click()
      await expect(this.page.getByText('Added as a draft')).toBeVisible()
      await expect(this.nameInput).toHaveValue(templateName)
    })
  }

  async newJourney(): Promise<void> {
    await this.page.getByRole('button', { name: 'New journey' }).click()
    await expect(this.nameInput).toBeVisible()
  }

  async edit(name: string): Promise<void> {
    await this.row(name).getByRole('button', { name, exact: true }).click()
    await expect(this.nameInput).toHaveValue(name)
  }

  // ── Editor ──────────────────────────────────────────────────────────

  get nameInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Journey name' })
  }

  get keyInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Journey key' })
  }

  /** The settings above the steps: audience, start, goal, auto-open. */
  get settings(): Locator {
    return this.page.getByRole('group').filter({ has: this.page.getByRole('combobox', { name: 'Audience' }) })
  }

  get steps(): Locator {
    return this.page.getByRole('list', { name: 'Steps' }).getByRole('listitem')
  }

  async selectStep(title: string): Promise<void> {
    await this.page.getByRole('list', { name: 'Steps' }).getByRole('button', { name: title, exact: true }).click()
  }

  async addStep(): Promise<void> {
    await this.page.getByRole('button', { name: '+ Add step' }).click()
  }

  get stepTitle(): Locator {
    return this.page.getByRole('textbox', { name: 'Step title' })
  }

  get stepMessage(): Locator {
    return this.page.getByRole('textbox', { name: 'Opening message' })
  }

  /** A condition list of the open step: "Trigger" or "Done when". */
  conditions(list: 'Trigger' | 'Done when'): Locator {
    return this.page.getByRole('group', { name: list, exact: true })
  }

  async addChip(label: string, runs: { action: string } | { text: string }): Promise<void> {
    await step(`Add the chip "${label}"`, async () => {
      await this.page.getByRole('button', { name: '+ Add reply' }).click()
      const n = await this.page.getByRole('textbox', { name: /^Chip \d+ label$/ }).count()
      await this.page.getByRole('textbox', { name: `Chip ${n} label` }).fill(label)
      if ('action' in runs) {
        await this.page.getByRole('combobox', { name: `Chip ${n} does` }).selectOption('action')
        await this.page.getByRole('combobox', { name: `Chip ${n} action` }).selectOption(runs.action)
      } else {
        await this.page.getByRole('textbox', { name: `Chip ${n} text` }).fill(runs.text)
      }
    })
  }

  /** Whether the open step lets its chips run `name`. */
  allowedAction(name: string): Locator {
    return this.page.getByRole('checkbox', { name })
  }

  /** What's wrong with the open step, as the editor lists it. */
  get problems(): Locator {
    return this.page.getByRole('alert')
  }

  get longJourneyWarning(): Locator {
    return this.page.getByRole('note').filter({ hasText: 'Shorter ones finish more often' })
  }

  get preview(): Locator {
    return this.page.getByRole('complementary', { name: 'Test' })
  }

  get sampleContext(): Locator {
    return this.preview.getByRole('textbox', { name: 'Sample context' })
  }

  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Save', exact: true })
  }

  async save(): Promise<void> {
    await step('Save the journey', async () => {
      await this.saveButton.click()
      await expect(this.page.getByText('Journey saved')).toBeVisible()
      await expect(this.unsaved).toBeHidden()
    })
  }

  get unsaved(): Locator {
    return this.page.getByRole('status').filter({ hasText: 'Unsaved changes' })
  }

  get backButton(): Locator {
    return this.page.getByRole('button', { name: 'Back to journeys' })
  }

  get leaveDialog(): Locator {
    return this.page.getByRole('dialog', { name: 'Leave without saving?' })
  }

  // ── Funnel ──────────────────────────────────────────────────────────

  async openFunnel(name: string): Promise<void> {
    await step(`Open the funnel of "${name}"`, async () => {
      await this.row(name).getByRole('button', { name: 'Funnel', exact: true }).click()
      await expect(this.page.getByRole('heading', { name })).toBeVisible()
    })
  }

  funnelRow(stepTitle: string): Locator {
    return this.page.getByRole('row').filter({ has: this.page.getByRole('button', { name: stepTitle, exact: true }) })
  }

  /** A headline number of the funnel ("Started", "Median time to finish"). */
  kpi(label: string): Locator {
    return this.page.getByRole('group', { name: label, exact: true })
  }

  /** A step's title in the funnel opens the editor on that step. */
  async openStepFromFunnel(stepTitle: string): Promise<void> {
    await this.funnelRow(stepTitle).getByRole('button', { name: stepTitle, exact: true }).click()
    await expect(this.stepTitle).toHaveValue(stepTitle)
  }

  async showStuck(stepTitle: string): Promise<void> {
    await this.funnelRow(stepTitle).getByRole('button', { name: "Who's stuck" }).click()
  }

  get stuckUsers(): Locator {
    return this.page.getByRole('region', { name: 'Users on this step' })
  }
}
