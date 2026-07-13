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
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { HelpCenterDomain } from '@/types/faq'

const props = defineProps<{
  domain: HelpCenterDomain | null
  busy: boolean
}>()

const emit = defineEmits<{
  'set-domain': [domain: string]
  'verify-domain': []
  'remove-domain': []
}>()

const domainInput = ref(props.domain?.custom_domain || '')

watch(
  () => props.domain?.custom_domain,
  (value) => {
    domainInput.value = value || ''
  },
)

const currentDomain = computed(() => props.domain?.custom_domain || '')
const normalizedInput = computed(() => domainInput.value.trim().replace(/^https?:\/\//i, ''))
const isVerified = computed(() => currentDomain.value !== '' && props.domain?.domain_status === 'verified')

// empty → enter a domain · pending → add DNS records + verify · connected → live
const phase = computed<'empty' | 'pending' | 'connected'>(() => {
  if (!currentDomain.value) return 'empty'
  return isVerified.value ? 'connected' : 'pending'
})

const statusPill = computed(() => {
  if (phase.value === 'connected') return { label: 'Connected', cls: 'status-pill--teal' }
  if (phase.value === 'pending') return { label: 'Pending verification', cls: 'status-pill--warn' }
  return { label: 'Not configured', cls: 'status-pill--idle' }
})

const sslPill = computed(() => {
  const status = props.domain?.ssl_status
  if (status === 'active') return { label: 'Active', cls: 'record-pill--teal' }
  if (status === 'failed') return { label: 'Failed', cls: 'record-pill--coral' }
  return { label: 'Provisioning', cls: 'record-pill--idle' }
})

const liveUrl = computed(() => `https://${currentDomain.value}`)

function addDomain() {
  if (!normalizedInput.value || props.busy) return
  emit('set-domain', normalizedInput.value)
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied')
  } catch {
    toast.error('Could not copy — select and copy manually')
  }
}
</script>

<template>
  <div>
    <div class="domain-head">
      <h3 class="domain-head__title">Custom domain</h3>
      <span class="status-pill" :class="statusPill.cls">
        <span class="status-pill__dot"></span>
        {{ statusPill.label }}
      </span>
    </div>

    <!-- Step 1: enter a domain -->
    <template v-if="phase === 'empty'">
      <p class="domain-copy">
        Serve your help center from your own subdomain instead of the ChatterMate URL.
        Enter it below and we'll show you the two DNS records to add.
      </p>
      <div class="domain-form">
        <div class="domain-input">
          <span class="domain-input__prefix">https://</span>
          <input
            v-model="domainInput"
            type="text"
            placeholder="help.yourcompany.com"
            @keydown.enter="addDomain"
          />
        </div>
        <button class="btn-primary" type="button" :disabled="busy || !normalizedInput" @click="addDomain">
          {{ busy ? 'Working…' : 'Add domain' }}
        </button>
      </div>
    </template>

    <!-- Step 2: add the DNS records, then verify -->
    <template v-else>
      <div class="domain-current">
        <div class="domain-current__lead">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" /></svg>
          <a v-if="phase === 'connected'" :href="liveUrl" target="_blank" rel="noopener" class="domain-current__name domain-current__name--link">{{ currentDomain }}</a>
          <span v-else class="domain-current__name">{{ currentDomain }}</span>
        </div>
        <button class="link-btn" type="button" :disabled="busy" @click="$emit('remove-domain')">Remove</button>
      </div>

      <template v-if="phase === 'pending'">
        <ol class="steps">
          <li>Add these two records at your DNS provider.</li>
          <li>Come back and click <strong>Verify domain</strong> — DNS changes can take a few minutes.</li>
        </ol>

        <div class="records">
          <div v-for="record in domain?.records || []" :key="`${record.type}-${record.host}`" class="record" :class="{ 'record--ok': record.verified }">
            <div class="record__top">
              <span class="record__type">{{ record.type }}</span>
              <span class="record-pill" :class="record.verified ? 'record-pill--teal' : 'record-pill--warn'">
                {{ record.verified ? 'Detected' : 'Waiting' }}
              </span>
            </div>
            <div class="record__field">
              <span class="record__label">Name / Host</span>
              <div class="record__value">
                <code>{{ record.host }}</code>
                <button class="copy-btn" type="button" title="Copy" @click="copy(record.host)">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
                </button>
              </div>
            </div>
            <div class="record__field">
              <span class="record__label">Value</span>
              <div class="record__value">
                <code>{{ record.value }}</code>
                <button class="copy-btn" type="button" title="Copy" @click="copy(record.value)">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="verify-row">
          <button class="btn-primary" type="button" :disabled="busy" @click="$emit('verify-domain')">
            {{ busy ? 'Checking…' : 'Verify domain' }}
          </button>
          <span class="ssl-note">
            <span class="record-pill" :class="sslPill.cls">SSL {{ sslPill.label }}</span>
            issued automatically once verified
          </span>
        </div>
      </template>

      <template v-else>
        <p class="domain-copy domain-copy--ok">
          Your help center is live at <a :href="liveUrl" target="_blank" rel="noopener">{{ currentDomain }}</a>.
          <span class="record-pill" :class="sslPill.cls">SSL {{ sslPill.label }}</span>
        </p>
      </template>
    </template>
  </div>
</template>

<style scoped>
.domain-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.domain-head__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  color: var(--text);
  margin: 0;
}

