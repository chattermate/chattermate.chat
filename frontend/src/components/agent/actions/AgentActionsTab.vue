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
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { formatDistanceToNow } from 'date-fns'
import BaseModal from '@/components/common/BaseModal.vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import { useAgentActions } from '@/composables/useAgentActions'
import { permissionChecks } from '@/utils/permissions'
import type { AgentAction, AgentActionInput } from '@/types/agentActions'
import ActionEditor from './ActionEditor.vue'
import ActionPolicyBadge from './ActionPolicyBadge.vue'

const props = defineProps<{ agentId: string }>()

const { actions, cap, atCap, loading, saving, loadError, load, save, setEnabled, remove } = useAgentActions(() => props.agentId)
const canManage = permissionChecks.canManageAgents()

/** null = closed, 'new' = blank form, otherwise the action being edited. */
const editing = ref<AgentAction | 'new' | null>(null)
const pendingDelete = ref<AgentAction | null>(null)

const editingAction = computed(() => (editing.value && editing.value !== 'new' ? editing.value : null))

const REGISTER_EXAMPLE = `ChatterMate.registerActions({
  open_page: { run: async ({ path }) => { router.push(path); return { ok: true } } },
})`

function seenLabel(action: AgentAction): string {
  if (!action.last_registered_at) return 'Not registered'
  return formatDistanceToNow(new Date(action.last_registered_at), { addSuffix: true })
}

async function handleSave(input: AgentActionInput) {
  try {
    const saved = await save(input, editingAction.value?.id)
    toast.success(`Saved ${saved.name}`)
    editing.value = saved
  } catch (error) {
    toast.error((error as Error).message)
  }
}

async function toggleEnabled(action: AgentAction, enabled: boolean) {
  try {
    await setEnabled(action.id, enabled)
  } catch (error) {
    toast.error((error as Error).message)
  }
}

async function confirmDelete() {
  const action = pendingDelete.value
  if (!action) return
  pendingDelete.value = null
  try {
    await remove(action.id)
    if (editingAction.value?.id === action.id) editing.value = null
    toast.success(`Deleted ${action.name}`)
  } catch (error) {
    toast.error((error as Error).message)
  }
}

onMounted(load)
</script>

<template>
  <section class="agent-tab actions-tab" aria-label="Actions">
    <div class="tab-head">
      <div>
        <h3 class="tab-title">Actions</h3>
        <p class="tab-sub">Things this agent can do in your app for the signed-in user. Your page supplies the code for each one.</p>
      </div>
      <button v-if="canManage" class="btn accent" :disabled="atCap || loading" @click="editing = 'new'">
        <font-awesome-icon icon="fa-solid fa-plus" /> New action
      </button>
    </div>

    <p v-if="loading" class="state">Loading actions…</p>
    <div v-else-if="loadError" class="state error">
      {{ loadError }} <button class="link" @click="load">Try again</button>
    </div>

    <div v-else class="actions-grid" :class="{ editing: editing }">
      <section>
        <div v-if="actions.length === 0" class="empty">
          <h4>No actions yet</h4>
          <p>Add an action, then register its code on your page:</p>
          <pre class="code">{{ REGISTER_EXAMPLE }}</pre>
        </div>

        <div v-else class="table" role="table" aria-label="Actions">
          <div class="row head" role="row">
            <span role="columnheader">Name</span>
            <span role="columnheader">Label</span>
            <span role="columnheader">Asks first</span>
            <span role="columnheader">Seen</span>
            <span role="columnheader">On</span>
            <span role="columnheader"><span class="sr-only">Delete</span></span>
          </div>
          <div
            v-for="action in actions"
            :key="action.id"
            class="row"
            role="row"
            :class="{ selected: editingAction?.id === action.id }"
            tabindex="0"
            @click="editing = action"
            @keydown.enter="editing = action"
          >
            <span class="mono name" role="cell">{{ action.name }}</span>
            <span role="cell">{{ action.label }}</span>
            <span role="cell"><ActionPolicyBadge :policy="action.confirm" /></span>
            <span role="cell" class="seen" :class="{ warn: !action.last_registered_at }">{{ seenLabel(action) }}</span>
            <span role="cell" @click.stop>
              <ToggleSwitch
                :model-value="action.enabled"
                :label="`Turn ${action.name} ${action.enabled ? 'off' : 'on'}`"
                :disabled="saving || !canManage"
                @update:model-value="toggleEnabled(action, $event)"
              />
            </span>
            <span role="cell" @click.stop>
              <button v-if="canManage" class="icon-btn" :aria-label="`Delete ${action.name}`" @click="pendingDelete = action">
                <font-awesome-icon icon="fa-solid fa-trash" />
              </button>
            </span>
          </div>
        </div>
        <p class="foot">
          {{ actions.length }} of {{ cap }} actions.
          <template v-if="atCap">Upgrade to add more.</template>
          “Seen” is the last time a page registered code for the action. Actions only run on your allowed domains.
        </p>
      </section>

      <ActionEditor
        v-if="editing"
        :read-only="!canManage"
        :agent-id="agentId"
        :action="editingAction"
        :saving="saving"
        @save="handleSave"
        @cancel="editing = null"
      />
    </div>

    <BaseModal v-if="pendingDelete" title="Delete action?" @close="pendingDelete = null">
      <p class="modal-text">
        <span class="mono">{{ pendingDelete.name }}</span> will stop working on every page right away.
      </p>
      <template #actions>
        <button class="btn ghost" @click="pendingDelete = null">Cancel</button>
        <button class="btn danger" @click="confirmDelete">Delete</button>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped src="./actions.css"></style>
