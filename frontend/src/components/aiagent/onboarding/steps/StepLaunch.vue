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
import { computed } from 'vue'
import { AI_BUILDERS, buildAiInstallPrompt, buildWidgetEmbed } from '@/utils/widgetEmbed'
import { WIDGET_INSTALL_GUIDE_URL } from '@/config/docs'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { useCopyFeedback } from '@/composables/useCopyFeedback'
import AiInstallPromptButton from '@/components/agent/AiInstallPromptButton.vue'
import AiInstallPromptPreview from '@/components/agent/AiInstallPromptPreview.vue'

const props = defineProps<{
  widgetId: string | null
  agentType: string
}>()

const emit = defineEmits<{
  (e: 'finish'): void
  (e: 'back'): void
}>()

const widgetSnippet = computed(() =>
  props.widgetId ? buildWidgetEmbed(props.widgetId, false) : '',
)
const aiInstallPrompt = computed(() => buildAiInstallPrompt(widgetSnippet.value))

// Where the widget is live, or blocked (enterprise module; nothing in open source)
const { enterpriseComponent, moduleImports } = useEnterpriseFeatures()
const WidgetInstallStatus = enterpriseComponent(moduleImports.widgetInstallStatus)

// Built in the browser and handed to the user's own mail app: nothing is sent
// from our servers, so it can't be used to mail arbitrary addresses.
const developerMailto = computed(() => {
  if (!widgetSnippet.value) return ''
  const body = [
    'Hi,',
    '',
    'Could you add our ChatterMate chat to the website? Paste this just before </body> on every page:',
    '',
    widgetSnippet.value,
    '',
    `Guide: ${WIDGET_INSTALL_GUIDE_URL}`,
  ].join('\n')
  const params = new URLSearchParams({ subject: 'Add our ChatterMate chat to the website', body })
  return `mailto:?${params.toString().replace(/\+/g, '%20')}`
})

// The button itself says it worked, for a moment; a failure gets a toast.
const { copied, copy } = useCopyFeedback()
const copySnippet = () => copy(widgetSnippet.value)
</script>

<template>
  <div class="step">
    <header class="step-head">
      <h2 class="step-title">Go live</h2>
      <p class="step-sub">Paste this snippet on your site, or have your AI website builder add it for you.</p>
    </header>

    <div class="snippet">
      <pre class="code-block">{{ widgetSnippet }}</pre>
      <button type="button" class="copy-btn" :disabled="!widgetSnippet" @click="copySnippet">
        <font-awesome-icon :icon="copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'" aria-hidden="true" />
        <span aria-live="polite">{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </div>

    <div class="snippet-help">
      <div class="snippet-actions">
        <AiInstallPromptButton :prompt="aiInstallPrompt" />
        <a v-if="developerMailto" class="action-btn" :href="developerMailto">
          <font-awesome-icon icon="fa-regular fa-envelope" aria-hidden="true" />
          Email it to my developer
        </a>
        <a class="action-btn" :href="WIDGET_INSTALL_GUIDE_URL" target="_blank" rel="noopener">
          <font-awesome-icon icon="fa-solid fa-book-open" aria-hidden="true" />
          Install guide
          <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="external" aria-hidden="true" />
          <span class="sr-only">(opens in a new tab)</span>
        </a>
      </div>
      <p class="ai-hint">Works with {{ AI_BUILDERS }}.</p>
    </div>

    <AiInstallPromptPreview :prompt="aiInstallPrompt" />

    <WidgetInstallStatus :widget-id="widgetId" />

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

.snippet {
  position: relative;
}

.code-block {
  background: var(--bg);
  border: 1px solid var(--o10);
  border-radius: var(--radius-input);
  /* Room on the right for the Copy button over the first line */
  padding: 18px 96px 18px 18px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--accent-ink);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: var(--o06);
  border: 1px solid var(--o14);
  border-radius: 8px;
  color: var(--text);
  font-size: 12.5px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

/* On a phone the code needs every pixel of width: Copy goes above it instead */
@media (max-width: 480px) {
  .code-block {
    padding: 52px 14px 14px;
  }
}

.copy-btn:hover:not(:disabled) {
  background: var(--o10);
}

.copy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.snippet-help {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-hint {
  margin: 0;
  font-size: 12.5px;
  color: var(--muted2);
}

.snippet-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  background: var(--o06);
  border: 1px solid var(--o14);
  border-radius: var(--radius-btn);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-sans);
  text-decoration: none;
  transition: var(--transition-fast);
}

.action-btn:hover {
  background: var(--o10);
}

.copy-btn:focus-visible,
.action-btn:focus-visible {
  outline: 2px solid var(--accent-ink);
  outline-offset: 2px;
}

.action-btn .external {
  font-size: 11px;
  color: var(--muted);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
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
