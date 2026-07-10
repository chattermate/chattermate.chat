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
import { computed, ref, watch, onMounted } from 'vue'
import { checkShopifyConnection } from '@/services/shopify'
import channelsService, { type ChannelAccount } from '@/services/channels'

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

interface JiraIssueType {
  id: string;
  name: string;
  description?: string;
}


const props = defineProps({
  // Agent ID - required for Slack config
  agentId: {
    type: String,
    required: true
  },
  // Jira props
  jiraConnected: {
    type: Boolean,
    required: true
  },
  jiraLoading: {
    type: Boolean,
    required: true
  },
  createTicketEnabled: {
    type: Boolean,
    required: true
  },
  jiraProjects: {
    type: Array as () => JiraProject[],
    required: true
  },
  jiraIssueTypes: {
    type: Array as () => JiraIssueType[],
    required: true
  },
  selectedProject: {
    type: String,
    required: true
  },
  selectedIssueType: {
    type: String,
    required: true
  },
  loadingProjects: {
    type: Boolean,
    required: true
  },
  loadingIssueTypes: {
    type: Boolean,
    required: true
  },
  // Shopify props
  shopifyIntegrationEnabled: {
    type: Boolean,
    default: false
  },
  shopifyLoading: {
    type: Boolean,
    default: false
  },
  shopifyError: {
    type: String,
    default: ''
  }
})

// Local state for Shopify connection
const shopifyConnected = ref(false)
const shopifyShopDomain = ref('')
const shopifyLoading = ref(true)
const localShopifyEnabled = ref(props.shopifyIntegrationEnabled)
const shopifyToggleInProgress = ref(false)
const shopifyError = ref('')

// Local state for messaging-channel routing (Telegram, WhatsApp, Messenger, Instagram)
const MESSAGING_CHANNELS = ['telegram', 'whatsapp', 'messenger', 'instagram', 'slack', 'email', 'sms', 'line']
const CHANNEL_LABELS: Record<string, string> = {
  telegram: 'Telegram', whatsapp: 'WhatsApp', messenger: 'Messenger', instagram: 'Instagram', slack: 'Slack',
  email: 'Email', sms: 'SMS', line: 'LINE'
}
const channelAccounts = ref<ChannelAccount[]>([])
const channelSaving = ref(false)

const fetchChannelAccounts = async () => {
  try {
    const accounts = await channelsService.listAccounts()
    channelAccounts.value = accounts.filter(a => MESSAGING_CHANNELS.includes(a.channel_type))
  } catch (error) {
    console.error('Error loading channel accounts:', error)
  }
}

const toggleChannelAccount = async (account: ChannelAccount) => {
  try {
    channelSaving.value = true
    if (account.agent_id === props.agentId) {
      await channelsService.clearAccountAgent(account.id)
    } else {
      await channelsService.setAccountAgent(account.id, props.agentId)
    }
    await fetchChannelAccounts()
  } catch (error: any) {
    console.error('Error updating channel routing:', error)
  } finally {
    channelSaving.value = false
  }
}

const emit = defineEmits([
  'toggle-create-ticket',
  'handle-project-change',
  'handle-issue-type-change',
  'save-jira-config',
  'toggle-shopify-integration',
  'save-shopify-config'
])

// Create local copies of the props
const localSelectedProject = ref(props.selectedProject)
const localSelectedIssueType = ref(props.selectedIssueType)

// Watch for changes in the props to update the local copies
watch(() => props.selectedProject, (newValue) => {
  localSelectedProject.value = newValue
})

watch(() => props.selectedIssueType, (newValue) => {
  localSelectedIssueType.value = newValue
})

// Update localShopifyEnabled when prop changes
watch(() => props.shopifyIntegrationEnabled, (newValue) => {
  localShopifyEnabled.value = newValue
  // Reset error when parent updates the enabled state successfully
  shopifyError.value = ''
})

