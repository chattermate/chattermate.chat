import { test, expect, createJourney, createWidgetApp, issueConversationToken, unique, type JourneyStep } from '@e2e'

// Users a site's app signs in (an identity token from its server) are its own
// customers: People lists them on a tab of their own, not among captured leads.
const STEPS: JourneyStep[] = [
  { id: 'billing', title: 'Open billing', message: 'Start by opening billing.', done_when: [{ kind: 'event', value: 'billing_opened' }] },
  { id: 'send', title: 'Send an invoice', message: 'Now send an invoice.', done_when: [{ kind: 'event', value: 'invoice_sent' }] },
]

test.describe('Signed-in users in People', () => {
  test('a signed-in user who followed a journey shows on the Signed in tab with how far they got @leads @journeys', async ({ agent, widget, adminApi, peoplePage }) => {
    const { apiKey } = await createWidgetApp(adminApi, unique('Billing app'))
    await createJourney(adminApi, agent.id, { key: 'billing', name: 'Billing tour', steps: STEPS, autoOpen: true })

    // They never type: the journey alone is their activity.
    await widget.embed({ token: await issueConversationToken(adminApi, apiKey, widget.widgetId, widget.customer) })
    await expect(widget.journeyProgress).toContainText('Open billing')
    await widget.siteReports('billing_opened')
    await expect(widget.journeyProgress).toContainText('Send an invoice')

    await peoplePage.goto()
    await peoplePage.search(widget.customer.email)
    await expect(peoplePage.page.getByText('No people match this filter.')).toBeVisible()

    await peoplePage.showSignedIn()
    await peoplePage.search(widget.customer.email)
    await peoplePage.person(widget.customer.email).click()
    const journey = peoplePage.journey('Billing tour')
    await expect(journey).toContainText('In progress')
    await expect(journey.getByRole('listitem').filter({ hasText: 'Open billing' })).toContainText('done')
    await expect(journey.getByRole('listitem').filter({ hasText: 'Send an invoice' })).toContainText('on this step')
  })
})
