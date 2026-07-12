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
defineProps<{
  category: string
  count: number
}>()
</script>

<template>
  <div class="category-group">
    <div class="category-group__header">
      <span class="category-group__name">{{ category.toUpperCase() }}</span>
      <span class="category-group__count">{{ count }} {{ count === 1 ? 'answer' : 'answers' }}</span>
      <div class="category-group__rule"></div>
    </div>
    <div class="category-group__cards">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.category-group {
  margin-bottom: 18px;
}

.category-group__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 0 2px;
}

.category-group__name {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--accent-ink);
}

.category-group__count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted2);
}

.category-group__rule {
  flex: 1;
  height: 1px;
  background: var(--o07);
}

.category-group__cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
