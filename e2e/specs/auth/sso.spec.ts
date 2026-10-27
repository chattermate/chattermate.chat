import { test, expect, createUser, expectSignedIn, LoginPage, seedOrg, unique, type ProviderAccount, type SsoProvider } from '@e2e'

// Signing in with Google or Microsoft (services/fake-sso plays both). An account
// links to the team member whose address the provider vouches for; after that the
// provider's account id finds them, whatever address it carries.

const PASSWORD = 'E2e-Member-Passw0rd!'
const NO_ACCOUNT = 'No team account matches that e-mail address. Ask an administrator for an invite.'
const UNVERIFIED = "The provider has not verified that account's e-mail address, so it cannot be linked to a team member."
const CANCELLED = 'The sign-in was cancelled or the provider refused it. Please try again.'
const REPLAYED = 'The sign-in took too long or was already used. Please try again.'

test.describe('single sign-on', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('a team member signs in with their Google Workspace account, and again on another device @smoke @auth', async ({ loginPage, makeMember, page, anonymousPage }) => {
    const member = await makeMember()
    const workspace: ProviderAccount = { email: member.email, name: member.name, workspaceDomain: seedOrg.domain }

    await loginPage.goto()
    await (await loginPage.sso.continueWith('Google')).signInAs(workspace)
    await expectSignedIn(page)

    const otherDevice = new LoginPage(anonymousPage)
    await otherDevice.goto()
    await (await otherDevice.sso.continueWith('Google')).signInAs(workspace)
    await expectSignedIn(anonymousPage)
  })

  test('once linked, the Google account signs in even after its address changes @auth', async ({ loginPage, makeMember, page, anonymousPage }) => {
    const member = await makeMember()
    const accountId = unique('google-account')

    await loginPage.goto()
    await (await loginPage.sso.continueWith('Google')).signInAs({ email: member.email, accountId, workspaceDomain: seedOrg.domain })
    await expectSignedIn(page)

    const later = new LoginPage(anonymousPage)
    await later.goto()
    await (await later.sso.continueWith('Google')).signInAs({ email: `renamed-${member.email}`, accountId, workspaceDomain: seedOrg.domain })
    await expectSignedIn(anonymousPage)
  })

  test('a team member signs in with a Microsoft work account on a domain Microsoft verified @auth', async ({ loginPage, makeMember, page }) => {
    const member = await makeMember()

    await loginPage.goto()
    await (await loginPage.sso.continueWith('Microsoft')).signInAs({ email: member.email, name: member.name, domainVerified: true })
    await expectSignedIn(page)
  })

  test('a team member signs in with their personal Microsoft account @auth', async ({ loginPage, adminApi, page }) => {
    const email = `${unique('personal')}@outlook.com`
    await createUser(adminApi, { email, name: 'Pat Personal', password: PASSWORD, role: 'Agent' })

    await loginPage.goto()
    await (await loginPage.sso.continueWith('Microsoft')).signInAs({ email, name: 'Pat Personal', directory: 'personal' })
    await expectSignedIn(page)
  })

  test('an address nobody on the team uses is told to ask for an invite @auth', async ({ loginPage, page }) => {
    await loginPage.goto()
    await (await loginPage.sso.continueWith('Google')).signInAs({ email: `${unique('stranger')}@gmail.com` })

    await expect(loginPage.error).toHaveText(NO_ACCOUNT)
    await expect(page).toHaveURL(/\/login$/)
  })

  // The address is a team member's, but this provider account can't prove it owns it.
  const unvouched: Array<[SsoProvider, string, Omit<ProviderAccount, 'email'>]> = [
    ['Google', 'a Google account outside the Workspace', {}],
    ['Microsoft', "a Microsoft work account on a domain Microsoft didn't verify", { directory: unique('other-directory') }],
  ]
  for (const [provider, who, account] of unvouched) {
    test(`${who} is not linked to the member, whose password still works @auth`, async ({ loginPage, makeMember, page }) => {
      const member = await makeMember()

      await loginPage.goto()
      await (await loginPage.sso.continueWith(provider)).signInAs({ ...account, email: member.email })
      await expect(loginPage.error).toHaveText(UNVERIFIED)

      await loginPage.signIn(member.email, member.password)
      await expectSignedIn(page)
    })
  }

  test('backing out at Google returns to the login page, where the password still works @auth', async ({ loginPage, makeMember, page }) => {
    const member = await makeMember()

    await loginPage.goto()
    await (await loginPage.sso.continueWith('Google')).cancel()
    await expect(loginPage.error).toHaveText(CANCELLED)

    await loginPage.signIn(member.email, member.password)
    await expectSignedIn(page)
  })

  test('a deep link opened while signed out survives the trip to Microsoft @auth', async ({ loginPage, makeMember, page }) => {
    const member = await makeMember()

    await page.goto('/conversations')
    await expect(page).toHaveURL(/\/login\?redirect=/)
    await (await loginPage.sso.continueWith('Microsoft')).signInAs({ email: member.email, domainVerified: true })

    await expect(page).toHaveURL(/\/conversations$/)
  })

  test('the link back from Google signs in only the browser that started it, once @auth', async ({ loginPage, makeMember, page, anonymousPage }) => {
    const member = await makeMember()

    await loginPage.goto()
    const returnLink = await (await loginPage.sso.continueWith('Google')).signInKeepingReturnLink({ email: member.email, workspaceDomain: seedOrg.domain })
    await expectSignedIn(page)

    // Copied into another browser: no sign-in, just the login page saying so.
    await anonymousPage.goto(returnLink)
    await expect(new LoginPage(anonymousPage).error).toHaveText(REPLAYED)
    await expect(anonymousPage).toHaveURL(/\/login$/)
  })
})
