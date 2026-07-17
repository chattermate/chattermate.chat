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
import { computed, onMounted, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { dbConnectorService } from '@/services/tickets'
import type { DbConnector, DbConnectorTable } from '@/types/ticket'

const connectors = ref<DbConnector[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const showForm = ref(false)
// When set, the picker edits this saved connector instead of the draft form.
const editingConnector = ref<DbConnector | null>(null)

const form = reactive({
  name: '',
  engine: 'postgresql' as 'postgresql' | 'mysql',
  host: '',
  port: 5432,
  database: '',
  username: '',
  password: '',
  max_rows: 100,
})

const isDiscovering = ref(false)
const discoveredTables = ref<DbConnectorTable[] | null>(null)
const discoverError = ref<string | null>(null)
const selectedTables = ref<Set<string>>(new Set())
const maskedColumns = ref<Set<string>>(new Set())
const expandedTable = ref<string | null>(null)
const isSaving = ref(false)

const tablesBySchema = computed(() => {
  const groups: Record<string, DbConnectorTable[]> = {}
  for (const table of discoveredTables.value || []) {
    ;(groups[table.schema] ||= []).push(table)
  }
  return groups
})

function tableKey(table: DbConnectorTable): string {
  return `${table.schema}.${table.table}`.toLowerCase()
}

function resetPicker() {
  discoveredTables.value = null
  discoverError.value = null
  selectedTables.value = new Set()
  maskedColumns.value = new Set()
  expandedTable.value = null
}

function openCreateForm() {
  editingConnector.value = null
  Object.assign(form, {
    name: '', engine: 'postgresql', host: '', port: 5432,
    database: '', username: '', password: '', max_rows: 100,
  })
  resetPicker()
  showForm.value = true
}

async function fetchConnectors() {
  isLoading.value = true
  try {
    connectors.value = await dbConnectorService.list()
    loadError.value = null
  } catch (err: any) {
    loadError.value = err.response?.data?.detail || 'Failed to load database connectors'
  } finally {
    isLoading.value = false
  }
}

async function discover() {
  isDiscovering.value = true
  discoverError.value = null
  try {
    const result = editingConnector.value
      ? await dbConnectorService.test(editingConnector.value.id)
      : await dbConnectorService.discover({ ...form })
    if (!result.ok) {
      discoverError.value = result.error || 'Connection failed'
      discoveredTables.value = null
    } else {
      discoveredTables.value = result.tables
      toast.success(`Connected — ${result.tables.length} tables discovered`)
    }
  } catch (err: any) {
    discoverError.value = err.response?.data?.detail || 'Connection failed'
  } finally {
    isDiscovering.value = false
  }
}

function toggleTable(table: DbConnectorTable, checked: boolean) {
  const next = new Set(selectedTables.value)
  if (checked) next.add(tableKey(table))
  else next.delete(tableKey(table))
  selectedTables.value = next
}

function toggleMask(columnName: string, masked: boolean) {
  const next = new Set(maskedColumns.value)
  if (masked) next.add(columnName.toLowerCase())
  else next.delete(columnName.toLowerCase())
  maskedColumns.value = next
}

async function saveConnector() {
  if (!selectedTables.value.size) {
    toast.error('Select at least one table — nothing is queryable otherwise')
    return
  }
  isSaving.value = true
  try {
    const policy = {
      allowed_tables: [...selectedTables.value],
      masked_columns: [...maskedColumns.value],
      max_rows: form.max_rows,
    }
    if (editingConnector.value) {
      await dbConnectorService.update(editingConnector.value.id, policy)
      toast.success('Connector updated')
    } else {
      await dbConnectorService.create({ ...form, enabled: true, ...policy })
      toast.success('Database connector created')
    }
    showForm.value = false
    editingConnector.value = null
    resetPicker()
    await fetchConnectors()
  } catch (err: any) {
    toast.error(err.response?.data?.detail || 'Failed to save the connector')
  } finally {
    isSaving.value = false
  }
}

async function editTables(connector: DbConnector) {
  editingConnector.value = connector
  form.max_rows = connector.max_rows
  resetPicker()
  selectedTables.value = new Set((connector.allowed_tables || []).map((t) => t.toLowerCase()))
  maskedColumns.value = new Set((connector.masked_columns || []).map((c) => c.toLowerCase()))
  showForm.value = true
  await discover()
}

async function toggleEnabled(connector: DbConnector, enabled: boolean) {
  try {
    await dbConnectorService.update(connector.id, { enabled })
    await fetchConnectors()
  } catch (err: any) {
    toast.error(err.response?.data?.detail || 'Failed to update the connector')
  }
}

async function removeConnector(connector: DbConnector) {
  if (!confirm(`Delete connector "${connector.name}"? The AI loses this database access.`)) return
  try {
    await dbConnectorService.remove(connector.id)
    await fetchConnectors()
    toast.success('Connector deleted')
  } catch (err: any) {
    toast.error(err.response?.data?.detail || 'Failed to delete the connector')
  }
}

onMounted(fetchConnectors)
</script>

<template>
  <div class="db-connectors">
    <div v-if="isLoading" class="state-note">Loading…</div>
    <div v-else-if="loadError" class="state-note">{{ loadError }}</div>

    <template v-else>
      <div v-if="connectors.length" class="connector-list">
        <div v-for="connector in connectors" :key="connector.id" class="connector-card">
          <div class="connector-main">
            <div class="connector-name">
              {{ connector.name }}
              <span class="engine-tag mono">{{ connector.engine }}</span>
              <span
                v-if="connector.last_test_ok != null"
                class="test-tag mono"
                :class="{ ok: connector.last_test_ok }"
              >
                {{ connector.last_test_ok ? 'connected' : 'connection failed' }}
              </span>
            </div>
            <div class="connector-sub mono">
              {{ connector.username }}@{{ connector.host }}:{{ connector.port }}/{{ connector.database }}
              · {{ (connector.allowed_tables || []).length }} tables allowed
              · {{ (connector.masked_columns || []).length }} masked columns
            </div>
          </div>
          <label class="enable-toggle">
            <input
              type="checkbox"
              :checked="connector.enabled"
              @change="toggleEnabled(connector, ($event.target as HTMLInputElement).checked)"
            />
            Active
          </label>
          <button class="small-btn" @click="editTables(connector)">Edit tables</button>
          <button class="small-btn danger" @click="removeConnector(connector)">Delete</button>
        </div>
      </div>

      <button v-if="!showForm" class="add-connector" @click="openCreateForm">
        ＋ Connect a database
      </button>

      <div v-if="showForm" class="create-form">
        <template v-if="!editingConnector">
          <div class="form-grid">
            <label class="form-field">
              <span class="field-label">Name</span>
              <input v-model="form.name" class="field-input" placeholder="Production replica" />
            </label>
            <label class="form-field">
              <span class="field-label">Engine</span>
              <select
                v-model="form.engine"
                class="field-input"
                @change="form.port = form.engine === 'mysql' ? 3306 : 5432"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
            </label>
            <label class="form-field">
              <span class="field-label">Host</span>
              <input v-model="form.host" class="field-input mono" placeholder="db-replica.internal" />
            </label>
            <label class="form-field">
              <span class="field-label">Port</span>
              <input v-model.number="form.port" type="number" class="field-input mono" />
            </label>
            <label class="form-field">
              <span class="field-label">Database</span>
              <input v-model="form.database" class="field-input mono" />
            </label>
            <label class="form-field">
              <span class="field-label">Username</span>
              <input v-model="form.username" class="field-input mono" placeholder="readonly_user" />
            </label>
            <label class="form-field">
              <span class="field-label">Password</span>
              <input v-model="form.password" type="password" class="field-input mono" />
            </label>
            <label class="form-field">
              <span class="field-label">Max rows per query</span>
              <input v-model.number="form.max_rows" type="number" min="1" max="1000" class="field-input mono" />
            </label>
          </div>
          <p class="tip-note">
            Tip: use a read-only replica and a database user with SELECT-only grants — a second
            fence beneath ChatterMate's own guardrails.
          </p>
        </template>
        <div v-else class="editing-note">
          Editing table access for <strong>{{ editingConnector.name }}</strong>
        </div>

        <div class="discover-row">
          <button
            class="small-btn"
            :disabled="isDiscovering"
            @click="discover"
          >
            {{ isDiscovering ? 'Connecting…' : discoveredTables ? 'Re-test connection' : 'Test connection' }}
          </button>
          <span v-if="discoveredTables" class="discover-result">
            ✓ {{ discoveredTables.length }} tables discovered — select what the AI may query
          </span>
          <span v-else-if="discoverError" class="discover-error">{{ discoverError }}</span>
        </div>

        <!-- ALLOWLIST TREE -->
        <div v-if="discoveredTables" class="table-tree">
          <div v-for="(tables, schema) in tablesBySchema" :key="schema" class="schema-group">
            <div class="schema-label mono">{{ schema }}</div>
            <div v-for="table in tables" :key="tableKey(table)" class="table-row-wrap">
              <div class="table-row">
                <label class="table-check">
                  <input
                    type="checkbox"
                    :checked="selectedTables.has(tableKey(table))"
                    @change="toggleTable(table, ($event.target as HTMLInputElement).checked)"
                  />
                  <span class="table-name mono">{{ table.table }}</span>
                  <span class="col-count">{{ table.columns.length }} cols</span>
                </label>
                <button
                  v-if="selectedTables.has(tableKey(table))"
                  class="mask-toggle"
                  @click="expandedTable = expandedTable === tableKey(table) ? null : tableKey(table)"
                >
                  {{ expandedTable === tableKey(table) ? 'Hide columns' : 'Column masking' }}
                </button>
              </div>
              <div v-if="expandedTable === tableKey(table)" class="column-list">
                <div v-for="column in table.columns" :key="column.name" class="column-row">
                  <span class="column-name mono">{{ column.name }}</span>
                  <span class="column-type">{{ column.type }}</span>
                  <button
                    class="mask-pill"
                    :class="{ masked: maskedColumns.has(column.name.toLowerCase()) }"
                    @click="toggleMask(column.name, !maskedColumns.has(column.name.toLowerCase()))"
                  >
                    {{ maskedColumns.has(column.name.toLowerCase()) ? 'Masked' : 'Visible' }}
                  </button>
                </div>
                <p class="mask-hint">
                  Masked columns are hidden before the AI ever sees them — queries referencing
                  them are rejected outright. Masking applies by column name across this connector.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="cancel-btn" @click="showForm = false; editingConnector = null">Cancel</button>
          <button
            v-if="discoveredTables"
            class="save-btn"
            :disabled="isSaving"
            @click="saveConnector"
          >
            {{ isSaving ? 'Saving…' : editingConnector ? 'Save changes' : 'Save connector' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.db-connectors {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.state-note {
  font-size: 12.5px;
  color: var(--muted);
  padding: 12px 14px;
  background: var(--surface);
  border: 1px solid var(--o07);
  border-radius: 11px;
}
.connector-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.connector-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 12px;
}
.connector-main {
  flex: 1;
  min-width: 0;
}
.connector-name {
  font-size: 13.5px;
  font-weight: var(--font-weight-semibold);
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.engine-tag {
  font-size: 9.5px;
  color: var(--c-teal);
  background: var(--teal-bg-10);
  padding: 1px 7px;
  border-radius: 6px;
  text-transform: uppercase;
}
.test-tag {
  font-size: 9.5px;
  color: var(--c-danger);
  background: color-mix(in srgb, var(--c-danger) 10%, transparent);
  padding: 1px 7px;
  border-radius: 6px;
}
.test-tag.ok {
  color: var(--c-positive);
  background: color-mix(in srgb, var(--c-positive) 10%, transparent);
}
.connector-sub {
  margin-top: 3px;
  font-size: 10.5px;
  color: var(--faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mono {
  font-family: var(--font-mono);
}
.enable-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text3);
  cursor: pointer;
  flex-shrink: 0;
}
.small-btn {
  padding: 6px 12px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--text);
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
}
.small-btn.danger {
  color: var(--c-danger);
  border-color: color-mix(in srgb, var(--c-danger) 35%, transparent);
}
.small-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.add-connector {
  align-self: flex-start;
  padding: 9px 16px;
  background: transparent;
  border: 1.5px dashed var(--o14);
  color: var(--muted);
  border-radius: 11px;
  font-size: 13px;
  cursor: pointer;
}
.add-connector:hover {
  border-color: var(--accent-ink);
  color: var(--text);
}
.create-form {
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 13px;
  padding: 16px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field-label {
  font-size: 11px;
  color: var(--faint);
}
.field-input {
  padding: 8px 11px;
  background: var(--bg2);
  border: 1px solid var(--o10);
  border-radius: 9px;
  color: var(--text);
  font-size: 12.5px;
  outline: none;
}
.tip-note {
  margin: 12px 0 0;
  font-size: 11.5px;
  color: var(--muted);
  line-height: 1.5;
}
.editing-note {
  font-size: 13px;
  color: var(--text3);
}
.discover-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 13px;
  flex-wrap: wrap;
}
.discover-result {
  font-size: 12px;
  color: var(--c-positive);
}
.discover-error {
  font-size: 12px;
  color: var(--c-danger);
}
.table-tree {
  margin-top: 13px;
  border: 1px solid var(--o07);
  border-radius: 11px;
  max-height: 420px;
  overflow-y: auto;
}
.schema-group {
  padding: 6px 0;
}
.schema-label {
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--faint);
  padding: 6px 14px 4px;
}
.table-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 14px;
}
.table-row:hover {
  background: var(--o03);
}
.table-check {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  min-width: 0;
}
.table-name {
  font-size: 12px;
  color: var(--text);
}
.col-count {
  font-size: 10.5px;
  color: var(--faint);
}
.mask-toggle {
  font-size: 11px;
  color: var(--accent-ink);
  background: var(--accent-bg-08);
  border: none;
  padding: 3px 9px;
  border-radius: 7px;
  cursor: pointer;
  flex-shrink: 0;
}
.column-list {
  margin: 4px 14px 10px 34px;
  border-left: 2px solid var(--o07);
  padding-left: 12px;
}
.column-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 3px 0;
}
.column-name {
  font-size: 11.5px;
  color: var(--text3);
  min-width: 140px;
}
.column-type {
  font-size: 10.5px;
  color: var(--faint);
  flex: 1;
}
.mask-pill {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 9px;
  border-radius: 20px;
  border: 1px solid var(--o10);
  background: transparent;
  color: var(--muted2);
  cursor: pointer;
}
.mask-pill.masked {
  color: var(--c-warn);
  border-color: var(--c-warn);
  background: color-mix(in srgb, var(--c-warn) 10%, transparent);
}
.mask-hint {
  margin: 8px 0 0;
  font-size: 10.5px;
  color: var(--faint);
  line-height: 1.5;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 14px;
}
.cancel-btn {
  padding: 8px 14px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  border-radius: 9px;
  font-size: 12.5px;
  cursor: pointer;
}
.save-btn {
  padding: 8px 17px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
.save-btn:disabled {
  opacity: 0.5;
}
@media (max-width: 700px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .connector-card {
    flex-wrap: wrap;
  }
}
</style>
