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
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { leadCaptureService } from '@/services/leadCapture'
import type { LeadCaptureConfig, LeadField } from '@/types/leadCapture'

const props = defineProps<{ agentId: string }>()

const loading = ref(true)
const saving = ref(false)

const enabled = ref(false)
const requireConsent = ref(true)
const guidance = ref('')
const fields = ref<LeadField[]>([])
const assignmentMode = ref('none')
const crmSyncTarget = ref('none')
const slackNotifyEnabled = ref(false)

const STANDARD_FIELDS: { key: string; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'phone', label: 'Phone' },
]

// --- Fields ---
function isStandardEnabled(key: string) {
  return fields.value.some(f => f.standard && f.key === key && f.enabled)
}
function toggleStandard(key: string) {
  const existing = fields.value.find(f => f.standard && f.key === key)
  if (existing) existing.enabled = !existing.enabled
  else fields.value.push({ key, standard: true, enabled: true, required: key === 'email' })
}
function isRequired(key: string) {
  return !!fields.value.find(f => f.key === key)?.required
}
// Toggle a field's "required" flag. Email is always required (the minimum needed
// to record a lead) and cannot be made optional.
function toggleRequired(key: string) {
  if (key === 'email') return
  const f = fields.value.find(x => x.key === key)
  if (f) f.required = !f.required
}
const customFields = computed(() => fields.value.filter(f => !f.standard))
const newFieldLabel = ref('')
const newFieldOptions = ref('')
function addCustomField() {
  const label = newFieldLabel.value.trim()
  if (!label) { toast.error('Enter a field label'); return }
  // Slug from the label; fall back to an index when the label has no a–z0–9 chars
  // (e.g. non-Latin scripts) so the key is never a bare "custom_". Ensure uniqueness
  // since record_lead_capture keys off field.key and duplicates would overwrite.
  let slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  let key = 'custom_' + (slug || 'field')
  if (fields.value.some(f => f.key === key)) {
    let n = 2
    while (fields.value.some(f => f.key === `${key}_${n}`)) n++
    key = `${key}_${n}`
  }
  const field: LeadField = { key, standard: false, enabled: true, required: false, label }
  const opts = newFieldOptions.value.split(',').map(s => s.trim()).filter(Boolean)
  if (opts.length) field.options = opts
  fields.value.push(field)
  newFieldLabel.value = ''; newFieldOptions.value = ''
}
function removeCustomField(key: string) {
  const i = fields.value.findIndex(f => f.key === key && !f.standard)
  if (i >= 0) fields.value.splice(i, 1)
}
function seedDefaultsIfEmpty() {
  if (fields.value.length === 0) {
    fields.value = [
      { key: 'email', standard: true, enabled: true, required: true },
      { key: 'name', standard: true, enabled: true, required: false },
      { key: 'company', standard: true, enabled: false, required: false },
      { key: 'phone', standard: true, enabled: false, required: false },
    ]
  }
}

// --- Preview derivations ---
const enabledFieldLabels = computed(() =>
  fields.value.filter(f => f.enabled).map(f => {
    if (f.standard) return (STANDARD_FIELDS.find(s => s.key === f.key)?.label) || f.key
    return f.label || f.key
  })
)
const firstAskLabel = computed(() => (enabledFieldLabels.value[0] || 'email').toLowerCase())

