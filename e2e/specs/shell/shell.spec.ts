import { test, expect, Dashboard, Sidebar } from '@e2e'

test.describe('dashboard shell', () => {
  test('each page names itself in the browser tab and the header @shell', async ({ page, dashboard }) => {
    await dashboard.goto('/analytics')
    await expect(page).toHaveTitle('Analytics · ChatterMate')
    await expect(dashboard.currentPageCrumb).toHaveText('Analytics')

    await dashboard.goto('/settings/ai-config')
    await expect(page).toHaveTitle('AI Configuration · ChatterMate')
    await expect(dashboard.currentPageCrumb).toHaveText('AI Configuration')
  })

  test('the app icons carry a cache-busting version, so a new logo reaches returning visitors @shell', async ({ dashboard }) => {
    await dashboard.goto('/analytics')

    const hrefs = await dashboard.iconLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')))
    expect(hrefs.length).toBeGreaterThanOrEqual(3)
    for (const href of hrefs) expect(href).toMatch(/\?v=\d+$/)
  })

  test('settings fold into one group that opens on its own pages and remembers being closed @shell', async ({ dashboard, sidebar }) => {
    await dashboard.goto('/settings/organization')
    await expect(sidebar.settingsToggle).toHaveAttribute('aria-expanded', 'true')
    await expect(sidebar.link('Organization')).toHaveAttribute('aria-current', 'page')

    await sidebar.settingsToggle.click()
    await expect(sidebar.settingsToggle).toHaveAttribute('aria-expanded', 'false')
    await expect(sidebar.link('Organization')).toBeHidden()

    // Closed stays closed elsewhere...
    await dashboard.goto('/analytics')
    await expect(sidebar.settingsToggle).toHaveAttribute('aria-expanded', 'false')

    // ...and open stays open
    await sidebar.openSettings()
    await dashboard.goto('/knowledge')
    await expect(sidebar.settingsToggle).toHaveAttribute('aria-expanded', 'true')
    await expect(sidebar.link('Organization')).toBeVisible()
  })

  test('the theme switch changes the whole dashboard and survives a reload @shell', async ({ page, dashboard }) => {
    await dashboard.goto('/analytics')
    await expect(dashboard.documentRoot).toHaveAttribute('data-theme', 'dark')

    await dashboard.themeToggle.click()
    await expect(dashboard.documentRoot).toHaveAttribute('data-theme', 'light')

    await page.reload()
    await expect(dashboard.documentRoot).toHaveAttribute('data-theme', 'light')
  })

  test('on the inbox the sidebar folds to icons that keep their names @shell', async ({ dashboard, sidebar }) => {
    await dashboard.goto('/conversations')

    await expect(sidebar.link('Analytics')).toBeVisible()
    await expect(sidebar.link('Analytics')).toHaveText('')
    await expect(sidebar.sectionHeading('Workspace')).toBeHidden()

    // The rail's toggle brings the labels back
    await sidebar.expandButton.click()
    await expect(sidebar.sectionHeading('Workspace')).toBeVisible()
    await expect(sidebar.link('Analytics')).toHaveText('Analytics')
  })
})

test.describe('agent status in the shell', () => {
  test('a teammate goes offline from the header and the account menu says so @shell', async ({ inbox }) => {
    const dashboard = new Dashboard(inbox.page)
    const sidebar = new Sidebar(inbox.page)
    await dashboard.goto('/people')

    // Signing in marks them online
    await expect(dashboard.statusToggle).toHaveText('Online')
    await dashboard.statusToggle.click()
    await expect(dashboard.statusToggle).toHaveText('Offline')
    await expect(dashboard.statusToggle).toHaveAttribute('aria-pressed', 'false')

    await sidebar.accountMenuButton.click()
    await expect(sidebar.accountStatusSwitch).toHaveAttribute('aria-checked', 'false')

    // And back online from the menu, which the header follows
    await sidebar.accountStatusSwitch.click()
    await expect(dashboard.statusToggle).toHaveText('Online')
  })
})

test.describe('inbox badge', () => {
  test.use({ agentSettings: { transferToHuman: true } })

  test('a chat handed to the team shows on the Inbox badge and in the tab title @shell', async ({ agent, widget, inbox, llm }) => {
    await llm.script(agent, (s) => s.otherwise().handOver('Let me connect you with a teammate.'))
    await widget.embed()
    await widget.open()
    await widget.send('I want to talk to a human')
    await widget.shareContactDetails()

    const dashboard = new Dashboard(inbox.page)
    const sidebar = new Sidebar(inbox.page)
    // Counts refresh on load (and every minute): reload until the handover lands.
    // Other tests' handovers can add to it, so the count is at least one.
    await expect(async () => {
      await dashboard.goto('/people')
      await expect(sidebar.badge('Inbox')).toHaveText(/^[1-9]\d*\+?$/, { timeout: 2_000 })
    }).toPass({ timeout: 30_000 })
    await expect(sidebar.badge('Inbox')).toHaveAttribute('title', /waiting for a human$/)

    await inbox.goto()
    await expect(inbox.page).toHaveTitle(/^\([1-9]\d*\+?\) Inbox · ChatterMate$/)
  })
})
