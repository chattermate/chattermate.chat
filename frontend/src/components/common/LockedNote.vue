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
/**
 * The one-line note under a setting the plan doesn't include:
 * "Upgrade to Growth to turn on AI ticketing." (the row's title carries the lock).
 * The plan name is a text link, so the line wraps like a sentence instead of
 * a padded button sitting on top of the row above it.
 */
import { useUpgradePlan } from '@/composables/useUpgradePlan'

const props = defineProps<{
  /** The plan flag the setting needs. */
  feature: string
  /** What upgrading does, finishing the sentence: "to turn on AI ticketing." */
  action: string
}>()

const { upgradeText } = useUpgradePlan(props.feature)
</script>

<template>
  <p class="locked-note">
    <router-link to="/settings/subscription" class="locked-note__link">{{ upgradeText }}</router-link>
    {{ action }}
  </p>
</template>

<style scoped>
.locked-note {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.locked-note__link {
  color: var(--accent-ink);
  font-weight: 600;
  text-decoration: none;
}

.locked-note__link:hover {
  text-decoration: underline;
}
</style>
