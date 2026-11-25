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

import { vi } from 'vitest'

/**
 * Drives the embed loader (chattermate.js) the way the widget frame would: the
 * frame is a real iframe the loader creates, and this plays its side of the
 * handshake (FRAME_READY → HOST_INIT, WIDGET_READY, …) with real MessageEvents.
 */

export const WIDGET_ID = 'w-123'
export const BASE_URL = 'https://api.example.com/api/v1'
export const FRAME_ORIGIN = 'https://api.example.com'

export const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

/** A token for `subject`, shaped like the ones /generate-token issues. */
export function tokenFor(subject: string, nonce = '1') {
  return `header.${btoa(JSON.stringify({ sub: subject, nonce }))}.signature`
}

export function resetPage() {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  localStorage.clear()
  sessionStorage.clear()
  const w = window as any
  w.chattermateId = WIDGET_ID
  w.chattermateBaseUrl = BASE_URL
  w.chattermateToken = undefined
  w.chattermateConfig = undefined
}

export function cleanupPage() {
  // Destroy the widget first, so none of its timers outlive the test environment.
  try { (window as any).ChatterMate?.destroy?.() } catch { /* nothing built */ }
  vi.unstubAllGlobals()
  vi.useRealTimers()
  delete (window as any).ChatterMate
}

/** Import the loader; it builds the widget straight away (the DOM is ready). */
export async function loadLoader({ fakeTimers = false } = {}) {
  vi.resetModules()
  await import('@/webclient/chattermate.js')
  if (fakeTimers) await vi.advanceTimersByTimeAsync(0)
  else await flush()
}

export const api = () => (window as any).ChatterMate

export function frames(): HTMLIFrameElement[] {
  return Array.from(document.querySelectorAll('.chattermate-iframe')) as HTMLIFrameElement[]
}

export function frame(): HTMLIFrameElement {
  const all = frames()
  if (all.length !== 1) throw new Error(`expected one widget frame, found ${all.length}`)
  return all[0]
}

export function frameWindow(target: HTMLIFrameElement = frame()): Window {
  return target.contentWindow as Window
}

/** A message as the widget frame posts it, from `origin`. */
export function fromFrame(data: Record<string, unknown>, { origin = FRAME_ORIGIN, source = frameWindow() } = {}) {
  window.dispatchEvent(new MessageEvent('message', { data, origin, source }))
}

/**
 * What the loader posts to `target` from now on, as [message, targetOrigin] pairs.
 * The frame is never really loaded here, so delivery is stubbed out.
 */
export function spyOnFrame(target: HTMLIFrameElement = frame()) {
  const post = vi.spyOn(frameWindow(target), 'postMessage').mockImplementation(() => {})
  post.mockClear()
  return post
}

/** The frame says hello; returns what the loader answered with (HOST_INIT). */
export function handshake({ origin = FRAME_ORIGIN } = {}) {
  const post = spyOnFrame()
  fromFrame({ type: 'FRAME_READY' }, { origin })
  const init = post.mock.calls.find(([message]) => (message as any)?.type === 'HOST_INIT')
  return init ? { message: init[0] as any, targetOrigin: init[1] as string } : null
}

/** Handshake, then the widget mounts. */
export function bringUp() {
  const init = handshake()
  fromFrame({ type: 'WIDGET_READY' })
  return init
}
