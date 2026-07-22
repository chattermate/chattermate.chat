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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { checkJiraConnection, getJiraAuthUrl, disconnectJira } from '@/services/jira'
import { checkShopifyConnection, getShopifyShops } from '@/services/shopify'
import channelsService, { type ChannelAccount } from '@/services/channels'
import TelegramConnectModal from '@/components/integrations/TelegramConnectModal.vue'
import MetaChannelConnect from '@/components/integrations/MetaChannelConnect.vue'
import WhatsAppTemplateManager from '@/components/integrations/WhatsAppTemplateManager.vue'
import ChannelConnectModal from '@/components/integrations/ChannelConnectModal.vue'

// Import logos
import jiraLogo from '@/assets/jira-logo.svg'
import chattermateLogo from '@/assets/logo.svg'
import slackLogo from '@/assets/slack-logo.svg'
import zendeskLogo from '@/assets/zendesk-logo.svg'
import shopifyLogo from '@/assets/shopify-logo.svg'
import telegramLogo from '@/assets/telegram-logo.svg'
import whatsappLogo from '@/assets/whatsapp-logo.svg'
import messengerLogo from '@/assets/messenger-logo.svg'
import instagramLogo from '@/assets/instagram-logo.svg'
import emailLogo from '@/assets/email-logo.svg'
import smsLogo from '@/assets/sms-logo.svg'
import lineLogo from '@/assets/line-logo.svg'

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

// Messaging channel state (Telegram + Meta channels share one accounts list)
const channelAccounts = ref<ChannelAccount[]>([])
const channelsLoading = ref(true)
const showTelegramModal = ref(false)
// Which Meta connect modal is open (null = none)
const metaModalChannel = ref<'whatsapp' | 'messenger' | 'instagram' | null>(null)
const showTemplateManager = ref(false)
// Which credential connect modal is open (null = none)
const credentialModalChannel = ref<'email' | 'sms' | 'line' | 'slack' | null>(null)
// Account being managed (null = fresh connect). Also used for Telegram/Meta manage.
const credentialModalAccount = ref<ChannelAccount | null>(null)
const telegramModalAccount = ref<ChannelAccount | null>(null)
const metaModalAccount = ref<ChannelAccount | null>(null)

const CREDENTIAL_CHANNELS = ['email', 'sms', 'line']
const META_CHANNELS = ['whatsapp', 'messenger', 'instagram']

// "Manage" on a connected card: open the right modal for the connected account
const manageIntegration = (integration: IntegrationCard) => {
  const id = integration.id
  const acc = accountsFor(id)[0] ?? null
  if (CREDENTIAL_CHANNELS.includes(id)) {
    credentialModalAccount.value = acc
    credentialModalChannel.value = id as 'email' | 'sms' | 'line'
  } else if (id === 'telegram') {
    telegramModalAccount.value = acc
    showTelegramModal.value = true
  } else if (META_CHANNELS.includes(id)) {
    metaModalAccount.value = acc
    metaModalChannel.value = id as 'whatsapp' | 'messenger' | 'instagram'
  } else if (id === 'slack') {
    // Slack connects via OAuth; Manage just picks the answering agent
    credentialModalAccount.value = acc
    credentialModalChannel.value = 'slack'
  } else {
    // Jira/Shopify: re-run their connect/OAuth flow
    if (id === 'shopify') openShopifyInstallation()
    else integration.connectAction?.()
  }
}

const accountsFor = (channelType: string) =>
  channelAccounts.value.filter(a => a.channel_type === channelType)

const telegramAccounts = computed(() => accountsFor('telegram'))

const fetchChannelAccounts = async () => {
  try {
    channelsLoading.value = true
    channelAccounts.value = await channelsService.listAccounts()
  } catch (error) {
    console.error('Error loading channel accounts:', error)
  } finally {
    channelsLoading.value = false
  }
}

const onChannelConnected = async () => {
  showTelegramModal.value = false
  metaModalChannel.value = null
  credentialModalChannel.value = null
  credentialModalAccount.value = null
  telegramModalAccount.value = null
  metaModalAccount.value = null
  await fetchChannelAccounts()
}

