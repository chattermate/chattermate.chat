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

import { onBeforeUnmount, ref } from 'vue'
import { hostOrigin, postToHost } from '../webclient/host-bridge'
import { isFramed } from '../webclient/frame-session'
import {
  createHostActionsClient, type ActionOutcome, type ActionRequest, type HostPrompt, type PendingConfirm,
} from '../webclient/actions/hostActionsClient'

interface SocketHooks {
  on: (event: string, listener: (...args: any[]) => void) => void
  emit: (event: string, data: unknown) => void
}

/**
 * In-app actions for the widget frame: the confirm card's state, wired to the
 * widget socket and to the embedding page. Must be called during setup, so the
 * page's HOST_ACTIONS (sent once the widget mounts) is never missed.
 */
export function useHostActions(
  socket: SocketHooks,
  onPrompt?: (prompt: HostPrompt) => void,
  onOutcome?: (outcome: ActionOutcome) => void,
) {
  const pendingConfirm = ref<PendingConfirm | null>(null)

  const client = createHostActionsClient({
    postToHost,
    emit: socket.emit,
    // Actions need a page whose origin we know: the framed widget with a real host.
    trustedHostOrigin: () => {
      if (!isFramed()) return null
      const origin = hostOrigin()
      return origin === '*' ? null : origin
    },
    onConfirmChange: (pending) => { pendingConfirm.value = pending },
    onPrompt,
    onOutcome,
  })

  socket.on('action_request', (request: ActionRequest) => client.handleRequest(request))
  // A new connection has a new server session: tell it again what the page offers.
  socket.on('session_initialized', () => client.announce())

  const onMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) return
    if (!event.data || typeof event.data.type !== 'string') return
    client.handleHostMessage(event.data)
  }
  window.addEventListener('message', onMessage)

  onBeforeUnmount(() => {
    window.removeEventListener('message', onMessage)
    client.dispose()
  })

  return { pendingConfirm, approveAction: client.approve, declineAction: client.decline, runLocalAction: client.runLocal }
}
