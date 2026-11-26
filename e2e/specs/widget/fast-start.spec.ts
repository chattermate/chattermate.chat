import { test, expect, customizeAgent, setAllowedDomains, AI_REPLY } from '@e2e'

// A first visitor's launcher shows in the dashboard's look as soon as the widget's
// frame page arrives, without waiting for the chat inside it to start (which on a
// slow network takes seconds). The frame page hands the loader the look itself.

const width = async (locator: { boundingBox(): Promise<{ width: number } | null> }) =>
  Math.round((await locator.boundingBox())?.width ?? 0)

// Well inside the loader's 8 s safety net, which would show a launcher anyway
const BEFORE_SAFETY_NET = { timeout: 4000 }

test.describe('widget fast start', () => {
  test('a first visitor sees the launcher in its look while the chat is still loading @widget', async ({ agent, adminApi, widget }) => {
    await customizeAgent(adminApi, agent.id, {
      chat_bubble_color: '#6EA8FF',
      customization_metadata: { launcher: { size: 'sm', shape: 'circle', icon: 'chat' } },
    })

    await widget.embed({ chatHeldBack: true })

    await expect.poll(() => widget.launcherShown(), BEFORE_SAFETY_NET).toBe(true)
    await expect(widget.launcher).toHaveCSS('background-color', 'rgb(110, 168, 255)')
    await expect(widget.launcher).toHaveCSS('border-top-left-radius', '50%')
    await expect(widget.launcherIcon).toBeVisible()
    expect(await width(widget.launcher)).toBe(48)
  })

  test('a launcher the dashboard hides stays hidden while the chat is loading @widget', async ({ agent, adminApi, widget }) => {
    await customizeAgent(adminApi, agent.id, { customization_metadata: { widget_display: { launcher: false } } })

    await widget.embed({ chatHeldBack: true, withTriggerButton: true })

    // Settled (not waiting for its look any more) and not drawn
    await expect.poll(() => widget.launcherShown(), BEFORE_SAFETY_NET).toBe(true)
    await expect(widget.launcher).toBeHidden()
  })

  test('the site\'s own launcherStyle still wins while the chat is loading @widget', async ({ agent, adminApi, widget }) => {
    await customizeAgent(adminApi, agent.id, { customization_metadata: { launcher: { size: 'lg' } } })

    await widget.embed({ chatHeldBack: true, config: { launcherStyle: { size: 'sm' } } })

    await expect.poll(() => widget.launcherShown(), BEFORE_SAFETY_NET).toBe(true)
    expect(await width(widget.launcher)).toBe(48)
  })

  test('once the chat catches up it starts as usual and keeps the look @widget', async ({ agent, adminApi, widget, llm }) => {
    await customizeAgent(adminApi, agent.id, { chat_bubble_color: '#10B981' })
    await llm.script(agent, (s) => s.otherwise().reply('Hello early bird.'))

    await widget.embed({ chatHeldBack: true })
    await expect.poll(() => widget.launcherShown(), BEFORE_SAFETY_NET).toBe(true)
    await expect(widget.launcher).toHaveCSS('background-color', 'rgb(16, 185, 129)')

    await widget.letChatLoad()
    await widget.open()
    await widget.send('Hi')
    await expect(widget.lastAgentMessage()).toHaveText('Hello early bird.', AI_REPLY)
    await expect(widget.launcher).toHaveCSS('background-color', 'rgb(16, 185, 129)')
  })

  test('a site the widget\'s allowed domains refuse gets no look from it @widget @security', async ({ agent, adminApi, widget }) => {
    await customizeAgent(adminApi, agent.id, { chat_bubble_color: '#10B981' })
    await setAllowedDomains(adminApi, widget.widgetId, ['shop.example.com'])

    await widget.embed()
    await widget.launcher.click()
    await expect(widget.unavailableNotice).toBeVisible()
    await expect(widget.launcher).not.toHaveCSS('background-color', 'rgb(16, 185, 129)')
  })
})
