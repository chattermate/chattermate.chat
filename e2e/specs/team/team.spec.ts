import { test, expect, storageStatePath, unique, LoginPage, Sidebar } from '@e2e'

test.describe('team', () => {
  test('an admin adds an agent who can sign in to the inbox @team', async ({ humanAgentsPage, anonymousPage }) => {
    const id = unique('agent')
    const member = { name: `Alex ${id}`, email: `${id}@e2e.example.com`, password: 'E2e-New-Agent-Passw0rd!', role: 'Agent' as const }

    await humanAgentsPage.goto()
    await humanAgentsPage.invite(member)
    await expect(humanAgentsPage.member(member.email)).toBeVisible()

    const login = new LoginPage(anonymousPage)
    await login.goto()
    await login.signIn(member.email, member.password)
    await expect(anonymousPage).toHaveURL(/\/conversations/)
  })
})

test.describe('as a human agent', () => {
  test.use({ storageState: storageStatePath('human-agent') })

  test('the Agent role does not see admin areas in the navigation @team', async ({ page }) => {
    // Not /conversations: the inbox collapses the sidebar to icons.
    await page.goto('/people')
    const sidebar = new Sidebar(page)
    await expect(sidebar.link('Inbox')).toBeVisible()
    for (const adminArea of ['AI Agents', 'Human Agents', 'Knowledge']) {
      await expect(sidebar.link(adminArea)).toBeHidden()
    }
    // No organization settings at all, so no Settings group to open
    // (their own User Settings lives in the account menu)
    await expect(sidebar.settingsToggle).toBeHidden()
  })
})
