/*
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
*/

import { ref } from 'vue'
import { journeysService } from '@/services/journeys'
import { apiErrorMessage } from '@/utils/apiError'
import type { Journey, JourneyInput, JourneyStatus } from '@/types/journeys'

/** An agent's journeys for the dashboard: the list and every change to it. */
export function useJourneysAdmin(agentId: () => string) {
  const journeys = ref<Journey[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const loadError = ref<string | null>(null)

  const replace = (saved: Journey) => {
    journeys.value = journeys.value.some((j) => j.id === saved.id)
      ? journeys.value.map((j) => (j.id === saved.id ? saved : j))
      : [...journeys.value, saved]
  }

  async function load() {
    loading.value = true
    loadError.value = null
    try {
      journeys.value = await journeysService.list(agentId())
    } catch (error) {
      loadError.value = apiErrorMessage(error, "Couldn't load journeys.")
    } finally {
      loading.value = false
    }
  }

  async function guarded<T>(work: () => Promise<T>, fallback: string): Promise<T> {
    saving.value = true
    try {
      return await work()
    } catch (error) {
      throw new Error(apiErrorMessage(error, fallback))
    } finally {
      saving.value = false
    }
  }

  const save = (input: JourneyInput, id?: string) => guarded(async () => {
    const saved = id ? await journeysService.update(agentId(), id, input) : await journeysService.create(agentId(), input)
    replace(saved)
    return saved
  }, "Couldn't save the journey.")

  const fromTemplate = (templateKey: string) => guarded(async () => {
    const saved = await journeysService.fromTemplate(agentId(), templateKey)
    replace(saved)
    return saved
  }, "Couldn't add that template.")

  const setStatus = (id: string, status: JourneyStatus) => guarded(async () => {
    const saved = await journeysService.setStatus(agentId(), id, status)
    replace(saved)
    return saved
  }, "Couldn't change the journey.")

  /** Move a journey up (-1) or down (+1) in priority. */
  const move = (id: string, delta: -1 | 1) => guarded(async () => {
    const ids = journeys.value.map((j) => j.id)
    const from = ids.indexOf(id)
    const to = from + delta
    if (from < 0 || to < 0 || to >= ids.length) return journeys.value
    ;[ids[from], ids[to]] = [ids[to], ids[from]]
    journeys.value = await journeysService.reorder(agentId(), ids)
    return journeys.value
  }, "Couldn't reorder journeys.")

  const remove = (id: string) => guarded(async () => {
    await journeysService.remove(agentId(), id)
    journeys.value = journeys.value.filter((j) => j.id !== id)
  }, "Couldn't delete the journey.")

  return { journeys, loading, saving, loadError, load, save, fromTemplate, setStatus, move, remove }
}
