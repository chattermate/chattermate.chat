import { test, expect } from '@e2e'

// The headless shell pins Notification.permission to "denied"; Chromium's new
// headless mode follows the permission the test sets, like a real browser.
// Push binds to the app's service worker, which the suite otherwise blocks.
test.use({ channel: 'chromium', serviceWorkers: 'allow' })

const OFF = 'Notifications are off on this device'
const BLOCKED = 'Notifications are blocked in this browser'
const INSTALL = 'Add ChatterMate to your Home Screen'
const FAILED = "Couldn't set up notifications"

test.describe('notifications off on this device', () => {
  test('a returning user is reminded on landing, in the drawer and on the bell, and Turn on clears all three @shell', async ({ dashboard, pushDevice, pushNotices }) => {
    await pushDevice.setPermission('prompt')
    await pushNotices.firstAskPutOff(8)
    await dashboard.goto('/ai-agents')

    await expect(pushNotices.landing).toContainText(`${OFF}. You won't hear about chats waiting for your team.`)
    await expect(pushNotices.bell).toHaveAccessibleName(/off on this device$/)
    await pushNotices.openDrawer()
    await expect(pushNotices.drawerLine).toHaveAccessibleName(OFF)
    await expect(pushNotices.drawerLine).toContainText("You won't hear about new chats until you turn them on.")

    pushDevice.answerPromptWith('granted')
    await pushNotices.act(pushNotices.drawerLine, 'Turn on')

    await expect(pushNotices.drawerLine).toBeHidden()
    await expect(pushNotices.landing).toBeHidden()
    await expect(pushNotices.bell).not.toHaveAccessibleName(/off on this device$/)    // The device's token reached the server
    await expect.poll(() => pushDevice.storedTokens()).toHaveLength(1)
  })

  test('blocking at the prompt shows how to unblock, step by step @shell', async ({ dashboard, pushDevice, pushNotices }) => {
    await pushDevice.setPermission('prompt')
    await pushNotices.firstAskPutOff(8)
    await dashboard.goto('/ai-agents')

    pushDevice.answerPromptWith('denied')
    await pushNotices.act(pushNotices.landing, 'Turn on')

    await expect(pushNotices.landing).toContainText(`${BLOCKED}. Click the icon left of the address bar and allow notifications.`)
    await expect(pushNotices.landing.getByRole('button', { name: 'Turn on' })).toHaveCount(0)
    await pushNotices.openDrawer()
    await expect(pushNotices.drawerLine).toHaveAccessibleName(BLOCKED)

    await pushNotices.act(pushNotices.drawerLine, 'Show me how')
    await expect(pushNotices.unblockSteps).toContainText([
      'Click the icon left of the address bar.',
      'Turn on Notifications.',
      "Reload this page if they don't turn on by themselves.",
    ])

    // Allowed in site settings while the steps are up: they close, and the device registers
    await pushDevice.setPermission('granted')
    await expect(pushNotices.unblockGuide).toBeHidden()
    await expect(pushNotices.drawerLine).toBeHidden()
    await expect.poll(() => pushDevice.storedTokens()).toHaveLength(1)
  })

  test('allowing in site settings after a block registers the device without a reload @shell', async ({ dashboard, pushDevice, pushNotices }) => {
    await pushDevice.setPermission('denied')
    await dashboard.goto('/ai-agents')
    await expect(pushNotices.landing).toHaveAccessibleName(BLOCKED)

    await pushDevice.setPermission('granted')

    await expect(pushNotices.landing).toBeHidden()
    await expect(pushNotices.bell).not.toHaveAccessibleName(/off on this device$/)
  })

  test('"Not now" puts the landing banner off across pages and reloads; the drawer line, inbox strip and bell dot stay @shell', async ({ dashboard, pushDevice, pushNotices }) => {
    await pushDevice.setPermission('prompt')
    await pushNotices.firstAskPutOff(8)
    await dashboard.goto('/ai-agents')

    await pushNotices.notNow(pushNotices.landing)
    await expect(pushNotices.landing).toBeHidden()

    await dashboard.goto('/analytics')
    await expect(pushNotices.landing).toBeHidden()
    await expect(pushNotices.bell).toHaveAccessibleName(/off on this device$/)
    await pushNotices.openDrawer()
    await expect(pushNotices.drawerLine).toHaveAccessibleName(OFF)

    // The inbox strip stays: a missed notification there is a chat left waiting
    await dashboard.goto('/conversations')
    await expect(pushNotices.landing).toHaveAccessibleName(OFF)
    await expect(pushNotices.landing.getByRole('button')).toHaveText(['Turn on'])
  })

  test('a first visit gets the floating card, not the banner too; its "Not now" holds the banner back @shell', async ({ dashboard, pushDevice, pushNotices }) => {
    await pushDevice.setPermission('prompt')
    await dashboard.goto('/ai-agents')

    await expect(pushNotices.firstAsk).toBeVisible()
    await expect(pushNotices.landing).toBeHidden()

    await pushNotices.notNow(pushNotices.firstAsk)
    await expect(pushNotices.firstAsk).toBeHidden()
    await expect(pushNotices.landing).toBeHidden()
    await expect(pushNotices.bell).toHaveAccessibleName(/off on this device$/)
  })

  test('the inbox shows a slim strip above the list, and Turn on clears it @shell', async ({ dashboard, pushDevice, pushNotices }) => {
    await pushDevice.setPermission('prompt')
    await pushNotices.firstAskPutOff(8)
    await dashboard.goto('/conversations')

    await expect(pushNotices.landing).toHaveText(/^Notifications are off\s*Turn on$/)

    pushDevice.answerPromptWith('granted')
    await pushNotices.act(pushNotices.landing, 'Turn on')
    await expect(pushNotices.landing).toBeHidden()
    await expect.poll(() => pushDevice.storedTokens()).toHaveLength(1)
  })

  test('when the device fails to register, the drawer says so and Try again fixes it @shell', async ({ dashboard, pushDevice, pushNotices }) => {
    await pushDevice.setPermission('granted')
    pushDevice.failRegistrations()
    await pushNotices.firstAskPutOff(8)
    await dashboard.goto('/ai-agents')

    await expect(pushNotices.landing).toContainText(`${FAILED}. This device isn't receiving them yet.`)
    await pushNotices.openDrawer()
    await expect(pushNotices.drawerLine).toHaveAccessibleName(FAILED)

    pushDevice.failRegistrations(false)
    await pushNotices.act(pushNotices.drawerLine, 'Try again')

    await expect(pushNotices.drawerLine).toBeHidden()
    await expect(pushNotices.landing).toBeHidden()
    await expect.poll(() => pushDevice.storedTokens()).toHaveLength(1)
  })

  test('with push working there is nothing to see @shell', async ({ dashboard, pushDevice, pushNotices }) => {
    await pushDevice.setPermission('granted')
    await dashboard.goto('/ai-agents')

    await expect(pushNotices.bell).not.toHaveAccessibleName(/off on this device$/)
    await expect(pushNotices.landing).toBeHidden()
    await expect(pushNotices.firstAsk).toBeHidden()
    await pushNotices.openDrawer()
    await expect(pushNotices.drawerLine).toBeHidden()
  })
})

test.describe('notifications off on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the inbox strip and the More sheet say so @shell', async ({ page, pushDevice, pushNotices }) => {
    await pushDevice.setPermission('prompt')
    await pushNotices.firstAskPutOff(8)
    await page.goto('/conversations')

    await expect(pushNotices.landing).toHaveAccessibleName(OFF)
    await pushNotices.openMoreSheet()
    await expect(pushNotices.moreSheetNotifications).toContainText('Off on this device')
  })
})

test.describe('notifications on an iPhone, in Safari', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  })

  test('asks to add the app to the Home Screen first @shell', async ({ page, pushDevice, pushNotices }) => {
    await pushDevice.setPermission('prompt')
    await pushNotices.firstAskPutOff(8)
    await page.goto('/conversations')

    await expect(pushNotices.landing).toHaveAccessibleName(INSTALL)
    await expect(pushNotices.landing).toContainText('Add to Home Screen for notifications')
  })
})
