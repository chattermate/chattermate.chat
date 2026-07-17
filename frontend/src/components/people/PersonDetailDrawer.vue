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
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue-sonner'
import { peopleService } from '@/services/people'
import type { PersonDetail } from '@/types/people'

const props = defineProps<{ customerId: string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'updated', stage?: string): void }>()

const person = ref<PersonDetail | null>(null)
const loading = ref(true)
const marking = ref(false)

// Inline contact edit — the identification tool: adding a phone/name is what
// turns an anonymous session into a person (and unlocks the actions below).
const editing = ref(false)
const saving = ref(false)
const editName = ref('')
const editPhone = ref('')

function startEdit() {
  editName.value = person.value?.name || ''
  editPhone.value = person.value?.phone || ''
  editing.value = true
}

async function saveEdit() {
  saving.value = true
  try {
    person.value = await peopleService.updatePerson(props.customerId, {
      full_name: editName.value.trim() || undefined,
      // "" deliberately passes through: it clears a wrong number.
      phone: editPhone.value.trim(),
    })
    editing.value = false
    emit('updated')
  } catch (error: any) {
    toast.error('Could not save', {
      description: error?.response?.data?.detail || 'Please try again',
    })
  } finally {
    saving.value = false
  }
}

const attrEntries = computed(() => Object.entries(person.value?.captured_attributes || {}))

async function load() {
  loading.value = true
  try { person.value = await peopleService.getPerson(props.customerId) }
  catch { toast.error('Failed to load person') }
  finally { loading.value = false }
}

async function markCustomer() {
  marking.value = true
  try {
    person.value = await peopleService.markAsCustomer(props.customerId)
    toast.success('Marked as customer')
    emit('updated', 'customer')
  } catch (error: any) {
    toast.error('Failed to mark as customer', {
      description: error?.response?.data?.detail || undefined,
    })
  } finally {
    marking.value = false
  }
}

function stageLabel(s?: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }
function fmt(d?: string | null) {
  if (!d) return ''
  try { return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return '' }
}

onMounted(load)
</script>

<template>
  <div class="pdd-overlay" @click.self="emit('close')">
    <aside class="pdd">
      <div class="pdd-head">
        <div class="pdd-head-main" v-if="person">
          <div class="pdd-name">{{ person.name || (person.is_anonymous ? 'Anonymous visitor' : (person.email || '—')) }}</div>
          <div class="pdd-email">
            {{ person.is_anonymous ? 'anonymous' : (person.email || '') }}
            <span v-if="person.phone" class="pdd-phone">{{ person.phone }}</span>
          </div>
        </div>
        <button class="pdd-close" @click="emit('close')">✕</button>
      </div>

      <div v-if="loading" class="pdd-loading">Loading…</div>

      <div v-else-if="person" class="pdd-body">
        <div class="pdd-stagerow">
          <span class="pdd-badge" :class="person.lead_stage">{{ stageLabel(person.lead_stage) }}</span>
          <span v-if="person.qualified" class="pdd-star" title="Qualified">★ Qualified</span>
        </div>

        <!-- Sync (phase 1: not implemented) -->
        <div class="pdd-sync">
          <span class="pdd-sync-text">CRM sync isn't connected yet.</span>
          <button class="pdd-sync-btn" disabled title="Coming soon">Sync now</button>
        </div>

        <button
          v-if="person.lead_stage !== 'customer'"
          class="pdd-mark"
          :disabled="marking || !person.identified"
          :title="person.identified ? '' : 'Add an email or phone first — this person is anonymous'"
          @click="markCustomer"
        >
          {{ marking ? 'Marking…' : 'Mark as customer' }}
        </button>
        <p v-if="!person.identified" class="pdd-identify-hint">
          Anonymous visitor — add a name or phone below to identify them.
        </p>

        <!-- Contact edit: the one place a wrong phone can be corrected -->
        <div class="pdd-section-title">
          CONTACT
          <button v-if="!editing" type="button" class="pdd-edit-link" @click="startEdit">Edit</button>
        </div>
        <div v-if="editing" class="pdd-edit">
          <label class="pdd-edit-field">
            <span>Name</span>
            <input v-model="editName" placeholder="Priya" autocomplete="off" />
          </label>
          <label class="pdd-edit-field">
            <span>Phone</span>
            <input v-model="editPhone" placeholder="+91 63666 02824" autocomplete="off" />
          </label>
          <div class="pdd-edit-actions">
            <button type="button" class="pdd-edit-btn" @click="editing = false">Cancel</button>
            <button type="button" class="pdd-edit-btn primary" :disabled="saving" @click="saveEdit">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
        <div v-else class="pdd-attrs">
          <div class="pdd-attr"><span class="pdd-attr-k">Phone</span><span class="pdd-attr-v">{{ person.phone || '—' }}</span></div>
        </div>

        <!-- AI qualification summary -->
        <template v-if="person.summary">
          <div class="pdd-section-title">AI SUMMARY</div>
          <div class="pdd-summary">{{ person.summary }}</div>
        </template>

        <!-- Lifecycle -->
        <div class="pdd-section-title">LIFECYCLE</div>
        <div class="pdd-timeline">
          <div v-for="(t, i) in person.timeline" :key="i" class="pdd-tl">
            <span class="pdd-tl-dot" :class="t.stage"></span>
            <span class="pdd-tl-label">{{ stageLabel(t.stage) }}</span>
            <span class="pdd-tl-time">{{ fmt(t.at) }}</span>
          </div>
        </div>

        <!-- Captured attributes -->
        <div class="pdd-section-title">CAPTURED ATTRIBUTES</div>
        <div v-if="attrEntries.length" class="pdd-attrs">
          <div v-for="[k, v] in attrEntries" :key="k" class="pdd-attr">
            <span class="pdd-attr-k">{{ k }}</span>
            <span class="pdd-attr-v">{{ v }}</span>
          </div>
        </div>
        <div v-else class="pdd-none">No attributes captured yet.</div>

        <!-- Conversations -->
        <div class="pdd-section-title">CONVERSATIONS <span class="pdd-count">{{ person.conversations.length }}</span></div>
        <div v-if="person.conversations.length" class="pdd-convos">
          <div v-for="c in person.conversations" :key="c.session_id" class="pdd-convo">
            <div class="pdd-convo-top">
              <span class="pdd-agent">{{ c.agent_name || 'Agent' }}</span>
              <span class="pdd-status">{{ c.status }}</span>
            </div>
            <div class="pdd-snippet">{{ c.last_message || '—' }}</div>
            <div class="pdd-convo-date">{{ fmt(c.created_at) }}</div>
          </div>
        </div>
        <div v-else class="pdd-none">No conversations yet.</div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.pdd-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 1000; display: flex; justify-content: flex-end; }
