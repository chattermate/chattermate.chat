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

import { ref, type Ref } from 'vue'

export const MOBILE_BREAKPOINT = 768
export const TABLET_BREAKPOINT = 1024

const track = (query: string): Ref<boolean> => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return ref(false)
  }
  const mql = window.matchMedia(query)
  const matches = ref(mql.matches)
  // Module-level singleton: listener lives for the app's lifetime, no cleanup needed
  mql.addEventListener('change', (e) => {
    matches.value = e.matches
  })
  return matches
}

const isMobile = track(`(max-width: ${MOBILE_BREAKPOINT}px)`)
const isTablet = track(`(max-width: ${TABLET_BREAKPOINT}px)`)

export function useBreakpoint() {
  return { isMobile, isTablet }
}
