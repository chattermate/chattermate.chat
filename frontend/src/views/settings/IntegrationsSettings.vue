<!--
ChatterMate - Integrations Settings
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { checkJiraConnection, getJiraAuthUrl, disconnectJira } from '@/services/jira'
import { checkShopifyConnection, getShopifyShops } from '@/services/shopify'
import { checkSlackConnection, getSlackAuthUrl, disconnectSlack } from '@/services/slack'

// Import logos
import jiraLogo from '@/assets/jira-logo.svg'
import slackLogo from '@/assets/slack-logo.svg'
import zendeskLogo from '@/assets/zendesk-logo.svg'
import shopifyLogo from '@/assets/shopify-logo.svg'

// Define interface for Shopify shop
interface ShopifyShop {
  id: string
  shop_domain: string
  is_installed: boolean
  [key: string]: any
}

// Shopify state variables
const shopifyConnected = ref(false)
const shopifyShopDomain = ref('')
const shopifyLoading = ref(true)

// Slack state variables
const slackConnected = ref(false)
const slackTeamName = ref('')
const slackLoading = ref(true)


const route = useRoute()

const jiraConnected = ref(false)
const jiraSiteUrl = ref('')
const isLoading = ref(true)
const showDisconnectConfirm = ref(false)
const disconnectingIntegration = ref<string | null>(null)
const lastConnectionError = ref<string | null>(null)

// Check if Jira is connected
const fetchJiraStatus = async () => {
  try {
    isLoading.value = true
    const data = await checkJiraConnection()
    jiraConnected.value = data.connected
    jiraSiteUrl.value = data.site_url || ''
  } catch (error) {
    console.error('Error checking Jira connection:', error)
    jiraConnected.value = false
  } finally {
    isLoading.value = false
  }
}

// Connect to Jira
const connectJira = () => {
  try {
    // Clear any previous error messages
    lastConnectionError.value = null
    window.location.href = getJiraAuthUrl()
  } catch (error) {
    console.error('Error connecting to Jira:', error)
    toast.error('Error connecting to Jira')
  }
}

// Show disconnect confirmation
const showDisconnectConfirmation = (integrationId: string) => {
  disconnectingIntegration.value = integrationId
  showDisconnectConfirm.value = true
}

// Cancel disconnect
const cancelDisconnect = () => {
  showDisconnectConfirm.value = false
  disconnectingIntegration.value = null
}

// Disconnect from Jira
const handleDisconnectJira = async () => {
  try {
    isLoading.value = true
    await disconnectJira()
    jiraConnected.value = false
    jiraSiteUrl.value = ''
    toast.success('Jira disconnected successfully')
  } catch (error: any) {
    console.error('Error disconnecting from Jira:', error)
    let errorMessage = 'Error disconnecting from Jira'
    
    // Try to extract a more detailed error message if available
    if (error.response && error.response.data && error.response.data.detail) {
      errorMessage = error.response.data.detail
    }
    
    toast.error(errorMessage)
  } finally {
    isLoading.value = false
    showDisconnectConfirm.value = false
    disconnectingIntegration.value = null
  }
}

// Check if Shopify is connected
const fetchShopifyStatus = async () => {
  try {
    shopifyLoading.value = true
    const data = await checkShopifyConnection()
    shopifyConnected.value = data.connected
    shopifyShopDomain.value = data.shop_domain || ''
  } catch (error) {
    console.error('Error checking Shopify connection:', error)
    shopifyConnected.value = false
  } finally {
    shopifyLoading.value = false
  }
}


// Open Shopify installation page
const openShopifyInstallation = () => {
  try {
    // Direct installation URL provided by Shopify
    const installUrl = 'https://admin.shopify.com/?organization_id=162380510&no_redirect=true&redirect=/oauth/redirect_from_developer_dashboard?client_id%3D280379be88b01dbdde1bcf06c027b1d4'
    
    // Open in new tab
    window.open(installUrl, '_blank')
    
    // Show helpful message
    toast.info('Redirected to Shopify for app installation. After installation, refresh this page to see the connection status.')
  } catch (error: any) {
    console.error('Error opening Shopify installation:', error)
    toast.error('Error opening Shopify installation page')
  }
}

