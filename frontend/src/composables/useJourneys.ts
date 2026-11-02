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
  /** The message in the page-message slot now (shared with ChatterMate.prompt). */
  currentPrompt: () => HostPrompt | null
  /** Where the step's message and chips go. */
  showPrompt: (prompt: HostPrompt | null) => void
  addNotice: (text: string, kind: 'message' | 'block') => void
  runLocalAction: (chip: PageChip, onDone: (status: ActionStatus) => void) => boolean
}

/**
 * Journeys in the widget frame: wires the journey client to the socket, the
 * embedding page and the chat. Call during setup, like useHostActions.
 */
export function useJourneys(deps: Deps) {
  const journeyProgress = ref<JourneyProgress | null>(null)
  // An action chip is running: the others wait, so a double click runs it once.
  const chipBusy = ref(false)

  // Signals sent before the socket is up (startJourney/notify at page load,
  // flushed by the loader on WIDGET_READY) would be dropped, so they wait.
  let connected = false
  const queued: Array<[string, unknown]> = []
  const emit = (event: string, data: unknown) => {
    if (connected) deps.emit(event, data)
    else queued.push([event, data])
  }

  const client = createJourneyClient({
    emit,
    showStep: (prompt, progress) => {
      journeyProgress.value = progress
      // A message the page itself showed outranks the step's: a step that has
      // nothing to say (or no journey at all) must not wipe it.
      const current = deps.currentPrompt()
      if (current && current.source !== 'journey') return
      deps.showPrompt(prompt)
    },
    addNotice: deps.addNotice,
    openChat: () => postToHost({ type: 'WIDGET_OPEN_REQUEST' }),
  })

  deps.on('journey_state', client.handleState)
  // A new connection: report where the visitor is so the server can pick up.
  deps.on('session_initialized', () => {
    connected = true
    client.sync({ url: reportedPageUrl() })
    for (const [event, data] of queued.splice(0)) deps.emit(event, data)
  })

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
    if (chipBusy.value) return
    const started = deps.runLocalAction(chip, (status) => {
      chipBusy.value = false
      if (status === 'ok') client.sync({ action: chip.value })
    })
    if (started) chipBusy.value = true
  }

  onBeforeUnmount(() => {
    window.removeEventListener('message', onMessage)
    client.dispose()
  })

  return {
    journeyProgress,
    chipBusy,
    runChip,
    skipStep: client.skip,
    dismissJourney: client.dismiss,
    noteActivity: client.activity,
  }
}
