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
  channel: 'whatsapp' | 'messenger' | 'instagram'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'connected', account: ChannelAccount): void
}>()

// Per-channel copy + credential fields
const META_FORMS = {
  whatsapp: {
    title: 'Connect WhatsApp',
    intro: 'From your Meta app (developers.facebook.com → WhatsApp → API Setup), copy the phone number ID and a permanent access token.',
    fields: [
      { key: 'phone_number_id', label: 'Phone number ID', placeholder: '1234567890', secret: false },
      { key: 'access_token', label: 'Access token', placeholder: 'EAAG…', secret: true },
      { key: 'waba_id', label: 'WhatsApp Business Account ID (optional)', placeholder: 'for webhook auto-subscribe', secret: false },
    ],
  },
  messenger: {
    title: 'Connect Messenger',
    intro: 'From your Meta app (Messenger → Settings), generate a page access token for the Facebook Page you want to connect.',
    fields: [
      { key: 'page_id', label: 'Facebook Page ID', placeholder: '1234567890', secret: false },
      { key: 'page_access_token', label: 'Page access token', placeholder: 'EAAG…', secret: true },
    ],
  },
  instagram: {
    title: 'Connect Instagram',
    intro: 'Your Instagram account must be a professional account linked to a Facebook Page. Use the linked page’s access token.',
    fields: [
      { key: 'ig_id', label: 'Instagram account ID', placeholder: '17841400000000000', secret: false },
      { key: 'page_access_token', label: 'Linked page access token', placeholder: 'EAAG…', secret: true },
    ],
  },
} as const

const form = computed(() => META_FORMS[props.channel])
const values = ref<Record<string, string>>({})
const connecting = ref(false)
const account = ref<ChannelAccount | null>(null)

const agents = ref<Agent[]>([])
const selectedAgentId = ref('')
const savingAgent = ref(false)

onMounted(async () => {
  try {
    agents.value = await agentService.getOrganizationAgents()
    if (agents.value.length > 0) {
      selectedAgentId.value = String(agents.value[0].id)
    }
  } catch (error) {
    console.error('Error loading agents:', error)
  }
})

const connect = async () => {
  const missing = form.value.fields.filter(f => !f.label.includes('optional') && !values.value[f.key]?.trim())
  if (missing.length > 0) {
    toast.error(`Please fill in: ${missing.map(f => f.label).join(', ')}`)
    return
  }
  try {
    connecting.value = true
    const payload: any = Object.fromEntries(
      form.value.fields
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
    toast.error(error?.response?.data?.detail || `Failed to connect ${props.channel}`)
  } finally {
    connecting.value = false
  }
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
  <div class="meta-modal" @click.self="emit('close')">
    <div class="meta-modal-content">
      <div class="meta-modal-header">
        <h3>{{ form.title }}</h3>
        <button class="meta-close-btn" @click="emit('close')">×</button>
      </div>

      <!-- Step 1: credentials -->
      <div v-if="!account" class="meta-modal-body">
        <p class="meta-intro">{{ form.intro }}</p>
        <div v-for="field in form.fields" :key="field.key" class="meta-field">
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
      </div>

      <!-- Step 2: route to an agent -->
      <div v-else class="meta-modal-body">
        <p class="meta-intro">
          <strong>{{ account.display_name }}</strong> is connected.
          Choose which AI agent answers its messages:
        </p>
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

.meta-intro {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
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
</style>
