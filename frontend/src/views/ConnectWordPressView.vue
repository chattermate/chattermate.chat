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
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { allowsHost, buildReturnUrl, parseConnectRequest, returnsToTheSite } from '@/utils/wordpressConnect'
import { agentWithoutWidget, createSiteWidget, siteAgentName } from '@/utils/siteAgent'
import type { Agent } from '@/types/agent'
import BrandMark from '@/components/common/BrandMark.vue'
import wordpressLogo from '@/assets/wordpress-logo.svg'

// The WordPress mark is drawn in the heading colour (a mask), so it reads in both themes
const wordpressMask = { '--wp-logo': `url("${wordpressLogo}")` }

/** GET /widgets answers with each widget's agent (and no name), unlike the Widget type. */
interface WidgetWithAgent {
  id: string
  agent?: { name: string; display_name?: string | null } | null
}

const route = useRoute()
const request = computed(() => parseConnectRequest(route.query as Record<string, unknown>))

// Teaching the agent the site (hosted builds) is part of every connect, not a
// choice: the same link gives the agent the store's tools. Open source has none.
const { enterpriseComponent, hasEnterpriseModule, loadModule, moduleImports } = useEnterpriseFeatures()
const LearnOption = enterpriseComponent(moduleImports.wordpressLearnOption)

const widgets = ref<WidgetWithAgent[]>([])
const selectedId = ref('')
const loading = ref(true)
const loadError = ref('')
const allowedDomains = ref<string[] | null>(null)
// Off until the admin ticks it: a link anyone can craft must not widen where a widget runs.
const addDomain = ref(false)
const connecting = ref(false)
const connectError = ref('')
// A new account (from the plugin's "Get started"): no agent yet, so one is made here
const creating = ref(false)
const needsAiProvider = ref(false)
// An agent the account already has, without a widget: it is the one set up here
const existingAgent = ref<Agent | null>(null)

const siteHost = computed(() => request.value?.siteHost ?? '')
// What a new account's agent is called: the site's own name
const newAgentName = computed(() => (request.value ? siteAgentName(request.value.siteName, siteHost.value) : ''))
const existingAgentName = computed(() => existingAgent.value?.display_name || existingAgent.value?.name || '')
const busy = computed(() => creating.value || connecting.value)
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
    // No widget yet: name the agent this page would set up, so it says which
    if (!widgets.value.length) existingAgent.value = await agentWithoutWidget()
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

/** The token the plugin claims to teach the agent the site; null where it isn't offered. */
async function learnToken(widgetId: string): Promise<string | null> {
  const req = request.value
  if (!req?.siteUrl || !returnsToTheSite(req)) return null
  const sites = (await loadModule(moduleImports.wordpressSites))?.wordpressSites
  return sites ? sites.connectToken(widgetId, req.siteUrl, req.returnUrl.toString()) : null
}

async function connect() {
  if (!request.value || !selectedId.value) return
  connecting.value = true
  connectError.value = ''
  try {
    if (needsDomain.value && addDomain.value && allowedDomains.value) {
      await widgetService.setAllowedDomains(selectedId.value, [...allowedDomains.value, siteHost.value])
    }
  } catch {
    connecting.value = false
    connectError.value = `We couldn't add ${siteHost.value} to this widget's sites. Add it on the agent's Widget tab, or connect without it.`
    return
  }
  let connectToken: string | null
  try {
    connectToken = await learnToken(selectedId.value)
  } catch (err) {
    connecting.value = false
    // Learning is part of connecting, so say what would get past it: a missing
    // permission won't change by trying again
    connectError.value = (err as { response?: { status?: number } })?.response?.status === 403
      ? `Connecting ${siteHost.value} teaches your AI the site, which needs permission to manage knowledge. Ask an admin to connect it, or to give you that permission.`
      : `We couldn't set up learning for ${siteHost.value}. Please try again in a moment.`
    return
  }
  window.location.assign(buildReturnUrl(request.value, { widgetId: selectedId.value, connectToken }))
}