// Shared disconnect for messaging channels; Telegram also removes its webhook
const disconnectChannelAccounts = async (channelType: string, label: string) => {
  try {
    channelsLoading.value = true
    for (const account of accountsFor(channelType)) {
      if (channelType === 'telegram') {
        await channelsService.disconnectTelegram(account.id)
      } else if (channelType === 'slack') {
        await channelsService.disconnectSlack(account.id)
      } else if (channelType === 'email') {
        await channelsService.disconnectEmail(account.id)
      } else if (channelType === 'sms') {
        await channelsService.disconnectSms(account.id)
      } else if (channelType === 'line') {
        await channelsService.disconnectLine(account.id)
      } else {
        await channelsService.disconnectMeta(account.id)
      }
    }
    channelAccounts.value = channelAccounts.value.filter(a => a.channel_type !== channelType)
    toast.success(`${label} disconnected successfully`)
  } catch (error: any) {
    toast.error(error?.response?.data?.detail || `Error disconnecting ${label}`)
  } finally {
    channelsLoading.value = false
    showDisconnectConfirm.value = false
    disconnectingIntegration.value = null
  }
}

const handleDisconnectTelegram = () => disconnectChannelAccounts('telegram', 'Telegram')
const handleDisconnectSlack = () => disconnectChannelAccounts('slack', 'Slack')
const connectSlack = () => { window.location.href = channelsService.getSlackInstallUrl() }
const handleDisconnectWhatsApp = () => disconnectChannelAccounts('whatsapp', 'WhatsApp')
const handleDisconnectMessenger = () => disconnectChannelAccounts('messenger', 'Messenger')
const handleDisconnectInstagram = () => disconnectChannelAccounts('instagram', 'Instagram')
const handleDisconnectEmail = () => disconnectChannelAccounts('email', 'Email')
const handleDisconnectSms = () => disconnectChannelAccounts('sms', 'SMS')
const handleDisconnectLine = () => disconnectChannelAccounts('line', 'LINE')


const route = useRoute()
const router = useRouter()

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
  category?: string;
  color?: string;
  connectAction?: () => void;
  disconnectAction?: () => void;
  /** An extra action on the connected card, alongside Manage/Disconnect. */
  extraActionLabel?: string;
  extraAction?: () => void;
}

// List of available integrations
const availableIntegrations = computed<IntegrationCard[]>(() => [
  {
    id: 'jira',
    name: 'Jira',
    description: 'Connect to Jira to create issues directly from ChatterMate.',
    logo: jiraLogo,
    category: 'PROJECT MANAGEMENT',
    color: 'purple',
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
    category: 'E-COMMERCE',
    color: 'teal',
    connected: shopifyConnected.value,
    shopDomain: shopifyShopDomain.value,
    isLoading: shopifyLoading.value,
    disconnectAction: handleDisconnectShopify
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect a Slack workspace so users can chat with your AI agent via @mentions and DMs.',
    logo: slackLogo,
    category: 'MESSAGING',
    color: 'accent',
    connected: accountsFor('slack').length > 0,
    teamName: accountsFor('slack').map(a => a.display_name).filter(Boolean).join(', '),
    isLoading: channelsLoading.value,
    connectAction: connectSlack,
    disconnectAction: handleDisconnectSlack
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Connect a Telegram bot so customers can chat with your AI agent on Telegram.',
    logo: telegramLogo,
    category: 'MESSAGING',
    color: 'accent',
    connected: telegramAccounts.value.length > 0,
    teamName: telegramAccounts.value.map(a => a.display_name).filter(Boolean).join(', '),
    isLoading: channelsLoading.value,
    connectAction: () => { showTelegramModal.value = true },
    disconnectAction: handleDisconnectTelegram
  },
  ...(['whatsapp', 'messenger', 'instagram'] as const).map(channel => {
    const meta = {
      whatsapp: { name: 'WhatsApp', logo: whatsappLogo, color: 'teal',
        description: 'Let customers message your AI agent on WhatsApp Business.',
        disconnect: handleDisconnectWhatsApp },
      messenger: { name: 'Messenger', logo: messengerLogo, color: 'accent',
        description: 'Let customers chat with your AI agent on Facebook Messenger.',
        disconnect: handleDisconnectMessenger },
      instagram: { name: 'Instagram', logo: instagramLogo, color: 'purple',
        description: 'Let customers DM your AI agent on Instagram.',
        disconnect: handleDisconnectInstagram },
    }[channel]
    const accounts = accountsFor(channel)
    return {
      id: channel,
      name: meta.name,
      description: meta.description,
      logo: meta.logo,
      category: 'MESSAGING',
      color: meta.color,
      connected: accounts.length > 0,
      teamName: accounts.map(a => a.display_name).filter(Boolean).join(', '),
      isLoading: channelsLoading.value,
      connectAction: () => { metaModalChannel.value = channel },
      disconnectAction: meta.disconnect,
      // Templates are WhatsApp-only — the other Meta channels have no equivalent.
      ...(channel === 'whatsapp' && accounts.length > 0
        ? { extraActionLabel: 'Templates', extraAction: () => { showTemplateManager.value = true } }
        : {})
    }
  }),
  ...(['email', 'sms', 'line'] as const).map(channel => {
    const meta = {
      email: { name: 'Email', logo: emailLogo, color: 'purple',
        description: 'Connect a support inbox so email conversations are answered by your AI agent.',
        disconnect: handleDisconnectEmail },
      sms: { name: 'SMS', logo: smsLogo, color: 'coral',
        description: 'Connect a Twilio number so customers can text your AI agent.',
        disconnect: handleDisconnectSms },
      line: { name: 'LINE', logo: lineLogo, color: 'teal',
        description: 'Connect a LINE Official Account so customers can chat with your AI agent on LINE.',
        disconnect: handleDisconnectLine },
    }[channel]
    const accounts = accountsFor(channel)
    return {
      id: channel,
      name: meta.name,
      description: meta.description,
      logo: meta.logo,
      category: 'MESSAGING',
      color: meta.color,
      connected: accounts.length > 0,
      teamName: accounts.map(a => a.display_name).filter(Boolean).join(', '),
      isLoading: channelsLoading.value,
      connectAction: () => { credentialModalChannel.value = channel },
      disconnectAction: meta.disconnect
    }
  }),
  // Native AI ticketing (built-in) — the card links to its settings page.
  {
    id: 'ai-ticketing',
    name: 'AI Ticketing',
    description: 'Native tickets triaged and investigated by AI — no external tracker needed.',
    logo: chattermateLogo,
    category: 'SUPPORT',
    color: 'lime',
    connected: true,
    connectAction: () => router.push('/settings/ticketing'),
    disconnectAction: () => router.push('/settings/ticketing')
  },
  // Future integrations
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Connect to Zendesk to manage customer support tickets.',
    logo: zendeskLogo,
    category: 'SUPPORT',
    color: 'coral',
    connected: false,
    comingSoon: true
  }
])

