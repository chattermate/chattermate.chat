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
  /** Published FAQs in this group (for the header stat). */
  publishedCount?: number
  /** Cards in this group currently selected; undefined hides the select-all. */
  selectedCount?: number
  /** Whether the group body is expanded. */
  open?: boolean
}>()

defineEmits<{
  'toggle-all': [on: boolean]
  toggle: []
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
        @click.stop
        @change="$emit('toggle-all', !allSelected())"
      />
      <button
        class="category-group__toggle"
        type="button"
        :aria-expanded="open"
        @click="$emit('toggle')"
      >
        <svg
          class="category-group__chevron"
          :class="{ 'category-group__chevron--open': open }"
          viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
          stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"
        ><path d="M9 6l6 6-6 6" /></svg>
        <span class="category-group__name">{{ category.toUpperCase() }}</span>
        <span class="category-group__count">
          {{ count }} {{ count === 1 ? 'answer' : 'answers' }}<template v-if="publishedCount !== undefined"> · {{ publishedCount }} published</template>
        </span>
      </button>
      <div class="category-group__rule"></div>
    </div>
    <div v-show="open" class="category-group__cards">
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

.category-group__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 2px 0;
  cursor: pointer;
  color: inherit;
}

.category-group__chevron {
  color: var(--muted2);
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.category-group__chevron--open {
  transform: rotate(90deg);
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

/* ── Mobile ─────────────────────────────────────────────────────────────
   The decorative rule took flex:1 of the header, squeezing the toggle until
   the name broke mid-phrase ("ACCOUNT &" / "SECURITY").

   Grid rather than flex-wrap: the chevron owns column 1 and the text owns
   column 2, so the count sits under the name and the chevron can never be
   pushed onto a line of its own however narrow the screen or long the
   category name. */
@media (max-width: 768px) {
  .category-group__rule {
    display: none;
  }

  .category-group__toggle {
    flex: 1;
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    column-gap: 8px;
    row-gap: 2px;
    text-align: left;
    /* 44px minimum touch target (Apple HIG / WCAG 2.5.8) */
    min-height: 44px;
  }

  .category-group__chevron {
    grid-row: 1 / span 2;
  }

  .category-group__name,
  .category-group__count {
    grid-column: 2;
    min-width: 0;
  }
}
</style>
