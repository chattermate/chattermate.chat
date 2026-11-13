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

import { computed, ref, type Ref } from 'vue'
import { toast } from 'vue-sonner'
import { updateUserStatus } from '@/services/users'
import { userService } from '@/services/user'
import type { User } from '@/types/user'

export const STATUS_CHANGE_FAILED = 'Could not change your status. Try again.'

/**
 * The signed-in agent's online/offline availability: one copy of the logic for
 * the header pill, the sidebar account menu and the mobile More sheet.
 *
 * The change is applied only once the server accepts it, so the UI never shows
 * a status other agents and the router do not see. A second click while a
 * change is in flight is ignored.
 */
export function useAgentStatus(currentUser: Ref<User | null>) {
  const statusUpdating = ref(false)
  const isOnline = computed(() => !!currentUser.value?.is_online)

  const setOnline = async (online: boolean) => {
    const user = currentUser.value
    if (!user?.id || statusUpdating.value) return

    statusUpdating.value = true
    try {
      await updateUserStatus(user.id, online)
      const updated = { ...user, is_online: online, last_seen: new Date().toISOString() } as User
      currentUser.value = updated
      userService.setCurrentUser(updated)
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error(STATUS_CHANGE_FAILED)
    } finally {
      statusUpdating.value = false
    }
  }

  const toggleOnline = () => setOnline(!isOnline.value)

  return { isOnline, statusUpdating, setOnline, toggleOnline }
}
