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
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  id: string
  title: string
  // One line of what's set inside, so a closed section still says something.
  summary: string
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const root = ref<HTMLElement | null>(null)

function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const { overflowY } = getComputedStyle(parent)
    if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) return parent
  }
  return null
}

// Opening one section closes another above it, which pulls this one up out of view.
// Bring its header back to the top of whatever scrolls it.
watch(() => props.open, async (open) => {
  if (!open) return
  await nextTick()
  const section = root.value
  if (!section) return
  const container = scrollParent(section)
  if (container) {
    container.scrollTop += section.getBoundingClientRect().top - container.getBoundingClientRect().top
  } else {
    section.scrollIntoView({ block: 'start' })
  }
})
</script>

<template>
  <section ref="root" class="form-section customization-section" :class="{ open }" :aria-labelledby="`${id}-title`">
    <h3 class="section-heading">
      <button
        type="button"
        class="section-toggle"
        :aria-expanded="open"
        :aria-controls="`${id}-body`"
        @click="emit('toggle')"
      >
        <span :id="`${id}-title`" class="section-title">{{ title }}</span>
        <span class="section-summary">{{ summary }}</span>
        <font-awesome-icon icon="fa-solid fa-chevron-down" class="section-chevron" aria-hidden="true" />
      </button>
    </h3>
    <div v-show="open" :id="`${id}-body`" class="section-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.form-section.customization-section {
  padding: 0;
}

.section-heading {
  margin: 0;
}

.section-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  border-radius: inherit;
}

.section-toggle:focus-visible {
  outline: 2px solid var(--accent-ink);
  outline-offset: -2px;
}

.section-title {
  flex: none;
}

.section-summary {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  font-family: var(--font-sans);
  font-size: 12.5px;
  font-weight: 400;
  color: var(--muted);
}

.open .section-summary {
  visibility: hidden;
}

.section-chevron {
  flex: none;
  font-size: 12px;
  color: var(--muted);
  transition: transform var(--transition-fast);
}

.open .section-chevron {
  transform: rotate(180deg);
}

.section-body {
  padding: 0 24px 24px;
}
</style>