/** No widget yet: make an agent for this site, then connect it as usual. */
async function createAndConnect() {
  if (!request.value) return
  creating.value = true
  connectError.value = ''
  needsAiProvider.value = false
  try {
    const widget = await createSiteWidget(newAgentName.value, hasEnterpriseModule, existingAgent.value)
    if (!widget) {
      needsAiProvider.value = true
      return
    }
    widgets.value = [widget]
    selectedId.value = widget.id
  } catch {
    connectError.value = "We couldn't create your AI agent. Try again, or create one from the dashboard."
    return
  } finally {
    creating.value = false
  }
  await connect()
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
      <div class="connect-link" aria-hidden="true">
        <span class="connect-link__tile"><BrandMark :size="40" /></span>
        <span class="connect-link__line">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
          </svg>
        </span>
        <span class="connect-link__tile"><span class="connect-link__wp" :style="wordpressMask"></span></span>
      </div>

      <template v-if="!request">
        <h1 id="connect-title">This link isn't complete</h1>
        <p class="connect-lead">
          Open ChatterMate in your WordPress admin and click <strong>Connect with ChatterMate</strong> again.
        </p>
        <router-link class="connect-button connect-button--secondary" to="/">Go to the dashboard</router-link>
      </template>

      <template v-else>
        <h1 id="connect-title">Connect {{ request.siteName }}</h1>
        <p class="connect-site">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
          {{ siteHost }}
        </p>

        <p v-if="loading" class="connect-muted" role="status">Loading your agents…</p>
        <p v-else-if="loadError" class="connect-error" role="alert">{{ loadError }}</p>

        <template v-else-if="!widgets.length">
          <p v-if="existingAgent" class="connect-lead">Your AI agent isn't on a site yet. One click sets it up here:</p>
          <p v-else class="connect-lead">You don't have an AI agent yet. One click sets it up:</p>
          <ul class="connect-plan">
            <li>
              <span class="connect-plan__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M9 14h.01M15 14h.01" /></svg>
              </span>
              <span>
                <template v-if="existingAgent">
                  <strong>{{ existingAgentName }}, your AI agent</strong>
                  <span class="connect-muted">It answers here with the instructions you gave it.</span>
                </template>
                <template v-else>
                  <strong>An AI agent called {{ newAgentName }}</strong>
                  <span class="connect-muted">It answers your visitors and hands over to your team.</span>
                </template>
              </span>
            </li>
            <li>
              <span class="connect-plan__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg>
              </span>
              <span>
                <strong>The chat on every page of {{ siteHost }}</strong>
                <span class="connect-muted">Choose where it shows from your WordPress admin.</span>
              </span>
            </li>
          </ul>
          <component
            :is="LearnOption"
            v-if="returnsToTheSite(request)"
            :site-host="siteHost"
            :store="request.store"
          />
          <p v-if="needsAiProvider" class="connect-error" role="alert">
            Your agent needs an AI model first.
            <router-link to="/settings/ai-config">Add your AI provider</router-link>, then come back to this page.
          </p>
          <p v-if="connectError" class="connect-error" role="alert">{{ connectError }}</p>

          <div class="connect-actions">
            <button type="button" class="connect-button connect-button--wide" :disabled="busy" @click="createAndConnect">
              <span v-if="busy" class="connect-spinner" aria-hidden="true"></span>
              {{ busy ? 'Setting up…' : existingAgent ? 'Connect my AI agent' : 'Create my AI agent and connect' }}
            </button>
            <button type="button" class="connect-quiet" :disabled="busy" @click="cancel">Cancel</button>
          </div>
        </template>

        <template v-else>
          <fieldset class="connect-agents">
            <legend>Choose the AI agent that answers on {{ siteHost }}</legend>
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

          <component
            :is="LearnOption"
            v-if="returnsToTheSite(request)"
            :site-host="siteHost"
            :store="request.store"
          />
          <p v-if="connectError" class="connect-error" role="alert">{{ connectError }}</p>

          <div class="connect-actions">
            <button type="button" class="connect-button connect-button--wide" :disabled="connecting || !selectedId" @click="connect">
              <span v-if="connecting" class="connect-spinner" aria-hidden="true"></span>
              {{ connecting ? 'Connecting…' : 'Connect' }}
            </button>
            <button type="button" class="connect-quiet" :disabled="connecting" @click="cancel">Cancel</button>
          </div>
        </template>

        <p class="connect-foot">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          You'll go back to your WordPress admin at {{ request.returnUrl.host }}.
        </p>
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
  background:
    radial-gradient(60% 50% at 50% 0%, var(--accent-bg-06), transparent 70%),
    var(--background-base);
  color: var(--text-primary);
  font-family: var(--font-sans);
  box-sizing: border-box;
}

