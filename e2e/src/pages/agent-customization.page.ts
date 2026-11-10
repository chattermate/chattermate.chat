import { expect, type Locator, type Page } from '@playwright/test'
import { step } from '../support/step'

export type LauncherGroup = 'Size' | 'Shape' | 'Icon' | 'Background' | 'Animation'
export type LogoFile = { name: string; mimeType: string; buffer: Buffer }

export type CustomizationSection = 'Design' | 'Launcher' | 'Placement' | 'Messages' | 'Behaviour'

/** Agent → Chat Customization: collapsible sections (one open at a time) and the preview beside them. */
export class AgentCustomizationPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /** Opens the tab with the Launcher section open. */
  async goto(agentId: string): Promise<void> {
    await this.page.goto(`/ai-agents?agent=${agentId}&tab=customization`)
    await this.openSection('Launcher')
  }

  section(name: CustomizationSection): Locator {
    return this.page.getByRole('region', { name, exact: true })
  }

  /** The closed section's one-line summary of what is set inside it. */
  sectionSummary(name: CustomizationSection): Locator {
    return this.section(name).getByRole('button', { expanded: false })
  }

  async openSection(name: CustomizationSection): Promise<void> {
    await step(`Open the ${name} section`, async () => {
      const toggle = this.section(name).getByRole('button').first()
      if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click()
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    })
  }

  get launcherCard(): Locator {
    return this.section('Launcher')
  }

  /** The launcher's colour swatches. */
  launcherColor(hex: string): Locator {
    return this.launcherCard.getByRole('radiogroup', { name: 'Launcher color' }).getByRole('radio', { name: hex })
  }

  /** A launcher option, e.g. option('Size', 'Small'). Premium ones are named "Swoosh, premium". */
  option(group: LauncherGroup, name: string): Locator {
    return this.group(group).getByRole('radio', { name: new RegExp(`^${name}\\b`) })
  }

  async choose(group: LauncherGroup, name: string): Promise<void> {
    await step(`Choose ${group}: ${name}`, async () => {
      await this.option(group, name).click()
    })
  }

  async uploadLogo(file: LogoFile): Promise<void> {
    await step(`Choose ${file.name} as the logo`, async () => {
      await this.launcherCard.getByLabel('Upload logo').setInputFiles(file)
    })
  }

  /** A whole group of options; Shape goes away for a logo with no background. */
  group(group: LauncherGroup): Locator {
    return this.launcherCard.getByRole('radiogroup', { name: group, exact: true })
  }

  async removeLogo(): Promise<void> {
    await step('Remove the logo', async () => {
      await this.launcherCard.getByRole('button', { name: 'Remove' }).click()
    })
  }

  /** Why a chosen logo file was refused. */
  get logoError(): Locator {
    return this.launcherCard.getByRole('alert')
  }

  /** "… is on Base and Pro." under a locked option (hosted editions only). */
  get upsell(): Locator {
    return this.launcherCard.getByText(/is on Base and Pro\.$/)
  }

  windowSize(name: string): Locator {
    return this.page.getByRole('radiogroup', { name: 'Window', exact: true }).getByRole('radio', { name, exact: true })
  }

  async chooseWindowSize(name: string): Promise<void> {
    await step(`Choose the ${name} chat window`, async () => {
      await this.openSection('Placement')
      await this.windowSize(name).click()
    })
  }

  async save(): Promise<void> {
    await step('Save the customization', async () => {
      await this.page.getByRole('button', { name: 'Save Changes' }).click()
      await expect(this.page.getByText('Customization saved successfully!')).toBeVisible()
    })
  }

  get preview(): Locator {
    return this.page.getByRole('region', { name: 'Launcher preview' })
  }

  /** The launcher as the preview draws it. */
  get previewLauncher(): Locator {
    return this.preview.getByRole('button', { name: /^(Open|Close) chat$/ })
  }

  /** The logo inside the preview's launcher. CSS: decorative image, no accessible name. */
  get previewLogo(): Locator {
    return this.previewLauncher.locator('img')
  }
}
