import {
  test, expect, expectUnchanged, AgentsPage, AI_REPLY, channels, chatMessages, chatsWithAgent, setAgentOnline, TEAM_WILL_REPLY, unique,
} from '@e2e'

// The agent header's Online/Offline switch. Offline means the AI stops
// answering: every chat waits for the team, including ones already open.

test.describe('an agent set Offline', () => {
  test('stops answering an open website chat, which waits in the inbox, and answers again once back Online @agents', async ({ agent, widget, adminApi, llm, page }) => {
    await llm.script(agent, (s) => s
      .when(/back/i).reply('Yes, I am back.')
      .otherwise().reply('Happy to help!'))
    await widget.embed()
    await widget.open()
    await widget.send('Hello')
    await expect(widget.lastAgentMessage()).toHaveText('Happy to help!', AI_REPLY)

    const agents = new AgentsPage(page)
    await agents.openAgent(agent.id)
    await agents.setOnline(false)
    await expect(agents.onlineSwitch).not.toBeChecked()

    const modelCalls = (await llm.requests(agent)).length
    await widget.send('Anyone there?')
    // The message waits for the team: the chat is open, nobody holds it, and
    // the inbox shows it as waiting rather than with the AI
    await expect.poll(async () => {
      const [chat] = await chatsWithAgent(adminApi, agent.id)
      return (await chatMessages(adminApi, chat.session_id)).map((m) => m.message)
    }, AI_REPLY).toContain('Anyone there?')
    const [chat] = await chatsWithAgent(adminApi, agent.id)
    expect(chat).toMatchObject({ status: 'open', user_id: null, agent: { ai_replies_enabled: false } })
    // The chat was already open with the AI: Offline still keeps the model out of it
    await expectUnchanged('model calls while Offline', async () => (await llm.requests(agent)).length)
    expect(await llm.requests(agent)).toHaveLength(modelCalls)

    await agents.openAgent(agent.id)
    await agents.setOnline(true)
    await widget.send('Are you back?')
    await expect(widget.lastAgentMessage()).toHaveText('Yes, I am back.', AI_REPLY)
  })

  test('leaves a channel message for the team: one acknowledgement, no AI reply @agents @channels', async ({ agent, llm, adminApi, request }) => {
    await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
    await setAgentOnline(adminApi, agent.id, false)

    const chat = (await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })).chatWith(unique('Nora'))
    await chat.send('Hello?')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual([TEAM_WILL_REPLY])
    await chat.send('Still there?')
    await expectUnchanged('replies while Offline', () => chat.replies())

    const [conversation] = await chatsWithAgent(adminApi, agent.id)
    expect(conversation).toMatchObject({ status: 'open', user_id: null })
    expect(await llm.requests(agent)).toHaveLength(0)
  })
})
