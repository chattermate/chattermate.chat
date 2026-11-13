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
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import MoreSheet from '@/components/layout/MoreSheet.vue'
import { useNavItems } from '@/components/layout/navItems'
import NotificationList from '@/components/notifications/NotificationList.vue'
import EnablePushPrompt from '@/components/notifications/EnablePushPrompt.vue'
import FailedSourceNotice from '@/components/knowledge/FailedSourceNotice.vue'
import { userService } from '@/services/user'
import type { User } from '@/types/user'
import { useNotifications } from '@/composables/useNotifications'
import { notificationService } from '@/services/notification'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { useAgentStatus } from '@/composables/useAgentStatus'
import { useNavCounts } from '@/composables/useNavCounts'
import { useDocumentTitle } from '@/composables/useDocumentTitle'
import { routePageTitle } from '@/router/pageTitles'
import emitter from '@/utils/emitter'
import { useBreakpoint } from '@/composables/useBreakpoint'

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
const showNotifications = ref(false)
const showMoreSheet = ref(false)
const currentUser = ref<User | null>(userService.getCurrentUser())
const userRole = userService.getUserRole()
const unreadCount = ref(0)
const { logout } = useAuth()
const { mode: themeMode, toggle: toggleTheme } = useTheme()
const { isOnline, statusUpdating, toggleOnline } = useAgentStatus(currentUser)
const { waitingForHuman, openTickets } = useNavCounts()
const { sectionFor } = useNavItems()
// Attaches push listeners when permission is already granted; the permission
// request itself only happens from the EnablePushPrompt user gesture.
const { enableNotifications } = useNotifications()

useDocumentTitle(waitingForHuman)

const pageTitle = computed(() => routePageTitle(route))
const pageSection = computed(() => sectionFor(route.path))

const { hasEnterpriseModule, subscriptionStore, initializeSubscriptionStore, enterpriseComponent, moduleImports } = useEnterpriseFeatures()
// Promo strip / usage nudge / post-signup popup (enterprise only; empty in OSS)
const PromoSurfaces = enterpriseComponent(moduleImports.promoSurfaces)
// "Finish setup" bar until the org's agent is live (enterprise only; empty in OSS)
const SetupProgressBar = enterpriseComponent(moduleImports.setupProgressBar)

// The avatar is signed on demand (useMyAvatar); a new upload only needs the
// stored profile_pic to change for it to refetch
const syncProfilePic = () => {
  const stored = userService.getCurrentUser()
  if (stored && currentUser.value) currentUser.value = { ...currentUser.value, profile_pic: stored.profile_pic }
}
emitter.on('profile-pic-updated', syncProfilePic)
onBeforeUnmount(() => emitter.off('profile-pic-updated', syncProfilePic))

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

    // Plan state for the enterprise surfaces (sidebar plan card, promos)
    if (hasEnterpriseModule) {
        initializeSubscriptionStore()
            .then(() => subscriptionStore.value.fetchCurrentPlan())
            .catch((err: Error) => {
                console.error('Error loading the current plan:', err)
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
            :user="currentUser"
            :role="userRole"
            :is-online="isOnline"
            :status-updating="statusUpdating"
            :inbox-count="waitingForHuman"
            :tickets-count="openTickets"
            @toggle="toggleSidebar"
            @navigate="closeSidebar"
            @toggle-status="toggleOnline"
            @logout="logout"
        />

        <!-- Main Content -->
        <div class="main-content">
            <!-- Plan and offer surfaces (strip, AI-reply usage, popup, limit toast);
                 pages without the header still get the limit toast -->
            <PromoSurfaces v-if="hasEnterpriseModule" :toasts-only="props.hideHeader" />

            <AppHeader
                v-if="!props.hideHeader"
                :page-title="pageTitle"
                :section="pageSection"
                :is-online="isOnline"
                :status-updating="statusUpdating"
                :unread-count="unreadCount"
                :theme-mode="themeMode"
                @toggle-sidebar="toggleSidebar"
                @toggle-status="toggleOnline"
                @toggle-theme="toggleTheme"
                @notifications="showNotifications = !showNotifications"
            />

            <!-- Main Content Area -->
            <main class="content">
                <!-- The agents page shows its own copy, beside the wizard and list -->
                <SetupProgressBar v-if="route.name !== 'ai-agents'" />
                <!-- Not on the knowledge page (it lists the failed source itself), nor on
                     full-page layouts, whose .content is a fixed 100vh with no room for it -->
                <FailedSourceNotice v-if="!props.hideHeader && route.name !== 'knowledge'" />
                <slot></slot>
            </main>
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
            :is-online="isOnline"
            :status-updating="statusUpdating"
            :theme-mode="themeMode"
            :unread-count="unreadCount"
            @close="showMoreSheet = false"
            @toggle-status="toggleOnline"
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

.main-content {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    width: 100%;
    min-width: 0;
    overflow-y: auto;
    overflow-x: hidden;
}

.content {
    flex: 1;
    padding: var(--space-xl);
}

/* Remove padding when header is hidden (for full-page layouts like ConversationsView) */
.dashboard-layout.header-hidden .content {
    padding: 0;
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

/* 13 inch laptops */
@media (max-width: 1366px) {
    .content {
        padding: var(--space-lg);
    }
}

/* Small laptops (1025px - 1280px) */
@media (max-width: 1280px) and (min-width: 1025px) {
    .content {
        padding: var(--space-md);
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
        inset: 0;
        background: var(--scrim);
        z-index: calc(var(--z-drawer) - 1);
        backdrop-filter: blur(2px);
    }

    .dashboard-layout.sidebar-collapsed .sidebar-backdrop {
        display: none;
    }
}

/* Mobile */
@media (max-width: 768px) {
    .content {
        padding: var(--space-sm);
    }

    /* Reserve space for the fixed bottom nav */
    .dashboard-layout.has-bottom-nav .content {
        padding-bottom: calc(var(--bottom-nav-height) + var(--safe-bottom) + var(--space-sm));
    }

    /* Full-height pages (Inbox): shrink the content area instead of padding it.
       flex: 0 0 auto is required — the default flex: 1 zeroes the flex basis and
       grows back to the full 100dvh, putting the page bottom under the nav. */
    .dashboard-layout.has-bottom-nav.header-hidden .content {
        flex: 0 0 auto;
        height: calc(100dvh - var(--bottom-nav-height) - var(--safe-bottom));
        padding-bottom: 0;
    }
}

/* Very small mobile devices */
@media (max-width: 480px) {
    .content {
        padding: var(--space-xs);
    }
}
</style>
