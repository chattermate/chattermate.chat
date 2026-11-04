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

// The "push" layout for sidebar modes: while the drawer is open, the page's own
// content (pushTarget, a CSS selector) makes room for it instead of being
// covered. Phones are too narrow to share, so there the drawer overlays as usual
// (as a bottom sheet when mobileMode is 'sheet').

export const PHONE_MAX_WIDTH = 768
export const SHEET_HEIGHT = '70dvh'
const TRANSITION = 'padding 0.3s cubic-bezier(0.22, 1, 0.36, 1)'

export function createPushLayout(win) {
  let pushed = null // { element, property, previous, previousTransition }

  function release() {
    if (!pushed) return
    pushed.element.style[pushed.property] = pushed.previous
    pushed.element.style.transition = pushed.previousTransition
    pushed = null
  }

  // Make room (open) or give it back (closed). Safe to call repeatedly.
  function apply(open, options) {
    const { pushTarget, side, width } = options
    if (!open || !pushTarget || win.innerWidth <= PHONE_MAX_WIDTH) {
      release()
      return
    }
    let element = null
    try {
      element = win.document.querySelector(pushTarget)
    } catch (e) {
      element = null // an invalid selector pushes nothing
    }
    if (!element) {
      release()
      return
    }
    const property = side === 'left' ? 'paddingLeft' : 'paddingRight'
    if (!pushed || pushed.element !== element || pushed.property !== property) {
      release()
      pushed = {
        element,
        property,
        previous: element.style[property],
        previousTransition: element.style.transition,
      }
    }
    const reduceMotion = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches
    element.style.transition = reduceMotion ? pushed.previousTransition : TRANSITION
    element.style[property] = width + 'px'
  }

  return { apply, release }
}

// Extra CSS for the phone bottom sheet (mobileMode: 'sheet').
export function sheetCss(containerId) {
  return `
      @media (max-width: ${PHONE_MAX_WIDTH}px) {
        #${containerId} {
          top: auto !important;
          height: ${SHEET_HEIGHT} !important;
          max-height: ${SHEET_HEIGHT} !important;
          border-radius: 20px 20px 0 0 !important;
          overflow: hidden;
        }
        #${containerId} .chattermate-iframe {
          height: 100% !important;
        }
      }`
}
