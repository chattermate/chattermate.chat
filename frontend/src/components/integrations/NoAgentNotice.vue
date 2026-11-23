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

<!-- Shown in a channel's connect/manage dialog while no AI agent answers the
     account: inbound messages are dropped until one is assigned below. -->
<script setup lang="ts">
import { NO_AGENT_TEXT } from '@/utils/channelAccounts'
</script>

<template>
  <p class="no-agent-notice" role="alert" data-testid="no-agent-notice">
    {{ NO_AGENT_TEXT }} Assign one below.
  </p>
</template>

<style scoped>
.no-agent-notice {
  margin: 0 0 16px;
  padding: 10px 12px;
  border-radius: var(--radius-md, 8px);
  background: var(--error-bg);
  color: var(--error-color);
  font-size: 14px;
  line-height: 1.5;
}
</style>
