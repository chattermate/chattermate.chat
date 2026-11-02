import { test, expect, createJourney, declareAction, env, setAllowedDomains, AI_REPLY, type JourneyStep } from '@e2e'

// A three-step guide: one step finishes on an app event, one on an action chip
// (the site's open_page), one on another event.
const siteHost = new URL(env.customerSiteUrl).host

const STEPS: JourneyStep[] = [
  {
    id: 'billing',
    title: 'Open billing',
    message: 'Welcome! Start by opening your billing settings.',
    done_when: [{ kind: 'event', value: 'billing_opened' }],
  },
  {
    id: 'page',
    title: 'Open the invoices page',
    message: 'Now let me open your invoices for you.',
    chips: [{ label: 'Open it for me', kind: 'action', value: 'open_page' }],
    allowed_actions: ['open_page'],
    done_when: [{ kind: 'action', value: 'open_page' }],
  },
  {
    id: 'send',
    title: 'Send an invoice',
    message: 'Last one: send your first invoice.',
    done_when: [{ kind: 'event', value: 'invoice_sent' }],
  },
]

test.describe('Journeys', () => {
  test.beforeEach(async ({ adminApi, widget }) => {
    // Actions (and so action chips) only run on a site the widget is limited to.
    await setAllowedDomains(adminApi, widget.widgetId, [siteHost])
  })

  test('a journey walks the visitor through the app, step by step @journeys @smoke', async ({ agent, widget, adminApi, llm }) => {
    await declareAction(adminApi, agent.id, 'open_page')
    await createJourney(adminApi, agent.id, {
      key: 'first_invoice', name: 'First invoice', steps: STEPS, autoOpen: true, finish: "You're all set!",
    })

    // Opens by itself on the first step.
    await widget.embed({ withActions: true })
    await expect(widget.journeyProgress).toContainText('Step 1 of 3 · Open billing')
    await expect(widget.agentMessages.last()).toHaveText('Welcome! Start by opening your billing settings.')

    await widget.siteReports('billing_opened')
    await expect(widget.journeyProgress).toContainText('Step 2 of 3')
    await expect(widget.agentMessages.last()).toHaveText('Now let me open your invoices for you.')

    // The chip runs the site's action without asking the model.
    await widget.replyChip('Open it for me').click()
    await expect(widget.appActionRuns).toHaveText('1')
    await expect(widget.journeyProgress).toContainText('Step 3 of 3 · Send an invoice')

    await widget.siteReports('invoice_sent')
    await expect(widget.journeyProgress).toBeHidden()
    await expect(widget.lastAgentMessage()).toHaveText("You're all set!")
    expect(await llm.requests(agent)).toHaveLength(0)
  })

  test('a reply to a step is answered by the agent, and the step stays until it is done @journeys', async ({ agent, widget, adminApi, llm }) => {
    await createJourney(adminApi, agent.id, { key: 'billing', name: 'Billing', steps: STEPS.slice(0, 1), autoOpen: true })
    await llm.script(agent, (s) => s.otherwise().reply('Billing is under Settings.'))

    await widget.embed()
    await expect(widget.journeyProgress).toContainText('Step 1 of 1')
    await widget.send('Where is that?')

    await expect(widget.lastAgentMessage()).toHaveText('Billing is under Settings.', AI_REPLY)
    // The step's message joined the conversation once, and the model saw what was answered.
    await expect(widget.agentMessages.filter({ hasText: 'Start by opening your billing settings.' })).toHaveCount(1)
    expect((await llm.requests(agent)).at(-1)!.system).toContain('Start by opening your billing settings.')
    await expect(widget.journeyProgress).toContainText('Step 1 of 1')
  })

  test("the agent is told which actions finish the user's step, without losing the others @journeys", async ({ agent, widget, adminApi, llm }) => {
    await declareAction(adminApi, agent.id, 'open_page')
    await declareAction(adminApi, agent.id, 'send_invoice')
    await createJourney(adminApi, agent.id, { key: 'invoices', name: 'Invoices', steps: STEPS.slice(1, 2), autoOpen: true })
    await llm.script(agent, (s) => s.otherwise().reply('I can open it for you.'))

    await widget.embed({ withActions: true })
    await expect(widget.journeyProgress).toContainText('Step 1 of 1')
    await widget.send('How do I get there?')
    await expect(widget.lastAgentMessage()).toHaveText('I can open it for you.', AI_REPLY)

    const request = (await llm.requests(agent)).at(-1)!
    expect(request.system).toContain('These actions finish it: open_page (Go to a page).')
    expect(request.system).not.toContain('send_invoice (')
    // A suggestion, not a limit: the agent still has every action the page offers.
    expect(request.tools).toEqual(expect.arrayContaining(['open_page', 'send_invoice']))
  })

  test('the visitor can skip a step or hide the guide @journeys', async ({ agent, widget, adminApi }) => {
    await createJourney(adminApi, agent.id, { key: 'skippable', name: 'Skippable', steps: STEPS, autoOpen: true })

    await widget.embed({ withActions: true })
    await expect(widget.journeyProgress).toContainText('Step 1 of 3')
    await widget.skipJourneyStep()
    await expect(widget.journeyProgress).toContainText('Step 2 of 3')

    await widget.hideJourney()
    await expect(widget.journeyProgress).toBeHidden()
    // Gone for this visitor, not just until the next page.
    await widget.page.reload()
    await widget.open()
    await expect(widget.journeyProgress).toBeHidden()
  })

  test('the funnel shows how far visitors got, who is stuck, and opens a step @journeys', async ({ agent, widget, adminApi, agentsPage, journeysTab }) => {
    await createJourney(adminApi, agent.id, { key: 'funnel', name: 'Funnel journey', steps: STEPS, autoOpen: true })

    await widget.embed({ withActions: true })
    await expect(widget.journeyProgress).toContainText('Step 1 of 3')
    await widget.siteReports('billing_opened')
    await expect(widget.journeyProgress).toContainText('Step 2 of 3')

    await agentsPage.openJourneyFunnel(agent.id, 'Funnel journey')
    await expect(agentsPage.funnelStep('Open billing')).toHaveAccessibleName('1 of 1 done')
    await expect(agentsPage.funnelStep('Open the invoices page')).toHaveAccessibleName('0 of 1 done')
    await expect(agentsPage.funnelStep('Send an invoice')).toHaveAccessibleName('0 of 0 done')
    await expect(journeysTab.kpi('Started')).toContainText('1')
    await expect(journeysTab.kpi('Finished all steps')).toContainText('0')

    await journeysTab.showStuck('Open the invoices page')
    await expect(journeysTab.stuckUsers).toContainText('Users on this step · 1')
    await journeysTab.openStepFromFunnel('Open the invoices page')
  })
})