async function load() {
  loading.value = true
  try {
    const cfg = await leadCaptureService.getConfig(props.agentId)
    enabled.value = !!cfg.enabled
    requireConsent.value = cfg.require_consent !== false
    guidance.value = cfg.guidance || ''
    fields.value = cfg.fields || []
    assignmentMode.value = cfg.assignment_mode || 'none'
    crmSyncTarget.value = cfg.crm_sync_target || 'none'
    slackNotifyEnabled.value = !!cfg.slack_notify_enabled
    seedDefaultsIfEmpty()
  } catch {
    toast.error('Failed to load lead capture settings')
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const updated: LeadCaptureConfig = await leadCaptureService.updateConfig(props.agentId, {
      enabled: enabled.value,
      require_consent: requireConsent.value,
      guidance: guidance.value.trim() || null,
      fields: fields.value,
      assignment_mode: assignmentMode.value as any,
      assignment_target_user_id: null,
      crm_sync_target: crmSyncTarget.value as any,
      slack_notify_enabled: slackNotifyEnabled.value,
    })
    enabled.value = !!updated.enabled
    toast.success('Lead capture settings saved')
  } catch {
    toast.error('Failed to save lead capture settings')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="lead-capture-tab" v-if="!loading">
    <div class="lc-header">
      <div>
        <h3 class="lc-title">Lead capture</h3>
        <p class="lc-sub">When on, the agent collects contact details in conversation — it helps first, then asks at the natural moment. No forms.</p>
      </div>
      <button class="lc-save" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save changes' }}</button>
    </div>

    <div class="lc-grid">
      <!-- LEFT: config -->
      <div class="lc-left">
        <!-- Master toggle -->
        <section class="lc-card">
          <div class="lc-toggle-row">
            <div>
              <div class="lc-toggle-title">Enable lead capture</div>
              <div class="lc-toggle-desc">The agent decides when to ask (like transfer-to-human) and captures details conversationally.</div>
            </div>
            <button class="lc-switch" :class="{ on: enabled }" @click="enabled = !enabled" :aria-pressed="enabled">
              <span class="lc-knob"></span>
            </button>
          </div>
        </section>

        <template v-if="enabled">
          <!-- What to collect -->
          <section class="lc-card">
            <h4 class="lc-card-title">What to collect</h4>
            <p class="lc-card-sub">The agent asks for these in conversation and reports them as structured data. Add your own too.</p>
            <div class="lc-chips">
              <button
                v-for="sf in STANDARD_FIELDS" :key="sf.key"
                class="lc-chip" :class="{ on: isStandardEnabled(sf.key) }"
                @click="toggleStandard(sf.key)"
              >
                <span class="lc-cbox" :class="{ on: isStandardEnabled(sf.key) }">
                  <svg v-if="isStandardEnabled(sf.key)" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                <span class="lc-chip-label">{{ sf.label }}</span>
                <span v-if="sf.key === 'email'" class="lc-req">required</span>
                <span
                  v-else-if="isStandardEnabled(sf.key)"
                  class="lc-req-toggle" :class="{ on: isRequired(sf.key) }"
                  @click.stop="toggleRequired(sf.key)"
                  :title="isRequired(sf.key) ? 'Required — click to make optional' : 'Optional — click to make required'"
                >{{ isRequired(sf.key) ? 'required' : 'optional' }}</span>
              </button>
              <span v-for="cf in customFields" :key="cf.key" class="lc-chip on custom">
                <span class="lc-cbox purple on">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                <span class="lc-chip-label">{{ cf.label }}</span>
                <span v-if="cf.options && cf.options.length" class="lc-type" :title="cf.options.join(', ')">{{ cf.options.length }} choices</span>
                <span
                  class="lc-req-toggle" :class="{ on: cf.required }"
                  @click="toggleRequired(cf.key)"
                  :title="cf.required ? 'Required — click to make optional' : 'Optional — click to make required'"
                >{{ cf.required ? 'required' : 'optional' }}</span>
                <button class="lc-chip-x" title="Remove" @click="removeCustomField(cf.key)">✕</button>
              </span>
            </div>
            <p class="lc-chip-hint">Tap <b>optional / required</b> on a field to control whether the agent insists on it before recording a lead. Email is always required.</p>
            <div class="lc-custom-add">
              <input class="lc-input" v-model="newFieldLabel" placeholder="Custom field label (e.g. Team size)" />
              <input class="lc-input" v-model="newFieldOptions" placeholder="Allowed values, comma-separated (optional)" />
              <button class="lc-add" @click="addCustomField">＋ Add field</button>
            </div>
          </section>

          <!-- Behaviour: consent + guidance -->
          <section class="lc-card">
            <h4 class="lc-card-title">How it asks</h4>
            <div class="lc-toggle-row bordered">
              <div>
                <div class="lc-toggle-title">Require consent <span class="lc-badge">GDPR</span></div>
                <div class="lc-toggle-desc">The agent must get an explicit “yes” before a lead is recorded. Recommended.</div>
              </div>
              <button class="lc-switch" :class="{ on: requireConsent }" @click="requireConsent = !requireConsent" :aria-pressed="requireConsent">
                <span class="lc-knob"></span>
              </button>
            </div>
            <label class="lc-guidance-label">Guidance <span class="lc-optional">optional</span></label>
            <textarea
              class="lc-input lc-textarea"
              v-model="guidance"
              rows="3"
              placeholder="Steer when/how it asks — e.g. “Prioritise pricing-page visitors; be more proactive after hours.”"
            ></textarea>
          </section>

          <!-- When a lead qualifies (routing, coming soon) -->
          <section class="lc-card">
            <h4 class="lc-card-title">When a lead qualifies <span class="lc-soon">Coming soon</span></h4>
            <p class="lc-card-sub">Routing and CRM sync are configurable now and will activate in an upcoming release.</p>
            <div class="lc-route-row">
              <span>Assign to</span>
              <select class="lc-input lc-input-sm" v-model="assignmentMode" disabled>
                <option value="none">No one — log only</option>
                <option value="sales_team">Sales team</option>
                <option value="round_robin">Round-robin</option>
              </select>
            </div>
            <div class="lc-route-row">
              <span>Sync to CRM</span>
              <select class="lc-input lc-input-sm" v-model="crmSyncTarget" disabled>
                <option value="none">Don't sync</option>
                <option value="hubspot">HubSpot</option>
                <option value="salesforce">Salesforce</option>
              </select>
            </div>
            <div class="lc-route-row">
              <span>Notify in Slack</span>
              <input type="checkbox" v-model="slackNotifyEnabled" disabled />
            </div>
          </section>
        </template>

        <div v-else class="lc-off">
          Lead capture is off — this agent answers questions only. Turn it on to start capturing leads in conversation.
        </div>
      </div>

      <!-- RIGHT: live preview (conversational) -->
      <div class="lc-right">
        <div class="lc-preview-head">
          <span class="lc-preview-tag">LIVE PREVIEW</span>
          <span class="lc-preview-mode">{{ enabled ? 'In conversation' : 'Answers only' }}</span>
        </div>
        <div class="lc-pv-widget">
          <div class="lc-pv-topbar">
            <span class="lc-pv-logo"><i></i><i></i><i></i></span>
            <span>
              <span class="lc-pv-name">Sales Assistant</span>
              <span class="lc-pv-online"><i></i>Online now</span>
            </span>
          </div>
          <div class="lc-pv-body">
            <div class="lc-pv-msg user">Do you integrate with Shopify? ~800 orders a week.</div>
            <div class="lc-pv-msg bot">Yes — one-click Shopify install, and I can look up orders live in chat.</div>
            <template v-if="enabled">
              <div class="lc-pv-msg bot">Happy to set this up for your store — could I grab your {{ firstAskLabel }} so a specialist can follow up?</div>
              <div class="lc-pv-msg user">Sure — jane@acme.com</div>
              <div v-if="requireConsent" class="lc-pv-msg bot">Great — ok if someone reaches out to you there?</div>
              <div v-if="requireConsent" class="lc-pv-msg user">Yep, go ahead.</div>
              <div class="lc-pv-msg bot">Perfect — I'll have a specialist reach out at jane@acme.com. 👍</div>
            </template>
            <div v-else class="lc-pv-tagline">capture off · answers only</div>
          </div>
          <div class="lc-pv-inputbar">
            <span class="lc-pv-typebox">Type a message…</span>
            <span class="lc-pv-send">↑</span>
          </div>
        </div>

        <div v-if="enabled" class="lc-pv-captured">
          <div class="lc-pv-captured-label">RECORDED AS A LEAD →</div>
          <div class="lc-pv-chips">
            <span v-for="l in enabledFieldLabels" :key="l" class="lc-pv-fchip">{{ l }}</span>
            <span class="lc-pv-fchip summary">＋ AI summary</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="lc-loading">Loading lead capture settings…</div>
</template>

<style scoped>
.lead-capture-tab { display: flex; flex-direction: column; gap: 18px; padding: 0 var(--space-lg); max-width: 1208px; container-type: inline-size; }
.lc-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.lc-title { font-size: 20px; font-weight: 600; margin: 0 0 4px; }
.lc-sub { font-size: 14px; color: var(--muted); margin: 0; max-width: 560px; line-height: 1.5; }
.lc-save { flex-shrink: 0; padding: 10px 18px; background: var(--accent-solid); color: var(--on-accent-solid); border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
.lc-save:disabled { opacity: .6; cursor: default; }

.lc-grid { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; }
.lc-left { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
.lc-right { min-width: 0; }
@container (min-width: 880px) {
  .lc-grid { grid-template-columns: minmax(0, 1fr) 360px; }
  .lc-right { position: sticky; top: 20px; }
}

.lc-card { background: var(--surface); border: 1px solid var(--border-color); border-radius: 14px; padding: 20px; }
.lc-card-title { font-size: 15px; font-weight: 600; margin: 0 0 4px; display: flex; align-items: center; gap: 8px; }
.lc-card-sub { font-size: 13px; color: var(--muted); margin: 0 0 14px; }

/* Toggle rows */
.lc-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.lc-toggle-row.bordered { padding-bottom: 16px; margin-bottom: 14px; border-bottom: 1px solid var(--border-color); }
.lc-toggle-title { font-weight: 600; font-size: 15px; display: flex; align-items: center; gap: 8px; }
.lc-toggle-desc { font-size: 13px; color: var(--muted); margin-top: 3px; max-width: 460px; line-height: 1.45; }
.lc-switch { flex-shrink: 0; width: 46px; height: 26px; border-radius: 999px; border: none; background: var(--o12); padding: 3px; cursor: pointer; transition: background .16s ease; }
.lc-switch.on { background: var(--accent-solid); }
.lc-knob { display: block; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .16s ease; box-shadow: 0 1px 2px rgba(0,0,0,.3); }
.lc-switch.on .lc-knob { transform: translateX(20px); }
.lc-badge { font-size: 9px; letter-spacing: .05em; padding: 3px 7px; border-radius: 999px; background: var(--purple-bg); color: var(--c-purple); font-weight: 600; }

.lc-input { width: 100%; margin-top: 10px; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 9px; font-size: 14px; background: var(--bg); color: var(--text); }
.lc-input-sm { width: auto; min-width: 120px; }
.lc-textarea { resize: vertical; line-height: 1.5; }
.lc-guidance-label { display: block; font-size: 13px; font-weight: 500; color: var(--text3); margin-top: 4px; }
.lc-optional { font-size: 11px; font-weight: 400; color: var(--muted2); margin-left: 4px; }
.lc-add { margin-top: 6px; padding: 8px 14px; background: transparent; border: 1px dashed var(--border-color); border-radius: 9px; font-size: 13px; cursor: pointer; color: var(--muted); }

/* Field chips */
.lc-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.lc-chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 13px 8px 9px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--o05); font-size: 13.5px; cursor: pointer; color: var(--text); line-height: 1; }
.lc-chip.on { border-color: var(--accent-border); background: var(--accent-bg-08); }
.lc-chip.custom { cursor: default; border-color: var(--purple-border, var(--o12)); background: var(--purple-bg); }
.lc-cbox { width: 18px; height: 18px; flex-shrink: 0; border-radius: 5px; border: 1.5px solid var(--o25); background: transparent; display: flex; align-items: center; justify-content: center; color: var(--on-accent-solid); }
.lc-cbox.on { background: var(--accent-solid); border-color: var(--accent-solid); }
.lc-cbox.purple.on { background: var(--c-purple); border-color: var(--c-purple); color: #fff; }
.lc-chip-label { font-weight: 500; }
.lc-type { font-size: 10px; padding: 2px 6px; border-radius: 5px; background: var(--o08); color: var(--muted); }
.lc-req { font-size: 10.5px; color: var(--c-coral); }
/* Clickable required/optional pill on each enabled field. */
.lc-req-toggle { font-size: 10px; font-weight: 600; letter-spacing: .02em; padding: 2px 7px; border-radius: 999px; cursor: pointer; background: var(--o08); color: var(--muted); border: 1px solid transparent; user-select: none; }
.lc-req-toggle:hover { border-color: var(--o25); }
.lc-req-toggle.on { background: color-mix(in srgb, var(--c-coral) 16%, transparent); color: var(--c-coral); }
.lc-chip-hint { font-size: 12px; color: var(--muted2); margin: 12px 0 0; line-height: 1.45; }
.lc-chip-x { border: none; background: none; cursor: pointer; color: var(--muted); padding: 0 2px; font-size: 12px; }
.lc-custom-add { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 14px; }
.lc-custom-add .lc-input { margin-top: 0; flex: 1; min-width: 160px; }

.lc-route-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color); font-size: 14px; }
.lc-route-row:last-child { border-bottom: none; }
.lc-soon { font-size: 10px; padding: 2px 8px; border-radius: 999px; background: var(--o08); color: var(--muted); font-weight: 500; }
.lc-off { background: var(--o05); border: 1px dashed var(--border-color); border-radius: 14px; padding: 24px; text-align: center; font-size: 14px; color: var(--muted); }
.lc-loading { padding: 40px; text-align: center; color: var(--muted); }

input[type="checkbox"] { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; margin: 0; flex-shrink: 0; border-radius: 5px; border: 1.5px solid var(--o25); background: transparent; cursor: pointer; position: relative; }
input[type="checkbox"]:checked { background: var(--accent-solid); border-color: var(--accent-solid); }
input[type="checkbox"]:checked::after { content: ''; position: absolute; left: 5px; top: 2px; width: 4px; height: 8px; border: solid var(--on-accent-solid); border-width: 0 2px 2px 0; transform: rotate(45deg); }
input[type="checkbox"]:disabled { opacity: .5; cursor: default; }

/* Live preview */
.lc-preview-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.lc-preview-tag { font-family: monospace; font-size: 11px; letter-spacing: .07em; color: var(--muted2); }
.lc-preview-mode { font-size: 12px; color: var(--muted2); }
.lc-pv-widget { background: var(--surface); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; min-height: 380px; }
.lc-pv-topbar { display: flex; align-items: center; gap: 11px; padding: 14px 15px; border-bottom: 1px solid var(--border-color); }
.lc-pv-logo { width: 32px; height: 32px; border-radius: 10px 10px 10px 3px; background: var(--accent-solid); display: flex; align-items: center; justify-content: center; gap: 2.5px; flex-shrink: 0; }
.lc-pv-logo i { width: 3.5px; height: 3.5px; border-radius: 50%; background: var(--on-accent-solid); }
.lc-pv-name { display: block; font-weight: 600; font-size: 13.5px; color: var(--text); }
.lc-pv-online { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--c-teal, #0E8C8C); margin-top: 2px; }
.lc-pv-online i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.lc-pv-body { flex: 1; padding: 16px 14px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
.lc-pv-msg { max-width: 88%; padding: 9px 12px; font-size: 12.5px; line-height: 1.5; }
.lc-pv-msg.user { align-self: flex-end; background: var(--o08); border-radius: 14px 14px 4px 14px; color: var(--text2); }
.lc-pv-msg.bot { align-self: flex-start; background: var(--o05); border: 1px solid var(--border-color); border-radius: 14px 14px 14px 4px; color: var(--text2); }
.lc-pv-tagline { align-self: center; margin-top: 6px; padding: 8px 14px; border-radius: 999px; background: var(--o05); border: 1px solid var(--border-color); font-size: 11.5px; color: var(--muted); }
.lc-pv-inputbar { padding: 11px 13px; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 9px; }
.lc-pv-typebox { flex: 1; padding: 9px 12px; background: var(--bg); border: 1px solid var(--border-color); border-radius: 10px; font-size: 12.5px; color: var(--muted2); }
.lc-pv-send { width: 36px; height: 36px; border-radius: 10px; background: var(--accent-bg-12); display: flex; align-items: center; justify-content: center; color: var(--accent-ink); font-size: 15px; flex-shrink: 0; }
.lc-pv-captured { margin-top: 14px; background: var(--surface); border: 1px solid var(--border-color); border-radius: 13px; padding: 14px 16px; }
.lc-pv-captured-label { font-family: monospace; font-size: 10px; letter-spacing: .07em; color: var(--muted2); margin-bottom: 9px; }
.lc-pv-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.lc-pv-fchip { padding: 5px 11px; border-radius: 999px; background: var(--accent-bg-08); border: 1px solid var(--accent-border); font-size: 11.5px; color: var(--text3); }
.lc-pv-fchip.summary { background: var(--purple-bg); border-color: var(--purple-border, var(--o12)); }
</style>