.domain-copy {
  font-size: 13.5px;
  color: var(--muted);
  max-width: 560px;
  line-height: 1.55;
  margin: 6px 0 16px;
}

.domain-copy--ok {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.domain-copy a {
  color: var(--c-teal);
  font-weight: 600;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  font-size: 12.5px;
  font-weight: 600;
}

.status-pill__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.status-pill--teal {
  background: var(--teal-bg);
  border: 1px solid var(--teal-border);
  color: var(--c-teal);
}

.status-pill--warn {
  background: var(--warning-bg);
  border: 1px solid color-mix(in srgb, var(--c-warn) 30%, transparent);
  color: var(--c-warn);
}

.status-pill--idle {
  background: var(--pill-idle-bg);
  border: 1px solid var(--o12);
  color: var(--pill-idle-fg);
}

.domain-form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.domain-input {
  flex: 1;
  min-width: 240px;
  display: flex;
  align-items: center;
  background: var(--bg);
  border: 1px solid var(--o10);
  border-radius: 11px;
  padding: 0 14px;
  font-family: var(--font-mono);
}

.domain-input__prefix {
  color: var(--faint);
  font-size: 13.5px;
}

.domain-input input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 13.5px;
  padding: 13px 4px;
  font-family: var(--font-mono);
}

.btn-primary {
  padding: 0 20px;
  min-height: 44px;
  background: var(--accent-solid);
  border: none;
  border-radius: 11px;
  color: var(--on-accent-solid);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: default;
}

/* current domain header */
.domain-current {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  margin: 6px 0 16px;
  background: var(--bg);
  border: 1px solid var(--o08);
  border-radius: 11px;
}

.domain-current__lead {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--muted);
}

.domain-current__name {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--text2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.domain-current__name--link {
  color: var(--c-teal);
  text-decoration: none;
}

.link-btn {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.link-btn:hover {
  color: var(--c-coral);
}

.link-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

/* steps + records */
.steps {
  margin: 0 0 14px;
  padding-left: 20px;
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.7;
}

.steps strong {
  color: var(--text2);
}

.records {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.record {
  background: var(--bg);
  border: 1px solid var(--o08);
  border-radius: 12px;
  padding: 13px 14px;
}

.record--ok {
  border-color: var(--teal-border);
}

.record__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.record__type {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--c-purple);
}

.record__field {
  margin-top: 8px;
}

.record__label {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--muted2);
  margin-bottom: 4px;
}

.record__value {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 8px;
  padding: 7px 9px;
}

.record__value code {
  flex: 1;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--text3);
  overflow-x: auto;
  white-space: nowrap;
}

.copy-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: var(--o05);
  border: 1px solid var(--o12);
  border-radius: 7px;
  color: var(--muted);
  cursor: pointer;
}

.copy-btn:hover {
  background: var(--o08);
  color: var(--text2);
}

.verify-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.ssl-note {
  font-size: 12.5px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.record-pill {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
}

.record-pill--teal {
  background: var(--teal-bg);
  border: 1px solid var(--teal-border);
  color: var(--c-teal);
}

.record-pill--warn {
  background: var(--warning-bg);
  border: 1px solid color-mix(in srgb, var(--c-warn) 30%, transparent);
  color: var(--c-warn);
}

.record-pill--coral {
  background: var(--coral-bg);
  border: 1px solid var(--coral-border);
  color: var(--c-coral);
}

.record-pill--idle {
  background: var(--o05);
  border: 1px solid var(--o12);
  color: var(--muted);
}
</style>
