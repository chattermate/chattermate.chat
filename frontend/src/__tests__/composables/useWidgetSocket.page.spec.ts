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


/** Every chat message tells the agent which page the visitor is on. */
describe('widget: the page goes with each message', () => {
  vi.mock('socket.io-client', () => ({ io: () => (globalThis as any).__pageSocket }))

  let socket: { emit: ReturnType<typeof vi.fn> } & Record<string, unknown>

  beforeEach(() => {
    socket = {
      active: true, connected: true, connect: vi.fn(), disconnect: vi.fn(), emit: vi.fn(), off: vi.fn(),
      on: vi.fn(), removeAllListeners: vi.fn(),
    }
    ;(globalThis as any).__pageSocket = socket
  })

  afterEach(() => { vi.resetModules() })

  async function widget(options = {}) {
    const session = await import('@/webclient/frame-session')
    const { useWidgetSocket } = await import('@/composables/useWidgetSocket')
    const w = useWidgetSocket(options)
    w.setToken('t')
    w.connect()
    return { w, session }
  }

  const sentChat = () => socket.emit.mock.calls.filter(([event]) => event === 'chat').map(([, data]) => data)

  it('sends the host page the loader reported, as it is when the message goes', async () => {
    const { w, session } = await widget()
    session.setHostPageUrl('https://shop.example/products/blue-hoodie', 'Blue Hoodie')
    await w.sendMessage('Is this in stock?', '')
    session.setHostPageUrl('https://shop.example/cart', 'Cart')
    await w.sendMessage('How long is shipping?', '')

    expect(sentChat()).toEqual([
      expect.objectContaining({ message: 'Is this in stock?',
        page: { url: 'https://shop.example/products/blue-hoodie', title: 'Blue Hoodie' } }),
      expect.objectContaining({ message: 'How long is shipping?', page: { url: 'https://shop.example/cart', title: 'Cart' } }),
    ])
  })

  it("leaves the page out of the dashboard's own test chat", async () => {
    const { w, session } = await widget({ sendsPage: false })
    session.setHostPageUrl('https://admin.shopify.com/store/x/apps/chattermate', 'ChatterMate')
    await w.sendMessage('hello', '')
    expect(sentChat()[0]).not.toHaveProperty('page')
  })

  it('sends no page when it cannot tell one', async () => {
    const { w } = await widget()
    await w.sendMessage('hello', '')
    expect(sentChat()[0]).not.toHaveProperty('page')
  })
})
