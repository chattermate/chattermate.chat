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
import { toast } from 'vue-sonner'
import { 
  checkJiraConnection, 
  getJiraProjects, 
  getJiraIssueTypes, 
  getJiraPriorities,
  createJiraTicket,
  checkPriorityAvailability
} from '@/services/jira'

export function useJiraTicket() {
  // State
  const jiraConnected = ref(false)
  const jiraLoading = ref(false)
  const showTicketModal = ref(false)
  const jiraProjects = ref<any[]>([])
  const jiraIssueTypes = ref<any[]>([])
  const jiraPriorities = ref<any[]>([])
  const selectedProject = ref<string>('')
  const selectedIssueType = ref<string>('')
  const selectedPriority = ref<string>('')
  const ticketSummary = ref<string>('')
  const ticketDescription = ref<string>('')
  const loadingProjects = ref(false)
  const loadingIssueTypes = ref(false)
  const loadingPriorities = ref(false)
  const creatingTicket = ref(false)
  const createdTicketKey = ref<string | null>(null)
  const priorityAvailable = ref(false)
  const checkingPriorityAvailability = ref(false)

  // Check if Jira is connected
  const checkJiraStatus = async () => {
    jiraLoading.value = true
    try {
      const response = await checkJiraConnection()
      jiraConnected.value = response.connected
      if (jiraConnected.value) {
        await fetchJiraProjects()
        await fetchJiraPriorities()
      }
    } catch (error) {
      console.error('Error checking Jira status:', error)
      jiraConnected.value = false
    } finally {
      jiraLoading.value = false
    }
  }

  // Fetch Jira projects
  const fetchJiraProjects = async () => {
    if (!jiraConnected.value) return
    
    loadingProjects.value = true
    try {
      const projects = await getJiraProjects()
      jiraProjects.value = projects
    } catch (error) {
      console.error('Error fetching Jira projects:', error)
      toast.error('Failed to load Jira projects')
    } finally {
      loadingProjects.value = false
    }
  }

  // Fetch Jira issue types for a project
  const fetchJiraIssueTypes = async (projectKey: string) => {
    if (!projectKey) return
    
    loadingIssueTypes.value = true
    try {
      const issueTypes = await getJiraIssueTypes(projectKey)
      jiraIssueTypes.value = issueTypes
    } catch (error) {
      console.error('Error fetching Jira issue types:', error)
      toast.error('Failed to load issue types')
    } finally {
      loadingIssueTypes.value = false
    }
  }

  // Fetch Jira priorities
  const fetchJiraPriorities = async () => {
    if (!jiraConnected.value) return
    
    loadingPriorities.value = true
    try {
      const priorities = await getJiraPriorities()
      jiraPriorities.value = priorities
    } catch (error) {
      console.error('Error fetching Jira priorities:', error)
      toast.error('Failed to load priorities')
    } finally {
      loadingPriorities.value = false
    }
  }

  // Handle project change
  const handleProjectChange = async (projectKey: string) => {
    selectedProject.value = projectKey
    selectedIssueType.value = ''
    selectedPriority.value = ''
    priorityAvailable.value = false
    
    if (projectKey) {
      await fetchJiraIssueTypes(projectKey)
    } else {
      jiraIssueTypes.value = []
    }
  }

  // Handle issue type change
  const handleIssueTypeChange = async (issueTypeId: string) => {
    selectedIssueType.value = issueTypeId
    selectedPriority.value = ''
    
    if (selectedProject.value && issueTypeId) {
      await checkPriorityField(selectedProject.value, issueTypeId)
    } else {
      priorityAvailable.value = false
    }
  }

  // Check if priority field is available
  const checkPriorityField = async (projectKey: string, issueTypeId: string) => {
    checkingPriorityAvailability.value = true
    try {
      priorityAvailable.value = await checkPriorityAvailability(projectKey, issueTypeId)
      
      // If priority is available, fetch priorities
      if (priorityAvailable.value) {
        await fetchJiraPriorities()
      }
    } catch (error) {
      console.error('Error checking priority availability:', error)
      priorityAvailable.value = false
    } finally {
      checkingPriorityAvailability.value = false
    }
  }

  // Open ticket modal
  const openTicketModal = async (chatSummary?: string) => {
    // Reset form
    selectedProject.value = ''
    selectedIssueType.value = ''
    selectedPriority.value = ''
    ticketDescription.value = ''
    createdTicketKey.value = null
    
    // Set summary from chat if provided
    ticketSummary.value = chatSummary || ''
    
    // Check Jira status and load data
    await checkJiraStatus()
    
    // Show modal
    showTicketModal.value = true
  }

  // Close ticket modal
  const closeTicketModal = () => {
    showTicketModal.value = false
  }

  // Create Jira ticket
  const submitTicket = async (chatId?: string) => {
    if (!selectedProject.value || !selectedIssueType.value || !ticketSummary.value) {
      toast.error('Please fill in all required fields')
      return
    }

    creatingTicket.value = true
    try {
      const response = await createJiraTicket({
        projectKey: selectedProject.value,
        issueTypeId: selectedIssueType.value,
        summary: ticketSummary.value,
        description: ticketDescription.value,
        priority: selectedPriority.value,
        chatId
      })
      
      createdTicketKey.value = response.key
      toast.success(`Ticket ${response.key} created successfully`)
      return response.key
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('Failed to create ticket')
      return null
    } finally {
      creatingTicket.value = false
    }
  }

  // Check if form is valid
  const isFormValid = computed(() => {
    return selectedProject.value && 
           selectedIssueType.value && 
           ticketSummary.value.trim().length > 0
  })

  return {
    // State
    jiraConnected,
    jiraLoading,
    showTicketModal,
    jiraProjects,
    jiraIssueTypes,
    jiraPriorities,
    selectedProject,
    selectedIssueType,
    selectedPriority,
    ticketSummary,
    ticketDescription,
    loadingProjects,
    loadingIssueTypes,
    loadingPriorities,
    creatingTicket,
    createdTicketKey,
    priorityAvailable,
    checkingPriorityAvailability,
    isFormValid,
    
    // Methods
    checkJiraStatus,
    fetchJiraProjects,
    fetchJiraIssueTypes,
    fetchJiraPriorities,
    handleProjectChange,
    handleIssueTypeChange,
    checkPriorityField,
    openTicketModal,
    closeTicketModal,
    submitTicket
  }
} 