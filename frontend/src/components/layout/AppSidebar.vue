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
import { useNavItems, navIconSvg, navItemCovers, NAV_SECTIONS, type NavItem } from './navItems'
import { useSettingsGroup } from './useSettingsGroup'
import type { NavBadgeTone } from './SidebarNavLink.vue'
import SidebarToggle from './SidebarToggle.vue'
import SidebarNavLink from './SidebarNavLink.vue'
import SidebarAccount from './SidebarAccount.vue'
import BrandMark from '@/components/common/BrandMark.vue'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import type { User } from '@/types/user'

const props = defineProps<{
    isCollapsed: boolean
    user: User | null
    role: string
    isOnline: boolean
    statusUpdating: boolean
    /** Conversations waiting for a human: the Inbox badge. */
    inboxCount?: number | null
    /** Open tickets: the Tickets badge. */
    ticketsCount?: number | null
}>()

const emit = defineEmits<{
    (e: 'toggle'): void
    (e: 'navigate'): void
    (e: 'toggle-status'): void
    (e: 'logout'): void
}>()

const route = useRoute()
const { sidebarGroups, accountItems } = useNavItems()
const { hasEnterpriseModule, enterpriseComponent, moduleImports } = useEnterpriseFeatures()
// Plan / trial card with the upgrade button (enterprise only; empty in OSS)
const SidebarPlanCard = enterpriseComponent(moduleImports.sidebarPlanCard)

const workspaceGroups = computed(() =>
    sidebarGroups.value.filter((group) => group.section !== NAV_SECTIONS.settings)
)
const settingsItems = computed<NavItem[]>(
    () => sidebarGroups.value.find((group) => group.section === NAV_SECTIONS.settings)?.items ?? []
)

const settingsGroup = useSettingsGroup(settingsItems)
const settingsExpanded = computed(() => settingsGroup.isOpen.value && !props.isCollapsed)

// A link is current on its own page and the pages beneath it (/tickets/:id)
const isActive = (item: NavItem) => navItemCovers(item, route.path)

interface Badge {
    count: number | null | undefined
    tone: NavBadgeTone
    hint: string
}

const badges = computed<Record<string, Badge>>(() => ({
    '/conversations': { count: props.inboxCount, tone: 'accent', hint: 'waiting for a human' },
    '/tickets': { count: props.ticketsCount, tone: 'neutral', hint: 'open' },
}))

// On the rail there is no room for the group: open the sidebar with it shown
const onSettingsClick = () => {
    if (props.isCollapsed) {
        settingsGroup.setOpen(true)
        emit('toggle')
    } else {
        settingsGroup.toggle()
    }
}
</script>

<template>
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
        <div class="sidebar-header">
            <div class="logo-container">
                <BrandMark :size="28" />
                <span v-if="!isCollapsed" class="logo-text brand-wordmark">ChatterMate</span>
            </div>
            <SidebarToggle :isCollapsed="isCollapsed" @toggle="emit('toggle')" />
        </div>

        <nav class="sidebar-nav" aria-label="Main navigation">
            <section v-for="group in workspaceGroups" :key="group.section" class="nav-group">
                <h2 v-if="!isCollapsed" class="nav-section nav-section-heading">{{ group.section }}</h2>
                <SidebarNavLink
                    v-for="item in group.items"
                    :key="item.to"
                    :item="item"
                    :active="isActive(item)"
                    :collapsed="isCollapsed"
                    :badge="badges[item.to!]?.count"
                    :badge-tone="badges[item.to!]?.tone"
                    :badge-hint="badges[item.to!]?.hint"
                    @navigate="emit('navigate')"
                />
            </section>

            <section v-if="settingsItems.length" class="nav-group settings-group">
                <div v-if="isCollapsed" class="rail-divider" aria-hidden="true"></div>
                <button
                    type="button"
                    class="settings-toggle"
                    :class="{ collapsed: isCollapsed, current: settingsGroup.onSettingsPage.value }"
                    :aria-expanded="settingsExpanded"
                    :aria-controls="isCollapsed ? undefined : 'sidebar-settings-items'"
                    :aria-label="isCollapsed ? NAV_SECTIONS.settings : undefined"
                    :title="isCollapsed ? NAV_SECTIONS.settings : undefined"
                    @click="onSettingsClick"
                >
                    <span class="nav-icon" aria-hidden="true" v-html="navIconSvg('settings', 18)"></span>
                    <template v-if="!isCollapsed">
                        <span class="nav-label">{{ NAV_SECTIONS.settings }}</span>
                        <span
                            class="chevron"
                            :class="{ open: settingsExpanded }"
                            aria-hidden="true"
                            v-html="navIconSvg('chevronDown', 14)"
                        ></span>
                    </template>
                </button>
                <!-- Not on the rail at all; v-show keeps the open/close cheap otherwise -->
                <div v-if="!isCollapsed" v-show="settingsExpanded" id="sidebar-settings-items" class="settings-items">
                    <SidebarNavLink
                        v-for="item in settingsItems"
                        :key="item.to"
                        :item="item"
                        :active="isActive(item)"
                        :collapsed="false"
                        nested
                        @navigate="emit('navigate')"
                    />
                </div>
            </section>
        </nav>

        <div class="sidebar-footer">
            <SidebarPlanCard v-if="hasEnterpriseModule" :collapsed="isCollapsed" />
            <SidebarAccount
                :user="user"
                :role="role"
                :is-online="isOnline"
                :status-updating="statusUpdating"
                :collapsed="isCollapsed"
                :items="accountItems"
                @toggle-status="emit('toggle-status')"
                @logout="emit('logout')"
                @navigate="emit('navigate')"
            />
        </div>
    </aside>
