import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { widgetAppService } from '@/services/widget-app'
import type { WidgetApp, WidgetAppCreate, WidgetAppUpdate } from '@/types/widget-app'

export function useWidgetApps() {
  const allApps = ref<WidgetApp[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Modal states
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const showApiKeyModal = ref(false)

  // Selected app state
  const selectedApp = ref<WidgetApp | null>(null)
  const newApiKey = ref<string | null>(null) // For showing key after create/regenerate

  // Include inactive toggle
  const showInactive = ref(false)

  // Computed: Check if there are any apps at all
  const hasAnyApps = computed(() => allApps.value.length > 0)

  // Computed: Check if there are any inactive apps
  const hasInactiveApps = computed(() => allApps.value.some(app => !app.is_active))

  // Computed: Filter apps based on showInactive toggle
  const apps = computed(() => {
    if (showInactive.value) {
      return allApps.value
    }
    return allApps.value.filter(app => app.is_active)
  })

  // Fetch all apps (always include inactive to know if filter should show)
  const fetchApps = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await widgetAppService.listApps(true) // Always fetch all
      allApps.value = response.apps
    } catch (err: any) {
      error.value = 'Failed to load widget apps'
      console.error('Error loading widget apps:', err)
      toast.error('Error', {
        description: 'Failed to load widget apps',
        duration: 4000,
        closeButton: true
      })
    } finally {
      loading.value = false
    }
  }

  // Create app
  const handleCreateApp = async (appData: WidgetAppCreate) => {
    try {
      loading.value = true
      error.value = null
      const result = await widgetAppService.createApp(appData)

      // Add new app to list
      allApps.value.unshift({
        id: result.id,
        name: result.name,
        description: result.description,
        organization_id: result.organization_id,
        created_by: result.created_by,
        is_active: result.is_active,
        created_at: result.created_at,
        updated_at: result.updated_at
      })

      // Store API key for display
      newApiKey.value = result.api_key

      // Close create modal, open API key modal
      showCreateModal.value = false
      showApiKeyModal.value = true

      toast.success('Success', {
        description: 'Widget app created successfully. Save the API key now!',
        duration: 4000,
        closeButton: true
      })
    } catch (err: any) {
      error.value = 'Failed to create widget app'
      toast.error('Error', {
        description: err.response?.data?.detail || 'Failed to create widget app',
        duration: 4000,
        closeButton: true
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  // Edit app
  const handleEditApp = (app: WidgetApp) => {
    selectedApp.value = app
    showEditModal.value = true
  }

  // Update app (accepts WidgetAppCreate since form always provides required fields)
  const handleUpdateApp = async (appData: WidgetAppCreate) => {
    if (!selectedApp.value) return

    try {
      loading.value = true
      error.value = null
      const updatedApp = await widgetAppService.updateApp(selectedApp.value.id, appData)

      // Update in list
      const index = allApps.value.findIndex(a => a.id === updatedApp.id)
      if (index !== -1) {
        allApps.value[index] = updatedApp
      }

      showEditModal.value = false
      selectedApp.value = null

      toast.success('Success', {
        description: 'Widget app updated successfully',
        duration: 4000,
        closeButton: true
      })
    } catch (err: any) {
      error.value = 'Failed to update widget app'
      toast.error('Error', {
        description: err.response?.data?.detail || 'Failed to update widget app',
        duration: 4000,
        closeButton: true
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete app
  const handleDeleteApp = (app: WidgetApp) => {
    selectedApp.value = app
    showDeleteModal.value = true
  }

  const confirmDeleteApp = async () => {
    if (!selectedApp.value) return

    try {
      loading.value = true
      error.value = null
      await widgetAppService.deleteApp(selectedApp.value.id)

      // Remove from list
      allApps.value = allApps.value.filter(a => a.id !== selectedApp.value?.id)

      showDeleteModal.value = false
      selectedApp.value = null

      toast.success('Success', {
        description: 'Widget app deleted successfully',
        duration: 4000,
        closeButton: true
      })
    } catch (err: any) {
      error.value = 'Failed to delete widget app'
      toast.error('Error', {
        description: err.response?.data?.detail || 'Failed to delete widget app',
        duration: 4000,
        closeButton: true
      })
    } finally {
      loading.value = false
    }
  }

  // Regenerate API key
  const handleRegenerateKey = async (app: WidgetApp) => {
    if (!confirm('Are you sure? This will invalidate the current API key immediately.')) {
      return
    }

    try {
      loading.value = true
      error.value = null
      const result = await widgetAppService.regenerateApiKey(app.id)

      // Update app in list
      const index = allApps.value.findIndex(a => a.id === result.id)
      if (index !== -1) {
        allApps.value[index] = {
          id: result.id,
          name: result.name,
          description: result.description,
          organization_id: result.organization_id,
          created_by: result.created_by,
          is_active: result.is_active,
          created_at: result.created_at,
          updated_at: result.updated_at
        }
      }

      // Store new API key for display
      newApiKey.value = result.api_key
      showApiKeyModal.value = true

      toast.success('Success', {
        description: 'API key regenerated. Save the new key now!',
        duration: 4000,
        closeButton: true
      })
    } catch (err: any) {
      error.value = 'Failed to regenerate API key'
      toast.error('Error', {
        description: err.response?.data?.detail || 'Failed to regenerate API key',
        duration: 4000,
        closeButton: true
      })
    } finally {
      loading.value = false
    }
  }

  // Close API key modal
  const closeApiKeyModal = () => {
    showApiKeyModal.value = false
    newApiKey.value = null
  }

  return {
    apps,
    loading,
    error,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showApiKeyModal,
    selectedApp,
    newApiKey,
    showInactive,
    hasAnyApps,
    hasInactiveApps,
    fetchApps,
    handleCreateApp,
    handleEditApp,
    handleUpdateApp,
    handleDeleteApp,
    confirmDeleteApp,
    handleRegenerateKey,
    closeApiKeyModal
  }
}
