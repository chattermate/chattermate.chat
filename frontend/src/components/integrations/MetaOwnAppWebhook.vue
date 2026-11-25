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

<!-- The webhook address and verify token of a WhatsApp number, Messenger
     Page or Instagram account connected from the customer's own Meta app. -->
<script setup lang="ts">
import { computed } from 'vue'
import type { ChannelAccount } from '@/services/channels'
import CopyField from './CopyField.vue'

const props = defineProps<{ account: ChannelAccount }>()

const hint = computed(() => {
  if (props.account.channel_type === 'messenger') {
    return 'In your Meta app, add these under Messenger → Settings → Webhooks, then subscribe your Page to messages.'
  }
  if (props.account.channel_type === 'instagram') {
    return 'In your Meta app, add these under Webhooks → Instagram, then subscribe to messages.'
  }
  return props.account.webhook_auto_configured
    ? 'Messages from this number come to ChatterMate. Nothing to set up.'
    : 'Add these in your Meta app under WhatsApp → Configuration so messages reach ChatterMate.'
})
</script>

<template>
  <div class="own-app-webhook">
    <p class="own-app-hint">{{ hint }}</p>
    <CopyField field-id="own-app-callback-url" label="Callback URL" name="Callback URL"
               :value="account.webhook_url || ''" />
    <CopyField field-id="own-app-verify-token" label="Verify token" name="Verify token"
               :value="account.webhook_verify_token || ''" />
  </div>
</template>

<style scoped>
.own-app-webhook {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn);
}

.own-app-hint {
  margin: 0 0 12px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}
</style>
