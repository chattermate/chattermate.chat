import { test, expect, channels, expectUnchanged, unique, AgentsPage, AI_REPLY, HANDOVER_NOTICE } from '@e2e'

// The inbox side is the same for every channel, and a human's reply leaves through
// the same adapter call as the AI's (covered per channel in replies.spec), so one
// channel is enough here.
test.describe('human handover on a channel', () => {
  test.use({ agentSettings: { transferToHuman: true } })

  test('a WhatsApp customer asks for a person, the teammate\'s reply reaches them on WhatsApp, and the AI stays out of it @channels @handover', async ({ agent, llm, adminApi, request, inbox }) => {
    await llm.script(agent, (s) => s
      .when(/human|person/i).handOver('Let me connect you with a teammate.')
      .otherwise().reply('Happy to help!'))

    const customer = unique('Wanda')
    const chat = (await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })).chatWith(customer)
    await chat.send('I want to talk to a person')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Let me connect you with a teammate.'])

    await inbox.goto()
    await inbox.openConversationWith(customer)
    await expect(inbox.lastCustomerMessage()).toContainText('I want to talk to a person')
    await inbox.takeOver()
    await inbox.reply('Hi, this is Sam. How can I help?')
    // The takeover itself tells the customer a person has joined.
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual([
      'Let me connect you with a teammate.',
      HANDOVER_NOTICE,
      'Hi, this is Sam. How can I help?',
    ])

    const modelCalls = (await llm.requests(agent)).length
    await chat.send('My parcel never arrived')
    await expect(inbox.lastCustomerMessage()).toContainText('My parcel never arrived')
    await expectUnchanged('WhatsApp replies after takeover', () => chat.replies())
    expect((await llm.requests(agent))).toHaveLength(modelCalls)
  })

  // Teams who introduce themselves word the message themselves on the Agent tab, or switch it off
  for (const { name, write, notice } of [
    { name: 'in the agent\'s own words', write: (agents: AgentsPage) => agents.setHandoverMessage('Hi, this is the Thailiving team.'), notice: ['Hi, this is the Thailiving team.'] },
    { name: 'not at all when switched off', write: (agents: AgentsPage) => agents.setHandoverMessageOn(false), notice: [] },
  ]) {
    test(`a takeover tells the channel customer a teammate joined ${name} @channels @handover`, async ({ agent, llm, adminApi, request, inbox, page }) => {
      const agents = new AgentsPage(page)
      await agents.openAgent(agent.id)
      // On, with the default as the hint until written
      await expect(agents.handoverMessageSwitch).toBeChecked()
      await expect(agents.handoverMessage).toHaveAttribute('placeholder', HANDOVER_NOTICE)
      await write(agents)

      await llm.script(agent, (s) => s
        .when(/human|person/i).handOver('Let me connect you with a teammate.')
        .otherwise().reply('Happy to help!'))

      const customer = unique('Jesper')
      const chat = (await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })).chatWith(customer)
      await chat.send('I want to talk to a person')
      await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Let me connect you with a teammate.'])

      await inbox.goto()
      await inbox.openConversationWith(customer)
      await inbox.takeOver()
      await inbox.reply('Hi, this is Tiger. How can I help?')
      await expect.poll(() => chat.replies(), AI_REPLY).toEqual([
        'Let me connect you with a teammate.',
        ...notice,
        'Hi, this is Tiger. How can I help?',
      ])
    })
  }
})
