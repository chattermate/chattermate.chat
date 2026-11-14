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

  /** Opens the view's first conversation (an org with one chat) */
  async openFirstConversation(): Promise<void> {
    await step('Agent opens the first conversation', async () => {
      await this.page.getByRole('button', { name: /^Conversation with / }).first().click()
      await expect(this.messageInput.or(this.noteBox)).toBeVisible()
    })
  }

  async search(text: string): Promise<void> {
    await this.searchBox.fill(text)
  }

  /**
   * Opens `view` narrowed to one customer, so a check that their chat is (or
   * isn't) in it holds however many chats the shared test org has piled up
   * past the first page.
   */
  async openViewFor(label: string, customerName: string): Promise<void> {
    await this.openView(label)
    await this.search(customerName)
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

  /** Leaves a note; `mention` is picked from the @ list after the text. */
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

  /** A note in the thread that carries `text` */
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

  /** The app's toasts (vue-sonner renders each as a list item in its live region) */
  /** The toast that says `text` */
  toast(text: string): Locator {
    // why CSS: sonner's toasts carry no role or name of their own
    return this.page.locator('[data-sonner-toast]').filter({ hasText: text })
  }

  /** Gives the open chat to a teammate from the header's assignee menu */
  async assignTo(name: string): Promise<void> {
    await step(`Agent assigns the chat to ${name}`, async () => {
      await this.page.getByRole('button', { name: /Change assignee/ }).click()
      await this.page.getByRole('menuitemradio', { name: new RegExp(name) }).click()
      await expect(this.toast(`Assigned to ${name}`)).toBeVisible()
    })
  }

  /** Close, then the confirmation */
  async closeChat(): Promise<void> {
    await step('Agent closes the chat', async () => {
      await this.page.getByRole('button', { name: 'Close conversation', exact: true }).click()
      await this.confirmClose()
    })
  }

  /** Writes a reply and uses Send and close, then confirms the close */
  async sendAndClose(text: string): Promise<void> {
    await step(`Agent replies "${text}" and closes the chat`, async () => {
      await this.messageInput.fill(text)
      await this.page.getByRole('button', { name: 'More send options' }).click()
      await this.page.getByRole('menuitem', { name: 'Send and close' }).click()
      await this.confirmClose()
    })
  }

  async reopen(): Promise<void> {
    await step('Agent reopens the chat', async () => {
      await this.banner.getByRole('button', { name: 'Reopen' }).click()
      await expect(this.banner).not.toContainText('This conversation is closed')
    })
  }

  /** The open thread's heading: the customer's name */
  threadTitle(customerName: string): Locator {
    return this.page.getByRole('heading', { name: customerName })
  }

  get closeDialog(): Locator {
    return this.page.getByRole('dialog', { name: 'Close this conversation?' })
  }

  private async confirmClose(): Promise<void> {
    await this.closeDialog.getByRole('button', { name: 'Close conversation' }).click()
    await expect(this.closeDialog).toBeHidden()
  }

  get shortcutsSheet(): Locator {
    return this.page.getByRole('dialog', { name: 'Keyboard shortcuts' })
  }

  /** The list, by its heading (on a phone it gives way to the thread) */
  get list(): Locator {
    return this.page.getByRole('region', { name: this.listTitleName })
  }

  private get listTitleName(): RegExp {
    return /Your inbox|Waiting for a human|All open|AI handling now|Mentions|Closed|Resolved by AI|Negative sentiment|Snoozed/
  }

  /** On a phone: back from the thread to the list */
  async backToList(): Promise<void> {
    await this.page.getByRole('button', { name: 'Back to conversations' }).click()
  }

  /** A key pressed on the inbox (its shortcuts: J, K, /, ?, Escape) */
  async press(key: string): Promise<void> {
    await this.page.keyboard.press(key)
  }

  async openNoteTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Note' }).click()
  }

  /** The dashboard at a phone's width */
  async usePhoneWidth(): Promise<void> {
    await this.page.setViewportSize({ width: 375, height: 812 })
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

  /** Sends whatever is already in the reply box */
  async sendTyped(): Promise<void> {
    await step('Agent sends the reply', async () => {
      await this.page.getByRole('button', { name: 'Send', exact: true }).click()
      await expect(this.messageInput).toHaveValue('')
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
