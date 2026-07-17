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
export function useVisualViewport(onChange?: (keyboardOffset: number) => void) {
  const keyboardOffset = ref(0)

  const update = () => {
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
      onChange?.(offset)
    }
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
    document.documentElement.style.setProperty('--kb-offset', '0px')
  })

  return { keyboardOffset }
}
