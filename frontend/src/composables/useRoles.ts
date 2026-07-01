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
import type { Role } from '@/types/user'
import { listRoles, createRole, updateRole, deleteRole } from '@/services/roles'
import { toast } from 'vue-sonner'

export function useRoles() {
  const roles = ref<Role[]>([])
  const loading = ref(false)
  const error = ref('')
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const selectedRole = ref<Role | null>(null)
  const deleteError = ref('')

  const openCreateModal = () => {
    selectedRole.value = null
    showCreateModal.value = true
  }

  const fetchRoles = async () => {
    try {
      loading.value = true
      roles.value = await listRoles()
    } catch (err) {
      console.error('Failed to load roles:', err)
      error.value = 'Failed to load roles'
    } finally {
      loading.value = false
    }
  }

  const handleCreateRole = async (roleData: Partial<Role>) => {
    try {
      console.log('Creating role:', roleData)
      loading.value = true
      const newRole = await createRole(roleData)
      roles.value.unshift(newRole)
      showCreateModal.value = false
      toast.success('Role created successfully', {
        duration: 4000,
        closeButton: true
      })
    } catch (err) {
      console.error('Error creating role:', err)
      toast.error('Failed to create role', {
        duration: 4000,
        closeButton: true
      })
    } finally {
      loading.value = false
    }
  }

  const handleEditRole = (role: Role) => {
    console.log('Editing role:', role)
    selectedRole.value = role
    showEditModal.value = true
  }

  const handleUpdateRole = async (roleData: Partial<Role>) => {
    if (!selectedRole.value) return

    try {
      loading.value = true
      const updatedRole = await updateRole(selectedRole.value.id, roleData)
      const index = roles.value.findIndex(r => r.id === updatedRole.id)
      if (index !== -1) {
        roles.value[index] = updatedRole
      }
      showEditModal.value = false
      toast.success('Role updated successfully', {
        duration: 4000,
        closeButton: true
      })
    } catch (err) {
      console.error('Error updating role:', err)
      toast.error('Failed to update role', {
        duration: 4000,
        closeButton: true
      })
    } finally {
      loading.value = false
    }
  }

  const handleDeleteRole = (role: Role) => {
    selectedRole.value = role
    showDeleteModal.value = true
    deleteError.value = ''
  }

  const confirmDeleteRole = async () => {
    if (!selectedRole.value) return

    try {
      loading.value = true
      deleteError.value = ''
      await deleteRole(selectedRole.value.id)
      roles.value = roles.value.filter(r => r.id !== selectedRole.value?.id)
      showDeleteModal.value = false
      toast.success('Role deleted successfully', {
        duration: 4000,
        closeButton: true
      })
    } catch (err: any) {
      console.error('Error deleting role:', err)
      deleteError.value = err.response?.data?.detail || 'Failed to delete role'
    } finally {
      loading.value = false
    }
  }

  return {
    roles,
    loading,
    error,
    deleteError,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    selectedRole,
    fetchRoles,
    openCreateModal,
    handleCreateRole,
    handleEditRole,
    handleUpdateRole,
    handleDeleteRole,
    confirmDeleteRole
  }
} 