<style scoped>
.actions-tab { display: flex; flex-direction: column; gap: 18px; }
.state { font-size: 14px; color: var(--muted); }
.state.error { color: var(--c-coral); }
.actions-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; align-items: start; }
.actions-grid.editing { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); }
.empty {
  border: 1.5px dashed var(--o14);
  border-radius: var(--radius-card);
  padding: 28px 24px;
}
.empty h4 { margin: 0 0 6px; font-size: 16px; }
.empty p { margin: 0 0 12px; font-size: 13.5px; color: var(--muted); }
.code {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-input);
  background: var(--bg);
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--code);
  overflow-x: auto;
}
.table { border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; }
.row {
  display: grid;
  grid-template-columns: minmax(150px, 1.4fr) minmax(140px, 1.4fr) 160px 110px 56px 36px;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--o06);
  font-size: 13.5px;
  color: var(--text3);
  cursor: pointer;
}
.row:first-child { border-top: none; }
.row.head {
  cursor: default;
  background: var(--o03);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted2);
}
.row:not(.head):hover, .row.selected { background: var(--o03); }
.row:focus-visible { outline: none; box-shadow: inset var(--ring-focus); }
.mono { font-family: var(--font-mono); }
.name { color: var(--text); font-size: 13px; overflow: hidden; text-overflow: ellipsis; }
.seen { font-size: 12.5px; color: var(--muted2); }
.seen.warn { color: var(--c-warn); }
.foot { margin: 10px 0 0; font-size: 12.5px; color: var(--muted2); }
.icon-btn { background: none; border: none; color: var(--muted); cursor: pointer; padding: 6px; border-radius: 8px; }
.icon-btn:hover { color: var(--c-coral); }
.link { background: none; border: none; color: var(--accent-ink); cursor: pointer; font-weight: 500; }
.modal-text { margin: 0; font-size: 14px; color: var(--text3); line-height: 1.5; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
/* Sized by the space the tab really has (the sidebar and the open editor
   both take width), not by the viewport. */
.actions-tab { container: actions-tab / inline-size; }
.actions-grid > section { container: actions-list / inline-size; min-width: 0; }
@container actions-tab (max-width: 900px) {
  .actions-grid.editing { grid-template-columns: minmax(0, 1fr); }
}
/* Too narrow for every column: drop Label and Seen, keep the controls. */
@container actions-list (max-width: 720px) {
  .row { grid-template-columns: minmax(0, 1fr) 150px 56px 36px; }
  .row > :nth-child(2), .row > :nth-child(4) { display: none; }
}
@container actions-list (max-width: 420px) {
  .row { grid-template-columns: minmax(0, 1fr) 56px 36px; }
  .row > :nth-child(3) { display: none; }
}
</style>
