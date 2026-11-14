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

import { computed } from 'vue'
import { permissionChecks } from '@/utils/permissions'
// Visibility comes from the same map the router enforces, so a link can never
// appear for a page the guard will refuse (People used to do exactly that).
import { canAccessPath } from '@/router/routePermissions'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { pageTitle, type PagePath } from '@/router/pageTitles'

// Re-exported so nav consumers keep a single import site
export { NAV_ICONS, navIconSvg } from './navIcons'
// Shared badge text (bottom nav, More sheet, sidebar, header bell)
export { formatBadgeCount } from '@/utils/badgeCount'

export interface NavItem {
  to?: string
  icon?: string
  label?: string
  section?: string
  show?: boolean
  /** 'account': a personal page, listed in the account menu, not the sidebar. */
  placement?: 'nav' | 'account'
}

export interface NavGroup {
  section: string
  items: NavItem[]
}

/** Sidebar section names; also the first crumb of the header breadcrumb. */
export const NAV_SECTIONS = {
  workspace: 'Workspace',
  settings: 'Settings',
  account: 'Account',
} as const

// Bottom-nav primary slots, in display order (remaining links go to the More sheet)
export const PRIMARY_NAV_PATHS = ['/conversations', '/people', '/ai-agents', '/analytics']

/** A nav link whose label is the page's own title, so the two never drift. */
const link = (to: PagePath, icon: string, show: boolean, placement: NavItem['placement'] = 'nav'): NavItem => ({
  to,
  icon,
  label: pageTitle(to),
  show,
  placement,
})

/** Does a nav link cover this path? Its own page, or a page beneath it (/tickets/:id). */
export const navItemCovers = (item: NavItem, path: string): boolean =>
  !!item.to && (path === item.to || path.startsWith(`${item.to}/`))

export function useNavItems() {
  const { hasEnterpriseModule } = useEnterpriseFeatures()

  // Section membership is explicit rather than inferred from array position:
  // a header can be permission-hidden while one of its items is not (User
  // Settings is always visible), which silently orphaned items into the
  // preceding section.
  const navGroups = computed<NavGroup[]>(() =>
    [
      {
        section: NAV_SECTIONS.workspace,
        items: [
          link('/ai-agents', 'agents', canAccessPath('/ai-agents')),
          link('/human-agents', 'humans', canAccessPath('/human-agents')),
          link('/conversations', 'inbox', canAccessPath('/conversations')),
          link('/tickets', 'tickets', canAccessPath('/tickets')),
          link('/people', 'people', canAccessPath('/people')),
          link('/knowledge', 'knowledge', canAccessPath('/knowledge')),
          link('/faq', 'helpcenter', canAccessPath('/faq')),
          link('/analytics', 'analytics', canAccessPath('/analytics')),
        ],
      },
      {
        section: NAV_SECTIONS.settings,
        items: [
          link('/settings/organization', 'org', canAccessPath('/settings/organization')),
          link('/settings/subscription', 'subscription', hasEnterpriseModule && permissionChecks.canViewSubscription()),
          link('/settings/ticketing', 'ticketing', canAccessPath('/settings/ticketing')),
          // The enterprise module's page; agents reach it from the composer's picker,
          // so the nav entry is for admins
          link('/settings/saved-replies', 'bolt', hasEnterpriseModule && permissionChecks.canManageOrganization() && canAccessPath('/settings/saved-replies')),
          link('/settings/integrations', 'integrations', canAccessPath('/settings/integrations')),
          link('/settings/app-integrations', 'integrations', hasEnterpriseModule && canAccessPath('/settings/app-integrations')),
          link('/settings/widget-apps', 'widgets', canAccessPath('/settings/widget-apps')),
          link('/settings/ai-config', 'aiconfig', canAccessPath('/settings/ai-config')),
          link('/settings/user', 'usersettings', true, 'account'),
          link('/settings/access-tokens', 'key', hasEnterpriseModule, 'account'),
        ],
      },
    ]
      .map((group) => ({ ...group, items: group.items.filter((item) => item.show !== false) }))
      // A section is visible when it has something to show — no separate
      // permission flag to drift from its items
      .filter((group) => group.items.length > 0),
  )

  // Flat list (heading followed by its links) for the desktop sidebar
  const navItems = computed<NavItem[]>(() =>
    navGroups.value.flatMap((group) => [{ section: group.section }, ...group.items]),
  )

  // The desktop sidebar's groups: personal pages live in the account menu instead
  const sidebarGroups = computed<NavGroup[]>(() =>
    navGroups.value
      .map((group) => ({ ...group, items: group.items.filter((item) => item.placement !== 'account') }))
      .filter((group) => group.items.length > 0),
  )

  // Personal pages for the sidebar's account menu
  const accountItems = computed<NavItem[]>(() =>
    navGroups.value.flatMap((group) => group.items.filter((item) => item.placement === 'account')),
  )

  // The breadcrumb's first crumb: the section whose link covers this path
  const sectionFor = (path: string): string | undefined => {
    if (accountItems.value.some((item) => navItemCovers(item, path))) return NAV_SECTIONS.account
    return navGroups.value.find((group) => group.items.some((item) => navItemCovers(item, path)))?.section
  }

  // Bottom-nav slots in design order
  const primaryNavItems = computed<NavItem[]>(() =>
    PRIMARY_NAV_PATHS.map((path) => navItems.value.find((item) => item.to === path)).filter(
      (item): item is NavItem => !!item,
    ),
  )

  // Everything the bottom nav doesn't carry, still grouped like the sidebar
  const moreNavGroups = computed<NavGroup[]>(() =>
    navGroups.value
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.to && !PRIMARY_NAV_PATHS.includes(item.to)),
      }))
      .filter((group) => group.items.length > 0),
  )

  // Derived from the groups so there is one definition of "overflow link"
  const moreNavItems = computed<NavItem[]>(() =>
    moreNavGroups.value.flatMap((group) => group.items),
  )

  return {
    navGroups,
    navItems,
    sidebarGroups,
    accountItems,
    sectionFor,
    primaryNavItems,
    moreNavItems,
    moreNavGroups,
  }
}