// Search + summary
const intQuery = ref('')

const filteredIntegrations = computed(() => {
  const q = intQuery.value.trim().toLowerCase()
  if (!q) return availableIntegrations.value
  return availableIntegrations.value.filter(it =>
    it.name.toLowerCase().includes(q) ||
    it.description.toLowerCase().includes(q) ||
    (it.category || '').toLowerCase().includes(q)
  )
})

const intEmpty = computed(() => filteredIntegrations.value.length === 0)

const intSummary = computed(() => {
  const total = availableIntegrations.value.length
  const connected = availableIntegrations.value.filter(it => it.connected).length
  return `${connected}/${total} connected`
})

// Display name for an ?integration= id, taken from the card list so a new
// integration never has to be named twice. Jira's callback predates the param,
// so a missing id means Jira.
const integrationName = (id?: string) => {
  const integrationId = id || 'jira'
  return availableIntegrations.value.find(it => it.id === integrationId)?.name || integrationId
}

onMounted(async () => {
  await Promise.all([
    fetchJiraStatus(),
    fetchShopifyStatus(),
    fetchChannelAccounts()
  ])
  
  // Check if we're returning from an OAuth flow
  if (route.query.status) {
    if (route.query.status === 'success') {
      if (route.query.integration === 'shopify') {
        toast.success('Shopify connected successfully!')
      } 
      else if (route.query.integration === 'slack') {
        toast.success('Slack connected — choose which agent should answer.')
        // Open the agent picker for the just-connected Slack workspace
        const slackAcc = accountsFor('slack')[0]
        if (slackAcc) {
          credentialModalAccount.value = slackAcc
          credentialModalChannel.value = 'slack'
        }
      }
      else {
        toast.success(`${integrationName(route.query.integration as string)} connected successfully!`)
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
      <!-- Page header + search -->
      <div class="int-page-header">
        <div class="int-page-titles">
          <h1 class="int-title">Integrations</h1>
          <p class="int-subtitle">Connect ChatterMate with the tools your team already uses.</p>
        </div>
        <div class="int-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="11" cy="11" r="7"></circle>
            <path d="M21 21l-4-4"></path>
          </svg>
          <input
            v-model="intQuery"
            type="search"
            name="integration-search"
            autocomplete="off"
            aria-label="Search integrations"
            placeholder="Search integrations…"
          />
        </div>
      </div>

      <!-- Summary bar -->
      <div class="int-summary-bar">
        <span class="int-summary">{{ intSummary }}</span>
      </div>

      <!-- Cards grid -->
      <div class="integration-cards">
        <div
          v-for="integration in filteredIntegrations"
          :key="integration.id"
          class="integration-card"
        >
          <div class="integration-header">
            <div class="integration-tile" :class="`tile-${integration.color}`">
              <img
                v-if="integration.logo"
                :src="integration.logo"
                :alt="`${integration.name} Logo`"
                class="integration-logo"
              />
              <span v-else>{{ integration.name.charAt(0) }}</span>
            </div>
            <div class="integration-info">
              <div class="integration-name">{{ integration.name }}</div>
              <div class="integration-cat">{{ integration.category }}</div>
            </div>
            <span
              v-if="integration.connected"
              class="status-badge connected"
            >
              <span class="status-dot"></span>
              Connected
            </span>
            <span
              v-else-if="!integration.comingSoon"
              class="status-badge not-connected"
            >
              <span class="status-dot"></span>
              Not connected
            </span>
            <span
              v-else
              class="status-badge soon"
            >
              Soon
            </span>
          </div>

          <p class="integration-desc">{{ integration.description }}</p>

          <div v-if="integration.connected && integration.siteUrl" class="integration-meta">
            <a :href="integration.siteUrl" target="_blank" class="meta-link">↗ Visit {{ integration.name }} Site</a>
          </div>
          <div v-else-if="integration.connected && integration.shopDomain" class="integration-meta">
            <span class="meta-text">{{ integration.shopDomain }}</span>
            <a :href="`https://${integration.shopDomain}/admin`" target="_blank" class="meta-link">↗ Visit Shopify Admin</a>
          </div>
          <div v-else-if="integration.connected && integration.teamName" class="integration-meta">
            <span class="meta-text">{{ integration.teamName }}</span>
          </div>
          <div v-else-if="!integration.connected && integration.id === 'jira' && lastConnectionError" class="integration-meta">
            <span class="meta-error">⚠️ {{ lastConnectionError }}</span>
          </div>

          <!-- Loading state -->
          <button
            v-if="integration.isLoading"
            class="int-btn int-btn-loading"
            disabled
          >
            <span class="loading-spinner"></span>
            Loading…
          </button>

          <!-- Connected: Manage + Disconnect -->
          <div v-else-if="integration.connected" class="int-actions">
            <button class="int-btn int-btn-manage" @click="manageIntegration(integration)">Manage</button>
            <button
              v-if="integration.extraAction"
              class="int-btn int-btn-manage"
              @click="integration.extraAction()"
            >
              {{ integration.extraActionLabel }}
            </button>
            <button class="int-btn int-btn-disconnect" @click="showDisconnectConfirmation(integration.id)">
              Disconnect
            </button>
          </div>

          <!-- Coming soon -->
          <button
            v-else-if="integration.comingSoon"
            class="int-btn int-btn-soon"
            disabled
          >
            Coming soon
          </button>

          <!-- Not connected: Connect / Install -->
          <button
            v-else
            class="int-btn int-btn-connect"
            @click="integration.id === 'shopify' ? openShopifyInstallation() : integration.connectAction?.()"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            {{ integration.id === 'shopify' ? 'Install' : 'Connect' }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="intEmpty" class="int-empty">
        No integrations match your search.
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

        <div v-if="disconnectingIntegration === 'telegram'" class="integration-specific-warning">
          <p>Disconnecting Telegram will:</p>
          <ul>
            <li>Remove the bot's webhook so it stops receiving messages</li>
            <li>Remove the agent routing for this bot</li>
            <li>Require you to reconnect the bot token to use it again</li>
          </ul>
        </div>

        <div v-if="disconnectingIntegration === 'whatsapp' || disconnectingIntegration === 'messenger' || disconnectingIntegration === 'instagram'" class="integration-specific-warning">
          <p>Disconnecting this channel will:</p>
          <ul>
            <li>Stop the AI agent from receiving and answering its messages</li>
            <li>Remove the agent routing for the connected account</li>
            <li>Require re-entering credentials to use it again</li>
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
          :disabled="channelsLoading"
        >
          <span v-if="channelsLoading" class="loading-spinner"></span>
          <span v-else>Disconnect Slack</span>
        </button>
        <button
          v-if="disconnectingIntegration === 'telegram'"
          class="btn-disconnect"
          @click="handleDisconnectTelegram"
          :disabled="channelsLoading"
        >
          <span v-if="channelsLoading" class="loading-spinner"></span>
          <span v-else>Disconnect Telegram</span>
        </button>
        <button
          v-if="disconnectingIntegration === 'email' || disconnectingIntegration === 'sms' || disconnectingIntegration === 'line'"
          class="btn-disconnect"
          @click="disconnectingIntegration === 'email' ? handleDisconnectEmail() : disconnectingIntegration === 'sms' ? handleDisconnectSms() : handleDisconnectLine()"
          :disabled="channelsLoading"
        >
          <span v-if="channelsLoading" class="loading-spinner"></span>
          <span v-else>Disconnect {{ disconnectingIntegration === 'email' ? 'Email' : disconnectingIntegration === 'sms' ? 'SMS' : 'LINE' }}</span>
        </button>
        <button
          v-if="disconnectingIntegration === 'whatsapp' || disconnectingIntegration === 'messenger' || disconnectingIntegration === 'instagram'"
          class="btn-disconnect"
          @click="disconnectingIntegration === 'whatsapp' ? handleDisconnectWhatsApp() : disconnectingIntegration === 'messenger' ? handleDisconnectMessenger() : handleDisconnectInstagram()"
          :disabled="channelsLoading"
        >
          <span v-if="channelsLoading" class="loading-spinner"></span>
          <span v-else>Disconnect {{ disconnectingIntegration === 'whatsapp' ? 'WhatsApp' : disconnectingIntegration === 'messenger' ? 'Messenger' : 'Instagram' }}</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Telegram Connect Modal -->
  <TelegramConnectModal
    v-if="showTelegramModal"
    :existing-account="telegramModalAccount"
    @close="showTelegramModal = false; telegramModalAccount = null"
    @connected="onChannelConnected"
  />

  <!-- Meta Channel Connect Modal (WhatsApp / Messenger / Instagram) -->
  <MetaChannelConnect
    v-if="metaModalChannel"
    :channel="metaModalChannel"
    :existing-account="metaModalAccount"
    @close="metaModalChannel = null; metaModalAccount = null"
    @connected="onChannelConnected"
  />

  <!-- WhatsApp template management -->
  <WhatsAppTemplateManager
    v-if="showTemplateManager"
    :accounts="accountsFor('whatsapp')"
    @close="showTemplateManager = false"
  />

  <!-- Credential Connect Modal (Email / SMS / LINE) -->
  <ChannelConnectModal
    v-if="credentialModalChannel"
    :channel="credentialModalChannel"
    :existing-account="credentialModalAccount"
    @close="credentialModalChannel = null; credentialModalAccount = null"
    @connected="onChannelConnected"
  />

</template>

<style scoped>
:root {
  --primary-color-rgb: 59, 130, 246; /* This is a typical blue color in RGB format */
  --error-color-rgb: 220, 38, 38; /* Red color in RGB format */
}

.integrations-settings {
  padding: var(--space-lg);
  max-width: 1180px;
  margin: 0 auto;
}

/* Page header + search */
.int-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.int-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0 0 6px;
}

.int-subtitle {
  font-size: 15px;
  color: var(--muted);
  margin: 0;
}

.int-search {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 14px;
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: var(--radius-btn);
  min-width: 230px;
  color: var(--muted2);
}

.int-search input {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
}

.int-search input::placeholder {
  color: var(--muted2);
}

/* Summary bar */
.int-summary-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.int-summary {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted2);
  flex-shrink: 0;
}

/* Cards grid */
.integration-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 18px;
}

.integration-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
}

.integration-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

/* Color-coded icon tile */
.integration-tile {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
}

.integration-tile .integration-logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.tile-purple {
  background: var(--purple-bg);
  color: var(--c-purple);
}

.tile-teal {
  background: var(--teal-bg);
  color: var(--c-teal);
}

.tile-accent {
  background: var(--accent-bg-12);
  color: var(--accent-ink);
}

.tile-coral {
  background: var(--coral-bg);
  color: var(--c-coral);
}

.integration-info {
  flex: 1;
  min-width: 0;
}

.integration-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16.5px;
  color: var(--text2);
}

.integration-cat {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted2);
  margin-top: 3px;
}

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.connected {
  background: var(--teal-bg);
  color: var(--c-teal);
}

