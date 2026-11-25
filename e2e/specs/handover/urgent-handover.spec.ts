import { test, expect, channels, chatsWithAgent, unique, AI_REPLY } from '@e2e'

// The transfer agent's prompt quotes the conversation, so it is told apart by its own wording.
const HANDOVER_LINE_PROMPT = /communicating the transfer of the chat/

test.describe('urgent handover (AGENT_URGENT_HANDOVER_RULES on in .env.e2e)', () => {
  test('a customer reporting an assault hears the agent\'s safety line before the handover, and the chat waits for the team @handover', async ({ makeAgent, handoverTeam, llm, adminApi, request }) => {
    const { groupId } = await handoverTeam()
    const agent = await makeAgent({ transferToHuman: true }, [groupId])
    await llm.script(agent, (s) => s
      .when(HANDOVER_LINE_PROMPT).reply('A teammate will take it from here.')
      .when(/attacked|police/i).reply('I\'m so sorry. If you are in danger now, contact local emergency services.', {
        transfer_to_human: true,
        transfer_reason: 'HIGH_PRIORITY_ISSUE',
        transfer_description: 'Customer reports an assault',
      })
      .otherwise().reply('How can I help?'))

    const chat = (await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })).chatWith(unique('Nora'))
    await chat.send('I was attacked at my condo last night')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual([
      'I\'m so sorry. If you are in danger now, contact local emergency services.\n\nA teammate will take it from here.',
    ])

    const [conversation] = await chatsWithAgent(adminApi, agent.id)
    expect(conversation).toMatchObject({ status: 'transferred', group_id: groupId })

    const system = ((await llm.requests(agent)).find((r) => /attacked/.test(r.lastUser) && r.responseFormat)?.system ?? '').replace(/\s+/g, ' ')
    expect(system).toContain('**Hand over now:**')
    expect(system).toContain('Don\'t ask for the same detail in two replies in a row')
  })

  test('any other handover still shows only the handover line @handover', async ({ makeAgent, handoverTeam, llm, adminApi, request }) => {
    const { groupId } = await handoverTeam()
    const agent = await makeAgent({ transferToHuman: true }, [groupId])
    await llm.script(agent, (s) => s
      .when(HANDOVER_LINE_PROMPT).reply('A teammate will take it from here.')
      .otherwise().handOver('This text is replaced by the handover line.'))

    const chat = (await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })).chatWith(unique('Omar'))
    await chat.send('Can I talk to someone?')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['A teammate will take it from here.'])
  })

  test('an agent that cannot hand over is never told to, and is told where to send someone in danger @handover', async ({ agent, llm, widget }) => {
    await llm.script(agent, (s) => s.otherwise().reply('How can I help?'))

    await widget.embed()
    await widget.open()
    await widget.send('Hello')
    await expect(widget.lastAgentMessage()).toHaveText('How can I help?', AI_REPLY)

    const system = ((await llm.requests(agent)).at(-1)?.system ?? '').replace(/\s+/g, ' ')
    expect(system).toContain('**Urgent situations:**')
    expect(system).toContain('local emergency services')
    expect(system).not.toContain('**Hand over now:**')
  })
})
