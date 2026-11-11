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

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import MoreSheet from '@/components/layout/MoreSheet.vue'
import { navIconSvg } from '@/components/layout/navIcons'
import userAvatar from '@/assets/user.svg'
import notificationIcon from '@/assets/notification.svg'
import NotificationList from '@/components/notifications/NotificationList.vue'
import EnablePushPrompt from '@/components/notifications/EnablePushPrompt.vue'
import { userService } from '@/services/user'
import { permissionChecks } from '@/utils/permissions'
import type { User } from '@/types/user'
import { useNotifications } from '@/composables/useNotifications'
import { notificationService } from '@/services/notification'
import { useRoute, useRouter } from 'vue-router'
import { updateUserStatus } from '@/services/users'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { useMyAvatar } from '@/composables/useMyAvatar'
import emitter from '@/utils/emitter'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { planDisplayName, planShortName, trialLabel, TRIAL_ENDING_SOON_DAYS } from '@/utils/planDisplay'

const props = defineProps<{
    hideSidebar?: boolean
    hideHeader?: boolean
}>()

// Initialize sidebar state based on current route and screen size
const route = useRoute()
const { isMobile: isPhone, isTablet: isMobile } = useBreakpoint()
const isSidebarOpen = ref(
    route.path !== '/conversations' && !isMobile.value
)
const showUserMenu = ref(false)
const showNotifications = ref(false)
const showMoreSheet = ref(false)
const currentUser = ref<User>(userService.getCurrentUser() as User)
const userName = ref(userService.getUserName())
const userRole = ref(userService.getUserRole())
const unreadCount = ref(0)
const statusUpdating = ref(false)
const { logout } = useAuth()
const { mode: themeMode, toggle: toggleTheme } = useTheme()
const themeTitle = computed(() =>
  themeMode.value === 'dark' ? 'Theme: Dark — click for Light'
    : themeMode.value === 'light' ? 'Theme: Light — click for System'
    : 'Theme: System — click for Dark'
)
// Attaches push listeners when permission is already granted; the permission
// request itself only happens from the EnablePushPrompt user gesture.
const { enableNotifications } = useNotifications()
const router = useRouter()

const PAGE_TITLES: Record<string, string> = {
    '/ai-agents': 'AI Agents',
    '/human-agents': 'Human Agents',
    '/conversations': 'Inbox',
    '/analytics': 'Analytics',
    '/settings/organization': 'Organization',
    '/settings/subscription': 'Subscription',
    '/settings/integrations': 'Integrations',
    '/settings/app-integrations': 'App Integrations',
    '/settings/widget-apps': 'Widget Apps',
    '/settings/ai-config': 'AI Configuration',
    '/settings/user': 'User Settings',
    '/settings/access-tokens': 'CLI & API tokens',
}
const pageTitle = computed(() => PAGE_TITLES[route.path] || '')

// Initialize enterprise features
const { hasEnterpriseModule, subscriptionStore, initializeSubscriptionStore, enterpriseComponent, moduleImports } = useEnterpriseFeatures()
// Promo strip / usage nudge / post-signup popup (enterprise only; empty in OSS)
const PromoSurfaces = enterpriseComponent(moduleImports.promoSurfaces)
// "Finish setup" bar until the org's agent is live (enterprise only; empty in OSS)
const SetupProgressBar = enterpriseComponent(moduleImports.setupProgressBar)
// Always-on offer pill in the header: survives the strip being dismissed
const PromoHeaderPill = enterpriseComponent(moduleImports.promoHeaderPill)
// Help button opening the hosted support chat (empty in OSS)
const SupportChatButton = enterpriseComponent(moduleImports.supportChatButton)

const currentPlan = computed(() => subscriptionStore.value.currentPlan)
const isLoadingPlan = computed(() => subscriptionStore.value.isLoadingPlan)
const isInTrial = computed(() => subscriptionStore.value.isInTrial)
const trialDaysLeft = computed(() => subscriptionStore.value.trialDaysLeft)
const planName = computed(() => planDisplayName(currentPlan.value?.plan))
// "(yearly)" is noise in a header badge
const trialBadgeText = computed(() => trialLabel(planShortName(planName.value), trialDaysLeft.value))
const trialEndingSoon = computed(() => trialDaysLeft.value <= TRIAL_ENDING_SOON_DAYS)
/** Paid tiers share one badge style; Free stays neutral. */
const planBadgeTone = computed(() => {
    const type = currentPlan.value?.plan?.type
    return type && type !== 'free' ? 'paid' : 'free'
})

