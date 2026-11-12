import { test, expect, FakeCrawl, KnowledgePage, unique, AI_REPLY, KNOWLEDGE_INDEXED } from '@e2e'

// A website is learned page by page: each page can be answered from as soon as
// it is stored, while the rest of the site is still read.

test.describe('a website still being read', () => {
  test('is listed once, marked as still crawling with its pages so far, and answered from already @knowledge', async ({ page, agent, widget, llm, adminApi, org }) => {
    const code = unique('MUG')
    const site = `https://${code.toLowerCase()}.example`
    const crawl = FakeCrawl.start(adminApi, { orgId: org.orgId, agentId: agent.id, site })
    await crawl.storePages(4, `Every mug ships with the care code ${code}.`)

    const knowledge = new KnowledgePage(page)
    await knowledge.gotoAgent(agent.id)
    await expect(knowledge.source(site)).toHaveCount(1)
    await expect(knowledge.crawlingTag(site)).toBeVisible()
    await expect(knowledge.sourceSummary(site)).toHaveText('Crawling · 4\u00a0pages')

    await llm.script(agent, (s) => s
      .when(/mug/i).callTool('search_knowledge_base', { query: 'mug care code' }).thenReply('Here is what I know.')
      .otherwise().reply('Happy to help!'))
    await widget.embed()
    await widget.open()
    await widget.send('How do I look after my mug?')
    await expect(widget.lastAgentMessage()).toHaveText('Here is what I know.', AI_REPLY)
    expect((await llm.requests(agent)).flatMap((r) => r.toolResults).join('\n')).toContain(code)

    crawl.finish()
    await expect(knowledge.crawlingTag(site)).toHaveCount(0, KNOWLEDGE_INDEXED)
    await expect(knowledge.source(site)).toHaveCount(1)
    await expect(knowledge.sourceSummary(site)).toHaveText(/sub-pages$/)
  })
})
