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
import { useAISetup } from '@/composables/useAISetup'
import { computed, ref, watch, onMounted } from 'vue'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { useSubscriptionStorage } from '@/utils/storage'

const emit = defineEmits<{
  (e: 'ai-setup-complete'): void
}>()

const { hasEnterpriseModule, moduleImports, loadModule } = useEnterpriseFeatures()
const subscriptionStorage = useSubscriptionStorage()

// Only import subscription store if enterprise module is available
const subscriptionStore = ref<any>({ fetchPlans: async () => {} })

// Initialize subscription store if enterprise module is available
onMounted(async () => {
  if (hasEnterpriseModule) {
    try {
      const module = await loadModule(moduleImports.subscriptionStore)
      if (module?.default) {
        // Access the subscriptionStore export directly
        subscriptionStore.value = module.default
      }
    } catch (error) {
      console.warn('Failed to load subscription store:', error)
    }
  }
})

// Subscription feature checking
const currentSubscription = computed(() => subscriptionStorage.getCurrentSubscription())
const isSubscriptionActive = computed(() => subscriptionStorage.isSubscriptionActive())

// Check if custom models feature is available
const hasCustomModelsFeature = computed(() => {
  return subscriptionStorage.hasFeature('custom_models')
})

// Check if custom models tab is locked
const isCustomModelsLocked = computed(() => {
  // Only lock if enterprise module exists and feature requirements aren't met
  return hasEnterpriseModule && (!hasCustomModelsFeature.value || !isSubscriptionActive.value)
})

const {
  isLoading,
  error,
  providers,
  setupConfig,
  saveAISetup,
  updateAISetup,
  hasExistingConfig
} = useAISetup()

// Set initial tab based on enterprise availability
const activeTab = ref(hasEnterpriseModule ? 'chattermate' : 'custom')

// Watch for existing configuration changes to set the correct tab
watch([hasExistingConfig, setupConfig], ([hasConfig, config]) => {
  if (hasConfig && config.provider) {
    // If existing config is ChatterMate, show ChatterMate tab
    if (config.provider.toLowerCase() === 'chattermate' && hasEnterpriseModule) {
      activeTab.value = 'chattermate'
    } else {
      // If existing config is a custom model (OpenAI, Groq, etc.), show custom tab
      activeTab.value = 'custom'
    }
  }
}, { deep: true, immediate: true })

// API key is always required for our supported providers
const showApiKey = computed(() => true)

// Sentinel value for the "Custom model ID" dropdown option
const CUSTOM_MODEL = '__custom__'

// Catalog entry for the currently selected provider (carries its suggested models)
const selectedProvider = computed(() =>
  providers.value.find((p) => p.value === setupConfig.value.provider)
)

// Suggested models for the provider, plus a "Custom model ID" option when allowed
const modelOptions = computed(() => {
  const provider = selectedProvider.value
  if (!provider) return []
  const options = [...provider.models]
  if (provider.custom_allowed) {
    options.push({ value: CUSTOM_MODEL, label: 'Custom model ID…' })
  }
  return options
})

// Whether the user is entering a custom (typed) model ID
const useCustomModel = ref(false)

// Dropdown binding: shows the sentinel while in custom mode, otherwise the selected
// model id. Selecting the sentinel switches to the free-text input.
const modelDropdown = computed({
  get: () => (useCustomModel.value ? CUSTOM_MODEL : setupConfig.value.model),
  set: (val: string) => {
    if (val === CUSTOM_MODEL) {
      useCustomModel.value = true
      setupConfig.value.model = ''
    } else {
      useCustomModel.value = false
      setupConfig.value.model = val
    }
  },
})

// When an existing config loads (or the catalog arrives) with a model that isn't in
// the suggested list, switch to custom mode so the text field shows it.
watch(
  [providers, () => setupConfig.value.provider, () => setupConfig.value.model],
  () => {
    const provider = selectedProvider.value
    if (!provider || !setupConfig.value.model) return
    const isSuggested = provider.models.some((m) => m.value === setupConfig.value.model)
    if (!isSuggested && provider.custom_allowed) {
      useCustomModel.value = true
    }
  },
  { immediate: true }
)

