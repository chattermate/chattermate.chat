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
import MessengerPagePicker from './MessengerPagePicker.vue'
import MetaOwnAppWebhook from './MetaOwnAppWebhook.vue'
import { useMetaSignup } from '@/composables/useMetaSignup'
import { apiErrorMessage } from '@/utils/apiError'

const props = defineProps<{
  channel: 'whatsapp' | 'messenger' | 'instagram'
  existingAccount?: ChannelAccount | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'connected', account: ChannelAccount): void
}>()

// Where the credentials are copied from — linked so it's one click, not a
// hostname to retype.
const META_APPS_URL = 'https://developers.facebook.com/apps/'

// Meta signs your own app's webhooks with its secret: without it a number or
// Page from your app can send but never receives, so it's required.
const APP_SECRET_FIELD = {
  key: 'app_secret', label: 'App secret', placeholder: 'App settings → Basic', secret: true,
} as const

// Per-channel copy + credential fields. The intro is split around the link
// rather than carrying markup, so it renders as escaped text.
const META_FORMS = {
  whatsapp: {
    title: 'Connect WhatsApp',
    introBefore: 'From your Meta app (',
    introAfter: ' → WhatsApp → API Setup), copy the phone number ID and a permanent access token, and the app secret from App settings → Basic.',
    fields: [
      { key: 'phone_number_id', label: 'Phone number ID', placeholder: '1234567890', secret: false },
      { key: 'access_token', label: 'Access token', placeholder: 'EAAG…', secret: true },
      { key: 'waba_id', label: 'WhatsApp Business Account ID (optional)', placeholder: 'for webhook auto-subscribe', secret: false, optional: true },
      APP_SECRET_FIELD,
    ],
  },
  messenger: {
    title: 'Connect Messenger',
    introBefore: 'From your Meta app (',
    introAfter: ' → Messenger → Settings), generate a page access token for the Facebook Page you want to connect, and copy the app secret from App settings → Basic.',
    fields: [
      { key: 'page_id', label: 'Facebook Page ID', placeholder: '1234567890', secret: false },
      { key: 'page_access_token', label: 'Page access token', placeholder: 'EAAG…', secret: true },
      APP_SECRET_FIELD,
    ],
  },
  instagram: {
    title: 'Connect Instagram',
    introBefore: 'Your Instagram account must be a professional account linked to a Facebook Page. Use the linked page’s access token, from ',
    introAfter: ' → Instagram.',
    fields: [
      { key: 'ig_id', label: 'Instagram account ID', placeholder: '17841400000000000', secret: false },
      { key: 'page_access_token', label: 'Linked page access token', placeholder: 'EAAG…', secret: true },
    ],
  },
} as const

const form = computed(() => META_FORMS[props.channel])
// Reconnecting an account that isn't from the customer's own app (one-click
// signup): its token is ChatterMate's, so there's no secret of theirs to enter.
// Own-app accounts carry their webhook address, so they're the ones without it.
const secretOptional = Boolean(props.existingAccount && !props.existingAccount.webhook_url)
const fields = computed(() => form.value.fields.map(field => (
  field.key === APP_SECRET_FIELD.key && secretOptional
    ? { ...field, label: 'App secret (only if from your own Meta app)', optional: true }
    : field)))
const values = ref<Record<string, string>>({})
const connecting = ref(false)
const account = ref<ChannelAccount | null>(props.existingAccount ?? null)

const agents = ref<Agent[]>([])
const selectedAgentId = ref('')
const savingAgent = ref(false)

// The three one-click logins live in their own composable; this component owns
// the manual credentials form and agent assignment.
const {
  checkSignup,
  signupChecked,
  signupEnabled,
  signingUp,
  showManualForm,
  signupPages,
  connectingPage,
  copy: signupCopy,
  startSignup,
  onPageSelected,
} = useMetaSignup({
  channel: props.channel,
  existingAccount: props.existingAccount,
  onConnected: (connected) => { account.value = connected },
})

onMounted(async () => {
  try {
    agents.value = await agentService.getOrganizationAgents()
    selectedAgentId.value = String(
      props.existingAccount?.agent_id || agents.value[0]?.id || '')
  } catch (error) {
    console.error('Error loading agents:', error)
  }
})

const connect = async () => {
  const missing = fields.value.filter(f => !('optional' in f && f.optional) && !values.value[f.key]?.trim())
  if (missing.length > 0) {
    toast.error(`Please fill in: ${missing.map(f => f.label).join(', ')}`)
    return
  }
  try {
    connecting.value = true
    const payload: any = Object.fromEntries(
      fields.value
        .map(f => [f.key, values.value[f.key]?.trim()])
        .filter(([, v]) => v)
    )
    if (props.channel === 'whatsapp') {
      account.value = await channelsService.connectWhatsApp(payload)
    } else if (props.channel === 'messenger') {
      account.value = await channelsService.connectMessenger(payload)
    } else {
      account.value = await channelsService.connectInstagram(payload)
    }
    toast.success(`Connected ${account.value.display_name || form.value.title.replace('Connect ', '')}`)
  } catch (error: any) {
    toast.error(apiErrorMessage(error, `Failed to connect ${props.channel}`))
  } finally {
    connecting.value = false
  }
}

// Back to step 1, offering one-click when this deployment has it: a number
// from one-click signup has no app secret to enter in the manual form.
const reconnect = () => {
  account.value = null
  void checkSignup()
}

const saveAgent = async () => {
  if (!account.value || !selectedAgentId.value) return
  try {
    savingAgent.value = true
    const updated = await channelsService.setAccountAgent(account.value.id, selectedAgentId.value)
    toast.success('Agent assigned — this channel is live!')
    emit('connected', updated)
  } catch (error: any) {
    toast.error(apiErrorMessage(error, 'Failed to assign agent'))
  } finally {
    savingAgent.value = false
  }
}
</script>

