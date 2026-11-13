import { test, expect, storeOriginalDesignChoice, unique } from '@e2e'

// The original widget is gone: every agent's visitors get the new panel, new agents
// and agents that once chose the original alike, and the Design section has no
// choice to make. The dashboard preview is the panel too.

const SAMPLE_QUESTION = 'Do you offer free returns?'

test.describe('the widget design', () => {
  test('an agent that chose the original widget gets the new panel, in the preview and on the site @agents @widget', async ({ agent, customizationPage, makeWidget }) => {
    storeOriginalDesignChoice(agent.id)
    await customizationPage.goto(agent.id)
    await customizationPage.openSection('Design')
    await expect(customizationPage.widgetDesignChoice).toHaveCount(0)
    await customizationPage.showChatPreview()
    await expect(customizationPage.panelPreview.getByText(SAMPLE_QUESTION)).toBeVisible()

    const widget = await makeWidget(agent.id)
    await widget.embed()
    await widget.open()
    await expect.poll(() => widget.design()).toBe(2)
  })

  test('a new agent gets the new panel @agents @widget', async ({ makeAgent, agentsPage, customizationPage, makeWidget }) => {
    // With at least one agent, /ai-agents shows the list rather than onboarding.
    await makeAgent()
    await agentsPage.goto()
    const agentId = await agentsPage.createAgent(`New design ${unique('scn')}`)

    await customizationPage.goto(agentId)
    await customizationPage.showChatPreview()
    await expect(customizationPage.panelPreview).toBeVisible()

    const widget = await makeWidget(agentId)
    await widget.embed()
    await widget.open()
    await expect.poll(() => widget.design()).toBe(2)
  })
})
