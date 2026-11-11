import { test, expect, env } from '@e2e'

// Agent → Chat Customization → Design: the Original / New widget design. The chat
// preview switches at once, and the choice is saved with the rest of the form.
// The classic run's stack serves visitors the original widget only, which the
// form says; the redesign run's serves both.

const SAMPLE_QUESTION = 'Do you offer free returns?'
// The "visitors see the original widget" note: only where the server has the redesign off.
const OFF_NOTES = env.widgetUi === 2 ? 0 : 1

test.describe('widget design', () => {
  test('switching an agent to the new design previews it at once and keeps it after saving @agents', async ({ agent, customizationPage }) => {
    await customizationPage.goto(agent.id)
    // From the original design, whichever this run's agents start on.
    await customizationPage.chooseWidgetDesign('Original')
    await expect(customizationPage.panelPreview).toHaveCount(0)

    await customizationPage.chooseWidgetDesign('New')
    await expect(customizationPage.panelPreview).toBeVisible()
    await expect(customizationPage.panelPreview.getByText(SAMPLE_QUESTION)).toBeVisible()
    await expect(customizationPage.panelPreview.getByRole('textbox')).toBeEditable()
    await customizationPage.save()
    // Saving reloads the form from the server; the preview keeps the sample conversation.
    await expect(customizationPage.panelPreview.getByText(SAMPLE_QUESTION)).toBeVisible()

    await customizationPage.goto(agent.id)
    await customizationPage.openSection('Design')
    await expect(customizationPage.widgetDesign('New')).toBeChecked()
    await customizationPage.chooseWidgetDesign('New')
    await expect(customizationPage.panelPreview.getByText(SAMPLE_QUESTION)).toBeVisible()
    await expect(customizationPage.widgetDesignOffNote).toHaveCount(OFF_NOTES)

    await customizationPage.chooseWidgetDesign('Original')
    await expect(customizationPage.panelPreview).toHaveCount(0)
  })
})