// Never the stored URL: the copy we hold was signed at login and expires an
// hour later. useMyAvatar asks the API, which signs on the spot.
const myAvatar = useMyAvatar(() => currentUser.value?.profile_pic)
const userAvatarSrc = computed(() =>
  myAvatar.failed.value ? userAvatar : myAvatar.src.value ?? userAvatar)

const syncProfilePic = () => {
  const stored = userService.getCurrentUser()
  if (stored) currentUser.value = { ...currentUser.value, profile_pic: stored.profile_pic }
}
emitter.on('profile-pic-updated', syncProfilePic)
onBeforeUnmount(() => emitter.off('profile-pic-updated', syncProfilePic))

const toggleOnlineStatus = async () => {
  if (statusUpdating.value) return
  
  try {
    statusUpdating.value = true
    const newStatus = !currentUser.value?.is_online
    await updateUserStatus(currentUser.value?.id as string, newStatus)
    
    // Update local state
    currentUser.value = {
      ...currentUser.value,
      is_online: newStatus,
      last_seen: new Date().toISOString()
    } as User
    
    userService.setCurrentUser(currentUser.value as User)
    showUserMenu.value = false
  } catch (error) {
    console.error('Failed to update status:', error)
  } finally {
    statusUpdating.value = false
  }
}

// Bottom nav shows on phones only; hidden in fullscreen workflows and on the
// full-screen chat pane (mobile chat detail = /conversations with ?session=)
const showBottomNav = computed(() =>
    isPhone.value &&
    !props.hideSidebar &&
    !(route.path === '/conversations' && route.query.session)
)

// Watch for route changes to update sidebar state and close menus
watch(
  () => route.path,
  (newPath) => {
    showUserMenu.value = false
    showNotifications.value = false
    showMoreSheet.value = false

    // Set sidebar state based on route and screen size
    if (newPath === '/conversations') {
      isSidebarOpen.value = false // Collapsed for conversations
    } else if (isMobile.value) {
      isSidebarOpen.value = false // Collapsed on mobile by default
    } else {
      isSidebarOpen.value = true // Expanded for all other routes on desktop
    }
  }
)

const fetchUnreadCount = async () => {
    try {
        unreadCount.value = await notificationService.getUnreadCount()
    } catch (err) {
        console.error('Error fetching unread count:', err)
    }
}

// React to breakpoint changes (was a manual resize listener)
watch(isMobile, (mobile) => {
    if (mobile && isSidebarOpen.value) {
        isSidebarOpen.value = false
    } else if (!mobile && !isSidebarOpen.value && route.path !== '/conversations') {
        isSidebarOpen.value = true
    }
})

onMounted(() => {
    fetchUnreadCount()

    if (hasEnterpriseModule) {
        initializeSubscriptionStore().then(() => {
            subscriptionStore.value.fetchCurrentPlan().then(() => {
            }).catch((err: Error) => {
                console.error('Error fetching current plan:', err)
            })
        }).catch((err: Error) => {
            console.error('Error initializing subscription store:', err)
        })
    }
})

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
    // On mobile, close the sidebar when clicking backdrop
    if (isMobile.value) {
        isSidebarOpen.value = false
    }
}

const navigateToUpgrade = () => {
    router.push('/settings/subscription')
}

// The trial badge links to billing only for people who can open it
const canManageSubscription = permissionChecks.canManageSubscription()

// Computed for layout classes
const layoutClasses = computed(() => ({
    'sidebar-collapsed': !isSidebarOpen.value || props.hideSidebar,
    'header-hidden': props.hideHeader,
    'fullscreen-workflow': props.hideSidebar && props.hideHeader,
    'has-bottom-nav': showBottomNav.value
}))

const openNotificationsFromSheet = () => {
    showMoreSheet.value = false
    showNotifications.value = true
}

</script>

