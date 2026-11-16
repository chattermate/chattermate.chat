import { test, expect, env, NO_COOKIES, seedOrg, seedUsers, signInCookies, agentSocketOverWebSocket, agentSocketOverPolling } from '@e2e'

// The dashboard's live-chat socket signs in with the sign-in cookies, which
// browsers send on every socket request whatever the page. Sockets get no CORS
// check, so only our own pages may use them: a page on an org's website (an
// unverified signup domain, allowed to call the API) must not get a socket
// signed in as whoever is visiting it.

const DASHBOARD = env.frontendUrl
const ORG_SITE = `https://${seedOrg.domain}`

test.describe('the dashboard live-chat socket', () => {
  test('signs in from the dashboard but never from an org\'s website @security', async ({ playwright }) => {
    const context = await playwright.request.newContext(NO_COOKIES)
    const cookie = await signInCookies(context, seedUsers.admin.email, seedUsers.admin.password)
    await context.dispose()

    expect(await agentSocketOverWebSocket(DASHBOARD, cookie)).toBe('signed in')
    expect(await agentSocketOverWebSocket(ORG_SITE, cookie)).toBe('refused')
  })

  // Polling needs every request on one worker; the prod-like run has two
  test('a <script>-tag (JSONP) handshake carries the cookies but not the page\'s origin, so it never signs in @security @one-worker', async ({ playwright, request }) => {
    const context = await playwright.request.newContext(NO_COOKIES)
    const cookie = await signInCookies(context, seedUsers.admin.email, seedUsers.admin.password)
    await context.dispose()

    // The same flow does sign in when the handshake came from the dashboard
    expect(await agentSocketOverPolling(request, cookie, ORG_SITE, { Origin: DASHBOARD })).toBe('signed in')
    expect(await agentSocketOverPolling(request, cookie, ORG_SITE, {}, '&j=0')).toBe('refused')
    expect(await agentSocketOverPolling(request, cookie, ORG_SITE, { 'Sec-Fetch-Site': 'cross-site', 'Sec-Fetch-Dest': 'script' })).toBe('refused')
  })
})
