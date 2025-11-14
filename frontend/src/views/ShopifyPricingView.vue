<template>
  <s-app-nav>
    <s-link href="/shopify/agent-management" rel="home">Home</s-link>
    <s-link href="/shopify/inbox">Inbox</s-link>
    <s-link href="/shopify/pricing">Pricing</s-link>
  </s-app-nav>

  <div class="pricing-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading plans...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ error }}</p>
      <button class="retry-button" @click="loadPlans">
        Try Again
      </button>
    </div>

    <!-- Pricing Content -->
    <div v-else class="pricing-container">
      <div class="pricing-header">
        <h1>ChatterMate Pricing Plans</h1>
        <p class="subtitle">Choose the perfect plan for your Shopify store</p>
      </div>

      <div class="plans-grid">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="plan-card"
          :class="{ 'highlight': plan.type === 'pro' }"
        >
          <!-- Plan Header -->
          <div class="plan-header">
            <div class="plan-icon" :class="plan.type">
              <svg v-if="plan.type === 'free'" viewBox="0 0 24 24" fill="none" class="icon">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 9h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 15h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="plan.type === 'base'" viewBox="0 0 24 24" fill="none" class="icon">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="plan.type === 'pro'" viewBox="0 0 24 24" fill="none" class="icon">
                <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="plan.type === 'enterprise'" viewBox="0 0 24 24" fill="none" class="icon">
                <path d="M21 16V8C20.9996 7.64928 20.9071 7.30481 20.7315 7.00116C20.556 6.69752 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69752 3.26846 7.00116C3.09294 7.30481 3.00036 7.64928 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3.27 6.96L12 12.01L20.73 6.96" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 22.08V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <h2 class="plan-name">{{ plan.name }}</h2>

            <div v-if="plan.type === 'free'" class="plan-price">
              <div class="free-label">Free Forever</div>
              <div class="free-subtitle">Perfect for getting started</div>
            </div>
            <div v-else-if="plan.type !== 'enterprise'" class="plan-price">
              <div class="price-amount">
                <span class="currency">$</span>
                <span class="amount">{{ plan.price_per_agent.toFixed(2) }}</span>
              </div>
              <div class="price-period">/agent/month</div>
            </div>
            <div v-else class="plan-price">
              <div class="enterprise-label">Custom Pricing</div>
              <div class="enterprise-subtitle">For large teams</div>
            </div>
          </div>

          <!-- Key Features -->
          <div class="key-features">
            <div class="feature-item">
              <span class="check">✓</span>
              <span>{{ plan.max_agents === null ? 'Unlimited' : plan.max_agents }} {{ plan.max_agents === 1 ? 'agent' : 'agents' }}</span>
            </div>
            <div class="feature-item">
              <span class="check">✓</span>
              <span>{{ plan.max_knowledge_sources }} knowledge {{ plan.max_knowledge_sources === 1 ? 'source' : 'sources' }}</span>
            </div>
            <div class="feature-item">
              <span class="check">✓</span>
              <span>{{ plan.max_messages === null ? 'Unlimited' : plan.max_messages.toLocaleString() }} messages/mo</span>
            </div>
          </div>

          <!-- Collapsible Features -->
          <div v-if="plan.type !== 'enterprise'" class="features-toggle">
            <button
              class="toggle-button"
              @click="toggleFeatures(plan.id)"
              :class="{ 'expanded': expandedPlans.includes(plan.id) }"
            >
              <span>{{ expandedPlans.includes(plan.id) ? 'Hide' : 'Show' }} all features</span>
              <svg class="chevron" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <div v-if="expandedPlans.includes(plan.id)" class="expanded-features">
              <div class="feature-item">
                <span class="check">✓</span>
                <span>{{ plan.max_sub_pages }} sub-pages per source</span>
              </div>
              <div class="feature-item">
                <span class="check">✓</span>
                <span>{{ plan.data_retention_days === null ? 'Unlimited' : plan.data_retention_days }} days data retention</span>
              </div>

              <template v-for="(enabled, feature) in plan.features" :key="feature">
                <div v-if="enabled && String(feature) !== 'max_users'" class="feature-item">
                  <span class="check">✓</span>
                  <span>{{ formatFeatureName(String(feature)) }}</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Enterprise Features -->
          <div v-else class="enterprise-features">
            <div class="feature-item">
              <span class="check">✓</span>
              <span>Custom integrations</span>
            </div>
            <div class="feature-item">
              <span class="check">✓</span>
              <span>Dedicated support</span>
            </div>
            <div class="feature-item">
              <span class="check">✓</span>
              <span>Custom SLA</span>
            </div>
            <div class="feature-item">
              <span class="check">✓</span>
              <span>Training & onboarding</span>
            </div>
          </div>

          <!-- Action Button -->
          <div class="action-container">
            <button
              v-if="plan.type === 'enterprise'"
              class="subscribe-button enterprise"
              @click="contactSales"
            >
              Contact Sales
            </button>
            <button
              v-else
              class="subscribe-button"
              :class="plan.type"
              @click="selectPlan(plan)"
            >
              Get Started
              <span v-if="plan.trial_days && plan.type !== 'free'" class="trial-badge">
                {{ plan.trial_days }}-day trial
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3>Need help choosing a plan?</h3>
        <p>Contact our sales team for personalized recommendations based on your store's needs.</p>
        <a href="mailto:sales@chattermate.chat" class="contact-link">sales@chattermate.chat</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import api from '@/services/api'
