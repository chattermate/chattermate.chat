import { test, expect, env, customizeAgent } from '@e2e'

// The redesigned widget's "Suggested for this page": a quick action set for this
// page comes first, under the page's title; one for other pages stays away.

test.describe('suggested for this page', () => {
  // eslint-disable-next-line playwright/no-skipped-test -- page-aware suggestions are the redesigned widget's
  test.skip(env.widgetUi !== 2, 'Page-aware suggestions are the redesigned widget\'s')

  test('a quick action set for this page shows first, one for other pages does not @widget', async ({ agent, widget, adminApi }) => {
    await customizeAgent(adminApi, agent.id, {
      quick_actions: [
        'Track my order',
        { label: 'What are you selling here?', match: '/' },
        { label: 'Is this in stock?', match: '/products/*' },
      ],
    })
    await widget.embed()
    await widget.open()

    const suggestions = widget.suggestions
    await expect(suggestions.heading).toContainText('Suggested for this page')
    await expect(suggestions.rows).toHaveText(['What are you selling here?', 'Track my order'])
  })
})