<template>
    <div class="dashboard-layout" :class="layoutClasses">
        <!-- Backdrop for mobile -->
        <div 
            v-if="!props.hideSidebar && isSidebarOpen" 
            class="sidebar-backdrop"
            @click="closeSidebar"
        ></div>

        <AppSidebar 
            v-if="!props.hideSidebar"
            :isCollapsed="!isSidebarOpen" 
            @toggle="toggleSidebar" 
        />

        <!-- Main Content -->
        <div class="main-content">
            <!-- Plan and offer surfaces (strip, AI-reply usage, popup, limit toast);
                 pages without the header still get the limit toast -->
            <PromoSurfaces v-if="hasEnterpriseModule" :toasts-only="props.hideHeader" />

            <!-- Header -->
            <header v-if="!props.hideHeader" class="header">
                <div class="header-content">
                    <div class="left-section">
                        <!-- Hamburger menu for mobile -->
                        <button class="hamburger-menu" @click="toggleSidebar" aria-label="Toggle menu">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <h1 v-if="pageTitle" class="topbar-page-title">{{ pageTitle }}</h1>
                    </div>
                    <div class="right-section">
                        <button class="icon-btn" @click="toggleTheme" :title="themeTitle" :aria-label="themeTitle"
                            v-html="navIconSvg(themeMode === 'dark' ? 'moon' : themeMode === 'light' ? 'sun' : 'monitor', 17)">
                        </button>
                        <SupportChatButton v-if="hasEnterpriseModule" />
                        <PromoHeaderPill v-if="hasEnterpriseModule" />
                        <div v-if="hasEnterpriseModule && (isLoadingPlan || isInTrial)" class="plan-display">
                            <div v-if="isLoadingPlan" class="plan-loading">
                                <span class="loading-spinner"></span>
                                Loading...
                            </div>
                            <div v-else-if="isInTrial" class="trial-info">
                                <span
                                    class="trial-badge"
                                    :class="{ clickable: canManageSubscription, 'ending-soon': trialEndingSoon }"
                                    @click="canManageSubscription && navigateToUpgrade()"
                                >
                                    {{ trialBadgeText }}
                                </span>
                            </div>
                        </div>
                        <div class="user-menu">
                            <button class="notification-button" @click="showNotifications = !showNotifications">
                                <img :src="notificationIcon" alt="Notifications" class="notification-icon" />
                                <span v-if="unreadCount > 0" class="notification-badge">
                                    {{ unreadCount > 99 ? '99+' : unreadCount }}
                                </span>
                            </button>

                            <div class="topbar-divider" aria-hidden="true"></div>

                            <div class="user-profile">
                                <div class="profile-trigger" @click="showUserMenu = !showUserMenu">
                                    <div class="avatar-wrapper">
                                        <img :src="userAvatarSrc" alt="User" class="avatar" @error="myAvatar.onError" />
                                        <span 
                                            class="status-indicator" 
                                            :class="{ 'online': currentUser?.is_online }"
                                        ></span>
                                    </div>
                                    <div class="user-info" v-if="isSidebarOpen">
                                        <span class="name">{{ userName }}</span>
                                        <div class="plan-info">
                                            <span class="plan-badge" :class="planBadgeTone">
                                                <span class="plan-icon">⚡</span>
                                                {{ planName }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="dropdown-menu" v-if="showUserMenu">
                                    <div class="status-menu-item">
                                      <span class="status-label">Status:</span>
                                      <button 
                                        class="status-toggle" 
                                        :class="{ 'online': currentUser?.is_online }"
                                        @click="toggleOnlineStatus"
                                        :disabled="statusUpdating"
                                      >
                                        {{ currentUser?.is_online ? 'Online' : 'Offline' }}
                                      </button>
                                    </div>
                                    <div class="menu-divider"></div>
                                    
                                    <button class="menu-item" @click="logout">Logout</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Main Content Area -->
            <main class="content">
                <!-- The agents page shows its own copy, beside the wizard and list -->
                <SetupProgressBar v-if="route.name !== 'ai-agents'" />
                <slot></slot>
            </main>

            <!-- Footer: omitted for full-page layouts (hideHeader, e.g. ConversationsView) —
                 those pages size .content to a fixed 100vh, so a footer still taking up
                 real space at the bottom clips the last message / message input out of view. -->
            <footer v-if="!props.hideHeader" class="footer">
                <div class="footer-content">
                    <p>&copy; 2024 ChatterMate. All rights reserved.</p>
                    <nav class="footer-links">
                        <a href="https://chattermate.chat/privacy_policy.html">Privacy Policy</a>
                        <a href="https://chattermate.chat/terms_and_conditions.html">Terms of Service</a>
                    </nav>
                </div>
            </footer>
        </div>

        <!-- Notification drawer (fixed) — outside the header so the More sheet
             can open it on pages that hide the header (e.g. Inbox) -->
        <NotificationList :is-open="showNotifications" @close="showNotifications = false"
            @notification-read="fetchUnreadCount" />

        <EnablePushPrompt @enable="enableNotifications" />

        <!-- Mobile app shell -->
        <BottomNav
            v-if="showBottomNav"
            :unread-count="unreadCount"
            :more-open="showMoreSheet"
            @more="showMoreSheet = true"
        />
        <MoreSheet
            :open="showMoreSheet"
            :is-online="currentUser?.is_online"
            :status-updating="statusUpdating"
            :theme-mode="themeMode"
            :unread-count="unreadCount"
            @close="showMoreSheet = false"
            @toggle-status="toggleOnlineStatus"
            @toggle-theme="toggleTheme"
            @notifications="openNotificationsFromSheet"
            @logout="logout"
        />
    </div>
</template>

<style scoped>
.dashboard-layout {
    display: grid;
    grid-template-columns: auto 1fr;
    height: 100vh;
    height: 100dvh;
    transition: grid-template-columns var(--transition-normal);
    overflow: hidden;
    width: 100%;
    position: relative;
}

.sidebar-backdrop {
    display: none;
}

/* Sidebar Styles */
.sidebar {
    background: var(--background-soft);
    border-right: 1px solid var(--border-color);
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--border-color);
}

