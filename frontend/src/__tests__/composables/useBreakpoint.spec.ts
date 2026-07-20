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

import { describe, it, expect, vi, beforeEach } from 'vitest'

type Listener = (e: { matches: boolean }) => void

const makeMatchMedia = (matching: Record<string, boolean>) => {
  const listeners: Record<string, Listener[]> = {}
  const mql = (query: string) => ({
    matches: matching[query] ?? false,
    media: query,
    addEventListener: (_: string, cb: Listener) => {
      ;(listeners[query] ||= []).push(cb)
    },
    removeEventListener: vi.fn(),
  })
  return {
    matchMedia: vi.fn(mql),
    fire: (query: string, matches: boolean) => {
      matching[query] = matches
      ;(listeners[query] || []).forEach((cb) => cb({ matches }))
    },
  }
}

describe('useBreakpoint', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('reports mobile and tablet from matchMedia', async () => {
    const mm = makeMatchMedia({
      '(max-width: 768px)': true,
      '(max-width: 1024px)': true,
    })
    vi.stubGlobal('matchMedia', mm.matchMedia)

    const { useBreakpoint } = await import('@/composables/useBreakpoint')
    const { isMobile, isTablet } = useBreakpoint()
    expect(isMobile.value).toBe(true)
    expect(isTablet.value).toBe(true)
  })

  it('reacts to breakpoint changes', async () => {
    const mm = makeMatchMedia({
      '(max-width: 768px)': false,
      '(max-width: 1024px)': false,
    })
    vi.stubGlobal('matchMedia', mm.matchMedia)

    const { useBreakpoint } = await import('@/composables/useBreakpoint')
    const { isMobile, isTablet } = useBreakpoint()
    expect(isMobile.value).toBe(false)

    mm.fire('(max-width: 768px)', true)
    mm.fire('(max-width: 1024px)', true)
    expect(isMobile.value).toBe(true)
    expect(isTablet.value).toBe(true)
  })

  it('defaults to desktop when matchMedia is unavailable', async () => {
    vi.stubGlobal('matchMedia', undefined)
    const { useBreakpoint } = await import('@/composables/useBreakpoint')
    const { isMobile, isTablet } = useBreakpoint()
    expect(isMobile.value).toBe(false)
    expect(isTablet.value).toBe(false)
  })
})