// Plan computed properties
const currentPlan = computed(() => currentSubscription.value?.plan)

// Dynamic message limits based on current plan
const currentPlanMessageLimit = computed(() => {
  const plan = currentPlan.value
  if (!plan || !plan.max_messages) {
    return 'Unlimited messages/month'
  }
  
  // Format the number with commas for better readability
  const formattedLimit = plan.max_messages.toLocaleString()
  
  // Don't show "per seat" if max_agents is 1 (single agent plan)
  const perSeatText = plan.max_agents === 1 ? '' : ' per seat'
  return `${formattedLimit} messages/month${perSeatText}`
})

const currentPlanName = computed(() => {
  const plan = currentPlan.value
  return plan?.name || 'Current Plan'
})

// Check available plans and upgrade options
const availablePlans = computed(() => {
  const plans = subscriptionStorage.getAvailablePlans()
  
  // If plans are empty and we have enterprise module, trigger fetch
  if (plans.length === 0 && hasEnterpriseModule) {
    subscriptionStore.value.fetchPlans?.().catch((err: any) => {
      console.error('Failed to fetch plans:', err)
    })
  }
  
  return plans
})

// Determine if user can upgrade (not on the highest tier plan)
const canUpgrade = computed(() => {
  const current = currentPlan.value
  const available = availablePlans.value
  
  if (!current || !available || available.length === 0) {
    return false
  }
  
  // Find plans with higher message limits
  const higherPlans = available.filter(plan => {
    const currentMessages = current.max_messages || 0
    const planMessages = plan.max_messages || 0
    
    // If both plans have unlimited messages (0), no upgrade needed
    if (currentMessages === 0 && planMessages === 0) {
      return false
    }
    
    // If current plan has unlimited (0) but checking plan has limit, not an upgrade
    if (currentMessages === 0 && planMessages > 0) {
      return false
    }
    
    // If current plan has limit but checking plan has unlimited (0), that's an upgrade
    if (currentMessages > 0 && planMessages === 0) {
      return true
    }
    
    // Both have limits, check if plan has higher limit
    return planMessages > currentMessages
  })
  
  return higherPlans.length > 0
})

// Get the next upgrade plan (plan with the next higher message limit)
const nextUpgradePlan = computed(() => {
  const current = currentPlan.value
  const available = availablePlans.value
  
  if (!current || !available || !canUpgrade.value) {
    return null
  }
  
  const currentMessages = current.max_messages || 0
  
  // Find plans with higher message limits
  const higherPlans = available.filter(plan => {
    const planMessages = plan.max_messages || 0
    
    // If current plan has unlimited (0) but checking plan has limit, not an upgrade
    if (currentMessages === 0 && planMessages > 0) {
      return false
    }
    
    // If current plan has limit but checking plan has unlimited (0), that's an upgrade
    if (currentMessages > 0 && planMessages === 0) {
      return true
    }
    
    // Both have limits, check if plan has higher limit
    return planMessages > currentMessages
  })
  
  // Sort plans: unlimited plans (0) go last, limited plans sorted by message count
  const sortedPlans = higherPlans.sort((a, b) => {
    const aMessages = a.max_messages || 0
    const bMessages = b.max_messages || 0
    
    // If one is unlimited (0) and other has limit, unlimited goes last
    if (aMessages === 0 && bMessages > 0) return 1
    if (bMessages === 0 && aMessages > 0) return -1
    
    // Both unlimited or both limited, sort by message count
    return aMessages - bMessages
  })
  
  return sortedPlans[0] || null
})

// Rate limit (using default value since it's not stored in plan yet)
const rateLimitText = computed(() => {
  // Default rate limit - this could be made dynamic in the future
  const rateLimit = 100
  return `Rate limit: ${rateLimit} messages/minute`
})