// Disconnect from Shopify - redirect to Shopify admin to uninstall
const handleDisconnectShopify = () => {
  try {
    // Close the modal
    showDisconnectConfirm.value = false
    disconnectingIntegration.value = null

    // Open Shopify admin apps page in a new tab where user can uninstall the app
    const shopifyAdminUrl = `https://${shopifyShopDomain.value}/admin/apps`
    window.open(shopifyAdminUrl, '_blank')

    // Show a helpful toast message
    toast.info('Please uninstall the ChatterMate app from your Shopify admin to complete the disconnection.')
  } catch (error: any) {
    console.error('Error opening Shopify admin:', error)
    toast.error('Error opening Shopify admin')
    showDisconnectConfirm.value = false
    disconnectingIntegration.value = null
  }
}

// Check if Slack is connected
const fetchSlackStatus = async () => {
  try {
    slackLoading.value = true
    const data = await checkSlackConnection()
    slackConnected.value = data.connected
    slackTeamName.value = data.team_name || ''
  } catch (error) {
    console.error('Error checking Slack connection:', error)
    slackConnected.value = false
  } finally {
    slackLoading.value = false
  }
}

// Connect to Slack directly (agent selection happens in Slack when bot joins channel)
const connectSlack = () => {
  try {
    lastConnectionError.value = null
    window.location.href = getSlackAuthUrl()
  } catch (error) {
    console.error('Error connecting to Slack:', error)
    toast.error('Error connecting to Slack')
  }
}

// Disconnect from Slack
const handleDisconnectSlack = async () => {
  try {
    slackLoading.value = true
    await disconnectSlack()
    slackConnected.value = false
    slackTeamName.value = ''
    toast.success('Slack disconnected successfully')
  } catch (error: any) {
    console.error('Error disconnecting from Slack:', error)
    let errorMessage = 'Error disconnecting from Slack'

    if (error.response && error.response.data && error.response.data.detail) {
      errorMessage = error.response.data.detail
    }

    toast.error(errorMessage)
  } finally {
    slackLoading.value = false
    showDisconnectConfirm.value = false
    disconnectingIntegration.value = null
  }
}

// Define interface for IntegrationCard
interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  logo: string;
  connected: boolean;
  isLoading?: boolean;
  siteUrl?: string;
  shopDomain?: string;
  teamName?: string;
  comingSoon?: boolean;
  connectAction?: () => void;
  disconnectAction?: () => void;
}

// List of available integrations
const availableIntegrations = computed(() => [
  {
    id: 'jira',
    name: 'Jira',
    description: 'Connect to Jira to create issues directly from ChatterMate.',
    logo: jiraLogo,
    connected: jiraConnected.value,
    siteUrl: jiraSiteUrl.value,
    isLoading: isLoading.value,
    connectAction: connectJira,
    disconnectAction: handleDisconnectJira
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Install from Shopify App Store to integrate your store with ChatterMate.',
    logo: shopifyLogo,
    connected: shopifyConnected.value,
    shopDomain: shopifyShopDomain.value,
    isLoading: shopifyLoading.value,
    disconnectAction: handleDisconnectShopify
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect to Slack to allow users to chat with your AI agent directly from Slack channels.',
    logo: slackLogo,
    connected: slackConnected.value,
    teamName: slackTeamName.value,
    isLoading: slackLoading.value,
    connectAction: connectSlack,
    disconnectAction: handleDisconnectSlack
  },
  // Future integrations
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Connect to Zendesk to manage customer support tickets.',
    logo: zendeskLogo,
    connected: false,
    comingSoon: true
  }
])

