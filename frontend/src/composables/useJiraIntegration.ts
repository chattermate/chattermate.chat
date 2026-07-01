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
import { toast } from 'vue-sonner'
import { 
  checkJiraConnection, 
  getJiraProjects, 
  getJiraIssueTypes, 
  saveAgentJiraConfig, 
  getAgentJiraConfig 
} from '@/services/jira'

export function useJiraIntegration(agentId: string) {
  // Jira integration state
  const jiraConnected = ref(false)
  const jiraLoading = ref(false)
  const createTicketEnabled = ref(false)
  const jiraProjects = ref<any[]>([])
  const jiraIssueTypes = ref<any[]>([])
  const selectedProject = ref<string>('')
  const selectedIssueType = ref<string>('')
  const loadingProjects = ref(false)
  const loadingIssueTypes = ref(false)

  /**
   * Check if Jira is connected
   */
  const checkJiraStatus = async () => {
    try {
      jiraLoading.value = true
      const status = await checkJiraConnection()
      jiraConnected.value = status.connected
      
      // If Jira is connected, fetch projects
      if (jiraConnected.value && createTicketEnabled.value) {
        await fetchJiraProjects()
      }
    } catch (error) {
      console.error('Failed to check Jira status:', error)
    } finally {
      jiraLoading.value = false
    }
  }

  /**
   * Fetch Jira projects
   */
  const fetchJiraProjects = async () => {
    if (!jiraConnected.value) return
    
    try {
      loadingProjects.value = true
      const projects = await getJiraProjects()
      jiraProjects.value = projects
    } catch (error) {
      console.error('Failed to fetch Jira projects:', error)
      toast.error('Failed to load Jira projects')
    } finally {
      loadingProjects.value = false
    }
  }

  /**
   * Fetch Jira issue types for a project
   */
  const fetchJiraIssueTypes = async (projectKey: string) => {
    if (!projectKey) {
      jiraIssueTypes.value = []
      return
    }
    
    try {
      loadingIssueTypes.value = true
      const issueTypes = await getJiraIssueTypes(projectKey)
      jiraIssueTypes.value = issueTypes
    } catch (error) {
      console.error('Failed to fetch Jira issue types:', error)
      toast.error('Failed to load Jira issue types')
    } finally {
      loadingIssueTypes.value = false
    }
  }

  /**
   * Toggle Jira ticket creation
   */
  const toggleCreateTicket = async () => {
    // If enabling and Jira is not connected, show error
    if (!createTicketEnabled.value && !jiraConnected.value) {
      toast.error('Cannot enable ticket creation: Jira is not connected', {
        description: 'Please connect Jira in the Integrations settings first.',
        duration: 5000
      })
      return
    }
    
    try {
      // Toggle the create ticket setting
      const newValue = !createTicketEnabled.value
      
      // If disabling, just save the config with enabled=false
      if (!newValue) {
        await saveAgentJiraConfig(agentId, { enabled: false })
        createTicketEnabled.value = false
        toast.success('Ticket creation disabled')
        return
      }
      
      // If enabling but no project/issue type selected yet, just update the UI state
      // The actual save will happen when the user selects a project and issue type
      if (newValue && (!selectedProject.value || !selectedIssueType.value)) {
        createTicketEnabled.value = true
        // Fetch projects if not already loaded
        if (jiraProjects.value.length === 0) {
          await fetchJiraProjects()
        }
        return
      }
      
      // If enabling and project/issue type are selected, save the config
      await saveAgentJiraConfig(agentId, {
        enabled: true,
        projectKey: selectedProject.value,
        issueTypeId: selectedIssueType.value
      })
      
      createTicketEnabled.value = true
      toast.success('Ticket creation enabled')
    } catch (error) {
      console.error('Failed to toggle ticket creation:', error)
      toast.error('Failed to update ticket creation setting')
    }
  }

  /**
   * Save Jira configuration
   */
  const saveJiraConfig = async (projectKey?: string, issueTypeId?: string) => {
    // Use provided values or fall back to the state values
    const projectToUse = projectKey || selectedProject.value
    const issueTypeToUse = issueTypeId || selectedIssueType.value
    
    if (!projectToUse || !issueTypeToUse) {
      toast.error('Please select a project and issue type')
      return
    }
    
    try {
      await saveAgentJiraConfig(agentId, {
        enabled: true,
        projectKey: projectToUse,
        issueTypeId: issueTypeToUse
      })
      
      // Update the local state to match what was saved
      selectedProject.value = projectToUse
      selectedIssueType.value = issueTypeToUse
      
      toast.success('Jira configuration saved')
    } catch (error) {
      console.error('Failed to save Jira config:', error)
      toast.error('Failed to save Jira configuration')
    }
  }

  /**
   * Fetch agent's Jira configuration
   */
  const fetchAgentJiraConfig = async () => {
    try {
      const config = await getAgentJiraConfig(agentId)
      createTicketEnabled.value = config.enabled
      selectedProject.value = config.projectKey || ''
      selectedIssueType.value = config.issueTypeId || ''
      
      // If there's an existing configuration, fetch the projects and issue types
      if (config.enabled && config.projectKey) {
        // First check if Jira is connected
        const status = await checkJiraConnection()
        jiraConnected.value = status.connected
        
        if (jiraConnected.value) {
          // Fetch projects
          loadingProjects.value = true
          try {
            const projects = await getJiraProjects()
            jiraProjects.value = projects
            
            // If project is selected, fetch issue types
            if (selectedProject.value) {
              await fetchJiraIssueTypes(selectedProject.value)
            }
          } catch (error) {
            console.error('Failed to fetch Jira projects:', error)
            toast.error('Failed to load Jira projects')
          } finally {
            loadingProjects.value = false
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch agent Jira config:', error)
    }
  }

  /**
   * Handle project change
   */
  const handleProjectChange = async (projectKey: string) => {
    if (projectKey !== selectedProject.value) {
      selectedProject.value = projectKey
      selectedIssueType.value = '' // Reset issue type when project changes
      await fetchJiraIssueTypes(projectKey)
    }
  }

  /**
   * Handle issue type change
   */
  const handleIssueTypeChange = (issueTypeId: string) => {
    selectedIssueType.value = issueTypeId
  }

  return {
    // State
    jiraConnected,
    jiraLoading,
    createTicketEnabled,
    jiraProjects,
    jiraIssueTypes,
    selectedProject,
    selectedIssueType,
    loadingProjects,
    loadingIssueTypes,
    
    // Methods
    checkJiraStatus,
    fetchJiraProjects,
    fetchJiraIssueTypes,
    toggleCreateTicket,
    saveJiraConfig,
    fetchAgentJiraConfig,
    handleProjectChange,
    handleIssueTypeChange
  }
} 