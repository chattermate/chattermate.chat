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
const props = defineProps<{
  category: string
  count: number
  /** Cards in this group currently selected; undefined hides the select-all. */
  selectedCount?: number
}>()

defineEmits<{
  'toggle-all': [on: boolean]
}>()

const allSelected = () => props.selectedCount === props.count && props.count > 0
</script>

<template>
  <div class="category-group">
    <div class="category-group__header">
      <input
        v-if="selectedCount !== undefined"
        class="category-group__check"
        type="checkbox"
        :checked="allSelected()"
        :indeterminate.prop="!!selectedCount && !allSelected()"
        :aria-label="`Select all in ${category}`"
        @change="$emit('toggle-all', !allSelected())"
      />
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

.category-group__check {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: var(--c-teal);
  cursor: pointer;
  opacity: 0.55;
  transition: opacity var(--transition-fast);
}

.category-group__header:hover .category-group__check,
.category-group__check:checked,
.category-group__check:indeterminate {
  opacity: 1;
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