onMounted(async () => {
  await Promise.all([
    fetchJiraStatus(),
    fetchShopifyStatus(),
    fetchSlackStatus()
  ])
  
  // Check if we're returning from an OAuth flow
  if (route.query.status) {
    if (route.query.status === 'success') {
      if (route.query.integration === 'shopify') {
        toast.success('Shopify connected successfully!')
      } 
      else if (route.query.integration === 'slack') {
        toast.success('Slack connected successfully! Add the bot to a channel to configure an agent.')
      }
      else {
        toast.success('Jira connected successfully!')
      }
      lastConnectionError.value = null
    } else if (route.query.status === 'failure') {
      // Handle different failure reasons
      const reason = route.query.reason as string || 'unknown'
      const integration = route.query.integration as string || 'integration'
      
      let errorMessage = `Failed to connect to ${integration}`
      
      // Map common error reasons to user-friendly messages
      if (reason === 'cancelled') {
        errorMessage = `${integration} connection was cancelled`
      } else if (reason === 'invalid_state') {
        errorMessage = 'Authentication session expired or is invalid'
      } else if (reason.includes('unauthorized')) {
        errorMessage = 'Authorization failed. Please check your permissions'
      } else if (reason) {
        // Format the reason to be more readable
        const formattedReason = reason.replace(/_/g, ' ')
        errorMessage = `Failed to connect to ${integration}: ${formattedReason}`
      }
      
      toast.error(errorMessage)
      lastConnectionError.value = errorMessage
    }
    
    // Remove the query parameters to avoid showing the toast on refresh
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})
</script>

<template>
  <DashboardLayout>
    <div class="integrations-settings">
      <div class="page-header">
        <h1 class="page-title">Integrations</h1>
        <p class="page-description">
          Connect ChatterMate with your favorite tools and services to enhance your workflow.
        </p>
      </div>
      
      <div class="settings-section">
        <div class="section-header">
          <h2>Available Integrations</h2>
          <p>Connect ChatterMate with your favorite tools and services.</p>
        </div>
        
        <div class="integration-cards">
          <!-- Dynamic Integration Cards -->
          <div 
            v-for="integration in availableIntegrations" 
            :key="integration.id"
            class="integration-card"
            :class="{ 'coming-soon': integration.comingSoon }"
          >
            <div class="integration-header">
              <img 
                v-if="integration.logo" 
                :src="integration.logo" 
                :alt="`${integration.name} Logo`" 
                class="integration-logo" 
              />
              <div v-else class="integration-logo placeholder">
                <span>{{ integration.name.charAt(0) }}</span>
              </div>
              <div class="integration-info">
                <h3>{{ integration.name }}</h3>
                <p>{{ integration.description }}</p>
              </div>
            </div>
            
            <div class="integration-status">
              <!-- Jira specific loading state -->
              <span v-if="integration.id === 'jira' && integration.isLoading" class="loading-indicator">
                <span class="loading-spinner"></span>
                Loading...
              </span>
              <!-- Shopify loading state -->
              <span v-else-if="integration.id === 'shopify' && integration.isLoading" class="loading-indicator">
                <span class="loading-spinner"></span>
                Loading...
              </span>
              <!-- Slack loading state -->
              <span v-else-if="integration.id === 'slack' && integration.isLoading" class="loading-indicator">
                <span class="loading-spinner"></span>
                Loading...
              </span>
              <template v-else>
                <!-- Connected status for Jira -->
                <div v-if="integration.id === 'jira' && integration.connected" class="connected-info">
                  <span class="status-badge connected">
                    <span class="status-icon">✓</span>
                    Connected
                  </span>
                  <a v-if="integration.siteUrl" :href="integration.siteUrl" target="_blank" class="site-link">
                    <span class="link-icon">↗</span>
                    Visit {{ integration.name }} Site
                  </a>
                </div>
                <!-- Not connected status for Jira -->
                <div v-else-if="integration.id === 'jira'" class="not-connected-info">
                  <span class="status-badge not-connected">
                    Not Connected
                  </span>
                  <div v-if="lastConnectionError" class="connection-error">
                    <span class="error-icon">⚠️</span>
                    {{ lastConnectionError }}
                  </div>
                </div>
                <!-- Connected status for Shopify -->
                <div v-else-if="integration.id === 'shopify' && integration.connected" class="connected-info">
                  <span class="status-badge connected">
                    <span class="status-icon">✓</span>
                    Connected
                  </span>
                  <div class="shop-info">
                    <span class="shop-domain">{{ integration.shopDomain }}</span>
                    <a 
                      :href="`https://${integration.shopDomain}/admin`" 
                      target="_blank" 
                      class="site-link"
                    >
                      <span class="link-icon">↗</span>
                      Visit Shopify Admin
                    </a>
                  </div>
                </div>
                <!-- Not connected status for Shopify -->
                <div v-else-if="integration.id === 'shopify'" class="not-connected-info">
                  <span class="status-badge not-connected">
                    Not Connected
                  </span>
                </div>
                <!-- Connected status for Slack -->
                <div v-else-if="integration.id === 'slack' && integration.connected" class="connected-info">
                  <span class="status-badge connected">
                    <span class="status-icon">✓</span>
                    Connected
                  </span>
                  <div class="team-info">
                    <span class="team-name">{{ integration.teamName }}</span>
                  </div>
                </div>
                <!-- Not connected status for Slack -->
                <div v-else-if="integration.id === 'slack'" class="not-connected-info">
                  <span class="status-badge not-connected">
                    Not Connected
                  </span>
                </div>
                <!-- Coming soon status -->
                <span v-else-if="integration.comingSoon" class="status-badge coming-soon">
                  Coming Soon
                </span>
              </template>
            </div>
            
            
            <div class="integration-actions">
              <!-- Jira connect/disconnect buttons -->
              <template v-if="integration.id === 'jira'">
                <button 
                  v-if="!integration.connected" 
                  @click="integration.connectAction" 
                  class="btn btn-primary"
                  :disabled="integration.isLoading"
                >
                  <span class="btn-icon">+</span>
                  Connect
                </button>
                <button 
                  v-else 
                  @click="showDisconnectConfirmation(integration.id)" 
                  class="btn btn-danger"
                  :disabled="integration.isLoading"
                >
                  <span class="btn-icon">×</span>
                  Disconnect
                </button>
              </template>
              
              <!-- Shopify install/disconnect buttons -->
              <template v-else-if="integration.id === 'shopify'">
                <button
                  v-if="!integration.connected"
                  @click="openShopifyInstallation"
                  class="btn btn-primary"
                  :disabled="integration.isLoading"
                >
                  <span class="btn-icon">↗</span>
                  Install
                </button>
                <button
                  v-else
                  @click="showDisconnectConfirmation(integration.id)"
                  class="btn btn-danger"
                  :disabled="integration.isLoading"
                >
                  <span class="btn-icon">×</span>
                  Disconnect
                </button>
              </template>

              <!-- Slack connect/disconnect buttons -->
              <template v-else-if="integration.id === 'slack'">
                <button
                  v-if="!integration.connected"
                  @click="integration.connectAction"
                  class="btn btn-primary"
                  :disabled="integration.isLoading"
                >
                  <span class="btn-icon">+</span>
                  Connect
                </button>
                <button
                  v-else
                  @click="showDisconnectConfirmation(integration.id)"
                  class="btn btn-danger"
                  :disabled="integration.isLoading"
                >
                  <span class="btn-icon">×</span>
                  Disconnect
                </button>
              </template>

              <!-- Coming soon button -->
              <button 
                v-else-if="integration.comingSoon" 
                class="btn btn-coming-soon" 
                disabled
              >
                <span class="btn-icon">⏳</span>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
  
  <!-- Disconnect Confirmation Modal -->
  <div v-if="showDisconnectConfirm" class="disconnect-modal">
    <div class="disconnect-modal-content">
      <div class="disconnect-modal-header">
        <h3>Disconnect Integration</h3>
        <button class="close-modal-btn" @click="cancelDisconnect">
          <span>×</span>
        </button>
      </div>
      <div class="disconnect-modal-body">
        <div class="warning-icon">⚠️</div>
        <p>Are you sure you want to disconnect this integration?</p>
        <p class="warning-text">This will remove all connections and configurations associated with this integration.</p>
        
        <div v-if="disconnectingIntegration === 'jira'" class="integration-specific-warning">
          <p>Disconnecting Jira will:</p>
          <ul>
            <li>Remove all Jira configurations from your agents</li>
            <li>Disable ticket creation functionality</li>
            <li>Require you to reconnect and reconfigure Jira settings if you want to use it again</li>
          </ul>
        </div>
        
        <div v-if="disconnectingIntegration === 'shopify'" class="integration-specific-warning">
          <p>To disconnect Shopify:</p>
          <ul>
            <li>You'll be redirected to your Shopify admin</li>
            <li>Uninstall the ChatterMate app from your Shopify store</li>
            <li>This ensures the disconnection is synchronized on both platforms</li>
            <li>You'll need to reinstall the app if you want to use it again</li>
          </ul>
        </div>

        <div v-if="disconnectingIntegration === 'slack'" class="integration-specific-warning">
          <p>Disconnecting Slack will:</p>
          <ul>
            <li>Remove all Slack channel configurations</li>
            <li>Disable chat functionality in Slack</li>
            <li>Delete stored conversation data for GDPR compliance</li>
            <li>Require you to reconnect and reconfigure if you want to use it again</li>
          </ul>
        </div>
      </div>
      <div class="disconnect-modal-actions">
        <button class="btn-cancel" @click="cancelDisconnect">Cancel</button>
        <button 
          v-if="disconnectingIntegration === 'jira'" 
          class="btn-disconnect" 
          @click="handleDisconnectJira"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>Disconnect Jira</span>
        </button>
        <button
          v-if="disconnectingIntegration === 'shopify'"
          class="btn-disconnect"
          @click="handleDisconnectShopify"
        >
          <span class="btn-icon">↗</span>
          <span>Open Shopify Admin</span>
        </button>
        <button
          v-if="disconnectingIntegration === 'slack'"
          class="btn-disconnect"
          @click="handleDisconnectSlack"
          :disabled="slackLoading"
        >
          <span v-if="slackLoading" class="loading-spinner"></span>
          <span v-else>Disconnect Slack</span>
        </button>
      </div>
    </div>
  </div>

</template>

<style scoped>
:root {
  --primary-color-rgb: 59, 130, 246; /* This is a typical blue color in RGB format */
  --error-color-rgb: 220, 38, 38; /* Red color in RGB format */
}

.integrations-settings {
  padding: var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-xl);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.page-description {
  color: var(--text-muted);
  font-size: var(--text-md);
}

.settings-section {
  background: var(--background-color);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-color);
}