.logo {
    height: 32px;
}

.toggle-btn {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    opacity: 0.7;
    transition: var(--transition-fast);
}

.toggle-btn:hover {
    opacity: 1;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    color: var(--text-color);
    text-decoration: none;
    border-radius: var(--radius-sm);
    transition: var(--transition-fast);
}

.nav-item:hover {
    background: var(--background-mute);
}

.nav-item.active {
    background: var(--accent-solid);
    color: var(--background-color);
}

/* Header Styles */
.header {
    background: var(--topbar);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--o07);
    position: sticky;
    top: 0;
    z-index: 50;
    /* Standalone PWA: content extends under the status bar (black-translucent) */
    padding-top: var(--safe-top);
}

.topbar-page-title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: var(--font-weight-semibold);
    letter-spacing: -0.01em;
    color: var(--text2);
    margin: 0;
    line-height: 1;
}

.icon-btn {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--o04);
    border: 1px solid var(--o10);
    border-radius: 10px;
    color: var(--text3);
    cursor: pointer;
    transition: background-color var(--transition-fast), color var(--transition-fast);
    flex-shrink: 0;
}

.icon-btn:hover {
    background: var(--o08);
    color: var(--text);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) var(--space-xl);
}

.left-section {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.hamburger-menu {
    display: none;
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    transition: var(--transition-fast);
}

.hamburger-menu:hover {
    background: var(--background-mute);
}

.hamburger-menu svg {
    display: block;
}

.right-section {
    display: flex;
    align-items: center;
    gap: 18px;
}

.search input {
    background: var(--background-mute);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-full);
    padding: var(--space-sm) var(--space-lg);
    color: var(--text-color);
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 18px;
}

.notifications {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    opacity: 0.7;
    transition: var(--transition-fast);
}

.notifications:hover {
    opacity: 1;
}

.user-profile {
    position: relative;
    cursor: pointer;
}

.profile-trigger {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.avatar-wrapper {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--grad-purple-teal);
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.name {
    font-weight: 500;
}

.role {
    font-size: var(--text-sm);
    opacity: 0.7;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--surface);
    border: 1px solid var(--o10);
    border-radius: 16px;
    padding: var(--space-xs);
    margin-top: var(--space-sm);
    min-width: 220px;
    z-index: 100;
    box-shadow: var(--shadow-lg);
}

.menu-item {
    display: block;
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    text-align: left;
    background: none;
    border: none;
    color: var(--text3);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-sans);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background-color var(--transition-fast), color var(--transition-fast);
}

.menu-item:hover {
    background: var(--o06);
    color: var(--text);
}

/* Content Styles */
.content {
    padding: var(--space-xl);
}

/* Remove padding when header is hidden (for full-page layouts like ConversationsView) */
.dashboard-layout.header-hidden .content {
    padding: 0;
}

