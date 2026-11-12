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
import { useRouter } from 'vue-router'
import { userService } from '@/services/user'
import { dropFCMSubscription, thisDeviceFCMToken } from '@/services/firebase'
import { authService } from '@/services/auth'

export function useAuth() {
  const router = useRouter()
  const user = ref(userService.getCurrentUser())
  const isLoggingOut = ref(false)
  const error = ref('')

  const logout = async () => {
    try {
      isLoggingOut.value = true
      // The push token goes with the logout request — only this device's, so
      // the user's other devices keep their notifications. Nothing waits on
      // Firebase: the FCM side is cleaned up after we've left.
      await authService.logout(thisDeviceFCMToken())
      dropFCMSubscription()
      router.push('/login')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to logout'
      console.error('Logout failed:', err)
    } finally {
      isLoggingOut.value = false
    }
  }

  return {
    user,
    logout,
    isLoggingOut,
    error,
  }
}