// Clear the model + custom-mode whenever the user switches provider, so a stale
// model from the previous provider can't be carried over (and submitted). The very
// first assignment — the initial load of an existing config — is skipped so the
// saved model is preserved.
let providerInitialized = false
watch(() => setupConfig.value.provider, () => {
  if (!providerInitialized) {
    providerInitialized = true
    return
  }
  setupConfig.value.model = ''
  useCustomModel.value = false
})

const selectTab = (tab: 'chattermate' | 'custom') => {
  if (tab === 'chattermate' && !hasEnterpriseModule) return
  // Allow clicking on custom tab even when locked to show upgrade option
  activeTab.value = tab
}

const handleUpgrade = () => {
  // Navigate to subscription settings page
  window.location.href = '/settings/subscription'
}

// Ensure plans are available when component mounts
onMounted(async () => {
  if (hasEnterpriseModule && subscriptionStorage.getAvailablePlans().length === 0) {
    try {
      // Initialize the subscription store first
      const module = await loadModule(moduleImports.subscriptionStore)
      if (module?.default) {
        // Access the subscriptionStore export directly
        subscriptionStore.value = module.default
        
        // Then fetch plans
        await subscriptionStore.value.fetchPlans?.()
      }
    } catch (err) {
      console.error('Failed to fetch plans on mount:', err)
    }
  }
})

const handleSubmit = async () => {
  try {
    let success = false
    if (hasExistingConfig.value) {
      success = await updateAISetup()
    } else {
      success = await saveAISetup()
    }
    
    if (success) {
      emit('ai-setup-complete')
    }
  } catch (error) {
    console.error('Submit error:', error)
  }
}

const setupChatterMateAI = async () => {
  try {
    // Set the config values first
    setupConfig.value.provider = 'chattermate'
    setupConfig.value.model = 'chattermate'
    setupConfig.value.apiKey = ''
    
    // Then save using the existing function without arguments
    let success = false
    if (hasExistingConfig.value) {
      success = await updateAISetup()
    } else {
      success = await saveAISetup()
    }
    
    if (success) {
      emit('ai-setup-complete')
    }
  } catch (error) {
    console.error('ChatterMate setup error:', error)
  }
}

// Button text based on whether we're creating or updating
const submitButtonText = computed(() => {
  if (isLoading.value) return 'Saving...'
  return hasExistingConfig.value ? 'Update Configuration' : 'Save Configuration'
})

const chatterMateButtonText = computed(() => {
  return hasExistingConfig.value ? 'Update to ChatterMate AI' : 'Proceed with ChatterMate AI'
})
</script>

