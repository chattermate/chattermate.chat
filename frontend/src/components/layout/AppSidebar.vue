<!--
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
-->

<script setup lang="ts" name="AppSidebar">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { permissionChecks } from '@/utils/permissions'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

import SidebarToggle from './SidebarToggle.vue'

// Inline stroke icons matching the design (stroke="currentColor" so they
// inherit the nav color — muted by default, lime when active)
const NAV_ICONS: Record<string, string> = {
    agents: '<rect x="5" y="8" width="14" height="11" rx="3"/><line x1="12" y1="4" x2="12" y2="8"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/>',
    humans: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5 0 0 1 11 0"/><circle cx="16.5" cy="9" r="2.3"/><path d="M15 19a4.5 4 0 0 1 5.5-3.6"/>',
    inbox: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 13h5l1.5 2.5h4L19 13h2"/>',
    people: '<circle cx="9" cy="8" r="2.6"/><path d="M4 18a5 4.5 0 0 1 10 0"/><path d="M15.5 6.2a2.6 2.6 0 0 1 0 4.6"/><path d="M16 13.6A5 4.5 0 0 1 20 18"/>',
    analytics: '<line x1="5" y1="17" x2="5" y2="13"/><line x1="10" y1="17" x2="10" y2="9"/><line x1="15" y1="17" x2="15" y2="6"/><line x1="20" y1="17" x2="20" y2="11"/>',
    org: '<rect x="4" y="4" width="14" height="16" rx="2"/><line x1="20" y1="20" x2="20" y2="11"/><line x1="18" y1="11" x2="22" y2="11"/><circle cx="8" cy="9" r=".6" fill="currentColor"/><circle cx="12" cy="9" r=".6" fill="currentColor"/><circle cx="8" cy="13" r=".6" fill="currentColor"/><circle cx="12" cy="13" r=".6" fill="currentColor"/>',
    subscription: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="14" x2="11" y2="14"/>',
    integrations: '<line x1="12" y1="12" x2="6" y2="6"/><line x1="12" y1="12" x2="18" y2="6"/><line x1="12" y1="12" x2="12" y2="19"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="19" r="2"/>',
    widgets: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><circle cx="16.5" cy="16.5" r="3.5"/>',
    aiconfig: '<line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="9" cy="8" r="2.4"/><circle cx="15" cy="16" r="2.4"/>',
    usersettings: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 19a6.5 5.5 0 0 1 13 0"/>',
}

const navIconSvg = (name?: string) =>
    `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="${name === 'analytics' ? 2 : 1.7}" stroke-linecap="round" stroke-linejoin="round">${name ? (NAV_ICONS[name] || '') : ''}</svg>`

defineProps<{
    isCollapsed: boolean
}>()

const emit = defineEmits<{
    (e: 'toggle'): void
    (e: 'navigate'): void
}>()

const route = useRoute()

// Get enterprise features availability
const { hasEnterpriseModule } = useEnterpriseFeatures()

interface NavItem {
    to?: string;
    icon?: string;
    label?: string;
    section?: string;
    show?: boolean;
}

