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
import { ref, onMounted, watch, provide, readonly, computed } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import userAvatar from '@/assets/user.svg'
import notificationIcon from '@/assets/notification.svg'
import NotificationList from '@/components/notifications/NotificationList.vue'
import { userService } from '@/services/user'
import type { User } from '@/types/user'
import { useNotifications } from '@/composables/useNotifications'
import { notificationService } from '@/services/notification'
import UserSettings from '@/components/user/UserSettings.vue'
import { useRoute, useRouter } from 'vue-router'
import { updateUserStatus } from '@/services/users'
import api from '@/services/api'
import { useSubscription } from '@/composables/useSubscription'
import type { SubscriptionStore } from '@/composables/useSubscription'

const isSidebarOpen = ref(true)
const showUserMenu = ref(false)
const showNotifications = ref(false)
const showSettings = ref(false)
const currentUser = ref<User>(userService.getCurrentUser() as User)
const userName = ref(userService.getUserName())
const userRole = ref(userService.getUserRole())
const unreadCount = ref(0)
const statusUpdating = ref(false)
const { logout } = useAuth()
useNotifications()
const route = useRoute()
const router = useRouter()

// Initialize subscription store
const subscriptionStore = ref<SubscriptionStore>({
    currentPlan: ref(null),
    isLoadingPlan: ref(false),
    isInTrial: ref(false),
    trialDaysLeft: ref(0),
    fetchCurrentPlan: async () => {}
})

// Load subscription store
const initSubscriptionStore = async () => {
    subscriptionStore.value = await useSubscription()
}

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

// Add this watch to close settings when route changes
watch(
  () => route.path,
  () => {
    showSettings.value = false
    showUserMenu.value = false
    showNotifications.value = false
  }
)

const fetchUnreadCount = async () => {
    try {
        unreadCount.value = await notificationService.getUnreadCount()
    } catch (err) {
        console.error('Error fetching unread count:', err)
    }
}

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
}

const closeSettings = () => {
  showSettings.value = false
}

const openSettings = () => {
  showSettings.value = true
  showUserMenu.value = false
}

const refreshUserInfo = () => {
  userName.value = userService.getUserName()
  userRole.value = userService.getUserRole()
  const user = userService.getCurrentUser() as User
  // Force a new reference to trigger reactivity
  currentUser.value = { ...user }
}

const navigateToUpgrade = () => {
    router.push('/settings/subscription')
}

// Provide both methods
provide('refreshUserInfo', refreshUserInfo)
provide('openSettings', openSettings)
provide('showSettings', readonly(showSettings))

onMounted(async () => {
    fetchUnreadCount()
    await initSubscriptionStore()
    // Only call fetchCurrentPlan once since useSubscription already checks for enterprise availability
    if (subscriptionStore.value) {
        await subscriptionStore.value.fetchCurrentPlan()
    }
})
</script>

<template>
    <div class="dashboard-layout" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
        <AppSidebar :isCollapsed="!isSidebarOpen" @toggle="toggleSidebar" @navigate="closeSettings" />

        <!-- Main Content -->
        <div class="main-content">
            <!-- Header -->
            <header class="header">
                <div class="header-content">
                    <div class="left-section">
                        <!-- Any left section content -->
                    </div>
                    <div class="right-section">
                        <div v-if="subscriptionStore" class="plan-display">
                            <div v-if="subscriptionStore.isLoadingPlan" class="plan-loading">
                                <span class="loading-spinner"></span>
                                Loading...
                            </div>
                            <div v-else-if="subscriptionStore.currentPlan" class="plan-info">
                                <div v-if="subscriptionStore.isInTrial" class="trial-info">
                                    <span 
                                        class="trial-badge clickable" 
                                        @click="navigateToUpgrade"
                                    >
                                        Trial ({{ subscriptionStore.trialDaysLeft }} days left)
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
                                            <span class="plan-badge" :class="subscriptionStore?.currentPlan?.plan?.type">
                                                <span class="plan-icon">⚡</span>
                                                {{ subscriptionStore?.currentPlan?.plan?.name || '' }}
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
                                    <button class="menu-item" @click="openSettings">
                                        Settings
                                    </button>
                                    <button class="menu-item" @click="logout">Logout</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Main Content Area -->
            <main class="content">
                <UserSettings v-if="showSettings" @close="closeSettings" />
                <slot v-else></slot>
            </main>

            <!-- Footer -->
            <footer class="footer">
                <div class="footer-content">
                    <p>&copy; 2024 ChatterMate. All rights reserved.</p>
                    <nav class="footer-links">
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms">Terms of Service</a>
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
    background: var(--background-soft);
    border-bottom: 1px solid var(--border-color);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) var(--space-xl);
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
    background: var(--background-soft);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--space-xs);
    margin-top: var(--space-xs);
    min-width: 150px;
    z-index: 100;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.menu-item {
    display: block;
    width: 100%;
    padding: var(--space-sm);
    text-align: left;
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    border-radius: var(--radius-sm);
}

.menu-item:hover {
    background: var(--background-mute);
}

/* Content Styles */
.content {
    padding: var(--space-xl);
    min-height: calc(100vh - 180px);
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
</style>