import { test, expect, channels, expectUnchanged, AI_REPLY } from '@e2e'

// STOP and START on WhatsApp, where a business can message first (templates). STOP
// opts the number out of the business's messages; the business answers it itself,
// whoever holds the chat, and the AI never sees it. START turns them back on. On
// any other message, or on other channels, "stop" is just a word in a chat.

const STOPPED = "You won't get these messages from us any more. Reply START if you change your mind."
const STARTED = 'Updates are back on. Reply STOP any time to turn them off.'

test('STOP and START on WhatsApp are answered without the AI @channels', async ({ agent, llm, adminApi, request }) => {
  await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
  const channel = await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })
  const chat = channel.chatWith('Tess')

  await chat.send('STOP')
  await expect.poll(() => chat.replies(), AI_REPLY).toEqual([STOPPED])
  await chat.send('start')
  await expect.poll(() => chat.replies(), AI_REPLY).toEqual([STOPPED, STARTED])
  await expectUnchanged('the model', async () => (await llm.requests(agent)).length)
  expect(await llm.requests(agent)).toHaveLength(0)
})

test('a message that only mentions stop reaches the AI as usual @channels', async ({ agent, llm, adminApi, request }) => {
  await llm.script(agent, (s) => s.otherwise().reply('Sorry about that, let me check.'))
  const channel = await channels.WhatsApp({ api: adminApi, request, agentId: agent.id })
  const chat = channel.chatWith('Tess')

  await chat.send('please stop sending me the wrong size')
  await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Sorry about that, let me check.'])
  // START from someone who never said STOP is an ordinary message too
  await chat.send('start')
  await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Sorry about that, let me check.', 'Sorry about that, let me check.'])
})
