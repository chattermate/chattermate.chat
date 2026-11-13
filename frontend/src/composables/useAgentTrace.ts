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

import { ref, watch, type Ref } from 'vue'

/**
 * The live work trace: the steps the agent is taking for the reply on its way
 * (agent_step events). Shown while the reply is coming; cleared when it arrives
 * (loading turns false), whose receipt then sits on the reply itself.
 */

export interface LiveStep {
    step_id: string
    kind: string
    label: string
    state: 'running' | 'ok' | 'error' | 'skipped'
}

interface AgentStepEvent {
    v?: number
    turn_id?: string
    step_id?: string
    phase?: 'start' | 'finish'
    kind?: string
    label?: string
    done_label?: string
    status?: 'ok' | 'error' | 'skipped'
}

/** More are never shown, as the server's cap. */
const MAX_LIVE_STEPS = 20

export function useAgentTrace(options: {
    on: (event: string, listener: (...args: any[]) => void) => void
    loading: Ref<boolean>
}) {
    const steps = ref<LiveStep[]>([])
    let turnId = ''

    const onStep = (event: AgentStepEvent) => {
        if (!event || typeof event.step_id !== 'string' || typeof event.turn_id !== 'string') return
        if (event.turn_id !== turnId) {
            turnId = event.turn_id
            steps.value = []
        }
        const known = steps.value.find(s => s.step_id === event.step_id)
        if (event.phase === 'start' && !known && steps.value.length < MAX_LIVE_STEPS) {
            steps.value.push({
                step_id: event.step_id,
                kind: event.kind || 'other',
                label: event.label || '',
                state: 'running',
            })
        } else if (event.phase === 'finish' && known) {
            known.label = event.done_label || known.label
            known.state = event.status || 'ok'
        }
    }

    options.on('agent_step', onStep)
    watch(options.loading, (busy) => {
        if (!busy) {
            steps.value = []
            turnId = ''
        }
    })

    return { liveTrace: steps }
}
