import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { userService } from '@/services/user'
import { getSetupStatus } from '@/services/organization'
import { permissionChecks, hasAnyPermission } from '@/utils/permissions'
import { getApiUrl } from '@/config/api'
import HumanAgentView from '@/views/HumanAgentView.vue'
import OrganizationSettings from '@/views/settings/OrganizationSettings.vue'
import AIConfigSettings from '@/views/settings/AIConfigSettings.vue'
import IntegrationsSettings from '@/views/settings/IntegrationsSettings.vue'
import UserSettingsView from '@/views/UserSettingsView.vue'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

// Initialize enterprise features
const { hasEnterpriseModule, loadModule, moduleImports, NotAvailableComponent } =
  useEnterpriseFeatures()

// Base routes
const baseRoutes = [
  {
    path: '/',
    redirect: '/ai-agents',
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
      permissions: ['view_analytics'],
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
    meta: { requiresAuth: true },
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
      permissions: ['manage_organization', 'view_organization'],
    },
  },
  {
    path: '/settings/ai-config',
    name: 'ai-config-settings',
    component: AIConfigSettings,
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
      permissions: ['manage_ai_config', 'view_ai_config'],
    },
  },
  {
    path: '/settings/integrations',
    name: 'integrations-settings',
    component: IntegrationsSettings,
    meta: {
      requiresAuth: true,
      layout: 'dashboard',
      permissions: ['manage_organization'],
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
    path: '/:pathMatch(.*)*',
    redirect: '/ai-agents',
  },
]

// Helper function to load enterprise component
const loadEnterpriseComponent = (path: string) => {
  if (!hasEnterpriseModule) {
    return NotAvailableComponent
  }
  // Use explicit imports with switch - Vite will process these and resolve the @ alias
  return () => {
    switch (path) {
      case '@/modules/enterprise/views/SignupView.vue':
        return import('@/modules/enterprise/views/SignupView.vue')
      case '@/modules/enterprise/views/SubscriptionView.vue':
        return import('@/modules/enterprise/views/SubscriptionView.vue')
      case '@/modules/enterprise/views/BillingSetupView.vue':
        return import('@/modules/enterprise/views/BillingSetupView.vue')
      case '@/modules/enterprise/views/ExploreView.vue':
        return import('@/modules/enterprise/views/ExploreView.vue')
      case '@/modules/enterprise/views/ShopifySessionTokenBouncePage.vue':
        return import('@/modules/enterprise/views/ShopifySessionTokenBouncePage.vue')
      case '@/modules/enterprise/views/ShopifyConnectAccountView.vue':
        return import('@/modules/enterprise/views/ShopifyConnectAccountView.vue')
      case '@/modules/enterprise/views/ShopifyAuthCompleteView.vue':
        return import('@/modules/enterprise/views/ShopifyAuthCompleteView.vue')
      case '@/modules/enterprise/views/ShopifyAgentSelectionView.vue':
        return import('@/modules/enterprise/views/ShopifyAgentSelectionView.vue')
      case '@/modules/enterprise/views/ShopifyAgentManagementView.vue':
        return import('@/modules/enterprise/views/ShopifyAgentManagementView.vue')
      case '@/modules/enterprise/views/ShopifyInboxView.vue':
        return import('@/modules/enterprise/views/ShopifyInboxView.vue')
      case '@/modules/enterprise/views/ShopifyPricingView.vue':
        return import('@/modules/enterprise/views/ShopifyPricingView.vue')
      default:
        console.warn(`Unknown enterprise component: ${path}`)
        return Promise.resolve({ default: NotAvailableComponent })
    }
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
      {
        path: '/explore',
        name: 'explore',
        component: loadEnterpriseComponent(moduleImports.exploreView),
        meta: { requiresAuth: false },
      },
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
        meta: { requiresAuth: false },
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
        meta: { requiresAuth: false },
      },
      {
        path: '/shopify/agent-management',
        name: 'shopify-agent-management',
        component: loadEnterpriseComponent(moduleImports.shopifyAgentManagement),
        meta: { requiresAuth: false },
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
router.beforeEach(async (to, _from, next) => {
  // Skip auth check for Shopify routes (they use session tokens)
  if (to.path.startsWith('/shopify/')) {
    return next()
  }

  // Check for standard app conditions
  const isAuthenticated = userService.isAuthenticated()
  // Always check setup status to decide between Setup vs Login/Signup
  const isSetupComplete = await getSetupStatus()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiredPermissions = to.meta.permissions as string[] | undefined

  // Standard app navigation logic
  if (!isAuthenticated) {
    // If setup is not complete, always go to setup page first
    if (!isSetupComplete && to.path !== '/setup') {
      return next('/setup')
    } else if (requiresAuth) {
      return next('/login')
    }
    // Public route; allow
    return next()
  } else {
    if (!isSetupComplete && to.path !== '/setup') {
      return next('/setup')
    }
  }

  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    // Redirect to 403 page or dashboard if user lacks required permissions
    return next('/403')
  }

  return next()
})

export default router
