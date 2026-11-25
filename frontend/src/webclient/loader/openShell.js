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

/** Shows and hides the shell inside `container`, which the loader may empty at any time. */
export function createOpenShell(doc, container) {
  let shell = null

  function show() {
    if (!shell || shell.parentNode !== container) {
      shell = build(doc)
      container.appendChild(shell)
    }
  }

  function hide() {
    if (shell && shell.parentNode) shell.parentNode.removeChild(shell)
    shell = null
  }

  return { show, hide, isShown: function () { return !!shell && shell.parentNode === container } }
}

function build(doc) {
  const shell = el(doc, 'div', SHELL_CLASS)
  shell.setAttribute('role', 'status')
  shell.setAttribute('aria-busy', 'true')

  const head = el(doc, 'div', 'cm-shell-head')
  head.appendChild(el(doc, 'span', 'cm-shell-avatar'))
  head.appendChild(el(doc, 'span', 'cm-shell-bar cm-shell-title'))
  shell.appendChild(head)

  const body = el(doc, 'div', 'cm-shell-body')
  for (const width of ['72%', '54%', '64%']) {
    const bar = el(doc, 'span', 'cm-shell-bar cm-shell-message')
    bar.style.width = width
    body.appendChild(bar)
  }
  shell.appendChild(body)

  const composer = el(doc, 'div', 'cm-shell-composer')
  composer.appendChild(el(doc, 'span', 'cm-shell-spinner'))
  shell.appendChild(composer)

  // For screen readers: the placeholders are decoration
  const label = el(doc, 'span', 'cm-shell-label')
  label.textContent = SHELL_LABEL
  shell.appendChild(label)
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
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 18px;
        box-sizing: border-box;
        background: ${SURFACE[tone]};
        border-radius: inherit;
        font: 14px/1.4 system-ui, -apple-system, sans-serif;
      }
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
      ${c} { gap: 0; padding: 14px; }
      ${c} .cm-shell-head,
      ${c} .cm-shell-body { display: none; }` : ''}
      @keyframes cm-shell-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
      @media (prefers-reduced-motion: reduce) {
        ${c} .cm-shell-bar { animation: none; }
      }
`
}
