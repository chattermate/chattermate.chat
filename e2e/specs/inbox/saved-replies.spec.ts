import { test, expect, askForAPerson, createSavedReply, deleteSavedReply, deleteSavedReplyByShortcut, type TestAgent } from '@e2e'

const shortcutFor = (agent: TestAgent) => `refund-${agent.id.slice(0, 8)}`

test.describe('inbox saved replies', () => {
  test.use({ agentSettings: { transferToHuman: true } })

  test("a saved reply fills in the customer's first name and reaches the widget @inbox", async ({ agent, widget, inbox, llm, adminApi }) => {
    const shortcut = shortcutFor(agent)
    const reply = await createSavedReply(adminApi, {
      title: 'Refund on its way',
      body: 'Hi {{customer.first_name}}, your refund is on its way.',
      shortcut,
    })
    try {
      await askForAPerson(agent, widget, llm)
      await inbox.goto('/conversations?view=waiting')
      await inbox.openConversationWith(widget.customer.name)
      await inbox.takeOver()

      const firstName = widget.customer.name.split(' ')[0]
      await inbox.insertSavedReply(shortcut)
      await expect(inbox.messageInput).toHaveValue(`Hi ${firstName}, your refund is on its way.`)
      await inbox.sendTyped()
      await expect(widget.lastAgentMessage()).toHaveText(`Hi ${firstName}, your refund is on its way.`)
    } finally {
      await deleteSavedReply(adminApi, reply.id)
    }
  })

  test('a reply saved from the composer is offered on the next chat @inbox', async ({ agent, widget, inbox, llm, adminApi }) => {
    const shortcut = shortcutFor(agent)
    await askForAPerson(agent, widget, llm)
    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    await inbox.takeOver()

    await inbox.messageInput.fill('Orders ship within two working days.')
    await inbox.saveReplyAs('Shipping time', shortcut)
    try {
      await inbox.messageInput.fill('')
      await inbox.insertSavedReply(shortcut)
      await expect(inbox.messageInput).toHaveValue('Orders ship within two working days.')
    } finally {
      await deleteSavedReplyByShortcut(adminApi, shortcut)
    }
  })
})
