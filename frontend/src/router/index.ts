/*
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
*/

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { userService } from '@/services/user'
import { getSetupStatus } from '@/services/organization'
import { canAccessMatchedPaths } from '@/router/routePermissions'
import { resolveLandingRoute } from '@/router/landing'
import { getApiUrl } from '@/config/api'
import HumanAgentView from '@/views/HumanAgentView.vue'
import OrganizationSettings from '@/views/settings/OrganizationSettings.vue'
import AIConfigSettings from '@/views/settings/AIConfigSettings.vue'
import IntegrationsSettings from '@/views/settings/IntegrationsSettings.vue'
import WidgetAppsSettings from '@/views/settings/WidgetAppsSettings.vue'
import UserSettingsView from '@/views/UserSettingsView.vue'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

// Initialize enterprise features
const { hasEnterpriseModule, loadModule, moduleImports, NotAvailableComponent } =
  useEnterpriseFeatures()

// Base routes
const baseRoutes = [
  {
    path: '/',
    // A function, not a string: permissions live in localStorage and are not
    // readable when this module is first evaluated. Also the landing spot for
    // an installed PWA (manifest start_url) and for pushes with no session.
    //
    // Only resolve with a session in hand. Resolving for a signed-out visitor
    // yields the no-permission floor, which the guard then carries into
    // ?redirect= and honours after login — landing an admin on User Settings.
    redirect: () => (userService.isAuthenticated() ? resolveLandingRoute() : '/login'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/setup',
    name: 'setup',
    component: () => import('@/views/SetupView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/ai-agents',
    name: 'ai-agents',
    component: () => import('@/views/AIAgentView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
      title: 'Analytics Dashboard',
    },
  },
  {
    path: '/knowledge',
    name: 'knowledge',
    component: () => import('@/views/KnowledgeView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
      title: 'Knowledge Base',
    },
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('@/views/FaqView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
      title: 'FAQ & Help Center',
    },
  },
  {
    path: '/tickets',
    name: 'tickets',
    component: () => import('@/views/TicketsView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
      title: 'Tickets',
    },
  },
  {
    path: '/tickets/:id',
    name: 'ticket-detail',
    component: () => import('@/views/TicketDetailView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
      title: 'Ticket',
    },
  },
  {
    path: '/settings/ticketing',
    name: 'ticketing-settings',
    component: () => import('@/views/settings/TicketingSettings.vue'),
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
      title: 'Ticketing Settings',
    },
  },
  {
    path: '/widget/:id',
    name: 'widget',
    component: () => import('@/webclient/WidgetBuilder.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/conversations',
    name: 'conversations',
    component: () => import('../views/ConversationsView.vue'),
    // Any inbox grant — own/group chats, the unclaimed queue, or everything
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/people',
    name: 'people',
    // Without meta the page rendered and then 403'd on every request; the
    // guard sends users who can't read the directory to /403 instead.
    component: () => import('../views/PeopleView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/human-agents',
    name: 'human-agents',
    component: HumanAgentView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings/organization',
    name: 'organization-settings',
    component: OrganizationSettings,
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
    },
  },
  {
    path: '/settings/ai-config',
    name: 'ai-config-settings',
    component: AIConfigSettings,
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
    },
  },
  {
    path: '/settings/integrations',
    name: 'integrations-settings',
    component: IntegrationsSettings,
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
    },
  },
  {
    path: '/settings/widget-apps',
    name: 'widget-apps',
    component: WidgetAppsSettings,
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
    },
  },
  {
    path: '/settings/user',
    name: 'user-settings',
    component: UserSettingsView,
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
    },
  },
  {
    // Registered, and reachable: the guard used to send denials to /403 with
    // no such route, so they fell through this catch-all onto /ai-agents —
    // which had no meta.permissions and therefore always rendered. A user was
    // silently dropped on a page they had just been refused.
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/403.vue'),
    meta: { requiresAuth: true, layout: 'dashboard' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => (userService.isAuthenticated() ? resolveLandingRoute() : '/login'),
  },
]

// Helper function to load enterprise component
const loadEnterpriseComponent = (path: string) => {
  if (!hasEnterpriseModule) {
    return NotAvailableComponent
  }
  return async () => {
    const module = await loadModule(path)
    return module?.default || NotAvailableComponent
  }
}