.status-badge.not-connected {
  background: var(--o05);
  color: var(--muted2);
}

.status-badge.soon {
  background: var(--o05);
  color: var(--faint);
}

/* Description */
.integration-desc {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.55;
  margin: 0 0 18px;
  flex: 1;
}

/* Connected meta info */
.integration-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: -8px 0 16px;
}

.meta-text {
  font-size: 13px;
  color: var(--text2);
  font-weight: 500;
}

.meta-link {
  font-size: 12.5px;
  color: var(--c-teal);
  text-decoration: none;
  width: fit-content;
}

.meta-link:hover {
  text-decoration: underline;
}

.meta-error {
  font-size: 12px;
  color: var(--c-coral);
  background: var(--coral-bg);
  border: 1px solid var(--coral-border);
  padding: 6px 10px;
  border-radius: var(--radius-md);
  word-break: break-word;
}

/* Buttons */
.int-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.int-actions {
  display: flex;
  gap: 9px;
}

.int-btn-connect {
  width: 100%;
  padding: 12px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-chip);
  font-size: 14px;
  font-weight: 600;
}

.int-btn-connect:hover {
  filter: brightness(1.05);
}

.int-btn-manage {
  flex: 1;
  padding: 11px;
  background: var(--o05);
  border: 1px solid var(--o14);
  border-radius: var(--radius-chip);
  color: var(--text);
}

