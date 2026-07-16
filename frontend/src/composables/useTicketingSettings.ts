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

import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { ticketService } from '@/services/tickets'
import type { TicketSettings } from '@/types/ticket'

export function useTicketingSettings() {
  const settings = ref<TicketSettings | null>(null)
  const isLoading = ref(true)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const planGated = ref(false)

  async function load() {
    isLoading.value = true
    try {
      settings.value = await ticketService.getSettings()
      error.value = null
      planGated.value = false
    } catch (e: any) {
      planGated.value = /plan/i.test(e?.message || '')
      error.value = e?.message || 'Failed to load ticketing settings'
    } finally {
      isLoading.value = false
    }
  }

  async function save(patch: Partial<TicketSettings>) {
    if (!settings.value || isSaving.value) return
    isSaving.value = true
    const previous = { ...settings.value }
    Object.assign(settings.value, patch)
    try {
      settings.value = await ticketService.updateSettings(patch)
      toast.success('Ticketing settings saved')
    } catch (e: any) {
      settings.value = previous
      toast.error(e?.message || 'Failed to save ticketing settings')
    } finally {
      isSaving.value = false
    }
  }

  onMounted(load)

  return { settings, isLoading, isSaving, error, planGated, load, save }
}