import { useShopifySession } from '@/composables/useShopifySession'

// Use Shopify session composable
const { getToken } = useShopifySession()

// State
const isLoading = ref(true)
const error = ref<string | null>(null)
const plans = ref<any[]>([])
const expandedPlans = ref<string[]>([])

// Methods
const formatFeatureName = (feature: string): string => {
  return feature
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const toggleFeatures = (planId: string) => {
  const index = expandedPlans.value.indexOf(planId)
  if (index > -1) {
    expandedPlans.value.splice(index, 1)
  } else {
    expandedPlans.value.push(planId)
  }
}

const loadPlans = async () => {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.get('/enterprise/shopify/plans')
    plans.value = response.data
  } catch (err: any) {
    console.error('Error loading plans:', err)
    error.value = 'Failed to load pricing plans. Please try again.'
    toast.error('Failed to load plans')
  } finally {
    isLoading.value = false
  }
}

const selectPlan = (plan: any) => {
  console.log('Selected plan:', plan)
  // Redirect to ChatterMate dashboard for subscription setup
  window.open(`https://app.chattermate.chat/settings/subscription?plan=${plan.id}`, '_blank')
}

const contactSales = () => {
  window.open('mailto:sales@chattermate.chat?subject=Enterprise%20Plan%20Inquiry', '_blank')
}