.int-btn-manage:hover {
  background: var(--o10);
}

.int-btn-disconnect {
  flex-shrink: 0;
  padding: 11px 16px;
  background: transparent;
  border: 1px solid var(--coral-border);
  border-radius: var(--radius-chip);
  color: var(--c-coral);
}

.int-btn-disconnect:hover {
  background: var(--coral-bg);
}

.int-btn-soon {
  width: 100%;
  padding: 12px;
  background: var(--o03);
  border: 1px solid var(--o08);
  border-radius: var(--radius-chip);
  color: var(--faint);
  font-size: 14px;
  cursor: not-allowed;
}

.int-btn-loading {
  width: 100%;
  padding: 12px;
  background: var(--o03);
  border: 1px solid var(--o08);
  border-radius: var(--radius-chip);
  color: var(--muted);
  font-size: 14px;
  cursor: default;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--o10);
  border-top-color: var(--accent-ink);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty state */
.int-empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--muted2);
  font-size: 14px;
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
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  width: 440px;
  max-width: calc(100vw - 32px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.disconnect-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border-color);
}

.disconnect-modal-header h3 {
  margin: 0;
  color: var(--text-primary, var(--text));
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-display, inherit);
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
  width: 56px;
  height: 56px;
  margin: 4px auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  border-radius: 50%;
  background: var(--coral-bg, rgba(220, 38, 38, 0.12));
}

