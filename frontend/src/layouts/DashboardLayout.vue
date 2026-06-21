<!--
ChatterMate - Dashboard Layout
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

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, provide, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import userAvatar from '@/assets/user.svg'
import notificationIcon from '@/assets/notification.svg'
import NotificationList from '@/components/notifications/NotificationList.vue'
import { userService } from '@/services/user'
import type { User } from '@/types/user'
import { useNotifications } from '@/composables/useNotifications'
import { notificationService } from '@/services/notification'
import { useRoute, useRouter } from 'vue-router'
import { updateUserStatus } from '@/services/users'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

const props = defineProps<{
    hideSidebar?: boolean
    hideHeader?: boolean
}>()

// Initialize sidebar state based on current route and screen size
const route = useRoute()
const isMobile = computed(() => window.innerWidth <= 1024)
const isSidebarOpen = ref(
    route.path !== '/conversations' && !isMobile.value
)
const showUserMenu = ref(false)
const showNotifications = ref(false)
const currentUser = ref<User>(userService.getCurrentUser() as User)
const userName = ref(userService.getUserName())
const userRole = ref(userService.getUserRole())
const unreadCount = ref(0)
const statusUpdating = ref(false)
const { logout } = useAuth()
useNotifications()
const router = useRouter()

// Initialize enterprise features
const { hasEnterpriseModule, subscriptionStore, initializeSubscriptionStore, showMessageLimitWarning, messageLimitStatus } = useEnterpriseFeatures()

const currentPlan = computed(() => subscriptionStore.value.currentPlan)
const isLoadingPlan = computed(() => subscriptionStore.value.isLoadingPlan)
const isInTrial = computed(() => subscriptionStore.value.isInTrial)
const trialDaysLeft = computed(() => subscriptionStore.value.trialDaysLeft)

const userAvatarSrc = computed(() => {
  if (currentUser.value?.profile_pic) {
    // If it's an S3 URL (contains amazonaws.com), use it directly
    if (currentUser.value.profile_pic.includes('amazonaws.com')) {
      return currentUser.value.profile_pic
    }
    // For local storage, prepend the API URL and add timestamp
    const timestamp = new Date().getTime()
    return `${import.meta.env.VITE_API_URL}${currentUser.value.profile_pic}?t=${timestamp}`
  }
  return userAvatar
})

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

// Watch for route changes to update sidebar state and close menus
watch(
  () => route.path,
  (newPath) => {
    showUserMenu.value = false
    showNotifications.value = false
    
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

const handleResize = () => {
    // Close sidebar on tablet/mobile when resizing
    if (window.innerWidth <= 1024 && isSidebarOpen.value) {
        isSidebarOpen.value = false
    }
    // Open sidebar on desktop when resizing from mobile
    if (window.innerWidth > 1024 && !isSidebarOpen.value && route.path !== '/conversations') {
        isSidebarOpen.value = true
    }
}

onMounted(() => {
    fetchUnreadCount()
    window.addEventListener('resize', handleResize)
    
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

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
    // On mobile, close the sidebar when clicking backdrop
    if (window.innerWidth <= 1024) {
        isSidebarOpen.value = false
    }
}

const navigateToUpgrade = () => {
    router.push('/settings/subscription')
}

// Computed for layout classes
const layoutClasses = computed(() => ({
    'sidebar-collapsed': !isSidebarOpen.value || props.hideSidebar,
    'header-hidden': props.hideHeader,
    'fullscreen-workflow': props.hideSidebar && props.hideHeader
}))

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
            <!-- Message Limit Warning Banner -->
            <div v-if="!props.hideHeader && hasEnterpriseModule && showMessageLimitWarning && messageLimitStatus" 
                 class="message-limit-banner"
                 :class="messageLimitStatus.type">
                <div class="banner-content">
                    <div class="banner-text">
                        <span class="banner-icon" v-if="messageLimitStatus.type === 'error'">⚠️</span>
                        <span class="banner-icon" v-else>ℹ️</span>
                        {{ messageLimitStatus.message }}
                    </div>
                    <div class="banner-actions">
                        <button class="action-button" @click="navigateToUpgrade">
                            Upgrade Plan
                        </button>
                        <button class="action-button secondary" @click="router.push('/settings/ai-config')">
                            Configure Own Model
                        </button>
                    </div>
                </div>
                <div class="usage-bar">
                    <div class="usage-progress" 
                         :style="{ width: `${Math.min(messageLimitStatus.percentage, 100)}%` }"
                         :class="{ 'exceeded': messageLimitStatus.percentage >= 100 }">
                    </div>
                </div>
            </div>

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
                    </div>
                    <div class="right-section">
                        <div v-if="hasEnterpriseModule" class="plan-display">
                            <div v-if="isLoadingPlan" class="plan-loading">
                                <span class="loading-spinner"></span>
                                Loading...
                            </div>
                            <div v-else-if="currentPlan" class="plan-info">
                                <div v-if="isInTrial" class="trial-info">
                                    <span 
                                        class="trial-badge clickable" 
                                        @click="navigateToUpgrade"
                                    >
                                        Trial ({{ trialDaysLeft }} days left)
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="user-menu">
                            <button class="notification-button" @click="showNotifications = !showNotifications">
                                <img :src="notificationIcon" alt="Notifications" class="notification-icon" />
                                <span v-if="unreadCount > 0" class="notification-badge">
                                    {{ unreadCount > 99 ? '99+' : unreadCount }}
                                </span>
                            </button>

                            <NotificationList :is-open="showNotifications" @close="showNotifications = false"
                                @notification-read="fetchUnreadCount" />

                            <div class="user-profile">
                                <div class="profile-trigger" @click="showUserMenu = !showUserMenu">
                                    <div class="avatar-wrapper">
                                        <img :src="userAvatarSrc" alt="User" class="avatar" />
                                        <span 
                                            class="status-indicator" 
                                            :class="{ 'online': currentUser?.is_online }"
                                        ></span>
                                    </div>
                                    <div class="user-info" v-if="isSidebarOpen">
                                        <span class="name">{{ userName }}</span>
                                        <div class="plan-info">
                                            <span class="plan-badge" :class="currentPlan?.plan?.type">
                                                <span class="plan-icon">⚡</span>
                                                {{ currentPlan?.plan?.name || '' }}
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
                <slot></slot>
            </main>

            <!-- Footer -->
            <footer class="footer">
                <div class="footer-content">
                    <p>&copy; 2024 ChatterMate. All rights reserved.</p>
                    <nav class="footer-links">
                        <a href="https://chattermate.chat/privacy_policy.html">Privacy Policy</a>
                        <a href="https://chattermate.chat/terms_and_conditions.html">Terms of Service</a>
                    </nav>
                </div>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.dashboard-layout {
    display: grid;
    grid-template-columns: auto 1fr;
    min-height: 100vh;
    transition: grid-template-columns var(--transition-normal);
    overflow-x: hidden;
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
    background: var(--primary-color);
    color: var(--background-color);
}

/* Header Styles */
.header {
    background: #ffffff;
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: 0;
    z-index: 50;
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
    gap: var(--space-lg);
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
    gap: var(--space-md);
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
    width: 32px;
    height: 32px;
}

.avatar {
    width: 32px;
    height: 32px;
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
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--space-xs);
    margin-top: var(--space-sm);
    min-width: 180px;
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
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background-color var(--transition-fast), color var(--transition-fast);
}

.menu-item:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
}

/* Content Styles */
.content {
    padding: var(--space-xl);
    min-height: calc(100vh - 180px);
}

/* Remove padding when header is hidden (for full-page layouts like ConversationsView) */
.dashboard-layout.header-hidden .content {
    padding: 0;
}

/* Footer Styles */
.footer {
    background: var(--background-soft);
    border-top: 1px solid var(--border-color);
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
    background: none;
    border: none;
    padding: var(--space-sm);
    cursor: pointer;
    position: relative;
    opacity: 0.7;
    transition: var(--transition-fast);
}

.notification-button:hover {
    opacity: 1;
}

.notification-icon {
    width: 24px;
    height: 24px;
}

.notification-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background-color: var(--error-color);
    color: white;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 500;
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
    background-color: var(--text-muted);
    border: 2px solid var(--background-soft);
}

