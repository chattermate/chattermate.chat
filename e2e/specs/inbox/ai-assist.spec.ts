import { test, expect, askForAPerson, scenarioMarker, type ChatWidget, type TestAgent } from '@e2e'

const IMPROVED = 'Thanks for waiting! Your refund is on its way.'
const SUMMARY = '- Asked whether we ship to Norway\n- Waiting for an answer from the team'
const ANSWER = 'Yes, we ship to Norway. Delivery takes 5 to 7 working days and costs 9 euros.'
const DRAFT = { question: 'Do you ship to Norway?', answer: 'Yes. Delivery to Norway takes 5 to 7 working days and costs 9 euros.' }

/**
 * The customer asks after the handover. Their message carries the agent's
 * scenario marker: the inbox's AI calls send the conversation, so this is how
 * the fake model finds this test's script for them.
 */
async function askAboutNorway(agent: TestAgent, widget: ChatWidget): Promise<void> {
  await widget.send(`${scenarioMarker(agent.scenarioId)} Do you ship to Norway?`)
}

test.describe('inbox AI assist', () => {
  test.use({ agentSettings: { transferToHuman: true } })

  test('Improve rewrites a draft and Undo restores it; Refresh brings the summary up to date @inbox', async ({ agent, widget, inbox, llm }) => {
    await askForAPerson(agent, widget, llm, (s) => s
      .when(/Rewrite the DRAFT/).reply(IMPROVED)
      .when(/Brief the teammate/).reply(SUMMARY))
    await askAboutNorway(agent, widget)

    await inbox.goto('/conversations?view=waiting')
    await inbox.openConversationWith(widget.customer.name)
    await inbox.takeOver()

    await inbox.messageInput.fill('thanks for wating, refund is on way')
    await inbox.improveReply('Fix spelling and grammar')
    await expect(inbox.messageInput).toHaveValue(IMPROVED)
    await inbox.undoImprove()
    await expect(inbox.messageInput).toHaveValue('thanks for wating, refund is on way')

    await inbox.refreshSummary()
    await expect(inbox.handoverSummary).toContainText('Asked whether we ship to Norway')
  })

  test("a team answer worth keeping opens the help center editor, without the customer's details @inbox", async ({ agent, widget, adminInbox, faqPage, llm }) => {
    await askForAPerson(agent, widget, llm, (s) => s
      .when(/holds an answer for the help center/).reply(JSON.stringify({ ready: true, reason: 'A shipping answer', ...DRAFT })))
    await askAboutNorway(agent, widget)

    await adminInbox.goto('/conversations?view=waiting')
    await adminInbox.openConversationWith(widget.customer.name)
    await adminInbox.takeOver()
    await adminInbox.reply(ANSWER)
    await adminInbox.addAnswerToKnowledge()

    await expect(faqPage.question).toHaveValue(DRAFT.question)
    await expect(faqPage.answer).toHaveValue(DRAFT.answer)
  })

  test("an answer that only promises to check isn't offered to the help center @inbox", async ({ agent, widget, adminInbox, llm }) => {
    await askForAPerson(agent, widget, llm, (s) => s
      .when(/holds an answer for the help center/).reply(JSON.stringify({ ready: false, reason: 'The teammate only promised to check.', question: '', answer: '' })))
    await askAboutNorway(agent, widget)

    await adminInbox.goto('/conversations?view=waiting')
    await adminInbox.openConversationWith(widget.customer.name)
    await adminInbox.takeOver()
    await adminInbox.reply("Let me look into shipping to Norway and get back to you shortly.")
    await adminInbox.addAnswerToKnowledge()

    await expect(adminInbox.toast('Not ready for the help center yet. The teammate only promised to check.')).toBeVisible()
    await expect(adminInbox.page).toHaveURL(/\/conversations/)
  })
})
