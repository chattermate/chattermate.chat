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
import type { ActionConfirmPolicy } from '@/types/agentActions'
import { policyLabel } from './actionPolicies'

defineProps<{ policy: ActionConfirmPolicy }>()
</script>

<template>
  <span class="policy-badge" :class="policy">
    <font-awesome-icon v-if="policy !== 'never'" icon="fa-solid fa-shield-halved" class="policy-icon" />
    {{ policyLabel(policy) }}
  </span>
</template>

<style scoped>
.policy-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.policy-icon { width: 11px; height: 11px; }
.policy-badge.never { background: var(--o06); color: var(--muted); }
.policy-badge.always { background: var(--purple-bg); color: var(--c-purple); }
.policy-badge.when_overwriting { background: var(--teal-bg); color: var(--c-teal); }
</style>
