import { test, expect, askForAPerson, listAgents, AgentsPage, InboxPage } from '@e2e'

// An agent can be duplicated (settings, look and knowledge; not its widget,
// channels or workflows) and deleted for good from its card's menu. Deleting
// says what goes with it, and its past conversations stay in the inbox.
//
// Other tests share the org's agent list, so cards are found by this test's
// agent names only.

test.describe('duplicating and deleting an agent', () => {
  test('Duplicate makes a "(copy)" with the same instructions, and Delete removes it @agents', async ({ agent, adminApi, page }) => {
    const agents = new AgentsPage(page)
    await agents.goto()
    await agents.agentMenu(agent.name, 'Duplicate')

    const copyName = `${agent.name} (copy)`
    await expect(agents.agentCard(copyName)).toBeVisible()
    const listed = await listAgents(adminApi)
    const original = listed.find((a) => a.id === agent.id)!
    const copy = listed.find((a) => a.name === copyName)!
    expect(copy.id).not.toBe(agent.id)
    expect(copy.instructions).toEqual(original.instructions)

    await agents.agentMenu(copyName, 'Delete')
    const dialog = agents.deleteDialog(copy.display_name ?? copyName)
    await expect(dialog).toContainText("This can't be undone.")
    await expect(dialog).toContainText('Past conversations, tickets and leads stay in your inbox.')
    await agents.confirmDelete(copy.display_name ?? copyName)

    await expect(agents.agentCard(copyName)).toHaveCount(0)
    await expect(agents.agentCard(agent.name)).toBeVisible()
    expect((await listAgents(adminApi)).map((a) => a.id)).not.toContain(copy.id)
  })

  test.describe('with a conversation', () => {
    test.use({ agentSettings: { transferToHuman: true } })

    test('deleting the agent says its widget stops working, and its chat stays in the inbox @agents @inbox', async ({ agent, widget, llm, page }) => {
      await askForAPerson(agent, widget, llm)

      const agents = new AgentsPage(page)
      await agents.goto()
      await agents.agentMenu(agent.name, 'Delete')
      const dialog = agents.deleteDialog(agent.name)
      await expect(dialog).toContainText("Its chat widget stops working on any site where it's installed.")
      await agents.confirmDelete(agent.name)
      await expect(agents.agentCard(agent.name)).toHaveCount(0)

      const inbox = new InboxPage(page)
      await inbox.goto()
      await inbox.openConversationWith(widget.customer.name)
      await expect(inbox.lastCustomerMessage()).toContainText('I want to talk to a person')
      await expect(inbox.aiMessage('Connecting you with a teammate.')).toBeVisible()
    })
  })
})
