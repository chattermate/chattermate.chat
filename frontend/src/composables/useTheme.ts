import { ref, computed } from 'vue'

const theme = ref(localStorage.getItem('cm-theme') ?? 'dark')

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('cm-theme', theme.value)
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  function setTheme(value: 'dark' | 'light') {
    theme.value = value
    localStorage.setItem('cm-theme', theme.value)
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  return {
    theme,
    toggle,
    setTheme,
    isDark: computed(() => theme.value === 'dark'),
  }
}
