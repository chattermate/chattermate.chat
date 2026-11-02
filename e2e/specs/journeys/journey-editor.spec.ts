import { test, expect, createJourney, declareAction, leftEdges, listJourneys, overflowRight, type JourneyStep } from '@e2e'

// The agent editor's Journeys tab: building a journey from a template, the
// editor's checks and preview, leaving with unsaved changes, and the layout.
const STEP: JourneyStep = { id: 'only', title: 'Open billing', message: 'Open billing.', done_when: [{ kind: 'event', value: 'billing_opened' }] }

test.describe('Journeys editor', () => {
  test('build a journey from a template: preview, an action chip and an action as done, then put it live @journeys @smoke', async ({ agent, adminApi, journeysTab }) => {
    await declareAction(adminApi, agent.id, 'open_page')
    await journeysTab.open(agent.id)
    await journeysTab.addFromTemplate('SaaS onboarding')
    await expect(journeysTab.steps).toHaveCount(4)

    // The preview fills in the sample context.
    await expect(journeysTab.preview).toContainText("Hi Maya, I'll help you get set up.")
    await journeysTab.sampleContext.fill('{ "first_name": "Lee" }')
    await expect(journeysTab.preview).toContainText("Hi Lee, I'll help you get set up.")

    // "Action succeeds" picks a declared action, and switching kind drops the event typed for the old one.
    const doneWhen = journeysTab.conditions('Done when')
    await doneWhen.getByRole('combobox', { name: 'Kind' }).selectOption('action')
    await expect(doneWhen.getByRole('combobox', { name: 'Action' })).toHaveValue('')
    await expect(journeysTab.problems).toContainText('Fill in every condition.')
    await expect(journeysTab.saveButton).toBeDisabled()
    // The step stays on screen while it has a problem to fix.
    await expect(journeysTab.stepTitle).toBeVisible()
    await doneWhen.getByRole('combobox', { name: 'Action' }).selectOption('open_page')
    await expect(journeysTab.problems).toBeHidden()

    // A chip that runs an action allows it on the step.
    await journeysTab.addChip('Open it for me', { action: 'open_page' })
    await expect(journeysTab.allowedAction('open_page')).toBeChecked()
    await expect(journeysTab.preview).toContainText('Open it for me')

    await journeysTab.save()
    const [saved] = await listJourneys(adminApi, agent.id)
    const first = saved.definition.steps[0]
    expect(first.done_when).toEqual([expect.objectContaining({ kind: 'action', value: 'open_page' })])
    expect(first.allowed_actions).toEqual(['open_page'])
    expect(first.chips).toContainEqual({ label: 'Open it for me', kind: 'action', value: 'open_page' })

    await journeysTab.backButton.click()
    await expect(journeysTab.row('SaaS onboarding')).toContainText('Draft')
    await journeysTab.statusSwitch('SaaS onboarding').click()
    await expect(journeysTab.row('SaaS onboarding')).toContainText('Live')
    await expect.poll(async () => (await listJourneys(adminApi, agent.id))[0].status).toBe('live')
  })

  test('leaving with unsaved changes asks first, and leaving keeps the saved journey @journeys', async ({ agent, adminApi, journeysTab }) => {
    await createJourney(adminApi, agent.id, { key: 'billing', name: 'Billing', steps: [STEP] })
    await journeysTab.open(agent.id)
    await journeysTab.edit('Billing')

    // Unchanged: straight back to the list.
    await journeysTab.backButton.click()
    await expect(journeysTab.row('Billing')).toBeVisible()

    await journeysTab.edit('Billing')
    for (let i = 0; i < 5; i++) await journeysTab.addStep()
    await expect(journeysTab.longJourneyWarning).toContainText('This journey has 6 steps.')
    await expect(journeysTab.unsaved).toBeVisible()

    await journeysTab.backButton.click()
    await journeysTab.leaveDialog.getByRole('button', { name: 'Keep editing' }).click()
    await expect(journeysTab.leaveDialog).toBeHidden()
    await expect(journeysTab.steps).toHaveCount(6)

    await journeysTab.backButton.click()
    await journeysTab.leaveDialog.getByRole('button', { name: 'Leave' }).click()
    await expect(journeysTab.row('Billing')).toContainText('1')
    expect((await listJourneys(adminApi, agent.id))[0].definition.steps).toHaveLength(1)
  })

  test('the editor blocks what it can tell is wrong, and shows what the server refuses @journeys', async ({ agent, adminApi, journeysTab }) => {
    await createJourney(adminApi, agent.id, { key: 'billing', name: 'Billing', steps: [STEP] })
    await journeysTab.open(agent.id)
    await journeysTab.newJourney()

    await journeysTab.stepTitle.fill('')
    await expect(journeysTab.problems).toContainText('Give the step a title.')
    await expect(journeysTab.saveButton).toBeDisabled()
    await expect(journeysTab.stepMessage).toBeVisible()
    await journeysTab.stepTitle.fill('Say hello')

    await journeysTab.nameInput.fill('Billing again')
    await journeysTab.keyInput.fill('billing')
    await journeysTab.saveButton.click()
    await expect(journeysTab.page.getByText("This agent already has a journey with the key 'billing'")).toBeVisible()
    // Still unsaved: nothing about the refusal looks saved.
    await expect(journeysTab.unsaved).toBeVisible()
    expect(await listJourneys(adminApi, agent.id)).toHaveLength(1)

    await journeysTab.keyInput.fill('billing_again')
    await journeysTab.save()
    expect(await listJourneys(adminApi, agent.id)).toHaveLength(2)
  })

  test('the tab lines up with the agent header, and the editor fits a phone @journeys', async ({ agent, adminApi, journeysTab }) => {
    await createJourney(adminApi, agent.id, { key: 'billing', name: 'Billing', steps: [STEP] })
    await journeysTab.open(agent.id)
    const [content, header] = await leftEdges(journeysTab.heading, journeysTab.headerStart)
    expect(Math.abs(content - header)).toBeLessThanOrEqual(8)

    await journeysTab.page.setViewportSize({ width: 375, height: 812 })
    await journeysTab.edit('Billing')
    expect(await overflowRight(journeysTab.content)).toBe(0)
  })
})
