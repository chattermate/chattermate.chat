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

// The chat window while the widget inside it is still starting. The frame is
// transparent until the widget paints, so a visitor who opens the chat early would
// otherwise get an empty window: this draws its outline at once (a header, a few
// message placeholders, the composer), and goes as soon as the widget is ready.
//
// Nothing in it comes from the frame or the dashboard as text: fixed placeholders
// built with createElement, coloured from the launcher's validated colour and the
// panel's light/dark elevation.

export const SHELL_CLASS = 'cm-open-shell'
export const SHELL_LABEL = 'Loading chat…'

// The panel's surface for each elevation (panel-style.ts), close to the widget's
// own so the hand-over doesn't flash.
const SURFACE = { light: '#FFFFFF', dark: '#16141F' }
const INK = { light: '15, 23, 42', dark: '255, 255, 255' }

export const CLOSE_LABEL = 'Close chat'

/**
 * Shows and hides the shell inside `container`, which the loader may empty at any
 * time. `onClose` closes the chat: on a phone the shell fills the screen, and the
 * widget's own header (with its close button) isn't there yet. `refocus` is where
 * keyboard focus goes when the shell is taken away while it has it (its close
 * button), so it never drops back to the top of the page.
 */
export function createOpenShell(doc, container, { onClose, refocus }) {
  let shell = null

  function show() {
    if (!shell || shell.parentNode !== container) {
      shell = build(doc, onClose)
      container.appendChild(shell)
    }
  }

  function hide() {
    const hadFocus = !!shell && shell.contains(doc.activeElement)
    if (shell && shell.parentNode) shell.parentNode.removeChild(shell)
    shell = null
    if (hadFocus) refocus()
  }

  return { show, hide, isShown: function () { return !!shell && shell.parentNode === container } }
}

function build(doc, onClose) {
  const shell = el(doc, 'div', SHELL_CLASS)
  shell.setAttribute('aria-busy', 'true')

  // The outline itself, announced as one status; the close button sits beside it
  const outline = el(doc, 'div', 'cm-shell-outline')
  outline.setAttribute('role', 'status')

  const head = el(doc, 'div', 'cm-shell-head')
  head.appendChild(el(doc, 'span', 'cm-shell-avatar'))
  head.appendChild(el(doc, 'span', 'cm-shell-bar cm-shell-title'))
  outline.appendChild(head)

  const body = el(doc, 'div', 'cm-shell-body')
  for (const width of ['72%', '54%', '64%']) {
    const bar = el(doc, 'span', 'cm-shell-bar cm-shell-message')
    bar.style.width = width
    body.appendChild(bar)
  }
  outline.appendChild(body)

  const composer = el(doc, 'div', 'cm-shell-composer')
  composer.appendChild(el(doc, 'span', 'cm-shell-spinner'))
  outline.appendChild(composer)

  // For screen readers: the placeholders are decoration
  const label = el(doc, 'span', 'cm-shell-label')
  label.textContent = SHELL_LABEL
  outline.appendChild(label)
  shell.appendChild(outline)

  const close = el(doc, 'button', 'cm-shell-close')
  close.type = 'button'
  close.setAttribute('aria-label', CLOSE_LABEL)
  close.addEventListener('click', function () { onClose() })
  shell.appendChild(close)
  return shell
}

function el(doc, tag, className) {
  const node = doc.createElement(tag)
  node.className = className
  return node
}

/**
 * The shell's rules, scoped to the loader's container. `accent` is the launcher's
 * validated #hex; `elevation` the panel's ('light' | 'dark'); `palette` when the
 * chat opens as the Ask AI palette. Rebuilt with the rest of the loader's sheet
 * whenever the look changes, so an open shell follows it.
 */
export function shellCss(containerId, { accent, elevation, palette }) {
  const tone = elevation === 'dark' ? 'dark' : 'light'
  const ink = INK[tone]
  const c = `#${containerId} .${SHELL_CLASS}`
  return `
      ${c} {
        position: absolute;
        inset: 0;
        background: ${SURFACE[tone]};
        border-radius: inherit;
        font: 14px/1.4 system-ui, -apple-system, sans-serif;
      }
      ${c} .cm-shell-outline {
        display: flex;
        flex-direction: column;
        gap: 18px;
        height: 100%;
        padding: 18px;
        box-sizing: border-box;
      }
      ${c} .cm-shell-close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 40px;
        height: 40px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
      }
      ${c} .cm-shell-close:hover { background: rgba(${ink}, 0.06); }
      ${c} .cm-shell-close:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
      ${c} .cm-shell-close::before,
      ${c} .cm-shell-close::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 2px;
        margin: -1px 0 0 -8px;
        border-radius: 1px;
        background: rgba(${ink}, 0.6);
        transform: rotate(45deg);
      }
      ${c} .cm-shell-close::after { transform: rotate(-45deg); }
      ${c} .cm-shell-head { display: flex; align-items: center; gap: 12px; }
      ${c} .cm-shell-avatar { width: 36px; height: 36px; border-radius: 50%; background: ${accent}; flex: none; }
      ${c} .cm-shell-bar {
        display: block;
        height: 12px;
        border-radius: 6px;
        background: rgba(${ink}, 0.08);
        animation: cm-shell-pulse 1.4s ease-in-out infinite;
      }
      ${c} .cm-shell-title { width: 40%; }
      ${c} .cm-shell-body { display: flex; flex-direction: column; gap: 12px; flex: 1; }
      ${c} .cm-shell-message { height: 34px; border-radius: 14px; }
      ${c} .cm-shell-message:nth-child(2) { align-self: flex-end; }
      ${c} .cm-shell-composer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 44px;
        padding: 0 12px;
        border-radius: 14px;
        background: rgba(${ink}, 0.05);
      }
      ${c} .cm-shell-spinner {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid rgba(${ink}, 0.15);
        border-top-color: ${accent};
        animation: chattermate-spin 0.6s linear infinite;
      }
      ${c} .cm-shell-label {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
      ${palette ? `
      /* The Ask AI palette: just its input row. */
      ${c} .cm-shell-outline { gap: 0; padding: 14px 64px 14px 14px; }
      ${c} .cm-shell-close { top: 50%; margin-top: -20px; right: 12px; }
      ${c} .cm-shell-head,
      ${c} .cm-shell-body { display: none; }` : ''}
      @keyframes cm-shell-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
      @media (prefers-reduced-motion: reduce) {
        ${c} .cm-shell-bar { animation: none; }
      }
`
}
