import { ref } from 'vue'
import type { AgentWithCustomization, AgentUpdate } from '@/types/agent'
import { agentService } from '@/services/agent'
import { widgetService } from '@/services/widget'
import type { Widget } from '@/types/widget'
import { toast } from 'vue-sonner'
import type { UserGroup } from '@/types/user'
import { listGroups } from '@/services/groups'
import { agentStorage } from '@/utils/storage'
import { useJiraIntegration } from './useJiraIntegration'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

const { hasEnterpriseModule, loadModule, moduleImports } = useEnterpriseFeatures()

// Lazy load Shopify integration only if enterprise module is available
let useShopifyIntegration: any = null
if (hasEnterpriseModule) {
  // Load Shopify integration asynchronously
  ;(async () => {
    try {
      const shopifyIntegrationModule = await loadModule(moduleImports.shopifyIntegration)
      if (shopifyIntegrationModule?.useShopifyIntegration) {
        useShopifyIntegration = shopifyIntegrationModule.useShopifyIntegration
      }
    } catch (error) {
      console.warn('Failed to load Shopify integration:', error)
    }
  })()
}

export function useAgentDetail(agentData: { value: AgentWithCustomization }, emit: (e: 'close') => void) {
  const fileInput = ref<HTMLInputElement | null>(null)
  const isUploading = ref(false)
  const showCropper = ref(false)
  const cropperImage = ref('')
  const cropper = ref<any>(null)
  const widget = ref<Widget | null>(null)
  const widgetLoading = ref(false)
  const userGroups = ref<UserGroup[]>([])
  const selectedGroupIds = ref<string[]>([])
  const loadingGroups = ref(false)

  // Initialize Jira integration
  const jiraIntegration = useJiraIntegration(agentData.value.id)

  // Initialize Shopify integration only if enterprise module is available
  const shopifyIntegration = hasEnterpriseModule && useShopifyIntegration
    ? useShopifyIntegration(agentData.value.id)
    : {
        shopifyConnected: ref(false),
        shopifyShopDomain: ref(''),
        shopifyLoading: ref(false),
        shopifyIntegrationEnabled: ref(false),
        checkShopifyStatus: () => Promise.resolve(),
        fetchAgentShopifyConfig: () => Promise.resolve(),
        toggleShopifyIntegration: () => Promise.resolve(),
        saveShopifyConfig: () => Promise.resolve()
      }

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  const triggerFileUpload = () => {
    fileInput.value?.click()
  }

  const handleFileUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('File size should not exceed 5MB')
      return
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Only JPEG, PNG and WebP images are allowed')
      return
    }

    // Show cropper
    cropperImage.value = URL.createObjectURL(file)
    showCropper.value = true
  }

  const handleCrop = async () => {
    if (!cropper.value) return

    try {
      isUploading.value = true
      const { canvas } = cropper.value.getResult()
      if (!canvas) throw new Error('Canvas not found')

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, 'image/png')
      })

      const croppedFile = new File([blob], 'profile.png', { type: 'image/png' })
      const updatedCustomization = await agentService.uploadAgentPhoto(agentData.value.id, croppedFile)
      agentData.value.customization = updatedCustomization

      showCropper.value = false
      cropperImage.value = ''
    } catch (error) {
      console.error('Failed to upload photo:', error)
      alert('Failed to upload photo')
    } finally {
      isUploading.value = false
    }
  }

  const cancelCrop = () => {
    showCropper.value = false
    cropperImage.value = ''
  }

  const handleClose = (cleanup: () => void) => {
    cleanup()
    emit('close')
  }

  const initializeWidget = async () => {
    try {
      widgetLoading.value = true
      // Try to fetch existing widget
      const widgets = await widgetService.getWidgets()
      const existingWidget = widgets.find((w: Widget) => w.agent_id === agentData.value.id)

      if (existingWidget) {
        widget.value = existingWidget
      } else {
        // Create new widget if none exists
        const newWidget = await widgetService.createWidget({
          name: `${agentData.value.name} Widget`,
          agent_id: agentData.value.id
        })
        widget.value = newWidget
      }
    } catch (error) {
      console.error('Failed to initialize widget:', error)
    } finally {
      widgetLoading.value = false
    }
  }

  const copyWidgetCode = (baseUrl: string) => {
    if (!widget.value) return

    const code = `<script>window.chattermateId='${widget.value.id}';<\/script><script src="${baseUrl}/webclient/chattermate.min.js"><\/script>`
    navigator.clipboard.writeText(code)
      .then(() => alert('Widget code copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err))
  }

  const toggleAskForRating = async () => {
    try {
      console.log('toggleAskForRating', agentData.value.ask_for_rating)
      const updatedAgent = await agentService.updateAgent(agentData.value.id, {
        ask_for_rating: !agentData.value.ask_for_rating
      })
      agentData.value = {
        ...agentData.value,
        ask_for_rating: updatedAgent.ask_for_rating
      }
      toast.success(`Rating requests ${updatedAgent.ask_for_rating ? 'enabled' : 'disabled'}`, {
        duration: 4000,
        closeButton: true
      })
    } catch (error) {
      console.error('Failed to update rating setting:', error)
      toast.error('Failed to update rating setting', {
        duration: 4000,
        closeButton: true
      })
    }
  }

  const toggleTransferToHuman = async () => {
    try {
      const updatedAgent = await agentService.updateAgent(agentData.value.id, {
        transfer_to_human: !agentData.value.transfer_to_human
      })
      agentData.value = {
        ...agentData.value,
        transfer_to_human: updatedAgent.transfer_to_human
      }
      toast.success(`Transfer to human ${updatedAgent.transfer_to_human ? 'enabled' : 'disabled'}`, {
        duration: 4000,
        closeButton: true
      })
    } catch (error) {
      console.error('Failed to update transfer setting:', error)
      toast.error('Failed to update transfer setting', {
        duration: 4000,
        closeButton: true
      })
    }
  }

  const fetchUserGroups = async () => {
    try {
      loadingGroups.value = true
      // Get all available groups
      const groups = await listGroups()
      userGroups.value = groups

      // Get agent's current groups and details
      const updatedAgent = await agentService.getAgentById(agentData.value.id)
        
      // Update agent data and storage
      agentData.value = updatedAgent
      agentStorage.updateAgent(updatedAgent)
      
      // Set selected groups
      selectedGroupIds.value = updatedAgent.groups?.map(g => g.id) || []
    } catch (error) {
      console.error('Failed to fetch user groups:', error)
      toast.error('Failed to load user groups')
    } finally {
      loadingGroups.value = false
    }
  }

  const updateAgentGroups = async (groupIds: string[]) => {
    try {
      const updatedAgent = await agentService.updateAgentGroups(agentData.value.id, groupIds)
      agentData.value = {
        ...agentData.value,
        groups: updatedAgent.groups
      }
      agentStorage.updateAgent(updatedAgent)
      toast.success('Transfer groups updated')
    } catch (error) {
      console.error('Failed to update agent groups:', error)
      toast.error('Failed to update transfer groups')
    }
  }

  return {
    fileInput,
    isUploading,
    showCropper,
    cropperImage,
    cropper,
    widget,
    widgetLoading,
    triggerFileUpload,
    handleFileUpload,
    handleCrop,
    cancelCrop,
    handleClose,
    initializeWidget,
    copyWidgetCode,
    toggleAskForRating,
    toggleTransferToHuman,
    userGroups,
    selectedGroupIds,
    loadingGroups,
    fetchUserGroups,
    updateAgentGroups,
    
    // Jira integration - spread all properties and methods from jiraIntegration
    ...jiraIntegration,
    
    // Shopify integration - spread all properties and methods from shopifyIntegration
    ...shopifyIntegration
  }
} 