/* Footer Styles */
.footer {
    background: var(--bg2);
    border-top: 1px solid var(--o07);
    padding: var(--space-lg) var(--space-xl);
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-links {
    display: flex;
    gap: var(--space-lg);
}

.footer-links a {
    color: var(--text-color);
    text-decoration: none;
    opacity: 0.7;
    transition: var(--transition-fast);
}

.footer-links a:hover {
    opacity: 1;
}

.notification-button {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--o04);
    border: 1px solid var(--o10);
    border-radius: 10px;
    color: var(--muted);
    padding: 0;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: background-color var(--transition-fast), color var(--transition-fast);
}

.notification-button:hover {
    background: var(--o08);
    color: var(--text);
}

.notification-icon {
    width: 18px;
    height: 18px;
    filter: var(--icon-filter, brightness(0) invert(1));
    opacity: var(--icon-opacity, 0.55);
}

.notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    background-color: var(--c-danger);
    color: #fff;
    border: 1.5px solid var(--bg);
    border-radius: var(--radius-pill);
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: var(--font-weight-bold);
    display: flex;
    align-items: center;
    justify-content: center;
}

.status-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--muted);
    border: 2px solid var(--bg2);
}

.status-indicator.online {
    background-color: var(--success-color);
}

.topbar-divider {
    width: 1px;
    height: 26px;
    background: var(--o10);
    flex-shrink: 0;
}

