<template>
  <s-page>
    <s-section>
      <div class="connect-container">
      <!-- Brand Header -->
      <div class="brand-header">
        <div class="brand-logo">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Chat bubble background -->
            <path 
              d="M95 20H25C22.2386 20 20 22.2386 20 25V75C20 77.7614 22.2386 80 25 80H45L55 95L65 80H95C97.7614 80 100 77.7614 100 75V25C100 22.2386 97.7614 20 95 20Z" 
              fill="#f34611"
              stroke="#EEEEEE"
              stroke-width="1"
            />
            <!-- Letter C -->
            <path 
              d="M75 40C75 40 65 35 60 35C50 35 45 42 45 50C45 58 50 65 60 65C65 65 75 60 75 60V52C75 52 68 55 63 55C57 55 53 53 53 50C53 47 57 45 63 45C68 45 75 48 75 48V40Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
          
          <s-stack gap="base" alignment="center">
            <s-heading>Welcome to ChatterMate!</s-heading>
            <s-text alignment="center" tone="subdued">
              Connect your ChatterMate account to start using AI-powered chat on your Shopify store.
            </s-text>
          </s-stack>
      </div>
      
      <!-- Connect Button -->
        <div class="connect-action">
          <s-button 
            variant="primary" 
            size="large"
        @click="openLoginPopup" 
        :disabled="isConnecting"
            fullWidth
      >
        <span v-if="isConnecting">Connecting...</span>
        <span v-else>Connect Account</span>
          </s-button>
        </div>
      
      <!-- Info Box -->
        <s-card>
          <s-stack gap="base">
            <s-heading variant="heading-sm">What happens next?</s-heading>
            <s-unordered-list>
              <s-list-item>Log in or create your ChatterMate account</s-list-item>
              <s-list-item>Select which AI agent to connect</s-list-item>
              <s-list-item>Install the chat widget on your store</s-list-item>
            </s-unordered-list>
          </s-stack>
        </s-card>

      <!-- Error Message -->
        <s-banner v-if="errorMessage" tone="critical">
          <s-text>{{ errorMessage }}</s-text>
        </s-banner>
      </div>
    </s-section>
  </s-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const isConnecting = ref(false)
const errorMessage = ref<string | null>(null)

const shopDomain = computed(() => route.query.shop as string)
const shopId = computed(() => route.query.shop_id as string)

// Navigate to login page
const openLoginPopup = () => {
  if (isConnecting.value) return

  errorMessage.value = null
  isConnecting.value = true

  try {
    const shop = shopDomain.value
    const shop_id = shopId.value

    if (!shop || !shop_id) {
      errorMessage.value = 'Missing shop information'
      isConnecting.value = false
      return
    }

    console.log('🪟 Navigating to login page')

    // Navigate to login page using Vue Router
    router.push({
      path: '/login',
      query: {
        shopify_flow: '1',
        shop,
        shop_id,
        return_to: `/shopify/agent-selection?shop=${shop}&shop_id=${shop_id}`
      }
    })

  } catch (err) {
    console.error('❌ Failed to navigate to login:', err)
    errorMessage.value = 'Failed to open login. Please try again.'
    isConnecting.value = false
  }
}

onMounted(() => {
  // Validate required parameters
  if (!shopId.value || !shopDomain.value) {
    errorMessage.value = 'Missing required shop information. Please try installing the app again.'
  }
})
</script>

<style scoped>
/* Container */
.connect-container {
  max-width: 520px;
  margin: 0 auto;
  padding: var(--space-2xl, 48px);
  text-align: center;
}

/* Brand Header */
.brand-header {
  margin-bottom: var(--space-2xl, 48px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg, 24px);
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: var(--background-color, #ffffff);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color, #e1e3e5);
}

.brand-logo svg {
  width: 56px;
  height: 56px;
}

/* Connect Action */
.connect-action {
  margin: var(--space-xl, 32px) 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .connect-container {
    padding: var(--space-xl, 32px) var(--space-lg, 24px);
  }

  .brand-header {
    margin-bottom: var(--space-xl, 32px);
  }

  .brand-logo {
    width: 64px;
    height: 64px;
  }

  .brand-logo svg {
    width: 44px;
    height: 44px;
  }
}
</style>