// Initialize
onMounted(async () => {
  try {
    console.log('🚀 ShopifyPricing mounted')

    // Get session token from App Bridge
    const sessionToken = await getToken()

    if (!sessionToken) {
      console.log('⚠️ No session token available')
      error.value = 'Failed to authenticate with Shopify'
      isLoading.value = false
      return
    }

    console.log('✅ Session token obtained')

    // Load plans
    await loadPlans()

    console.log('✅ Pricing page loaded successfully')
  } catch (err: any) {
    console.error('❌ Initialization failed:', err)
    error.value = 'Failed to initialize pricing page'
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Main page wrapper */
.pricing-page {
  width: 100%;
  min-height: calc(100vh - 60px);
  background: #f9fafb;
  padding: 40px 20px;
}

/* Pricing container - centered with max width */
.pricing-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e1e3e5;
  border-top: 4px solid #f34611;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text,
.error-text {
  font-size: 16px;
  color: #6d7175;
  margin: 0;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-button {
  margin-top: 24px;
  padding: 12px 28px;
  background: #f34611;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #d93d0e;
  transform: translateY(-2px);
}

/* Pricing Header */
.pricing-header {
  text-align: center;
  margin-bottom: 48px;
  padding: 0 20px;
}

.pricing-header h1 {
  font-size: 36px;
  font-weight: 800;
  color: #202223;
  margin-bottom: 16px;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.subtitle {
  font-size: 18px;
  color: #6d7175;
  margin: 0;
  font-weight: 500;
}

/* Plans Grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 48px;
}

@media (min-width: 768px) {
  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (min-width: 1024px) {
  .plans-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

/* Plan Card */
.plan-card {
  background: white;
  border-radius: 12px;
  padding: 28px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #e1e3e5;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.plan-card.highlight {
  border-color: #f34611;
  box-shadow: 0 4px 16px rgba(243, 70, 17, 0.2);
}

/* Plan Header */
.plan-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e1e3e5;
}

.plan-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plan-icon .icon {
  width: 100%;
  height: 100%;
}

.plan-icon.free {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.plan-icon.base {
  background: rgba(243, 70, 17, 0.1);
  color: #f34611;
}

.plan-icon.pro {
  background: linear-gradient(135deg, #000000, #333333);
  color: white;
}

.plan-icon.enterprise {
  background: linear-gradient(135deg, #f34611, #ff6b35);
  color: white;
}

.plan-name {
  font-size: 24px;
  font-weight: 700;
  color: #202223;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

/* Pricing */
.plan-price {
  margin-bottom: 12px;
}

.price-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 4px;
}

.currency {
  font-size: 20px;
  font-weight: 700;
  color: #202223;
  margin-bottom: 2px;
}

.amount {
  font-size: 42px;
  font-weight: 800;
  color: #202223;
  line-height: 1;
  letter-spacing: -0.03em;
}

.price-period {
  font-size: 14px;
  color: #6d7175;
  margin-top: 6px;
  font-weight: 500;
}

.free-label,
.enterprise-label {
  font-size: 24px;
  font-weight: 800;
  color: #22c55e;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.enterprise-label {
  color: #f34611;
}

.free-subtitle,
.enterprise-subtitle {
  font-size: 14px;
  color: #6d7175;
  font-weight: 500;
}

/* Key Features */
.key-features {
  margin-bottom: 20px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 14px;
  color: #6d7175;
  line-height: 1.6;
}

.feature-item .check {
  color: #22c55e;
  font-weight: bold;
  font-size: 18px;
  flex-shrink: 0;
  line-height: 1.4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.feature-item span:not(.check) {
  flex: 1;
  word-break: break-word;
  font-weight: 500;
}

/* Features Toggle */
.features-toggle {
  margin-bottom: 20px;
}

.toggle-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 2px solid #e1e3e5;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #202223;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-button:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-color: #f34611;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.toggle-button .chevron {
  transition: transform 0.3s ease;
  transform-origin: center;
  stroke-width: 2.5;
}

.toggle-button.expanded {
  background: #f34611;
  color: white;
  border-color: #f34611;
}

.toggle-button.expanded .chevron {
  transform: rotate(180deg);
  stroke: white;
}

.expanded-features {
  padding-top: 20px;
  margin-top: 16px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enterprise Features */
.enterprise-features {
  margin-bottom: 20px;
  padding-top: 16px;
}

/* Action Container */
.action-container {
  margin-top: auto;
  padding-top: 16px;
}

.subscribe-button {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f34611;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(243, 70, 17, 0.3);
  letter-spacing: 0.01em;
}

.subscribe-button:hover {
  transform: translateY(-3px);
  filter: brightness(1.1);
  box-shadow: 0 8px 20px rgba(243, 70, 17, 0.4);
}

.subscribe-button:active {
  transform: translateY(-1px);
}

.subscribe-button.pro {
  background: linear-gradient(135deg, #000000, #333333);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.subscribe-button.pro:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.subscribe-button.enterprise {
  background: linear-gradient(135deg, #f34611, #ff6b35);
  box-shadow: 0 4px 12px rgba(243, 70, 17, 0.3);
}

.subscribe-button.enterprise:hover {
  box-shadow: 0 8px 20px rgba(243, 70, 17, 0.4);
}

.trial-badge {
  font-size: 12px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 9999px;
  font-weight: 600;
}

/* Info Section */
.info-section {
  text-align: center;
  padding: 40px 32px;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 16px;
  margin-top: 48px;
  border: 2px solid #e1e3e5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.info-section h3 {
  font-size: 22px;
  font-weight: 700;
  color: #202223;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.info-section p {
  font-size: 16px;
  color: #6d7175;
  margin-bottom: 20px;
  font-weight: 500;
  line-height: 1.6;
}

.contact-link {
  font-size: 18px;
  font-weight: 700;
  color: #f34611;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
  padding: 10px 20px;
  border-radius: 9999px;
  background: rgba(243, 70, 17, 0.1);
}

.contact-link:hover {
  background: rgba(243, 70, 17, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(243, 70, 17, 0.2);
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .pricing-page {
    padding: 24px 16px;
  }

  .pricing-header h1 {
    font-size: 28px;
  }

  .subtitle {
    font-size: 16px;
  }

  .plan-card {
    padding: 24px 20px;
    min-height: auto;
  }
}
</style>
