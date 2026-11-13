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

import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'

/**
 * A menu button's behaviour, the WAI-ARIA menu pattern: the trigger opens it
 * (also ArrowDown/ArrowUp), focus moves into it, arrows move, Home/End jump,
 * Tab leaves, Escape closes back to the trigger, and a press outside closes.
 * Items are the menu's enabled [role^=menuitem] elements.
 */
export function useMenu(
  root: Ref<HTMLElement | null>,
  trigger: Ref<HTMLElement | null>,
  menu: Ref<HTMLElement | null>,
) {
  const open = ref(false)

  const menuItems = (): HTMLElement[] =>
    Array.from(menu.value?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])') ?? [])

  const focusItem = (index: number) => {
    const items = menuItems()
    if (!items.length) return
    items[(index + items.length) % items.length].focus()
  }

  const openMenu = async (focusLast = false) => {
    open.value = true
    await nextTick()
    focusItem(focusLast ? -1 : 0)
  }

  /** Close; back to the trigger when the menu had focus (Escape, a pick). */
  const close = (returnFocus = false) => {
    open.value = false
    if (returnFocus) trigger.value?.focus()
  }

  const toggle = () => (open.value ? close() : openMenu())

  const onTriggerKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      void openMenu(event.key === 'ArrowUp')
    }
  }

  const onMenuKeydown = (event: KeyboardEvent) => {
    const items = menuItems()
    const current = items.indexOf(document.activeElement as HTMLElement)
    const moves: Record<string, number> = {
      ArrowDown: current + 1,
      ArrowUp: current - 1,
      Home: 0,
      End: items.length - 1,
    }
    if (event.key in moves) {
      event.preventDefault()
      focusItem(moves[event.key])
    } else if (event.key === 'Tab') {
      close()
    }
  }

  const onPointerDown = (event: PointerEvent) => {
    if (root.value && !root.value.contains(event.target as Node)) close()
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close(true)
  }

  // Listen only while open: an idle menu costs nothing
  watch(open, (isOpen) => {
    if (isOpen) {
      document.addEventListener('pointerdown', onPointerDown)
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeydown)
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('keydown', onKeydown)
  })

  return { open, openMenu, close, toggle, onTriggerKeydown, onMenuKeydown }
}
