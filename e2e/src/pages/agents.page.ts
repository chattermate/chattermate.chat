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

  /** Clicks a tab of the open agent ("Lead Capture", "MCP Tools", "Advanced", …). */
  async openTab(name: string): Promise<void> {
    await step(`Open the ${name} tab`, async () => {
      await this.page.getByRole('button', { name, exact: true }).click()
    })
  }

  /** "Unlock …": what a tab the plan doesn't include opens instead (hosted editions only). */
  get upgradeDialog(): Locator {
    return this.page.getByRole('dialog', { name: /^Unlock / })
  }

  async closeUpgradeDialog(): Promise<void> {
    await step('Close the upgrade dialog', async () => {
      await this.upgradeDialog.getByRole('button', { name: 'Close' }).click()
      await expect(this.upgradeDialog).toBeHidden()
    })
  }

  /** The Online/Offline switch in the open agent's header. */
  get onlineSwitch(): Locator {
    return this.page.getByRole('checkbox', { name: 'Agent online' })
  }

  /** Flips the open agent's Online/Offline switch, as an admin does, and waits for it to save. */
  async setOnline(online: boolean): Promise<void> {
    await step(`Set the agent ${online ? 'Online' : 'Offline'}`, async () => {
      if ((await this.onlineSwitch.isChecked()) !== online) {
        // The input sits under its slider: the switch's label takes the click
        await this.onlineSwitch.locator('..').click()
      }
      await expect(this.page.getByText(online ? 'Agent is online.' : 'Agent is offline.')).toBeVisible()
    })
  }

  /** What the open agent sends while Offline; empty shows the default as its placeholder. */
  get offlineMessage(): Locator {
    return this.page.getByRole('textbox', { name: 'Offline message' })
  }

  /** The offline message card: on a plan without its own text, the default and an upgrade line, no box. */
  get offlineMessageCard(): Locator {
    // A settings card, not a landmark: found by its heading
    return this.page.locator('section').filter({ has: this.page.getByRole('heading', { name: 'Offline Message' }) })
  }

  /** The upgrade line under the offline message on a plan without it. */
  get offlineMessageUpgrade(): Locator {
    return this.page.getByText('to write your own offline message.')
  }

  /** The switch that asks website visitors for an email after the offline message. */
  get offlineAskEmail(): Locator {
    return this.page.getByRole('checkbox', { name: 'Ask for their email' })
  }

  async setOfflineAskEmail(on: boolean): Promise<void> {
    await step(`${on ? 'Ask' : 'Do not ask'} for an email after the offline message`, async () => {
      if ((await this.offlineAskEmail.isChecked()) !== on) {
        // The input sits under its slider: the switch's label takes the click
        await this.offlineAskEmail.locator('..').click()
      }
      await this.page.getByRole('button', { name: 'Save Changes' }).click()
      await expect(this.page.getByText('Agent updated successfully')).toBeVisible()
    })
  }

  async setOfflineMessage(text: string): Promise<void> {
    await step("Write the agent's own offline message", async () => {
      await this.offlineMessage.fill(text)
      await this.page.getByRole('button', { name: 'Save Changes' }).click()
      await expect(this.page.getByText('Agent updated successfully')).toBeVisible()
    })
  }

  async setInstructions(instructions: string): Promise<void> {
    await step('Edit the agent instructions', async () => {
      await this.page.getByPlaceholder('Enter instructions for the agent...').fill(instructions)
      await this.page.getByRole('button', { name: 'Save Changes' }).click()
      await expect(this.page.getByText('Agent updated successfully')).toBeVisible()
    })
  }

  /** One agent's card on the list, by its name (unique in the org). */
  agentCard(name: string): Locator {
    // A card is a styled block with no role of its own; its name line is exact
    return this.page.locator('.agent-card').filter({ has: this.page.getByText(name, { exact: true }) })
  }

  /** Opens the card's "More options" menu and picks an item. */
  async agentMenu(name: string, item: 'Duplicate' | 'Delete'): Promise<void> {
    await step(`${item} agent "${name}"`, async () => {
      await this.page.getByRole('button', { name: `More options for ${name}`, exact: true }).click()
      await this.page.getByRole('menuitem', { name: item, exact: true }).click()
    })
  }

  /** The confirm dialog Delete opens for this agent: what goes with it and what stays. */
  deleteDialog(displayName: string): Locator {
    return this.page.getByRole('dialog', { name: 'Delete this agent?' }).filter({ hasText: displayName })
  }

  async confirmDelete(displayName: string): Promise<void> {
    await step(`Confirm deleting "${displayName}"`, async () => {
      const dialog = this.deleteDialog(displayName)
      await dialog.getByRole('button', { name: 'Delete agent' }).click()
      await expect(dialog).toBeHidden()
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
