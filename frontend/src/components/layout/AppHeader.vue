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

<script setup lang="ts" name="AppHeader">
import { computed } from 'vue'
import { navIconSvg, formatBadgeCount } from './navItems'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import type { ThemeMode } from '@/composables/useTheme'

const props = defineProps<{
    /** The current page's name; no breadcrumb without one. */
    pageTitle?: string
    /** The sidebar section the page belongs to (first crumb). */
    section?: string
    isOnline: boolean
    statusUpdating: boolean
    unreadCount: number
    themeMode: ThemeMode
}>()

const emit = defineEmits<{
    (e: 'toggle-sidebar'): void
    (e: 'toggle-status'): void
    (e: 'toggle-theme'): void
    (e: 'notifications'): void
}>()

const { hasEnterpriseModule, enterpriseComponent, moduleImports } = useEnterpriseFeatures()
// Help button opening the hosted support chat (empty in OSS)
const SupportChatButton = enterpriseComponent(moduleImports.supportChatButton)
// Always-on offer pill: survives the promo strip being dismissed
const PromoHeaderPill = enterpriseComponent(moduleImports.promoHeaderPill)

const THEME_NEXT: Record<ThemeMode, string> = { dark: 'Light', light: 'System', system: 'Dark' }
const THEME_ICON: Record<ThemeMode, string> = { dark: 'moon', light: 'sun', system: 'monitor' }
const themeLabel = computed(
    () => `Theme: ${props.themeMode[0].toUpperCase()}${props.themeMode.slice(1)}. Switch to ${THEME_NEXT[props.themeMode]}`
)

const statusLabel = computed(() => (props.isOnline ? 'Online' : 'Offline'))
const statusAction = computed(() => (props.isOnline ? 'Go offline' : 'Go online'))
const badgeText = computed(() => formatBadgeCount(props.unreadCount))
const bellLabel = computed(() =>
    props.unreadCount ? `Notifications, ${props.unreadCount} unread` : 'Notifications'
)
</script>

<template>
    <header class="header">
        <div class="header-content">
            <div class="left-section">
                <!-- Opens the sidebar overlay on tablets (phones use the bottom nav) -->
                <button
                    type="button"
                    class="hamburger-menu"
                    aria-label="Open menu"
                    @click="emit('toggle-sidebar')"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </button>
                <nav v-if="pageTitle" class="breadcrumb" aria-label="Breadcrumb">
                    <template v-if="section">
                        <span class="crumb">{{ section }}</span>
                        <span class="crumb-sep" aria-hidden="true" v-html="navIconSvg('chevronRight', 14)"></span>
                    </template>
                    <span class="crumb current" aria-current="page">{{ pageTitle }}</span>
                </nav>
            </div>

            <div class="right-section">
                <button
                    type="button"
                    class="status-pill"
                    :class="{ online: isOnline }"
                    :aria-pressed="isOnline"
                    :aria-label="`Status: ${statusLabel}. ${statusAction}`"
                    :title="statusAction"
                    :disabled="statusUpdating"
                    @click="emit('toggle-status')"
                >
                    <span class="status-dot" aria-hidden="true"></span>
                    {{ statusLabel }}
                </button>
                <span class="topbar-divider" aria-hidden="true"></span>
                <SupportChatButton v-if="hasEnterpriseModule" />
                <PromoHeaderPill v-if="hasEnterpriseModule" />
                <button
                    type="button"
                    class="icon-btn"
                    :title="themeLabel"
                    :aria-label="themeLabel"
                    @click="emit('toggle-theme')"
                    v-html="navIconSvg(THEME_ICON[themeMode], 18)"
                ></button>
                <button
                    type="button"
                    class="icon-btn notification-button"
                    :aria-label="bellLabel"
                    aria-haspopup="dialog"
                    @click="emit('notifications')"
                >
                    <span class="bell" aria-hidden="true" v-html="navIconSvg('bell', 18)"></span>
                    <span v-if="unreadCount > 0" class="notification-badge" aria-hidden="true">{{ badgeText }}</span>
                </button>
            </div>
        </div>
    </header>
</template>

<style scoped>
.header {
    background: var(--topbar);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--o07);
    position: sticky;
    top: 0;
    z-index: var(--z-topbar);
    /* Standalone PWA: content extends under the status bar (black-translucent) */
    padding-top: var(--safe-top);
}

.header-content {
    min-height: 64px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
    padding: 12px 28px;
}

.left-section {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    min-width: 0;
}

.hamburger-menu {
    display: none;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: none;
    border: none;
    color: var(--text2);
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: background-color var(--transition-fast);
}

.hamburger-menu:hover {
    background: var(--o06);
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    white-space: nowrap;
}

.crumb {
    font-size: 13px;
    color: var(--muted);
    overflow: hidden;
    text-overflow: ellipsis;
}

.crumb.current {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: var(--font-weight-semibold);
    letter-spacing: var(--tracking-tight);
    color: var(--text);
}

.crumb-sep {
    display: flex;
    flex-shrink: 0;
    color: var(--faint);
}

.right-section {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-shrink: 0;
}

.status-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 12px 0 11px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--o10);
    background: var(--o04);
    color: var(--text2);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

.status-pill:hover:not(:disabled) {
    background: var(--o08);
}

.status-pill:disabled {
    cursor: progress;
    opacity: 0.7;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--muted);
}

.status-pill.online .status-dot {
    background: var(--c-positive);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-positive) 22%, transparent);
}

.topbar-divider {
    width: 1px;
    height: 22px;
    margin: 0 4px;
    background: var(--o10);
    flex-shrink: 0;
}

.icon-btn {
    position: relative;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: var(--o04);
    border: 1px solid var(--o10);
    border-radius: var(--radius-md);
    color: var(--text3);
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color var(--transition-fast), color var(--transition-fast);
}

.icon-btn:hover {
    background: var(--o08);
    color: var(--text);
}

.icon-btn :deep(svg),
.bell {
    display: flex;
}

.status-pill:focus-visible,
.icon-btn:focus-visible,
.hamburger-menu:focus-visible {
    outline: none;
    box-shadow: var(--ring-focus);
}

.notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 18px;
    height: 18px;
    box-sizing: border-box;
    padding: 0 4px;
    background-color: var(--c-danger);
    color: var(--on-danger);
    border: 2px solid var(--bg);
    border-radius: var(--radius-pill);
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: var(--font-weight-bold);
    line-height: 14px;
    text-align: center;
}

/* Small laptops: tighter bar */
@media (max-width: 1280px) {
    .header-content {
        padding: 10px var(--space-lg);
    }
}

/* Tablet: the sidebar is an overlay, opened from here */
@media (max-width: 1024px) {
    .hamburger-menu {
        display: flex;
    }
}

/* Phones: the bottom nav replaces the hamburger; drop the divider and the
   section crumb so the page name and controls fit */
@media (max-width: 768px) {
    .header-content {
        padding: 10px 12px;
        min-height: 56px;
    }

    .hamburger-menu,
    .topbar-divider,
    .crumb:not(.current),
    .crumb-sep {
        display: none;
    }

    .right-section {
        gap: 6px;
    }
}

/* Very small phones: the status lives in the More sheet */
@media (max-width: 480px) {
    .status-pill {
        display: none;
    }
}
</style>