</template>

<style scoped>
.sidebar {
    --sidebar-width: 248px;
    --rail-width: 64px;

    width: var(--sidebar-width);
    background: var(--bg2);
    border-right: 1px solid var(--o07);
    display: flex;
    flex-direction: column;
    transition: width var(--transition-normal);
    overflow: hidden;
    position: relative;
    height: 100vh;
    height: 100dvh;
    z-index: 100;
}

.sidebar.collapsed {
    width: var(--rail-width);
    /* The account menu opens beside the rail */
    overflow: visible;
}

.sidebar-header {
    min-height: 64px;
    box-sizing: border-box;
    padding: 0 12px 0 18px;
    border-bottom: 1px solid var(--o06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
}

/* Collapsed header: logo above the toggle, both centered */
.sidebar.collapsed .sidebar-header {
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    padding: 14px 0;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.logo-text {
    font-size: 20px;
    color: var(--text);
    white-space: nowrap;
}

.sidebar-nav {
    flex: 1;
    min-height: 0;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
    overflow-x: hidden;
    /* Hide the scrollbar so it doesn't squeeze the centered icons when collapsed */
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.sidebar-nav::-webkit-scrollbar {
    display: none;
}

.sidebar.collapsed .sidebar-nav {
    padding: 16px 8px;
}

.nav-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

/* Typography comes from the shared .nav-section-heading (components.css) */
.nav-section {
    margin: 0;
    padding: 0 12px 8px;
}

.rail-divider {
    height: 1px;
    margin: 0 8px 12px;
    background: var(--o08);
}

.settings-toggle {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    height: 36px;
    padding: 0 12px;
    border: 0;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--muted);
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: var(--font-weight-medium);
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color var(--transition-fast), color var(--transition-fast);
}

.settings-toggle.collapsed {
    justify-content: center;
    padding: 0;
    gap: 0;
}

/* On a settings page with the rail, the gear stands in for the active link */
.settings-toggle.collapsed.current {
    background: var(--accent-bg-12);
    color: var(--accent-ink);
}

.settings-toggle:hover {
    background: var(--o04);
    color: var(--text2);
}

.settings-toggle:focus-visible {
    outline: none;
    box-shadow: var(--ring-focus);
}

.nav-icon {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.nav-icon :deep(svg) {
    display: block;
}

.nav-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chevron {
    display: flex;
    flex-shrink: 0;
    transition: transform var(--transition-fast);
}

.chevron.open {
    transform: rotate(180deg);
}

.settings-items {
    margin: 2px 0 0 21px;
    padding-left: 12px;
    border-left: 1px solid var(--o10);
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.sidebar-footer {
    flex-shrink: 0;
    padding: 12px;
    border-top: 1px solid var(--o06);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.sidebar.collapsed .sidebar-footer {
    padding: 12px 8px;
}

@media (prefers-reduced-motion: reduce) {
    .sidebar,
    .chevron {
        transition: none;
    }
}

/* Tablets and below - Overlay mode */
@media (max-width: 1024px) {
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: var(--z-drawer);
        box-shadow: 8px 0 32px rgba(0, 0, 0, 0.4);
        transform: translateX(0);
    }

    .sidebar.collapsed {
        transform: translateX(-100%);
        width: var(--sidebar-width);
        overflow: hidden;
        /* An off-canvas panel must not keep painting its shadow over the page.
           Sliding it out moves the box, not the shadow's reach: with an 8px
           offset and 32px blur, roughly 24px of it still lands on the page's
           left edge, above the content. On the dark theme that is black on
           near-black and invisible; on the light theme it reads as a grey band
           down the side. */
        box-shadow: none;
    }
}

/* Mobile */
@media (max-width: 768px) {
    .sidebar,
    .sidebar.collapsed {
        width: 280px;
        max-width: 85vw;
    }
}

/* Very small mobile */
@media (max-width: 480px) {
    .sidebar,
    .sidebar.collapsed {
        width: 100%;
        max-width: 100vw;
    }
}
</style>
