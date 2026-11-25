import { test, expect, channels, chatsWithAgent, unique, AI_REPLY } from '@e2e'

// The transfer agent's prompt quotes the conversation, so it is told apart by its own wording.
const HANDOVER_LINE_PROMPT = /communicating the transfer of the chat/

test.describe('urgent handover (AGENT_URGENT_HANDOVER_RULES on in .env.e2e)', () => {
  test('a customer reporting an assault is handed over on that message, and told the busy team has been notified @handover', async ({ makeAgent, handoverTeam, llm, adminApi, request }) => {
    const { groupId } = await handoverTeam()
    const agent = await makeAgent({ transferToHuman: true }, [groupId])
    const busyLine = 'All our team members are busy right now, but your request is important to us. I\'ve already notified them, and someone will be with you as soon as possible.'
    await llm.script(agent, (s) => s
      .when(HANDOVER_LINE_PROMPT).reply(busyLine)
      .when(/attacked|police/i).reply('I\'m so sorry this happened.', {
        transfer_to_human: true,
        transfer_reason: 'HIGH_PRIORITY_ISSUE',
        transfer_description: 'Customer reports an assault',
      })
      .otherwise().reply('How can I help?'))

    const chat = (await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })).chatWith(unique('Nora'))
    await chat.send('I was attacked at my condo last night')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual([busyLine])

    const [conversation] = await chatsWithAgent(adminApi, agent.id)
    expect(conversation).toMatchObject({ status: 'transferred', group_id: groupId })

    const requests = await llm.requests(agent)
    const system = (requests.find((r) => /attacked/.test(r.lastUser) && r.responseFormat)?.system ?? '').replace(/\s+/g, ' ')
    expect(system).toContain('**Hand over now:**')
    expect(system).toContain('Don\'t ask for the same detail in two replies in a row')
    expect(system).not.toContain('emergency services')

    const handoverPrompt = requests.find((r) => HANDOVER_LINE_PROMPT.test(r.lastUser))?.lastUser ?? ''
    expect(handoverPrompt).toContain('all our team members are busy right now')
    expect(handoverPrompt).toContain('you have already notified the team')
  })

  test('an agent that cannot hand over is never told to @handover', async ({ agent, llm, widget }) => {
    await llm.script(agent, (s) => s.otherwise().reply('How can I help?'))

    await widget.embed()
    await widget.open()
    await widget.send('Hello')
    await expect(widget.lastAgentMessage()).toHaveText('How can I help?', AI_REPLY)

    const system = ((await llm.requests(agent)).at(-1)?.system ?? '').replace(/\s+/g, ' ')
    expect(system).toContain('**Urgent situations:**')
    expect(system).not.toContain('**Hand over now:**')
    expect(system).not.toContain('emergency services')
  })
})
