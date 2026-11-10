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

  /** A conversation token for `customerId` (only the claims matter here). */
  const tokenFor = (customerId: string, version = 1) =>
    `header.${btoa(JSON.stringify({ sub: customerId, v: version }))}.signature`

  it('keeps a live connection for the same visitor instead of rebuilding it', async () => {
    const widget = await connectWidget()
    widget.setToken(tokenFor('customer-1'))
    socket.connected = true
    fire('connect')

    // A takeover re-runs the widget's authorization, which calls connect() again.
    // Rebuilding the socket here dropped the agent's first reply (found by e2e).
    // A rotated token for the same visitor is not a reason to rebuild either.
    widget.setToken(tokenFor('customer-1', 2))
    await expect(widget.connect()).resolves.toBe(true)
    expect(socket.disconnect).not.toHaveBeenCalled()
  })

  it('reconnects when the visitor changes', async () => {
    const widget = await connectWidget()
    widget.setToken(tokenFor('customer-1'))
    socket.connected = true
    fire('connect')

    widget.setToken(tokenFor('customer-2'))
    void widget.connect()
    expect(socket.disconnect).toHaveBeenCalled()
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

  /** How socket.io delivers a refusal: the reason rides on the connect_error.
   *  Events the server emits before refusing never reach the client. */
  const refuse = (type: string, error = 'refused') => {
    socket.active = false
    fire('connect_error', Object.assign(new Error(error), { data: { type, error } }))
  }

  it('stops knocking when the server says the widget is unusable', async () => {
    const { useWidgetSocket } = await import('@/composables/useWidgetSocket')
    const widget = useWidgetSocket()
    widget.setToken('token-1')
    const connected = widget.connect()

    // An org with no AI config will refuse every attempt, so retrying is only load.
    refuse('ai_config_missing', 'AI configuration required')
    expect(widget.errorMessage.value).toBe('Chat service is currently unavailable.')
    expect(widget.connectionStatus.value).toBe('failed')
    // The widget's startup awaits this: a refusal has to settle it.
    await expect(connected).resolves.toBe(false)

    vi.advanceTimersByTime(60000)
    expect(socket.connect).not.toHaveBeenCalled()
  })

  describe('a visitor the server has not bound to a customer yet', () => {
    it('settles connect() with the reason, so the caller can authorize again', async () => {
      const { useWidgetSocket } = await import('@/composables/useWidgetSocket')
      const widget = useWidgetSocket()
      widget.setToken('anonymous-token')
      const connected = widget.connect()

      refuse('customer_required')

      await expect(connected).resolves.toBe(false)
      expect(widget.refusal.value).toBe('customer_required')
      expect(widget.showError.value).toBe(false) // nothing the visitor can act on
    })

    it('does not retry the same token', async () => {
      await connectWidget()
      refuse('customer_required')

      vi.advanceTimersByTime(60000)
      expect(socket.connect).not.toHaveBeenCalled()
    })

    it('forgets the refusal when it connects again', async () => {
      const widget = await connectWidget()
      refuse('customer_required')

      void widget.connect()
      expect(widget.refusal.value).toBeNull()
    })
  })

  describe('a token that expired or was revoked', () => {
    // A tab left open past the token's lifetime reconnected with the dead token
    // about once a minute for hours, and never got a chat back (prod, Oct 2026).
    it('hands a startup refusal to the caller of connect(), not the callback', async () => {
      const { useWidgetSocket } = await import('@/composables/useWidgetSocket')
      const widget = useWidgetSocket()
      const reauthorize = vi.fn()
      widget.onReauthorize(reauthorize)
      widget.setToken('expired-token')
      const connected = widget.connect()

      refuse('token_invalid', 'Conversation token no longer valid')

      await expect(connected).resolves.toBe(false)
      expect(widget.refusal.value).toBe('token_invalid')
      expect(widget.showError.value).toBe(false)
      expect(reauthorize).not.toHaveBeenCalled()
    })

    it('asks the widget to authorize again when a later reconnect is refused', async () => {
      const widget = await connectWidget()
      const reauthorize = vi.fn()
      widget.onReauthorize(reauthorize)
      fire('connect')

      // The connection drops and the reconnect presents the token that has lapsed.
      refuse('token_invalid', 'Conversation token no longer valid')

      expect(reauthorize).toHaveBeenCalledTimes(1)
      expect(widget.showError.value).toBe(false)
    })

    it('does not retry the dead token', async () => {
      const widget = await connectWidget()
      widget.onReauthorize(vi.fn())
      fire('connect')
      refuse('token_invalid')

      vi.advanceTimersByTime(60000)
      expect(socket.connect).not.toHaveBeenCalled()
    })

    it('leaves refusals authorizing cannot fix to the visitor-facing error', async () => {
      const widget = await connectWidget()
      const reauthorize = vi.fn()
      widget.onReauthorize(reauthorize)
      fire('connect')

      refuse('ai_config_missing', 'AI configuration required')

      expect(reauthorize).not.toHaveBeenCalled()
      expect(widget.errorMessage.value).toBe('Chat service is currently unavailable.')
    })
  })

  describe('a conversation deleted while the widget was open', () => {
    // Data retention can delete the conversation and the visitor's record under
    // an open socket. The server then says so and closes the connection, which
    // socket.io never reconnects on its own.
    it('connects again when the server closes the connection', async () => {
      await connectWidget()
      fire('connect')

      fire('disconnect', 'io server disconnect')

      expect(socket.connect).toHaveBeenCalledTimes(1)
    })

    it('authorizes a new visitor when that connection is refused', async () => {
      const widget = await connectWidget()
      const reauthorize = vi.fn()
      widget.onReauthorize(reauthorize)
      fire('connect')

      fire('disconnect', 'io server disconnect')
      refuse('customer_required', 'Visitor not authorized yet')

      expect(reauthorize).toHaveBeenCalledTimes(1)
    })

    it('shows the server\'s request to send the message again', async () => {
      const widget = await connectWidget()
      fire('connect')

      fire('error', { type: 'conversation_gone', error: 'This conversation has ended. Please send your message again.' })

      expect(widget.errorMessage.value).toBe('This conversation has ended. Please send your message again.')
    })

    it('leaves other disconnects to socket.io', async () => {
      await connectWidget()
      fire('connect')

      fire('disconnect', 'transport close')
      fire('disconnect', 'io client disconnect')

      expect(socket.connect).not.toHaveBeenCalled()
    })
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
