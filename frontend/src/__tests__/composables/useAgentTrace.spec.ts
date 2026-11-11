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

import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { useAgentTrace } from '@/composables/useAgentTrace'

const setUp = () => {
    const listeners: Record<string, (data: any) => void> = {}
    const loading = ref(true)
    const { liveTrace } = useAgentTrace({ on: (event, fn) => { listeners[event] = fn }, loading })
    return { liveTrace, loading, step: (data: any) => listeners.agent_step(data) }
}

describe('useAgentTrace', () => {
    it('adds a step as it starts and settles it as it finishes', () => {
        const { liveTrace, step } = setUp()
        step({ turn_id: 't1', step_id: 'a', phase: 'start', kind: 'knowledge', label: 'Searching the help center' })
        expect(liveTrace.value).toEqual([{ step_id: 'a', kind: 'knowledge', label: 'Searching the help center', state: 'running' }])
        step({ turn_id: 't1', step_id: 'a', phase: 'finish', done_label: 'Searched the help center', status: 'ok' })
        expect(liveTrace.value[0]).toMatchObject({ label: 'Searched the help center', state: 'ok' })
    })

    it('starts over for a new turn, and ignores what it cannot place', () => {
        const { liveTrace, step } = setUp()
        step({ turn_id: 't1', step_id: 'a', phase: 'start', label: 'One' })
        step({ turn_id: 't2', step_id: 'b', phase: 'start', label: 'Two' })
        step({ turn_id: 't2', step_id: 'zzz', phase: 'finish', done_label: 'Nope' })
        step({ step_id: 'c', phase: 'start' })
        step(null)
        expect(liveTrace.value.map(s => s.label)).toEqual(['Two'])
    })

    it('clears when the reply arrives', async () => {
        const { liveTrace, step, loading } = setUp()
        step({ turn_id: 't1', step_id: 'a', phase: 'start', label: 'One' })
        loading.value = false
        await nextTick()
        expect(liveTrace.value).toEqual([])
    })
})
