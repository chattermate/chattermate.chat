<template>
  <s-app-nav>
    <s-link href="/shopify/agent-management" rel="home">Home</s-link>
    <s-link href="/shopify/inbox">Inbox</s-link>
    <s-link href="/shopify/pricing">Pricing</s-link>
  </s-app-nav>

  <s-page>
    <!-- Loading State -->
    <s-section v-if="isInitializing">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Initializing Shopify integration...</p>
      </div>
    </s-section>

    <!-- Connect Account Banner -->
    <s-section v-else-if="showConnectButton">
      <div class="connect-banner">
        <div class="connect-content">
          <h2>Connect Your ChatterMate Account</h2>
          <p>Link your Shopify store to your ChatterMate organization to enable AI agents.</p>
          <button class="connect-btn" @click="handleConnectAccount">
            Connect Account
          </button>
        </div>
      </div>
    </s-section>

    <!-- Header Section -->
    <s-section v-else>
      <div class="panel-header">
        <div v-if="loadingAgent" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading agent details...</p>
        </div>
        <div v-else-if="selectedAgent" class="header-layout">
          <div class="agent-header">
            <div class="agent-avatar" @click="triggerPhotoUpload">
              <input type="file" ref="photoInput" accept="image/jpeg,image/png,image/webp" class="hidden"
                @change="handlePhotoChange">
              <img :src="currentPhotoUrl" :alt="selectedAgent.display_name || selectedAgent.name" 
                :class="{ 'opacity-50': uploadingPhoto }">
              <div class="upload-overlay" v-if="!uploadingPhoto">
                <span>Change Photo</span>
              </div>
              <div class="upload-overlay" v-else>
                <span>Uploading...</span>
              </div>
            </div>
            <div class="agent-info">
              <div class="name-section">
                <div v-if="!editingAgentName" class="name-display">
                  <h3>{{ selectedAgent?.display_name || selectedAgent?.name }}</h3>
                  <button class="edit-icon-button" @click="startEditAgentName" title="Edit name">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </div>
                <div v-else class="name-edit">
                  <input 
                    v-model="tempAgentName" 
                    class="name-input"
                    placeholder="Enter display name"
                    @keyup.enter="saveAgentName"
                    @keyup.escape="cancelEditAgentName"
                    ref="agentNameInput"
                  >
                  <div class="edit-actions">
                    <button class="save-icon-button" @click="saveAgentName" title="Save">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>
                    </button>
                    <button class="cancel-icon-button" @click="cancelEditAgentName" title="Cancel">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div class="status-and-mode">
                <div class="status-toggle">
                  <label class="status-switch">
                    <input 
                      type="checkbox" 
                      :checked="selectedAgent?.is_active || false"
                      @change="handleStatusToggle"
                    >
                    <span class="status-slider"></span>
                  </label>
                  <span class="status-text">{{ selectedAgent?.is_active ? 'Online' : 'Offline' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-agent-container">
          <div class="loading-container">
            <p class="loading-text">No agent selected</p>
          </div>
        </div>
      </div>
    </s-section>

    <!-- Tab Navigation -->
    <s-section v-if="!isInitializing && !showConnectButton && selectedAgent">
      <div class="tabs-container">
        <div class="tabs-header">
          <div class="tabs-left">
            <button
              class="tab-button"
              :class="{ active: activeTab === 'setup' }"
              @click="switchTab('setup')"
            >
              Setup Instructions
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'customization' }"
              @click="switchTab('customization')"
            >
              Agent Customization
            </button>
          </div>

          <div class="tabs-right">
            <s-button @click="goToDashboard" class="dashboard-button">
              Go to ChatterMate
            </s-button>
          </div>
        </div>

        <div class="tab-content">
          <!-- Setup Tab -->
          <SetupTab
            v-if="activeTab === 'setup'"
            :agents-connected="agentsConnected"
            :widget-id="widgetId || undefined"
            @open-theme-editor="openShopifyThemeEditor"
          />
          <!-- Customization Tab -->
          <CustomizationTab
            v-if="activeTab === 'customization'"
            :agent="selectedAgent"
            :loading="loadingAgent"
            :saving="savingAgent"
            @save="saveAgentChanges"
          />
        </div>
      </div>
    </s-section>
  </s-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { agentService } from '@/services/agent'
import type { Agent, AgentWithCustomization, ChatStyle } from '@/types/agent'
import { toast } from 'vue-sonner'
import api from '@/services/api'
import SetupTab from '@/components/shopify/SetupTab.vue'
import CustomizationTab from '@/components/shopify/CustomizationTab.vue'
import { useShopifySession } from '@/composables/useShopifySession'

const route = useRoute()
const router = useRouter()

// Use Shopify session composable
const { isEmbedded, getToken } = useShopifySession()

// State
const activeTab = ref('setup')
const showConnectButton = ref(false)
const shopInfo = ref<any>(null)
const isInitializing = ref(true)
const shopName = computed(() => {
  const shop = route?.query?.shop as string
  return shop ? shop.replace('.myshopify.com', '') : 'your store'
})
const shopId = computed(() => route?.query?.shop_id as string)
const agentsConnected = computed(() => {
  // Use connected agents count from loaded data, or fallback to URL param
  const count = connectedAgents.value?.length || Number(route?.query?.agents_connected) || 0
  console.log('🔢 Agents connected count:', count)
  return count
})
const widgetId = ref<string | null>(null)

// Agent management
const connectedAgents = ref<Agent[]>([])
const selectedAgentId = ref<string>('')
const selectedAgent = ref<AgentWithCustomization | null>(null)
const loadingAgent = ref(false)
const savingAgent = ref(false)

// Photo upload
const photoInput = ref<HTMLInputElement | null>(null)
const uploadingPhoto = ref(false)

// Agent name editing
const editingAgentName = ref(false)
const tempAgentName = ref('')
const agentNameInput = ref<HTMLInputElement | null>(null)

// Computed
const currentPhotoUrl = computed(() => {
  if (!selectedAgent.value?.customization?.photo_url) {
    return '/default-avatar.png' // Fallback avatar
  }
  
  const photoUrl = selectedAgent.value.customization.photo_url
  
  // If it's an S3 URL, use it directly
  if (photoUrl.includes('amazonaws.com')) {
    return photoUrl
  }
  
  // For local storage, prepend the API URL
  return import.meta.env.VITE_API_URL + photoUrl
})

// Methods
const switchTab = (tab: string) => {
  activeTab.value = tab

  // Update URL query params
  const query = { ...route.query, tab }
  router.replace({ query })

  // Load data based on tab
  if (tab === 'customization' && !selectedAgent.value) {
    loadSelectedAgent()
  }
}

const loadShopConfigStatus = async () => {
  try {
    console.log('🔍 Loading shop config status')
    const response = await api.get('/shopify/shop-config-status')
    const shopConfig = response.data
    console.log('✅ Shop config loaded:', shopConfig)
    
    // Update widget ID
    widgetId.value = shopConfig.widget_id
    console.log('🎯 Widget ID set to:', widgetId.value)
    
    return shopConfig
  } catch (error) {
    console.error('Error loading shop config status:', error)
    return null
  }
}

const loadConnectedAgents = async () => {
  // Use shop_id from shopInfo (token exchange response) or fallback to URL param
  const currentShopId = shopInfo.value?.shop_id || shopId.value
  if (!currentShopId) {
    console.error('No shop ID available')
    return
  }
  
  try {
    console.log('🔍 Loading connected agents for shop:', currentShopId)
    const response = await api.get(`/shopify/connected-agents`, {
      params: { shop_id: currentShopId }
    })
    connectedAgents.value = response.data || []
    console.log('✅ Connected agents loaded:', connectedAgents.value.length)
    
    if (connectedAgents.value.length > 0) {
      selectedAgentId.value = connectedAgents.value[0].id
      console.log('👤 Selected agent:', selectedAgentId.value)
    }
  } catch (error) {
    console.error('Error loading connected agents:', error)
    // Fallback: load all organization agents
    try {
      console.log('🔄 Fallback: loading organization agents')
      connectedAgents.value = await agentService.getOrganizationAgents()
      if (connectedAgents.value.length > 0) {
        selectedAgentId.value = connectedAgents.value[0].id
        console.log('👤 Selected agent from fallback:', selectedAgentId.value)
      }
    } catch (err) {
      console.error('Error loading organization agents:', err)
      toast.error('Failed to load agents')
    }
  }
}

const loadSelectedAgent = async () => {
  if (!selectedAgentId.value) {
    console.log('⚠️ No selected agent ID')
    return
  }
  
  console.log('📥 Loading selected agent:', selectedAgentId.value)
  loadingAgent.value = true
  try {
    selectedAgent.value = await agentService.getAgentById(selectedAgentId.value)
    console.log('✅ Selected agent loaded:', selectedAgent.value?.name)
  } catch (error) {
    console.error('Error loading agent:', error)
    toast.error('Failed to load agent details')
  } finally {
    loadingAgent.value = false
  }
}

const saveAgentChanges = async (data: { 
  instructions: string;
  chat_style: ChatStyle;
  chat_background_color: string;
  chat_bubble_color: string;
  accent_color: string;
  welcome_title: string;
  welcome_subtitle: string;
}) => {
  if (!selectedAgent.value) return
  
  savingAgent.value = true
  try {
    const instructions = data.instructions
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    
    // Update agent instructions
    await agentService.updateAgent(selectedAgent.value.id, {
      instructions
    })
    
    // Update customization if it exists or create new one
    const customizationData = {
      chat_style: data.chat_style,
      chat_background_color: data.chat_background_color,
      chat_bubble_color: data.chat_bubble_color,
      accent_color: data.accent_color,
      welcome_title: data.welcome_title,
      welcome_subtitle: data.welcome_subtitle
    }
    
    if (selectedAgent.value.customization?.id) {
      await agentService.updateCustomization(selectedAgent.value.id, {
        id: selectedAgent.value.customization.id,
        agent_id: selectedAgent.value.id,
        ...customizationData
      })
    } else {
      await agentService.updateCustomization(selectedAgent.value.id, {
        id: 0,
        agent_id: selectedAgent.value.id,
        ...customizationData
      })
    }
    
    toast.success('Agent updated successfully')
    
    // Reload agent to get fresh data
    await loadSelectedAgent()
  } catch (error) {
    console.error('Error saving agent:', error)
    toast.error('Failed to save agent changes')
  } finally {
    savingAgent.value = false
  }
}

const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

// Agent name editing functions
const startEditAgentName = () => {
  if (!selectedAgent.value) return
  editingAgentName.value = true
  tempAgentName.value = selectedAgent.value.display_name || selectedAgent.value.name
  nextTick(() => {
    agentNameInput.value?.focus()
    agentNameInput.value?.select()
  })
}

const saveAgentName = async () => {
  if (!selectedAgent.value || !tempAgentName.value.trim()) {
    cancelEditAgentName()
    return
  }
  
  try {
    await agentService.updateAgent(selectedAgent.value.id, {
      display_name: tempAgentName.value.trim()
    })
    
    // Update local state
    selectedAgent.value.display_name = tempAgentName.value.trim()
    editingAgentName.value = false
    toast.success('Agent name updated successfully')
  } catch (error) {
    console.error('Error updating agent name:', error)
    toast.error('Failed to update agent name')
    cancelEditAgentName()
  }
}

const cancelEditAgentName = () => {
  editingAgentName.value = false
  tempAgentName.value = ''
}

// Handle status toggle
const handleStatusToggle = async (event: Event) => {
  const newStatus = (event.target as HTMLInputElement).checked
  
  if (!selectedAgent.value) return
  
  try {
    await agentService.updateAgent(selectedAgent.value.id, {
      is_active: newStatus
    })
    
    // Update local state
    selectedAgent.value.is_active = newStatus
    
    toast.success(`Agent ${newStatus ? 'activated' : 'deactivated'} successfully`)
  } catch (error) {
    console.error('Error updating agent status:', error)
    toast.error('Failed to update agent status')
    // Revert the checkbox state on error
    ;(event.target as HTMLInputElement).checked = selectedAgent.value.is_active
  }
}

const handlePhotoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // For simplicity, upload directly without cropper
  if (!selectedAgent.value) return

  uploadingPhoto.value = true
  try {
    const updatedCustomization = await agentService.uploadAgentPhoto(selectedAgent.value.id, file)

    if (selectedAgent.value.customization) {
      selectedAgent.value.customization.photo_url = updatedCustomization.photo_url
    }

    toast.success('Photo updated successfully')
  } catch (error) {
    console.error('Error uploading photo:', error)
    toast.error('Failed to upload photo')
  } finally {
    uploadingPhoto.value = false
  }
}

