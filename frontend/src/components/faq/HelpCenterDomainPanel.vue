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
const isVerified = computed(() => !!currentDomain.value && props.domain?.domain_status === 'verified')
const isConnected = computed(() => isVerified.value && normalizedInput.value === currentDomain.value)

const statusPill = computed(() => {
  if (isVerified.value) return { label: 'Connected', cls: 'status-pill--teal' }
  if (currentDomain.value) return { label: 'Pending verification', cls: 'status-pill--warn' }
  return { label: 'Not configured', cls: 'status-pill--idle' }
})

const sslPill = computed(() => {
  const status = props.domain?.ssl_status
  if (status === 'active') return { label: 'Active', cls: 'record-pill--teal' }
  if (status === 'failed') return { label: 'Failed', cls: 'record-pill--coral' }
  return { label: 'Provisioning', cls: 'record-pill--idle' }
})

function onDomainAction() {
  if (!normalizedInput.value || props.busy || isConnected.value) return
  if (normalizedInput.value !== currentDomain.value) emit('set-domain', normalizedInput.value)
  else emit('verify-domain')
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
    <p class="domain-copy">
      Serve your help center from your own subdomain instead of the ChatterMate URL. Add the
      records below at your DNS provider, then verify.
    </p>

    <div class="domain-form">
      <div class="domain-input">
        <span class="domain-input__prefix">https://</span>
        <input v-model="domainInput" type="text" placeholder="help.yourcompany.com" />
      </div>
      <button class="btn-verify" type="button" :disabled="busy || isConnected || !normalizedInput" @click="onDomainAction">
        {{ isConnected ? 'Connected ✓' : busy ? 'Working…' : 'Verify domain' }}
      </button>
      <button v-if="currentDomain" class="icon-btn" type="button" title="Remove domain" :disabled="busy" @click="$emit('remove-domain')">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></svg>
      </button>
    </div>

    <div v-if="domain?.records?.length" class="dns-table">
      <div class="dns-table__head">
        <div>TYPE</div><div>NAME / HOST</div><div>VALUE</div><div class="dns-table__right">STATUS</div>
      </div>
      <div v-for="record in domain.records" :key="`${record.type}-${record.host}`" class="dns-table__row">
        <div class="dns-table__type">{{ record.type }}</div>
        <div class="dns-table__cell">{{ record.host }}</div>
        <div class="dns-table__cell">{{ record.value }}</div>
        <div class="dns-table__right">
          <span class="record-pill" :class="record.verified ? 'record-pill--teal' : 'record-pill--warn'">
            {{ record.verified ? 'Active' : 'Pending' }}
          </span>
        </div>
      </div>
      <div class="ssl-row">
        <div class="ssl-row__lead">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          <span>SSL certificate</span>
        </div>
        <span class="record-pill" :class="sslPill.cls">{{ sslPill.label }}</span>
      </div>
    </div>
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
  max-width: 520px;
  line-height: 1.55;
  margin: 6px 0 16px;
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
  margin-bottom: 18px;
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

.btn-verify {
  padding: 0 20px;
  background: var(--accent-solid);
  border: none;
  border-radius: 11px;
  color: var(--on-accent-solid);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-verify:disabled {
  opacity: 0.65;
  cursor: default;
}

.icon-btn {
  width: 46px;
  border-radius: 11px;
  background: var(--o05);
  border: 1px solid var(--o12);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--coral-bg);
  color: var(--c-coral);
  border-color: var(--coral-border);
}

.dns-table {
  background: var(--bg);
  border: 1px solid var(--o08);
  border-radius: 13px;
  overflow: hidden;
}

.dns-table__head,
.dns-table__row {
  display: grid;
  grid-template-columns: 0.7fr 1.3fr 1.6fr 0.7fr;
  align-items: center;
  padding: 11px 16px;
  border-bottom: 1px solid var(--o06);
  font-family: var(--font-mono);
}

.dns-table__head {
  font-size: 10.5px;
  letter-spacing: 0.06em;
  color: var(--muted2);
  border-bottom-color: var(--o07);
}

.dns-table__row {
  padding: 13px 16px;
  font-size: 12.5px;
}

.dns-table__type {
  color: var(--c-purple);
  font-weight: 600;
}

.dns-table__cell {
  color: var(--text3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dns-table__right {
  text-align: right;
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

.ssl-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.ssl-row__lead {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--muted);
}
</style>
