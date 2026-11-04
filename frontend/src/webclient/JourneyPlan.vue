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
 * A journey as a plan the guide works through: a slim card pinned to the top
 * of the chat with where the user is and how far along; tapping it shows every
 * step, ticked off as it's done, with Skip and Hide.
 */
import { computed, ref, watch } from 'vue'
import type { JourneyProgress } from './journeys/journeyClient'

const props = defineProps<{ progress: JourneyProgress }>()
const emit = defineEmits<{ (e: 'skip'): void; (e: 'hide'): void }>()

// Folded by default: pinned open it would cover the conversation it sits over.
const open = ref(false)
watch(() => props.progress.finished, (finished) => { if (finished) open.value = false })

const done = computed(() => Math.min(props.progress.index, props.progress.count))
const percent = computed(() => (props.progress.count ? Math.round((done.value / props.progress.count) * 100) : 0))

const steps = computed(() =>
  props.progress.titles.map((title, i) => ({
    title,
    state: i < done.value ? 'done' : i === props.progress.index ? 'now' : 'todo',
  })),
)
</script>

<template>
  <!-- The pin spans the chat's full width in its colour, so nothing shows
       around the card's corners as messages scroll under it. -->
  <div class="cm-plan-pin">
  <section class="cm-plan" :class="{ finished: progress.finished }" :aria-label="`Guide: ${progress.name}`">
    <button type="button" class="cm-plan-head" :aria-expanded="open" @click="open = !open">
      <span class="cm-plan-label">
        <span class="cm-plan-name">{{ progress.name }}</span>
        <span v-if="!progress.finished && progress.title" class="cm-plan-now">{{ progress.title }}</span>
      </span>
      <span class="cm-plan-count">{{ progress.finished ? 'Done' : `${done} of ${progress.count}` }}</span>
      <svg class="cm-plan-chevron" :class="{ open }" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
    </button>
    <div
      class="cm-plan-bar"
      role="progressbar"
      :aria-valuenow="done"
      aria-valuemin="0"
      :aria-valuemax="progress.count"
      :aria-label="`${done} of ${progress.count} done`"
    ><span :style="{ width: `${percent}%` }"></span></div>
    <template v-if="open">
      <ol v-if="steps.length" class="cm-plan-steps">
        <li v-for="(step, i) in steps" :key="i" :class="step.state" :aria-current="step.state === 'now' ? 'step' : undefined">
          <svg v-if="step.state === 'done'" class="cm-plan-icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" class="fill" /><path d="M7.5 12.5l3 3 6-6.5" class="tick" /></svg>
          <svg v-else-if="step.state === 'now'" class="cm-plan-icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" class="ring" /><circle cx="12" cy="12" r="4" class="fill" /></svg>
          <svg v-else class="cm-plan-icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" class="ring todo" /></svg>
          <span class="cm-plan-title">{{ step.title }}</span>
          <span v-if="step.state === 'done'" class="cm-visually-hidden">(done)</span>
        </li>
      </ol>
      <div class="cm-plan-actions">
        <button v-if="progress.skippable" type="button" @click="emit('skip')">Skip this step</button>
        <button type="button" @click="emit('hide')">Hide guide</button>
      </div>
    </template>
  </section>
  </div>
</template>

<style scoped>
.cm-plan-pin {
  position: sticky;
  top: calc(-1 * var(--space-md, 16px));
  z-index: 1;
  flex-shrink: 0;
  margin: calc(-1 * var(--space-md, 16px)) 0 4px;
  padding: var(--space-md, 16px) 0 6px;
  background: var(--cm-card);
}
.cm-plan {
  padding: 8px 12px 10px;
  border: 1px solid var(--cm-hairline);
  border-radius: var(--cm-radius);
  background: var(--cm-card);
  color: var(--cm-text);
  font-family: var(--cm-body-font);
  font-size: 13px;
}
.cm-plan-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 2px 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.cm-plan-label { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.cm-plan-name, .cm-plan-now { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cm-plan-name { font-weight: 600; }
.cm-plan-now { color: var(--cm-muted); font-size: 12px; }
.cm-plan-count { color: var(--cm-muted); font-size: 12px; }
.cm-plan-chevron { color: var(--cm-muted); transition: transform .2s; }
.cm-plan-chevron.open { transform: rotate(180deg); }
.cm-plan-bar {
  height: 4px;
  margin-top: 8px;
  border-radius: 4px;
  background: var(--cm-hairline);
  overflow: hidden;
}
.cm-plan-bar span {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: var(--cm-accent);
  transition: width .4s ease;
}
.cm-plan-steps {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.cm-plan-steps li { display: flex; align-items: center; gap: 9px; line-height: 1.35; }
.cm-plan-steps li.done .cm-plan-title { color: var(--cm-muted); text-decoration: line-through; }
.cm-plan-steps li.now .cm-plan-title { font-weight: 600; }
.cm-plan-steps li.todo .cm-plan-title { color: var(--cm-muted); }
.cm-plan-icon { width: 17px; height: 17px; flex-shrink: 0; }
.cm-plan-icon .fill { fill: var(--cm-accent); }
.cm-plan-icon .tick { fill: none; stroke: var(--cm-on-accent); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.cm-plan-icon .ring { fill: none; stroke: var(--cm-accent); stroke-width: 2.2; }
.cm-plan-icon .ring.todo { stroke: var(--cm-hairline); stroke-width: 2; }
.cm-plan-actions { display: flex; gap: 14px; margin-top: 10px; }
.cm-plan-actions button {
  padding: 2px 0;
  border: none;
  background: none;
  color: var(--cm-muted);
  font: inherit;
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
}
.cm-plan button:focus-visible { outline: 2px solid var(--cm-accent); outline-offset: 2px; border-radius: 4px; }
.cm-visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