const goToDashboard = () => {
  window.open('https://app.chattermate.chat', '_blank')
}

const openShopifyThemeEditor = () => {
  const shop = route.query.shop as string
  if (shop) {
    const themeEditorUrl = `https://${shop}/admin/themes/current/editor?context=apps`
    window.open(themeEditorUrl, '_blank')
  }
}

// Handle connect account popup
const handleConnectAccount = () => {
  if (!shopInfo.value) return

  // Build full login URL with return_to parameter
  const baseUrl = window.location.origin
  const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
  const loginUrl = `${baseUrl}/login?shopify_flow=1&shop=${shopInfo.value.shop_domain}&shop_id=${shopInfo.value.shop_id}&return_to=${returnTo}`

  console.log('🪟 Redirecting to login page:', loginUrl)

  // For embedded context, redirect the top-level window (breaks out of iframe)
  // For non-embedded context, just redirect normally
  if (isEmbedded.value && window.top) {
    console.log('📱 Redirecting top-level window (embedded context)')
    window.top.location.href = loginUrl
  } else {
    console.log('🖥️ Redirecting current window (non-embedded context)')
    window.location.href = loginUrl
  }
}

// Initialize
onMounted(async () => {
  try {
    console.log('🚀 ShopifyAgentManagement mounted')
    
    // 1. Get session token from App Bridge
    const sessionToken = await getToken()
    
    if (!sessionToken) {
      // Redirect to bounce page with current path as reload target
      const currentPath = route.fullPath
      console.log('⚠️ No session token, redirecting to bounce page')
      router.replace(`/shopify/session-token-bounce?shopify-reload=${encodeURIComponent(currentPath)}`)
      return
    }
    
    console.log('✅ Session token obtained')
    
    // 2. Exchange token for offline access token
    try {
      const response = await api.post('/shopify/exchange-token')
      shopInfo.value = response.data
      console.log('✅ Token exchanged successfully:', shopInfo.value)
    } catch (error: any) {
      console.error('❌ Token exchange failed:', error)
      toast.error('Failed to authenticate with Shopify')
      return
    }
    
    // 3. Check organization linkage
    if (!shopInfo.value.organization_id) {
      console.log('⚠️ No organization linked, showing connect button')
      showConnectButton.value = true
      isInitializing.value = false
      return
    }
    
    console.log('✅ Organization linked:', shopInfo.value.organization_id)
    
    // 4. Check agent connections
    try {
      const agents = await api.get(`/shopify/connected-agents?shop_id=${shopInfo.value.shop_id}`)
      console.log('📊 Connected agents:', agents.data.length)
      
      if (agents.data.length === 0) {
        console.log('➡️ No agents connected, redirecting to selection')
        router.push({
          name: 'shopify-agent-selection',
          query: { shop: shopInfo.value.shop_domain, shop_id: shopInfo.value.shop_id }
        })
        return
      }
    } catch (error: any) {
      console.error('❌ Failed to check connected agents:', error)
      // Continue anyway, will try to load in next step
    }
    
    // 5. Load management view
    console.log('📥 Loading agent management view')
    
    // Load shop config status to get widget ID
    await loadShopConfigStatus()
    
    await loadConnectedAgents()
    await loadSelectedAgent()
    
    // Check if there's a tab in query params
    const tabParam = route.query.tab as string
    if (tabParam && ['setup', 'customization'].includes(tabParam)) {
      activeTab.value = tabParam
    }

    console.log('✅ Agent management view loaded successfully')
    console.log('📊 Final state:', {
      shopInfo: shopInfo.value,
      connectedAgents: connectedAgents.value?.length,
      selectedAgent: selectedAgent.value?.name,
      widgetId: widgetId.value,
      showConnectButton: showConnectButton.value,
      isInitializing: isInitializing.value
    })
  } catch (error: any) {
    console.error('❌ Initialization failed:', error)
    toast.error('Failed to initialize Shopify integration')
  } finally {
    isInitializing.value = false
  }
})
</script>

