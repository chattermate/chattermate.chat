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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mocks = vi.hoisted(() => {
  const toast = vi.fn(() => 'toast-id') as ReturnType<typeof vi.fn> & { dismiss: unknown }
  toast.dismiss = vi.fn()
  return { toast, registerSW: vi.fn() }
})

vi.mock('vue-sonner', () => ({ toast: mocks.toast }))
vi.mock('virtual:pwa-register', () => ({ registerSW: mocks.registerSW }))

type RegisterOptions = { immediate?: boolean; onNeedRefresh?: () => void }

const reload = vi.fn()

/** Show the update prompt and return the action the Reload button runs. */
async function clickableUpdateAction(updateSW: () => Promise<void>) {
  let options: RegisterOptions = {}
  mocks.registerSW.mockImplementation((opts: RegisterOptions) => {
    options = opts
    return updateSW
  })

  const { setupPWA } = await import('@/pwa/register')
  setupPWA()
  options.onNeedRefresh?.()

  // promptForUpdate imports vue-sonner lazily — let that microtask settle.
  await vi.waitFor(() => expect(mocks.toast).toHaveBeenCalled())
  const toastOptions = mocks.toast.mock.calls[0][1] as {
    action: { onClick: () => void }
  }
  return toastOptions.action.onClick
}

describe('PWA update prompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        getRegistrations: vi.fn().mockResolvedValue([]),
        ready: new Promise(() => {}),
        addEventListener: vi.fn(),
      },
      configurable: true,
    })

    Object.defineProperty(window, 'location', {
      value: { pathname: '/', reload },
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not reload while the new worker is still activating', async () => {
    // Regression: registerSW's updateSW ignores its reloadPage argument and
    // only posts SKIP_WAITING without awaiting activation, so it resolves
    // within a tick. Reloading on that resolution beat the handshake — the
    // document came back on the OLD worker with the new one still waiting, and
    // the prompt reappeared on every load. The reload must be left to
    // registerSW's own `controlling` listener.
    const updateSW = vi.fn().mockResolvedValue(undefined)
    const onClick = await clickableUpdateAction(updateSW)

    onClick()
    await Promise.resolve()
    await Promise.resolve()

    expect(updateSW).toHaveBeenCalled()
    expect(reload).not.toHaveBeenCalled()
  })

  it('forces a reload if the worker never takes control', async () => {
    const updateSW = vi.fn().mockResolvedValue(undefined)
    const onClick = await clickableUpdateAction(updateSW)

    vi.useFakeTimers()
    onClick()

    vi.advanceTimersByTime(3999)
    expect(reload).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('dismisses the toast when Reload is clicked', async () => {
    const updateSW = vi.fn().mockResolvedValue(undefined)
    const onClick = await clickableUpdateAction(updateSW)

    onClick()

    expect(mocks.toast.dismiss).toHaveBeenCalledWith('toast-id')
  })
})

describe('getSWRegistration', () => {
  const worker = (state: string) => {
    const listeners: Array<() => void> = []
    return {
      state,
      addEventListener: (_: string, fn: () => void) => listeners.push(fn),
      become(next: string) {
        this.state = next
        listeners.forEach((fn) => fn())
      },
    }
  }

  const useServiceWorker = (registration: unknown) => {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: new Promise(() => {}),
        getRegistration: vi.fn().mockResolvedValue(registration),
      },
      configurable: true,
    })
  }

  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    Object.defineProperty(window, 'location', { value: { pathname: '/' }, configurable: true, writable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits out a slow first install instead of giving up at the timeout', async () => {
    const installing = worker('installing')
    const registration = { installing, waiting: null }
    useServiceWorker(registration)
    const { getSWRegistration } = await import('@/pwa/register')

    let result: unknown = 'pending'
    getSWRegistration().then((value) => { result = value })
    await vi.advanceTimersByTimeAsync(8000)
    expect(result).toBe('pending')

    installing.become('activated')
    await vi.advanceTimersByTimeAsync(0)
    expect(result).toBe(registration)
  })

  it('gives up when the installing worker is thrown away', async () => {
    const installing = worker('installing')
    useServiceWorker({ installing, waiting: null })
    const { getSWRegistration } = await import('@/pwa/register')

    const result = getSWRegistration()
    await vi.advanceTimersByTimeAsync(8000)
    installing.become('redundant')

    expect(await result).toBeUndefined()
  })

  it('gives up at the timeout when no worker is on its way (vite dev)', async () => {
    useServiceWorker(undefined)
    const { getSWRegistration } = await import('@/pwa/register')

    const result = getSWRegistration()
    await vi.advanceTimersByTimeAsync(8000)

    expect(await result).toBeUndefined()
  })
})
