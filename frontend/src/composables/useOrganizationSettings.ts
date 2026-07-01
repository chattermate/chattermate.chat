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

import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { organizationService } from '@/services/organization'
import type { Organization, BusinessHoursDict } from '@/types/organization'

export function useOrganizationSettings() {
  const { user } = useAuth()

  const defaultBusinessHours = (): BusinessHoursDict => ({
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '09:00', end: '17:00', enabled: false },
    sunday: { start: '09:00', end: '17:00', enabled: false }
  })

  // Server-stored business_hours may be empty or missing days; merge over the
  // full default so every day key is present (presets + day-rows assume this).
  const normalizeBusinessHours = (raw: unknown): BusinessHoursDict => ({
    ...defaultBusinessHours(),
    ...(raw && typeof raw === 'object' ? raw as Partial<BusinessHoursDict> : {})
  })

  const formData = ref({
    name: '',
    domain: '',
    timezone: '',
    business_hours: defaultBusinessHours(),
    settings: {} as Record<string, any>
  })

  // Add helper functions for business hours
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ] as const

  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4)
    const minute = (i % 4) * 15
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  })

  const loading = ref(false)
  const message = ref('')
  const error = ref('')
  const stats = ref<any>(null)

  const originalData = ref({
    name: '',
    domain: '',
    timezone: '',
    business_hours: {} as BusinessHoursDict,
    settings: {}
  })

  const hasChanges = computed(() => {
    return formData.value.name !== originalData.value.name ||
           formData.value.domain !== originalData.value.domain ||
           formData.value.timezone !== originalData.value.timezone ||
           JSON.stringify(formData.value.business_hours) !== JSON.stringify(originalData.value.business_hours) ||
           JSON.stringify(formData.value.settings) !== JSON.stringify(originalData.value.settings)
  })

  const loadOrganizationData = async () => {
    if (user.value?.organization_id) {
      try {
        loading.value = true
        const [org, orgStats] = await Promise.all([
          organizationService.getOrganization(user.value.organization_id),
          organizationService.getOrganizationStats(user.value.organization_id)
        ])
        
        formData.value = {
          name: org.name,
          domain: org.domain,
          timezone: org.timezone,
          business_hours: normalizeBusinessHours(org.business_hours),
          settings: org.settings ? JSON.parse(JSON.stringify(org.settings)) : {}
        }
        
        originalData.value = JSON.parse(JSON.stringify(formData.value))
        
        stats.value = orgStats
      } catch (err: any) {
        error.value = err.message || 'Failed to load organization data'
      } finally {
        loading.value = false
      }
    }
  }

  const updateOrganization = async () => {
    if (!user.value?.organization_id || !hasChanges.value) {
      message.value = 'No changes to save'
      return
    }

    loading.value = true
    error.value = ''
    message.value = ''

    try {
      const updateData: Partial<Organization> = {}
      
      if (formData.value.name !== originalData.value.name) {
        updateData.name = formData.value.name
      }
      
      if (formData.value.domain !== originalData.value.domain) {
        updateData.domain = formData.value.domain
      }
      
      if (formData.value.timezone !== originalData.value.timezone) {
        updateData.timezone = formData.value.timezone
      }

      if (JSON.stringify(formData.value.business_hours) !== JSON.stringify(originalData.value.business_hours)) {
        updateData.business_hours = JSON.parse(JSON.stringify(formData.value.business_hours))
      }

      if (JSON.stringify(formData.value.settings) !== JSON.stringify(originalData.value.settings)) {
        updateData.settings = JSON.parse(JSON.stringify(formData.value.settings))
      }

      await organizationService.updateOrganization(user.value.organization_id, updateData)
      message.value = 'Organization updated successfully'
      
      originalData.value = JSON.parse(JSON.stringify(formData.value))
    } catch (err: any) {
      error.value = err.message || 'Failed to update organization'
    } finally {
      loading.value = false
    }
  }

  return {
    formData,
    loading,
    message,
    error,
    stats,
    hasChanges,
    days,
    timeOptions,
    loadOrganizationData,
    updateOrganization
  }
} 