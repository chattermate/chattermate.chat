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

/**
 * How the widget's socket survives the things that actually happen to it: a
 * backend that restarts, a laptop that sleeps, a token that gets reissued. The
 * old socket gave up after five attempts and re-sent whatever token it was
 * created with, so any of those left the visitor on "Connection failed" until
 * they reloaded the page (#315).
 */
describe('widget socket reconnection', () => {
  type Handler = (...args: any[]) => void

  const handlers = new Map<string, Handler[]>()
  let ioOptions: any
  let socket: any

  const fire = (event: string, ...args: any[]) =>
    (handlers.get(event) || []).forEach((h) => h(...args))

  vi.mock('socket.io-client', () => ({
    io: (...args: any[]) => (globalThis as any).__ioFactory(...args)
  }))

  beforeEach(() => {
    vi.useFakeTimers()
    handlers.clear()
    localStorage.clear()

    socket = {
      active: true,
      connected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      emit: vi.fn(),
      off: vi.fn(),
      removeAllListeners: vi.fn(() => handlers.clear()),
      on: vi.fn((event: string, handler: Handler) => {
        handlers.set(event, [...(handlers.get(event) || []), handler])
      })
    }
    ;(globalThis as any).__ioFactory = (_url: string, options: any) => {
      ioOptions = options
      return socket
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetModules()
  })

  async function connectWidget() {
    const { useWidgetSocket } = await import('@/composables/useWidgetSocket')
    const widget = useWidgetSocket()
    widget.setToken('token-1')
    widget.connect()
    return widget
  }

  /** socket.io calls the auth option before every attempt. */
  const currentAuth = () => {
    let payload: any
    ioOptions.auth((data: any) => { payload = data })
    return payload
  }

  it('sends the token that is current at each attempt, not the one it was built with', async () => {
    const widget = await connectWidget()
    expect(currentAuth().conversation_token).toBe('token-1')

    // A refreshed token has to reach the reconnect, or the socket spends the
    // rest of its life re-presenting one the server has already rejected.
    widget.setToken('token-2')
    expect(currentAuth().conversation_token).toBe('token-2')
  })

  it('keeps retrying rather than giving up after a handful of attempts', async () => {
    await connectWidget()
    expect(ioOptions.reconnectionAttempts).toBe(Infinity)
  })

  it('offers the manual retry while automatic attempts continue', async () => {
    const widget = await connectWidget()

    for (let i = 0; i < 5; i++) fire('connect_error')
    expect(widget.connectionStatus.value).toBe('failed')

    // The banner is an affordance, not a terminal state.
    fire('connect')
    expect(widget.connectionStatus.value).toBe('connected')
  })

  it('retries a connection the server rejected, which socket.io will not', async () => {
    await connectWidget()

    socket.active = false
    fire('connect_error')

    expect(socket.connect).not.toHaveBeenCalled()
    vi.advanceTimersByTime(15000)
    expect(socket.connect).toHaveBeenCalledTimes(1)
  })

  it('stops knocking when the server says the widget is unusable', async () => {
    await connectWidget()

    // The connect handler names the reason before it rejects. An org with no AI
    // config will refuse every attempt, so retrying is only load.
    fire('error', { error: 'AI configuration required', type: 'ai_config_missing' })
    socket.active = false
    fire('connect_error')

    vi.advanceTimersByTime(60000)
    expect(socket.connect).not.toHaveBeenCalled()
  })

  it('does not leave a retry running after the widget is torn down', async () => {
    const widget = await connectWidget()

    socket.active = false
    fire('connect_error')
    widget.cleanup()

    // The timer holds a reference to a socket nobody is listening to any more;
    // firing it would reconnect a widget that has been unmounted.
    vi.advanceTimersByTime(60000)
    expect(socket.connect).not.toHaveBeenCalled()
  })

  it('hands a rotated token to the connection it already has', async () => {
    const widget = await connectWidget()
    socket.connected = true

    // useConversationToken rotates before expiry; the open socket has to adopt it,
    // or a reconnect goes back to presenting the token that is about to lapse.
    widget.setToken('token-rotated')

    expect(socket.emit).toHaveBeenCalledWith('refresh_token', {
      conversation_token: 'token-rotated'
    })
    expect(currentAuth().conversation_token).toBe('token-rotated')
  })
})
