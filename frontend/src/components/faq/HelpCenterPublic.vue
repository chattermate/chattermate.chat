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
import type { HelpCenterSettings } from '@/types/faq'
import HelpCenterDomainPanel from './HelpCenterDomainPanel.vue'

defineProps<{
  settings: HelpCenterSettings
  domainBusy: boolean
}>()

const emit = defineEmits<{
  'toggle-enabled': [enabled: boolean]
  'update-ai': [payload: { agent_id?: string | null; ai_search_enabled?: boolean }]
  'set-domain': [domain: string]
  'verify-domain': []
  'remove-domain': []
}>()

function onAgentChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update-ai', { agent_id: value || null })
}
</script>

<template>
  <section class="public">
    <h2 class="public__heading">Public help center</h2>

    <div class="public__card">
      <!-- publish row -->
      <div class="publish-row">
        <div class="publish-row__lead">
          <label class="switch">
            <input type="checkbox" :checked="settings.enabled" @change="emit('toggle-enabled', ($event.target as HTMLInputElement).checked)" />
            <span class="switch__track"><span class="switch__knob"></span></span>
          </label>
          <span class="status-pill" :class="settings.enabled ? 'status-pill--teal' : 'status-pill--idle'">
            <span class="status-pill__dot" :class="{ 'status-pill__dot--glow': settings.enabled }"></span>
            {{ settings.enabled ? 'Published' : 'Draft' }}
          </span>
          <span class="publish-row__text">{{ settings.published_count }} published FAQs live at</span>
          <a v-if="settings.live_url" class="publish-row__url" :href="settings.live_url" target="_blank" rel="noopener">{{ settings.live_url }}</a>
        </div>
        <a v-if="settings.live_url" class="btn-ghost" :href="settings.live_url" target="_blank" rel="noopener">Open help center →</a>
      </div>

      <!-- AI search -->
      <div class="block">
        <label class="mono-label">AI SEARCH</label>
        <div class="ai-row">
          <select class="agent-select" :value="settings.agent_id || ''" @change="onAgentChange">
            <option value="">Choose an agent…</option>
            <option v-for="agent in settings.agents" :key="agent.id" :value="agent.id">{{ agent.name }}</option>
          </select>
          <label class="switch switch--labelled">
            <input type="checkbox" :checked="settings.ai_search_enabled" @change="emit('update-ai', { ai_search_enabled: ($event.target as HTMLInputElement).checked })" />
            <span class="switch__track"><span class="switch__knob"></span></span>
            <span class="switch__label">AI answers in search</span>
          </label>
        </div>
        <p class="hint">
          Visitors get instant AI answers grounded in this agent's knowledge — and can chat with it
          via the embedded widget.
        </p>
      </div>

      <!-- custom domain -->
      <div class="block">
        <HelpCenterDomainPanel
          :domain="settings.domain"
          :busy="domainBusy"
          @set-domain="emit('set-domain', $event)"
          @verify-domain="emit('verify-domain')"
          @remove-domain="emit('remove-domain')"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.public__heading {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 19px;
  letter-spacing: -0.01em;
  color: var(--text);
  margin: 0 0 16px;
}

.public__card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  overflow: hidden;
}

.publish-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--o07);
  flex-wrap: wrap;
}

.publish-row__lead {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.publish-row__text {
  font-size: 14px;
  color: var(--muted);
}

.publish-row__url {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--accent-ink);
  text-decoration: none;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--o05);
  border: 1px solid var(--o14);
  border-radius: 10px;
  color: var(--text2);
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 600;
}

.btn-ghost:hover {
  background: var(--o08);
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}

.switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch__track {
  width: 38px;
  height: 22px;
  border-radius: var(--radius-pill);
  background: var(--toggle-track-off);
  padding: 2px;
  display: inline-flex;
  transition: background-color var(--transition-fast);
  box-sizing: border-box;
}

.switch input:checked + .switch__track {
  background: var(--toggle-on-teal);
}

.switch__knob {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--toggle-knob);
  transition: transform var(--transition-fast);
}

.switch input:checked + .switch__track .switch__knob {
  transform: translateX(16px);
}

.switch__label {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text2);
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

.status-pill__dot--glow {
  box-shadow: 0 0 6px var(--c-teal);
}

.status-pill--teal {
  background: var(--teal-bg);
  border: 1px solid var(--teal-border);
  color: var(--c-teal);
}

.status-pill--idle {
  background: var(--pill-idle-bg);
  border: 1px solid var(--o12);
  color: var(--pill-idle-fg);
}

.block {
  padding: 22px;
  border-bottom: 1px solid var(--o07);
}

.block:last-child {
  border-bottom: none;
}

.mono-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted2);
  margin-bottom: 12px;
}

.ai-row {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.agent-select {
  min-width: 220px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: 10px;
  padding: 10px 12px;
  font-family: var(--font-sans);
  font-size: 13.5px;
  color: var(--text);
  outline: none;
}

.hint {
  font-size: 12.5px;
  color: var(--muted);
  margin: 12px 0 0;
  line-height: 1.55;
}
</style>
