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

import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Tracks the on-screen keyboard via the VisualViewport API and exposes the
 * overlap as a --kb-offset CSS variable on <html>. Needed for installed iOS
 * PWAs, where the keyboard overlays the layout viewport instead of resizing it.
 */
// Fire onChange only once the offset stops moving — keyboard show/hide is an
// animation emitting a burst of intermediate values, and reacting to each one
// (e.g. scroll-to-bottom) causes visible jank on mid-range phones.
const SETTLE_MS = 120

export function useVisualViewport(onChange?: (keyboardOffset: number) => void) {
  const keyboardOffset = ref(0)
  let rafId = 0
  let settleTimer: ReturnType<typeof setTimeout> | undefined

  const measure = () => {
    rafId = 0
    const vv = window.visualViewport
    if (!vv) return
    // Pinch-zoom also shrinks vv.height; that's not a keyboard. Only measure
    // at (near) 1:1 scale so zooming doesn't produce a phantom offset.
    const offset = vv.scale > 1.05
      ? 0
      : Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
    if (offset !== keyboardOffset.value) {
      keyboardOffset.value = offset
      document.documentElement.style.setProperty('--kb-offset', `${offset}px`)
      clearTimeout(settleTimer)
      settleTimer = setTimeout(() => onChange?.(offset), SETTLE_MS)
    }
  }

  // Coalesce the event burst (visualViewport fires resize+scroll every frame
  // during keyboard/URL-bar animation) into one measurement per frame
  const update = () => {
    if (!rafId) rafId = requestAnimationFrame(measure)
  }

  onMounted(() => {
    const vv = window.visualViewport
    if (!vv) return
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
  })

  onUnmounted(() => {
    const vv = window.visualViewport
    if (!vv) return
    vv.removeEventListener('resize', update)
    vv.removeEventListener('scroll', update)
    cancelAnimationFrame(rafId)
    clearTimeout(settleTimer)
    document.documentElement.style.setProperty('--kb-offset', '0px')
  })

  return { keyboardOffset }
}
