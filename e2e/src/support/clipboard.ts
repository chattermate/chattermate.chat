import type { Page } from '@playwright/test'

/** Lets the page write to and read from the clipboard (Chromium asks first). */
export async function allowClipboard(page: Page): Promise<void> {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
}

/** What the page last put on the clipboard. */
export async function clipboardText(page: Page): Promise<string> {
  return page.evaluate(() => navigator.clipboard.readText())
}
