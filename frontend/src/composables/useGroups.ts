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
import type { User, UserGroup } from '@/types/user'
import { listGroups, createGroup, updateGroup, deleteGroup, addUserToGroup, removeUserFromGroup } from '@/services/groups'
import { listUsers } from '@/services/users'
import { toast } from 'vue-sonner'

export function useGroups() {
  const groups = ref<UserGroup[]>([])
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref('')
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const showMembersModal = ref(false)
  const showDeleteModal = ref(false)
  const selectedGroup = ref<UserGroup | null>(null)
  const selectedUsers = ref<string[]>([])

  const fetchGroups = async () => {
    try {
      loading.value = true
      groups.value = await listGroups()
    } catch (err) {
      console.error('Failed to load groups:', err)
      error.value = 'Failed to load groups'
    } finally {
      loading.value = false
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await listUsers()
      users.value = response
    } catch (err) {
      console.error('Failed to load users:', err)
      toast.error('Error loading users', {
        duration: 4000,
        closeButton: true
      })
    }
  }

  const handleCreateGroup = async (groupData: Partial<UserGroup>) => {
    try {
      loading.value = true
      const newGroup = await createGroup(groupData)
      groups.value.unshift(newGroup)
      showCreateModal.value = false
      toast.success('Success', {
        description: 'Group created successfully',
        duration: 4000,
        closeButton: true
      })
    } catch (err) {
      console.error('Error creating group:', err)
      toast.error('Error', {
        description: 'Failed to create group',
        duration: 4000,
        closeButton: true
      })
    } finally {
      loading.value = false
    }
  }

  const handleEditGroup = (group: UserGroup) => {
    selectedGroup.value = group
    showEditModal.value = true
  }

  const handleUpdateGroup = async (groupData: Partial<UserGroup>) => {
    if (!selectedGroup.value) return
    
    try {
      loading.value = true
      const updatedGroup = await updateGroup(selectedGroup.value.id, groupData)
      const index = groups.value.findIndex(g => g.id === updatedGroup.id)
      if (index !== -1) {
        groups.value[index] = updatedGroup
      }
      showEditModal.value = false
      toast.success('Group updated successfully', {
        duration: 4000,
        closeButton: true
      })
    } catch (err) {
      console.error('Error updating group:', err)
      toast.error('Failed to update group', {
        duration: 4000,
        closeButton: true
      })
    } finally {
      loading.value = false
    }
  }

  const handleManageMembers = async (group: UserGroup) => {
    selectedGroup.value = group
    selectedUsers.value = group.users?.map(u => u.id) || []
    await fetchUsers()
    showMembersModal.value = true
  }

  const handleUserSelection = async (userId: string, checked: boolean) => {
    if (!selectedGroup.value) return
    
    try {
      loading.value = true
      if (checked) {
        await addUserToGroup(selectedGroup.value.id, userId)
        selectedUsers.value.push(userId)
      } else {
        await removeUserFromGroup(selectedGroup.value.id, userId)
        selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
      }
      await fetchGroups() // Refresh groups to get updated members
    } catch (err) {
      console.error('Error managing members:', err)
      toast.error(checked ? 'Failed to add member' : 'Failed to remove member')
    } finally {
      loading.value = false
    }
  }

  const handleDeleteGroup = (group: UserGroup) => {
    selectedGroup.value = group
    showDeleteModal.value = true
  }

  const handleDeleteConfirm = async () => {
    if (!selectedGroup.value) return
    
    try {
      loading.value = true
      await deleteGroup(selectedGroup.value.id)
      groups.value = groups.value.filter(g => g.id !== selectedGroup.value?.id)
      showDeleteModal.value = false
      toast.success('Group deleted successfully')
    } catch (err) {
      console.error('Error deleting group:', err)
      toast.error('Failed to delete group')
    } finally {
      loading.value = false
    }
  }

  return {
    groups,
    users,
    loading,
    error,
    showCreateModal,
    showEditModal,
    showMembersModal,
    showDeleteModal,
    selectedGroup,
    selectedUsers,
    fetchGroups,
    fetchUsers,
    handleCreateGroup,
    handleEditGroup,
    handleUpdateGroup,
    handleManageMembers,
    handleUserSelection,
    handleDeleteGroup,
    handleDeleteConfirm
  }
} 