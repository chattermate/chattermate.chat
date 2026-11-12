import { test, expect, declareAction, env, setAllowedDomains, AI_REPLY } from '@e2e'

// The customer site's app code registers open_page, send_invoice, set_currency,
// slow_open and fail_task; each test declares the ones it uses on its own agent.
const siteHost = new URL(env.customerSiteUrl).host

test.describe('In-app actions', () => {
  test.beforeEach(async ({ adminApi, widget }) => {
    // Actions only run on a site the widget is limited to.
    await setAllowedDomains(adminApi, widget.widgetId, [siteHost])
  })

  test('the agent runs an action in the site, then answers from its result @actions @smoke', async ({ agent, widget, llm, adminApi }) => {
    await declareAction(adminApi, agent.id, 'open_page')
    await llm.script(agent, (s) => s
      .when(/billing/i).callTool('open_page', { path: '/billing' }).thenReply('I opened your billing page.')
      .otherwise().reply('Happy to help!'))

    await widget.embed({ withActions: true })
    await widget.open()
    await widget.send('Take me to billing')

    await expect(widget.appStatus).toHaveText('Opened /billing')
    await expect(widget.lastAgentMessage()).toHaveText('I opened your billing page.', AI_REPLY)
    const requests = await llm.requests(agent)
    // The result reached the model fenced as data, and the visitor's words came with it.
    const resumed = requests.at(-1)!
    expect(resumed.toolResults.join('\n')).toContain('UNTRUSTED APP ACTION RESULT')
    expect(resumed.toolResults.join('\n')).toContain('"path": "/billing"')
    expect(resumed.lastUser).toBe('Take me to billing')
  })

  test('an always-ask action shows what the site will do, waits for the visitor, and a no stops it @actions', async ({ agent, widget, llm, adminApi }) => {
    await declareAction(adminApi, agent.id, 'send_invoice')
    await llm.script(agent, (s) => s
      .when(/invoice/i).callTool('send_invoice', { to: 'ada@example.com' }).thenReply('Okay, I did not send it.')
      .otherwise().reply('Happy to help!'))

    await widget.embed({ withActions: true })
    await widget.open()
    await widget.send('Send the invoice to Ada')

    // The site says which invoice goes where, in its own words.
    const card = widget.actionConfirm('Send an invoice')
    await expect(card).toContainText('INV-7')
    await expect(card).toContainText('ada@example.com')
    await widget.declineAction('Send an invoice')

    await expect(widget.lastAgentMessage()).toHaveText('Okay, I did not send it.', AI_REPLY)
    await expect(widget.appActionRuns).toHaveText('0')
    expect((await llm.requests(agent)).at(-1)!.toolResults.join('\n')).toContain('The user declined this action')
  })

  test('an approved action runs once @actions', async ({ agent, widget, llm, adminApi }) => {
    await declareAction(adminApi, agent.id, 'send_invoice')
    await llm.script(agent, (s) => s
      .when(/invoice/i).callTool('send_invoice', { to: 'ada@example.com' }).thenReply('Sent.')
      .otherwise().reply('Happy to help!'))

    await widget.embed({ withActions: true })
    await widget.open()
    await widget.send('Send the invoice to Ada')
    await widget.approveAction('Send an invoice')

    await expect(widget.lastAgentMessage()).toHaveText('Sent.', AI_REPLY)
    await expect(widget.appStatus).toHaveText('Sent invoice to ada@example.com')
    await expect(widget.appActionRuns).toHaveText('1')
  })

  test('an action that would overwrite shows what changes, and keeping it leaves it @actions', async ({ agent, widget, llm, adminApi }) => {
    await declareAction(adminApi, agent.id, 'set_currency')
    await llm.script(agent, (s) => s
      .when(/currency/i).callTool('set_currency', { code: 'GBP' }).thenReply('Kept your currency.')
      .otherwise().reply('Happy to help!'))

    await widget.embed({ withActions: true })
    await widget.open()
    await widget.send('Change my currency to pounds')

    const card = widget.actionConfirm('Set default currency')
    await expect(card).toContainText('USD')
    await expect(card).toContainText('GBP')
    await expect(card.getByRole('button', { name: 'Change to GBP' })).toBeVisible()
    await widget.declineAction('Set default currency', 'Keep USD')

    await expect(widget.actionReceipt('Kept USD')).toBeVisible()
    await expect(widget.lastAgentMessage()).toHaveText('Kept your currency.', AI_REPLY)
    await expect(widget.appCurrency).toHaveText('USD')
  })

  test('arguments that break the action\'s schema never reach the site @actions', async ({ agent, widget, llm, adminApi }) => {
    await declareAction(adminApi, agent.id, 'set_currency', { confirm: 'never' })
    await llm.script(agent, (s) => s
      .when(/currency/i).callTool('set_currency', { code: 42 }).thenReply('I could not change it.')
      .otherwise().reply('Happy to help!'))

    await widget.embed({ withActions: true })
    await widget.open()
    await widget.send('Change my currency')

    await expect(widget.lastAgentMessage()).toHaveText('I could not change it.', AI_REPLY)
    await expect(widget.appActionRuns).toHaveText('0')
    await expect(widget.appCurrency).toHaveText('USD')
    // The model is told what to fix, not that the site failed.
    expect((await llm.requests(agent)).at(-1)!.toolResults.join('\n')).toContain("don't match this action's schema")
  })

  test('two actions in a row each run, in order @actions', async ({ agent, widget, llm, adminApi }) => {
    await declareAction(adminApi, agent.id, 'open_page')
    await declareAction(adminApi, agent.id, 'set_currency', { confirm: 'never' })
    await llm.script(agent, (s) => s
      .when(/set up/i).callTools([
        { name: 'set_currency', arguments: { code: 'EUR' } },
        { name: 'open_page', arguments: { path: '/invoices/new' } },
      ]).thenReply('Done: euros, and your first invoice is open.')
      .otherwise().reply('Happy to help!'))

    await widget.embed({ withActions: true })
    await widget.open()
    await widget.send('Set up my first invoice in euros')

    await expect(widget.lastAgentMessage()).toHaveText('Done: euros, and your first invoice is open.', AI_REPLY)
    await expect(widget.appCurrency).toHaveText('EUR')
    await expect(widget.appStatus).toHaveText('Opened /invoices/new')
    await expect(widget.appActionRuns).toHaveText('2')
  })

  test('a failing action is reported to the agent @actions', async ({ agent, widget, llm, adminApi }) => {
    await declareAction(adminApi, agent.id, 'fail_task')
    await llm.script(agent, (s) => s
      .when(/task/i).callTool('fail_task', {}).thenReply('That did not work, sorry.')
      .otherwise().reply('Happy to help!'))

    await widget.embed({ withActions: true })
    await widget.open()
    await widget.send('Do the task')

    await expect(widget.lastAgentMessage()).toHaveText('That did not work, sorry.', AI_REPLY)
    expect((await llm.requests(agent)).at(-1)!.toolResults.join('\n')).toContain('No permission for that')
  })

  test('a dropped connection mid-action still runs it exactly once @actions', async ({ agent, widget, llm, adminApi }) => {
    await declareAction(adminApi, agent.id, 'slow_open')
    await llm.script(agent, (s) => s
      .when(/billing/i).callTool('slow_open', { path: '/billing' }).thenReply('Billing is open.')
      .otherwise().reply('Happy to help!'))
    const connection = await widget.watchConnection()

    await widget.embed({ withActions: true })
    await widget.open()
    await widget.send('Open billing')
    await expect(widget.appStatus).toHaveText('Working')
    await connection.drop()

    await expect(widget.lastAgentMessage()).toHaveText('Billing is open.', AI_REPLY)
    await expect(widget.appActionRuns).toHaveText('1')
  })
})

test.describe('In-app actions are withheld', () => {
  test('on a widget not limited to the site, the agent is offered no actions @actions @security', async ({ agent, widget, llm, adminApi }) => {
    await declareAction(adminApi, agent.id, 'open_page')
    await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))

    await widget.embed({ withActions: true })
    await widget.open()
    await widget.send('Take me to billing')

    await expect(widget.lastAgentMessage()).toHaveText('Happy to help!', AI_REPLY)
    expect((await llm.requests(agent)).at(-1)!.tools).not.toContain('open_page')
  })

  test('an action the agent has turned off is not offered @actions', async ({ agent, widget, llm, adminApi }) => {
    await setAllowedDomains(adminApi, widget.widgetId, [siteHost])
    await declareAction(adminApi, agent.id, 'open_page', { enabled: false })
    await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))

    await widget.embed({ withActions: true })
    await widget.open()
    await widget.send('Take me to billing')

    await expect(widget.lastAgentMessage()).toHaveText('Happy to help!', AI_REPLY)
    expect((await llm.requests(agent)).at(-1)!.tools).not.toContain('open_page')
  })
})
