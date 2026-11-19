import {
  test, expect, connectWhatsAppNumber, expectUnchanged, listChannelAccounts, routeToAgent,
  ApiClient, FakeExternals, IntegrationsPage, WhatsAppChat, AI_REPLY,
} from '@e2e'

// When Meta stops accepting a number's access token (an expired temporary
// token, a revoked system user), every reply fails until someone reconnects
// the number. The account is flagged so the Integrations card can say so,
// rather than replies failing with nothing on screen.
//
// Other tests share the org and its WhatsApp card, so the card is checked for
// this test's number by name, never for the absence of any warning at all.

const TOKEN_REFUSED = { error: { message: 'Error validating access token: Session has expired', type: 'OAuthException', code: 190, fbtrace_id: 'e2e' } }
// Each read lists every account in the shared org; once a second is plenty
const FLAG_POLL = { ...AI_REPLY, intervals: [1_000] }
const WINDOW_CLOSED = { error: { message: 'Re-engagement message', type: 'OAuthException', code: 131047, fbtrace_id: 'e2e' } }

async function needsReconnect(api: ApiClient, accountId: string): Promise<boolean> {
  const account = (await listChannelAccounts(api)).find((a) => a.id === accountId)
  return account?.needs_reconnect ?? false
}

test.describe('a WhatsApp number whose token Meta refuses', () => {
  test('is flagged, the Integrations card names it, and reconnecting clears it @channels', async ({ agent, llm, adminApi, request, page }) => {
    await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
    const number = await connectWhatsAppNumber(adminApi)
    await routeToAgent(adminApi, number.account.id, agent.id)
    const externals = new FakeExternals(request)
    const chat = new WhatsAppChat(request, externals, number, 'Tess')

    const restore = await externals.fail({ provider: 'graph', action: 'messages', contains: chat.waId, status: 401, body: TOKEN_REFUSED })
    await chat.send('Hello?')
    await expect.poll(() => needsReconnect(adminApi, number.account.id), FLAG_POLL).toBe(true)
    expect(await chat.replies()).toEqual([])

    const integrations = new IntegrationsPage(page)
    const warning = integrations.expiredAccessFor(number.account.display_name ?? '')
    await integrations.goto()
    await expect(integrations.card('WhatsApp')).toContainText(warning)
    // Other numbers are connected too; the numbers list leads to this one's fix
    await integrations.manage('WhatsApp')
    await expect(integrations.whatsAppNumber(number.account.display_name ?? '')).toContainText('Access expired')
    await integrations.manageWhatsAppNumber(number.account.display_name ?? '', 'Reconnect')
    await expect(integrations.reconnectPrompt()).toBeVisible()

    // The customer swaps in a working token: same number, connected again
    await restore()
    const reconnected = await connectWhatsAppNumber(adminApi, number.phoneNumberId)
    expect(reconnected.account.id).toBe(number.account.id)
    expect(reconnected.account.needs_reconnect).toBe(false)

    await integrations.goto()
    await expect(integrations.card('WhatsApp')).not.toContainText(warning)
    // Replies now go out with the new token
    const afterReconnect = new WhatsAppChat(request, externals, reconnected, 'Tess')
    await afterReconnect.send('Are you there now?')
    await expect.poll(() => afterReconnect.replies(), AI_REPLY).toEqual(['Happy to help!'])
  })

  test('is healthy again as soon as a reply goes through @channels', async ({ agent, llm, adminApi, request }) => {
    await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
    const number = await connectWhatsAppNumber(adminApi)
    await routeToAgent(adminApi, number.account.id, agent.id)
    const externals = new FakeExternals(request)
    const chat = new WhatsAppChat(request, externals, number, 'Tess')

    // Meta refuses the token once, then accepts it (it was refreshed on Meta's side)
    await externals.fail({ provider: 'graph', action: 'messages', contains: chat.waId, status: 401, body: TOKEN_REFUSED, times: 1 })
    await chat.send('Hello?')
    await expect.poll(() => needsReconnect(adminApi, number.account.id), FLAG_POLL).toBe(true)

    await chat.send('Hello again?')
    await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Happy to help!'])
    expect(await needsReconnect(adminApi, number.account.id)).toBe(false)
  })

  test('is not flagged when Meta refuses one message for its own reason @channels', async ({ agent, llm, adminApi, request }) => {
    await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))
    const number = await connectWhatsAppNumber(adminApi)
    await routeToAgent(adminApi, number.account.id, agent.id)
    const externals = new FakeExternals(request)
    const chat = new WhatsAppChat(request, externals, number, 'Tess')

    // A closed 24-hour window refuses the message, not the token
    const restore = await externals.fail({ provider: 'graph', action: 'messages', contains: chat.waId, status: 400, body: WINDOW_CLOSED })
    await chat.send('Hello?')
    const refused = async () => (await externals.calls('graph', 'messages', { contains: chat.waId }))
      .filter((c) => c.status === 400).length
    await expect.poll(refused, AI_REPLY).toBeGreaterThan(0)

    await expectUnchanged('the number\'s reconnect flag', () => needsReconnect(adminApi, number.account.id))
    expect(await needsReconnect(adminApi, number.account.id)).toBe(false)
    await restore()
  })
})