.status-indicator.online {
    background-color: #22c55e;
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
    background: var(--border-color);
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
    background-color: var(--background-mute);
    color: var(--text-color);
}

.plan-badge.pro {
    background: linear-gradient(45deg, #000000, #333333);
    color: white;
}

.plan-badge.enterprise {
    background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
    color: white;
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
    background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
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
    background-color: var(--primary-color);
    color: white;
    border: none;
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.upgrade-button:hover {
    background-color: var(--accent-color);
    transform: translateY(-1px);
}

.trial-info {
    display: flex;
    align-items: center;
    margin-right: 12px;
}

.trial-badge {
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    color: white;
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

.message-limit-banner {
    position: relative;
    padding: var(--space-md) var(--space-xl);
    background: var(--warning-bg);
    border-bottom: 1px solid var(--warning-color);
    width: 100%;
    overflow: hidden;
}

.message-limit-banner.error {
    background: var(--error-bg);
    border-bottom: 1px solid var(--error-color);
}

.banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
}

.banner-text {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-weight: 500;
    word-break: break-word;
    flex: 1;
}

.banner-icon {
    font-size: 1.2em;
}

.banner-actions {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
}

.action-button {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    border: none;
    background: var(--primary-color);
    color: white;
    transition: all 0.2s ease;
}

.action-button:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
}

.action-button.secondary {
    background: var(--background-soft);
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

.usage-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--background-mute);
}

.usage-progress {
    height: 100%;
    background: var(--warning-color);
    transition: width 0.3s ease;
}

.usage-progress.exceeded {
    background: var(--error-color);
}

/* Adjust main content to account for banner */
.main-content {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
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
}

.dashboard-layout.fullscreen-workflow .content {
    padding: 0;
    height: 100vh;
    overflow: hidden;
}

.dashboard-layout.header-hidden .main-content {
    min-height: 100vh;
}

.dashboard-layout.header-hidden .content {
    height: 100vh;
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
    
    .banner-content {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-sm);
    }
    
    .banner-actions {
        width: 100%;
        justify-content: flex-start;
    }
    
    .action-button {
        padding: var(--space-xs) var(--space-md);
        font-size: 0.8rem;
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
    .header-content {
        padding: var(--space-sm);
    }
    
    .content {
        padding: var(--space-sm);
    }
    
    .right-section {
        gap: var(--space-sm);
    }
    
    .banner-content {
        gap: var(--space-xs);
    }
    
    .banner-text {
        font-size: var(--text-sm);
    }
    
    .banner-actions {
        flex-direction: column;
        width: 100%;
    }
    
    .action-button {
        width: 100%;
        text-align: center;
        padding: var(--space-sm);
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
    .header-content {
        padding: var(--space-xs) var(--space-sm);
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
    
    .message-limit-banner {
        padding: var(--space-sm);
    }
    
    .banner-content {
        gap: var(--space-xs);
    }
    
    .banner-text {
        font-size: var(--text-xs);
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-xs);
    }
    
    .banner-icon {
        font-size: 1em;
    }
    
    .action-button {
        font-size: 0.75rem;
        padding: var(--space-xs) var(--space-sm);
        white-space: nowrap;
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