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

<script setup lang="ts" name="SidebarNavLink">
import { computed } from 'vue'
import { navIconSvg, formatBadgeCount, type NavItem } from './navItems'

export type NavBadgeTone = 'accent' | 'neutral'

const props = defineProps<{
    item: NavItem
    active: boolean
    collapsed: boolean
    /** A count shown beside the label (a dot on the collapsed rail); none when empty. */
    badge?: number | null
    badgeTone?: NavBadgeTone
    /** What the count means, for the tooltip: "waiting for a human". */
    badgeHint?: string
    /** Indented, icon-less child of a collapsible group. */
    nested?: boolean
}>()

defineEmits<{
    (e: 'navigate'): void
}>()

const badgeText = computed(() => formatBadgeCount(props.badge))
const badgeTitle = computed(() => (props.badgeHint ? `${props.badge} ${props.badgeHint}` : undefined))
</script>

<template>
    <router-link
        v-if="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active, collapsed, nested }"
        :aria-current="active ? 'page' : undefined"
        :aria-label="collapsed ? item.label : undefined"
        :title="collapsed ? item.label : undefined"
        @click="$emit('navigate')"
    >
        <span v-if="!nested" class="nav-bar" aria-hidden="true"></span>
        <span v-if="!nested" class="nav-icon" aria-hidden="true" v-html="navIconSvg(item.icon, 18)"></span>
        <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
        <template v-if="badge">
            <!-- Visual only: the link's name stays the page name (assistive tech
                 and tests find it by that); the hint explains the number on hover -->
            <span v-if="collapsed" class="nav-dot" :class="badgeTone ?? 'neutral'" aria-hidden="true"></span>
            <span v-else class="nav-badge" :class="badgeTone ?? 'neutral'" :title="badgeTitle" aria-hidden="true">{{ badgeText }}</span>
        </template>
    </router-link>
</template>

<style scoped>
.nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    height: 36px;
    padding: 0 12px;
    color: var(--muted);
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: var(--font-weight-medium);
    text-decoration: none;
    white-space: nowrap;
    border-radius: var(--radius-md);
    transition: background-color var(--transition-fast), color var(--transition-fast);
}

.nav-item.collapsed {
    justify-content: center;
    padding: 0;
    gap: 0;
}

.nav-item.nested {
    height: 32px;
    padding: 0 10px;
    font-size: 13px;
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

/* Accent bar on the active item: --accent-ink, which keeps 3:1 against white */
.nav-bar {
    position: absolute;
    left: 0;
    top: 9px;
    bottom: 9px;
    width: 3px;
    border-radius: 3px;
    background: var(--accent-ink);
    opacity: 0;
}

.nav-item.active:not(.collapsed) .nav-bar {
    opacity: 1;
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

.nav-badge {
    flex-shrink: 0;
    min-width: 20px;
    height: 20px;
    box-sizing: border-box;
    padding: 0 6px;
    border-radius: var(--radius-pill);
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: var(--font-weight-bold);
    line-height: 20px;
    text-align: center;
}

.nav-badge.accent {
    background: var(--accent-solid);
    color: var(--on-accent-solid);
}

.nav-badge.neutral {
    background: var(--o08);
    color: var(--text3);
}

.nav-dot {
    position: absolute;
    top: 6px;
    right: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--bg2);
}

.nav-dot.accent {
    background: var(--accent-ink);
}

.nav-dot.neutral {
    background: var(--muted);
}
</style>