// Combine routes based on module availability
const allRoutes = hasEnterpriseModule
  ? [
      ...baseRoutes,
      {
        path: '/signup',
        name: 'signup',
        component: loadEnterpriseComponent(moduleImports.signupView),
        meta: { requiresAuth: false },
      },
      // Explore is retired and its backend proxy unregistered
      // {
      //   path: '/explore',
      //   name: 'explore',
      //   component: loadEnterpriseComponent(moduleImports.exploreView),
      //   meta: { requiresAuth: false },
      // },
      {
        path: '/settings/subscription',
        name: 'subscription',
        component: loadEnterpriseComponent(moduleImports.subscriptionView),
        meta: {
          requiresAuth: true,
          layout: 'dashboard',
          title: 'Subscription Plans',
        },
      },
      {
        path: '/settings/app-integrations',
        name: 'app-integrations',
        component: loadEnterpriseComponent(moduleImports.appIntegrationsView),
        meta: {
          requiresAuth: true,
          layout: 'dashboard',
          title: 'App Integrations',
        },
      },
      {
        path: '/settings/access-tokens',
        name: 'access-tokens',
        component: loadEnterpriseComponent(moduleImports.accessTokensView),
        meta: {
          requiresAuth: true,
          layout: 'dashboard',
          title: 'CLI & API tokens',
        },
      },
      {
        path: '/settings/subscription/setup/:planId',
        name: 'billing-setup',
        component: loadEnterpriseComponent(moduleImports.billingSetupView),
        meta: { requiresAuth: true },
      },
      {
        path: '/shopify/session-token-bounce',
        name: 'shopify-session-token-bounce',
        component: loadEnterpriseComponent(moduleImports.shopifySessionTokenBounce),
        meta: { requiresAuth: false },
      },
      {
        path: '/shopify/connect',
        name: 'shopify-connect',
        component: loadEnterpriseComponent(moduleImports.shopifyConnect),
        meta: { requiresAuth: false }, // Session token auth instead
      },
      {
        path: '/shopify/auth-complete',
        name: 'shopify-auth-complete',
        component: loadEnterpriseComponent(moduleImports.shopifyAuthComplete),
        meta: { requiresAuth: false },
      },
      {
        path: '/shopify/agent-selection',
        name: 'shopify-agent-selection',
        component: loadEnterpriseComponent(moduleImports.shopifyAgentSelection),
        meta: { requiresAuth: false }, // Session token auth instead
      },
      {
        path: '/shopify/agent-management',
        name: 'shopify-agent-management',
        component: loadEnterpriseComponent(moduleImports.shopifyAgentManagement),
        meta: { requiresAuth: false }, // Session token auth instead
      },
      {
        path: '/shopify/inbox',
        name: 'shopify-inbox',
        component: loadEnterpriseComponent(moduleImports.shopifyInbox),
        meta: { requiresAuth: false },
      },
      {
        path: '/shopify/pricing',
        name: 'shopify-pricing',
        component: loadEnterpriseComponent(moduleImports.shopifyPricing),
        meta: { requiresAuth: false },
      },
    ]
  : baseRoutes

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: allRoutes,
})

// Add subscription guard only if enterprise module is available
if (hasEnterpriseModule) {
  const loadGuard = async () => {
    try {
      const guardModule = await loadModule(moduleImports.subscriptionGuard)
      if (guardModule?.subscriptionGuard) {
        router.beforeEach(guardModule.subscriptionGuard)
      }
    } catch (error) {
      console.warn('Enterprise subscription guard not available:', error)
    }
  }
  loadGuard()
}

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Skip auth check for Shopify routes (they use session tokens)
  if (to.path.startsWith('/shopify/')) {
    return next()
  }

  // Check for standard app conditions
  const isAuthenticated = userService.isAuthenticated()
  // Always check setup status to decide between Setup vs Login/Signup
  const isSetupComplete = await getSetupStatus()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // Standard app navigation logic
  if (!isAuthenticated) {
    // If setup is not complete, always go to setup page first
    if (!isSetupComplete && to.path !== '/setup') {
      return next('/setup')
    } else if (requiresAuth) {
      // Preserve where they were headed (e.g. the Slack install landing link)
      // so login can send them straight back instead of the default page.
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }
    // Public route; allow
    return next()
  } else {
    if (!isSetupComplete && to.path !== '/setup') {
      return next('/setup')
    }
  }

  // ROUTE_PERMISSIONS is the single source of truth, shared with the sidebar
  // so a visible link can never lead to a refusal.
  if (!canAccessMatchedPaths(to.matched.map((record) => record.path))) {
    return next({ name: 'forbidden' })
  }

  return next()
})

export default router