.status-menu-item {
    padding: var(--space-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
}

.status-label {
    color: var(--text-muted);
    font-size: 0.9rem;
}

.status-toggle {
    background: var(--background-mute);
    border: none;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.status-toggle.online {
    background: var(--success-color);
    color: white;
}

.status-toggle:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.menu-divider {
    height: 1px;
    background: var(--o08);
    margin: var(--space-xs) 0;
}

.plan-display {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.plan-loading {
    color: var(--text-muted);
    font-size: var(--text-sm);
}

.plan-info {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-top: 2px;
}

.plan-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: 600;
    background: var(--o08);
    color: var(--text3);
}

.plan-badge.paid {
    background: var(--accent-solid);
    color: var(--on-accent-solid);
}

.plan-icon {
    font-size: var(--text-xs);
}

.upgrade-button.gradient {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    font-size: var(--text-xs);
    font-weight: 600;
    color: white;
    background: linear-gradient(45deg, var(--accent-solid), var(--accent-solid));
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all 0.2s ease;
}

.upgrade-button.gradient:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
}

.upgrade-icon {
    font-size: var(--text-xs);
}

.upgrade-button {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    background-color: var(--accent-solid);
    color: white;
    border: none;
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.upgrade-button:hover {
    background-color: var(--accent-solid);
    transform: translateY(-1px);
}

.trial-info {
    display: flex;
    align-items: center;
    margin-right: 12px;
}

.trial-badge {
    background: var(--accent-solid);
    color: var(--on-accent-solid);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.trial-badge:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
}

.trial-badge.clickable {
    cursor: pointer;
}

.trial-badge.ending-soon {
    background: var(--warning-bg);
    color: var(--warning-color);
    box-shadow: inset 0 0 0 1px var(--warning-border);
}

.main-content {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
}

.content {
    flex: 1;
    padding: var(--space-xl);
}

/* Fullscreen workflow mode */
.dashboard-layout.fullscreen-workflow {
    grid-template-columns: 1fr;
}

.dashboard-layout.fullscreen-workflow .main-content {
    padding: 0;
    min-height: 100vh;
    min-height: 100dvh;
}

.dashboard-layout.fullscreen-workflow .content {
    padding: 0;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
}

.dashboard-layout.header-hidden .main-content {
    min-height: 100vh;
    min-height: 100dvh;
}

.dashboard-layout.header-hidden .content {
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
}

/* Responsive Design - 13 inch laptops */
@media (max-width: 1366px) {
    .header-content {
        padding: var(--space-md) var(--space-lg);
    }
    
    .content {
        padding: var(--space-lg);
    }
    
    .plan-badge {
        font-size: 0.7rem;
        padding: 2px 6px;
    }
}

/* Responsive Design - Small laptops (1025px - 1280px) */
@media (max-width: 1280px) and (min-width: 1025px) {
    /* Keep normal grid layout with sidebar in this range */
    .dashboard-layout {
        grid-template-columns: auto 1fr;
    }
    
    .dashboard-layout.sidebar-collapsed {
        grid-template-columns: auto 1fr;
    }
    
    .header-content {
        padding: var(--space-sm) var(--space-md);
    }
    
    .content {
        padding: var(--space-md);
    }
    
    .right-section {
        gap: var(--space-md);
    }
    
    .trial-badge {
        font-size: 0.75rem;
        padding: 3px 10px;
    }
}

/* Tablet and below (overlay mode) */
@media (max-width: 1024px) {
    .dashboard-layout {
        grid-template-columns: 1fr;
    }
    
    .sidebar-backdrop {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        backdrop-filter: blur(2px);
    }
    
    .dashboard-layout.sidebar-collapsed .sidebar-backdrop {
        display: none;
    }
    
    .hamburger-menu {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .user-info {
        display: none !important;
    }
    
    .plan-display .plan-info {
        display: none;
    }
    
    .trial-info {
        margin-right: 0;
    }
    
    .footer-content {
        flex-direction: column;
        gap: var(--space-md);
        text-align: center;
    }
    
    .footer-links {
        flex-direction: column;
        gap: var(--space-sm);
    }
}

/* Mobile responsive */
@media (max-width: 768px) {
    /* Breathing room above/below the 38px controls so they don't crowd the
       bottom border of the bar */
    .header-content {
        padding: 10px 12px;
    }

    /* The divider reads as a line touching the avatar at this size; the gap
       between the controls is enough separation on its own */
    .topbar-divider {
        display: none;
    }

    .user-menu {
        gap: 10px;
    }

    .content {
        padding: var(--space-sm);
    }

    /* Bottom nav replaces the hamburger/drawer on phones */
    .hamburger-menu {
        display: none;
    }

    /* Reserve space for the fixed bottom nav */
    .dashboard-layout.has-bottom-nav .content {
        padding-bottom: calc(var(--bottom-nav-height) + var(--safe-bottom) + var(--space-sm));
    }

    .dashboard-layout.has-bottom-nav .footer {
        display: none;
    }

    /* Full-height pages (Inbox): shrink the content area instead of padding it.
       flex: 0 0 auto is required — the default flex: 1 zeroes the flex basis and
       grows back to the full 100dvh, putting the page bottom under the nav. */
    .dashboard-layout.has-bottom-nav.header-hidden .content {
        flex: 0 0 auto;
        height: calc(100dvh - var(--bottom-nav-height) - var(--safe-bottom));
        padding-bottom: 0;
    }
    
    .right-section {
        gap: var(--space-sm);
    }
    
    .trial-badge {
        font-size: 0.7rem;
        padding: 2px 8px;
    }
    
    .notification-badge {
        min-width: 16px;
        height: 16px;
        font-size: 10px;
    }
    
    .avatar {
        width: 28px;
        height: 28px;
    }
    
    .avatar-wrapper {
        width: 28px;
        height: 28px;
    }
    
    .dropdown-menu {
        right: 0;
        left: auto;
        min-width: 140px;
    }
    
    .footer {
        padding: var(--space-md);
    }
    
    .footer-content p {
        font-size: var(--text-sm);
    }
}

/* Very small mobile devices */
@media (max-width: 480px) {
    /* Keeps the 38px controls off the bar's bottom border */
    .header-content {
        padding: 9px 10px;
    }
    
    .content {
        padding: var(--space-xs);
    }
    
    .plan-display {
        display: none !important;
    }
    
    .user-menu {
        gap: var(--space-xs);
    }
    
    .notification-button {
        padding: var(--space-xs);
    }
    
    .notification-icon {
        width: 20px;
        height: 20px;
    }
    
    .avatar {
        width: 24px;
        height: 24px;
    }
    
    .avatar-wrapper {
        width: 24px;
        height: 24px;
    }
    
    .status-indicator {
        width: 8px;
        height: 8px;
        border-width: 1px;
    }
    
    .dropdown-menu {
        min-width: 120px;
        font-size: var(--text-sm);
    }
    
    .menu-item {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--text-sm);
    }
    
    .footer {
        padding: var(--space-sm);
    }
    
    .footer-content {
        gap: var(--space-sm);
    }
    
    .footer-content p {
        font-size: var(--text-xs);
    }
    
    .footer-links a {
        font-size: var(--text-xs);
    }
}
</style>