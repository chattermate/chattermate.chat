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

/** Keyboard and sizing rules for the panel's message box (Composer.vue). */

// Safari reports an IME's Enter as keyCode 229 without setting isComposing.
const IME_KEY_CODE = 229

/**
 * Enter sends; Shift+Enter is a new line. Never mid-composition: an IME's Enter
 * picks a candidate, it does not send.
 */
export const isSendKey = (event: KeyboardEvent): boolean =>
    event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== IME_KEY_CODE

/** The box grows with its text up to this many lines, then scrolls. */
export const COMPOSER_MAX_LINES = 5
/** Its line height and vertical padding, in px (Composer.vue's styles use the same). */
export const COMPOSER_LINE_HEIGHT_PX = 20
export const COMPOSER_PADDING_Y_PX = 16
/** The tallest the box gets: five lines plus its padding. */
export const COMPOSER_MAX_HEIGHT_PX = COMPOSER_MAX_LINES * COMPOSER_LINE_HEIGHT_PX + COMPOSER_PADDING_Y_PX

/** Sizes a textarea to its text, up to five lines; past that it scrolls. Emptied, it shrinks back. */
export function growToFit(field: HTMLTextAreaElement | null): void {
    if (!field) return
    field.style.height = 'auto'
    const height = Math.min(field.scrollHeight, COMPOSER_MAX_HEIGHT_PX)
    field.style.height = `${height}px`
    field.style.overflowY = field.scrollHeight > COMPOSER_MAX_HEIGHT_PX ? 'auto' : 'hidden'
}

/** Whether a drag carries files (not text being moved). */
export const carriesFiles = (event: DragEvent): boolean =>
    Array.from(event.dataTransfer?.types ?? []).includes('Files')
