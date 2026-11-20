import {
  test, expect, deliverWhatsAppReceipt, connectWhatsAppNumber, digits, expectUnchanged, listChannelAccounts, signUpWhatsAppNumber,
  ApiClient, FakeExternals, IntegrationsPage, AI_REPLY,
} from '@e2e'

// A WhatsApp number can be connected and still unable to send: Meta refused to
// register it at signup, or its WhatsApp Business Account is blocked (a failed
// payment method locked tkt-8's account). Replies are accepted by the API and
// fail later, so without a warning the number looks healthy while every reply
// is lost.
//
// Other tests share the org and its WhatsApp card, so the card is checked for
// this test's number by name.

const PIN_MISMATCH = { error: { message: 'Two step verification PIN Mismatch', type: 'OAuthException', code: 133005, fbtrace_id: 'e2e' } }
const PAYMENT_BLOCKED = 'There is an error with the payment method. This will block business initiated conversations.'
const LOCKED = { code: 131031, title: 'Business account has been locked.' }
// Receipts are applied in the background; one read a second is plenty
const FLAG_POLL = { ...AI_REPLY, intervals: [1_000] }

async function sendProblem(api: ApiClient, accountId: string): Promise<string | null> {
  const account = (await listChannelAccounts(api)).find((a) => a.id === accountId)
  return account?.send_problem ?? null
}

test.describe('a WhatsApp number Meta will not let send', () => {
  test('signup says why when Meta refuses to register it, and signing up again clears it @channels', async ({ adminApi, request, page }) => {
    const externals = new FakeExternals(request)
    const phoneNumberId = digits(15)
    const restore = await externals.fail({ provider: 'graph', action: 'register', contains: phoneNumberId, status: 400, body: PIN_MISMATCH })

    const number = await signUpWhatsAppNumber(adminApi, phoneNumberId)
    expect(number.account.send_problem).toBe('Two step verification PIN Mismatch')

    const integrations = new IntegrationsPage(page)
    const warning = integrations.cannotSendFor(number.account.display_name ?? '')
    await integrations.goto()
    await expect(integrations.card('WhatsApp')).toContainText(warning)
    // The numbers list flags it, and its Manage opens the reason
    await integrations.manage('WhatsApp')
    await expect(integrations.whatsAppNumber(number.account.display_name ?? '')).toContainText("Can't send replies")
    await integrations.manageWhatsAppNumber(number.account.display_name ?? '')
    await expect(integrations.cannotSendPrompt()).toBeVisible()

    // The customer turns off two-step verification in WhatsApp Manager and signs up again
    await restore()
    const again = await signUpWhatsAppNumber(adminApi, phoneNumberId)
    expect(again.account.id).toBe(number.account.id)
    expect(again.account.send_problem).toBeNull()

    await integrations.goto()
    await expect(integrations.card('WhatsApp')).not.toContainText(warning)
  })

  test('signup says why when Meta blocks the number\'s WhatsApp account @channels', async ({ adminApi, request, page }) => {
    const externals = new FakeExternals(request)
    const phoneNumberId = digits(15)
    // Registered fine, but the number's health says the WABA can't send (tkt-8)
    const restore = await externals.respond({ provider: 'graph', action: phoneNumberId, status: 200, body: { health_status: {
      can_send_message: 'BLOCKED',
      entities: [{ entity_type: 'WABA', can_send_message: 'BLOCKED', errors: [{ error_code: 141006, error_description: PAYMENT_BLOCKED }] }],
    } } })

    const number = await signUpWhatsAppNumber(adminApi, phoneNumberId)
    await restore()
    expect(number.account.send_problem).toBe(PAYMENT_BLOCKED)

    const integrations = new IntegrationsPage(page)
    await integrations.goto()
    await expect(integrations.card('WhatsApp')).toContainText(integrations.cannotSendFor(number.account.display_name ?? ''))
  })

  test('a reply Meta fails because the account is locked flags it, and a delivered one clears it @channels', async ({ adminApi, request, page }) => {
    const number = await connectWhatsAppNumber(adminApi)
    expect(number.account.send_problem).toBeNull()

    await deliverWhatsAppReceipt(request, number, 'failed', [LOCKED])
    await expect.poll(() => sendProblem(adminApi, number.account.id), FLAG_POLL).toBe('Business account has been locked.')

    const integrations = new IntegrationsPage(page)
    const warning = integrations.cannotSendFor(number.account.display_name ?? '')
    await integrations.goto()
    await expect(integrations.card('WhatsApp')).toContainText(warning)

    // The customer fixes it with Meta; the next reply is delivered
    await deliverWhatsAppReceipt(request, number, 'delivered')
    await expect.poll(() => sendProblem(adminApi, number.account.id), FLAG_POLL).toBeNull()
    await integrations.goto()
    await expect(integrations.card('WhatsApp')).not.toContainText(warning)
  })

  test('a reply that fails for its own reason does not flag the number @channels', async ({ adminApi, request }) => {
    const number = await connectWhatsAppNumber(adminApi)

    await deliverWhatsAppReceipt(request, number, 'failed', [{ code: 131047, title: 'Re-engagement message' }])

    await expectUnchanged('the number\'s send problem', () => sendProblem(adminApi, number.account.id))
    expect(await sendProblem(adminApi, number.account.id)).toBeNull()
  })
})
