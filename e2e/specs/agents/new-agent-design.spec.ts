import { test, expect, env, unique } from '@e2e'

// From PR 1.8 on, an agent created anywhere (here: the dashboard) starts on the new
// widget design and stays there: its design section offers no Original option.
// Visitors get it wherever this server serves the new design; the classic run's
// stack has it switched off, so its visitors get the original widget.

const SERVED_DESIGN = env.widgetUi

test.describe('a new agent', () => {
  test('starts on the new widget design, with no way back to the original @agents @widget', async ({ makeAgent, agentsPage, customizationPage, makeWidget }) => {
    // With at least one agent, /ai-agents shows the list rather than onboarding.
    await makeAgent()
    await agentsPage.goto()
    const agentId = await agentsPage.createAgent(`New design ${unique('scn')}`)

    await customizationPage.goto(agentId)
    await customizationPage.openSection('Design')
    await expect(customizationPage.widgetDesign('Original')).toHaveCount(0)
    await expect(customizationPage.widgetDesign('New')).toHaveCount(0)
    await customizationPage.showChatPreview()
    await expect(customizationPage.panelPreview).toBeVisible()

    const widget = await makeWidget(agentId)
    await widget.embed()
    await widget.open()
    await expect.poll(() => widget.design()).toBe(SERVED_DESIGN)
  })
})
