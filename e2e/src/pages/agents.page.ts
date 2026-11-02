import { expect, type Locator, type Page } from '@playwright/test'
import { step } from '../support/step'

/** /ai-agents — the agent list and the in-page agent editor (?agent=<id>&tab=<tab>). */
export class AgentsPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /** Needs at least one agent in the org, otherwise the onboarding wizard shows instead. */
  async goto(): Promise<void> {
    await this.page.goto('/ai-agents')
    await expect(this.page.getByPlaceholder('Search agents...')).toBeVisible()
  }

  /** Creates an agent through the "Create Agent" dialog; returns its id. */
  async createAgent(name: string): Promise<string> {
    return step(`Create agent "${name}"`, async () => {
      await this.page.getByTitle('Create a new agent').click()
      const dialog = this.page.getByRole('dialog', { name: 'Create New Agent' })
      await dialog.getByLabel('Agent Name').fill(name)
      await dialog.getByRole('button', { name: 'Create Agent' }).click()
      await expect(dialog).toBeHidden()
      await expect(this.page).toHaveURL(/[?&]agent=/)
      return new URL(this.page.url()).searchParams.get('agent')!
    })
  }

  async openAgent(agentId: string, tab = 'agent'): Promise<void> {
    await this.page.goto(`/ai-agents?agent=${agentId}&tab=${tab}`)
    await expect(this.page.getByRole('button', { name: 'Back to agents' })).toBeVisible()
  }

  async setInstructions(instructions: string): Promise<void> {
    await step('Edit the agent instructions', async () => {
      await this.page.getByPlaceholder('Enter instructions for the agent...').fill(instructions)
      await this.page.getByRole('button', { name: 'Save Changes' }).click()
      await expect(this.page.getByText('Agent updated successfully')).toBeVisible()
    })
  }

  /** The list's "Create Agent" button; locked (disabled, titled with the limit) at the plan's cap. */
  get createAgentButton(): Locator {
    return this.page.getByRole('button', { name: /Create Agent/ })
  }

  /** Shown instead of the list while the org has no agents. */
  get onboardingHeading(): Locator {
    return this.page.getByRole('heading', { name: "Let's get your first agent live" })
  }

  /** The agent's Journeys tab, then the funnel of one journey. */
  async openJourneyFunnel(agentId: string, journeyName: string): Promise<void> {
    await step(`Open the funnel of "${journeyName}"`, async () => {
      await this.openAgent(agentId, 'journeys')
      const row = this.page.getByRole('row').filter({ has: this.page.getByRole('button', { name: journeyName, exact: true }) })
      await row.getByRole('button', { name: 'Funnel', exact: true }).click()
      await expect(this.page.getByRole('heading', { name: journeyName })).toBeVisible()
    })
  }

  /** A step's bar in the funnel, named "<done> of <reached> done". */
  funnelStep(title: string): Locator {
    return this.page.getByRole('row').filter({ has: this.page.getByRole('button', { name: title, exact: true }) }).getByRole('img')
  }

  card(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true })
  }
}
