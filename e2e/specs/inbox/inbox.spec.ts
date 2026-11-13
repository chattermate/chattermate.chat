import { test, expect, askForAPerson, AI_REPLY } from '@e2e'

test.describe('inbox', () => {
  test.use({ agentSettings: { transferToHuman: true } })

  test("a handed-over chat waits in its view with the AI's summary, and taking it over pauses the AI @inbox @handover", async ({ agent, widget, inbox, llm }) => {
    await llm.script(agent, (s) => s
      .when(/refund/i).reply('Let me pass you to the team.', {
        transfer_to_human: true,
        transfer_reason: 'KNOWLEDGE_GAP',
        transfer_description: 'Wants a refund for an order delivered to Berlin.',
      })
      .otherwise().reply('Happy to help!'))

    await widget.embed()
    await widget.open()
    await widget.send('I want a refund')
    await widget.shareContactDetails()

    await inbox.goto('/conversations?view=waiting')
    await expect(inbox.listTitle).toContainText('Waiting for a human')
    await inbox.openConversationWith(widget.customer.name)
    await expect(inbox.banner).toContainText(`${widget.customer.name} has been waiting`)
    await expect(inbox.handover).toContainText('No answer in knowledge')
    await expect(inbox.handoverSummary).toContainText('Wants a refund for an order delivered to Berlin.')

    await inbox.takeOver()
    await expect(inbox.banner).toContainText('is paused while you handle this chat')
    await inbox.openView('Your inbox')
    await expect(inbox.conversation(widget.customer.name)).toBeVisible()
    await inbox.openView('Waiting for a human')
    await expect(inbox.conversation(widget.customer.name)).toBeHidden()
  })

  test('handed back to the AI, the customer is told and the AI answers their next message @inbox @handover', async ({ agent, widget, inbox, llm }) => {
    await llm.script(agent, (s) => s
      .when(/human|person/i).handOver('Connecting you with a teammate.')
      .when(/parcel/i).reply('Your parcel ships tomorrow.')
      .otherwise().reply('Happy to help!'))

    await widget.embed()
    await widget.open()
    await widget.send('I want to talk to a human')
    await widget.shareContactDetails()

    await inbox.goto()
    await inbox.openConversationWith(widget.customer.name)
    await inbox.takeOver()
    await inbox.handBackToAi()

    await expect(widget.lastAgentMessage()).toHaveText("You're chatting with our AI assistant again.", AI_REPLY)
    await expect(inbox.banner).toContainText('is answering this chat')
    await widget.send('Where is my parcel?')
    await expect(widget.lastAgentMessage()).toHaveText('Your parcel ships tomorrow.', AI_REPLY)
  })

  test('a conversation moves between the views as it changes hands @inbox', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)

    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)

    await inbox.takeOver()
    await inbox.openViewFor('Your inbox', widget.customer.name)
    await expect(inbox.conversation(widget.customer.name)).toBeVisible()

    await inbox.handBackToAi()
    await inbox.openViewFor('AI handling now', widget.customer.name)
    await expect(inbox.conversation(widget.customer.name)).toBeVisible()
    await inbox.openViewFor('Your inbox', widget.customer.name)
    await expect(inbox.conversation(widget.customer.name)).toBeHidden()

    await inbox.openViewFor('AI handling now', widget.customer.name)
    await inbox.conversation(widget.customer.name).click()
    await inbox.handToTeam()
    await inbox.openViewFor('Waiting for a human', widget.customer.name)
    await expect(inbox.conversation(widget.customer.name)).toBeVisible()
  })

  test('below 1440px the details open over the thread and Escape closes them @inbox', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)

    await inbox.goto()
    await inbox.openConversationWith(widget.customer.name)
    await expect(inbox.details).toBeHidden()

    await inbox.detailsToggle.click()
    await expect(inbox.details).toBeVisible()
    await expect(inbox.details).toContainText(widget.customer.email)
    await expect(inbox.detailsToggle).toHaveAttribute('aria-expanded', 'true')
    await inbox.page.keyboard.press('Escape')
    await expect(inbox.details).toBeHidden()
  })

  test('search finds a customer by name or email, and nobody else @inbox', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)

    await inbox.goto()
    await inbox.openConversationWith(widget.customer.name)
    await inbox.search(widget.customer.email.toUpperCase())
    await expect(inbox.conversation(widget.customer.name)).toBeVisible()
    await inbox.search('nobody-by-this-name')
    await expect(inbox.conversation(widget.customer.name)).toBeHidden()
  })
})
