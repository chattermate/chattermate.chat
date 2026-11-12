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

import { computed, ref, type Ref } from 'vue'

export const WINDOW_STANDARD = { width: 400, height: 560 }
export const WINDOW_PRESETS = [
  { value: 'compact', label: 'Compact', width: 360, height: 520 },
  { value: 'standard', label: 'Standard', ...WINDOW_STANDARD },
  { value: 'large', label: 'Large', width: 440, height: 680 },
]

/**
 * Chat window size chips. Presets write the same width/height the number fields do.
 * Standard is no saved size at all, because a saved one also overrides the Ask AI
 * palette's own size.
 */
export function useWindowSize(
  display: Ref<Record<string, any>>,
  setDisplay: (key: string, value: unknown) => void,
) {
  const customOpen = ref(false)

  const matching = computed(() =>
    WINDOW_PRESETS.find((preset) =>
      preset.width === (display.value.width ?? WINDOW_STANDARD.width)
      && preset.height === (display.value.height ?? WINDOW_STANDARD.height))?.value)

  const active = computed(() => (customOpen.value ? 'custom' : matching.value ?? 'custom'))

  const pickPreset = (preset: typeof WINDOW_PRESETS[number]) => {
    customOpen.value = false
    const standard = preset.value === 'standard'
    setDisplay('width', standard ? null : preset.width)
    setDisplay('height', standard ? null : preset.height)
  }

  const pickCustom = () => {
    customOpen.value = true
  }

  return { active, pickCustom, pickPreset }
}
