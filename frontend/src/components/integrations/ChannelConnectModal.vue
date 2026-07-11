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
import channelsService, { type ChannelAccount } from '@/services/channels'
import { agentService } from '@/services/agent'
import type { Agent } from '@/types/agent'

const props = defineProps<{
  channel: 'email' | 'sms' | 'line'
  // When set, the modal opens in "manage" mode for an already-connected
  // account: it skips credential entry and shows the webhook URL + agent.
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
    title: 'Connect SMS (Twilio)',
    intro: 'From your Twilio console, copy the Account SID, auth token, and the phone number to use. Set the URL shown after connecting as the number’s “A message comes in” webhook.',
    fields: [
      { key: 'account_sid', label: 'Account SID', placeholder: 'AC…', secret: false },
      { key: 'auth_token', label: 'Auth token', placeholder: '••••••••', secret: true },
      { key: 'phone_number', label: 'Phone number (E.164)', placeholder: '+15551234567', secret: false },
    ],
    connect: (v: Record<string, string>) => channelsService.connectSms({
      account_sid: v.account_sid, auth_token: v.auth_token, phone_number: v.phone_number }),
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
} as const

const form = computed(() => FORMS[props.channel])
const values = ref<Record<string, string>>({})
const connecting = ref(false)
// In manage mode we start at the second step with the existing account
const account = ref<ChannelAccount | null>(props.existingAccount ?? null)
const isManage = computed(() => !!props.existingAccount)

const agents = ref<Agent[]>([])
const selectedAgentId = ref('')
const savingAgent = ref(false)

onMounted(async () => {
  try {
    agents.value = await agentService.getOrganizationAgents()
    // Default the agent selector to the account's current agent, else the first
    selectedAgentId.value = String(
      props.existingAccount?.agent_id || agents.value[0]?.id || '')
  } catch (error) {
    console.error('Error loading agents:', error)
  }
})

const connect = async () => {
  const missing = form.value.fields.filter(f => !(f as any).optional && !values.value[f.key]?.trim())
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
        <div v-for="field in form.fields" :key="field.key" class="cc-field">
          <label class="cc-label" :for="`cc-${field.key}`">{{ field.label }}</label>
          <input
            :id="`cc-${field.key}`"
            v-model="values[field.key]"
            :type="field.secret ? 'password' : 'text'"
            class="cc-input"
            :placeholder="field.placeholder"
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
          <button v-if="isManage" class="cc-btn cc-btn-secondary" @click="account = null">
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
