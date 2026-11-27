import { test, expect, channels, unique, AI_REPLY } from '@e2e'

// Messenger and LINE webhooks carry only an id. The team should still see who
// they are talking to: the platform's profile where it shares one, the name
// the customer gave the AI, or a name a teammate types in.

test('a LINE customer shows by their LINE display name @channels', async ({ agent, llm, adminApi, request, adminInbox }) => {
  await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
  const channel = await channels.LINE({ api: adminApi, request, agentId: agent.id })
  const name = unique('Somchai Prasert')
  const chat = channel.chatWith('Somchai', { profileName: name })
  await chat.send('Hello, I need a visa lawyer')
  await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Happy to help!'])

  await adminInbox.goto()
  await adminInbox.openConversationWith(name)
})

test('a Messenger customer is named from the Page conversation when Meta withholds their profile @channels', async ({ agent, llm, adminApi, request, adminInbox }) => {
  await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
  const channel = await channels.Messenger({ api: adminApi, request, agentId: agent.id })
  const name = unique('Nok Suwan')
  const chat = channel.chatWith('Nok', { profileName: name })
  await chat.send('Hi, do you handle company registration?')
  await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Happy to help!'])

  await adminInbox.goto()
  await adminInbox.openConversationWith(name)
})

test('a teammate names a customer from the inbox, and People shows it @channels @inbox', async ({ agent, llm, adminApi, request, adminInbox, peoplePage }) => {
  await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
  const channel = await channels.LINE({ api: adminApi, request, agentId: agent.id })
  // Not a friend of the account: LINE shares no name
  const chat = channel.chatWith('Pim')
  await chat.send('Hello')
  await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Happy to help!'])

  await adminInbox.goto()
  await adminInbox.openConversationWith(chat.unnamedLabel!)
  const name = unique('Pim Chaiyaporn')
  await adminInbox.renameCustomer(name)
  await expect(adminInbox.threadTitle(name)).toBeVisible()
  // The list is still searched for the old label; the new name finds the chat
  await adminInbox.search(name)
  await expect(adminInbox.conversation(name)).toBeVisible()

  // Known by name only (no email or phone yet), so People lists them under Anonymous
  await peoplePage.goto()
  await peoplePage.showAnonymous()
  await peoplePage.search(name)
  await expect(peoplePage.person(name)).toBeVisible()
})

test('a LINE contact first known only by id is named on a later message @channels', async ({ agent, llm, adminApi, request, adminInbox }) => {
  await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
  const channel = await channels.LINE({ api: adminApi, request, agentId: agent.id })
  // Not a friend yet: LINE shares no name, so the first message leaves a placeholder
  const chat = channel.chatWith('Mali')
  await chat.send('Hello')
  await expect.poll(() => chat.replies(), AI_REPLY).toHaveLength(1)

  const name = unique('Mali Srisuk')
  await chat.sharesProfileAs(name)
  await chat.send('Are you there?')
  await expect.poll(() => chat.replies(), AI_REPLY).toHaveLength(2)

  // One conversation, now under the real name
  await adminInbox.goto()
  await adminInbox.openConversationWith(name)
  await expect(adminInbox.lastCustomerMessage()).toContainText('Are you there?')
})

test('a name a teammate gave is kept when the customer writes again, in the same chat @channels @inbox', async ({ agent, llm, adminApi, request, adminInbox }) => {
  await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
  const channel = await channels.LINE({ api: adminApi, request, agentId: agent.id })
  const profileName = unique('Tong')
  const chat = channel.chatWith('Tong', { profileName })
  await chat.send('Hello')
  await expect.poll(() => chat.replies(), AI_REPLY).toHaveLength(1)

  await adminInbox.goto()
  await adminInbox.openConversationWith(profileName)
  const name = unique('Tong Wattana')
  await adminInbox.renameCustomer(name)

  await chat.send('One more question')
  await expect.poll(() => chat.replies(), AI_REPLY).toHaveLength(2)

  // The platform's name doesn't replace the teammate's, and the message joins the same chat
  await adminInbox.openConversationWith(name)
  await expect(adminInbox.lastCustomerMessage()).toContainText('One more question')
})

test.describe('with lead capture', () => {
  test.use({ agentSettings: { leadCapture: true } })

  test('a name the customer gives the AI replaces the placeholder, even before an email @channels @leads', async ({ agent, llm, adminApi, request, adminInbox }) => {
    const name = unique('Arthit Wong')
    await llm.script(agent, (s) => s
      .when(/Arthit/).captureLead('Thanks Arthit! What is your email?', { name })
      .otherwise().reply('Happy to help — may I have your name?'))
    const channel = await channels.LINE({ api: adminApi, request, agentId: agent.id })
    const chat = channel.chatWith('Arthit')
    await chat.send('I need help with a contract')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Happy to help — may I have your name?'])
    await chat.send(`I am ${name}`)
    await expect.poll(() => chat.replies(), AI_REPLY).toContain('Thanks Arthit! What is your email?')

    await adminInbox.goto()
    await adminInbox.openConversationWith(name)
  })
})
