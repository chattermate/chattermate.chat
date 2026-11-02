import { test, expect, declareAction, leftEdges, listActions, overflowRight } from '@e2e'

// The agent editor's Actions tab: declaring, editing, turning off and deleting
// the actions a site's code supplies.
test.describe('Actions tab', () => {
  test('declare an action, fix what the form refuses, then turn it off and delete it @actions @smoke', async ({ agent, adminApi, actionsTab }) => {
    await actionsTab.open(agent.id)
    await expect(actionsTab.content).toContainText('No actions yet')

    await actionsTab.newActionButton.click()
    await actionsTab.fill({ name: 'Open Page', parameters: '{ not json' })
    await expect(actionsTab.editor).toContainText('Use lowercase letters, digits and underscores, starting with a letter.')
    await expect(actionsTab.editor).toContainText('Arguments must be valid JSON.')
    await expect(actionsTab.saveButton).toBeDisabled()

    await actionsTab.fill({
      name: 'open_page',
      label: 'Open a page',
      description: 'Opens a page of the app for the user.',
      parameters: '{ "type": "object", "properties": { "path": { "type": "string" } } }',
      confirm: 'always',
    })
    await actionsTab.saveButton.click()
    await expect(actionsTab.page.getByText('Saved open_page')).toBeVisible()
    await expect(actionsTab.row('open_page')).toContainText('Always asks')
    await expect(actionsTab.row('open_page')).toContainText('Not registered')
    // Once saved, the form shows what the model is told.
    await expect(actionsTab.editor).toContainText('open_page: Opens a page of the app for the user.')

    await actionsTab.onSwitch('open_page').click()
    await expect.poll(async () => (await listActions(adminApi, agent.id))[0].enabled).toBe(false)

    await actionsTab.remove('open_page')
    await expect(actionsTab.content).toContainText('No actions yet')
    expect(await listActions(adminApi, agent.id)).toHaveLength(0)
  })

  test('a name already taken is refused by the server, and the form stays open @actions', async ({ agent, adminApi, actionsTab }) => {
    await declareAction(adminApi, agent.id, 'open_page')
    await actionsTab.open(agent.id)

    await actionsTab.newActionButton.click()
    await actionsTab.fill({ name: 'open_page', label: 'Again', description: 'Same name.' })
    await actionsTab.saveButton.click()
    await expect(actionsTab.page.getByText("This agent already has an action named 'open_page'")).toBeVisible()
    await expect(actionsTab.editor).toBeVisible()
    await expect(actionsTab.table.getByRole('row')).toHaveCount(2)
  })

  test('the list keeps its switches and delete buttons beside the open form @actions', async ({ agent, adminApi, actionsTab }) => {
    await declareAction(adminApi, agent.id, 'open_page')
    await declareAction(adminApi, agent.id, 'send_invoice')
    await actionsTab.open(agent.id)

    await actionsTab.row('send_invoice').click()
    await expect(actionsTab.editor).toContainText('send_invoice')
    for (const name of ['open_page', 'send_invoice']) {
      await expect(actionsTab.onSwitch(name)).toBeInViewport()
      await expect(actionsTab.deleteButton(name)).toBeInViewport()
    }
    expect(await overflowRight(actionsTab.table)).toBe(0)
  })

  test('the tab lines up with the agent header and fits a phone @actions', async ({ agent, adminApi, actionsTab }) => {
    await declareAction(adminApi, agent.id, 'open_page')
    await actionsTab.open(agent.id)
    const [content, header] = await leftEdges(actionsTab.heading, actionsTab.headerStart)
    expect(Math.abs(content - header)).toBeLessThanOrEqual(8)

    await actionsTab.page.setViewportSize({ width: 375, height: 812 })
    await expect(actionsTab.onSwitch('open_page')).toBeVisible()
    expect(await overflowRight(actionsTab.content)).toBe(0)
  })
})
