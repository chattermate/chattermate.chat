import { expect, type Locator, type Page } from '@playwright/test'
import { step } from '../support/step'
import type { ConfirmPolicy } from '../api/actions'

const POLICY_LABELS: Record<ConfirmPolicy, string> = {
  never: 'Never asks',
  always: 'Always asks',
  when_overwriting: 'Asks if overwriting',
}

export interface ActionForm {
  name: string
  label?: string
  description?: string
  /** JSON Schema text, as typed into the Arguments box. */
  parameters?: string
  confirm?: ConfirmPolicy
}

/** The agent editor's Actions tab: the declared actions, and the form beside them. */
export class AgentActionsTab {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async open(agentId: string): Promise<void> {
    await this.page.goto(`/ai-agents?agent=${agentId}&tab=actions`)
    await expect(this.heading).toBeVisible()
  }

  /** The whole tab, below the tab bar. */
  get content(): Locator {
    return this.page.getByRole('region', { name: 'Actions', exact: true })
  }

  /** Where the agent's header starts; the tab's content lines up with it. */
  get headerStart(): Locator {
    return this.page.getByRole('button', { name: 'Back to agents' })
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Actions', exact: true })
  }

  get newActionButton(): Locator {
    return this.page.getByRole('button', { name: 'New action' })
  }

  /** The form for a new action, or for the one being edited. */
  get editor(): Locator {
    return this.page.getByRole('form', { name: 'Action' })
  }

  get table(): Locator {
    return this.page.getByRole('table', { name: 'Actions' })
  }

  async fill(form: Partial<ActionForm>): Promise<void> {
    await step('Fill in the action', async () => {
      if (form.name !== undefined) await this.editor.getByRole('textbox', { name: 'Name' }).fill(form.name)
      if (form.label !== undefined) await this.editor.getByRole('textbox', { name: 'Label' }).fill(form.label)
      if (form.description !== undefined) await this.editor.getByRole('textbox', { name: 'What it does' }).fill(form.description)
      if (form.parameters !== undefined) await this.editor.getByRole('textbox', { name: 'Arguments' }).fill(form.parameters)
      if (form.confirm) await this.editor.getByRole('radio', { name: POLICY_LABELS[form.confirm] }).check()
    })
  }

  get saveButton(): Locator {
    return this.editor.getByRole('button', { name: 'Save' })
  }

  /** Declares a new action through the form and waits for it to be saved. */
  async declare(form: ActionForm): Promise<void> {
    await step(`Declare action ${form.name}`, async () => {
      await this.newActionButton.click()
      await this.fill(form)
      await this.saveButton.click()
      await expect(this.page.getByText(`Saved ${form.name}`)).toBeVisible()
    })
  }

  row(name: string): Locator {
    return this.table.getByRole('row').filter({ hasText: name })
  }

  onSwitch(name: string): Locator {
    return this.row(name).getByRole('switch')
  }

  deleteButton(name: string): Locator {
    return this.row(name).getByRole('button', { name: `Delete ${name}` })
  }

  async remove(name: string): Promise<void> {
    await step(`Delete action ${name}`, async () => {
      await this.deleteButton(name).click()
      await this.page.getByRole('dialog', { name: 'Delete action?' }).getByRole('button', { name: 'Delete' }).click()
      await expect(this.page.getByText(`Deleted ${name}`)).toBeVisible()
    })
  }
}
