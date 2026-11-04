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
/** Shipped journey templates, by group. Using one makes a draft to adjust. */
import { computed, ref } from 'vue'
import type { JourneyTemplate } from '@/types/journeys'

const props = defineProps<{ templates: JourneyTemplate[]; busy: boolean }>()
const emit = defineEmits<{ (e: 'use', key: string): void; (e: 'blank'): void; (e: 'back'): void }>()

const query = ref('')
const group = ref<string | null>(null)
const groups = computed(() => [...new Set(props.templates.map((t) => t.group))])
const shown = computed(() => props.templates.filter((t) =>
  (!group.value || t.group === group.value)
  && (!query.value || `${t.name} ${t.summary}`.toLowerCase().includes(query.value.toLowerCase()))))
</script>

<template>
  <div class="gallery">
    <header class="head">
      <button type="button" class="btn ghost" @click="emit('back')">← Journeys</button>
      <h3>Templates</h3>
      <span class="spacer"></span>
      <input v-model="query" class="input search" placeholder="Search templates" aria-label="Search templates" />
    </header>
    <p class="hint">{{ templates.length }} templates. Pick one close to your product; you map its actions to yours after.</p>
    <div class="filters" role="group" aria-label="Template groups">
      <button type="button" class="filter" :class="{ on: !group }" @click="group = null">All {{ templates.length }}</button>
      <button v-for="g in groups" :key="g" type="button" class="filter" :class="{ on: group === g }" @click="group = g">{{ g }}</button>
    </div>
    <div class="grid">
      <article v-for="template in shown" :key="template.key" class="card">
        <h4>{{ template.name }}</h4>
        <p class="meta">{{ template.steps.length }} steps · {{ Object.keys(template.actions).length }} actions</p>
        <p class="summary">{{ template.summary }}</p>
        <ol class="flow"><li v-for="title in template.steps" :key="title">{{ title }}</li></ol>
        <footer>
          <span class="hint">Goal <code v-if="template.goal_event">{{ template.goal_event }}</code><template v-else>the original journey's</template></span>
          <button type="button" class="btn" :disabled="busy" :aria-label="`Use ${template.name}`" @click="emit('use', template.key)">Use</button>
        </footer>
      </article>
    </div>
    <button type="button" class="link" @click="emit('blank')">or start a blank journey</button>
  </div>
</template>

<style scoped src="../actions/actions.css"></style>
<style scoped>
.gallery { display: flex; flex-direction: column; gap: 14px; }
.head { display: flex; align-items: center; gap: 10px; }
.head h3 { margin: 0; font-size: 17px; }
.spacer { flex: 1; }
.search { max-width: 260px; }
.hint { margin: 0; font-size: 12.5px; color: var(--muted2); }
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filter { padding: 6px 12px; border-radius: 999px; font-size: 13px; color: var(--muted); background: var(--o04); border: 1px solid var(--o08); cursor: pointer; }
.filter.on { color: var(--accent-ink); background: var(--accent-bg-08); border-color: var(--accent-border); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.card { border: 1px solid var(--border-color); border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; background: var(--surface); }
.card h4 { margin: 0; font-size: 15px; }
.meta, .summary { margin: 0; font-size: 12.5px; color: var(--muted); }
.flow { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 6px; }
.flow li { font-size: 12px; padding: 3px 8px; border-radius: 8px; background: var(--o05); color: var(--text3); }
footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; }
code { font-family: var(--font-mono); font-size: 11.5px; }
.link { align-self: flex-start; background: none; border: none; color: var(--accent-ink); cursor: pointer; padding: 0; font-size: 13px; }
</style>
