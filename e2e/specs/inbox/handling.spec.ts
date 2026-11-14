import { test, expect, askForAPerson, chatsWithAgent, reassignChat } from '@e2e'

// Handling a chat once you hold it: giving it away, closing it, and the
// drafts, keys and phone layout an agent works with.

test.describe('handling a chat', () => {
  test.use({ agentSettings: { transferToHuman: true } })

  test('assigning a chat gives it to the teammate and takes it out of your inbox @inbox', async ({ agent, widget, inbox, llm, makeMember }) => {
    const teammate = await makeMember()
    await askForAPerson(agent, widget, llm)

    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    await inbox.takeOver()
    await inbox.assignTo(teammate.name)

    await inbox.openViewFor('Your inbox', widget.customer.name)
    await expect(inbox.conversation(widget.customer.name)).toBeHidden()
    const counts = await teammate.api.get<{ assigned_to_me: number }>('/chats/counts')
    expect(counts.assigned_to_me).toBe(1)
  })

  test('a chat taken from you leaves your inbox without a reload @inbox', async ({ agent, widget, inbox, llm, makeMember, adminApi }) => {
    const teammate = await makeMember()
    await askForAPerson(agent, widget, llm)
    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    await inbox.takeOver()
    await inbox.openViewFor('Your inbox', widget.customer.name)
    await expect(inbox.conversation(widget.customer.name)).toBeVisible()

    const [chat] = await chatsWithAgent(adminApi, agent.id)
    await reassignChat(adminApi, chat.session_id, teammate.id)

    // The list polls every 30s: gone within 10s means the socket told it
    await expect(inbox.conversation(widget.customer.name)).toBeHidden({ timeout: 10_000 })
  })

  test('closing asks first, tells the customer, and files the chat under Closed @inbox', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)
    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    await inbox.takeOver()

    await inbox.closeChat()

    await expect(widget.lastAgentMessage()).toContainText('Thank you for contacting us')
    await inbox.openViewFor('Closed', widget.customer.name)
    await expect(inbox.conversation(widget.customer.name)).toBeVisible()
  })

  test('a closed chat can be reopened: it is yours, and you can reply @inbox', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)
    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    await inbox.takeOver()
    await inbox.closeChat()
    await expect(inbox.banner).toContainText('This conversation is closed')
    // The close has reached the server (it goes over the socket)
    await expect(widget.lastAgentMessage()).toContainText('Thank you for contacting us')

    await inbox.reopen()
    await expect(inbox.banner).toContainText('is paused while you handle this chat')
    await inbox.openViewFor('Your inbox', widget.customer.name)
    await expect(inbox.conversation(widget.customer.name)).toBeVisible()
    await inbox.conversation(widget.customer.name).click()
    await inbox.reply('We found your order after all.')
    await expect(widget.messageLog).toContainText('We found your order after all.')
  })

  test('Send and close sends the reply, then closes once confirmed @inbox', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)
    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    await inbox.takeOver()

    await inbox.sendAndClose('Your refund is on its way.')

    await expect(widget.messageLog).toContainText('Your refund is on its way.')
    await expect(widget.lastAgentMessage()).toContainText('Thank you for contacting us')
  })

  test('a half-written note never becomes the reply when you take the chat over @inbox @security', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)
    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)

    await inbox.noteBox.fill('Reseller, do not refund')
    await inbox.takeOver()

    await expect(inbox.messageInput).toHaveValue('')
    await inbox.openNoteTab()
    await expect(inbox.noteBox).toHaveValue('Reseller, do not refund')
  })

  test('the keyboard moves through the list, finds and explains itself @inbox', async ({ agent, widget, inbox, llm, makeVisitor }) => {
    await askForAPerson(agent, widget, llm)
    const second = await makeVisitor()
    await askForAPerson(agent, second, llm)
    // This test's teammate holds both: Your inbox lists exactly these two, newest first
    for (const visitor of [widget, second]) {
      await inbox.goto('/conversations?view=waiting')
      await inbox.openConversationWith(visitor.customer.name)
      await inbox.takeOver()
    }

    await inbox.goto('/conversations?view=mine')
    await expect(inbox.conversation(widget.customer.name)).toBeVisible()
    await expect(inbox.conversation(second.customer.name)).toBeVisible()
    await inbox.conversation(second.customer.name).click()
    await expect(inbox.conversation(second.customer.name)).toHaveAttribute('aria-current', 'true')
    await inbox.press('j')
    await expect(inbox.conversation(widget.customer.name)).toHaveAttribute('aria-current', 'true')
    await inbox.press('k')
    await expect(inbox.conversation(second.customer.name)).toHaveAttribute('aria-current', 'true')

    await inbox.press('/')
    await expect(inbox.searchBox).toBeFocused()
    await inbox.press('Escape')
    await inbox.conversation(second.customer.name).focus()
    await inbox.press('?')
    await expect(inbox.shortcutsSheet).toBeVisible()
    await inbox.press('Escape')
    await expect(inbox.shortcutsSheet).toBeHidden()

    // E asks, and Enter confirms: the open chat closes (once its thread is on screen)
    await expect(inbox.threadTitle(second.customer.name)).toBeVisible()
    await inbox.press('e')
    await expect(inbox.closeDialog).toBeVisible()
    await inbox.press('Enter')
    await expect(inbox.closeDialog).toBeHidden()
    await expect(second.lastAgentMessage()).toContainText('Thank you for contacting us')
    // On to the other one, as the closed chat leaves Your inbox
    await expect(inbox.conversation(second.customer.name)).toBeHidden()
    await expect(inbox.conversation(widget.customer.name)).toHaveAttribute('aria-current', 'true')
    await expect(inbox.threadTitle(widget.customer.name)).toBeVisible()
  })

  test("E on a chat that isn't yours to close says so @inbox", async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)
    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    // Out of the search box, where E is just a letter
    await inbox.conversation(widget.customer.name).focus()

    await inbox.press('e')
    await expect(inbox.toast('Only the person handling this chat can close it')).toBeVisible()
    await expect(inbox.closeDialog).toBeHidden()
  })

  test('on a phone the list and the thread take turns, and back returns to the list @inbox', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)
    await inbox.usePhoneWidth()
    await inbox.goto('/conversations?view=waiting')

    await inbox.openConversationWith(widget.customer.name)
    await expect(inbox.banner).toContainText('has been waiting')
    await expect(inbox.list).toBeHidden()

    await inbox.backToList()
    await expect(inbox.list).toBeVisible()
    await expect(inbox.banner).toBeHidden()
  })
})
