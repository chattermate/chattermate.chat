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
/** One line in the chat saying what an in-app action did: "✓ Currency: USD → GBP". */
import type { ActionReceipt } from './actions/receipts'

defineProps<{ receipt: ActionReceipt }>()
</script>

<template>
  <div class="cm-receipt" :class="receipt.tone" role="status">
    <svg v-if="receipt.tone === 'done'" class="cm-receipt-icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" class="fill" /><path d="M7.5 12.5l3 3 6-6.5" class="tick" /></svg>
    <svg v-else-if="receipt.tone === 'failed'" class="cm-receipt-icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" class="ring" /><path d="M12 7.5v5.5M12 16.5v.01" class="mark" /></svg>
    <svg v-else class="cm-receipt-icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" class="ring" /><path d="M8 12h8" class="mark" /></svg>
    <span class="cm-visually-hidden">{{ receipt.tone === 'done' ? 'Done:' : receipt.tone === 'failed' ? 'Failed:' : 'Skipped:' }}</span>
    <span class="cm-receipt-text">{{ receipt.text }}</span>
  </div>
</template>

<style scoped>
.cm-receipt {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-shrink: 0;
  margin: 2px 0 8px;
  padding: 0 4px;
  color: var(--cm-text);
  font-family: var(--cm-body-font);
  font-size: 13px;
  line-height: 1.4;
}
.cm-receipt.skipped, .cm-receipt.failed { color: var(--cm-muted); }
.cm-receipt-icon { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; }
.cm-receipt-icon .fill { fill: var(--cm-accent); }
.cm-receipt-icon .tick { fill: none; stroke: var(--cm-on-accent); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.cm-receipt-icon .ring { fill: none; stroke: currentColor; stroke-width: 2; }
.cm-receipt-icon .mark { fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
.cm-receipt-text { min-width: 0; word-break: break-word; }
.cm-visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
