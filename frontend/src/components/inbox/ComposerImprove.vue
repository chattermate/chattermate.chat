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
 * "Improve" for a draft reply: the AI rewrites it clearer, friendlier, shorter
 * or spelled right, with the same facts. Undo puts the draft back, until it
 * is edited again.
 */
import { computed, ref } from 'vue'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { navIconSvg } from '@/components/layout/navIcons'
import type { ImproveStyle } from '@/services/inboxAssist'

const props = defineProps<{
  text: string
  /** Rewrites the draft; throws when it can't (and says so itself) */
  improve: (text: string, style: ImproveStyle) => Promise<string>
  /** Not on this plan: the button explains instead */
  locked: boolean
}>()

const emit = defineEmits<{
  (e: 'rewrite', text: string): void
  (e: 'locked'): void
}>()

const STYLES: Array<{ id: ImproveStyle; label: string }> = [
  { id: 'clearer', label: 'Make it clearer' },
  { id: 'friendlier', label: 'Make it friendlier' },
  { id: 'shorter', label: 'Make it shorter' },
  { id: 'fix', label: 'Fix spelling and grammar' },
]

const busy = ref(false)
const last = ref<{ before: string; after: string } | null>(null)
const canUndo = computed(() => !!last.value && props.text === last.value.after)

async function pick(id: string): Promise<void> {
  const style = STYLES.find((s) => s.id === id)?.id
  if (!style || busy.value) return
  busy.value = true
  const before = props.text
  try {
    const after = await props.improve(before, style)
    // Typed on while the AI worked: what they typed wins over a stale rewrite
    if (props.text !== before) return
    emit('rewrite', after)
    last.value = { before, after }
  } catch {
    // improve() said what went wrong; the draft is as it was
  } finally {
    busy.value = false
  }
}

function undo(): void {
  if (!last.value) return
  emit('rewrite', last.value.before)
  last.value = null
}
</script>

<template>
  <button v-if="locked" type="button" class="tool" aria-label="Improve with AI" title="Improve with AI" @click="emit('locked')">
    <span aria-hidden="true" v-html="navIconSvg('sparkle', 16)"></span>
  </button>
  <span v-else-if="busy" class="tool busy" role="status" aria-label="Improving the reply">
    <span aria-hidden="true" v-html="navIconSvg('sparkle', 16)"></span>
  </span>
  <ActionMenu v-else label="Improve with AI" :items="STYLES" align="start" side="above" trigger-class="tool" @select="pick">
    <span aria-hidden="true" v-html="navIconSvg('sparkle', 16)"></span>
  </ActionMenu>
  <button v-if="canUndo" type="button" class="undo" @click="undo">Undo</button>
</template>

<style scoped>
.busy {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  50% { opacity: 0.4; }
}

@media (prefers-reduced-motion: reduce) {
  .busy { animation: none; }
}

.undo {
  height: 26px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: var(--accent-bg-08);
  color: var(--accent-ink);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.undo:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: 1px;
}
</style>
