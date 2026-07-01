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
import type { User } from '@/types/user'
import { listUsers, createUser, updateUser, deleteUser } from '@/services/users'
import { toast } from 'vue-sonner'

export function useUsers() {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const selectedUser = ref<User | null>(null)
  const showCreateModal = ref(false)

  const fetchUsers = async () => {
    try {
      loading.value = true
      users.value = await listUsers()
    } catch (err: any) {
      error.value = 'Failed to load users - ' + err.response.data.detail
      console.error('Error loading users:', err.response.data.detail)
    } finally {
      loading.value = false
    }
  }

  const handleEditUser = (user: User) => {
    selectedUser.value = user
    showEditModal.value = true
  }

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!selectedUser.value) return

    try {
      loading.value = true
      error.value = null
      const updatedUser = await updateUser(selectedUser.value.id, userData)
      
      // Update local users list
      const index = users.value.findIndex(u => u.id === updatedUser.id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      showEditModal.value = false
      selectedUser.value = null
      toast.success('Success', {
        description: 'User updated successfully',
        duration: 4000,
        closeButton: true
      })
    } catch (err: any) {
      error.value = 'Failed to update user'
      console.error('Error updating user:', err.response.data.detail)
      toast.error('Error', {
        description: 'Failed to update user - ' + err.response.data.detail,
        duration: 4000,
        closeButton: true
      })
    } finally {
      loading.value = false
    }
  }

  const handleDeleteUser = async (user: User) => {
    selectedUser.value = user
    showDeleteModal.value = true
  }

  const confirmDeleteUser = async () => {
    if (!selectedUser.value) return

    try {
      loading.value = true
      error.value = null
      await deleteUser(selectedUser.value.id)
      
      // Remove user from local list
      users.value = users.value.filter(u => u.id !== selectedUser.value?.id)
      
      showDeleteModal.value = false
      selectedUser.value = null
      toast.success('Success', {
        description: 'User deleted successfully',
        duration: 4000,
        closeButton: true
      })
    } catch (err: any) {
      error.value = 'Failed to delete user'
      console.error('Error deleting user:', err.response.data.detail)
      toast.error('Error', {
        description: 'Failed to delete user - ' + err.response.data.detail,
        duration: 4000,
        closeButton: true
      })
    } finally {
      loading.value = false
    }
  }

  const handleCreateUser = async (userData: Partial<User> & { password?: string }) => {
    try {
      loading.value = true
      error.value = null
      const newUser = await createUser(userData)
      users.value.unshift(newUser) // Add to start of list
      showCreateModal.value = false
      toast.success('Success', {
        description: 'User created successfully',
        duration: 4000,
        closeButton: true
      })
    } catch (err: any) {
      error.value = 'Failed to create user'
      console.error('Error creating user:', err.response.data.detail)
      toast.error('Error', {
        description: 'Failed to create user - ' + err.response.data.detail,
        duration: 4000,
        closeButton: true
      })
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    showEditModal,
    showDeleteModal,
    selectedUser,
    showCreateModal,
    fetchUsers,
    handleEditUser,
    handleUpdateUser,
    handleDeleteUser,
    confirmDeleteUser,
    handleCreateUser
  }
} 