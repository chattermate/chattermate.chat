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

// The redesigned panel's frame on the host page (widget_ui version 2): its size,
// corners, long shadow and frosted backdrop, how it opens out of the launcher and
// closes back into it, the launcher's dots turning into a chevron, the working dot
// and the peek nudge. Appended after the classic rules only when the frame says
// ui 2, and every rule is scoped to .cm-v2, so the classic widget never sees any of
// it. Only CSS transitions move the panel and launcher: a toggle mid-flight
// reverses from where it is. `frame` has been through pickPanelLook (panel-style.ts).
// The corners, long shadow, open motion and expand size are the floating window's
// only: drawers stay square and flush, and the Ask AI palette keeps its own centring.

export const PANEL_DEFAULT_WIDTH = 400
export const PANEL_DEFAULT_HEIGHT = 672
export const PANEL_EXPANDED_WIDTH = 600
export const PANEL_EXPANDED_HEIGHT = 700

const EASE_OUT = 'cubic-bezier(.16,1,.3,1)'
const EASE_IN = 'cubic-bezier(.4,0,1,1)'
const SPRING = 'cubic-bezier(.34,1.56,.64,1)'
const OPEN_MS = 460
const CLOSE_MS = 200

/** The one long shadow: soft and deep on light themes; dark themes add the glow ring. */
export function panelShadow(frame) {
  if (frame.elevation === 'dark') {
    const ring = frame.glow ? `, 0 0 0 1px ${frame.glow}, 0 0 60px -12px ${frame.glow}` : ', 0 0 0 1px rgba(255,255,255,.08)'
    return `0 24px 64px -12px rgba(0,0,0,.6)${ring}`
  }
  return '0 24px 64px -12px rgba(15,16,20,.32), 0 8px 24px -12px rgba(15,16,20,.14), 0 0 0 1px rgba(15,16,20,.06)'
}

/** Where the panel grows from: the launcher's corner, or the drawer's own edge. */
export function panelOrigin(mode, side) {
  if (mode === 'sidebar-left') return 'left center'
  if (mode === 'sidebar-right') return 'right center'
  return `bottom ${side}`
}

/**
 * The v2 stylesheet. `ids` = { button, container, peek }; `layout` = { mode, side,
 * floating (not a drawer, not the Ask AI palette), sizeIsExplicit, dotsScale,
 * peekBottom, sideOffset, zIndex }.
 */
export function panelCss(ids, layout, frame) {
  const b = `#${ids.button}.cm-v2`
  const c = `#${ids.container}.cm-v2`
  const n = `#${ids.peek}.cm-v2`
  const dots = `translate(-50%, -50%) scale(${layout.dotsScale})`
  const size = layout.sizeIsExplicit || {}
  return `
      /* ===== Redesigned panel (widget_ui 2) ===== */
      ${c} .chattermate-iframe {
        /* A mismatched color-scheme makes the browser paint the frame's canvas opaque. */
        color-scheme: normal;
        background: transparent;
      }
      ${frame.glass ? `
      ${c} {
        -webkit-backdrop-filter: blur(20px) saturate(1.4);
        backdrop-filter: blur(20px) saturate(1.4);
      }` : ''}
      ${layout.floating ? floatingCss(c, layout, frame, size) : ''}
      ${layout.mode === 'search-bar' ? '' : launcherCss(b, dots)}

      /* Working while hidden (WIDGET_ACTIVITY): the AI dot pulses. */
      ${b}.cm-busy:not(.active) .cm-dot:first-child { animation: chattermate-busy 1s ${EASE_OUT} infinite; }
      @keyframes chattermate-busy { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(.7); opacity: .55; } }
${peekCss(n, layout, frame)}
      @media (prefers-reduced-motion: reduce) {
        ${b}.cm-busy:not(.active) .cm-dot:first-child { animation: none; }
        ${n} { transition: opacity 150ms linear; }
      }
`
}

/**
 * The floating window: its corners, long shadow, size and how it opens out of the
 * launcher. Reduced motion makes it a 150ms fade in place; the !important on that
 * fade outranks the classic sheet's own `transition: none !important` by being
 * more specific (#id.cm-v2), so the panel fades rather than snaps.
 */
