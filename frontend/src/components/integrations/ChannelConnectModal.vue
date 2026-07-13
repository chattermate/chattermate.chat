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
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import channelsService, { type ChannelAccount, type SmsProviderInfo } from '@/services/channels'
import { agentService } from '@/services/agent'
import type { Agent } from '@/types/agent'

const props = defineProps<{
  channel: 'email' | 'sms' | 'line' | 'slack' | 'teams'
  // When set, the modal opens in "manage" mode for an already-connected
  // account: it skips credential entry and shows the webhook URL + agent.
  // Slack always uses this (it connects via OAuth, so only the agent step).
  existingAccount?: ChannelAccount | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'connected', account: ChannelAccount): void
}>()

const FORMS = {
  email: {
    title: 'Connect Email',
    intro: 'Enter the support address customers write to, then point your provider’s inbound-parse / forwarding webhook at the URL shown. Optionally add your own outbound SMTP so replies send from your domain with correct SPF/DKIM (leave blank to use the platform mail server).',
    fields: [
      { key: 'inbound_address', label: 'Support email address', placeholder: 'support@yourcompany.com', secret: false },
      { key: 'smtp_host', label: 'SMTP host (optional)', placeholder: 'smtp.yourprovider.com', secret: false, optional: true },
      { key: 'smtp_port', label: 'SMTP port (optional)', placeholder: '587', secret: false, optional: true },
      { key: 'smtp_username', label: 'SMTP username (optional)', placeholder: 'apikey / user', secret: false, optional: true },
      { key: 'smtp_password', label: 'SMTP password (optional)', placeholder: '••••••••', secret: true, optional: true },
      { key: 'from_email', label: 'From address (optional)', placeholder: 'defaults to the support address', secret: false, optional: true },
    ],
    connect: (v: Record<string, string>) => {
      const payload: any = { inbound_address: v.inbound_address }
      if (v.smtp_host?.trim()) {
        payload.smtp_host = v.smtp_host.trim()
        if (v.smtp_port?.trim()) payload.smtp_port = Number(v.smtp_port)
        payload.smtp_username = v.smtp_username
        payload.smtp_password = v.smtp_password
        if (v.from_email?.trim()) payload.from_email = v.from_email.trim()
      }
      return channelsService.connectEmail(payload)
    },
  },
  sms: {
    title: 'Connect SMS',
    intro: 'Choose your SMS provider, enter the number to send from, and its API credentials. After connecting, set the URL shown as the number’s inbound-message webhook (SNS uses an HTTPS topic subscription).',
    // Fields are provider-specific and resolved dynamically (see activeFields)
    fields: [],
    connect: (v: Record<string, string>) => {
      const info = smsProviders.value.find(p => p.name === selectedProvider.value)
      const credentials: Record<string, string> = {}
      for (const f of info?.fields || []) {
        if (v[f.key]?.trim()) credentials[f.key] = v[f.key].trim()
      }
      return channelsService.connectSms({
        provider: selectedProvider.value,
        phone_number: v.phone_number,
        credentials,
      })
    },
  },
  line: {
    title: 'Connect LINE',
    intro: 'From the LINE Developers console (Messaging API channel), copy the channel secret and issue a channel access token. The webhook is configured automatically.',
    fields: [
      { key: 'channel_secret', label: 'Channel secret', placeholder: '••••••••', secret: true },
      { key: 'channel_access_token', label: 'Channel access token', placeholder: 'long-lived token', secret: true },
    ],
    connect: (v: Record<string, string>) => channelsService.connectLine({
      channel_secret: v.channel_secret, channel_access_token: v.channel_access_token }),
  },
  slack: {
    // Slack connects via OAuth (no credential form); this modal is only used
    // in manage mode to pick the answering agent.
    title: 'Slack',
    intro: 'Choose which AI agent answers your Slack mentions and DMs.',
    fields: [],
    connect: async () => { throw new Error('Slack connects via OAuth') },
  },
  teams: {
    title: 'Connect Microsoft Teams',
    intro: 'From your Azure Bot registration, enter the Microsoft App ID and a client secret. After connecting, set the bot’s messaging endpoint in Azure to the URL shown here.',
    fields: [
      { key: 'app_id', label: 'Microsoft App ID', placeholder: '00000000-0000-0000-0000-000000000000', secret: false },
      { key: 'app_password', label: 'Client secret', placeholder: '••••••••', secret: true },
      { key: 'display_name', label: 'Display name (optional)', placeholder: 'Microsoft Teams', secret: false, optional: true },
    ],
    connect: (v: Record<string, string>) => channelsService.connectTeams({
      app_id: v.app_id, app_password: v.app_password, display_name: v.display_name || undefined }),
  },
} as const

const form = computed(() => FORMS[props.channel])
const values = ref<Record<string, string>>({})
const connecting = ref(false)
// In manage mode we start at the second step with the existing account
const account = ref<ChannelAccount | null>(props.existingAccount ?? null)
const isManage = computed(() => !!props.existingAccount)

// SMS providers (dynamic credential fields per provider)
const smsProviders = ref<SmsProviderInfo[]>([])
const selectedProvider = ref('twilio')

// The credential fields to render: dynamic for SMS, static otherwise
const activeFields = computed(() => {
  if (props.channel !== 'sms') return form.value.fields
  const info = smsProviders.value.find(p => p.name === selectedProvider.value)
  return [
    { key: 'phone_number', label: 'Phone number / sender ID', placeholder: '+15551234567', secret: false },
    ...(info?.fields || []).map(f => ({
      key: f.key, label: f.label, placeholder: f.secret ? '••••••••' : '',
      secret: f.secret, optional: f.optional,
    })),
  ]
})