// Update error state when parent passes error
watch(() => props.shopifyError, (newValue) => {
  if (newValue) {
    shopifyError.value = newValue
    // Revert the toggle if there's an error
    localShopifyEnabled.value = props.shopifyIntegrationEnabled
  }
})

const ticketReasons = [
  "Issues without immediate resolution",
  "No transfer agent available",
  "Transfer requests not attended",
  "Customer follow-ups",
  "Complex issues requiring tracking"
]

const ticketTooltipContent = computed(() => {
  return `Create tickets when:\n${ticketReasons.map(reason => `• ${reason}`).join('\n')}`
})

const shopifyReasons = [
  "Display product information",
  "Answer product-specific questions",
  "Handle product recommendations",
  "Check stock availability",
  "Process product inquiries"
]

const shopifyTooltipContent = computed(() => {
  return `Enable Shopify features for:\n${shopifyReasons.map(reason => `• ${reason}`).join('\n')}`
})

const toggleCreateTicket = () => {
  emit('toggle-create-ticket')
}

const toggleShopifyIntegration = () => {
  // Store the previous value in case we need to revert
  
  // Show loading state
  shopifyToggleInProgress.value = true
  
  // Update the local state optimistically
  localShopifyEnabled.value = !localShopifyEnabled.value
  
  // Emit the event for parent to handle
  emit('toggle-shopify-integration')
  
  // The parent component should call an API method and handle errors
  // If an error occurs, the watch on props.shopifyError will revert the state
  
  // For demo purposes, let's set a timeout to simulate API call
  // This should be removed in production as the parent component should control this
  setTimeout(() => {
    // Auto-reset progress after 3 seconds if parent doesn't control it
    if (shopifyToggleInProgress.value) {
      shopifyToggleInProgress.value = false
    }
  }, 3000)
}

const handleProjectChange = () => {
  emit('handle-project-change', localSelectedProject.value)
}

const handleIssueTypeChange = () => {
  emit('handle-issue-type-change', localSelectedIssueType.value)
}

const saveJiraConfig = () => {
  emit('save-jira-config', {
    projectKey: localSelectedProject.value,
    issueTypeId: localSelectedIssueType.value
  })
}


// Fetch Shopify connection status
const fetchShopifyStatus = async () => {
  try {
    shopifyLoading.value = true
    const data = await checkShopifyConnection()
    shopifyConnected.value = data.connected
    shopifyShopDomain.value = data.shop_domain || ''
    console.log('Shopify connection status:', data)
  } catch (error) {
    console.error('Error checking Shopify connection:', error)
    shopifyConnected.value = false
  } finally {
    shopifyLoading.value = false
  }
}

// Fetch connection status on component mount
onMounted(async () => {
  await Promise.all([
    fetchShopifyStatus(),
    fetchChannelAccounts()
  ])
})
</script>

