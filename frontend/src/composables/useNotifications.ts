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

import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onMessage, type MessagePayload } from 'firebase/messaging'
import { toast } from 'vue-sonner'
import {
  requestNotificationPermission,
  refreshFCMToken,
  getMessagingIfSupported
} from '@/services/firebase'
import { SW_MESSAGE, CONVERSATIONS_PATH, conversationSessionUrl } from '@/pwa/pushContract'
import mitt from '@/utils/emitter'

// Match backend NotificationType enum
enum NotificationType {
  KNOWLEDGE_PROCESSED = 'knowledge_processed',
  KNOWLEDGE_FAILED = 'knowledge_failed',
  SYSTEM = 'system',
  CHAT = 'chat'
}

// Module-level guards: every view mounts its own DashboardLayout (and thus
// this composable), so per-mount attachment would stack a new SW message
// listener + FCM onMessage subscription on every route change — one push
// would then toast once per navigation.
let listenersAttached = false
let tokenRefreshed = false

export function useNotifications() {
  const hasPermission = ref(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  )
  const router = useRouter()

  // A payload that references a conversation gets an "Open" action on its toast
  const sessionAction = (payload: MessagePayload) => {
    const sessionId = payload.data?.session_id
    if (!sessionId) return undefined
    return {
      label: 'Open',
      onClick: () => router.push(conversationSessionUrl(sessionId))
    }
  }

  const handleNewNotification = (payload: MessagePayload) => {
    const notifType = payload.data?.type?.toLowerCase() || 'default'
    // Backend sends data-only messages (title/body inside data) so the SW SDK
    // doesn't auto-display duplicates; keep notification?. as a fallback.
    const title = payload.data?.title || payload.notification?.title
    const body = payload.data?.body || payload.notification?.body

    // Handle different notification types
    switch (notifType) {
      case NotificationType.KNOWLEDGE_PROCESSED:
        toast.success(title || 'Knowledge Processing Complete', {
          description: body,
          duration: 5000,
          position: 'top-right'
        })
        // Emit event to refresh knowledge grid
        mitt.emit('knowledge-updated')
        break

      case NotificationType.KNOWLEDGE_FAILED:
        toast.error(title || 'Knowledge Processing Failed', {
          description: body,
          duration: 8000,
          position: 'top-right'
        })
        break

      case NotificationType.SYSTEM:
        toast(title || 'System Notification', {
          description: body,
          duration: 5000,
          position: 'top-right',
          action: sessionAction(payload)
        })
        break

      case NotificationType.CHAT:
        toast(title || 'New Chat Message', {
          description: body,
          duration: 5000,
          position: 'top-right',
          action: sessionAction(payload)
        })
        break

      default:
        toast(title || 'New Notification', {
          description: body,
          duration: 5000,
          position: 'top-right'
        })
    }
  }

  const listenForBgNotification = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.eventType === SW_MESSAGE.BACKGROUND_NOTIFICATION) {
          handleNewNotification(event.data)
        }
        // SW notificationclick fallback for tabs it can't navigate() itself.
        // Pin the target to the inbox — never route to an arbitrary string
        // from a message event.
        if (
          event.data?.eventType === SW_MESSAGE.OPEN_CONVERSATION &&
          typeof event.data.url === 'string' &&
          event.data.url.startsWith(CONVERSATIONS_PATH)
        ) {
          router.push(event.data.url)
        }
      })
    }
  }

  const setFcmMessagingListener = async () => {
    const messaging = await getMessagingIfSupported()
    if (!messaging) return
    onMessage(messaging, (payload) => {
      handleNewNotification(payload)
    })
  }

  // Attach listeners — safe on mount, guarded to run once per app load. Does
  // NOT ask for permission: on iOS a permission request outside a user gesture
  // silently fails, so the request lives behind an explicit button
  // (EnablePushPrompt → enableNotifications).
  const startListening = async () => {
    try {
      if (!hasPermission.value || listenersAttached) return
      listenersAttached = true
      listenForBgNotification()
      await setFcmMessagingListener()

      // Already-granted users never see the enable prompt again, so this is
      // the only path that re-binds their FCM token to the current service
      // worker (the old firebase-messaging-sw.js one dies on upgrade).
      if (!tokenRefreshed) {
        tokenRefreshed = true
        refreshFCMToken()
      }
    } catch (err) {
      console.error('Error initializing notification listeners:', err)
    }
  }

  // Gesture-driven: prompt for permission, register the FCM token, then listen
  const enableNotifications = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission()
    hasPermission.value = granted
    if (granted) {
      // Token was just minted — don't mint again from startListening
      tokenRefreshed = true
      await startListening()
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      // Permission granted but token registration failed — surface it
      toast.error("Couldn't enable notifications. Refresh and try again.")
    }
    return granted
  }

  onMounted(() => {
    startListening()
  })

  return {
    hasPermission,
    enableNotifications,
  }
}