.section-header h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.section-header p {
  color: var(--text-muted);
}

.integration-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
}

.integration-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  background-color: white;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.integration-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.integration-card.coming-soon {
  opacity: 0.7;
  background-color: var(--background-soft);
}

.integration-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.integration-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.integration-logo.placeholder {
  background-color: var(--background-mute);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  font-weight: bold;
  color: var(--text-muted);
}

.integration-info h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.integration-info p {
  color: var(--text-muted);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.integration-status {
  display: flex;
  align-items: center;
  min-height: 40px;
}

.loading-indicator {
  color: var(--text-muted);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.connected-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.site-link {
  font-size: var(--text-sm);
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  transition: all 0.2s;
  margin-top: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  background-color: #f0f7ff; /* Light blue background */
  width: fit-content;
}

.site-link:hover {
  color: var(--primary-dark);
  background-color: #e0f0ff; /* Slightly darker blue on hover */
  transform: translateY(-1px);
}

.link-icon {
  font-size: 12px;
}

.status-badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.status-icon {
  font-size: 10px;
}

.status-badge.connected {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.status-badge.not-connected {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.status-badge.coming-soon {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
}

.installation-instructions {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: var(--radius-md);
  border: 1px solid #bae6fd;
}

.instructions-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--space-sm);
}

.instructions-list {
  margin: 0;
  padding-left: var(--space-lg);
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.6;
}

.instructions-list li {
  margin-bottom: var(--space-xs);
}

.instructions-list li:last-child {
  margin-bottom: 0;
}

.shopify-install-note {
  padding: var(--space-md);
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: var(--radius-md);
  border: 1px solid #fcd34d;
}

.note-text {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-color);
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  line-height: 1.5;
}

.note-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.integration-actions {
  margin-top: auto;
  padding-top: var(--space-md);
}

.btn {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  height: 38px;
}

.btn-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-danger {
  background-color: var(--error-color);
  color: white;
}

.btn-danger:hover {
  background-color: #d63939; /* Slightly darker shade of error color */
  transform: translateY(-1px);
}

.btn-coming-soon {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-disabled {
  background-color: var(--background-mute);
  color: var(--text-muted);
  cursor: not-allowed;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .integration-cards {
    grid-template-columns: 1fr;
  }
  
  .integrations-settings {
    padding: var(--space-md);
  }
}

/* Disconnect Modal Styles */
.disconnect-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.disconnect-modal-content {
  background: var(--background-color);
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.disconnect-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
}

.disconnect-modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
}

.close-modal-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-modal-btn:hover {
  color: var(--text-primary);
}

.disconnect-modal-body {
  padding: 24px;
}

.warning-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 16px;
}