<template>
  <div class="integrations-tab">
    <section class="detail-section">
      <h3 class="section-title">Integrations</h3>
      <p class="section-description">
        Let this agent take action in the tools you already use.
      </p>

      <!-- Jira Integration -->
      <div class="integration-section">
        <div class="integration-head">
          <div class="integration-head-left">
            <div class="integration-badge badge-teal">Ji</div>
            <div class="integration-heading">
              <div class="integration-title">Jira — auto-ticketing</div>
              <div class="integration-desc">Create Jira tickets for issues that need follow-up.</div>
            </div>
          </div>
          <router-link
            v-if="!jiraConnected"
            to="/settings/integrations"
            class="connect-btn"
          >
            Connect
          </router-link>
          <router-link
            v-else
            to="/settings/integrations"
            class="connect-btn"
          >
            Manage
          </router-link>
        </div>
        <!-- Jira Ticket Creation Toggle -->
        <div v-if="jiraConnected" class="ticket-toggle">
          <div class="toggle-header">
            <h5 class="toggle-title">Create Jira Tickets</h5>
            <label class="switch" v-tooltip="ticketTooltipContent">
              <input type="checkbox" 
                :checked="createTicketEnabled"
                @change="toggleCreateTicket"
              >
              <span class="slider"></span>
            </label>
          </div>
          <p class="helper-text">Create Jira tickets for issues that need further attention</p>
          
          <!-- Jira Connection Status -->
          <div v-if="jiraLoading" class="jira-status loading">
            Checking Jira connection...
          </div>
          <div v-else-if="!jiraConnected" class="jira-status not-connected">
            <span class="status-icon">⚠️</span>
            Jira is not connected
            <router-link to="/settings/integrations" class="connect-link">
              Connect Jira
            </router-link>
          </div>
          <div v-else class="jira-status connected">
            <span class="status-icon">✓</span>
            Jira is connected
          </div>
          
          <!-- Jira Project Selection -->
          <div v-if="createTicketEnabled && jiraConnected" class="jira-config">
            <div class="form-group">
              <label for="jira-project">Jira Project</label>
              <div v-if="loadingProjects" class="loading-indicator">Loading projects...</div>
              <select 
                v-else
                id="jira-project" 
                v-model="localSelectedProject"
                @change="handleProjectChange"
                :disabled="loadingProjects"
              >
                <option value="">Select a project</option>
                <option 
                  v-for="project in jiraProjects" 
                  :key="project.id" 
                  :value="project.key"
                >
                  {{ project.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="issue-type">Issue Type</label>
              <div v-if="loadingIssueTypes" class="loading-indicator">Loading issue types...</div>
              <select 
                v-else
                id="issue-type" 
                v-model="localSelectedIssueType"
                @change="handleIssueTypeChange"
                :disabled="!localSelectedProject || loadingIssueTypes"
              >
                <option value="">Select an issue type</option>
                <option 
                  v-for="issueType in jiraIssueTypes" 
                  :key="issueType.id" 
                  :value="issueType.id"
                >
                  {{ issueType.name }}
                </option>
              </select>
            </div>
            
            <button 
              class="save-config-btn"
              @click="saveJiraConfig"
              :disabled="!localSelectedProject || !localSelectedIssueType"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
      
      <!-- Shopify Integration -->
      <div class="integration-section">
        <div class="integration-head">
          <div class="integration-head-left">
            <div class="integration-badge badge-lime">Sh</div>
            <div class="integration-heading">
              <div class="integration-title">Shopify — orders &amp; products</div>
              <div class="integration-desc">Let the agent look up orders and recommend products.</div>
            </div>
          </div>
          <router-link
            v-if="!shopifyConnected"
            to="/settings/integrations"
            class="connect-btn"
          >
            Connect
          </router-link>
          <router-link
            v-else
            to="/settings/integrations"
            class="connect-btn"
          >
            Manage
          </router-link>
        </div>
        <div v-if="shopifyConnected" class="ticket-toggle">
          <div class="toggle-header">
            <h5 class="toggle-title">Enable Shopify Features</h5>
            <div class="toggle-with-loader">
              <div class="toggle-loader" v-if="shopifyToggleInProgress">
                <span class="loader-dot"></span>
                <span class="loader-dot"></span>
                <span class="loader-dot"></span>
              </div>
              <label class="switch" v-tooltip="shopifyTooltipContent">
                <input type="checkbox" 
                  v-model="localShopifyEnabled"
                  @change="toggleShopifyIntegration"
                  :disabled="shopifyLoading || props.shopifyLoading || shopifyToggleInProgress"
                >
                <span class="slider" :class="{ 'in-progress': shopifyToggleInProgress }"></span>
              </label>
            </div>
          </div>
          <p class="helper-text">Enable Shopify product information and features for this agent</p>
          
          <!-- Shopify Connection Status -->
          <div v-if="shopifyLoading" class="jira-status loading">
            Checking Shopify connection...
          </div>
          <div v-else-if="!shopifyConnected" class="jira-status not-connected">
            <span class="status-icon">⚠️</span>
            Shopify is not connected
            <router-link to="/settings/integrations" class="connect-link">
              Connect Shopify
            </router-link>
          </div>
          <div v-else class="jira-status connected">
            <span class="status-icon">✓</span>
            Connected to {{ shopifyShopDomain }}
          </div>
        </div>
        <!-- Add error message display -->
        <div v-if="shopifyConnected && shopifyError" class="shopify-error">
          <span class="error-icon">❌</span>
          {{ shopifyError }}
        </div>
      </div>

      <!-- Messaging Channels (Telegram / WhatsApp / Messenger / Instagram) -->
      <div class="integration-section">
        <div class="integration-head">
          <div class="integration-head-left">
            <div class="integration-badge badge-purple">Ch</div>
            <div class="integration-heading">
              <div class="integration-title">Messaging channels — customer chat</div>
              <div class="integration-desc">Let customers chat with this agent on Telegram, WhatsApp, Messenger, Instagram, Slack, Email, SMS and LINE.</div>
            </div>
          </div>
          <router-link to="/settings/integrations" class="connect-btn">
            {{ channelAccounts.length > 0 ? 'Manage' : 'Connect' }}
          </router-link>
        </div>

        <div v-if="channelAccounts.length > 0" class="slack-config">
          <p class="helper-text">
            Each connected account is answered by one agent. Toggle an account to route its conversations to this agent.
          </p>
          <div class="slack-channels-list">
            <div v-for="account in channelAccounts" :key="account.id" class="slack-channel-item">
              <div class="channel-header">
                <span class="channel-name">
                  {{ CHANNEL_LABELS[account.channel_type] || account.channel_type }} · {{ account.display_name || account.external_account_id }}
                </span>
              </div>
              <div class="channel-options">
                <label class="option-item">
                  <input
                    type="checkbox"
                    :checked="account.agent_id === props.agentId"
                    @change="toggleChannelAccount(account)"
                    :disabled="channelSaving"
                  />
                  <span>Answered by this agent</span>
                </label>
                <span v-if="account.agent_id && account.agent_id !== props.agentId" class="helper-text">
                  currently routed to another agent
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-channels-message">
          No messaging channels connected yet. Connect one from Settings → Integrations.
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.integrations-tab {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-lg);
}

.detail-section {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 6px;
}

.section-description {
  color: var(--muted);
  font-size: 14px;
  margin: 0 0 22px;
  line-height: 1.5;
}

.integration-section {
  border: 1px solid var(--o08);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  background: var(--surface);
  margin-bottom: 14px;
  width: 100%;
}

.integration-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.integration-head-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.connect-btn {
  flex-shrink: 0;
  display: inline-block;
  padding: 10px 18px;
  background: var(--o05);
  border: 1px solid var(--o14);
  color: var(--text);
  border-radius: var(--radius-chip);
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.connect-btn:hover {
  background: var(--o14);
}

.integration-badge {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
}

.badge-teal {
  background: var(--teal-bg);
  color: var(--c-teal);
}

.badge-lime {
  background: var(--accent-bg-12);
  color: var(--accent-ink);
}

.badge-purple {
  background: var(--purple-bg);
  color: var(--c-purple);
}

.integration-heading {
  min-width: 0;
}

.integration-title {
  font-family: var(--font-display);
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
}

.integration-desc {
  font-size: 13.5px;
  color: var(--muted);
  margin-top: 2px;
}

.toggle-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  margin: 0;
}

.ticket-toggle {
  margin-top: var(--space-lg);
}

.toggle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.helper-text {
  color: var(--muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
  line-height: 1.5;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--toggle-track-off);
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--toggle-knob);
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

input:checked + .slider {
  background-color: var(--accent-solid);
}

input:checked + .slider:before {
  background-color: var(--on-accent-solid);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--accent-ink);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.jira-status {
  margin-top: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.jira-status.loading {
  background-color: var(--o05);
  color: var(--muted);
}

.jira-status.connected {
  background-color: var(--teal-bg);
  color: var(--c-teal);
}

.jira-status.not-connected {
  background-color: var(--o05);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.connect-link {
  color: var(--text);
  font-weight: 500;
  text-decoration: none;
  padding: 10px 18px;
  background: var(--o05);
  border: 1px solid var(--o14);
  border-radius: var(--radius-chip);
  transition: all var(--transition-fast);
}

.connect-link:hover {
  background: var(--o14);
}

.jira-config {
  margin-top: var(--space-lg);
  padding: var(--space-lg);
  background: var(--bg-deep);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  border: 1px solid var(--o08);
}

.shopify-info {
  background-color: var(--background-soft);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
}

.shopify-info p {
  margin-bottom: var(--space-xs);
  font-size: var(--text-sm);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.form-group label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--muted);
}

.form-group select {
  padding: var(--space-md);
  border: 1px solid var(--o14);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font-size: var(--text-sm);
}

.form-group select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-indicator {
  font-size: var(--text-sm);
  color: var(--muted);
  padding: var(--space-sm);
}

.save-config-btn {
  margin-top: var(--space-lg);
  padding: 10px 18px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-chip);
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
  transition: all var(--transition-fast);
  align-self: flex-start;
}

.save-config-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.save-config-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.shopify-error {
  margin-top: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background-color: var(--coral-bg);
  color: var(--error-color);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.error-icon {
  margin-right: var(--space-xs);
}

.toggle-with-loader {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-loader {
  position: absolute;
  right: 55px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.loader-dot {
  width: 6px;
  height: 6px;
  background-color: var(--accent-solid);
  border-radius: 50%;
  animation: pulse 1.5s infinite ease-in-out;
}

.loader-dot:nth-child(2) {
  animation-delay: 0.5s;
}

.loader-dot:nth-child(3) {
  animation-delay: 1s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.75);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

.slider.in-progress {
  opacity: 0.7;
  background-image: linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent);
  background-size: 20px 20px;
  animation: progress-animation 1s linear infinite;
}

@keyframes progress-animation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 20px 0;
  }
}

/* Slack Integration Styles */
.slack-config {
  margin-top: var(--space-md);
}

.slack-error {
  margin-top: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background-color: var(--coral-bg);
  color: var(--error-color);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.slack-channels-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.slack-channel-item {
  background: var(--bg-deep);
  border: 1px solid var(--o08);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.channel-name {
  font-weight: 600;
  color: var(--text);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.remove-btn:hover {
  color: var(--error-color);
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.channel-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--muted);
  cursor: pointer;
}

.option-item input[type="checkbox"] {
  cursor: pointer;
}

.no-channels-message,
.no-channels-available {
  padding: var(--space-md);
  background: var(--o05);
  border-radius: var(--radius-md);
  color: var(--muted);
  font-size: var(--text-sm);
  text-align: center;
  margin-top: var(--space-md);
}

.add-channel-btn {
  margin-top: var(--space-md);
  padding: 10px 18px;
  background: var(--o05);
  color: var(--text);
  border: 1px solid var(--o14);
  border-radius: var(--radius-chip);
  font-weight: 500;
  font-size: 13.5px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-channel-btn:hover {
  background: var(--o14);
}

.add-channel-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.add-channel-form {
  margin-top: var(--space-lg);
  padding: var(--space-lg);
  background: var(--bg-deep);
  border-radius: var(--radius-md);
  border: 1px solid var(--o08);
}

.channel-options-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--surface);
  border-radius: var(--radius-md);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

.cancel-btn {
  padding: 10px 18px;
  background: var(--o05);
  color: var(--text);
  border: 1px solid var(--o14);
  border-radius: var(--radius-chip);
  font-weight: 500;
  font-size: 13.5px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cancel-btn:hover {
  background: var(--o14);
}

.cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 