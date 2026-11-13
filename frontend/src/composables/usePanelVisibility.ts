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

import { onScopeDispose, type Ref } from 'vue'

/** The panel's open cascade takes about this long; the composer is focused after it. */
export const OPEN_FOCUS_DELAY_MS = 520

export interface PanelVisibilityHooks {
    /** Focus the panel's field (the composer, or the email step when it shows). */
    focus: () => void
    /** The panel is being hidden: note what should survive (the scroll position). */
    onHide: () => void
    /** The panel is shown again: put it back. */
    onShow: () => void
}

/** Nothing in the frame has focus yet, so moving it takes nothing from the visitor. */
const nothingFocused = (): boolean =>
    typeof document === 'undefined' || !document.activeElement || document.activeElement === document.body

/**
 * What the redesigned panel does as the embedding page shows and hides it
 * (WIDGET_VISIBILITY, fed in through `report`): on open it restores the scroll
 * position and, once the open motion has played, focuses the panel's field unless
 * the visitor already focused something. It never takes focus while hidden (the
 * frame is created hidden on page load; focus would leave the host page), and
 * nothing happens on mount: only a reported open moves focus.
 *
 * The first report counts even when it repeats the current state: hostVisible
 * starts true, and a launcher clicked before the frame was ready sends open first.
 */
export function usePanelVisibility(hostVisible: Readonly<Ref<boolean>>, hooks: PanelVisibilityHooks) {
    let timer: ReturnType<typeof setTimeout> | null = null
    // What the page last said; null until it said anything.
    let lastReport: boolean | null = null

    const cancelFocus = () => {
        if (timer) clearTimeout(timer)
        timer = null
    }

    const focusAfterOpen = () => {
        timer = setTimeout(() => {
            timer = null
            if (hostVisible.value && nothingFocused()) hooks.focus()
        }, OPEN_FOCUS_DELAY_MS)
    }

    /** The page reported the widget open or closed. Repeats of the same state change nothing. */
    const report = (open: boolean) => {
        if (open === lastReport) return
        lastReport = open
        cancelFocus()
        if (!open) {
            hooks.onHide()
            return
        }
        hooks.onShow()
        focusAfterOpen()
    }

    /** Focus now, if the panel is on screen (the page prefilled the message box). */
    const focusIfShown = () => {
        if (hostVisible.value) hooks.focus()
    }

    onScopeDispose(cancelFocus)

    return { report, focusIfShown }
}
