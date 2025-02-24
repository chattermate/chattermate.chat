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

import conversationIcon from '@/assets/conversation.svg'
import aiAgentIcon from '@/assets/aiagent.svg'
import humanAgentIcon from '@/assets/humanagent.svg'
import organizationIcon from '@/assets/organization.svg'
import analyticsIcon from '@/assets/analytics.svg'
import configIcon from '@/assets/config.svg'
import subscriptionIcon from '@/assets/subscription.svg'
import SidebarToggle from './SidebarToggle.vue'

defineProps<{
    isCollapsed: boolean
}>()

const emit = defineEmits<{
    (e: 'toggle'): void
    (e: 'navigate'): void
}>()

const route = useRoute()

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
        label: 'Conversations',
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
        show: permissionChecks.canViewOrganization()
    },
    {
        to: '/settings/ai-config',
        iconSrc: configIcon,
        label: 'AI Configuration',
        show: permissionChecks.canViewAIConfig()
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
                <img src="@/assets/logo.svg" alt="Logo" class="logo" />
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

        <!-- User Profile -->
        <!-- <div class="user-profile" :class="{ 'collapsed': isCollapsed }">
            <img :src="avatarUrl" alt="User" class="avatar" />
            <div v-if="!isCollapsed" class="user-info">
                <span class="user-name">{{ userName }}</span>
                <span class="user-role">Web Developer</span>
            </div>
        </div> -->
    </aside>
</template>

<style scoped>
.sidebar {
    width: 230px;

    background: var(--background-soft);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: all var(--transition-normal);
    overflow: hidden;
    position: relative;
}

.sidebar.collapsed {
    width: 90px;
}

.sidebar-header {
    /* padding: var(--space-md) var(--space-lg); */
    border-bottom: 1px solid var(--border-color);
    position: relative;
    display: flex;
    align-items: center;
}

.logo-container {
    display: flex;
    align-items: center;
}

.logo {
    width: 40px;
    height: 40px;
}

.logo-text {
    font-weight: 600;
    font-size: var(--text-lg);
    color: var(--text-color);
}

.sidebar-nav {
    flex: 1;
    padding: var(--space-md) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.nav-section {
    padding: var(--space-md) var(--space-md) var(--space-xs);
    color: var(--text-color);
    opacity: 0.7;
    font-size: var(--text-sm);
    font-weight: 500;
}

.section-divider {
    height: 1px;
    background: var(--border-color);
    margin: var(--space-xs) var(--space-sm);
}

.nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    color: var(--text-color);
    text-decoration: none;
    border-radius: var(--radius-md);
    margin: 0 var(--space-xs);
    transition: all var(--transition-fast);
}

.nav-item:hover {
    background: var(--background-mute);
}

.nav-item.active {
    background: var(--primary-color);
    color: var(--background-color);
}

.nav-item.active .icon-img {
    filter: brightness(0);
    /* Makes white SVG black when active */
}

.nav-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-img {
    width: 20px;
    height: 20px;
    object-fit: contain;
    transition: filter var(--transition-fast);
}

.nav-item:hover:not(.active) .icon-img {
    filter: brightness(0.8);
}

.nav-label {
    white-space: nowrap;
}

.user-profile {
    padding: var(--space-md);
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary-color);
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 500;
    color: var(--text-color);
}

.user-role {
    font-size: var(--text-sm);
    color: var(--text-color);
    opacity: 0.7;
}
</style>