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
import { computed } from 'vue'

const props = defineProps<{
  /** Pages stored so far by what is still being read. */
  pages: number
  /** Only documents are being read, no website. */
  documents?: boolean
  /** The first page is taking longer than it usually does. */
  slow?: boolean
}>()

const title = computed(() => {
  if (props.pages) return `${props.pages} ${props.pages === 1 ? 'page' : 'pages'} learned`
  return props.documents ? 'Reading your document…' : 'Reading your website…'
})

const detail = computed(() => {
  if (props.pages) return 'You can try your agent now. It keeps reading the rest.'
  if (props.slow) return 'This is taking longer than usual. You can carry on; it keeps reading.'
  return 'This usually takes a minute or two. You can try your agent once the first page is in.'
})
</script>

<template>
  <div class="reading" :class="{ ready: pages > 0 }">
    <div class="art" aria-hidden="true">
      <span v-for="n in 3" :key="n" class="sheet" :style="{ '--i': n - 1 }">
        <i /><i /><i />
      </span>
      <span class="beam" />
    </div>
    <div class="words" role="status">
      <p :key="title" class="title">{{ title }}</p>
      <p class="detail">{{ detail }}</p>
    </div>
    <div class="track" aria-hidden="true"><span class="runner" /></div>
  </div>
</template>

<style scoped>
.reading {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: 20px;
  row-gap: 16px;
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--o12);
  border-radius: var(--radius-input);
  transition: border-color 0.3s ease;
}

.reading.ready {
  border-color: var(--accent-ink);
}

/* A small stack of pages with a light passing over it */
.art {
  position: relative;
  width: 72px;
  height: 72px;
  overflow: hidden;
}

.sheet {
  position: absolute;
  top: calc(4px + var(--i) * 6px);
  left: calc(4px + var(--i) * 8px);
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 44px;
  height: 52px;
  padding: 10px 8px;
  background: var(--bg);
  border: 1px solid var(--o14);
  border-radius: 6px;
  animation: lift 2.4s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.2s);
}

.sheet i {
  height: 3px;
  background: var(--o14);
  border-radius: 2px;
}

.sheet i:last-child {
  width: 60%;
}

.beam {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-solid);
  box-shadow: 0 0 12px 3px var(--accent-solid);
  animation: scan 1.8s ease-in-out infinite;
}

.words {
  min-width: 0;
}

.title {
  margin: 0 0 4px;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  animation: arrive 0.4s ease-out;
}

.detail {
  margin: 0;
  font-size: 13.5px;
  color: var(--muted);
}

.track {
  grid-column: 1 / -1;
  height: 4px;
  overflow: hidden;
  background: var(--o08);
  border-radius: var(--radius-pill);
}

.runner {
  display: block;
  width: 35%;
  height: 100%;
  background: var(--accent-solid);
  border-radius: inherit;
  animation: run 1.6s ease-in-out infinite;
}

@keyframes scan {
  0%, 100% { top: 4px; }
  50% { top: 66px; }
}

@keyframes lift {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes run {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(290%); }
}

@keyframes arrive {
  from { opacity: 0.4; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .sheet,
  .beam,
  .title,
  .runner {
    animation: none;
  }

  .beam {
    display: none;
  }

  .runner {
    width: 100%;
    opacity: 0.4;
  }
}
</style>