<template>
  <div class="ai-setup">
    <div v-if="isLoading" class="loading-container">
      <div class="loader"></div>
    </div>
    
    <div v-else>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <header class="page-header">
        <h1 class="page-title">AI Configuration</h1>
        <p class="page-subtitle">Your agents already run on ChatterMate AI. Switch to your own model any time — this is optional.</p>
      </header>

      <div class="tabs-container">
        <div class="tabs">
          <div
            v-if="hasEnterpriseModule"
            class="tab"
            :class="{ active: activeTab === 'chattermate' }"
            @click="selectTab('chattermate')"
          >
            <span class="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="8"></circle>
              </svg>
            </span>
            <span class="tab-label">ChatterMate AI</span>
          </div>
          <div
            class="tab"
            :class="{
              active: activeTab === 'custom',
              locked: isCustomModelsLocked
            }"
            @click="selectTab('custom')"
          >
            <span class="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="11" width="14" height="9" rx="2"></rect>
                <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
              </svg>
            </span>
            <span class="tab-label">Advanced — Bring Your Own Model</span>
            <span v-if="hasEnterpriseModule && isCustomModelsLocked" class="lock-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <circle cx="12" cy="7" r="4"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
          </div>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'chattermate' && hasEnterpriseModule" class="chattermate-content">
            <div class="provider-info">
              <div class="provider-header">
                <span class="active-pill">
                  <span class="active-dot"></span>
                  <span class="active-text">ACTIVE</span>
                </span>
                <h4>ChatterMate AI</h4>
                <p class="provider-tagline">Zero setup. Managed models, ready instantly — this is the default.</p>
              </div>

              <div class="plan-table">
                <div class="plan-row">
                  <div class="plan-cell plan-label">{{ currentPlanName }}</div>
                  <div class="plan-cell plan-value">{{ currentPlanMessageLimit }}</div>
                </div>
                <div class="plan-divider"></div>
                <div class="plan-row rate-limit-row">
                  <div class="plan-cell plan-label">Rate limit</div>
                  <div class="plan-cell rate-limit-value">{{ rateLimitText }}</div>
                </div>
              </div>
              
              <!-- Upgrade prompt when not on highest plan (only shown when enterprise module exists) -->
              <div v-if="hasEnterpriseModule && canUpgrade && nextUpgradePlan" class="upgrade-prompt">
                <div class="upgrade-info">
                  <div class="upgrade-icon">⚡</div>
                  <div class="upgrade-text">
                    <div class="upgrade-title">Want more messages?</div>
                    <div class="upgrade-description">
                      Upgrade to {{ nextUpgradePlan.name }} for 
                      {{ nextUpgradePlan.max_messages ? nextUpgradePlan.max_messages.toLocaleString() : 'unlimited' }} 
                      messages/month{{ nextUpgradePlan.max_agents === 1 ? '' : ' per seat' }}
                    </div>
                  </div>
                </div>
                <button class="upgrade-button" @click="handleUpgrade">
                  Upgrade Plan
                </button>
              </div>
              
              <div class="action-area">
                <button class="continue-button" @click="setupChatterMateAI">
                  {{ chatterMateButtonText }}
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="activeTab === 'custom'" class="custom-content">
            <!-- Custom Models Locked Overlay (only shown when enterprise module exists) -->
            <div v-if="hasEnterpriseModule && isCustomModelsLocked" class="custom-models-locked-overlay">
              <div class="locked-content">
                <div class="locked-header">
                  <div class="locked-icon-wrapper">
                    <div class="locked-icon-bg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="locked-icon">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      </svg>
                    </div>
                  </div>
                  <h3>Bring Your Own Model</h3>
                  <div class="locked-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="badge-icon">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="7" r="4"></circle>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Premium Feature</span>
                  </div>
                </div>
                
                <p class="locked-description">
                  Unlock the ability to use your own AI models from providers like OpenAI, Groq, and more. 
                  Configure custom API keys and select from a wide range of models to power your agents.
                </p>
                
                <div class="locked-features">
                  <div class="feature-item">
                    <div class="feature-icon-wrapper">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                      </svg>
                    </div>
                    <div class="feature-content">
                      <span class="feature-title">Multiple AI Providers</span>
                      <span class="feature-desc">Support for OpenAI, Groq, and other leading AI providers</span>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon-wrapper">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                        <path d="M9 12l2 2 4-4"></path>
                        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                      </svg>
                    </div>
                    <div class="feature-content">
                      <span class="feature-title">Custom API Keys</span>
                      <span class="feature-desc">Use your own API keys for full control and cost management</span>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon-wrapper">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10,9 9,9 8,9"></polyline>
                      </svg>
                    </div>
                    <div class="feature-content">
                      <span class="feature-title">Model Selection</span>
                      <span class="feature-desc">Choose from the latest and most powerful AI models</span>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon-wrapper">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <path d="M21 15l-5-5L5 21"></path>
                      </svg>
                    </div>
                    <div class="feature-content">
                      <span class="feature-title">Advanced Configuration</span>
                      <span class="feature-desc">Fine-tune model parameters and settings for optimal performance</span>
                    </div>
                  </div>
                </div>
                
                <div class="upgrade-section">
                  <button class="upgrade-button" @click="handleUpgrade">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="upgrade-icon">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    <span>Upgrade to Unlock Custom Models</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow-icon">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12,5 19,12 12,19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Custom Models Form (when unlocked) -->
            <div v-else>
              <form @submit.prevent="handleSubmit" class="setup-form">
                <h4 class="setup-title">Bring your own model</h4>
                <p class="setup-description">
                  {{ hasExistingConfig ? 'Update your AI provider settings' : 'Connect a provider with your own API key. Full control, your rates.' }}
                </p>

                <div class="form-group">
                  <label>AI Provider</label>
                  <div class="provider-grid" role="radiogroup">
                    <button
                      v-for="provider in providers"
                      :key="provider.value"
                      type="button"
                      class="provider-card"
                      :class="{ selected: setupConfig.provider === provider.value }"
                      role="radio"
                      :aria-checked="setupConfig.provider === provider.value"
                      @click="setupConfig.provider = provider.value"
                    >
                      <span class="provider-radio">
                        <span v-if="setupConfig.provider === provider.value" class="provider-radio-dot"></span>
                      </span>
                      <span class="provider-name">{{ provider.label }}</span>
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="model">Model Name</label>
                  <select
                    id="model"
                    v-model="modelDropdown"
                    required
                    class="form-control"
                    :disabled="!setupConfig.provider || modelOptions.length === 0"
                  >
                    <option value="" disabled>Select Model</option>
                    <option
                      v-for="model in modelOptions"
                      :key="model.value"
                      :value="model.value"
                    >
                      {{ model.label }}
                    </option>
                  </select>
                  <input
                    v-if="useCustomModel"
                    id="customModel"
                    type="text"
                    v-model="setupConfig.model"
                    required
                    placeholder="Enter the exact model ID (e.g. gpt-4o)"
                    class="form-control form-control-mono custom-model-input"
                  />
                  <p v-if="useCustomModel" class="key-hint">
                    Enter any model ID your provider supports — we'll validate it with your API key.
                  </p>
                </div>

                <div v-if="showApiKey" class="form-group">
                  <label for="apiKey">API Key</label>
                  <input
                    id="apiKey"
                    type="password"
                    v-model="setupConfig.apiKey"
                    :required="showApiKey"
                    placeholder="sk-..."
                    class="form-control form-control-mono"
                  />
                  <p class="key-hint">
                    Your API key will be encrypted and stored securely.<template v-if="selectedProvider?.api_key_url">&nbsp;&nbsp;<a
                      :href="selectedProvider.api_key_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="key-help-link"
                    >Get your {{ selectedProvider.label }} API key ↗</a></template>
                  </p>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isLoading"
                >
                  {{ submitButtonText }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-setup {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loader {
  border: 3px solid var(--o12);
  border-top: 3px solid var(--accent-ink);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: var(--surface);
  color: var(--error-color);
  padding: 12px;
  border-radius: var(--radius-input);
  margin-bottom: 20px;
}

/* Page header */
.page-header {
  margin: 10px auto 30px;
  text-align: center;
}

.page-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  letter-spacing: -.02em;
  margin: 0 0 8px;
  color: var(--text);
}

.page-subtitle {
  font-size: 15px;
  color: var(--muted);
  margin: 0;
}

.tabs-container {
  border: 1px solid var(--o08);
  border-radius: 20px;
  overflow: hidden;
  background: var(--surface);
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--o08);
}

