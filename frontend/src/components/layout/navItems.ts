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
    to?: string;
    icon?: string;
    label?: string;
    section?: string;
    show?: boolean;
}

export interface NavGroup {
    section: string;
    items: NavItem[];
}

// Shared unread-badge cap (bottom nav, More sheet, header bell)
export const formatBadgeCount = (count?: number) =>
    count && count > 99 ? '99+' : String(count || '')

// Bottom-nav primary slots, in display order (remaining links go to the More sheet)
export const PRIMARY_NAV_PATHS = ['/conversations', '/people', '/ai-agents', '/analytics']

export function useNavItems() {
    const { hasEnterpriseModule } = useEnterpriseFeatures()

    const navItems = computed<NavItem[]>(() => [
        {
            section: 'Main Menu'
        },
        {
            to: '/ai-agents',
            icon: 'agents',
            label: 'AI Agents',
            show: permissionChecks.canViewAgents()
        },
        {
            to: '/human-agents',
            icon: 'humans',
            label: 'Human Agents',
            show: permissionChecks.canManageUsers()
        },
        {
            to: '/conversations',
            icon: 'inbox',
            label: 'Inbox',
            show: permissionChecks.canViewChats()
        },
        {
            to: '/people',
            icon: 'people',
            label: 'People',
            show: permissionChecks.canViewChats()
        },
        {
            to: '/knowledge',
            icon: 'knowledge',
            label: 'Knowledge',
            show: permissionChecks.canManageKnowledge()
        },
        {
            to: '/faq',
            icon: 'faq',
            label: 'Help center',
            show: permissionChecks.canManageKnowledge()
        },
        {
            to: '/analytics',
            icon: 'analytics',
            label: 'Analytics',
            show: permissionChecks.canViewAnalytics()
        },
        {
            section: 'Settings',
            show: permissionChecks.canViewOrganization() || permissionChecks.canViewAIConfig()
        },
        {
            to: '/settings/organization',
            icon: 'org',
            label: 'Organization',
            show: permissionChecks.canViewOrganization()
        },
        {
            to: '/settings/subscription',
            icon: 'subscription',
            label: 'Subscription',
            show: hasEnterpriseModule && permissionChecks.canViewOrganization()
        },
        {
            to: '/settings/integrations',
            icon: 'integrations',
            label: 'Integrations',
            show: permissionChecks.canViewOrganization()
        },
        {
            to: '/settings/widget-apps',
            icon: 'widgets',
            label: 'Widget Apps',
            show: permissionChecks.canManageOrganization()
        },
        {
            to: '/settings/ai-config',
            icon: 'aiconfig',
            label: 'AI Configuration',
            show: permissionChecks.canViewAIConfig()
        },
        {
            to: '/settings/user',
            icon: 'usersettings',
            label: 'User Settings',
            show: true
        }
    ].filter(item => item.show !== false))

    // Bottom-nav slots in design order; overflow links for the More sheet
    const primaryNavItems = computed<NavItem[]>(() =>
        PRIMARY_NAV_PATHS
            .map(path => navItems.value.find(item => item.to === path))
            .filter((item): item is NavItem => !!item)
    )

    const moreNavItems = computed<NavItem[]>(() =>
        navItems.value.filter(item => item.to && !PRIMARY_NAV_PATHS.includes(item.to))
    )

    // Same overflow links, but keeping the sidebar's section headings so the
    // More sheet reads as the same menu as the desktop nav rather than a flat
    // list someone has to audit against it.
    const moreNavGroups = computed<NavGroup[]>(() => {
        const groups: NavGroup[] = []
        let current: NavGroup | null = null

        for (const item of navItems.value) {
            if (item.section) {
                current = { section: item.section, items: [] }
                groups.push(current)
                continue
            }
            if (!item.to || PRIMARY_NAV_PATHS.includes(item.to)) continue
            if (!current) {
                current = { section: '', items: [] }
                groups.push(current)
            }
            current.items.push(item)
        }

        // A section whose every link is in the bottom nav has nothing to show
        return groups.filter(group => group.items.length > 0)
    })

    return { navItems, primaryNavItems, moreNavItems, moreNavGroups }
}
