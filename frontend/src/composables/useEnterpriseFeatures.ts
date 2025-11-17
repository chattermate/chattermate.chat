import { ref, readonly, defineComponent, h, computed } from 'vue'
import type { Component } from 'vue'

// Create a proper Vue component for the fallback
const NotAvailableComponent = defineComponent({
  name: 'NotAvailable',
  setup() {
    return () => h('div', 'Feature not available in open source version')
  },
})

// Check for enterprise module
const enterpriseModules = import.meta.glob([
  '/src/modules/enterprise/views/SignupView.vue',
  '/src/modules/enterprise/composables/useSubscriptionStore.ts',
  '/src/modules/enterprise/router/guards/subscription.ts',
])
const hasEnterpriseModule = Object.keys(enterpriseModules).length > 0

interface Plan {
  type: string
  name: string
  [key: string]: any
}

interface SubscriptionPlan {
  plan: Plan
  message_count?: number
  message_limit?: number
  [key: string]: any
}

interface SubscriptionStore {
  currentPlan: SubscriptionPlan | null
  isLoadingPlan: boolean
  isInTrial: boolean
  trialDaysLeft: number
  fetchCurrentPlan: () => Promise<void>
}

interface MessageLimitStatus {
  type: 'warning' | 'error'
  message: string
  percentage: number
}

interface SubscriptionGuard {
  subscriptionGuard: (to: any, from: any, next: any) => void
}

type EnterpriseModule = {
  default?: Component
  subscriptionStore?: SubscriptionStore
  subscriptionGuard?: (to: any, from: any, next: any) => void
}

// Create a mapping of module paths to their direct imports
// These should be used with dynamic import() directly, not with glob
const moduleImports = {
  signupView: '/src/modules/enterprise/views/SignupView.vue',
  subscriptionView: '/src/modules/enterprise/views/SubscriptionView.vue',
  billingSetupView: '/src/modules/enterprise/views/BillingSetupView.vue',
  subscriptionStore: '/src/modules/enterprise/composables/useSubscriptionStore.ts',
  subscriptionGuard: '/src/modules/enterprise/router/guards/subscription.ts',
  exploreView: '/src/modules/enterprise/views/ExploreView.vue',
  shopifySessionTokenBounce: '/src/modules/enterprise/views/ShopifySessionTokenBouncePage.vue',
  shopifyConnect: '/src/modules/enterprise/views/ShopifyConnectAccountView.vue',
  shopifyAuthComplete: '/src/modules/enterprise/views/ShopifyAuthCompleteView.vue',
  shopifyAgentSelection: '/src/modules/enterprise/views/ShopifyAgentSelectionView.vue',
  shopifyAgentManagement: '/src/modules/enterprise/views/ShopifyAgentManagementView.vue',
  shopifyInbox: '/src/modules/enterprise/views/ShopifyInboxView.vue',
  shopifyPricing: '/src/modules/enterprise/views/ShopifyPricingView.vue',
}

// Default subscription state
const defaultSubscriptionState: SubscriptionStore = {
  currentPlan: null,
  isLoadingPlan: false,
  isInTrial: false,
  trialDaysLeft: 0,
  fetchCurrentPlan: () => Promise.resolve(),
}

export const useEnterpriseFeatures = () => {
  const subscriptionStore = ref<SubscriptionStore>(defaultSubscriptionState)

  const showMessageLimitWarning = computed(() => {
    const plan = subscriptionStore.value.currentPlan
    if (!plan?.plan) return false

    const messageCount = plan.message_count || 0
    const messageLimit = plan.message_limit

    if (!messageLimit) return false

    return messageCount >= messageLimit * 0.9
  })

  const messageLimitStatus = computed<MessageLimitStatus | null>(() => {
    const plan = subscriptionStore.value.currentPlan
    if (!plan?.plan) return null

    const messageCount = plan.message_count || 0
    const messageLimit = plan.message_limit

    if (!messageLimit) return null

    const usagePercentage = (messageCount / messageLimit) * 100

    if (messageCount >= messageLimit) {
      return {
        type: 'error',
        message: 'Message limit exceeded! Switch to your own model or upgrade plan.',
        percentage: 100,
      }
    } else if (usagePercentage >= 90) {
      return {
        type: 'warning',
        message: `Approaching message limit (${Math.round(usagePercentage)}%). Consider upgrading your plan.`,
        percentage: usagePercentage,
      }
    }

    return null
  })

  // Create a single glob pattern that matches all possible enterprise module paths
  const modules = import.meta.glob<EnterpriseModule>([
    '/src/modules/enterprise/**/*.vue',
    '/src/modules/enterprise/**/*.ts',
  ])

  // Check if any enterprise modules exist
  const hasEnterpriseModule = Object.keys(modules).length > 0

  const loadModule = async (modulePath: string): Promise<EnterpriseModule | null> => {
    if (!hasEnterpriseModule) {
      return null
    }

    try {
      if (modules[modulePath]) {
        const module = await modules[modulePath]()
        return module
      }
      return null
    } catch (error) {
      console.warn(`Failed to load enterprise module: ${modulePath}`, error)
      return null
    }
  }

  const initializeSubscriptionStore = async () => {
    if (hasEnterpriseModule) {
      try {
        const module = await loadModule(moduleImports.subscriptionStore)
        if (module?.subscriptionStore) {
          subscriptionStore.value = module.subscriptionStore
        }
      } catch (error) {
        console.warn('Enterprise subscription store not available:', error)
      }
    }
  }

  return {
    hasEnterpriseModule,
    subscriptionStore: readonly(subscriptionStore),
    initializeSubscriptionStore,
    loadModule,
    moduleImports,
    NotAvailableComponent,
    showMessageLimitWarning,
    messageLimitStatus,
  }
}
