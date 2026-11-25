import {
  test, expect, connectWhatsAppNumber, AI_REPLY, FakeExternals, IntegrationsPage, TEAM_WILL_REPLY, unique, WhatsAppChat,
} from '@e2e'

// A connected account no AI agent answers still takes its messages: they wait
// in the team's inbox and the customer is told once that the team will reply.
// The Integrations card and the account's dialog say so and lead to the agent
// picker. With a single agent in the org the connect assigns it by itself;
// this test makes a second agent so the choice stays the customer's.
//
// Other tests share the org and its WhatsApp card, so the card is checked for
// this test's number by name.

test.describe('a channel account no agent answers', () => {
  test('keeps its messages for the team and is flagged on its card until an agent is assigned, then answered @channels', async ({ agent, makeAgent, llm, adminApi, adminInbox, request, page }) => {
    await makeAgent()
    await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
    const number = await connectWhatsAppNumber(adminApi)
    const name = number.account.display_name ?? ''
    expect(number.account.agent_id).toBeNull()

    const customer = unique('Tess')
    const chat = new WhatsAppChat(request, new FakeExternals(request), number, customer)
    await chat.send('Is anyone there?')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual([TEAM_WILL_REPLY])
    await adminInbox.goto()
    await adminInbox.openConversationWith(customer)
    await expect(adminInbox.lastCustomerMessage()).toContainText('Is anyone there?')
    expect(await llm.requests(agent)).toHaveLength(0)

    const integrations = new IntegrationsPage(page)
    await integrations.goto()
    await expect(integrations.card('WhatsApp')).toContainText(integrations.noAgentFor(name))

    await integrations.manage('WhatsApp')
    await expect(integrations.whatsAppNumber(name)).toContainText('No agent: messages wait in your inbox.')
    await integrations.manageWhatsAppNumber(name, 'Assign agent')
    await expect(integrations.noAgentNotice()).toBeVisible()
    await integrations.assignAgentInDialog(agent.name)

    await expect(integrations.card('WhatsApp')).not.toContainText(integrations.noAgentFor(name))
    await chat.send('Hello?')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual([TEAM_WILL_REPLY, 'Happy to help!'])
  })
})
