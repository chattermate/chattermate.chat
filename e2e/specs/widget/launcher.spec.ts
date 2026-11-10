import { test, expect, customizeAgent, logoPng, uploadLauncherLogo } from '@e2e'

// The chat launcher's look: size, shape, icon, animation and the agent's own logo,
// chosen in Agent → Chat Customization and shown on the customer's site. Community
// installs have every option; the plan gating is covered by the hosted suite.

const transparentLogo = { name: 'logo.png', mimeType: 'image/png', buffer: logoPng() }
const opaqueLogo = { name: 'logo.png', mimeType: 'image/png', buffer: logoPng({ opaque: true }) }

const width = async (locator: { boundingBox(): Promise<{ width: number } | null> }) =>
  Math.round((await locator.boundingBox())?.width ?? 0)

test.describe('widget launcher', () => {
  test('a new agent gets the medium launcher with the original dots @widget', async ({ widget }) => {
    await widget.embed()
    await expect(widget.launcher).toBeVisible()
    await expect.poll(() => width(widget.launcher)).toBe(56)
    await expect(widget.launcherDots).toBeVisible()
    await expect(widget.launcherIcon).toHaveCount(0)
  })

  test('colour, size, shape, icon and animation chosen in the dashboard show on the site @widget', async ({ agent, widget, customizationPage }) => {
    await customizationPage.goto(agent.id)
    await customizationPage.launcherColor('#6EA8FF').click()
    await customizationPage.choose('Size', 'Small')
    await customizationPage.choose('Shape', 'Circle')
    await customizationPage.choose('Icon', 'Chat')
    await customizationPage.choose('Animation', 'Bounce')

    // The preview switches to the launcher and draws it at its real size
    await expect(customizationPage.previewLauncher).toBeVisible()
    await expect.poll(() => width(customizationPage.previewLauncher)).toBe(48)
    await customizationPage.save()

    // Closed, the section sums up what was chosen
    await customizationPage.openSection('Design')
    await expect(customizationPage.sectionSummary('Launcher')).toContainText('Small · Circle · Chat · Bounce')

    await widget.embed()
    await expect.poll(() => width(widget.launcher)).toBe(48)
    await expect(widget.launcher).toHaveCSS('background-color', 'rgb(110, 168, 255)')
    await expect(widget.launcher).toHaveCSS('border-top-left-radius', '50%')
    await expect(widget.launcherIcon).toBeVisible()
    await expect(widget.launcherDots).toBeHidden()
    // Still for visitors who ask for less motion, as the suite's browser does…
    expect(await widget.launcherAnimation()).toBe('none')
    // …and bouncing for everyone else
    await widget.allowMotion()
    await expect.poll(() => widget.launcherAnimation()).toBe('chattermate-launcher-bounce')
  })

  test('a transparent logo floats with no button behind it, and gets one while the chat is open @widget', async ({ agent, widget, customizationPage }) => {
    await customizationPage.goto(agent.id)
    await customizationPage.choose('Icon', 'Your logo')
    await customizationPage.uploadLogo(transparentLogo)
    // A transparent file starts with no background, and Shape no longer applies
    await expect(customizationPage.option('Background', 'None')).toBeChecked()
    await expect(customizationPage.group('Shape')).toHaveCount(0)
    await expect(customizationPage.previewLogo).toBeVisible()
    await customizationPage.choose('Animation', 'Swoosh')
    await customizationPage.save()

    await widget.embed()
    await expect(widget.launcherLogo).toBeVisible()
    await expect(widget.launcher).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await widget.open()
    await expect(widget.launcher).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })

  test('an opaque logo can\'t go without a background @widget', async ({ agent, customizationPage }) => {
    await customizationPage.goto(agent.id)
    await customizationPage.choose('Icon', 'Your logo')
    await customizationPage.uploadLogo(opaqueLogo)
    await expect(customizationPage.option('Background', 'White')).toBeChecked()
    await expect(customizationPage.option('Background', 'None')).toBeDisabled()
  })

  test('a file that can\'t be a logo is refused before anything is saved @widget', async ({ agent, widget, customizationPage }) => {
    await customizationPage.goto(agent.id)
    await customizationPage.choose('Icon', 'Your logo')

    await customizationPage.uploadLogo({ name: 'logo.gif', mimeType: 'image/gif', buffer: transparentLogo.buffer })
    await expect(customizationPage.logoError).toHaveText('Use a PNG, WebP or JPEG file.')

    await customizationPage.uploadLogo({ name: 'tiny.png', mimeType: 'image/png', buffer: logoPng({ size: 50 }) })
    await expect(customizationPage.logoError).toHaveText('That image is too small. Use one at least 96 px wide and tall.')

    // A good file after a refusal clears the error
    await customizationPage.uploadLogo(transparentLogo)
    await expect(customizationPage.logoError).toHaveCount(0)

    // Nothing was saved: the site still has the dots
    await widget.embed()
    await expect(widget.launcher).toBeVisible()
    await expect(widget.launcherDots).toBeVisible()
    await expect(widget.launcherLogo).toHaveCount(0)
  })

  test('removing the logo brings back the dots @widget', async ({ agent, adminApi, widget, customizationPage }) => {
    await uploadLauncherLogo(adminApi, agent.id, transparentLogo)
    await customizeAgent(adminApi, agent.id, { customization_metadata: { launcher: { icon: 'logo', background: 'none' } } })

    await customizationPage.goto(agent.id)
    await expect(customizationPage.previewLogo).toBeVisible()
    await customizationPage.removeLogo()
    await expect(customizationPage.option('Icon', 'Dots')).toBeChecked()
    await customizationPage.save()

    await widget.embed()
    await expect(widget.launcher).toBeVisible()
    await expect(widget.launcherDots).toBeVisible()
    await expect(widget.launcherLogo).toHaveCount(0)
  })

  test('the chat window takes the size chosen in the dashboard @widget', async ({ agent, widget, customizationPage }) => {
    await customizationPage.goto(agent.id)
    await customizationPage.openSection('Placement')
    await expect(customizationPage.windowSize('Standard')).toBeChecked()
    await customizationPage.chooseWindowSize('Compact')
    await customizationPage.save()

    await widget.embed()
    await widget.open()
    await expect.poll(async () => {
      const box = await widget.panel.boundingBox()
      return box && [Math.round(box.width), Math.round(box.height)]
    }).toEqual([360, 520])
  })

  test('the site\'s own launcherStyle wins over the dashboard @widget', async ({ agent, adminApi, widget }) => {
    await customizeAgent(adminApi, agent.id, { customization_metadata: { launcher: { size: 'lg' } } })
    await widget.embed({ config: { launcherStyle: { size: 'sm' } } })
    await expect(widget.launcher).toBeVisible()
    await expect.poll(() => width(widget.launcher)).toBe(48)
  })

  test('the launcher opens from the keyboard and says whether it is open @widget', async ({ widget }) => {
    await widget.embed()
    await expect(widget.launcher).toHaveAttribute('aria-expanded', 'false')
    await widget.openWithKeyboard()
    await expect(widget.launcher).toHaveAttribute('aria-expanded', 'true')
    await expect(widget.launcher).toHaveAttribute('aria-label', 'Close chat')
  })
})
