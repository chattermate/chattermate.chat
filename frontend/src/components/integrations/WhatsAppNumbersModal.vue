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

<!-- The workspace's WhatsApp numbers: which agent answers each, manage or
     disconnect one, and add another while the plan allows it. The connect
     form itself stays in MetaChannelConnect; this only says which number. -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import BaseModal from '@/components/common/BaseModal.vue'
import channelsService, { type ChannelAccount } from '@/services/channels'
import { agentService } from '@/services/agent'
import { apiErrorMessage } from '@/utils/apiError'
import { NO_AGENT_TEXT, numberLimitState } from '@/utils/channelAccounts'

const SUBSCRIPTION_PATH = '/settings/subscription'

const props = defineProps<{
  accounts: ChannelAccount[]
  /** The plan's limit; null = no limit (or unknown: the server still checks) */
  limit: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add'): void
  (e: 'manage', account: ChannelAccount): void
  (e: 'disconnected', account: ChannelAccount): void
}>()

const agentNames = ref<Record<string, string>>({})
const confirmingId = ref<string | null>(null)
const disconnectingId = ref<string | null>(null)

onMounted(async () => {
  try {
    const agents = await agentService.getOrganizationAgents()
    agentNames.value = Object.fromEntries(
      agents.map(agent => [String(agent.id), agent.display_name || agent.name]))
  } catch (error) {
    console.error('Error loading agents:', error)
  }
})

const state = computed(() => numberLimitState(props.accounts.length, props.limit))

// Why a number can't reply right now, or null when it can
const problem = (account: ChannelAccount): string | null => {
  if (account.needs_reconnect) return 'Access expired: reconnect to resume replies'
  if (account.send_problem) return "Can't send replies: open it to see why"
  if (!account.agent_id) return NO_AGENT_TEXT
  return null
}

// The row's button names the fix its problem needs
const actionLabel = (account: ChannelAccount) => {
  if (account.needs_reconnect) return 'Reconnect'
  if (!account.send_problem && !account.agent_id) return 'Assign agent'
  return 'Manage'
}

// Only reached for a number with an agent: problem() covers one without
const agentLabel = (account: ChannelAccount) => {
  const name = agentNames.value[String(account.agent_id)]
  return name ? `Answered by ${name}` : 'Agent assigned'
}

const disconnect = async (account: ChannelAccount) => {
  disconnectingId.value = account.id
  try {
    await channelsService.disconnectMeta(account.id)
    toast.success(`${account.display_name || 'Number'} disconnected`)
    emit('disconnected', account)
  } catch (error) {
    toast.error(apiErrorMessage(error, 'Could not disconnect the number'))
  } finally {
    disconnectingId.value = null
    confirmingId.value = null
  }
}
</script>

<template>
  <BaseModal title="WhatsApp numbers" width="560px" @close="emit('close')">
    <p class="wan-intro">
      Each number is answered by one AI agent, so different numbers can go to different agents.
    </p>

    <ul class="wan-list" data-testid="whatsapp-numbers">
      <li
        v-for="account in accounts"
        :key="account.id"
        class="wan-row"
        :data-testid="`whatsapp-number-${account.external_account_id}`"
      >
        <span class="wan-dot" :class="{ warn: problem(account) }" aria-hidden="true"></span>
        <div class="wan-main">
          <span class="wan-name">{{ account.display_name || account.external_account_id }}</span>
          <span class="wan-meta" :class="{ warn: problem(account) }">
            {{ problem(account) ?? agentLabel(account) }}
          </span>
        </div>

        <div v-if="confirmingId === account.id" class="wan-actions">
          <span class="wan-confirm-text">Disconnect?</span>
          <button
            type="button"
            class="wan-btn wan-btn-danger"
            :disabled="disconnectingId === account.id"
            @click="disconnect(account)"
          >
            {{ disconnectingId === account.id ? 'Disconnecting…' : 'Disconnect' }}
          </button>
          <button type="button" class="wan-btn" @click="confirmingId = null">Cancel</button>
        </div>
        <div v-else class="wan-actions">
          <!-- A number that can't reply leads straight to its fix -->
          <button
            type="button"
            class="wan-btn"
            :class="{ 'wan-btn-primary': problem(account) }"
            :aria-label="`${actionLabel(account)} ${account.display_name || account.external_account_id}`"
            @click="emit('manage', account)"
          >
            {{ actionLabel(account) }}
          </button>
          <button
            type="button"
            class="wan-btn wan-btn-quiet"
            :aria-label="`Disconnect ${account.display_name || account.external_account_id}`"
            @click="confirmingId = account.id"
          >
            Disconnect
          </button>
        </div>
      </li>
    </ul>

    <template #actions>
      <div class="wan-footer">
        <span class="wan-usage" data-testid="whatsapp-numbers-usage">{{ state.usage }}</span>
        <div class="wan-footer-actions">
          <a v-if="state.atLimit" class="wan-upgrade" :href="SUBSCRIPTION_PATH">Upgrade for more</a>
          <button
            type="button"
            class="wan-btn wan-btn-primary"
            :disabled="state.atLimit"
            :title="state.atLimit ? state.limitText : undefined"
            @click="emit('add')"
          >
            Add number
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.wan-intro {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

/* Scrolls on its own: BaseModal shrinks its body to fit the viewport but does
   not scroll it, so a long list would otherwise run under the footer. */
.wan-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}


.wan-row {
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
}

.wan-dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c-positive);
}

.wan-dot.warn {
  background: var(--c-warn);
}

.wan-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wan-name {
  font-weight: 600;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wan-meta {
  font-size: 12px;
  color: var(--muted);
}

.wan-meta.warn {
  color: var(--c-warn);
}

.wan-actions {
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.wan-confirm-text {
  font-size: 13px;
  color: var(--muted);
  margin-right: 2px;
}

.wan-btn {
  padding: 7px 12px;
  border-radius: var(--radius-btn, 8px);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
  color: inherit;
}

.wan-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wan-btn-quiet {
  border-color: transparent;
  background: transparent;
  color: var(--muted);
}

.wan-btn-quiet:hover {
  color: var(--c-danger);
}

.wan-btn-danger {
  background: var(--c-danger);
  border-color: transparent;
  color: var(--on-danger);
}

.wan-btn-primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-color: transparent;
}

.wan-footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.wan-usage {
  font-size: 13px;
  color: var(--muted);
}

.wan-footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wan-upgrade {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-ink);
  text-decoration: none;
}

.wan-upgrade:hover {
  text-decoration: underline;
}

@media (max-width: 520px) {
  .wan-row {
    flex-wrap: wrap;
  }

  .wan-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
