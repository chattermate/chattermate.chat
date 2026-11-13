/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { describe, it, expect } from 'vitest'
import { APP_NAME, documentTitle, pageTitle, routePageTitle } from '@/router/pageTitles'
import { formatBadgeCount } from '@/utils/badgeCount'
import { ICON_VERSION, versionedIcon } from '@/config/appIcons'

const routeAt = (...paths: string[]) => ({ matched: paths.map((path) => ({ path })) }) as never

describe('page titles', () => {
  it('names a page by its route pattern, deepest match first', () => {
    expect(routePageTitle(routeAt('/tickets/:id'))).toBe('Ticket')
    expect(routePageTitle(routeAt('/settings', '/settings/ai-config'))).toBe('AI Configuration')
    expect(routePageTitle(routeAt('/login'))).toBeUndefined()
    expect(routePageTitle(routeAt())).toBeUndefined()
  })

  it('names a titled page', () => {
    expect(pageTitle('/analytics')).toBe('Analytics')
    expect(pageTitle('/tickets/:id')).toBe('Ticket')
  })

  it('builds the tab title, with a count only when there is one', () => {
    expect(documentTitle('Analytics')).toBe(`Analytics · ${APP_NAME}`)
    expect(documentTitle('Inbox', 3)).toBe(`(3) Inbox · ${APP_NAME}`)
    expect(documentTitle('Inbox', 0)).toBe(`Inbox · ${APP_NAME}`)
    expect(documentTitle('Inbox', 250)).toBe(`(99+) Inbox · ${APP_NAME}`)
    expect(documentTitle(undefined, 3)).toBe(APP_NAME)
  })
})

describe('badge count', () => {
  it('spells out up to 99, caps above, and is empty for nothing', () => {
    expect(formatBadgeCount(7)).toBe('7')
    expect(formatBadgeCount(99)).toBe('99')
    expect(formatBadgeCount(100)).toBe('99+')
    expect(formatBadgeCount(0)).toBe('')
    expect(formatBadgeCount(null)).toBe('')
    expect(formatBadgeCount(undefined)).toBe('')
  })
})

describe('app icon version', () => {
  it('appends the cache-busting version to an icon path', () => {
    expect(versionedIcon('/favicon.svg')).toBe(`/favicon.svg?v=${ICON_VERSION}`)
  })
})
