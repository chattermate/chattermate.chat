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
import { postToHost } from '../webclient/host-bridge'
import { reportedPageUrl } from '../webclient/frame-session'
import type { ActionStatus, HostPrompt, PageChip } from '../webclient/actions/hostActionsClient'
import { createJourneyClient, type JourneyProgress } from '../webclient/journeys/journeyClient'

interface Deps {
  on: (event: string, listener: (...args: any[]) => void) => void
  emit: (event: string, data: unknown) => void
  /** Where the step's message and chips go (shared with ChatterMate.prompt). */
  showPrompt: (prompt: HostPrompt | null) => void
  addNotice: (text: string, kind: 'message' | 'block') => void
  runLocalAction: (chip: PageChip, onDone: (status: ActionStatus) => void) => void
}

/**
 * Journeys in the widget frame: wires the journey client to the socket, the
 * embedding page and the chat. Call during setup, like useHostActions.
 */
export function useJourneys(deps: Deps) {
  const journeyProgress = ref<JourneyProgress | null>(null)

  const client = createJourneyClient({
    emit: deps.emit,
    showStep: (prompt, progress) => {
      journeyProgress.value = progress
      deps.showPrompt(prompt)
    },
    addNotice: deps.addNotice,
    openChat: () => postToHost({ type: 'WIDGET_OPEN_REQUEST' }),
  })

  deps.on('journey_state', client.handleState)
  // A new connection: report where the visitor is so the server can pick up.
  deps.on('session_initialized', () => client.sync({ url: reportedPageUrl() }))

  const onMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) return
    const data = event.data
    if (!data || typeof data.type !== 'string') return
    if (data.type === 'HOST_PAGE' && typeof data.url === 'string') client.sync({ url: data.url })
    // useHostActions sends the new context first; this re-checks the step against it.
    if (data.type === 'HOST_CONTEXT') client.sync({})
    if (data.type === 'HOST_EVENT' && typeof data.event === 'string') client.sync({ event: data.event })
    if (data.type === 'HOST_JOURNEY_START' && typeof data.key === 'string') client.start(data.key)
  }
  window.addEventListener('message', onMessage)

  /** A chip on a journey step: text is sent as the visitor's reply; an action runs. */
  function runChip(chip: PageChip, sendText: (text: string) => void) {
    client.activity()
    if (chip.kind === 'text') {
      sendText(chip.value)
      return
    }
    deps.runLocalAction(chip, (status) => {
      if (status === 'ok') client.sync({ action: chip.value })
    })
  }

  onBeforeUnmount(() => {
    window.removeEventListener('message', onMessage)
    client.dispose()
  })

  return {
    journeyProgress,
    runChip,
    skipStep: client.skip,
    dismissJourney: client.dismiss,
    noteActivity: client.activity,
  }
}
