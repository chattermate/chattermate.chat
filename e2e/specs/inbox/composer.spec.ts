import { test, expect, askForAPerson } from '@e2e'

const LONG_REPLY = Array.from({ length: 30 }, (_, i) =>
  i === 0 ? 'Here is everything about your refund:' : `Step ${i}: we checked this part of the order for you.`,
).join('\n')

test.describe('inbox composer size', () => {
  test.use({ agentSettings: { transferToHuman: true } })

  test('a long pasted reply grows the box, dragging its edge makes it taller, and the reply still sends @inbox', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm)
    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    await inbox.takeOver()

    const empty = await inbox.replyBoxHeight()
    await inbox.pasteReply(LONG_REPLY)
    await expect.poll(() => inbox.replyBoxHeight()).toBeGreaterThan(empty + 100)
    const grown = await inbox.replyBoxHeight()

    await inbox.dragComposerTaller(120)
    await expect.poll(() => inbox.replyBoxHeight()).toBeGreaterThan(grown + 80)
    const dragged = await inbox.replyBoxHeight()

    await inbox.sendTyped()
    await expect(widget.lastAgentMessage()).toContainText('Here is everything about your refund:')
    await expect(widget.lastAgentMessage()).toContainText('Step 29: we checked this part of the order for you.')

    // The dragged height is the agent's: the next reply opens at it
    await inbox.page.reload()
    await expect(inbox.messageInput).toBeEditable()
    await expect.poll(() => inbox.replyBoxHeight()).toBeGreaterThan(dragged - 10)
  })

  test('on a phone the box only grows: there is no handle to drag @inbox', async ({ agent, widget, inbox, llm }) => {
    await inbox.usePhoneWidth()
    await askForAPerson(agent, widget, llm)
    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    await inbox.takeOver()

    const empty = await inbox.replyBoxHeight()
    await inbox.pasteReply(LONG_REPLY)
    await expect.poll(() => inbox.replyBoxHeight()).toBeGreaterThan(empty + 100)
    await expect(inbox.composerResizeHandle).toBeHidden()
  })
})
