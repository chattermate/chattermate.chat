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

import { describe, it, expect, vi, beforeEach } from 'vitest'

const permissions = await vi.hoisted(async () => {
  const { createPermissionMocks } = await import('../../fixtures/permissions')
  return createPermissionMocks()
})

vi.mock('@/utils/permissions', () => ({
  permissionChecks: permissions,
}))

vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({ hasEnterpriseModule: false }),
}))

import { useNavItems, PRIMARY_NAV_PATHS } from '@/components/layout/navItems'

describe('useNavItems', () => {
  beforeEach(() => {
    Object.values(permissions).forEach((fn) => fn.mockReturnValue(true))
  })

  it('splits primary (bottom-nav) and overflow (More sheet) items', () => {
    const { primaryNavItems, moreNavItems } = useNavItems()

    expect(primaryNavItems.value.map((i) => i.to)).toEqual([
      '/conversations',
      '/people',
      '/ai-agents',
      '/analytics',
    ])
    // Overflow contains the rest, never a primary path or a section header
    const morePaths = moreNavItems.value.map((i) => i.to)
    expect(morePaths).toContain('/human-agents')
    expect(morePaths).toContain('/knowledge')
    expect(morePaths).toContain('/settings/user')
    morePaths.forEach((p) => expect(PRIMARY_NAV_PATHS).not.toContain(p))
    moreNavItems.value.forEach((i) => expect(i.section).toBeUndefined())
  })

  it('hides permission-gated items for restricted users', () => {
    permissions.canViewChats.mockReturnValue(false)
    permissions.canViewAnalytics.mockReturnValue(false)
    permissions.canManageUsers.mockReturnValue(false)

    const { primaryNavItems, moreNavItems, navItems } = useNavItems()

    const primaryPaths = primaryNavItems.value.map((i) => i.to)
    expect(primaryPaths).not.toContain('/conversations')
    expect(primaryPaths).not.toContain('/people')
    expect(primaryPaths).not.toContain('/analytics')
    expect(primaryPaths).toContain('/ai-agents')

    expect(moreNavItems.value.map((i) => i.to)).not.toContain('/human-agents')
    // User settings is always available
    expect(navItems.value.map((i) => i.to)).toContain('/settings/user')
  })

  it('excludes enterprise subscription when enterprise module is absent', () => {
    const { moreNavItems } = useNavItems()
    expect(moreNavItems.value.map((i) => i.to)).not.toContain('/settings/subscription')
  })

  // Guards the whole point of the More sheet: mobile must expose exactly the
  // same destinations as the desktop sidebar, so adding a nav item can never
  // silently leave phones without it.
  it('surfaces every sidebar destination across the bottom nav and More sheet', () => {
    const { navItems, primaryNavItems, moreNavGroups } = useNavItems()

    const sidebarPaths = navItems.value.filter((i) => i.to).map((i) => i.to)
    const mobilePaths = [
      ...primaryNavItems.value.map((i) => i.to),
      ...moreNavGroups.value.flatMap((g) => g.items.map((i) => i.to)),
    ]

    expect(mobilePaths.slice().sort()).toEqual(sidebarPaths.slice().sort())
  })

  it('keeps the sidebar section headings in the More sheet', () => {
    const { moreNavGroups } = useNavItems()
    expect(moreNavGroups.value.map((g) => g.section)).toEqual(['Main Menu', 'Settings'])
    // No empty groups — a section fully covered by the bottom nav is dropped
    moreNavGroups.value.forEach((g) => expect(g.items.length).toBeGreaterThan(0))
  })
})
