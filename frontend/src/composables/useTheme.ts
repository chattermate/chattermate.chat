import { ref, computed } from 'vue'

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
    document.documentElement.setAttribute('data-theme', resolve(m))
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
