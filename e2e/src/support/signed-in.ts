import { expect, type Page } from '@playwright/test'
import { env } from '../env'

const dashboardOrigin = new URL(env.frontendUrl).origin

/**
 * Signed in to the dashboard: back on its own origin (not still at a sign-in
 * provider or the backend's callback), off the login page, with a single
 * sign-on's return markers (?sso=ok, ?sso_error=) already dropped.
 */
export async function expectSignedIn(page: Page): Promise<void> {
  await expect(page).toHaveURL((url) => url.origin === dashboardOrigin
    && !url.pathname.startsWith('/login')
    && !/[?&]sso(_error)?=/.test(url.search))
}
