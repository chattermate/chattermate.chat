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
// The visitor's thumb on an AI reply (the widget's answer actions), as the team
// sees it in the conversation: up or down, next to the reply's time.
import { computed } from 'vue'

const props = defineProps<{ value: 'up' | 'down' }>()

const label = computed(() => (props.value === 'up' ? 'Visitor found this helpful' : 'Visitor found this not helpful'))
</script>

<template>
  <span class="feedback-mark" :class="`is-${value}`" :title="label" role="img" :aria-label="label">
    <font-awesome-icon :icon="value === 'up' ? 'fa-solid fa-thumbs-up' : 'fa-solid fa-thumbs-down'" aria-hidden="true" />
  </span>
</template>

<style scoped>
.feedback-mark {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  font-size: 11px;
}
.feedback-mark.is-up {
  color: var(--c-positive);
}
.feedback-mark.is-down {
  color: var(--c-danger);
}
</style>