.tab {
  flex: 1;
  padding: 16px;
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--muted);
  transition: var(--transition-fast);
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: var(--accent-ink);
}

.tab.active {
  color: var(--accent-ink);
  border-bottom: 2px solid var(--accent-ink);
  font-weight: 600;
}

.tab.locked {
  opacity: 0.8;
  position: relative;
}

.tab.locked:hover {
  color: var(--accent-ink);
}

.tab.locked.active {
  color: var(--accent-ink);
  border-bottom: 2px solid var(--accent-ink);
  opacity: 1;
}

.tab-icon {
  display: flex;
  align-items: center;
}

.lock-icon {
  display: flex;
  align-items: center;
  margin-left: var(--space-xs);
  color: var(--muted);
}

.tab-content {
  padding: 26px;
}

.setup-form {
  max-width: 520px;
}

.setup-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 20px;
  margin: 0 0 6px;
  color: var(--text);
}

.setup-description {
  margin: 0 0 22px;
  font-size: 14px;
  color: var(--muted);
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  display: block;
  margin-bottom: 9px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text3);
}

.form-control {
  width: 100%;
  padding: 14px 16px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: var(--radius-input);
  color: var(--text);
  font-size: 14px;
  font-family: var(--font-sans);
  outline: none;
  transition: var(--transition-fast);
}