.disconnect-modal-body p {
  margin: 0 0 10px;
  text-align: center;
  color: var(--text-primary, var(--text));
}

.warning-text {
  color: var(--error-color);
  font-weight: 500;
  font-size: 13px;
}

.integration-specific-warning {
  margin-top: 20px;
  padding: 14px 16px;
  background: var(--background-soft);
  border-radius: var(--radius-md, 8px);
  border-left: 3px solid var(--warning, #f5a623);
}

.integration-specific-warning p {
  text-align: left;
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary, var(--text));
}

.integration-specific-warning ul {
  margin: 0;
  padding-left: 20px;
}

.integration-specific-warning li {
  margin-bottom: 6px;
  color: var(--text-secondary, var(--muted));
  font-size: 13px;
}

.disconnect-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid var(--border-color);
  background: var(--background-soft);
}

.btn-cancel {
  background: var(--background-mute);
  color: var(--text-primary, var(--text));
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  padding: 9px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn-cancel:hover {
  background: var(--background-alt);
}

.btn-disconnect {
  background: var(--error-color);
  color: #fff;
  border: none;
  border-radius: var(--radius-btn, 8px);
  padding: 9px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-disconnect:hover {
  filter: brightness(1.08);
}

.btn-disconnect:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--o30);
  border-radius: 50%;
  border-top-color: var(--text);
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