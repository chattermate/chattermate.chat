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
 * The modal shell: scrim, panel, titled header with a close button, and the
 * behaviour a dialog owes a keyboard.
 *
 * Extracted because three WhatsApp modals had grown byte-identical copies of
 * all of it — same scrim, same panel, same header, same buttons, same
 * role/aria-modal/tabindex/click.self/keydown.esc scaffolding, differing only
 * in a CSS prefix. Each copy was also missing a focus trap in the same way, and
 * fixing that three times is how the fourth modal ends up without one.
 *
 * Slots: default (body) and `actions` (footer buttons). `width` sizes the panel.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  /** Panel width; the shell caps it to the viewport. */
  width?: string
}>(), { width: '520px' })

const emit = defineEmits<{ (e: 'close'): void }>()

const dialog = ref<HTMLElement | null>(null)
/** Whatever had focus before we opened — where it must go back to. */
let previouslyFocused: HTMLElement | null = null

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Keep Tab inside the dialog.
 *
 * aria-modal="true" tells assistive tech that everything behind this is
 * hidden. Without a trap that's a lie the first time the user tabs past the
 * last button: they land in content their screen reader has been told does not
 * exist, with no way back but Escape.
 */
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
    return
  }
  if (event.key !== 'Tab' || !dialog.value) return

  const focusable = Array.from(
    dialog.value.querySelectorAll<HTMLElement>(FOCUSABLE),
  ).filter((element) => element.offsetParent !== null)
  if (!focusable.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement as HTMLElement | null

  // Wrap at both ends. The container itself is focusable (tabindex="-1") and
  // is where focus starts, so treat it as "before the first".
  if (event.shiftKey && (active === first || active === dialog.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  previouslyFocused = document.activeElement as HTMLElement | null
  dialog.value?.focus()
})

onBeforeUnmount(() => {
  // Returning focus to the trigger is the other half of the contract: without
  // it, closing drops the user back at the top of the document.
  previouslyFocused?.focus?.()
})
</script>

<template>
  <div
    ref="dialog"
    class="bm-scrim"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
    tabindex="-1"
    @click.self="emit('close')"
    @keydown="onKeydown"
  >
    <div class="bm-panel" :style="{ '--bm-width': props.width }">
      <div class="bm-header">
        <h3 class="bm-title">{{ title }}</h3>
        <button class="bm-close" aria-label="Close" @click="emit('close')">×</button>
      </div>

      <div class="bm-body">
        <slot />
      </div>

      <div v-if="$slots.actions" class="bm-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bm-scrim {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.bm-scrim:focus {
  outline: none;
}

.bm-panel {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  width: min(var(--bm-width, 520px), 100%);
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow-y: auto;
}

.bm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.bm-title {
  margin: 0;
  font-family: var(--font-display);
}

.bm-close {
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: var(--muted);
}

.bm-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.bm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
</style>