.form-control-mono {
  font-family: var(--font-mono);
}

.custom-model-input {
  margin-top: 8px;
}

.form-control:focus {
  border-color: var(--accent-ink);
  box-shadow: var(--ring-focus);
}

/* Provider card grid */
.provider-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.provider-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 15px 16px;
  background: var(--o05);
  border: 1px solid var(--o10);
  border-radius: var(--radius-input);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 14.5px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: var(--transition-fast);
}

.provider-card.selected {
  background: var(--accent-bg-08);
  border-color: var(--accent-border);
}

.provider-radio {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid var(--o25);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.provider-card.selected .provider-radio {
  border-color: var(--accent-ink);
}

.provider-radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-solid);
}

.key-hint {
  font-size: var(--text-sm);
  color: var(--muted2);
  margin-top: var(--space-xs);
}

.key-help-link {
  color: var(--accent-ink);
  text-decoration: none;
  white-space: nowrap;
}

.key-help-link:hover {
  text-decoration: underline;
}

.btn {
  padding: 14px 26px;
  border: none;
  border-radius: var(--radius-btn);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  transition: var(--transition-fast);
}

.btn-primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}

.btn-primary:hover {
  filter: brightness(1.05);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.provider-info {
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
}

.provider-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.active-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  background: var(--accent-bg-12);
  border: 1px solid var(--accent-border);
  margin-bottom: 16px;
}

.active-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-solid);
}

.active-text {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-ink);
}

.provider-header h4 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 20px;
  margin: 0 0 6px;
  color: var(--text);
}

.provider-tagline {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}

.plan-table {
  background: var(--bg);
  border-radius: 14px;
  border: 1px solid var(--o08);
  overflow: hidden;
}

.plan-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
}

.plan-label {
  font-size: 15px;
  color: var(--text3);
}

.plan-value {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 17px;
  color: var(--accent-ink);
  text-align: right;
}

.plan-divider {
  height: 1px;
  background: var(--o07);
}

.rate-limit-value {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--muted);
  text-align: right;
}

.action-area {
  display: flex;
  justify-content: flex-start;
  margin-top: var(--space-sm);
}

.continue-button {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-btn);
  padding: 14px 26px;
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}

.continue-button:hover {
  filter: brightness(1.05);
}

/* Upgrade Prompt Styles */
.upgrade-prompt {
  background: linear-gradient(135deg, var(--c-purple), var(--c-purple));
  border-radius: var(--radius-input);
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  color: var(--on-accent-solid);
  margin-top: var(--space-md);
}

.upgrade-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex: 1;
}

.upgrade-icon {
  font-size: 1.5rem;
  opacity: 0.9;
}

.upgrade-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.upgrade-title {
  font-weight: 600;
  font-size: 1rem;
}

.upgrade-description {
  font-size: 0.875rem;
  opacity: 0.9;
  line-height: 1.4;
}

.upgrade-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.upgrade-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

/* Responsive upgrade prompt */
@media (max-width: 768px) {
  .upgrade-prompt {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: var(--space-md);
  }
  
  .upgrade-info {
    justify-content: center;
    text-align: center;
  }
  
  .upgrade-button {
    width: 100%;
  }
}

/* Custom Models Locked Overlay Styles */
.custom-models-locked-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  background: var(--bg);
  border-radius: 20px;
  margin: var(--space-md) 0;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--o08);
}

.custom-models-locked-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, var(--purple-bg) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, var(--accent-bg-08) 0%, transparent 50%);
  pointer-events: none;
}

