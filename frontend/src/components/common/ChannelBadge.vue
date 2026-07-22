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

const props = defineProps<{
  channel?: string | null
}>()

const CHANNEL_LABELS: Record<string, string> = {
  shopify: 'Shopify',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  messenger: 'Messenger',
  instagram: 'Instagram',
  slack: 'Slack',
  email: 'Email',
  sms: 'SMS',
  line: 'LINE',
  api: 'API',
}

// The widget ('web') is the default context — no badge needed for it.
const label = computed(() => (props.channel ? CHANNEL_LABELS[props.channel] : null))
</script>

<template>
  <span v-if="label" class="channel-badge" :class="`channel-${channel}`">{{ label }}</span>
</template>

<style scoped>
.channel-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: var(--radius-chip, 999px);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.6;
  background: var(--accent-bg-12, rgba(59, 130, 246, 0.12));
  color: var(--accent-ink, #2563eb);
  white-space: nowrap;
}
</style>
