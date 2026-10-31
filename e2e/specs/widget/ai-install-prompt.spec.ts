import { test, expect, WidgetInstallPage } from '@e2e'

// Beside the embed code: a prompt that has the owner's AI website builder add
// the widget for them, with this widget's own snippet in it.

test('the Widget tab offers a prompt that has an AI website builder install the widget @widget', async ({ page, agent, widget }) => {
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
