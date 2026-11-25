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

/** The header's presence follows what the server pushes over the socket. */
describe('widget: presence pushed over the socket', () => {
  type Handler = (...args: any[]) => void
  const handlers = new Map<string, Handler[]>()
  const fire = (event: string, ...args: any[]) => (handlers.get(event) || []).forEach((h) => h(...args))

  vi.mock('socket.io-client', () => ({ io: () => (globalThis as any).__presenceSocket }))

  beforeEach(() => {
    handlers.clear()
    ;(globalThis as any).__presenceSocket = {
      active: true, connected: false, connect: vi.fn(), disconnect: vi.fn(), emit: vi.fn(), off: vi.fn(),
      removeAllListeners: vi.fn(() => handlers.clear()),
      on: vi.fn((event: string, handler: Handler) => { handlers.set(event, [...(handlers.get(event) || []), handler]) }),
    }
  })

  afterEach(() => { vi.resetModules() })

  it('keeps the latest presence for the header', async () => {
    const { useWidgetSocket } = await import('@/composables/useWidgetSocket')
    const { livePresence } = await import('@/utils/widgetPresence')
    const w = useWidgetSocket()
    w.setToken('t')
    w.connect()
    expect(livePresence.value).toBeNull()

    fire('presence', { mode: 'offline', available: false })
    expect(livePresence.value).toEqual({ mode: 'offline', available: false })

    fire('presence', { mode: 'ai', available: true })
    expect(livePresence.value).toEqual({ mode: 'ai', available: true })
  })
})
