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

Live ticket updates: joins the per-org ticket room on the /agent namespace
and forwards `ticket_update` frames. Callers keep a poll fallback — a missed
frame is never fatal.
*/

import { onBeforeUnmount, onMounted } from 'vue'
import { socketService } from '@/services/socket'
import { userService } from '@/services/user'
import type { TicketUpdateEvent } from '@/types/ticket'

export function useTicketSocket(onUpdate: (event: TicketUpdateEvent) => void) {
  const orgId = userService.getCurrentUser()?.organization_id
  const room = orgId ? `org_tickets_${orgId}` : null

  const handleUpdate = (data: unknown) => {
    const event = data as TicketUpdateEvent
    if (event && event.ticket_id) onUpdate(event)
  }

  const joinRoom = () => {
    if (room) socketService.emit('join_room', { session_id: room })
  }

  const handleReconnect = () => {
    socketService.off('ticket_update', handleUpdate)
    socketService.on('ticket_update', handleUpdate)
    joinRoom()
  }

  onMounted(() => {
    if (!room) return
    socketService.connect()
    socketService.on('ticket_update', handleUpdate)
    socketService.onReconnect(handleReconnect)
    joinRoom()
  })

  onBeforeUnmount(() => {
    if (!room) return
    socketService.emit('leave_room', { session_id: room })
    socketService.off('ticket_update', handleUpdate)
    socketService.offReconnect(handleReconnect)
  })
}
