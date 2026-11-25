import { test, expect, channels, chatsWithAgent, unique, AI_REPLY } from '@e2e'

// The transfer agent's prompt quotes the conversation, so it is told apart by its own wording.
const HANDOVER_LINE_PROMPT = /communicating the transfer of the chat/

test('a handover tells the customer the busy team has been notified (AGENT_HANDOVER_BUSY_LINE on in .env.e2e) @handover', async ({ makeAgent, handoverTeam, llm, adminApi, request }) => {
  const { groupId } = await handoverTeam()
  const agent = await makeAgent({ transferToHuman: true }, [groupId])
  const busyLine = 'All our team members are busy right now, but your request is important to us. I\'ve already notified them, and someone will be with you as soon as possible.'
  await llm.script(agent, (s) => s
    .when(HANDOVER_LINE_PROMPT).reply(busyLine)
    .otherwise().handOver('This text is replaced by the handover line.'))

  const chat = (await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })).chatWith(unique('Nora'))
  await chat.send('I was attacked at my condo last night')
  await expect.poll(() => chat.replies(), AI_REPLY).toEqual([busyLine])

  const [conversation] = await chatsWithAgent(adminApi, agent.id)
  expect(conversation).toMatchObject({ status: 'transferred', group_id: groupId })

  const handoverPrompt = (await llm.requests(agent)).find((r) => HANDOVER_LINE_PROMPT.test(r.lastUser))?.lastUser ?? ''
  expect(handoverPrompt).toContain('all our team members are busy right now')
  expect(handoverPrompt).toContain('you have already notified the team')
})
