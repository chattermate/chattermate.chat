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

import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { WINDOW_PRESETS, useWindowSize } from '@/composables/useWindowSize'

function setup(saved: Record<string, any> = {}) {
  const display = ref(saved)
  const size = useWindowSize(display, (key, value) => {
    const next = { ...display.value }
    if (value === null) delete next[key]
    else next[key] = value
    display.value = next
  })
  return { display, size }
}

const preset = (value: string) => WINDOW_PRESETS.find((option) => option.value === value)!

describe('useWindowSize', () => {
  it('nothing saved reads as Standard', () => {
    expect(setup().size.active.value).toBe('standard')
  })

  it('saved sizes match their preset', () => {
    expect(setup({ width: 360, height: 520 }).size.active.value).toBe('compact')
    expect(setup({ width: 440, height: 680 }).size.active.value).toBe('large')
    expect(setup({ width: 400, height: 560 }).size.active.value).toBe('standard')
  })

  it('anything else reads as Custom', () => {
    expect(setup({ width: 500, height: 600 }).size.active.value).toBe('custom')
    expect(setup({ width: 360 }).size.active.value).toBe('custom')
  })

  it('a preset writes both keys', () => {
    const { display, size } = setup()
    size.pickPreset(preset('large'))
    expect(display.value).toEqual({ width: 440, height: 680 })
  })

  it('Standard clears them, so an Ask AI palette keeps its own size', () => {
    const { display, size } = setup({ width: 440, height: 680, side: 'left' })
    size.pickPreset(preset('standard'))
    expect(display.value).toEqual({ side: 'left' })
  })

  it('Custom opens the fields without changing the size', () => {
    const { display, size } = setup()
    size.pickCustom()
    expect(size.active.value).toBe('custom')
    expect(display.value).toEqual({})
  })

  it('leaving Custom for a preset closes it', () => {
    const { size } = setup()
    size.pickCustom()
    size.pickPreset(preset('compact'))
    expect(size.active.value).toBe('compact')
  })
})
