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
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import channelsService, { type ChannelAccount } from '@/services/channels'
import { agentService } from '@/services/agent'
import type { Agent } from '@/types/agent'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'connected', account: ChannelAccount): void
}>()

const botToken = ref('')
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
  if (!botToken.value.trim()) {
    toast.error('Paste the bot token from @BotFather')
    return
  }
  try {
    connecting.value = true
    account.value = await channelsService.connectTelegram(botToken.value.trim())
    toast.success(`Connected ${account.value.display_name || 'Telegram bot'}`)
  } catch (error: any) {
    const detail = error?.response?.data?.detail || 'Failed to connect Telegram bot'
    toast.error(detail)
  } finally {
    connecting.value = false
  }
}

const saveAgent = async () => {
  if (!account.value || !selectedAgentId.value) return
  try {
    savingAgent.value = true
    const updated = await channelsService.setAccountAgent(account.value.id, selectedAgentId.value)
    toast.success('Agent assigned — your bot is live!')
    emit('connected', updated)
  } catch (error: any) {
    toast.error(error?.response?.data?.detail || 'Failed to assign agent')
  } finally {
    savingAgent.value = false
  }
}
</script>

<template>
  <div class="tg-modal" @click.self="emit('close')">
    <div class="tg-modal-content">
      <div class="tg-modal-header">
        <h3>Connect Telegram</h3>
        <button class="tg-close-btn" @click="emit('close')">×</button>
      </div>

      <!-- Step 1: bot token -->
      <div v-if="!account" class="tg-modal-body">
        <ol class="tg-steps">
          <li>Open <strong>@BotFather</strong> in Telegram and send <code>/newbot</code></li>
          <li>Follow the prompts to name your bot</li>
          <li>Copy the bot token and paste it below</li>
        </ol>
        <label class="tg-label" for="tg-token">Bot token</label>
        <input
          id="tg-token"
          v-model="botToken"
          type="password"
          class="tg-input"
          placeholder="123456789:AAF…"
          autocomplete="off"
          @keyup.enter="connect"
        />
        <div class="tg-actions">
          <button class="tg-btn tg-btn-secondary" @click="emit('close')">Cancel</button>
          <button class="tg-btn tg-btn-primary" :disabled="connecting" @click="connect">
            {{ connecting ? 'Connecting…' : 'Connect' }}
          </button>
        </div>
      </div>

      <!-- Step 2: route to an agent -->
      <div v-else class="tg-modal-body">
        <p class="tg-connected-note">
          <strong>{{ account.display_name }}</strong> is connected.
          Choose which AI agent answers its messages:
        </p>
        <label class="tg-label" for="tg-agent">AI agent</label>
        <select id="tg-agent" v-model="selectedAgentId" class="tg-input">
          <option v-for="agent in agents" :key="String(agent.id)" :value="String(agent.id)">
            {{ agent.display_name || agent.name }}
          </option>
        </select>
        <div class="tg-actions">
          <button class="tg-btn tg-btn-secondary" @click="emit('connected', account)">Skip for now</button>
          <button class="tg-btn tg-btn-primary" :disabled="savingAgent || !selectedAgentId" @click="saveAgent">
            {{ savingAgent ? 'Saving…' : 'Assign agent' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tg-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tg-modal-content {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  width: min(440px, calc(100vw - 32px));
  padding: 24px;
}

.tg-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tg-modal-header h3 {
  margin: 0;
  font-family: var(--font-display);
}

.tg-close-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--muted);
}

.tg-steps {
  margin: 0 0 16px;
  padding-left: 20px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
}

.tg-steps code {
  font-family: var(--font-mono);
  background: var(--background-mute);
  padding: 1px 5px;
  border-radius: 4px;
}

.tg-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.tg-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  color: inherit;
  font-size: 14px;
}

.tg-connected-note {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
}

.tg-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.tg-btn {
  padding: 9px 16px;
  border-radius: var(--radius-btn, 8px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
  color: inherit;
}

.tg-btn-primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-color: transparent;
}

.tg-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
