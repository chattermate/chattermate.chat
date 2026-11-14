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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** A reply the person edits after sending changes in the widget, in place. */
describe('widget: an edited reply', () => {
  type Handler = (...args: any[]) => void
  const handlers = new Map<string, Handler[]>()
  const fire = (event: string, ...args: any[]) => (handlers.get(event) || []).forEach((h) => h(...args))

  vi.mock('socket.io-client', () => ({ io: () => (globalThis as any).__editsSocket }))

  beforeEach(() => {
    handlers.clear()
    ;(globalThis as any).__editsSocket = {
      active: true, connected: false, connect: vi.fn(), disconnect: vi.fn(), emit: vi.fn(), off: vi.fn(),
      removeAllListeners: vi.fn(() => handlers.clear()),
      on: vi.fn((event: string, handler: Handler) => { handlers.set(event, [...(handlers.get(event) || []), handler]) }),
    }
  })

  afterEach(() => { vi.resetModules() })

  async function widget() {
    const { useWidgetSocket } = await import('@/composables/useWidgetSocket')
    const w = useWidgetSocket()
    w.setToken('t')
    w.connect()
    return w
  }

  it("keeps a live reply's id, and shows the new text marked edited", async () => {
    const w = await widget()
    fire('chat_response', { type: 'agent_message', message: 'Your refund is on its way', message_id: 41, session_id: 's1' })
    expect(w.messages.value.at(-1)).toMatchObject({ id: 41, message: 'Your refund is on its way' })

    fire('message_edited', { message_id: 41, message: 'Your refund reaches you in 3 days', edited_at: '2026-11-14T10:00:00Z' })
    expect(w.messages.value.at(-1)).toMatchObject({
      id: 41, message: 'Your refund reaches you in 3 days', attributes: expect.objectContaining({ edited_at: '2026-11-14T10:00:00Z' }),
    })
  })

  it('ignores an edit to a message it never showed, or one without text', async () => {
    const w = await widget()
    fire('chat_response', { type: 'agent_message', message: 'Hello', message_id: 7, session_id: 's1' })
    fire('message_edited', { message_id: 99, message: 'Elsewhere' })
    fire('message_edited', { message_id: 7 })
    expect(w.messages.value.at(-1)?.message).toBe('Hello')
  })
})
