import type { ApiClient } from './client'
import type { Schemas } from './types'

export type AppNotification = Schemas['NotificationResponse']

/** The signed-in user's in-app notifications, newest first. */
export async function notificationsFor(api: ApiClient): Promise<AppNotification[]> {
  return api.get<AppNotification[]>('/notifications')
}
