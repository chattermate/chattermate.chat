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
 * One section of the details panel: a small uppercase heading, an optional
 * action beside it (a link), and its body. The enterprise module's sections
 * use it too, so every section looks the same.
 */
defineProps<{ heading: string }>()
</script>

<template>
  <section class="details-section" :aria-label="heading">
    <div class="details-section-head">
      <h3 class="details-section-heading">{{ heading }}</h3>
      <slot name="action" />
    </div>
    <slot />
  </section>
</template>

<style scoped>
.details-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px 14px;
  border-bottom: 1px solid var(--o07);
}

.details-section:last-child {
  border-bottom: 0;
}

.details-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 28px;
}

.details-section-heading {
  margin: 0;
  color: var(--muted2);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
