import {
  test, expect, connectWhatsAppNumber, AI_REPLY, FakeExternals, IntegrationsPage, WhatsAppChat,
} from '@e2e'

// A connected account no AI agent answers drops every inbound message, so the
// Integrations card and the account's dialog say so and lead to the agent
// picker. With a single agent in the org the connect assigns it by itself;
// this test makes a second agent so the choice stays the customer's.
//
// Other tests share the org and its WhatsApp card, so the card is checked for
// this test's number by name.

test.describe('a channel account no agent answers', () => {
  test('is flagged on its card until an agent is assigned, then answered @channels', async ({ agent, makeAgent, llm, adminApi, request, page }) => {
    await makeAgent()
    await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
    const number = await connectWhatsAppNumber(adminApi)
    const name = number.account.display_name ?? ''
    expect(number.account.agent_id).toBeNull()

    const integrations = new IntegrationsPage(page)
    await integrations.goto()
    await expect(integrations.card('WhatsApp')).toContainText(integrations.noAgentFor(name))

    await integrations.manage('WhatsApp')
    await expect(integrations.whatsAppNumber(name)).toContainText("No agent: messages aren't answered.")
    await integrations.manageWhatsAppNumber(name, 'Assign agent')
    await expect(integrations.noAgentNotice()).toBeVisible()
    await integrations.assignAgentInDialog(agent.name)

    await expect(integrations.card('WhatsApp')).not.toContainText(integrations.noAgentFor(name))
    const chat = new WhatsAppChat(request, new FakeExternals(request), number, 'Tess')
    await chat.send('Hello?')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Happy to help!'])
  })
})
