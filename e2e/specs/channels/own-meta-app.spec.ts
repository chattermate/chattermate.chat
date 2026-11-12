import {
  test, expect, connectMessenger, connectWhatsAppNumber, digits, expectUnchanged, metaVerifiesCallback, ownMetaApp,
  pageChat, pastedCallback, routeToAgent, whereMetaSends, FakeExternals, WhatsAppChat, AI_REPLY,
} from '@e2e'

// A WhatsApp number or Facebook Page connected with credentials from the
// customer's OWN Meta app — the only way to try Meta's free test number. Meta
// signs that app's webhooks with its own secret, so each such account has its
// own webhook address, checked with that secret only (issue #353).
//
// Connected through the API: the org is shared, and once any test has a number
// the Integrations card offers Manage, not Connect. The card itself is covered
// by the dashboard's unit tests.

test.describe('a number or Page from the customer\'s own Meta app', () => {
  test('a WhatsApp number receives messages: its webhooks are pointed at ChatterMate on connect @channels', async ({ agent, llm, adminApi, request }) => {
    await llm.script(agent, (s) => s
      .when(/opening hours/i).reply('We are open 9am to 5pm, Monday to Friday.')
      .otherwise().reply('Happy to help!'))
    const app = ownMetaApp()
    const number = await connectWhatsAppNumber(adminApi, digits(15), app)
    // Meta took the per-number callback, after checking it answers: nothing to paste
    expect(number.account.webhook_auto_configured).toBe(true)
    await routeToAgent(adminApi, number.account.id, agent.id)

    const externals = new FakeExternals(request)
    const chat = new WhatsAppChat(request, externals, number, 'Tess', () => whereMetaSends(externals, number.phoneNumberId, app))
    await chat.send('What are your opening hours?')

    await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['We are open 9am to 5pm, Monday to Friday.'])
  })

  test('a Messenger Page receives messages once its callback URL and verify token are pasted into the app @channels', async ({ agent, llm, adminApi, request }) => {
    await llm.script(agent, (s) => s.otherwise().reply('Hi! How can we help?'))
    const app = ownMetaApp()
    const pageId = digits(15)
    const token = app.token(pageId)
    const account = await connectMessenger(adminApi, pageId, token, app.secret)
    await routeToAgent(adminApi, account.id, agent.id)
    const url = account.webhook_url ?? ''
    const verifyToken = account.webhook_verify_token ?? ''

    // The customer pastes both into their app; Meta checks the address before saving
    expect(await metaVerifiesCallback(request, url, verifyToken)).toBe(true)
    expect(await metaVerifiesCallback(request, url, 'a-guessed-token')).toBe(false)

    const chat = pageChat('Messenger', request, new FakeExternals(request), 'page', pageId, token, 'Remi', pastedCallback(url, app))
    await chat.send('Hello there')

    await expect.poll(() => chat.replies(), AI_REPLY).toEqual(['Hi! How can we help?'])
  })

  test('a wrong app secret is refused when connecting @channels', async ({ adminApi }) => {
    const app = ownMetaApp()
    await expect(connectWhatsAppNumber(adminApi, digits(15), { ...app, secret: 'not-the-app-secret' }))
      .rejects.toThrow(/400: .*That app secret is not the one for the Meta app this token comes from/)
  })

  test('its address takes only its own app\'s accounts, never another app\'s number @channels @security', async ({ agent, llm, adminApi, request }) => {
    await llm.script(agent, (s) => s.otherwise().reply('This should never be sent.'))
    const mine = ownMetaApp()
    const ourNumber = await connectWhatsAppNumber(adminApi, digits(15), mine)
    const theirNumber = await connectWhatsAppNumber(adminApi, digits(15), ownMetaApp())
    await routeToAgent(adminApi, theirNumber.account.id, agent.id)
    const externals = new FakeExternals(request)

    // Signed with our app's secret and sent to our address, but naming their number
    const forged = new WhatsAppChat(request, externals, theirNumber, 'Mallory', () => whereMetaSends(externals, ourNumber.phoneNumberId, mine))
    await forged.send('Hi, I am not who I say I am')

    await expectUnchanged('replies on the other app\'s number', () => forged.replies())
  })

  test('a token from the customer\'s own app is refused without its secret @channels', async ({ adminApi }) => {
    const pageId = digits(15)
    await expect(connectMessenger(adminApi, pageId, ownMetaApp().token(pageId)))
      .rejects.toThrow(/400: .*Enter your Meta app's secret/)
    await expect(connectWhatsAppNumber(adminApi, digits(15), { ...ownMetaApp(), secret: '' }))
      .rejects.toThrow(/400: .*Enter your Meta app's secret/)
  })
})
