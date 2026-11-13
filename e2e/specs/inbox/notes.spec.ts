import { test, expect, askForAPerson, notificationsFor } from '@e2e'

const SECRET = 'Reseller account, do not refund without finance'

test.describe('inbox notes', () => {
  test.use({ agentSettings: { transferToHuman: true } })

  test("a note on a waiting chat needs no takeover, and the customer never sees it @inbox @security", async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)

    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    await inbox.addNote(SECRET)
    await expect(inbox.banner).toContainText('has been waiting')

    await inbox.takeOver()
    await inbox.reply('Let me check that for you.')
    await expect(widget.lastAgentMessage()).toHaveText('Let me check that for you.')
    await expect(widget.messageLog).not.toContainText(SECRET)

    await inbox.page.reload()
    await expect(inbox.note(SECRET)).toBeVisible()
  })

  test('a mention notifies the teammate and lists the chat in their Mentions view @inbox', async ({ agent, widget, inbox, llm, makeMember }) => {
    const teammate = await makeMember()
    await askForAPerson(agent, widget, llm)

    await inbox.goto()
    await inbox.openConversationWith(widget.customer.name)
    await inbox.addNote('Can you check the refund?', teammate.name)

    await expect.poll(async () => (await notificationsFor(teammate.api)).map((n) => n.title))
      .toContainEqual(expect.stringContaining('mentioned you'))
    const counts = await teammate.api.get<{ mentions: number }>('/chats/counts')
    expect(counts.mentions).toBeGreaterThanOrEqual(1)
  })

  test('a snoozed chat leaves Your inbox until the customer writes again @inbox', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)

    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    await inbox.takeOver()
    await inbox.snooze('3 hours')

    await inbox.openViewFor('Your inbox', widget.customer.name)
    await expect(inbox.conversation(widget.customer.name)).toBeHidden()
    await inbox.openViewFor('Snoozed', widget.customer.name)
    await expect(inbox.conversation(widget.customer.name)).toBeVisible()

    await widget.send('Hello? Still waiting')
    await expect(async () => {
      await inbox.openViewFor('Your inbox', widget.customer.name)
      await expect(inbox.conversation(widget.customer.name)).toBeVisible({ timeout: 2_000 })
    }).toPass({ timeout: 20_000 })
  })

  test('a chat waiting for a person cannot be snoozed out of the queue @inbox', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)

    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    const actions = await inbox.moreActions()
    expect(actions).toContain('Refresh conversation')
    expect(actions.filter((label) => label.startsWith('Snooze'))).toEqual([])
  })
})
