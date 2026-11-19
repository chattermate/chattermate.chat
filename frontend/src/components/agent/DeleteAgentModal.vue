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

<!-- Confirms deleting an agent: which agent, what goes with it (read from the
     server, since widgets and numbers are set up elsewhere) and what stays. -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import BaseModal from '@/components/common/BaseModal.vue'
import { resolveUploadUrl } from '@/config/api'
import { agentService, type AgentRemovalImpact } from '@/services/agent'
import type { Agent } from '@/types/agent'
import { apiErrorMessage } from '@/utils/apiError'
import { removalConsequences } from '@/utils/agentRemoval'
import { resolveOrbStyle } from '@/utils/orb'

const props = defineProps<{ agent: Agent }>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deleted', agent: Agent): void
}>()

const impact = ref<AgentRemovalImpact | null>(null)
const loadFailed = ref(false)
const deleting = ref(false)

const agentName = computed(() => props.agent.display_name || props.agent.name)
const photoUrl = computed(() => resolveUploadUrl(props.agent.customization?.photo_url))
const orbStyle = computed(() => (props.agent.customization?.photo_url
  ? {}
  : resolveOrbStyle(props.agent.name, props.agent.customization?.customization_metadata?.orb_variant)))
const consequences = computed(() => (impact.value ? removalConsequences(impact.value) : []))
const loading = computed(() => !impact.value && !loadFailed.value)

onMounted(async () => {
  try {
    impact.value = await agentService.getRemovalImpact(props.agent.id)
  } catch (error) {
    console.error('Error loading what deleting the agent removes:', error)
    loadFailed.value = true
  }
})

const confirmDelete = async () => {
  deleting.value = true
  try {
    await agentService.deleteAgent(props.agent.id)
    toast.success(`${agentName.value} deleted`)
    emit('deleted', props.agent)
  } catch (error) {
    toast.error(apiErrorMessage(error, 'Could not delete the agent'))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <BaseModal title="Delete this agent?" width="460px" @close="emit('close')">
    <div class="dam-agent">
      <div class="dam-orb" :style="orbStyle">
        <img v-if="agent.customization?.photo_url" :src="photoUrl" :alt="agentName" />
      </div>
      <div class="dam-agent-text">
        <span class="dam-agent-name">{{ agentName }}</span>
        <span v-if="agent.display_name && agent.display_name !== agent.name" class="dam-agent-slug">{{ agent.name }}</span>
      </div>
    </div>

    <div class="dam-section">
      <h4 class="dam-heading">What goes with it</h4>
      <div v-if="loading" class="dam-skeleton" aria-busy="true" aria-label="Loading"></div>
      <ul v-else-if="consequences.length" class="dam-rows" data-testid="agent-removal-impact">
        <li v-for="row in consequences" :key="row.text" class="dam-row dam-row-goes">
          <span class="dam-icon"><font-awesome-icon :icon="row.icon" /></span>
          <span>{{ row.text }}</span>
        </li>
      </ul>
      <p v-else-if="loadFailed" class="dam-row dam-row-goes">
        <span class="dam-icon"><font-awesome-icon icon="fa-solid fa-triangle-exclamation" /></span>
        <span>Its widgets and workflows are deleted with it, and any channel it answers is left without an agent.</span>
      </p>
      <p v-else class="dam-row dam-row-quiet">
        <span class="dam-icon"><font-awesome-icon icon="fa-solid fa-circle-minus" /></span>
        <span>Nothing else is set up on this agent.</span>
      </p>
    </div>

    <div class="dam-section">
      <h4 class="dam-heading">What stays</h4>
      <p class="dam-row dam-row-stays">
        <span class="dam-icon"><font-awesome-icon icon="fa-solid fa-inbox" /></span>
        <span>Past conversations, tickets and leads stay in your inbox.</span>
      </p>
    </div>

    <p class="dam-final">
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
      This can't be undone.
    </p>

    <template #actions>
      <button type="button" class="dam-btn" @click="emit('close')">Cancel</button>
      <button
        type="button"
        class="dam-btn dam-btn-danger"
        :disabled="deleting || loading"
        @click="confirmDelete"
      >
        <font-awesome-icon v-if="!deleting" icon="fa-solid fa-trash-can" />
        {{ deleting ? 'Deleting…' : 'Delete agent' }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.dam-agent {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin: 4px 0 18px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
}

.dam-orb {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.dam-orb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dam-agent-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dam-agent-name {
  font-weight: 600;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dam-agent-slug {
  font-size: 12px;
  color: var(--muted);
  font-family: var(--font-mono, ui-monospace, monospace);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dam-section {
  margin-bottom: 16px;
}

.dam-heading {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.dam-rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dam-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.dam-icon {
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.dam-row-goes .dam-icon {
  background: color-mix(in srgb, var(--c-danger) 14%, transparent);
  color: var(--c-danger);
}

.dam-row-stays .dam-icon {
  background: color-mix(in srgb, var(--c-positive) 14%, transparent);
  color: var(--c-positive);
}

.dam-row-quiet {
  color: var(--muted);
}

.dam-row-quiet .dam-icon {
  background: var(--background-soft);
  color: var(--muted);
}

.dam-skeleton {
  height: 26px;
  border-radius: 7px;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
}

.dam-final {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0 0;
  padding: 10px 12px;
  border-radius: var(--radius-btn, 8px);
  font-size: 13px;
  font-weight: 600;
  color: var(--c-danger);
  background: color-mix(in srgb, var(--c-danger) 10%, transparent);
}

.dam-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: var(--radius-btn, 8px);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
  color: inherit;
}

.dam-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dam-btn-danger {
  background: var(--c-danger);
  border-color: transparent;
  color: var(--on-danger);
}

.dam-btn-danger:not(:disabled):hover {
  filter: brightness(1.08);
}
</style>
