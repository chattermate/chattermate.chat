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

import { computed, ref, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { navItemCovers, type NavItem } from './navItems'

export const SETTINGS_GROUP_STORAGE_KEY = 'cm-sidebar-settings-open'

// Storage can throw (private mode, blocked site data); the group then simply
// starts closed and forgets, which is harmless.
const readStored = (): boolean => {
  try {
    return localStorage.getItem(SETTINGS_GROUP_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const writeStored = (open: boolean) => {
  try {
    localStorage.setItem(SETTINGS_GROUP_STORAGE_KEY, open ? '1' : '0')
  } catch {
    /* not remembered this time */
  }
}

/**
 * Open/closed state of the sidebar's collapsible Settings group.
 *
 * Always open on one of its own pages, so the current page is never hidden
 * inside a closed group. Elsewhere it remembers what the user last chose.
 */
export function useSettingsGroup(items: Ref<NavItem[]>) {
  const route = useRoute()

  const onSettingsPage = computed(() => items.value.some((item) => navItemCovers(item, route.path)))
  const isOpen = ref(onSettingsPage.value || readStored())

  // Every arrival on one of its pages, not just the first: after closing the
  // group on Organization, a link to Ticketing must still show where you are
  watch(
    () => route.path,
    () => {
      if (onSettingsPage.value) isOpen.value = true
    },
  )

  const setOpen = (open: boolean) => {
    isOpen.value = open
    writeStored(open)
  }

  const toggle = () => setOpen(!isOpen.value)

  return { isOpen, onSettingsPage, toggle, setOpen }
}
