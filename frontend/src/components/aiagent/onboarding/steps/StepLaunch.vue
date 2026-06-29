<!--
ChatterMate - Onboarding Step: Launch
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
-->

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { buildWidgetEmbed } from '@/utils/widgetEmbed'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

const props = defineProps<{
  widgetId: string | null
  agentType: string
}>()

const emit = defineEmits<{
  (e: 'finish'): void
  (e: 'back'): void
}>()

const { hasEnterpriseModule } = useEnterpriseFeatures()

const tab = ref<'widget' | 'cli'>('widget')

const widgetSnippet = computed(() =>
  props.widgetId ? buildWidgetEmbed(props.widgetId, false) : '',
)

const cliSnippet = computed(
  () => `# install & create from your terminal
pipx install chattermate-sdk
chattermate agent create --name "Support" --type ${props.agentType || 'customer_support'}
chattermate knowledge add-url --website https://docs.acme.com`,
)

const copy = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`, { duration: 3000 })
  } catch (err) {
    console.error('Failed to copy:', err)
    toast.error('Failed to copy to clipboard')
  }
}
</script>

<template>
  <div class="step">
    <header class="step-head">
      <h2 class="step-title">Go live</h2>
      <p class="step-sub">Embed the widget, or wire it up from your terminal.</p>
    </header>

    <div class="tab-row">
      <button type="button" class="tab" :class="{ active: tab === 'widget' }" @click="tab = 'widget'">Widget snippet</button>
      <button type="button" class="tab" :class="{ active: tab === 'cli' }" @click="tab = 'cli'">CLI</button>
    </div>

    <div v-if="tab === 'widget'">
      <pre class="code-block">{{ widgetSnippet }}</pre>
      <button type="button" class="btn-soft" :disabled="!widgetSnippet" @click="copy(widgetSnippet, 'Widget snippet')">Copy snippet</button>
    </div>

    <div v-else>
      <pre class="code-block muted-code">{{ cliSnippet }}</pre>
      <p v-if="!hasEnterpriseModule" class="cli-note">CLI &amp; MCP are part of the Enterprise edition.</p>
      <button type="button" class="btn-soft" @click="copy(cliSnippet, 'CLI commands')">Copy commands</button>
    </div>

    <div class="step-actions">
      <button type="button" class="btn-ghost" @click="emit('back')">Back</button>
      <button type="button" class="btn-accent" @click="emit('finish')">Finish &amp; go to dashboard ✓</button>
    </div>
  </div>
</template>

<style scoped>
.step {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.step-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 22px;
  margin: 0;
  color: var(--text);
}

.step-sub {
  font-size: 14.5px;
  color: var(--muted);
  margin: 0;
}

.tab-row {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 10px 18px;
  background: var(--o05);
  border: 1px solid var(--o12);
  border-radius: var(--radius-pill);
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

.tab.active {
  background: var(--accent-bg-08);
  border-color: var(--accent-border);
  color: var(--accent-ink);
}

.code-block {
  background: var(--bg);
  border: 1px solid var(--o10);
  border-radius: var(--radius-input);
  padding: 18px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--accent-ink);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0 0 12px;
}

.muted-code {
  color: var(--code);
  word-break: normal;
}

.cli-note {
  margin: 0 0 12px;
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--muted2);
}

.btn-soft {
  padding: 11px 18px;
  background: var(--o06);
  border: 1px solid var(--o14);
  border-radius: var(--radius-btn);
  color: var(--text);
  font-size: 13.5px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-soft:hover:not(:disabled) {
  background: var(--o10);
}

.btn-soft:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.btn-ghost {
  padding: 14px 22px;
  background: var(--o05);
  border: 1px solid var(--o14);
  border-radius: var(--radius-btn);
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-ghost:hover {
  background: var(--o10);
}

.btn-accent {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-btn);
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-accent:hover {
  filter: brightness(1.05);
}
</style>
