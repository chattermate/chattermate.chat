import { test, expect, AI_REPLY } from '@e2e'

test.describe('reply buttons in the website chat', () => {
  test.use({ agentSettings: { channelQuickReplies: true } })

  test('the AI offers buttons, a tap answers with it and they go at once @widget', async ({ agent, widget, llm }) => {
    await llm.script(agent, (s) => s
      .when(/track my order/i).reply('Your order ships tomorrow.')
      .otherwise().reply('What can I help you with?', { quick_replies: ['Track my order', 'Returns'] }))

    await widget.embed()
    await widget.open()
    await widget.send('Hi')
    await expect(widget.replyChip('Track my order')).toBeVisible(AI_REPLY)
    await expect(widget.replyChip('Returns')).toBeVisible()

    await widget.replyChip('Track my order').click()
    // Gone with the tap, not when the answer lands
    await expect(widget.replyChip('Returns')).toHaveCount(0)
    await expect(widget.customerMessages.last()).toHaveText('Track my order')
    await expect(widget.lastAgentMessage()).toHaveText('Your order ships tomorrow.', AI_REPLY)
    await expect(widget.replyChip('Returns')).toHaveCount(0)
  })
})

test.describe('reply buttons switched off', () => {
  test('the AI is never offered buttons, so a reply carries none @widget', async ({ agent, widget, llm }) => {
    await llm.script(agent, (s) => s.otherwise().reply('What can I help you with?', { quick_replies: ['Track my order'] }))

    await widget.embed()
    await widget.open()
    await widget.send('Hi')
    await expect(widget.lastAgentMessage()).toHaveText('What can I help you with?', AI_REPLY)
    await expect(widget.replyChip('Track my order')).toHaveCount(0)
  })
})
