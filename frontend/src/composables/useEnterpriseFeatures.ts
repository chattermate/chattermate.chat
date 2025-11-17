import { ref, readonly, defineComponent, h, computed } from 'vue'
import type { Component } from 'vue'

// Create a proper Vue component for the fallback
const NotAvailableComponent = defineComponent({
  name: 'NotAvailable',
  setup() {
    return () => h('div', 'Feature not available in open source version')
  }
})

// Check for enterprise module
const enterpriseModules = import.meta.glob([
  '@/modules/enterprise/views/SignupView.vue',
  '@/modules/enterprise/composables/useSubscriptionStore.ts',
  '@/modules/enterprise/router/guards/subscription.ts'
])
const hasEnterpriseModule = Object.keys(enterpriseModules).length > 0

interface Plan {
  type: string
  name: string
}

interface SubscriptionPlan {
  plan: Plan
  message_count?: number
  message_limit?: number
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
  signupView: '@/modules/enterprise/views/SignupView.vue',
  subscriptionView: '@/modules/enterprise/views/SubscriptionView.vue',
  billingSetupView: '@/modules/enterprise/views/BillingSetupView.vue',
  subscriptionStore: '@/modules/enterprise/composables/useSubscriptionStore.ts',
  subscriptionGuard: '@/modules/enterprise/router/guards/subscription.ts',
  exploreView: '@/modules/enterprise/views/ExploreView.vue',
  shopifySessionTokenBounce: '@/modules/enterprise/views/ShopifySessionTokenBouncePage.vue',
  shopifyConnect: '@/modules/enterprise/views/ShopifyConnectAccountView.vue',
  shopifyAuthComplete: '@/modules/enterprise/views/ShopifyAuthCompleteView.vue',
  shopifyAgentSelection: '@/modules/enterprise/views/ShopifyAgentSelectionView.vue',
  shopifyAgentManagement: '@/modules/enterprise/views/ShopifyAgentManagementView.vue',
  shopifyInbox: '@/modules/enterprise/views/ShopifyInboxView.vue',
  shopifyPricing: '@/modules/enterprise/views/ShopifyPricingView.vue'
}

// Default subscription state
const defaultSubscriptionState: SubscriptionStore = {
  currentPlan: null,
  isLoadingPlan: false,
  isInTrial: false,
  trialDaysLeft: 0,
  fetchCurrentPlan: () => Promise.resolve()
}

export const useEnterpriseFeatures = () => {
  const subscriptionStore = ref<SubscriptionStore>(defaultSubscriptionState)

  const showMessageLimitWarning = computed(() => {
    const plan = subscriptionStore.value.currentPlan
    if (!plan?.plan) return false
    
    const messageCount = plan.message_count || 0
    const messageLimit = plan.message_limit
    
    if (!messageLimit) return false
    
    return messageCount >= (messageLimit * 0.9)
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
        percentage: 100
      }
    } else if (usagePercentage >= 90) {
      return {
        type: 'warning',
        message: `Approaching message limit (${Math.round(usagePercentage)}%). Consider upgrading your plan.`,
        percentage: usagePercentage
      }
    }
    
    return null
  })

  // Create a single glob pattern that matches all possible enterprise module paths
  const modules = import.meta.glob<EnterpriseModule>([
    '/src/modules/enterprise/**/*.vue',
    '/src/modules/enterprise/**/*.ts'
  ])

  // Check if any enterprise modules exist
  const hasEnterpriseModule = Object.keys(modules).length > 0

  const loadModule = async (modulePath: string): Promise<EnterpriseModule | null> => {
    if (!hasEnterpriseModule) {
      return null
    }

    try {
      // Use direct dynamic import - Vite will process this and resolve the @ alias
      let module
      switch (modulePath) {
        case '@/modules/enterprise/views/SignupView.vue':
          module = await import('@/modules/enterprise/views/SignupView.vue')
          break
        case '@/modules/enterprise/views/SubscriptionView.vue':
          module = await import('@/modules/enterprise/views/SubscriptionView.vue')
          break
        case '@/modules/enterprise/views/BillingSetupView.vue':
          module = await import('@/modules/enterprise/views/BillingSetupView.vue')
          break
        case '@/modules/enterprise/composables/useSubscriptionStore.ts':
          module = await import('@/modules/enterprise/composables/useSubscriptionStore.ts')
          break
        case '@/modules/enterprise/router/guards/subscription.ts':
          module = await import('@/modules/enterprise/router/guards/subscription.ts')
          break
        case '@/modules/enterprise/views/ExploreView.vue':
          module = await import('@/modules/enterprise/views/ExploreView.vue')
          break
        case '@/modules/enterprise/views/ShopifySessionTokenBouncePage.vue':
          module = await import('@/modules/enterprise/views/ShopifySessionTokenBouncePage.vue')
          break
        case '@/modules/enterprise/views/ShopifyConnectAccountView.vue':
          module = await import('@/modules/enterprise/views/ShopifyConnectAccountView.vue')
          break
        case '@/modules/enterprise/views/ShopifyAuthCompleteView.vue':
          module = await import('@/modules/enterprise/views/ShopifyAuthCompleteView.vue')
          break
        case '@/modules/enterprise/views/ShopifyAgentSelectionView.vue':
          module = await import('@/modules/enterprise/views/ShopifyAgentSelectionView.vue')
          break
        case '@/modules/enterprise/views/ShopifyAgentManagementView.vue':
          module = await import('@/modules/enterprise/views/ShopifyAgentManagementView.vue')
          break
        case '@/modules/enterprise/views/ShopifyInboxView.vue':
          module = await import('@/modules/enterprise/views/ShopifyInboxView.vue')
          break
        case '@/modules/enterprise/views/ShopifyPricingView.vue':
          module = await import('@/modules/enterprise/views/ShopifyPricingView.vue')
          break
        default:
          console.warn(`Unknown enterprise module: ${modulePath}`)
          return null
      }
      return module
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
    messageLimitStatus
  }
} 