function floatingCss(c, layout, frame, size) {
  return `
      ${c} {
        border-radius: ${frame.radius}px;
        box-shadow: ${panelShadow(frame)};
        transform-origin: ${panelOrigin(layout.mode, layout.side)};
        ${size.width ? '' : `width: ${PANEL_DEFAULT_WIDTH}px;`}
        ${size.height ? '' : `height: ${PANEL_DEFAULT_HEIGHT}px;`}
        max-height: calc(100vh - 132px);
        transform: translateY(16px) scale(.94);
        transition: opacity ${CLOSE_MS}ms ${EASE_IN}, transform ${CLOSE_MS}ms ${EASE_IN}, visibility 0s linear ${CLOSE_MS}ms;
      }
      ${c}.active {
        transform: none;
        transition: opacity ${OPEN_MS}ms ${EASE_OUT}, transform ${OPEN_MS}ms ${EASE_OUT};
      }
      /* Expanded from the panel's header: bigger, still inside the window. */
      ${c}.cm-expanded {
        width: min(${PANEL_EXPANDED_WIDTH}px, calc(100vw - 48px));
        height: min(${PANEL_EXPANDED_HEIGHT}px, calc(100vh - 132px));
      }
      ${c} .chattermate-iframe { border-radius: inherit; }
      @media (prefers-reduced-motion: reduce) {
        ${c}, ${c}.active { transform: none; }
        ${c} { transition: opacity 150ms linear, visibility 0s linear 150ms !important; }
        ${c}.active { transition: opacity 150ms linear !important; }
      }`
}

/**
 * The launcher: a press dips it; the dots turn into the chevron and back. Not for
 * the search-bar trigger, whose own rules hide the dots and chevron.
 */
function launcherCss(b, dots) {
  return `
      ${b}:active { transform: scale(.96); transition: transform 90ms ease; }
      ${b} .cm-dots {
        display: flex;
        transform: ${dots};
        transition: opacity 180ms ease 60ms, transform 320ms ${SPRING} 60ms;
      }
      ${b}.active .cm-dots {
        display: flex;
        opacity: 0;
        transform: ${dots} rotate(90deg) scale(.4);
      }
      ${b} .cm-chevron {
        display: block;
        opacity: 0;
        transform: translate(-50%, -50%) rotate(-90deg) scale(.4);
        transition: opacity 180ms ease 60ms, transform 320ms ${SPRING} 60ms;
      }
      ${b}.active .cm-chevron {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
      ${b}.cm-has-icon .cm-dots { display: none; }
      ${b}.cm-has-icon .cm-icon { transition: opacity 180ms ease; }
      ${b}.cm-has-icon.active .cm-icon { display: block; opacity: 0; }
      @media (prefers-reduced-motion: reduce) {
        ${b} .cm-dots, ${b}.active .cm-dots { transform: ${dots}; transition: opacity 150ms linear; }
        ${b} .cm-chevron, ${b}.active .cm-chevron { transform: translate(-50%, -50%); transition: opacity 150ms linear; }
        ${b}:active { transform: none; }
      }`
}

/**
 * The peek nudge (peekNudge.js): the panel's surface and long shadow, above the
 * launcher, rising in; gone in 120ms as the panel opens.
 */
function peekCss(n, layout, frame) {
  return `
      ${n} {
        position: fixed;
        bottom: ${layout.peekBottom}px;
        ${layout.side}: ${layout.sideOffset}px;
        z-index: ${layout.zIndex};
        width: 300px;
        max-width: calc(100vw - 32px);
        box-sizing: border-box;
        border-radius: ${Math.min(frame.radius, 20)}px;
        box-shadow: ${panelShadow(frame)};
        background: ${frame.elevation === 'dark' ? '#17151F' : '#FFFFFF'};
        color: ${frame.elevation === 'dark' ? '#ECEAFA' : '#2A2A33'};
        opacity: 0;
        transform: translateY(10px) scale(.96);
        transform-origin: bottom ${layout.side};
        transition: opacity 120ms ease, transform 200ms ${EASE_OUT};
        pointer-events: none;
      }
      ${n}.show {
        opacity: 1;
        transform: none;
        transition: opacity 200ms ease, transform 320ms ${EASE_OUT};
        pointer-events: auto;
      }
      ${n} .cm-peek-body {
        display: block;
        width: 100%;
        padding: 14px 44px 14px 16px;
        border: 0;
        border-radius: inherit;
        background: none;
        color: inherit;
        text-align: left;
        font: 400 14.5px/21px -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        cursor: pointer;
      }
      ${n} .cm-peek-from {
        display: block;
        margin-bottom: 3px;
        font-size: 12.5px;
        font-weight: 600;
        opacity: .72;
      }
      ${n} .cm-peek-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        border: 0;
        border-radius: 9px;
        background: none;
        color: inherit;
        opacity: .7;
        font: 400 18px/1 -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        cursor: pointer;
      }
      ${n} .cm-peek-body:focus-visible,
      ${n} .cm-peek-close:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
      @media (max-width: 768px) { ${n} { display: none; } }
`
}
