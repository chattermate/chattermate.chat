import { ref } from 'vue'
import type { KnowledgeItem, KnowledgePage, QueueItem, KnowledgeContent } from '@/types/knowledge'
import { knowledgeService } from '@/services/knowledge'

export function useKnowledgeManagement(agentId: string, organizationId: string) {
  // Knowledge list state
  const knowledgeItems = ref<KnowledgeItem[]>([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalPages = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Queue state
  const queueItems = ref<QueueItem[]>([])
  const isLoadingQueue = ref(false)

  // Content viewing/editing state
  const selectedKnowledge = ref<number | null>(null)
  const knowledgeContent = ref<KnowledgeContent | null>(null)
  const isLoadingContent = ref(false)
  const isEditingContent = ref(false)
  const editedContent = ref('')
  const isSavingContent = ref(false)
  const showContentModal = ref(false)

  // Modal and upload state
  const showKnowledgeModal = ref(false)
  const activeTab = ref('pdf')
  const files = ref<File[]>([])
  const urls = ref<string[]>([])
  const newUrl = ref('')
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const successMessage = ref('')
  const fileInput = ref<HTMLInputElement | null>(null)

  // Link state
  const showLinkModal = ref(false)
  const orgKnowledgeItems = ref<KnowledgeItem[]>([])
  const orgCurrentPage = ref(1)
  const orgTotalPages = ref(0)
  const isLoadingOrg = ref(false)

  // Delete state
  const showDeleteConfirm = ref(false)
  const knowledgeToDelete = ref<number | null>(null)

  // Add new state for URL form errors
  const urlFormError = ref<string | null>(null)

  // Add upload error state
  const uploadError = ref<string | null>(null)



  // Fetch knowledge data
  const fetchKnowledge = async () => {
    try {
      isLoading.value = true
      isLoadingOrg.value = true
      error.value = null

      // Fetch agent knowledge, org knowledge, and queue items in parallel
      const [agentResponse, orgResponse, queueResponse] = await Promise.all([
        knowledgeService.getKnowledgeByAgent(agentId, currentPage.value, pageSize.value),
        knowledgeService.getKnowledgeByOrganization(
          organizationId,
          orgCurrentPage.value,
          pageSize.value,
        ),
        fetchQueueItems(),
      ])

      // Update agent knowledge
      knowledgeItems.value = agentResponse.knowledge
      totalPages.value = agentResponse.pagination.total_pages

      // Update org knowledge
      orgKnowledgeItems.value = orgResponse.knowledge
      orgTotalPages.value = orgResponse.pagination.total_pages
    } catch (err) {
      error.value = 'Failed to load knowledge sources'
      console.error(err)
    } finally {
      isLoading.value = false
      isLoadingOrg.value = false
    }
  }

  // Fetch queue items
  const fetchQueueItems = async () => {
    try {
      isLoadingQueue.value = true
      const response = await knowledgeService.getAgentQueueItems(agentId)
      queueItems.value = response.queue_items || []
      return response
    } catch (err) {
      console.error('Failed to load queue items:', err)
      queueItems.value = []
      return { queue_items: [] }
    } finally {
      isLoadingQueue.value = false
    }
  }

  const deleteQueueItem = async (queueId: number) => {
    try {
      await knowledgeService.deleteQueueItem(queueId)
      await fetchQueueItems() // Refresh queue
    } catch (err) {
      console.error('Failed to delete queue item:', err)
      error.value = 'Failed to delete queue item'
    }
  }



  // Pagination handler
  const handlePageChange = (page: number) => {
    currentPage.value = page
    fetchKnowledge()
  }

  // Date formatting
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Get earliest creation date
  const getFirstCreated = (pages: KnowledgePage[]): string | null => {
    return pages.reduce(
      (earliest, page) => {
        if (!page.created_at) return earliest
        if (!earliest) return page.created_at
        return page.created_at < earliest ? page.created_at : earliest
      },
      null as string | null,
    )
  }

  // URL validation
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // File handling methods
  const triggerFileInput = () => {
    fileInput.value?.click()
  }

  const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files) {
      files.value = Array.from(input.files)
    }
  }

  const handleFileUpload = async () => {
    if (!files.value.length) return

    try {
      isUploading.value = true
      uploadError.value = null // Clear previous errors
      
      const response = await knowledgeService.uploadPdfFiles(
        files.value,
        organizationId,
        agentId,
        (progress) => {
          uploadProgress.value = progress
        },
      )
      if (response.message) {
        successMessage.value = response.message
        await fetchKnowledge() // Refresh knowledge list
      }
      files.value = []
      if (fileInput.value) fileInput.value.value = ''
    } catch (error: any) {
      console.error('Upload failed:', error)
      uploadError.value = error.message || 'Failed to upload files'
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  // URL handling methods
  const handleUrlAdd = () => {
    if (!newUrl.value) return

    // Clean the URL
    const cleanUrl = newUrl.value.trim()

    // Basic URL validation
    if (!isValidUrl(cleanUrl)) {
      urlFormError.value = 'Please enter a valid URL'
      return
    }

    // Check if URL already exists in knowledgeItems or orgKnowledgeItems
    const urlExistsInAgent = knowledgeItems.value.some((item) => item.name === cleanUrl)
    const urlExistsInOrg = orgKnowledgeItems.value.some((item) => item.name === cleanUrl)

    if (urlExistsInAgent || urlExistsInOrg) {
      urlFormError.value = 'This URL already exists in your knowledge base'
      newUrl.value = ''
      return
    }

    // Check if URL is already in the current batch
    if (urls.value.includes(cleanUrl)) {
      urlFormError.value = 'This URL has already been added to the current batch'
      newUrl.value = ''
      return
    }

    // Add URL to batch
    urls.value.push(cleanUrl)
    newUrl.value = ''
    urlFormError.value = null
  }

  const removeUrl = (index: number) => {
    urls.value.splice(index, 1)
  }

  const handleUrlUpload = async () => {
    if (!urls.value.length) return

    try {
      isUploading.value = true
      uploadError.value = null // Clear previous errors
      
      const response = await knowledgeService.addUrls(
        organizationId,
        urls.value,
        agentId,
        (progress) => {
          uploadProgress.value = progress
        },
      )
      if (response.message) {
        successMessage.value = response.message
        await fetchKnowledge() // Refresh knowledge list
      }
      urls.value = []
    } catch (error: any) {
      console.error('URL upload failed:', error)
      uploadError.value = error.message || 'Failed to upload URLs'
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  const fetchOrgKnowledge = async () => {
    try {
      isLoadingOrg.value = true
      const response = await knowledgeService.getKnowledgeByOrganization(
        organizationId,
        orgCurrentPage.value,
        pageSize.value,
      )
      orgKnowledgeItems.value = response.knowledge
      orgTotalPages.value = response.pagination.total_pages
    } catch (err) {
      console.error(err)
    } finally {
      isLoadingOrg.value = false
    }
  }

  const handleOrgPageChange = (page: number) => {
    orgCurrentPage.value = page
    fetchOrgKnowledge()
  }

  const linkKnowledge = async (knowledgeId: number) => {
    try {
      await knowledgeService.linkToAgent(knowledgeId, agentId)
      await fetchKnowledge() // Refresh agent knowledge
    } catch (error) {
      console.error('Error linking knowledge:', error)
    }
  }

  const unlinkKnowledge = async (knowledgeId: number) => {
    try {
      await knowledgeService.unlinkFromAgent(knowledgeId, agentId)
      await fetchKnowledge() // Refresh agent knowledge
    } catch (error) {
      console.error('Error unlinking knowledge:', error)
    }
  }

  // Delete methods
  const confirmDelete = (knowledgeId: number) => {
    knowledgeToDelete.value = knowledgeId
    showDeleteConfirm.value = true
  }

  const handleDelete = async () => {
    if (!knowledgeToDelete.value) return

    try {
      await knowledgeService.deleteKnowledge(knowledgeToDelete.value)
      await fetchKnowledge() // Refresh the list
      showDeleteConfirm.value = false
      knowledgeToDelete.value = null
    } catch (err) {
      console.error('Error deleting knowledge:', err)
      error.value = 'Failed to delete knowledge source'
    }
  }

  const cancelDelete = () => {
    showDeleteConfirm.value = false
    knowledgeToDelete.value = null
  }

  // Content management methods
  const viewKnowledgeContent = async (knowledgeId: number) => {
    try {
      selectedKnowledge.value = knowledgeId
      isLoadingContent.value = true
      showContentModal.value = true
      
      const response = await knowledgeService.getKnowledgeContent(knowledgeId)
      knowledgeContent.value = response
      
      // Do not combine chunks - keep them separate for individual editing
      editedContent.value = ''
    } catch (err) {
      console.error('Error loading knowledge content:', err)
      error.value = 'Failed to load knowledge content'
    } finally {
      isLoadingContent.value = false
    }
  }

  const enableContentEditing = () => {
    isEditingContent.value = true
  }

  const cancelContentEditing = () => {
    isEditingContent.value = false
  }

  const saveChunkContent = async (chunkId: string, content: string) => {
    if (!selectedKnowledge.value) return

    try {
      isSavingContent.value = true
      await knowledgeService.updateChunkContent(selectedKnowledge.value, chunkId, content)
      
      successMessage.value = 'Chunk updated successfully'
      
      // Reload the content to show updated chunk
      await viewKnowledgeContent(selectedKnowledge.value)
    } catch (err: any) {
      console.error('Error saving chunk content:', err)
      error.value = err.message || 'Failed to save chunk content'
    } finally {
      isSavingContent.value = false
    }
  }

  const closeContentModal = () => {
    showContentModal.value = false
    selectedKnowledge.value = null
    knowledgeContent.value = null
    isEditingContent.value = false
    editedContent.value = ''
  }

  return {
    // State
    knowledgeItems,
    currentPage,
    pageSize,
    totalPages,
    isLoading,
    error,
    showKnowledgeModal,
    activeTab,
    files,
    urls,
    newUrl,
    isUploading,
    uploadProgress,
    successMessage,
    fileInput,
    showLinkModal,
    orgKnowledgeItems,
    orgCurrentPage,
    orgTotalPages,
    isLoadingOrg,
    showDeleteConfirm,
    knowledgeToDelete,
    urlFormError,
    uploadError,
    queueItems,
    isLoadingQueue,
    selectedKnowledge,
    knowledgeContent,
    isLoadingContent,
    isEditingContent,
    editedContent,
    isSavingContent,
    showContentModal,

    // Methods
    fetchKnowledge,
    fetchQueueItems,
    deleteQueueItem,
    handlePageChange,
    formatDate,

    getFirstCreated,
    isValidUrl,
    triggerFileInput,
    handleFileSelect,
    handleFileUpload,
    handleUrlAdd,
    removeUrl,
    handleUrlUpload,
    fetchOrgKnowledge,
    handleOrgPageChange,
    linkKnowledge,
    unlinkKnowledge,
    confirmDelete,
    handleDelete,
    cancelDelete,
    viewKnowledgeContent,
    enableContentEditing,
    cancelContentEditing,
    saveChunkContent,
    closeContentModal,
  }
}

