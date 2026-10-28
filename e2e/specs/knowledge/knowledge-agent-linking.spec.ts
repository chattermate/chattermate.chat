import { test, expect, addKnowledgeText, unique, AI_REPLY, NO_AGENT, type FakeLlm, type TestAgent, type ChatWidget } from '@e2e'

// Agents answer only from sources linked to them. These journeys keep a source
// from silently reaching no agent: the org has several agents throughout (each
// test makes a second one), so nothing is linked unless someone links it.

async function askAboutShipping(llm: FakeLlm, agent: TestAgent, widget: ChatWidget): Promise<string> {
  await llm.script(agent, (s) => s
    .when(/ship/i).callTool('search_knowledge_base', { query: 'shipping times' })
    .thenReply('We ship within two days.')
    .otherwise().reply('Happy to help!'))
  await widget.embed()
  await widget.open()
  await widget.send('How long does shipping take?')
  await expect(widget.lastAgentMessage()).toHaveText('We ship within two days.', AI_REPLY)
  return (await llm.requests(agent)).flatMap((r) => r.toolResults).join('\n')
}

const shippingSource = () => {
  const code = unique('SHIP')
  return { code, title: `Shipping ${code}`, content: `Orders ship within two days. Tracking reference ${code}.` }
}

test.describe('which agent a knowledge source reaches', () => {
  test('an agent with no knowledge says so, and answers once a source is linked from that warning @knowledge', async ({ agent, makeAgent, widget, llm, adminApi, org, knowledgePage }) => {
    await makeAgent()
    const source = shippingSource()
    await addKnowledgeText(adminApi, { orgId: org.orgId, title: source.title, content: source.content })

    await knowledgePage.gotoAgent(agent.id)
    await expect(knowledgePage.noKnowledgeWarning).toContainText('can only give general answers')

    await knowledgePage.linkFromWarning(source.title)
    await expect(knowledgePage.noKnowledgeWarning).toBeHidden()
    await expect(knowledgePage.source(source.title)).toBeVisible()

    expect(await askAboutShipping(llm, agent, widget)).toContain(source.code)
  })

  test('a source added on the Knowledge page answers for the agent picked for it @knowledge', async ({ agent, makeAgent, widget, llm, knowledgePage }) => {
    await makeAgent()
    const source = shippingSource()

    await knowledgePage.goto()
    await knowledgePage.addText({ title: source.title, content: source.content, agent: agent.name })
    await expect(knowledgePage.source(source.title)).toBeVisible()
    await expect(knowledgePage.unlinkedTag(source.title)).toBeHidden()

    await knowledgePage.gotoAgent(agent.id)
    await expect(knowledgePage.source(source.title)).toBeVisible()
    await expect(knowledgePage.noKnowledgeWarning).toBeHidden()

    expect(await askAboutShipping(llm, agent, widget)).toContain(source.code)
  })

  test('a source added for no agent is tagged as such and reaches no agent @knowledge', async ({ agent, makeAgent, widget, llm, knowledgePage }) => {
    await makeAgent()
    const source = shippingSource()

    await knowledgePage.goto()
    await knowledgePage.addText({ title: source.title, content: source.content, agent: NO_AGENT })
    await expect(knowledgePage.unlinkedTag(source.title)).toBeVisible()

    await knowledgePage.gotoAgent(agent.id)
    await expect(knowledgePage.noKnowledgeWarning).toBeVisible()

    expect(await askAboutShipping(llm, agent, widget)).not.toContain(source.code)
  })
})
