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
import { useCopyFeedback } from '@/composables/useCopyFeedback'

// The prompt to copy (see buildAiInstallPrompt); empty disables the button.
// "compact" sits beside small controls, like a code block's copy button.
const props = withDefaults(defineProps<{ prompt: string; size?: 'default' | 'compact' }>(), {
  size: 'default',
})

const { copied, copy } = useCopyFeedback()
</script>

<template>
  <button
    type="button"
    class="ai-prompt-btn"
    :class="{ compact: props.size === 'compact' }"
    :disabled="!props.prompt"
    @click="copy(props.prompt)"
  >
    <font-awesome-icon
      :icon="copied ? 'fa-solid fa-check' : 'fa-solid fa-wand-magic-sparkles'"
      aria-hidden="true"
    />
    <span aria-live="polite">{{ copied ? 'Prompt copied' : 'Copy prompt for my AI builder' }}</span>
  </button>
</template>

<style scoped>
.ai-prompt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 11px 16px;
  background: var(--accent-bg-08);
  border: 1.5px solid var(--accent-border);
  border-radius: var(--radius-btn);
  color: var(--accent-ink);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

.ai-prompt-btn.compact {
  gap: 6px;
  min-height: 34px;
  padding: 6px 12px;
  border-width: 1px;
  border-radius: var(--radius-chip);
  font-size: 13px;
  font-weight: 500;
}

/* A finger needs 44px on a phone */
@media (max-width: 768px) {
  .ai-prompt-btn.compact {
    min-height: 44px;
  }
}

.ai-prompt-btn:hover:not(:disabled) {
  background: var(--accent-bg-12);
}

.ai-prompt-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-prompt-btn:focus-visible {
  outline: 2px solid var(--accent-ink);
  outline-offset: 2px;
}
</style>