const navItems = computed(() => [
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

const isActiveRoute = computed(() => (path?: string) => path ? route.path === path : false)

const handleNavigation = () => {
    emit('navigate')
}
</script>

<template>
    <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
        <!-- Logo -->
        <div class="sidebar-header">
            <div class="logo-container">
                <div class="logo-mark" aria-hidden="true">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <span v-if="!isCollapsed" class="logo-text">ChatterMate</span>
            </div>
            <SidebarToggle :isCollapsed="isCollapsed" @toggle="emit('toggle')" />
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
            <div v-for="(item, index) in navItems" :key="index">
                <!-- Section Header -->
                <div v-if="item.section" class="nav-section" :class="{ 'collapsed': isCollapsed }">
                    <span v-if="!isCollapsed">{{ item.section }}</span>
                </div>

                <!-- Nav Item -->
                <router-link v-else-if="item.to" :to="item.to" class="nav-item"
                    :class="{ 'active': isActiveRoute(item.to) }"
                    :title="isCollapsed ? item.label : undefined"
                    @click="handleNavigation">
                    <span class="nav-bar" aria-hidden="true"></span>
                    <span class="nav-icon" v-html="navIconSvg(item.icon)"></span>
                    <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
                </router-link>
            </div>
        </nav>
    </aside>
</template>

<style scoped>
.sidebar {
    width: 252px;
    background: var(--bg2);
    border-right: 1px solid var(--o07);
    display: flex;
    flex-direction: column;
    transition: width .22s ease;
    overflow: hidden;
    position: relative;
    height: 100vh;
    z-index: 100;
}

.sidebar.collapsed {
    width: 76px;
}

.sidebar-header {
    padding: 20px 14px;
    border-bottom: 1px solid var(--o06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

/* Collapsed header: stack logo above the toggle, both centered */
.sidebar.collapsed .sidebar-header {
    flex-direction: column;
    justify-content: center;
    gap: 14px;
    padding: 18px 0;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
}

/* 3-dot logo mark */
.logo-mark {
    width: 32px;
    height: 32px;
    background: var(--accent-solid);
    border-radius: 10px 10px 10px 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    flex-shrink: 0;
}

.dot {
    width: 4.5px;
    height: 4.5px;
    background: var(--on-accent);
    border-radius: 50%;
}

.logo-text {
    font-family: var(--font-display);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--tracking-display);
    font-size: 18px;
    color: var(--text);
    white-space: nowrap;
    flex-shrink: 0;
}

.sidebar-nav {
    flex: 1;
    padding: 18px 14px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    /* Hide the scrollbar so it doesn't squeeze the centered icons when collapsed */
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.sidebar-nav::-webkit-scrollbar {
    display: none;
}

/* Collapsed: tighten side padding so icons sit dead-centre in the 76px rail */
.sidebar.collapsed .sidebar-nav {
    padding: 18px 8px;
}

.nav-section {
    padding: 0 13px;
    margin: 4px 0 12px;
    color: var(--faint);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    letter-spacing: .1em;
}

/* Collapsed: section label becomes an invisible spacer, no divider line */
.nav-section.collapsed {
    height: 16px;
    margin: 0;
    padding: 0;
}

.nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 11px 13px;
    margin-bottom: 4px;
    color: var(--muted);
    font-family: var(--font-sans);
    font-size: 14.5px;
    font-weight: var(--font-weight-medium);
    text-decoration: none;
    border-radius: var(--radius-btn);
    transition: background-color var(--transition-fast), color var(--transition-fast);
}

/* Collapsed: center the icon, drop the gap */
.sidebar.collapsed .nav-item {
    padding: 11px;
    gap: 0;
    justify-content: center;
}

.nav-item:hover:not(.active) {
    background: var(--o04);
    color: var(--text2);
}

.nav-item:focus-visible {
    outline: none;
    box-shadow: var(--ring-focus);
}

.nav-item.active {
    background: var(--accent-bg-12);
    color: var(--accent-ink);
    font-weight: var(--font-weight-semibold);
}

/* Lime accent bar on the active item */
.nav-bar {
    position: absolute;
    left: 0;
    top: 9px;
    bottom: 9px;
    width: 3px;
    border-radius: 3px;
    background: var(--accent-solid);
    opacity: 0;
}

.nav-item.active .nav-bar {
    opacity: 1;
}

/* Hide the active bar when collapsed */
.sidebar.collapsed .nav-item.active .nav-bar {
    opacity: 0;
}

.nav-icon {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: inherit;
}

.nav-icon :deep(svg) {
    width: 19px;
    height: 19px;
    display: block;
}

.nav-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Small laptops (1025px - 1280px) */
@media (max-width: 1280px) and (min-width: 1025px) {
    .sidebar {
        width: 248px;
        position: relative;
    }

    .sidebar.collapsed {
        width: 76px;
    }
}

/* Tablets and below - Overlay mode */
@media (max-width: 1024px) {
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 1000;
        box-shadow: 8px 0 32px rgba(0,0,0,.4);
        transform: translateX(0);
    }

    .sidebar.collapsed {
        transform: translateX(-100%);
        width: 252px;
    }

    /* In overlay mode the panel is full-width — restore expanded layout */
    .sidebar.collapsed .sidebar-header {
        flex-direction: row;
        justify-content: space-between;
        padding: 22px 20px;
    }

    .sidebar.collapsed .nav-item {
        padding: 11px 13px;
        gap: 13px;
        justify-content: flex-start;
    }
}

/* Mobile */
@media (max-width: 768px) {
    .sidebar {
        width: 280px;
        max-width: 85vw;
    }

    .sidebar.collapsed {
        width: 280px;
        max-width: 85vw;
    }
}

/* Very small mobile */
@media (max-width: 480px) {
    .sidebar {
        width: 100%;
        max-width: 100vw;
    }

    .sidebar.collapsed {
        width: 100%;
        max-width: 100vw;
    }

    .nav-item {
        padding: var(--space-md) var(--space-lg);
    }

    .nav-section {
        padding: var(--space-md) var(--space-lg) var(--space-xs);
    }
}
</style>