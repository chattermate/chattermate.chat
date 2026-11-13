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
/** Settings › Saved replies: the team's library for the inbox's ⚡ picker. */
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import SavedReplyForm from '@/components/savedReplies/SavedReplyForm.vue'
import { useSavedReplies } from '@/composables/useSavedReplies'
import { permissionChecks } from '@/utils/permissions'
import type { SavedReply, SavedReplyInput } from '@/services/savedReplies'

const { replies, loaded, load, create, update, remove } = useSavedReplies()
const canManage = permissionChecks.canTakeOverChats()
const failed = ref(false)
const search = ref('')

/** null: closed; 'new': adding; a reply: editing it */
const editing = ref<SavedReply | 'new' | null>(null)
const removing = ref<SavedReply | null>(null)

const shown = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return replies.value
  return replies.value.filter((r) =>
    r.title.toLowerCase().includes(q) || r.body.toLowerCase().includes(q) || r.shortcut?.includes(q))
})

const formInitial = computed<SavedReplyInput>(() =>
  editing.value && editing.value !== 'new'
    ? { title: editing.value.title, body: editing.value.body, shortcut: editing.value.shortcut }
    : { title: '', body: '', shortcut: '' }
)

async function save(input: SavedReplyInput) {
  if (editing.value === 'new') {
    await create(input)
    toast.success('Saved reply added')
  } else if (editing.value) {
    await update(editing.value.id, input)
    toast.success('Saved reply updated')
  }
  editing.value = null
}

async function confirmRemove() {
  if (!removing.value) return
  const reply = removing.value
  removing.value = null
  try {
    await remove(reply.id)
    toast.success(`"${reply.title}" removed`)
  } catch {
    toast.error('It could not be removed. Try again.')
  }
}

onMounted(async () => {
  try {
    await load(true)
  } catch {
    failed.value = true
  }
})
</script>

<template>
  <DashboardLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Saved replies</h1>
          <p class="page-subtitle">
            Replies your team writes once and sends many times. In a reply, press ⚡ or type / to use one.
          </p>
        </div>
        <button v-if="canManage" type="button" class="btn primary" @click="editing = 'new'">New saved reply</button>
      </div>

      <p v-if="failed" class="state">Saved replies could not be loaded. Reload the page to try again.</p>
      <p v-else-if="!loaded" class="state">Loading…</p>
      <div v-else-if="!replies.length" class="empty">
        <p>No saved replies yet.</p>
        <p class="hint">Good first ones: your refund policy, delivery times, and how to reach a person.</p>
      </div>
      <template v-else>
        <input v-model="search" type="search" class="search" placeholder="Search saved replies" aria-label="Search saved replies" />
        <ul class="list">
          <li v-for="reply in shown" :key="reply.id" class="item">
            <div class="item-text">
              <span class="item-title">
                {{ reply.title }}
                <code v-if="reply.shortcut">/{{ reply.shortcut }}</code>
              </span>
              <span class="item-body">{{ reply.body }}</span>
            </div>
            <div v-if="canManage" class="item-actions">
              <button type="button" class="btn" :aria-label="`Edit ${reply.title}`" @click="editing = reply">Edit</button>
              <button type="button" class="btn danger" :aria-label="`Remove ${reply.title}`" @click="removing = reply">Remove</button>
            </div>
          </li>
        </ul>
        <p v-if="!shown.length" class="state">No saved reply matches “{{ search }}”.</p>
      </template>
    </div>

    <BaseModal
      v-if="editing"
      :title="editing === 'new' ? 'New saved reply' : 'Edit saved reply'"
      width="560px"
      @close="editing = null"
    >
      <SavedReplyForm
        :initial="formInitial"
        :submit-label="editing === 'new' ? 'Add saved reply' : 'Save changes'"
        :save="save"
        @cancel="editing = null"
      />
    </BaseModal>

    <BaseModal v-if="removing" title="Remove this saved reply?" width="420px" @close="removing = null">
      <p class="confirm">"{{ removing.title }}" is removed for the whole team.</p>
      <template #actions>
        <button type="button" class="btn" @click="removing = null">Cancel</button>
        <button type="button" class="btn danger-solid" @click="confirmRemove">Remove</button>
      </template>
    </BaseModal>
  </DashboardLayout>
</template>

<style scoped>
.page {
  max-width: 880px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0 0 4px;
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--text);
}

.page-subtitle,
.hint,
.state {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}

.empty {
  padding: 32px;
  border-radius: 12px;
  border: 1px dashed var(--o12);
  text-align: center;
}

.empty p {
  margin: 0 0 6px;
  color: var(--text2);
}

.search {
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--o12);
  background: var(--o04);
  color: var(--text);
  font: inherit;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: 12px;
  border: 1px solid var(--o08);
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--o06);
  background: var(--surface);
}

.item:last-child {
  border-bottom: 0;
}

.item-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text);
}

.item-title code {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 400;
  color: var(--muted2);
}

.item-body {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--muted);
}

.item-actions {
  flex-shrink: 0;
  display: flex;
  gap: 6px;
}

.btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--o12);
  background: var(--surface);
  color: var(--text2);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn.primary {
  border: 0;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}

.btn.danger {
  color: var(--c-danger);
}

.btn.danger-solid {
  border: 0;
  background: var(--c-danger);
  color: var(--on-danger);
}

.confirm {
  margin: 0;
  color: var(--text2);
}

@media (max-width: 640px) {
  .item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