.connect-card {
  width: 100%;
  max-width: 480px;
  padding: var(--space-xl);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card-lg);
  background: var(--surface);
  box-shadow: var(--shadow-md);
  box-sizing: border-box;
  text-align: left;
}

/* ChatterMate <-> WordPress */
.connect-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin: 0 0 var(--space-lg);
}

.connect-link__tile {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--background-soft);
}

/* The WordPress mark in the heading colour, so it reads in both themes */
.connect-link__wp {
  width: 28px;
  height: 28px;
  background: var(--text-heading);
  -webkit-mask: var(--wp-logo) center / contain no-repeat;
  mask: var(--wp-logo) center / contain no-repeat;
}

.connect-link__line {
  position: relative;
  display: grid;
  place-items: center;
  width: 64px;
  color: var(--text-muted);
}

.connect-link__line::before {
  content: '';
  position: absolute;
  inset: 50% 0 auto;
  border-top: 2px dashed var(--border-color);
}

.connect-link__line svg {
  position: relative;
  padding: 4px;
  border-radius: 999px;
  background: var(--surface);
  box-sizing: content-box;
}

h1 {
  margin: 0;
  color: var(--text-heading);
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  letter-spacing: var(--tracking-tight);
  text-align: center;
}

.connect-site {
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 6px;
  margin: var(--space-xs) auto var(--space-lg);
  padding: 4px 10px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  color: var(--text-secondary);
  font-family: var(--font-mono, monospace);
  font-size: var(--text-xs);
}

.connect-lead {
  margin: 0 0 var(--space-md);
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

/* What one click sets up */
.connect-plan {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin: 0 0 var(--space-md);
  padding: 0;
  list-style: none;
}

.connect-plan li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  line-height: 1.45;
}

.connect-plan li > span:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.connect-plan strong {
  color: var(--text-heading);
  font-weight: var(--font-weight-semibold);
}

.connect-plan__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--accent-bg-06);
  color: var(--text-heading);
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
  color: var(--text-secondary);
  font-size: var(--text-sm);
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
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.connect-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 48px;
  padding: 0 var(--space-lg);
  border: 1px solid transparent;
  border-radius: var(--radius-btn);
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  font: inherit;
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  cursor: pointer;
  box-sizing: border-box;
}

.connect-button--wide {
  width: 100%;
}

.connect-button--secondary {
  border-color: var(--border-color);
  background: transparent;
  color: var(--text-primary);
}

.connect-button:disabled {
  opacity: 0.7;
  cursor: default;
}

.connect-quiet {
  padding: var(--space-xs) var(--space-sm);
  border: 0;
  background: none;
  color: var(--text-muted);
  font: inherit;
  font-size: var(--text-sm);
  cursor: pointer;
}

.connect-quiet:hover:not(:disabled) {
  color: var(--text-primary);
}

.connect-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: connect-spin 0.8s linear infinite;
}

@keyframes connect-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .connect-spinner { animation: none; }
}

.connect-foot svg {
  margin-right: 4px;
  vertical-align: -2px;
}

.connect-foot {
  margin: var(--space-lg) 0 0;
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: var(--text-xs);
  text-align: center;
}

.connect-button:focus-visible,
.connect-quiet:focus-visible,
.connect-agent:focus-within,
.connect-domain:focus-within {
  outline: none;
  box-shadow: var(--ring-focus);
}

@media (max-width: 480px) {
  .connect-page { padding: var(--space-md); align-items: flex-start; }
  .connect-card { padding: var(--space-lg); }
}
</style>
