<!--
ChatterMate - App Sidebar
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
-->

<script setup lang="ts" name="AppSidebar">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { permissionChecks } from '@/utils/permissions'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

import conversationIcon from '@/assets/conversation.svg'
import aiAgentIcon from '@/assets/aiagent.svg'
import humanAgentIcon from '@/assets/humanagent.svg'
import organizationIcon from '@/assets/organization.svg'
import analyticsIcon from '@/assets/analytics.svg'
import configIcon from '@/assets/config.svg'
import subscriptionIcon from '@/assets/subscription.svg'
import userAvatar from '@/assets/user.svg'
import integrationsIcon from '@/assets/integrations.svg'
import widgetAppsIcon from '@/assets/widget-apps.svg'
import SidebarToggle from './SidebarToggle.vue'

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
    iconSrc?: string;
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
        iconSrc: aiAgentIcon,
        label: 'AI Agents',
        show: permissionChecks.canViewAgents()
    },
    {
        to: '/human-agents',
        iconSrc: humanAgentIcon,
        label: 'Human Agents',
        show: permissionChecks.canManageUsers()
    },
    {
        to: '/conversations',
        iconSrc: conversationIcon,
        label: 'Inbox',
        show: permissionChecks.canViewChats()
    },
    {
        to: '/analytics',
        iconSrc: analyticsIcon,
        label: 'Analytics',
        show: permissionChecks.canViewAnalytics()
    },
    {
        section: 'Settings',
        show: permissionChecks.canViewOrganization() || permissionChecks.canViewAIConfig()
    },
    {
        to: '/settings/organization',
        iconSrc: organizationIcon,
        label: 'Organization',
        show: permissionChecks.canViewOrganization()
    },
    {
        to: '/settings/subscription',
        iconSrc: subscriptionIcon,
        label: 'Subscription',
        show: hasEnterpriseModule && permissionChecks.canViewOrganization()
    },
    {
        to: '/settings/integrations',
        iconSrc: integrationsIcon,
        label: 'Integrations',
        show: permissionChecks.canViewOrganization()
    },
    {
        to: '/settings/widget-apps',
        iconSrc: widgetAppsIcon,
        label: 'Widget Apps',
        show: permissionChecks.canManageOrganization()
    },
    {
        to: '/settings/ai-config',
        iconSrc: configIcon,
        label: 'AI Configuration',
        show: permissionChecks.canViewAIConfig()
    },
    {
        to: '/settings/user',
        iconSrc: userAvatar,
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
                    <div v-else class="section-divider"></div>
                </div>

                <!-- Nav Item -->
                <router-link v-else-if="item.to" :to="item.to" class="nav-item"
                    :class="{ 'active': isActiveRoute(item.to) }"
                    @click="handleNavigation">
                    <span class="nav-icon">
                        <img v-if="item.iconSrc" :src="item.iconSrc" alt="" class="icon-img">
                        <span v-else>{{ item.label }}</span>
                    </span>
                    <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
                </router-link>
            </div>
        </nav>
    </aside>
</template>

<style scoped>
.sidebar {
    width: 230px;
    background: var(--bg2);
    border-right: 1px solid var(--o07);
    display: flex;
    flex-direction: column;
    transition: all var(--transition-normal);
    overflow: hidden;
    position: relative;
    height: 100vh;
    z-index: 100;
}

.sidebar.collapsed {
    width: 72px;
}

.sidebar-header {
    padding: 18px 14px 18px 16px;
    border-bottom: 1px solid var(--o07);
    position: relative;
    display: flex;
    align-items: center;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
}

/* 3-dot logo mark */
.logo-mark {
    width: 32px;
    height: 32px;
    background: var(--accent-ink);
    border-radius: 10px 10px 10px 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3.5px;
    flex-shrink: 0;
}

.dot {
    width: 4.5px;
    height: 4.5px;
    background: #0B0C10;
    border-radius: 50%;
}

.logo-text {
    font-family: var(--font-display);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--tracking-tight);
    font-size: var(--text-lg);
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sidebar-nav {
    flex: 1;
    padding: var(--space-md) 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
}

.nav-section {
    padding: 14px var(--space-md) 6px;
    color: var(--faint);
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    letter-spacing: .1em;
}

.nav-section.collapsed {
    padding: 14px 0 6px;
}

.section-divider {
    height: 1px;
    background: var(--o10);
    margin: 6px var(--space-sm);
}

.nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: 9px var(--space-md);
    color: var(--muted);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    text-decoration: none;
    border-radius: var(--radius-md);
    margin: 0 var(--space-xs);
    transition: background-color var(--transition-fast), color var(--transition-fast);
}

.nav-item:hover {
    background: var(--o06);
    color: var(--text);
}

.nav-item:focus-visible {
    outline: none;
    box-shadow: var(--ring-focus);
}

.nav-item.active {
    background: var(--o06);
    color: var(--text);
    font-weight: var(--font-weight-semibold);
}

/* Lime accent bar on the active item */
.nav-item.active::before {
    content: '';
    position: absolute;
    left: calc(-1 * var(--space-xs));
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    border-radius: var(--radius-full);
    background: var(--accent-ink);
}

.nav-icon {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.icon-img {
    width: 19px;
    height: 19px;
    object-fit: contain;
    filter: var(--icon-filter, brightness(0) invert(1));
    opacity: var(--icon-opacity, 0.5);
    transition: opacity var(--transition-fast);
}

.nav-item:hover .icon-img {
    opacity: 0.75;
}

.nav-item.active .icon-img {
    opacity: var(--icon-active-opacity, 0.9);
}

.nav-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Small laptops (1025px - 1280px) */
@media (max-width: 1280px) and (min-width: 1025px) {
    .sidebar {
        width: 220px;
        position: relative;
    }

    .sidebar.collapsed {
        width: 72px;
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
        width: 230px;
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