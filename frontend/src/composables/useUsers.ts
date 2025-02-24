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