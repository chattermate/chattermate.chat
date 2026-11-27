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
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import {
  COMPOSER_MIN_HEIGHT,
  clampChosen,
  fitComposer,
  readChosenHeight,
  storeChosenHeight,
  useComposerSize,
} from '../useComposerSize'

const KEY = 'cm-inbox-composer-height:u1'
const PANE = 800 // auto cap 400, drag cap 600

describe('fitComposer', () => {
  const fit = (content: number, chosen: number | null = null, pinned = false) =>
    fitComposer({ content, paneHeight: PANE, chosen, pinned })

  it('is never shorter than two lines', () => {
    expect(fit(10)).toEqual({ height: COMPOSER_MIN_HEIGHT, scrolls: false })
  })

  it('grows with the text', () => {
    expect(fit(180)).toEqual({ height: 180, scrolls: false })
  })

  it('stops at half the pane, then scrolls inside', () => {
    expect(fit(2000)).toEqual({ height: 400, scrolls: true })
  })

  it('opens at your chosen height and still grows past it', () => {
    expect(fit(60, 250)).toEqual({ height: 250, scrolls: false })
    expect(fit(320, 250)).toEqual({ height: 320, scrolls: false })
  })

  it('lets a chosen height above half the pane be the cap', () => {
    expect(fit(2000, 550)).toEqual({ height: 550, scrolls: true })
  })

  it('keeps a dragged draft exactly where you left it', () => {
    expect(fit(380, 120, true)).toEqual({ height: 120, scrolls: true })
    expect(fit(60, 300, true)).toEqual({ height: 300, scrolls: false })
  })

  it('keeps a remembered height within a smaller pane', () => {
    expect(fitComposer({ content: 10, paneHeight: 400, chosen: 550, pinned: false }).height).toBe(300)
  })
})

describe('clampChosen', () => {
  it('stays between two lines and three quarters of the pane', () => {
    expect(clampChosen(5, PANE)).toBe(COMPOSER_MIN_HEIGHT)
    expect(clampChosen(5000, PANE)).toBe(600)
    expect(clampChosen(240.4, PANE)).toBe(240)
  })

  it('still allows two lines in a tiny pane', () => {
    expect(clampChosen(200, 40)).toBe(COMPOSER_MIN_HEIGHT)
  })
})

describe('chosen height storage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('round-trips and forgets', () => {
    storeChosenHeight(KEY, 240)
    expect(readChosenHeight(KEY)).toBe(240)
    storeChosenHeight(KEY, null)
    expect(readChosenHeight(KEY)).toBeNull()
  })

  it('ignores junk and heights below the minimum', () => {
    localStorage.setItem(KEY, 'tall')
    expect(readChosenHeight(KEY)).toBeNull()
    localStorage.setItem(KEY, '10')
    expect(readChosenHeight(KEY)).toBeNull()
  })

  it('carries on when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    expect(readChosenHeight(KEY)).toBeNull()
    expect(() => storeChosenHeight(KEY, 200)).not.toThrow()
  })

  it('does nothing without a key', () => {
    storeChosenHeight(null, 200)
    expect(localStorage.length).toBe(0)
    expect(readChosenHeight(null)).toBeNull()
  })
})

