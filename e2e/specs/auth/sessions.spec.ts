import { test, expect, env, NO_COOKIES, ApiClient, createUser, login, unique, type APIRequestContext } from '@e2e'

// Sessions end on the server, not just in the browser: a copied token stops
// working the moment its session is signed out, replaced or deactivated.

const PASSWORD = 'E2e-Session-Passw0rd!'

interface Device { api: ApiClient; accessToken: string; refreshToken: string }

test.describe('sessions', () => {
  let contexts: APIRequestContext[] = []
  let newContext: () => Promise<APIRequestContext>

  test.beforeEach(({ playwright }) => {
    newContext = async () => {
      const context = await playwright.request.newContext(NO_COOKIES)
      contexts.push(context)
      return context
    }
  })

  test.afterEach(async () => {
    await Promise.all(contexts.map((c) => c.dispose()))
    contexts = []
  })

  /** Signs `email` in on a browser-like context of its own, as one device would. */
  async function signIn(email: string, password = PASSWORD): Promise<Device> {
    const context = await newContext()
    const { token } = await login(new ApiClient(context), email, password)
    const refreshToken = (await context.storageState()).cookies.find((c) => c.name === 'refresh_token')!.value
    return { api: new ApiClient(context, token), accessToken: token, refreshToken }
  }

  /** What a stolen copy of the access token gets: a bare Bearer request, no cookies, no renewal. */
  async function withStolen(accessToken: string): Promise<number> {
    return (await new ApiClient(await newContext(), accessToken).raw('GET', '/chats/recent')).status()
  }

  /** What a stolen copy of the refresh cookie gets from /users/refresh. */
  async function refreshWithStolen(refreshToken: string): Promise<number> {
    const response = await (await newContext()).post(`${env.apiUrl}/users/refresh`, { headers: { Cookie: `refresh_token=${refreshToken}` } })
    return response.status()
  }

  async function newTeammate(adminApi: ApiClient): Promise<{ id: string; email: string }> {
    const email = `${unique('session')}@e2e.example.com`
    const user = await createUser(adminApi, { name: 'Session Teammate', email, password: PASSWORD, role: 'Agent' })
    return { id: user.id, email }
  }

  test('signing out ends the session: copies of both tokens are refused @auth @security', async ({ adminApi }) => {
    const device = await signIn((await newTeammate(adminApi)).email)
    expect(await withStolen(device.accessToken)).toBe(200)

    await device.api.post('/users/logout')

    expect(await withStolen(device.accessToken)).toBe(401)
    expect(await refreshWithStolen(device.refreshToken)).toBe(401)
  })

  test('a refresh token is not accepted as an access token @auth @security', async ({ adminApi }) => {
    const device = await signIn((await newTeammate(adminApi)).email)
    expect(await withStolen(device.refreshToken)).toBe(401)
  })

  test('deactivating a teammate cuts them off at once @auth @security', async ({ adminApi }) => {
    const teammate = await newTeammate(adminApi)
    const device = await signIn(teammate.email)

    await adminApi.put(`/users/${teammate.id}`, { data: { is_active: false } })

    expect(await withStolen(device.accessToken)).toBe(401)
    expect(await refreshWithStolen(device.refreshToken)).toBe(401)
  })

  test('changing your password signs out your other devices, not this one @auth @security', async ({ adminApi }) => {
    const { email } = await newTeammate(adminApi)
    const laptop = await signIn(email)
    const phone = await signIn(email)

    await laptop.api.patch('/users/me', { data: { current_password: PASSWORD, password: 'E2e-Session-Passw0rd-2!' } })

    expect(await withStolen(laptop.accessToken)).toBe(200)
    expect(await withStolen(phone.accessToken)).toBe(401)
    expect(await refreshWithStolen(phone.refreshToken)).toBe(401)
  })
})
