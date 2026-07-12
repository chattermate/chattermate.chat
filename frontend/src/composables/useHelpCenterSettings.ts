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

import { computed, ref, watch, type Ref } from 'vue'
import { toast } from 'vue-sonner'

import { faqService } from '@/services/faq'
import type { HelpCenterSettings, HelpCenterSettingsUpdate } from '@/types/faq'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const AUTOSAVE_DEBOUNCE_MS = 800
const MAX_LOGO_BYTES = 2 * 1024 * 1024

/** Appearance/settings editing with debounced autosave — the design has no
 * Save button ("changes apply instantly to your published help center"). */
export function useHelpCenterSettings(settings: Ref<HelpCenterSettings | null>) {
  const saveState = ref<SaveState>('idle')

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let saveInFlight = false
  let trailingSave: HelpCenterSettingsUpdate | null = null
  let suppressWatch = false

  const brandColor = computed(() => settings.value?.brand_color || '#4338CA')

  function applyResponse(updated: HelpCenterSettings): void {
    suppressWatch = true
    settings.value = updated
    // Release after the watcher has seen (and ignored) this assignment.
    setTimeout(() => {
      suppressWatch = false
    }, 0)
  }

  async function save(payload: HelpCenterSettingsUpdate): Promise<void> {
    if (saveInFlight) {
      trailingSave = { ...(trailingSave || {}), ...payload }
      return
    }
    saveInFlight = true
    saveState.value = 'saving'
    try {
      applyResponse(await faqService.updateSettings(payload))
      saveState.value = 'saved'
    } catch (error: any) {
      saveState.value = 'error'
      toast.error(error.message)
    } finally {
      saveInFlight = false
      if (trailingSave) {
        const queued = trailingSave
        trailingSave = null
        void save(queued)
      }
    }
  }

  /** Debounced path for text inputs (links, CTA, labels). */
  function queueSave(payload: HelpCenterSettingsUpdate): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => void save(payload), AUTOSAVE_DEBOUNCE_MS)
  }

  /** Immediate path for discrete actions (swatch click, toggles, selects). */
  async function saveNow(payload: HelpCenterSettingsUpdate): Promise<void> {
    if (debounceTimer) clearTimeout(debounceTimer)
    await save(payload)
  }

  // Deep-watch branding fields the inputs mutate in place (header_links rows).
  watch(
    () => settings.value?.header_links,
    (links, previous) => {
      if (suppressWatch || links === undefined || previous === undefined) return
      queueSave({ header_links: links })
    },
    { deep: true },
  )

  async function uploadLogo(file: File): Promise<void> {
    if (file.size > MAX_LOGO_BYTES) {
      toast.error('Logo must be 2 MB or smaller')
      return
    }
    saveState.value = 'saving'
    try {
      applyResponse(await faqService.uploadLogo(file))
      saveState.value = 'saved'
    } catch (error: any) {
      saveState.value = 'error'
      toast.error(error.message)
    }
  }

  async function removeLogo(): Promise<void> {
    saveState.value = 'saving'
    try {
      applyResponse(await faqService.removeLogo())
      saveState.value = 'saved'
    } catch (error: any) {
      saveState.value = 'error'
      toast.error(error.message)
    }
  }

  // Domain lifecycle (explicit Verify button — never autosaved).
  const domainBusy = ref(false)

  async function setDomain(domain: string): Promise<void> {
    domainBusy.value = true
    try {
      const result = await faqService.setDomain(domain)
      if (settings.value) settings.value = { ...settings.value, domain: result }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      domainBusy.value = false
    }
  }

  async function verifyDomain(): Promise<void> {
    domainBusy.value = true
    try {
      const result = await faqService.verifyDomain()
      if (settings.value) settings.value = { ...settings.value, domain: result }
      if (result.domain_status === 'verified') {
        toast.success('Domain verified')
      } else {
        toast.info('Records not visible yet — DNS changes can take a few minutes to propagate')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      domainBusy.value = false
    }
  }

  async function removeDomain(): Promise<void> {
    domainBusy.value = true
    try {
      const result = await faqService.removeDomain()
      if (settings.value) settings.value = { ...settings.value, domain: result }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      domainBusy.value = false
    }
  }

  return {
    saveState,
    brandColor,
    queueSave,
    saveNow,
    uploadLogo,
    removeLogo,
    domainBusy,
    setDomain,
    verifyDomain,
    removeDomain,
  }
}
