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
 * A button that opens a menu of actions (useMenu's keyboard model). The
 * trigger's content comes from the default slot; items with `checked` are
 * radio choices (an assignee), the rest plain actions.
 */
import { ref } from 'vue'
import { useMenu } from '@/composables/useMenu'

export interface ActionMenuItem {
  id: string
  label: string
  /** A choice among several: checked is the current one */
  checked?: boolean
  disabled?: boolean
  /** A divider above this item */
  separated?: boolean
}

withDefaults(defineProps<{
  /** The trigger's accessible name */
  label: string
  items: ActionMenuItem[]
  /** Which edge of the trigger the menu lines up with */
  align?: 'start' | 'end'
  triggerClass?: string
}>(), { align: 'end', triggerClass: '' })

const emit = defineEmits<{ (e: 'select', id: string): void }>()

const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const { open, toggle, close, onTriggerKeydown, onMenuKeydown } = useMenu(root, trigger, menu)

function pick(id: string) {
  close(true)
  emit('select', id)
}
</script>

<template>
  <div ref="root" class="action-menu">
    <button
      ref="trigger"
      type="button"
      :class="triggerClass"
      :aria-label="label"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <slot />
    </button>
    <ul
      v-if="open"
      ref="menu"
      class="menu"
      :class="`align-${align}`"
      role="menu"
      :aria-label="label"
      @keydown="onMenuKeydown"
    >
      <template v-for="item in items" :key="item.id">
        <li v-if="item.separated" class="divider" role="separator"></li>
        <li role="none">
          <button
            type="button"
            class="item"
            :role="item.checked === undefined ? 'menuitem' : 'menuitemradio'"
            :aria-checked="item.checked === undefined ? undefined : item.checked"
            :disabled="item.disabled"
            tabindex="-1"
            @click="pick(item.id)"
          >
            <span class="check" aria-hidden="true">{{ item.checked ? '✓' : '' }}</span>
            <span class="item-label">{{ item.label }}</span>
          </button>
        </li>
      </template>
    </ul>
  </div>
</template>

<style scoped>
.action-menu {
  position: relative;
  display: inline-flex;
}

.menu {
  position: absolute;
  top: calc(100% + 6px);
  z-index: var(--z-dropdown, 50);
  min-width: 200px;
  max-width: 280px;
  max-height: min(360px, 60vh);
  overflow-y: auto;
  margin: 0;
  padding: 6px;
  list-style: none;
  border-radius: 10px;
  border: 1px solid var(--o10);
  background: var(--surface);
  box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.3));
}

.align-end {
  right: 0;
}

.align-start {
  left: 0;
}

.item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 10px 0 6px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text2);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.item:hover:not(:disabled),
.item:focus-visible {
  background: var(--o06);
  color: var(--text);
  outline: none;
}

.item:disabled {
  color: var(--muted2);
  cursor: not-allowed;
}

.check {
  flex: 0 0 14px;
  color: var(--accent-ink);
  font-size: 12px;
}

.item-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.divider {
  height: 1px;
  margin: 4px 6px;
  background: var(--o08);
}
</style>