.custom-models-locked-overlay .locked-content {
  text-align: center;
  max-width: 700px;
  padding: var(--space-xl) var(--space-lg);
  position: relative;
  z-index: 1;
}

.custom-models-locked-overlay .locked-header {
  margin-bottom: var(--space-lg);
}

.custom-models-locked-overlay .locked-icon-wrapper {
  margin-bottom: var(--space-md);
}

.custom-models-locked-overlay .locked-icon-bg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--accent-solid);
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--space-sm);
}

.custom-models-locked-overlay .locked-icon {
  font-size: 1.25rem;
  color: var(--on-accent-solid);
}

.custom-models-locked-overlay h3 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--space-sm);
}

.custom-models-locked-overlay .locked-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: var(--accent-bg-12);
  color: var(--accent-ink);
  border: 1px solid var(--accent-border);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 600;
}

.custom-models-locked-overlay .badge-icon {
  font-size: 0.75rem;
}

.custom-models-locked-overlay .locked-description {
  font-size: var(--text-base);
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: var(--space-lg);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.custom-models-locked-overlay .locked-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.custom-models-locked-overlay .feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--surface);
  border-radius: var(--radius-input);
  border: 1px solid var(--o08);
  text-align: left;
  transition: all var(--transition-normal);
}

.custom-models-locked-overlay .feature-item:hover {
  transform: translateY(-2px);
  border-color: var(--o12);
}

.custom-models-locked-overlay .feature-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--accent-solid);
  border-radius: var(--radius-input);
  flex-shrink: 0;
}

.custom-models-locked-overlay .feature-icon {
  font-size: 0.875rem;
  color: var(--on-accent-solid);
}

.custom-models-locked-overlay .feature-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.custom-models-locked-overlay .feature-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text);
}

.custom-models-locked-overlay .feature-desc {
  font-size: var(--text-xs);
  color: var(--muted);
  line-height: 1.4;
}

.custom-models-locked-overlay .upgrade-section {
  text-align: center;
}

.custom-models-locked-overlay .upgrade-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-btn);
  padding: var(--space-md) var(--space-lg);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.custom-models-locked-overlay .upgrade-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.custom-models-locked-overlay .upgrade-button:hover::before {
  left: 100%;
}

.custom-models-locked-overlay .upgrade-button:hover {
  filter: brightness(1.05);
  transform: translateY(-2px);
}

.custom-models-locked-overlay .upgrade-icon {
  font-size: 0.875rem;
  color: var(--on-accent-solid);
}

.custom-models-locked-overlay .arrow-icon {
  font-size: 0.75rem;
  transition: transform var(--transition-normal);
}

.custom-models-locked-overlay .upgrade-button:hover .arrow-icon {
  transform: translateX(4px);
}

/* Responsive adjustments for custom models locked overlay */
@media (max-width: 768px) {
  .custom-models-locked-overlay {
    min-height: 40vh;
    margin: var(--space-sm) 0;
  }
  
  .custom-models-locked-overlay .locked-content {
    padding: var(--space-lg) var(--space-md);
  }
  
  .custom-models-locked-overlay h3 {
    font-size: var(--text-xl);
  }
  
  .custom-models-locked-overlay .locked-description {
    font-size: var(--text-sm);
    margin-bottom: var(--space-md);
  }
  
  .custom-models-locked-overlay .locked-features {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }
  
  .custom-models-locked-overlay .feature-item {
    padding: var(--space-sm);
  }
  
  .custom-models-locked-overlay .feature-icon-wrapper {
    width: 28px;
    height: 28px;
  }
  
  .custom-models-locked-overlay .feature-icon {
    font-size: 0.75rem;
  }
  
  .custom-models-locked-overlay .upgrade-button {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-xs);
  }
  
  .custom-models-locked-overlay .locked-icon-bg {
    width: 40px;
    height: 40px;
  }
  
  .custom-models-locked-overlay .locked-icon {
    font-size: 1rem;
  }
}
</style>