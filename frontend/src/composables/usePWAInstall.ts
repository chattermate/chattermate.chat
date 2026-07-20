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

import { computed, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Module-level: beforeinstallprompt often fires before any component mounts,
// so the listener must be attached at import time.
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const installed = ref(false)

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    installed.value = true
    deferredPrompt.value = null
  })
}

export function usePWAInstall() {
  const isStandalone = computed(
    () =>
      installed.value ||
      (typeof window !== 'undefined' &&
        (window.matchMedia?.('(display-mode: standalone)').matches ||
          (navigator as unknown as { standalone?: boolean }).standalone === true))
  )

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

  // Native prompt available (Chrome/Edge/Android)
  const canInstall = computed(() => !isStandalone.value && !!deferredPrompt.value)

  // iOS never fires beforeinstallprompt — install is manual via the share sheet
  const needsManualInstall = computed(() => !isStandalone.value && isIOS)

  const promptInstall = async (): Promise<boolean> => {
    const prompt = deferredPrompt.value
    if (!prompt) return false
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome === 'accepted') {
      deferredPrompt.value = null
      return true
    }
    return false
  }

  return { isStandalone, isIOS, canInstall, needsManualInstall, promptInstall }
}
