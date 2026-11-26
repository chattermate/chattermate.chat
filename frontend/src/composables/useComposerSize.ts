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

import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

/**
 * A reply box that grows with its text and that you can drag to the height
 * you like.
 *
 * - It grows as you type or paste, up to half the pane it sits in, then
 *   scrolls inside.
 * - Dragging its handle sets a height you keep: it's remembered (per agent)
 *   and the box never opens shorter than it. Text still grows it past that,
 *   up to whichever cap is higher.
 * - The draft you dragged stays exactly as tall as you left it until it's
 *   sent or cleared, so dragging a long draft shorter sticks.
 * - Where it can't be dragged (phones) it only grows.
 */

/** Two lines of text and the box's padding */
export const COMPOSER_MIN_HEIGHT = 52
/** Growing with the text stops here (share of the pane's height) */
export const COMPOSER_AUTO_CAP = 0.5
/** Dragging stops here (share of the pane's height) */
export const COMPOSER_DRAG_CAP = 0.75
/** One arrow-key press on the handle */
export const COMPOSER_KEY_STEP = 16

export interface ComposerFit {
  height: number
  /** The text is taller than the box: it scrolls inside */
  scrolls: boolean
}

export interface ComposerLimits {
  /** The text's own height */
  content: number
  /** The pane the box sits in */
  paneHeight: number
  /** The height you dragged it to, if any */
  chosen: number | null
  /** You dragged this draft: it stays exactly at `chosen` */
  pinned: boolean
}

/** The tallest the box may be dragged in a pane this tall */
export function dragCap(paneHeight: number): number {
  return Math.max(COMPOSER_MIN_HEIGHT, Math.floor(paneHeight * COMPOSER_DRAG_CAP))
}

/** A dragged height, kept within the minimum and the pane's drag cap */
export function clampChosen(height: number, paneHeight: number): number {
  return Math.min(dragCap(paneHeight), Math.max(COMPOSER_MIN_HEIGHT, Math.round(height)))
}

/** How tall the box should be for its text, the pane and your chosen height */
export function fitComposer({ content, paneHeight, chosen, pinned }: ComposerLimits): ComposerFit {
  const floor = chosen === null ? COMPOSER_MIN_HEIGHT : clampChosen(chosen, paneHeight)
  if (pinned && chosen !== null) return { height: floor, scrolls: content > floor }
  const autoCap = Math.max(COMPOSER_MIN_HEIGHT, Math.floor(paneHeight * COMPOSER_AUTO_CAP))
  const cap = Math.max(autoCap, floor)
  return { height: Math.min(cap, Math.max(floor, Math.ceil(content))), scrolls: content > cap }
}

/** The height you chose last time, or null (none saved, or storage is off) */
export function readChosenHeight(key: string | null): number | null {
  if (!key) return null
  try {
    const value = Number(localStorage.getItem(key))
    return Number.isFinite(value) && value >= COMPOSER_MIN_HEIGHT ? value : null
  } catch {
    return null
  }
}

/** Saves (or, with null, forgets) your chosen height; storage being off is fine */
export function storeChosenHeight(key: string | null, height: number | null): void {
  if (!key) return
  try {
    if (height === null) localStorage.removeItem(key)
    else localStorage.setItem(key, String(height))
  } catch {
    // Private mode or blocked storage: the height lasts for this page only
  }
}

export interface ComposerSizeOptions {
  /** The draft; the box refits whenever it changes */
  text: Ref<string>
  box: Ref<HTMLTextAreaElement | null>
  /** What the caps are a share of (the conversation pane) */
  pane: () => HTMLElement | null
  /** The handle is offered (not on phones) */
  resizable: Ref<boolean>
  /** Where your chosen height is remembered; null keeps it for this page only */
  storageKey: string | null
}

export function useComposerSize({ text, box, pane, resizable, storageKey }: ComposerSizeOptions) {
  const chosen = ref<number | null>(readChosenHeight(storageKey))
  const pinned = ref(false)
  const dragging = ref(false)
  /** The box's height now, for the handle's aria-valuenow */
  const height = ref(COMPOSER_MIN_HEIGHT)
  /** The drag cap for the pane now, for the handle's aria-valuemax */
  const maxHeight = ref(COMPOSER_MIN_HEIGHT)

  const paneHeight = () => pane()?.clientHeight || window.innerHeight

  function fit() {
    const el = box.value
    if (!el) return
    const scrollTop = el.scrollTop
    // Measured with no height of its own, the box reports its text's height
    el.style.height = 'auto'
    const panePx = paneHeight()
    const result = fitComposer({
      content: el.scrollHeight,
      paneHeight: panePx,
      chosen: resizable.value ? chosen.value : null,
      pinned: resizable.value && pinned.value,
    })
    el.style.height = `${result.height}px`
    el.style.overflowY = result.scrolls ? 'auto' : 'hidden'
    el.scrollTop = scrollTop
    height.value = result.height
    maxHeight.value = dragCap(panePx)
  }

  function choose(next: number) {
    chosen.value = clampChosen(next, paneHeight())
    pinned.value = true
    fit()
  }

  // ---- Dragging the handle (it sits on the top edge: up makes it taller) ----
  let startY = 0
  let startHeight = 0

  function onDragMove(event: PointerEvent) {
    choose(startHeight + startY - event.clientY)
  }

  function stopDrag() {
    if (!dragging.value) return
    dragging.value = false
    window.removeEventListener('pointermove', onDragMove)
    window.removeEventListener('pointerup', stopDrag)
    window.removeEventListener('pointercancel', stopDrag)
    storeChosenHeight(storageKey, chosen.value)
  }

  function startDrag(event: PointerEvent) {
    const el = box.value
    if (!resizable.value || !el || event.button !== 0) return
    event.preventDefault()
    startY = event.clientY
    startHeight = height.value
    dragging.value = true
    window.addEventListener('pointermove', onDragMove)
    window.addEventListener('pointerup', stopDrag)
    window.addEventListener('pointercancel', stopDrag)
  }

  /** The handle's arrow keys: a step taller or shorter */
  function nudge(delta: number) {
    if (!resizable.value || !box.value) return
    choose(height.value + delta)
    storeChosenHeight(storageKey, chosen.value)
  }

  /** Back to growing with the text alone (double-click the handle) */
  function reset() {
    chosen.value = null
    pinned.value = false
    storeChosenHeight(storageKey, null)
    fit()
  }

  // A sent or cleared draft lets the next one grow again
  watch(text, (value) => {
    if (!value) pinned.value = false
    fit()
  }, { flush: 'post' })
  watch(resizable, fit, { flush: 'post' })

  let observer: ResizeObserver | null = null
  onMounted(() => {
    fit()
    const el = pane()
    if (el && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => fit())
      observer.observe(el)
    }
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    stopDrag()
  })

  return { height, maxHeight, dragging, fit, startDrag, nudge, reset }
}
