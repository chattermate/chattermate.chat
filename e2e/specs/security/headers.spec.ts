import { test, expect, env, NO_COOKIES, seedUsers, ApiClient } from '@e2e'

// What the backend itself promises about cookies and cross-origin access.
// (Security headers such as HSTS and CSP come from the host's nginx, which is not
// in this repo, so they are checked against a deployment, not here.)

test.describe('security basics', () => {
  test('sign-in tokens are HttpOnly cookies, Secure when the API is on https @security', async ({ playwright }) => {
    const context = await playwright.request.newContext(NO_COOKIES)
    // Browsers drop Secure cookies over plain http, so an http install gets Lax ones instead
    const overHttps = env.apiUrl.startsWith('https://')
    const response = await context.post(`${env.apiUrl}/users/login`, {
      form: { username: seedUsers.admin.email, password: seedUsers.admin.password },
    })
    expect(response.ok()).toBe(true)
    const cookies = response.headersArray().filter((h) => h.name.toLowerCase() === 'set-cookie').map((h) => h.value)
    for (const name of ['access_token', 'refresh_token']) {
      const cookie = cookies.find((c) => c.startsWith(`${name}=`))
      expect(cookie, `${name} cookie`).toBeDefined()
      expect(cookie).toMatch(/;\s*HttpOnly/i)
      expect(cookie).toMatch(overHttps ? /SameSite=none/i : /SameSite=lax/i)
      expect(/;\s*Secure/i.test(cookie ?? ''), `${name} Secure flag`).toBe(overHttps)
    }
    await context.dispose()
  })

  test('another website cannot call the API with a visitor\'s credentials @security', async ({ request }) => {
    const response = await new ApiClient(request).raw('OPTIONS', '/users/me', {
      headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'GET' },
    })
    expect(response.headers()['access-control-allow-origin']).toBeUndefined()
  })

  test('the dashboard\'s own origin is allowed @security', async ({ request }) => {
    const response = await new ApiClient(request).raw('OPTIONS', '/users/me', {
      headers: { Origin: env.frontendUrl, 'Access-Control-Request-Method': 'GET' },
    })
    expect(response.headers()['access-control-allow-origin']).toBe(env.frontendUrl)
    expect(response.headers()['access-control-allow-credentials']).toBe('true')
  })
})