describe('useComposerSize', () => {
  let contentHeight = 0

  beforeEach(() => {
    contentHeight = 40
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  const mountBox = (resizable = true) => {
    const text = ref('')
    const box = ref<HTMLTextAreaElement | null>(null)
    const pane = ref<HTMLElement | null>(null)
    const canResize = ref(resizable)
    let api!: ReturnType<typeof useComposerSize>
    const wrapper = mount(defineComponent({
      setup() {
        api = useComposerSize({ text, box, pane: () => pane.value, resizable: canResize, storageKey: KEY })
        return () => h('div', { ref: pane }, [h('textarea', { ref: box })])
      },
    }), { attachTo: document.body })
    const el = box.value as HTMLTextAreaElement
    Object.defineProperty(pane.value, 'clientHeight', { configurable: true, get: () => PANE })
    Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => contentHeight })
    Object.defineProperty(el, 'offsetHeight', { configurable: true, get: () => parseFloat(el.style.height) || 0 })
    api.fit()
    return { wrapper, text, el, canResize, api }
  }

  const pointer = (type: string, clientY: number) =>
    new MouseEvent(type, { clientY, button: 0, bubbles: true }) as PointerEvent

  it('grows with pasted text and shrinks back once sent', async () => {
    const { text, el } = mountBox()
    expect(el.style.height).toBe(`${COMPOSER_MIN_HEIGHT}px`)
    contentHeight = 1200
    text.value = 'a long pasted reply'
    await nextTick()
    expect(el.style.height).toBe('400px')
    expect(el.style.overflowY).toBe('auto')
    contentHeight = 40
    text.value = ''
    await nextTick()
    expect(el.style.height).toBe(`${COMPOSER_MIN_HEIGHT}px`)
    expect(el.style.overflowY).toBe('hidden')
  })

  it('refits when the pane gets narrower and the text wraps onto more lines', async () => {
    let onResize: () => void = () => {}
    vi.stubGlobal('ResizeObserver', class {
      constructor(cb: () => void) { onResize = cb }
      observe() {}
      disconnect() {}
    })
    const { text, el, wrapper } = mountBox()
    let width = 600
    Object.defineProperty(wrapper.element, 'clientWidth', { configurable: true, get: () => width })
    onResize() // the observer takes in the pane's stubbed size
    contentHeight = 100
    text.value = 'a four line draft'
    await nextTick()
    expect(el.style.height).toBe('100px')

    // Same height, narrower pane: the draft now wraps to more lines
    contentHeight = 180
    onResize()
    expect(el.style.height).toBe('100px')
    width = 400
    onResize()
    expect(el.style.height).toBe('180px')
  })

  it('drags taller from the top edge and remembers the height', () => {
    const { el, api } = mountBox()
    api.startDrag(pointer('pointerdown', 500))
    expect(api.dragging.value).toBe(true)
    window.dispatchEvent(pointer('pointermove', 300))
    expect(el.style.height).toBe(`${COMPOSER_MIN_HEIGHT + 200}px`)
    window.dispatchEvent(pointer('pointerup', 300))
    expect(api.dragging.value).toBe(false)
    expect(readChosenHeight(KEY)).toBe(COMPOSER_MIN_HEIGHT + 200)
  })

  it('stops a drag at three quarters of the pane', () => {
    const { el, api } = mountBox()
    api.startDrag(pointer('pointerdown', 900))
    window.dispatchEvent(pointer('pointermove', 0))
    window.dispatchEvent(pointer('pointerup', 0))
    expect(el.style.height).toBe('600px')
  })

  it('lets an empty box sized by hand still grow with a long paste', async () => {
    const { text, el, api } = mountBox()
    api.nudge(100)
    contentHeight = 1200
    text.value = 'pasted after resizing'
    await nextTick()
    expect(el.style.height).toBe('400px')
  })

  it('opens at the remembered height', () => {
    storeChosenHeight(KEY, 220)
    const { el } = mountBox()
    expect(el.style.height).toBe('220px')
  })

  it('keeps a long draft dragged shorter until it is sent', async () => {
    const { text, el, api } = mountBox()
    contentHeight = 1200
    text.value = 'long'
    await nextTick()
    api.startDrag(pointer('pointerdown', 100))
    window.dispatchEvent(pointer('pointermove', 350))
    window.dispatchEvent(pointer('pointerup', 350))
    expect(el.style.height).toBe('150px')
    text.value = 'long, edited'
    await nextTick()
    expect(el.style.height).toBe('150px')
    // Sent: the next draft grows again from the remembered floor
    contentHeight = 40
    text.value = ''
    await nextTick()
    contentHeight = 300
    text.value = 'next'
    await nextTick()
    expect(el.style.height).toBe('300px')
  })

  it('steps with the arrow keys and resets to growing with the text', () => {
    const { el, api } = mountBox()
    api.nudge(16)
    expect(el.style.height).toBe(`${COMPOSER_MIN_HEIGHT + 16}px`)
    expect(readChosenHeight(KEY)).toBe(COMPOSER_MIN_HEIGHT + 16)
    api.reset()
    expect(el.style.height).toBe(`${COMPOSER_MIN_HEIGHT}px`)
    expect(readChosenHeight(KEY)).toBeNull()
  })

  it('only grows where it cannot be dragged (phones)', async () => {
    storeChosenHeight(KEY, 300)
    const { text, el, api } = mountBox(false)
    expect(el.style.height).toBe(`${COMPOSER_MIN_HEIGHT}px`)
    api.startDrag(pointer('pointerdown', 500))
    expect(api.dragging.value).toBe(false)
    api.nudge(16)
    expect(el.style.height).toBe(`${COMPOSER_MIN_HEIGHT}px`)
    contentHeight = 180
    text.value = 'grows'
    await nextTick()
    expect(el.style.height).toBe('180px')
  })

  it('drops its window listeners when unmounted mid-drag', () => {
    const { wrapper, api } = mountBox()
    const remove = vi.spyOn(window, 'removeEventListener')
    api.startDrag(pointer('pointerdown', 500))
    wrapper.unmount()
    expect(remove).toHaveBeenCalledWith('pointermove', expect.any(Function))
  })
})
