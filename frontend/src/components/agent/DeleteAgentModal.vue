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

<!-- Confirms deleting an agent, saying what goes with it (read from the
     server, since widgets and numbers are set up elsewhere) and what stays. -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import BaseModal from '@/components/common/BaseModal.vue'
import { agentService, type AgentRemovalImpact } from '@/services/agent'
import type { Agent } from '@/types/agent'
import { apiErrorMessage } from '@/utils/apiError'
import { removalConsequences } from '@/utils/agentRemoval'

const props = defineProps<{ agent: Agent }>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deleted', agent: Agent): void
}>()

const impact = ref<AgentRemovalImpact | null>(null)
const loadFailed = ref(false)
const deleting = ref(false)

const agentName = computed(() => props.agent.display_name || props.agent.name)
const consequences = computed(() => (impact.value ? removalConsequences(impact.value) : []))

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
  <BaseModal :title="`Delete ${agentName}?`" width="480px" @close="emit('close')">
    <p class="dam-lead">This can't be undone.</p>

    <ul v-if="consequences.length" class="dam-list" data-testid="agent-removal-impact">
      <li v-for="line in consequences" :key="line">{{ line }}</li>
    </ul>
    <p v-else-if="loadFailed" class="dam-note">
      Its widgets and workflows are deleted with it, and any channel it answers is left without an agent.
    </p>

    <p class="dam-note">Past conversations, tickets and leads stay in your inbox.</p>

    <template #actions>
      <button type="button" class="dam-btn" @click="emit('close')">Cancel</button>
      <button
        type="button"
        class="dam-btn dam-btn-danger"
        :disabled="deleting || (!impact && !loadFailed)"
        @click="confirmDelete"
      >
        {{ deleting ? 'Deleting…' : 'Delete agent' }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.dam-lead {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text);
}

.dam-list {
  margin: 0 0 12px;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  line-height: 1.5;
}

.dam-note {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.dam-btn {
  padding: 8px 14px;
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
  color: #fff;
}
</style>
