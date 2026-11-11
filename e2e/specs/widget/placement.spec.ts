import { test, expect, customizeAgent, expectUnchanged } from '@e2e'

// Where the widget sits and how it looks: the site's own config, the dashboard's
// display settings, and which one wins.

test.describe('widget placement', () => {
  test('the launcher goes on the left when the site asks for it @widget', async ({ widget }) => {
    await widget.embed({ config: { position: { side: 'left' } } })
    const box = (await widget.launcher.boundingBox())!
    expect(box.x).toBeLessThan(100)
  })

  // The suite runs with reduced motion, which the loader honours by not sliding the
  // panel in, so its final position is there at once.
  test('sidebar mode opens the chat as a full-height panel on the right @widget', async ({ widget }) => {
    await widget.embed({ config: { displayMode: 'sidebar-right' } })
    await widget.open()
    const viewport = widget.page.viewportSize()!
    const panel = (await widget.panel.boundingBox())!
    expect(panel.height).toBeGreaterThanOrEqual(viewport.height - 1)
    expect(Math.round(panel.x + panel.width)).toBe(viewport.width)
  })

  test('the dashboard\'s display settings apply without any code, and the site\'s own config wins @widget', async ({ agent, adminApi, makeWidget }) => {
    await customizeAgent(adminApi, agent.id, { customization_metadata: { widget_display: { side: 'left' } } })

    // The loader applies the dashboard's settings once it has fetched them.
    const fromDashboard = await makeWidget(agent.id)
    await fromDashboard.embed()
    await expect.poll(async () => (await fromDashboard.launcher.boundingBox())?.x).toBeLessThan(100)

    const siteOverrides = await makeWidget(agent.id)
    await siteOverrides.embed({ config: { position: { side: 'right' } } })
    const viewport = siteOverrides.page.viewportSize()!
    await expect(siteOverrides.launcher).toBeVisible()
    // Revealed once the dashboard's settings have arrived (until then it is
    // transparent, at the default size)
    await expect.poll(() => siteOverrides.launcherShown()).toBe(true)
    await expect.poll(async () => (await siteOverrides.launcher.boundingBox())?.x).toBeGreaterThan(viewport.width - 150)
    // …and stays there.
    await expectUnchanged('launcher position', async () => Math.round((await siteOverrides.launcher.boundingBox())!.x))
  })

  test('the agent\'s welcome message and launcher colour show in the widget @widget', async ({ agent, adminApi, widget }) => {
    await customizeAgent(adminApi, agent.id, { welcome_message: 'Hi from Acme support — how can we help?', chat_bubble_color: '#123456' })

    await widget.embed()
    await expect(widget.launcher).toHaveCSS('background-color', 'rgb(18, 52, 86)')
    await widget.open()
    await expect(widget.welcomeMessage).toHaveText('Hi from Acme support — how can we help?')
  })
})
