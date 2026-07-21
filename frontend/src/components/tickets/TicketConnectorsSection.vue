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
import { onMounted, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { mcpService } from '@/services/mcp'
import type { MCPTool, MCPTransportType } from '@/types/mcp'
import grafanaLogo from '@/assets/grafana-logo.svg'
import elasticsearchLogo from '@/assets/elasticsearch-logo.svg'
import sentryLogo from '@/assets/sentry-logo.svg'
import cloudwatchLogo from '@/assets/cloudwatch-logo.svg'

const props = defineProps<{ selectedIds: number[] }>()
const emit = defineEmits<{ (e: 'update:selected-ids', ids: number[]): void }>()

const connectors = ref<MCPTool[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isCreating = ref(false)
const showForm = ref(false)

// One-click starting points for the common observability platforms. All
// values are placeholders the user edits — any other platform with an MCP
// server works through the Custom tile.
const PRESETS = [
  {
    key: 'grafana',
    name: 'Grafana',
    logo: grafanaLogo,
    desc: 'Loki, Prometheus, Elastic & CloudWatch via your Grafana data sources',
    transport: 'http' as MCPTransportType,
    url: 'http://your-mcp-grafana-host:8000/mcp',
    envLines: '',
    headerLines: 'Authorization=Bearer <grafana-service-account-token>',
    command: '',
    args: '',
  },
  {
    key: 'elasticsearch',
    name: 'Elasticsearch',
    logo: elasticsearchLogo,
    desc: 'Query indices, mappings and logs directly',
    transport: 'stdio' as MCPTransportType,
    url: '',
    headerLines: '',
    command: 'npx',
    args: '-y @elastic/mcp-server-elasticsearch',
    envLines: 'ES_URL=https://your-cluster.es.example:9243\nES_API_KEY=<api-key>',
  },
  {
    key: 'sentry',
    name: 'Sentry',
    logo: sentryLogo,
    desc: 'Errors, issues and traces',
    transport: 'http' as MCPTransportType,
    url: 'https://mcp.sentry.dev/mcp',
    headerLines: 'Authorization=Bearer <sentry-token>',
    command: '',
    args: '',
    envLines: '',
  },
  {
    key: 'cloudwatch',
    name: 'CloudWatch',
    logo: cloudwatchLogo,
    desc: 'AWS logs, metrics and alarms',
    transport: 'stdio' as MCPTransportType,
    url: '',
    headerLines: '',
    command: 'uvx',
    args: 'awslabs.cloudwatch-mcp-server@latest',
    envLines: 'AWS_ACCESS_KEY_ID=<key>\nAWS_SECRET_ACCESS_KEY=<secret>\nAWS_REGION=us-east-1',
  },
]

const form = reactive({
  name: '',
  description: '',
  transport: 'http' as MCPTransportType,
  url: '',
  headerLines: '',
  command: '',
  args: '',
  envLines: '',
})

function applyPreset(preset: (typeof PRESETS)[0] | null) {
  Object.assign(form, {
    name: preset?.name || '',
    description: preset?.desc || '',
    transport: preset?.transport || 'http',
    url: preset?.url || '',
    headerLines: preset?.headerLines || '',
    command: preset?.command || '',
    args: preset?.args || '',
    envLines: preset?.envLines || '',
  })
  showForm.value = true
}

/** "KEY=value" lines -> record. Lines without '=' are ignored. */
function parseLines(lines: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of lines.split('\n')) {
    const idx = line.indexOf('=')
    if (idx > 0) result[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return result
}

async function fetchConnectors() {
  isLoading.value = true
  try {
    connectors.value = await mcpService.getOrganizationMCPTools(false)
    loadError.value = null
  } catch (err: any) {
    loadError.value =
      err.response?.data?.detail || 'Failed to load connectors — MCP tools may not be available on your plan.'
  } finally {
    isLoading.value = false
  }
}

async function createConnector() {
  if (!form.name.trim()) return
  isCreating.value = true
  try {
    const isRemote = form.transport !== 'stdio'
    const created = await mcpService.createMCPTool({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      transport_type: form.transport,
      enabled: true,
      url: isRemote ? form.url.trim() : undefined,
      headers: isRemote ? parseLines(form.headerLines) : undefined,
      command: !isRemote ? form.command.trim() : undefined,
      args: !isRemote ? form.args.trim().split(/\s+/).filter(Boolean) : undefined,
      env_vars: !isRemote ? parseLines(form.envLines) : undefined,
    })
    await fetchConnectors()
    // New investigation connectors are opted in immediately.
    emit('update:selected-ids', [...props.selectedIds, created.id])
    showForm.value = false
    toast.success(`${created.name} connected`)
  } catch (err: any) {
    toast.error(err.response?.data?.detail || 'Failed to create the connector')
  } finally {
    isCreating.value = false
  }
}

function toggleSelected(id: number, checked: boolean) {
  const next = checked
    ? [...props.selectedIds, id]
    : props.selectedIds.filter((existing) => existing !== id)
  emit('update:selected-ids', next)
}

onMounted(fetchConnectors)
</script>

<template>
  <div class="connectors">
    <div class="preset-grid">
      <button
        v-for="preset in PRESETS"
        :key="preset.key"
        class="preset-tile"
        @click="applyPreset(preset)"
      >
        <img :src="preset.logo" :alt="`${preset.name} logo`" class="preset-logo" />
        <span class="preset-name">{{ preset.name }}</span>
        <span class="preset-desc">{{ preset.desc }}</span>
      </button>
      <button class="preset-tile custom" @click="applyPreset(null)">
        <span class="preset-icon"><font-awesome-icon :icon="['fas', 'plus']" /></span>
        <span class="preset-name">Add MCP connector</span>
        <span class="preset-desc">Any platform with an MCP server — Splunk, Datadog, New Relic, your own</span>
      </button>
    </div>

    <div v-if="showForm" class="create-form">
      <div class="form-grid">
        <label class="form-field">
          <span class="field-label">Name</span>
          <input v-model="form.name" class="field-input" placeholder="Grafana production" />
        </label>
        <label class="form-field">
          <span class="field-label">Transport</span>
          <select v-model="form.transport" class="field-input">
            <option value="http">HTTP (streamable)</option>
            <option value="sse">SSE</option>
            <option value="stdio">STDIO (local command)</option>
          </select>
        </label>
        <template v-if="form.transport !== 'stdio'">
          <label class="form-field wide">
            <span class="field-label">Server URL</span>
            <input v-model="form.url" class="field-input mono" placeholder="https://host/mcp" />
          </label>
          <label class="form-field wide">
            <span class="field-label">Headers (one per line, KEY=value)</span>
            <textarea v-model="form.headerLines" class="field-input mono" rows="2"></textarea>
          </label>
        </template>
        <template v-else>
          <label class="form-field">
            <span class="field-label">Command</span>
            <input v-model="form.command" class="field-input mono" placeholder="npx" />
          </label>
          <label class="form-field">
            <span class="field-label">Arguments</span>
            <input v-model="form.args" class="field-input mono" placeholder="-y @elastic/mcp-server-elasticsearch" />
          </label>
          <label class="form-field wide">
            <span class="field-label">Environment (one per line, KEY=value)</span>
            <textarea v-model="form.envLines" class="field-input mono" rows="3"></textarea>
          </label>
        </template>
      </div>
      <div class="form-actions">
        <button class="cancel-btn" @click="showForm = false">Cancel</button>
        <button class="connect-btn" :disabled="isCreating || !form.name.trim()" @click="createConnector">
          {{ isCreating ? 'Connecting…' : 'Connect' }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="state-note">Loading connectors…</div>
    <div v-else-if="loadError" class="state-note">{{ loadError }}</div>
    <div v-else-if="connectors.length" class="connector-list">
      <label v-for="connector in connectors" :key="connector.id" class="connector-row">
        <input
          type="checkbox"
          :checked="selectedIds.includes(connector.id)"
          :disabled="!connector.enabled"
          @change="toggleSelected(connector.id, ($event.target as HTMLInputElement).checked)"
        />
        <div class="connector-info">
          <div class="connector-name">
            {{ connector.name }}
            <span class="transport-tag mono">{{ connector.transport_type }}</span>
            <span v-if="!connector.enabled" class="disabled-tag mono">disabled</span>
          </div>
          <div class="connector-sub mono">
            {{ connector.url || [connector.command, ...(connector.args || [])].join(' ') }}
          </div>
        </div>
        <span class="use-label">Use in investigations</span>
      </label>
    </div>
    <div v-else class="state-note">
      No connectors yet — connect one above so the AI can gather evidence from your logs and metrics.
    </div>

    <div class="lock-note">
      <font-awesome-icon :icon="['fas', 'lock']" />
      Read-only — connectors attach to the <strong>investigation agent only</strong>, never the
      customer-facing chat agent.
    </div>
  </div>
</template>

<style scoped>
.connectors {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
}
.preset-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 13px 14px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s;
}
.preset-tile:hover {
  border-color: var(--accent-ink);
}
.preset-tile.custom {
  border-style: dashed;
}
.preset-logo {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.preset-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  font-size: 16px;
  color: var(--muted);
}
.preset-name {
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  font-size: 13px;
  color: var(--text);
}
.preset-desc {
  font-size: 10.5px;
  line-height: 1.4;
  color: var(--faint);
}
.create-form {
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 13px;
  padding: 15px 16px;
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
.form-field.wide {
  grid-column: 1 / -1;
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
  resize: vertical;
}
.mono {
  font-family: var(--font-mono);
  font-size: 11.5px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 12px;
}
.cancel-btn {
  padding: 7px 13px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  border-radius: 9px;
  font-size: 12.5px;
  cursor: pointer;
}
.connect-btn {
  padding: 7px 16px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
.connect-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
.connector-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 11px;
  cursor: pointer;
}
.connector-info {
  flex: 1;
  min-width: 0;
}
.connector-name {
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}
.transport-tag {
  font-size: 9.5px;
  color: var(--c-teal);
  background: var(--teal-bg-10);
  padding: 1px 7px;
  border-radius: 6px;
  text-transform: uppercase;
}
.disabled-tag {
  font-size: 9.5px;
  color: var(--faint);
  background: var(--o05);
  padding: 1px 7px;
  border-radius: 6px;
}
.connector-sub {
  font-size: 10.5px;
  color: var(--faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}
.use-label {
  font-size: 11px;
  color: var(--muted2);
  flex-shrink: 0;
}
.lock-note {
  font-size: 11.5px;
  color: var(--muted);
  line-height: 1.5;
}
</style>
