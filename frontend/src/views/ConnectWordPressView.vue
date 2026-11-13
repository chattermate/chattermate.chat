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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { widgetService } from '@/services/widget'
import { allowsHost, buildReturnUrl, parseConnectRequest } from '@/utils/wordpressConnect'

/** GET /widgets answers with each widget's agent (and no name), unlike the Widget type. */
interface WidgetWithAgent {
  id: string
  agent?: { name: string; display_name?: string | null } | null
}

const route = useRoute()
const request = computed(() => parseConnectRequest(route.query as Record<string, unknown>))

const widgets = ref<WidgetWithAgent[]>([])
const selectedId = ref('')
const loading = ref(true)
const loadError = ref('')
const allowedDomains = ref<string[] | null>(null)
// Off until the admin ticks it: a link anyone can craft must not widen where a widget runs.
const addDomain = ref(false)
const connecting = ref(false)
const connectError = ref('')

const siteHost = computed(() => request.value?.siteHost ?? '')
const needsDomain = computed(() => allowedDomains.value !== null && !allowsHost(allowedDomains.value, siteHost.value))

function agentName(widget: WidgetWithAgent): string {
  return widget.agent?.display_name || widget.agent?.name || 'Unnamed agent'
}

/** Tells apart two widgets of the same agent, as the agent's Widget tab shows the ID. */
function widgetLabel(widget: WidgetWithAgent): string {
  return `Widget ${widget.id.slice(0, 8)}`
}

async function loadWidgets() {
  loading.value = true
  loadError.value = ''
  try {
    widgets.value = (await widgetService.getWidgets()) as unknown as WidgetWithAgent[]
    selectedId.value = widgets.value[0]?.id ?? ''
  } catch {
    loadError.value = "We couldn't load your agents. Refresh the page to try again."
  } finally {
    loading.value = false
  }
}

// A widget limited to certain sites must also allow the WordPress site, or the
// chat would be refused there after connecting.
watch(selectedId, async (id) => {
  allowedDomains.value = null
  addDomain.value = false
  if (!id) return
  try {
    const domains = await widgetService.getAllowedDomains(id)
    if (id === selectedId.value) allowedDomains.value = domains
  } catch {
    // Not readable with this role: connecting still works, the list stays as it is
  }
})

async function connect() {
  if (!request.value || !selectedId.value) return
  connecting.value = true
  connectError.value = ''
  try {
    if (needsDomain.value && addDomain.value && allowedDomains.value) {
      await widgetService.setAllowedDomains(selectedId.value, [...allowedDomains.value, siteHost.value])
    }
    window.location.assign(buildReturnUrl(request.value, { widgetId: selectedId.value }))
  } catch {
    connecting.value = false
    connectError.value = `We couldn't add ${siteHost.value} to this widget's sites. Add it on the agent's Widget tab, or connect without it.`
  }
}

function cancel() {
  if (request.value) window.location.assign(buildReturnUrl(request.value, { error: 'cancelled' }))
}

onMounted(() => {
  if (request.value) loadWidgets()
  else loading.value = false
})
</script>

<template>
  <main class="connect-page">
    <section class="connect-card" aria-labelledby="connect-title">
      <p class="connect-eyebrow">WordPress</p>

      <template v-if="!request">
        <h1 id="connect-title">This link isn't complete</h1>
        <p class="connect-lead">
          Open ChatterMate in your WordPress admin and click <strong>Connect with ChatterMate</strong> again.
        </p>
        <router-link class="connect-button connect-button--secondary" to="/">Go to the dashboard</router-link>
      </template>

      <template v-else>
        <h1 id="connect-title">Connect {{ request.siteName }}</h1>
        <p class="connect-lead">
          Choose the AI agent that answers on <strong>{{ siteHost }}</strong>. We send its Widget ID back to your WordPress
          admin at <strong>{{ request.returnUrl.host }}</strong>.
        </p>

        <p v-if="loading" class="connect-muted" role="status">Loading your agents…</p>
        <p v-else-if="loadError" class="connect-error" role="alert">{{ loadError }}</p>

        <template v-else-if="!widgets.length">
          <p class="connect-lead">You don't have an AI agent with a widget yet. Create one, then come back to this page.</p>
          <router-link class="connect-button" to="/ai-agents">Create an AI agent</router-link>
        </template>

        <template v-else>
          <fieldset class="connect-agents">
            <legend>AI agent</legend>
            <label v-for="widget in widgets" :key="widget.id" class="connect-agent">
              <input v-model="selectedId" type="radio" name="widget" :value="widget.id" />
              <span>
                <strong>{{ agentName(widget) }}</strong>
                <span class="connect-muted">{{ widgetLabel(widget) }}</span>
              </span>
            </label>
          </fieldset>

          <label v-if="needsDomain" class="connect-domain">
            <input v-model="addDomain" type="checkbox" />
            <span>
              Also allow <strong>{{ siteHost }}</strong>. This widget only runs on the sites in its list, so without it the
              chat won't load there. Tick this only if {{ siteHost }} is your site.
            </span>
          </label>

          <p v-if="connectError" class="connect-error" role="alert">{{ connectError }}</p>

          <div class="connect-actions">
            <button type="button" class="connect-button" :disabled="connecting || !selectedId" @click="connect">
              {{ connecting ? 'Connecting…' : 'Connect' }}
            </button>
            <button type="button" class="connect-button connect-button--secondary" :disabled="connecting" @click="cancel">
              Cancel
            </button>
          </div>
        </template>
      </template>
    </section>
  </main>
</template>

<style scoped>
.connect-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: var(--background-base);
  color: var(--text-primary);
  font-family: var(--font-sans);
  box-sizing: border-box;
}

.connect-card {
  width: 100%;
  max-width: 520px;
  padding: var(--space-xl);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card-lg);
  background: var(--surface);
  box-shadow: var(--shadow-md);
  box-sizing: border-box;
}

.connect-eyebrow {
  margin: 0 0 var(--space-xs);
  color: var(--text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

h1 {
  margin: 0 0 var(--space-sm);
  color: var(--text-heading);
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  letter-spacing: var(--tracking-tight);
}

.connect-lead {
  margin: 0 0 var(--space-lg);
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: 1.5;
}

.connect-muted {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.connect-error {
  margin: 0 0 var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--error-bg);
  color: var(--error-color);
  font-size: var(--text-sm);
}

.connect-agents {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin: 0 0 var(--space-lg);
  padding: 0;
  border: 0;
}

.connect-agents legend {
  margin-bottom: var(--space-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.connect-agent {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-input);
  cursor: pointer;
}

.connect-agent:has(input:checked) {
  border-color: var(--accent-border);
  background: var(--accent-bg-06);
}

.connect-agent > span {
  display: flex;
  flex-direction: column;
}

.connect-domain {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin: 0 0 var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--warning-border);
  border-radius: var(--radius-md);
  background: var(--warning-bg);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.connect-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.connect-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 var(--space-lg);
  border: 1px solid transparent;
  border-radius: var(--radius-btn);
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  font: inherit;
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  cursor: pointer;
}

.connect-button--secondary {
  border-color: var(--border-color);
  background: transparent;
  color: var(--text-primary);
}

.connect-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.connect-button:focus-visible,
.connect-agent:focus-within,
.connect-domain:focus-within {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