.pdd { width: 440px; max-width: 94vw; height: 100%; background: var(--surface); border-left: 1px solid var(--border-color); display: flex; flex-direction: column; box-shadow: -12px 0 40px rgba(0,0,0,.2); }
.pdd-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 20px 22px; border-bottom: 1px solid var(--border-color); }
.pdd-name { font-size: 18px; font-weight: 700; }
.pdd-email { font-size: 12px; color: var(--muted); margin-top: 3px; }
.pdd-close { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border-color); background: transparent; cursor: pointer; flex-shrink: 0; }
.pdd-loading { padding: 40px; text-align: center; color: var(--muted); }
.pdd-body { flex: 1; overflow-y: auto; padding: 20px 22px; }
.pdd-stagerow { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.pdd-badge { padding: 4px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 600; }
.pdd-badge.visitor { background: rgba(0,0,0,.06); color: var(--muted); }
.pdd-badge.lead { background: var(--purple-bg); color: var(--c-purple); }
.pdd-badge.customer { background: var(--accent-bg-12); color: var(--primary-color); }
.pdd-star { font-size: 12.5px; color: #f59e0b; }
.pdd-sync { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; background: var(--o05); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 12px; }
.pdd-sync-text { font-size: 13px; color: var(--muted); }
.pdd-sync-btn { padding: 7px 14px; border-radius: 9px; border: 1px solid var(--border-color); background: transparent; font-size: 13px; opacity: .5; cursor: default; }
.pdd-mark { width: 100%; padding: 10px; border-radius: 10px; border: none; background: var(--accent-solid); color: var(--on-accent-solid); font-weight: 600; font-size: 14px; cursor: pointer; margin-bottom: 22px; }
.pdd-mark:disabled { opacity: .6; cursor: default; }
.pdd-identify-hint { font-size: 12px; color: var(--muted); margin: -14px 0 18px; }
.pdd-phone { margin-left: 8px; font-variant-numeric: tabular-nums; }
.pdd-edit-link { margin-left: auto; border: none; background: none; color: var(--c-info); font-size: 11px; letter-spacing: normal; text-transform: none; cursor: pointer; padding: 0; }
.pdd-edit { background: var(--o05); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.pdd-edit-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--muted); }
.pdd-edit-field input { padding: 8px 10px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 13px; }
.pdd-edit-actions { display: flex; justify-content: flex-end; gap: 8px; }
.pdd-edit-btn { padding: 7px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: transparent; font-size: 12.5px; cursor: pointer; color: var(--text); }
.pdd-edit-btn.primary { background: var(--accent-solid); color: var(--on-accent-solid); border-color: transparent; }
.pdd-edit-btn:disabled { opacity: .6; cursor: default; }
.pdd-section-title { font-size: 10.5px; letter-spacing: .07em; color: var(--muted); margin: 18px 0 12px; display: flex; align-items: center; gap: 8px; }
.pdd-summary { background: var(--purple-bg); border: 1px solid var(--purple-border, var(--o12)); border-radius: 12px; padding: 12px 14px; font-size: 13px; line-height: 1.55; color: var(--text2); }
.pdd-count { font-weight: 600; }
.pdd-timeline { display: flex; flex-direction: column; gap: 12px; }
.pdd-tl { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.pdd-tl-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--muted); }
.pdd-tl-dot.lead { background: var(--c-purple); }
.pdd-tl-dot.customer { background: var(--primary-color); }
.pdd-tl-label { font-weight: 600; }
.pdd-tl-time { color: var(--muted); font-size: 12px; margin-left: auto; }
.pdd-attrs { background: var(--o05); border: 1px solid var(--border-color); border-radius: 12px; padding: 4px 14px; }
.pdd-attr { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; }
.pdd-attr:last-child { border-bottom: none; }
.pdd-attr-k { color: var(--muted); flex-shrink: 0; }
.pdd-attr-v { text-align: right; font-weight: 500; word-break: break-word; }
.pdd-none { font-size: 13px; color: var(--muted); padding: 6px 0; }
.pdd-convos { display: flex; flex-direction: column; gap: 10px; }
.pdd-convo { background: var(--o05); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 14px; }
.pdd-convo-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.pdd-agent { font-size: 12.5px; font-weight: 600; }
.pdd-status { font-size: 11px; color: var(--muted); }
.pdd-snippet { font-size: 13px; color: var(--muted); line-height: 1.5; }
.pdd-convo-date { font-size: 11px; color: var(--muted); margin-top: 6px; }
</style>
