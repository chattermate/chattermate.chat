import { test, expect, env, customizeAgent, AI_REPLY } from '@e2e'

// The redesigned widget's "Your conversations": a visitor finds their earlier
// chats, reads one and carries it on; another browser sees none of them.

test.describe('your conversations', () => {
  // eslint-disable-next-line playwright/no-skipped-test -- history is the redesigned widget's
  test.skip(env.widgetUi !== 2, 'Conversation history is the redesigned widget\'s')

  test('a visitor reopens an earlier chat and continues it; another browser sees nothing @widget', async ({ agent, widget, llm, adminApi, makeVisitor }) => {
    await customizeAgent(adminApi, agent.id, { allow_new_chat: true })
    await llm.script(agent, (s) => s
      .when(/Canada/).reply('Yes, we ship to Canada in 5 days.')
      .when(/Continuing/).reply('Picking up from your question about Canada.')
      .otherwise().reply('Happy to help.'))
    await widget.embed()
    await widget.open()
    await widget.send('Do you ship to Canada?')
    await expect(widget.lastAgentMessage()).toHaveText('Yes, we ship to Canada in 5 days.', AI_REPLY)

    await widget.startNewChat()
    await widget.send('What are your opening hours?')
    await expect(widget.lastAgentMessage()).toHaveText('Happy to help.', AI_REPLY)

    await widget.openConversations()
    const list = widget.conversations
    await expect(list).toContainText('2 conversations')
    await list.getByRole('button', { name: /Do you ship to Canada\?/ }).click()
    const past = widget.pastConversation('Do you ship to Canada?')
    await expect(past).toContainText('Yes, we ship to Canada in 5 days.')
    await past.getByRole('button', { name: 'Continue this conversation' }).click()

    await expect(widget.messageLog).toContainText('Continued from "Do you ship to Canada?"', AI_REPLY)
    await widget.send('Continuing that')
    await expect(widget.lastAgentMessage()).toHaveText('Picking up from your question about Canada.', AI_REPLY)

    const stranger = await makeVisitor()
    await stranger.embed()
    await stranger.open()
    await stranger.openConversations()
    await expect(stranger.conversations).toContainText('No conversations yet.')
  })
})
