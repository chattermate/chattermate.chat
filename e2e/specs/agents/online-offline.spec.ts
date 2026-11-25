import {
  test, expect, expectUnchanged, AgentsPage, AI_REPLY, channels, chatMessages, chatsWithAgent, OFFLINE_REPLY, setAgentOnline, unique,
} from '@e2e'

// The agent header's Online/Offline switch. Offline means the AI stops
// answering: every chat waits for the team, including ones already open, and
// the customer is told once that nobody is in right now.

test.describe('an agent set Offline', () => {
  test('tells an open website chat it is offline, once, and answers again once back Online @agents', async ({ agent, widget, adminApi, llm, page }) => {
    await llm.script(agent, (s) => s
      .when(/back/i).reply('Yes, I am back.')
      .otherwise().reply('Happy to help!'))
    await widget.embed()
    await widget.open()
    await widget.send('Hello')
    await expect(widget.lastAgentMessage()).toHaveText('Happy to help!', AI_REPLY)
    await expect(widget.headerStatus).toHaveText('Replies instantly')

    const agents = new AgentsPage(page)
    await agents.openAgent(agent.id)
    await agents.setOnline(false)
    await expect(agents.onlineSwitch).not.toBeChecked()
    // The open widget hears it: no reload
    await expect(widget.headerStatus).toHaveText("Offline · we'll reply when we're back")

    const modelCalls = (await llm.requests(agent)).length
    const ratable = await widget.helpfulButtons.count()
    await widget.send('Anyone there?')
    await expect(widget.lastAgentMessage()).toHaveText(OFFLINE_REPLY, AI_REPLY)
    // A canned line: nothing to rate
    await expect(widget.helpfulButtons).toHaveCount(ratable)
    // We have no email for this visitor: it is asked for, so the reply reaches them
    await widget.leaveEmail()
    // The chat waits for the team: open, nobody holds it, not with the AI
    const [chat] = await chatsWithAgent(adminApi, agent.id)
    expect(chat).toMatchObject({ status: 'open', user_id: null, agent: { ai_replies_enabled: false } })

    // Said once per conversation
    await widget.send('Hello?')
    await expect.poll(async () => (await chatMessages(adminApi, chat.session_id)).map((m) => m.message), AI_REPLY)
      .toContain('Hello?')
    await expectUnchanged('agent replies while Offline', () => widget.agentMessages.count())
    expect((await chatMessages(adminApi, chat.session_id)).filter((m) => m.message === OFFLINE_REPLY)).toHaveLength(1)
    // The chat was already open with the AI: Offline still keeps the model out of it
    expect(await llm.requests(agent)).toHaveLength(modelCalls)

    await agents.openAgent(agent.id)
    await agents.setOnline(true)
    await expect(widget.headerStatus).toHaveText('Replies instantly')
    await widget.send('Are you back?')
    await expect(widget.lastAgentMessage()).toHaveText('Yes, I am back.', AI_REPLY)
  })

  test('tells a channel customer once that it is offline, with no AI reply @agents @channels', async ({ agent, llm, adminApi, request }) => {
    await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
    await setAgentOnline(adminApi, agent.id, false)

    const chat = (await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })).chatWith(unique('Nora'))
    await chat.send('Hello?')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual([OFFLINE_REPLY])
    await chat.send('Still there?')
    await expectUnchanged('replies while Offline', () => chat.replies())

    const [conversation] = await chatsWithAgent(adminApi, agent.id)
    expect(conversation).toMatchObject({ status: 'open', user_id: null })
    expect(await llm.requests(agent)).toHaveLength(0)
  })

  test('asks no email after the offline message when the agent says not to @agents', async ({ agent, adminApi, widget, page }) => {
    const agents = new AgentsPage(page)
    await agents.openAgent(agent.id)
    await agents.setOfflineAskEmail(false)
    await setAgentOnline(adminApi, agent.id, false)

    await widget.embed()
    await widget.open()
    await widget.send('Hello?')
    await expect(widget.lastAgentMessage()).toHaveText(OFFLINE_REPLY, AI_REPLY)
    await expectUnchanged('the email form', () => widget.offlineEmailForm.count())
    await expect(widget.offlineEmailForm).toHaveCount(0)
  })

  test("sends the agent's own offline message, written in its settings @agents @channels", async ({ agent, adminApi, request, page }) => {
    const agents = new AgentsPage(page)
    await agents.openAgent(agent.id)
    // Empty until written: the default shows as the hint
    await expect(agents.offlineMessage).toHaveValue('')
    await expect(agents.offlineMessage).toHaveAttribute('placeholder', OFFLINE_REPLY)
    await agents.setOfflineMessage('Closed for the holidays. Back on Monday!')
    await agents.setOnline(false)

    const chat = (await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })).chatWith(unique('Ola'))
    await chat.send('Hi')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Closed for the holidays. Back on Monday!'])
  })
})
