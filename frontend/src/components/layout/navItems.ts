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
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

// Re-exported so nav consumers keep a single import site
export { NAV_ICONS, navIconSvg } from './navIcons'

export interface NavItem {
  to?: string
  icon?: string
  label?: string
  section?: string
  show?: boolean
}

export interface NavGroup {
  section: string
  items: NavItem[]
}

// Shared unread-badge cap (bottom nav, More sheet, header bell)
export const formatBadgeCount = (count?: number) =>
  count && count > 99 ? '99+' : String(count || '')

// Bottom-nav primary slots, in display order (remaining links go to the More sheet)
export const PRIMARY_NAV_PATHS = ['/conversations', '/people', '/ai-agents', '/analytics']

export function useNavItems() {
  const { hasEnterpriseModule } = useEnterpriseFeatures()

  // Section membership is explicit rather than inferred from array position:
  // a header can be permission-hidden while one of its items is not (User
  // Settings is always visible), which silently orphaned items into the
  // preceding section.
  const navGroups = computed<NavGroup[]>(() =>
    [
      {
        section: 'Main Menu',
        items: [
          {
            to: '/ai-agents',
            icon: 'agents',
            label: 'AI Agents',
            show: permissionChecks.canViewAgents(),
          },
          {
            to: '/human-agents',
            icon: 'humans',
            label: 'Human Agents',
            show: permissionChecks.canManageUsers(),
          },
          {
            to: '/conversations',
            icon: 'inbox',
            label: 'Inbox',
            show: permissionChecks.canViewChats(),
          },
          {
            to: '/tickets',
            icon: 'tickets',
            label: 'Tickets',
            show: permissionChecks.canViewTickets(),
          },
          {
            to: '/people',
            icon: 'people',
            label: 'People',
            show: permissionChecks.canViewChats(),
          },
          {
            to: '/knowledge',
            icon: 'knowledge',
            label: 'Knowledge',
            show: permissionChecks.canManageKnowledge(),
          },
          {
            to: '/faq',
            icon: 'faq',
            label: 'Help center',
            show: permissionChecks.canManageKnowledge(),
          },
          {
            to: '/analytics',
            icon: 'analytics',
            label: 'Analytics',
            show: permissionChecks.canViewAnalytics(),
          },
        ],
      },
      {
        section: 'Settings',
        items: [
          {
            to: '/settings/organization',
            icon: 'org',
            label: 'Organization',
            show: permissionChecks.canViewOrganization(),
          },
          {
            to: '/settings/subscription',
            icon: 'subscription',
            label: 'Subscription',
            show: hasEnterpriseModule && permissionChecks.canViewOrganization(),
          },
          {
            to: '/settings/ticketing',
            icon: 'ticketing',
            label: 'Ticketing',
            show: permissionChecks.canManageOrganization(),
          },
          {
            to: '/settings/integrations',
            icon: 'integrations',
            label: 'Integrations',
            show: permissionChecks.canViewOrganization(),
          },
          {
            to: '/settings/widget-apps',
            icon: 'widgets',
            label: 'Widget Apps',
            show: permissionChecks.canManageOrganization(),
          },
          {
            to: '/settings/ai-config',
            icon: 'aiconfig',
            label: 'AI Configuration',
            show: permissionChecks.canViewAIConfig(),
          },
          {
            to: '/settings/user',
            icon: 'usersettings',
            label: 'User Settings',
            show: true,
          },
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

  return { navGroups, navItems, primaryNavItems, moreNavItems, moreNavGroups }
}
