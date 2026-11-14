import { test, expect, channels, unique, AI_REPLY } from '@e2e'

// A person's reply changes for the customer where the platform lets a sent
// message change (Telegram here; Slack the same way). Where it can't
// (WhatsApp, Messenger, Instagram, SMS, email) the inbox offers no Edit.
test.describe('editing a reply on a channel', () => {
  test.use({ agentSettings: { transferToHuman: true } })

  test('on Telegram the edit changes the message the customer has @channels @inbox', async ({ agent, llm, adminApi, request, inbox }) => {
    await llm.script(agent, (s) => s
      .when(/human|person/i).handOver('Let me connect you with a teammate.')
      .otherwise().reply('Happy to help!'))
    const customer = unique('Tilda')
    const chat = (await channels.Telegram({ api: adminApi, request, agentId: agent.id })).chatWith(customer)
    await chat.send('I want to talk to a person')
    await expect.poll(() => chat.replies(), AI_REPLY).toContain('Let me connect you with a teammate.')

    await inbox.goto()
    await inbox.openConversationWith(customer)
    await inbox.takeOver()
    await inbox.reply('Your parcel ships on Monday.')
    await expect.poll(() => chat.replies(), AI_REPLY).toContain('Your parcel ships on Monday.')

    await inbox.editReply('Your parcel ships on Monday.', 'Your parcel ships on Tuesday.')

    await expect.poll(() => chat.currentReplies()).toContain('Your parcel ships on Tuesday.')
    expect(await chat.currentReplies()).not.toContain('Your parcel ships on Monday.')
  })

  test("on WhatsApp, which can't change a sent message, there is no Edit @channels @inbox", async ({ agent, llm, adminApi, request, inbox }) => {
    await llm.script(agent, (s) => s
      .when(/human|person/i).handOver('Let me connect you with a teammate.')
      .otherwise().reply('Happy to help!'))
    const customer = unique('Wanda')
    const chat = (await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })).chatWith(customer)
    await chat.send('I want to talk to a person')
    await expect.poll(() => chat.replies(), AI_REPLY).toContain('Let me connect you with a teammate.')

    await inbox.goto()
    await inbox.openConversationWith(customer)
    await inbox.takeOver()
    await inbox.reply('Your parcel ships on Monday.')
    await expect(inbox.agentMessage('Your parcel ships on Monday.')).toBeVisible()
    await expect(inbox.editButton('Your parcel ships on Monday.')).toHaveCount(0)
  })
})
