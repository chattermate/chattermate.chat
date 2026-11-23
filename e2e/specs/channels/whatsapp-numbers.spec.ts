import { test, expect, connectWhatsAppNumber, listChannelAccounts, routeToAgent, IntegrationsPage } from '@e2e'

// A workspace can connect several WhatsApp numbers, each answered by its own
// agent. The WhatsApp card's Manage lists them: one number is managed or
// disconnected on its own, and Add number opens a blank connect form. Community
// installs have no plan limit (the enterprise suite covers the plan caps).
//
// Other tests share the org and its WhatsApp card, so rows are found by this
// test's number names, never by position or count.

test.describe('several WhatsApp numbers', () => {
  test('are listed with their agents, managed and disconnected one at a time @channels', async ({ agent, adminApi, page }) => {
    const sales = await connectWhatsAppNumber(adminApi)
    const support = await connectWhatsAppNumber(adminApi)
    await routeToAgent(adminApi, sales.account.id, agent.id)
    const salesName = sales.account.display_name ?? ''
    const supportName = support.account.display_name ?? ''

    const integrations = new IntegrationsPage(page)
    await integrations.goto()
    await integrations.manage('WhatsApp')

    await expect(integrations.whatsAppNumber(salesName)).toContainText(`Answered by ${agent.name}`)
    await expect(integrations.whatsAppNumber(supportName)).toContainText("No agent: messages aren't answered.")
    await expect(integrations.whatsAppNumbersUsage()).toHaveText(/^\d+ numbers connected$/)

    // Managing one number opens its own form, with its agent chosen
    await integrations.manageWhatsAppNumber(salesName)
    await expect(integrations.whatsAppConnectForm()).toContainText(salesName)
    await expect(integrations.whatsAppConnectForm().getByLabel('AI agent')).toHaveValue(agent.id)
    await integrations.closeWhatsAppConnectForm()

    // Disconnecting one leaves the other connected
    await integrations.manage('WhatsApp')
    await integrations.disconnectWhatsAppNumber(supportName)
    await expect(integrations.whatsAppNumber(salesName)).toBeVisible()
    const ids = (await listChannelAccounts(adminApi)).map((a) => a.id)
    expect(ids).toContain(sales.account.id)
    expect(ids).not.toContain(support.account.id)
  })

  test('Add number opens a blank connect form, and a second number connects beside the first @channels', async ({ adminApi, page }) => {
    const first = await connectWhatsAppNumber(adminApi)
    const integrations = new IntegrationsPage(page)
    await integrations.goto()
    await integrations.manage('WhatsApp')

    await expect(integrations.addWhatsAppNumberButton()).toBeEnabled()
    await integrations.addWhatsAppNumber()
    await expect(integrations.whatsAppNumbers()).toHaveCount(0)
    await expect(integrations.whatsAppConnectForm()).toBeVisible()
    // A new number has no agent to choose until it is connected
    await expect(integrations.whatsAppConnectForm().getByLabel('AI agent')).toHaveCount(0)

    const second = await connectWhatsAppNumber(adminApi)
    expect(second.account.id).not.toBe(first.account.id)
    const whatsapp = (await listChannelAccounts(adminApi)).filter((a) => a.channel_type === 'whatsapp').map((a) => a.id)
    expect(whatsapp).toEqual(expect.arrayContaining([first.account.id, second.account.id]))
  })
})
