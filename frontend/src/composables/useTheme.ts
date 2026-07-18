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

import { ref, computed } from 'vue'
import { THEME_COLORS } from '@/config/themeColors'

export type ThemeMode = 'dark' | 'light' | 'system'

const STORAGE_KEY = 'cm-theme'

const stored = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'dark'
const mode = ref<ThemeMode>(stored === 'light' || stored === 'system' ? (stored as ThemeMode) : 'dark')

const prefersDark = (): boolean =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

// Resolve the chosen mode to the concrete theme applied to the DOM
const resolve = (m: ThemeMode): 'dark' | 'light' =>
  m === 'system' ? (prefersDark() ? 'dark' : 'light') : m

const apply = (m: ThemeMode) => {
  if (typeof document !== 'undefined') {
    const resolved = resolve(m)
    document.documentElement.setAttribute('data-theme', resolved)
    // Keep the browser/PWA chrome color in sync with the page background
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[resolved])
  }
}

// Apply on first import (initial load) and follow OS changes while in system mode
apply(mode.value)
if (typeof window !== 'undefined' && window.matchMedia) {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (mode.value === 'system') apply('system')
    })
}

export function useTheme() {
  const setTheme = (value: ThemeMode) => {
    mode.value = value
    localStorage.setItem(STORAGE_KEY, value)
    apply(value)
  }

  // Cycle: dark → light → system → dark
  const toggle = () => {
    const next: ThemeMode =
      mode.value === 'dark' ? 'light' : mode.value === 'light' ? 'system' : 'dark'
    setTheme(next)
  }

  return {
    mode,
    theme: mode,
    toggle,
    setTheme,
    isDark: computed(() => resolve(mode.value) === 'dark'),
    isSystem: computed(() => mode.value === 'system'),
  }
}