<style scoped>
.hidden {
  display: none;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl, 48px);
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color, #e1e3e5);
  border-top: 4px solid var(--primary-color, #f34611);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-lg, 24px);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: var(--text-base, 16px);
  color: var(--text-muted, #6d7175);
  margin: 0;
}

/* Connect Banner */
.connect-banner {
  padding: var(--space-2xl, 48px) var(--space-xl, 24px);
  text-align: center;
  background: linear-gradient(135deg, rgba(243, 70, 17, 0.05) 0%, rgba(243, 70, 17, 0.02) 100%);
  border-radius: var(--radius-lg, 12px);
  border: 2px solid var(--primary-color, #f34611);
}

.connect-content h2 {
  font-size: var(--text-xl, 24px);
  font-weight: 700;
  color: var(--text-primary, #202223);
  margin-bottom: var(--space-sm, 8px);
}

.connect-content p {
  font-size: var(--text-base, 16px);
  color: var(--text-muted, #6d7175);
  margin-bottom: var(--space-lg, 24px);
}

.connect-btn {
  padding: var(--space-md, 12px) var(--space-xl, 32px);
  background: var(--primary-color, #f34611);
  color: white;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: var(--text-base, 16px);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s);
  box-shadow: 0 4px 12px rgba(243, 70, 17, 0.2);
}

.connect-btn:hover {
  background: var(--primary-dark, #d93d0e);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(243, 70, 17, 0.3);
}

/* Header Styles - Matching AgentDetail.vue */
.panel-header {
  padding: var(--space-lg, 24px) var(--space-lg, 24px) var(--space-md, 16px);
  border-bottom: 1px solid var(--border-color, #e1e3e5);
  background: var(--background-soft, #f9fafb);
}

.header-layout {
  display: flex;
  align-items: center;
  gap: var(--space-md, 16px);
}

.agent-header {
  display: flex;
  gap: var(--space-md, 16px);
  align-items: center;
  flex: 1;
  min-width: 0;
}

.agent-avatar {
  position: relative;
  cursor: pointer;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.agent-avatar:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.agent-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  backdrop-filter: blur(2px);
}

.agent-avatar:hover .upload-overlay {
  opacity: 1;
  transform: scale(1.02);
}

.agent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
  min-width: 0;
  overflow: hidden;
}

.agent-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color, #202223);
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm, 8px);
  min-width: 0;
  overflow: hidden;
}

.name-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
}

.name-edit {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  flex: 1;
}

.name-input {
  flex: 1;
  padding: var(--space-sm, 8px) var(--space-md, 12px);
  border: 1px solid var(--border-color, #e1e3e5);
  border-radius: var(--radius-md, 6px);
  font-size: 1rem;
  font-weight: 600;
  background: white;
  color: var(--text-color, #202223);
  min-width: 0;
}

.name-input:focus {
  outline: none;
  border-color: var(--primary-color, #2c6ecb);
  box-shadow: 0 0 0 2px rgba(44, 110, 203, 0.1);
}

.edit-actions {
  display: flex;
  gap: var(--space-xs, 4px);
}

.edit-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--background-soft, #f9fafb);
  border-radius: var(--radius-md, 6px);
  color: var(--text-muted, #6d7175);
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-icon-button:hover {
  background: var(--background-muted, #f1f2f3);
  color: var(--text-color, #202223);
  transform: translateY(-1px);
}

.save-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--success-color, #22c55e);
  border-radius: var(--radius-sm, 4px);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-icon-button:hover {
  background: var(--success-dark, #16a34a);
  transform: translateY(-1px);
}

.cancel-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--background-muted, #f1f2f3);
  border-radius: var(--radius-sm, 4px);
  color: var(--text-muted, #6d7175);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-icon-button:hover {
  background: var(--error-color, #ef4444);
  color: white;
  transform: translateY(-1px);
}

.status-and-mode {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
}

.status-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.status-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.status-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 22px;
}

.status-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.status-switch input:checked + .status-slider {
  background-color: var(--success-color, #22c55e);
}

.status-switch input:checked + .status-slider:before {
  transform: translateX(22px);
}

.status-text {
  font-weight: 500;
  font-size: var(--text-sm, 14px);
  color: var(--text-muted, #6d7175);
}

.opacity-50 {
  opacity: 0.5;
}

/* Tabs styling using design tokens */
.tabs-container {
  margin-top: 0;
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--border-color);
  margin-bottom: var(--space-xl);
  padding-right: var(--space-md);
}

.tabs-left {
  display: flex;
  gap: 0;
}

.tabs-right {
  display: flex;
  align-items: center;
}

.dashboard-button {
  margin-left: var(--space-md);
}

.tab-button {
  padding: var(--space-sm) var(--space-lg);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
  position: relative;
  margin-bottom: -2px;
  font-family: var(--font-family);
}

.tab-button:hover {
  color: var(--text-primary);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-content {
  padding: 0;
}
</style>