<template>
  <div class="meta-modal" @click.self="emit('close')">
    <div class="meta-modal-content">
      <div class="meta-modal-header">
        <h3>{{ form.title }}</h3>
        <button class="meta-close-btn" @click="emit('close')">×</button>
      </div>

      <!-- Step 1: credentials -->
      <div v-if="!account" class="meta-modal-body">
        <!-- Login for Business can grant several accounts at once; the customer
             picks which one this channel answers. -->
        <MessengerPagePicker
          v-if="signupPages.length"
          :pages="signupPages"
          :connecting="connectingPage"
          @select="onPageSelected"
        />

        <!-- Until we know whether one-click is offered, neither form: showing
             the manual one first makes it flash before one-click replaces it. -->
        <div v-else-if="!signupChecked" class="meta-signup-checking" role="status" aria-label="Loading">
          <font-awesome-icon icon="fa-solid fa-spinner" spin />
        </div>

        <!-- One-click signup under ChatterMate's Meta app; the manual form
             stays available for anyone who already has their own credentials. -->
        <div v-else-if="signupEnabled && !showManualForm" class="meta-signup">
          <p class="meta-intro">{{ signupCopy.intro }}</p>
          <button class="meta-btn meta-btn-primary meta-signup-btn" :disabled="signingUp" @click="startSignup">
            <font-awesome-icon v-if="signingUp" icon="fa-solid fa-spinner" spin />
            {{ signingUp ? 'Waiting for Meta…' : signupCopy.cta }}
          </button>
          <button class="meta-link-btn" @click="showManualForm = true">
            Enter credentials manually instead
          </button>
        </div>

        <template v-else>
        <p class="meta-intro">
          {{ form.introBefore }}<a
            :href="META_APPS_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="meta-intro-link"
          >developers.facebook.com</a>{{ form.introAfter }}
        </p>
        <div v-for="field in fields" :key="field.key" class="meta-field">
          <label class="meta-label" :for="`meta-${field.key}`">{{ field.label }}</label>
          <input
            :id="`meta-${field.key}`"
            v-model="values[field.key]"
            :type="field.secret ? 'password' : 'text'"
            class="meta-input"
            :placeholder="field.placeholder"
            :name="`meta-${channel}-${field.key}`"
            :autocomplete="field.secret ? 'new-password' : 'off'"
          />
        </div>
        <div class="meta-actions">
          <button class="meta-btn meta-btn-secondary" @click="emit('close')">Cancel</button>
          <button class="meta-btn meta-btn-primary" :disabled="connecting" @click="connect">
            {{ connecting ? 'Connecting…' : 'Connect' }}
          </button>
        </div>
        </template>
      </div>

      <!-- Step 2: route to an agent -->
      <div v-else class="meta-modal-body">
        <div v-if="account.needs_reconnect" class="meta-reconnect">
          <p class="meta-reconnect-text">Meta stopped accepting this account's access. Reconnect to resume replies.</p>
          <button class="meta-btn meta-btn-primary" @click="reconnect">Reconnect</button>
        </div>
        <p class="meta-intro">
          <strong>{{ account.display_name }}</strong> is connected.
        </p>
        <MetaOwnAppWebhook v-if="account.webhook_url && account.webhook_verify_token" :account="account" />
        <p class="meta-intro">Choose which AI agent answers its messages:</p>
        <label class="meta-label" for="meta-agent">AI agent</label>
        <select id="meta-agent" v-model="selectedAgentId" class="meta-input">
          <option v-for="agent in agents" :key="String(agent.id)" :value="String(agent.id)">
            {{ agent.display_name || agent.name }}
          </option>
        </select>
        <div class="meta-actions">
          <button class="meta-btn meta-btn-secondary" @click="emit('connected', account)">Skip for now</button>
          <button class="meta-btn meta-btn-primary" :disabled="savingAgent || !selectedAgentId" @click="saveAgent">
            {{ savingAgent ? 'Saving…' : 'Assign agent' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meta-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.meta-modal-content {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  width: min(460px, calc(100vw - 32px));
  padding: 24px;
}

.meta-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.meta-modal-header h3 {
  margin: 0;
  font-family: var(--font-display);
}

.meta-close-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--muted);
}

.meta-reconnect {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 16px;
  padding: 12px;
  border-radius: var(--radius-md, 8px);
  background: var(--error-bg);
}

.meta-reconnect-text {
  margin: 0;
  flex: 1;
  color: var(--error-color);
  font-size: 14px;
  line-height: 1.5;
}

.meta-intro {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.meta-intro-link {
  /* --accent-ink, not --accent-solid: the latter is the lime fill and stays
     lime in both themes, which is unreadable as text on a light background. */
  color: var(--accent-ink);
  text-decoration: underline;
  font-weight: 600;
}

.meta-intro-link:hover {
  text-decoration: none;
}

.meta-field {
  margin-bottom: 12px;
}

.meta-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.meta-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  color: inherit;
  font-size: 14px;
}

.meta-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.meta-btn {
  padding: 9px 16px;
  border-radius: var(--radius-btn, 8px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
  color: inherit;
}

.meta-btn-primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-color: transparent;
}

.meta-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.meta-signup {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.meta-signup-checking {
  display: flex;
  justify-content: center;
  padding: 24px 0;
  color: var(--text-muted);
}

.meta-signup-btn {
  width: 100%;
  padding: 12px;
}

.meta-link-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  padding: 4px;
}

.meta-link-btn:hover {
  color: inherit;
}
</style>