const agents = ref<Agent[]>([])
const selectedAgentId = ref('')
const savingAgent = ref(false)

onMounted(async () => {
  try {
    if (props.channel === 'sms') {
      smsProviders.value = await channelsService.listSmsProviders()
    }
    agents.value = await agentService.getOrganizationAgents()
    // Default the agent selector to the account's current agent, else the first
    selectedAgentId.value = String(
      props.existingAccount?.agent_id || agents.value[0]?.id || '')
  } catch (error) {
    console.error('Error loading modal data:', error)
  }
})

const connect = async () => {
  const missing = activeFields.value.filter(f => !(f as any).optional && !values.value[f.key]?.trim())
  if (missing.length > 0) {
    toast.error(`Please fill in: ${missing.map(f => f.label).join(', ')}`)
    return
  }
  try {
    connecting.value = true
    const trimmed = Object.fromEntries(
      Object.entries(values.value).map(([k, v]) => [k, v.trim()]))
    account.value = await form.value.connect(trimmed)
    toast.success(`Connected ${account.value.display_name || form.value.title.replace('Connect ', '')}`)
  } catch (error: any) {
    toast.error(error?.response?.data?.detail || `Failed to connect ${props.channel}`)
  } finally {
    connecting.value = false
  }
}

const copyWebhookUrl = async () => {
  if (!account.value?.webhook_url) return
  await navigator.clipboard.writeText(account.value.webhook_url)
  toast.success('Webhook URL copied')
}

const saveAgent = async () => {
  if (!account.value || !selectedAgentId.value) return
  try {
    savingAgent.value = true
    const updated = await channelsService.setAccountAgent(account.value.id, selectedAgentId.value)
    toast.success('Agent assigned — this channel is live!')
    emit('connected', updated)
  } catch (error: any) {
    toast.error(error?.response?.data?.detail || 'Failed to assign agent')
  } finally {
    savingAgent.value = false
  }
}
</script>

<template>
  <div class="cc-modal" @click.self="emit('close')">
    <div class="cc-modal-content">
      <div class="cc-modal-header">
        <h3>{{ isManage ? form.title.replace('Connect', 'Manage') : form.title }}</h3>
        <button class="cc-close-btn" @click="emit('close')">×</button>
      </div>

      <!-- Step 1: credentials -->
      <div v-if="!account" class="cc-modal-body">
        <p class="cc-intro">{{ form.intro }}</p>

        <!-- SMS provider picker -->
        <div v-if="channel === 'sms'" class="cc-field">
          <label class="cc-label" for="cc-provider">SMS provider</label>
          <select id="cc-provider" v-model="selectedProvider" class="cc-input">
            <option v-for="p in smsProviders" :key="p.name" :value="p.name">{{ p.label }}</option>
          </select>
        </div>

        <div v-for="field in activeFields" :key="field.key" class="cc-field">
          <label class="cc-label" :for="`cc-${field.key}`">{{ field.label }}</label>
          <input
            :id="`cc-${field.key}`"
            v-model="values[field.key]"
            :type="field.secret ? 'password' : 'text'"
            class="cc-input"
            :placeholder="(field as any).placeholder"
            :name="`cc-${channel}-${field.key}`"
            :autocomplete="field.secret ? 'new-password' : 'off'"
          />
        </div>
        <div class="cc-actions">
          <button class="cc-btn cc-btn-secondary" @click="emit('close')">Cancel</button>
          <button class="cc-btn cc-btn-primary" :disabled="connecting" @click="connect">
            {{ connecting ? 'Connecting…' : 'Connect' }}
          </button>
        </div>
      </div>

      <!-- Step 2: webhook URL (if applicable) + agent routing -->
      <div v-else class="cc-modal-body">
        <p class="cc-intro">
          <strong>{{ account.display_name }}</strong> is connected.
        </p>
        <div v-if="account.webhook_url" class="cc-field">
          <label class="cc-label">Webhook URL — set this on your provider</label>
          <div class="cc-webhook-row">
            <input class="cc-input" :value="account.webhook_url" readonly />
            <button class="cc-btn cc-btn-secondary" @click="copyWebhookUrl">Copy</button>
          </div>
        </div>
        <label class="cc-label" for="cc-agent">AI agent that answers this channel</label>
        <select id="cc-agent" v-model="selectedAgentId" class="cc-input">
          <option v-for="agent in agents" :key="String(agent.id)" :value="String(agent.id)">
            {{ agent.display_name || agent.name }}
          </option>
        </select>
        <div class="cc-actions">
          <button v-if="isManage && channel !== 'slack'" class="cc-btn cc-btn-secondary" @click="account = null">
            Reconfigure credentials
          </button>
          <button v-else class="cc-btn cc-btn-secondary" @click="emit('connected', account)">Skip for now</button>
          <button class="cc-btn cc-btn-primary" :disabled="savingAgent || !selectedAgentId" @click="saveAgent">
            {{ savingAgent ? 'Saving…' : 'Assign agent' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cc-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.cc-modal-content {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  width: min(480px, calc(100vw - 32px));
  padding: 24px;
}

.cc-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.cc-modal-header h3 {
  margin: 0;
  font-family: var(--font-display);
}

.cc-close-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--muted);
}

.cc-intro {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.cc-field {
  margin-bottom: 12px;
}

.cc-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.cc-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  color: inherit;
  font-size: 14px;
}

.cc-webhook-row {
  display: flex;
  gap: 8px;
}

.cc-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.cc-btn {
  padding: 9px 16px;
  border-radius: var(--radius-btn, 8px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
  color: inherit;
  white-space: nowrap;
}

.cc-btn-primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-color: transparent;
}

.cc-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
