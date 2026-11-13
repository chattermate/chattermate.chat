import { expect, type Locator, type Page } from '@playwright/test'
import { step } from '../support/step'

/** /conversations — where human agents pick up chats. */
export class InboxPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(path = '/conversations'): Promise<void> {
    await this.page.goto(path)
    await expect(this.searchBox).toBeVisible()
  }

  get searchBox(): Locator {
    return this.page.getByRole('searchbox', { name: 'Search conversations' })
  }

  /** The views pane (wide screens) */
  get views(): Locator {
    return this.page.getByRole('navigation', { name: 'Inbox views' })
  }

  /** A view in the pane, by its label; its accessible name adds the count ("Waiting for a human, 2") */
  view(label: string): Locator {
    return this.views.getByRole('button', { name: new RegExp(`^${label}(, \\d+)?$`) })
  }

  async openView(label: string): Promise<void> {
    await step(`Agent opens the ${label} view`, async () => {
      await this.view(label).click()
      await expect(this.listTitle).toContainText(label)
    })
  }

  /** The list's heading: the view's name and size */
  get listTitle(): Locator {
    // By id: its text is the view's name, which is what the specs check
    return this.page.locator('#inbox-list-title')
  }

  /** A conversation in the list */
  conversation(customerName: string): Locator {
    return this.page.getByRole('button', { name: `Conversation with ${customerName}`, exact: true })
  }

  /**
   * Finds the customer by name, as an agent does in a busy inbox: the shared
   * test org's queue outgrows a page, and the newest waiting chat sorts last.
   * The list refreshes on its own every 30s; reloading gets a new chat onto it
   * at once. The search stays on, so the views only list this customer.
   */
  async openConversationWith(customerName: string): Promise<void> {
    await step(`Agent opens the chat with ${customerName}`, async () => {
      const item = this.conversation(customerName)
      await expect(async () => {
        await this.page.reload()
        await this.searchBox.fill(customerName)
        await item.click({ timeout: 3_000 })
      }).toPass({ timeout: 30_000 })
      await expect(this.page.getByRole('heading', { name: customerName })).toBeVisible()
    })
  }

  async search(text: string): Promise<void> {
    await this.searchBox.fill(text)
  }

  async takeOver(): Promise<void> {
    await step('Agent takes over the chat', async () => {
      await this.banner.getByRole('button', { name: 'Take over chat', exact: true }).click()
      await this.page.getByRole('dialog', { name: 'Take over this chat?' }).getByRole('button', { name: 'Take over chat' }).click()
      await expect(this.messageInput).toBeEditable()
    })
  }

  async handBackToAi(): Promise<void> {
    await step('Agent hands the chat back to the AI', async () => {
      await this.banner.getByRole('button', { name: 'Hand back to AI' }).click()
      await expect(this.messageInput).toBeHidden()
    })
  }

  /** Who is answering and the action that changes it (above the thread when yours, else at its foot) */
  get banner(): Locator {
    return this.page.getByRole('status').filter({ hasText: /paused|waiting|answering|handling|closed/ })
  }

  /** Where the AI handed over: who, why and when, then its summary */
  get handover(): Locator {
    // By id: the details panel's "Jump to handover summary" scrolls to the same element
    return this.page.locator('#handover')
  }

  async handToTeam(): Promise<void> {
    await step('Agent hands the chat to the team', async () => {
      await this.banner.getByRole('button', { name: 'Hand to my team' }).click()
      await expect(this.banner).toContainText('has been waiting')
    })
  }

  /** The composer's note box (the Note tab) */
  get noteBox(): Locator {
    return this.page.getByRole('textbox', { name: 'Note for your team' })
  }

  /** Leaves a note; \`mention\` is picked from the @ list after the text. */
  async addNote(text: string, mention?: string): Promise<void> {
    await step(`Agent adds a note "${text}"`, async () => {
      if (!(await this.noteBox.isVisible())) await this.page.getByRole('tab', { name: 'Note' }).click()
      await this.noteBox.fill(text)
      if (mention) {
        // The whole name: the shared test org has many teammates with the same first name
        await this.noteBox.pressSequentially(` @${mention}`)
        await this.page.getByRole('option', { name: mention }).click()
      }
      await this.page.getByRole('button', { name: 'Add note', exact: true }).click()
      await expect(this.note(text)).toBeVisible()
    })
  }

  /** A note in the thread that carries \`text\` */
  note(text: string): Locator {
    return this.page.getByRole('note').filter({ hasText: text })
  }

  /** What the thread's More actions menu offers (opens it, reads it, closes it) */
  async moreActions(): Promise<string[]> {
    await this.page.getByRole('button', { name: 'More actions' }).click()
    const items = this.page.getByRole('menuitem')
    await expect(items.first()).toBeVisible()
    const labels = (await items.allInnerTexts()).map((label) => label.trim())
    await this.page.keyboard.press('Escape')
    return labels
  }

  async snooze(choice: '1 hour' | '3 hours' | 'tomorrow 9:00' | 'next Monday 9:00'): Promise<void> {
    await step(`Agent snoozes the chat for ${choice}`, async () => {
      await this.page.getByRole('button', { name: 'More actions' }).click()
      await this.page.getByRole('menuitem', { name: `Snooze · ${choice}` }).click()
      await expect(this.page.getByRole('status').filter({ hasText: 'It comes back then' })).toBeVisible()
    })
  }

  /** The handover summary the AI left for the team */
  get handoverSummary(): Locator {
    return this.page.getByRole('region', { name: /Handover summary/ })
  }

  get detailsToggle(): Locator {
    return this.page.getByRole('button', { name: 'Details panel' })
  }

  get details(): Locator {
    return this.page.getByRole('complementary', { name: 'Customer and conversation details' })
  }

  async reply(text: string): Promise<void> {
    await step(`Agent replies "${text}"`, async () => {
      await this.messageInput.fill(text)
      await this.page.getByRole('button', { name: 'Send', exact: true }).click()
      await expect(this.page.locator('.message.agent .message-bubble').last()).toContainText(text)
    })
  }

  get messageInput(): Locator {
    return this.page.getByPlaceholder('Type a message or paste a screenshot')
  }

  /** The agent's message bubble that carries `text`. */
  agentMessage(text: string): Locator {
    return this.page.locator('.message.agent').filter({ hasText: text })
  }

  /** An AI reply in the open thread */
  aiMessage(text: string): Locator {
    return this.page.locator('.message.bot').filter({ hasText: text })
  }

  /** The download link for an attachment in the open chat. */
  attachment(filename: string): Locator {
    return this.page.locator('.attachment-link').filter({ hasText: filename })
  }

  /** The bubble also shows a relative time ("less than a minute ago"), so assert with toContainText. */
  lastCustomerMessage(): Locator {
    return this.page.locator('.message.user .message-bubble').last()
  }
}
