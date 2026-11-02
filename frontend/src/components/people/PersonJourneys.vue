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
/** One person's journeys: each step, when they reached it and how it ended. */
import { computed, onMounted, ref } from 'vue'
import { format } from 'date-fns'
import { journeysService } from '@/services/journeys'
import { useFeatureLock } from '@/composables/useFeatureLock'
import type { PersonJourney } from '@/types/journeys'

const props = defineProps<{ customerId: string }>()
const journeys = ref<PersonJourney[]>([])
const { isLocked } = useFeatureLock()
const locked = computed(() => isLocked('journeys'))

onMounted(async () => {
  if (locked.value) return
  try {
    journeys.value = await journeysService.forPerson(props.customerId)
  } catch {
    journeys.value = [] // nothing to show beats a broken drawer
  }
})

const when = (value: string | null) => (value ? format(new Date(value), 'd MMM, HH:mm') : '')
const statusLabel = { active: 'In progress', finished: 'Finished', dismissed: 'Dismissed' } as const

function outcome(step: PersonJourney['steps'][number]): string {
  if (step.done_at) return step.done_by?.startsWith('action:') ? `done · ${step.done_by.slice(7)}` : 'done'
  if (step.skipped_at) return 'skipped'
  if (step.reached_at) return 'on this step'
  return ''
}
</script>

<template>
  <section v-if="!locked && journeys.length" aria-labelledby="person-journeys-title">
    <div id="person-journeys-title" class="pj-title">JOURNEYS</div>
    <div v-for="journey in journeys" :key="journey.journey_id" class="pj" role="group" :aria-label="journey.journey_name">
      <div class="pj-top">
        <span class="pj-name">{{ journey.journey_name }}</span>
        <span class="pj-status" :class="journey.status">{{ statusLabel[journey.status] }}</span>
      </div>
      <ol class="pj-steps">
        <li v-for="step in journey.steps" :key="step.step_id" :class="{ reached: !!step.reached_at, current: step.step_id === journey.current_step_id }">
          <span class="pj-step">{{ step.title }}</span>
          <span class="pj-outcome">{{ outcome(step) }}</span>
          <span class="pj-time">{{ when(step.done_at || step.skipped_at || step.reached_at) }}</span>
        </li>
      </ol>
      <p v-if="journey.goal_at" class="pj-goal">Goal reached {{ when(journey.goal_at) }}</p>
    </div>
  </section>
</template>

<style scoped>
.pj-title { font-size: 10.5px; letter-spacing: .07em; color: var(--muted); margin: 18px 0 12px; }
.pj { border: 1px solid var(--border-color); border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; }
.pj-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.pj-name { font-weight: 600; font-size: 13.5px; }
.pj-status { font-size: 11.5px; font-weight: 600; color: var(--muted); }
.pj-status.finished { color: var(--c-teal); }
.pj-steps { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.pj-steps li { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 8px; font-size: 12.5px; color: var(--muted2); }
.pj-steps li.reached { color: var(--text3); }
.pj-steps li.current .pj-step { font-weight: 600; color: var(--text); }
.pj-step { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pj-outcome, .pj-time { white-space: nowrap; }
.pj-goal { margin: 8px 0 0; font-size: 12.5px; color: var(--c-teal); }
</style>
