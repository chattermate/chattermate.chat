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
/** Where users drop off in one journey, and who is stuck on a step. */
import { computed, onMounted, ref, watch } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { journeysService } from '@/services/journeys'
import { apiErrorMessage } from '@/utils/apiError'
import type { Funnel, Journey, StuckUser } from '@/types/journeys'
import { formatDuration } from './journeyModel'

const props = defineProps<{ agentId: string; journey: Journey }>()
const emit = defineEmits<{ (e: 'back'): void; (e: 'openStep', stepId: string): void }>()

const DAY_OPTIONS = [7, 30, 90]
const days = ref(30)
const funnel = ref<Funnel | null>(null)
const error = ref<string | null>(null)
const stuckStep = ref<string | null>(null)
const stuck = ref<StuckUser[]>([])

async function load() {
  error.value = null
  try {
    funnel.value = await journeysService.funnel(props.agentId, props.journey.id, days.value)
  } catch (e) {
    error.value = apiErrorMessage(e, "Couldn't load the funnel.")
  }
}
onMounted(load)
watch(days, load)

const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0)

/** The step that loses the most users, to point at. */
const worst = computed(() => {
  const steps = funnel.value?.steps ?? []
  const ranked = [...steps].filter((s) => s.reached).sort((a, b) => b.dropped / b.reached - a.dropped / a.reached)
  return ranked[0] && ranked[0].dropped ? ranked[0].step_id : null
})

async function showStuck(stepId: string) {
  stuckStep.value = stepId
  stuck.value = []
  try {
    const users = await journeysService.stuckUsers(props.agentId, props.journey.id, stepId)
    // Another step was picked while this one loaded.
    if (stuckStep.value === stepId) stuck.value = users
  } catch {
    if (stuckStep.value === stepId) error.value = "Couldn't load the users on this step."
  }
}

async function downloadCsv() {
  if (!stuckStep.value) return
  const blob = await journeysService.stuckUsersCsv(props.agentId, props.journey.id, stuckStep.value)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.journey.key}-${stuckStep.value}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="funnel">
    <header class="head">
      <button type="button" class="btn ghost" @click="emit('back')">← Journeys</button>
      <h3>{{ journey.name }}</h3>
      <span class="spacer"></span>
      <select v-model.number="days" class="input days" aria-label="Period">
        <option v-for="d in DAY_OPTIONS" :key="d" :value="d">Last {{ d }} days</option>
      </select>
    </header>

    <p v-if="error" class="error">{{ error }}</p>
    <template v-else-if="funnel">
      <div class="kpis">
        <div class="kpi" role="group" aria-label="Started"><span>Started</span><b>{{ funnel.started }}</b></div>
        <div class="kpi" role="group" aria-label="Finished all steps"><span>Finished all steps</span><b>{{ funnel.finished }}</b><small>{{ percent(funnel.finished, funnel.started) }}% of started</small></div>
        <div class="kpi" role="group" aria-label="Goal reached"><span>Goal reached</span><b>{{ funnel.goal_reached }}</b><small>{{ journey.goal_event || 'no goal set' }}</small></div>
        <div class="kpi" role="group" aria-label="Median time to finish"><span>Median time to finish</span><b>{{ formatDuration(funnel.median_seconds_to_finish) }}</b></div>
      </div>

      <table class="table">
        <thead>
          <tr><th>Step</th><th>Reached / done</th><th class="num">Reached</th><th class="num">Done</th><th class="num">Drop-off</th><th class="num">Median time</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="step in funnel.steps" :key="step.step_id" :class="{ worst: step.step_id === worst }">
            <td><button type="button" class="link" @click="emit('openStep', step.step_id)">{{ step.title }}</button>
              <span v-if="step.step_id === worst" class="worst-tag">Most lost</span></td>
            <td>
              <div class="bar" role="img" :aria-label="`${step.done} of ${step.reached} done`">
                <span class="reach" :style="{ width: percent(step.reached, funnel.started) + '%' }"></span>
                <span class="done" :style="{ width: percent(step.done, funnel.started) + '%' }"></span>
              </div>
            </td>
            <td class="num">{{ step.reached }}</td>
            <td class="num">{{ step.done }}</td>
            <td class="num">{{ percent(step.dropped, step.reached) }}%</td>
            <td class="num">{{ formatDuration(step.median_seconds) }}</td>
            <td><button v-if="step.dropped" type="button" class="link" @click="showStuck(step.step_id)">Who's stuck</button></td>
          </tr>
        </tbody>
      </table>
      <p class="hint">Counts are reported by the widget. Drop-off includes users still on the step.</p>

      <section v-if="stuckStep" class="stuck" aria-label="Users on this step">
        <div class="stuck-head">
          <h4>Users on this step · {{ stuck.length }}</h4>
          <button type="button" class="btn" :disabled="!stuck.length" @click="downloadCsv">Download CSV</button>
        </div>
        <p v-if="!stuck.length" class="hint">Nobody is waiting on this step right now.</p>
        <ul v-else>
          <li v-for="user in stuck" :key="user.customer_id">
            <span>{{ user.name || user.email || 'Anonymous visitor' }}</span>
            <span class="muted">{{ user.email }}</span>
            <span class="muted">last seen {{ formatDistanceToNow(new Date(user.last_seen_at), { addSuffix: true }) }}</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped src="../actions/actions.css"></style>
<style scoped>
.funnel { display: flex; flex-direction: column; gap: 16px; }
.head { display: flex; align-items: center; gap: 10px; }
.head h3 { margin: 0; font-size: 17px; }
.spacer { flex: 1; }
.days { width: auto; }
.error { color: var(--c-coral); }
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.kpi { border: 1px solid var(--border-color); border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 2px; font-size: 12.5px; color: var(--muted); }
.kpi b { font-size: 24px; color: var(--text); }
.kpi small { color: var(--muted2); }
.table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.table th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted2); padding: 8px; }
.table td { padding: 10px 8px; border-top: 1px solid var(--o06); }
.table .num { text-align: right; font-family: var(--font-mono); }
tr.worst { background: var(--coral-bg); }
.worst-tag { margin-left: 6px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; color: var(--c-coral); }
.bar { position: relative; height: 16px; min-width: 120px; }
.bar span { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 5px; }
.reach { background: var(--o08); }
.done { background: var(--accent-solid); opacity: 0.85; }
.link { background: none; border: none; padding: 0; color: var(--accent-ink); cursor: pointer; font: inherit; }
.hint { margin: 0; font-size: 12.5px; color: var(--muted2); }
.stuck { border: 1px solid var(--border-color); border-radius: 14px; padding: 14px 16px; }
.stuck-head { display: flex; align-items: center; justify-content: space-between; }
.stuck h4 { margin: 0; }
.stuck ul { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.stuck li { display: flex; gap: 12px; font-size: 13px; flex-wrap: wrap; }
.muted { color: var(--muted2); }
@media (max-width: 768px) {
  .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .table th:nth-child(2), .table td:nth-child(2) { display: none; }
}
</style>