.disconnect-modal-body p {
  margin-bottom: 16px;
  text-align: center;
}

.warning-text {
  color: var(--error-color);
  font-weight: 500;
}

.integration-specific-warning {
  margin-top: 24px;
  padding: 16px;
  background: var(--background-soft);
  border-radius: 8px;
  border-left: 4px solid var(--warning);
}

.integration-specific-warning p {
  text-align: left;
  margin-bottom: 8px;
  font-weight: 500;
}

.integration-specific-warning ul {
  margin: 0;
  padding-left: 24px;
}

.integration-specific-warning li {
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.disconnect-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--background-soft);
}

.btn-cancel {
  background: var(--background-mute);
  color: var(--text-primary);
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-cancel:hover {
  background: var(--background-alt);
}

.btn-disconnect {
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-disconnect:hover {
  background: #d63939; /* Slightly darker shade of error color */
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.btn-disconnect:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.not-connected-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.connection-error {
  font-size: var(--text-xs);
  color: var(--error-color);
  background-color: rgba(var(--error-color-rgb), 0.1);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  margin-top: var(--space-xs);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  max-width: 100%;
  word-break: break-word;
}

.error-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.shop-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
}

.shop-domain {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
}

.team-name {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.integration-form {
  margin-top: var(--space-sm);
  border-top: 1px solid var(--border-color);
  padding-top: var(--space-sm);
}

.form-group {
  margin-bottom: var(--space-md);
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  margin-bottom: var(--space-xs);
  color: var(--text-primary);
}

.input-with-label {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--background-color);
  overflow: hidden;
}

.input-with-label input {
  flex: 1;
  padding: var(--space-sm);
  border: none;
  font-size: var(--text-sm);
  background: transparent;
  min-width: 0;
}

.input-with-label input:focus {
  outline: none;
}

.input-suffix {
  padding: var(--space-sm) var(--space-sm) var(--space-sm) 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
  white-space: nowrap;
}

.form-help {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: var(--space-xs);
}

.form-error {
  display: block;
  font-size: var(--text-xs);
  color: var(--error-color);
  margin-top: var(--space-xs);
}
</style> 