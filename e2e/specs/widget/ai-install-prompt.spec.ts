import { test, expect, env, WidgetInstallPage } from '@e2e'

// Beside the embed code, on the hosted edition only: a prompt that has the
// owner's AI website builder add the widget for them, with this widget's own
// snippet in it. A community install shows the snippet alone.

test('the Widget tab offers a prompt that has an AI website builder install the widget @widget', async ({ page, agent, widget }) => {
  // eslint-disable-next-line playwright/no-skipped-test -- an enterprise feature; the next test covers open source
  test.skip(env.edition !== 'enterprise', 'The AI builder prompt ships with the enterprise edition')
  const install = new WidgetInstallPage(page)
  const snippetLine = `window.chattermateId = '${widget.widgetId}'`
  await install.goto(agent.id)

  // What gets copied stays closed until asked for
  await expect(install.aiPrompt).toBeHidden()
  await install.showWhatGetsCopied()
  await expect(install.aiPrompt).toContainText(snippetLine)
  await expect(install.aiPrompt).toContainText('just before the closing </body> tag')

  const copied = await install.copyAiPrompt()
  await expect(install.aiPromptButton).toHaveText('Prompt copied')
  expect(copied).toContain(snippetLine)
  // And back, ready to copy again
  await expect(install.aiPromptButton).toHaveText('Copy prompt for my AI builder')
})

test('open source shows the snippet with no AI builder prompt @widget', async ({ page, agent }) => {
  // eslint-disable-next-line playwright/no-skipped-test -- the previous test covers the enterprise edition
  test.skip(env.edition !== 'oss', 'The enterprise edition offers the prompt')
  const install = new WidgetInstallPage(page)
  // goto waits for the embed code to show
  await install.goto(agent.id)
  await expect(install.aiPromptButton).toBeHidden()
  await expect(install.whatGetsCopied).toBeHidden()
})
