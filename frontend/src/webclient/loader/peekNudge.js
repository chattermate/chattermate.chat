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

// The redesigned widget's peek nudge (plan G2): a small card above the launcher
// with one line of text - the agent's opening line, an unread reply, or the page's
// own prompt() - and a dismiss button. Text only ever goes in through textContent:
// it can come from the dashboard, from a reply or from the page.

export const PEEK_MAX_CHARS = 120
const LEAVE_MS = 200

/** One line of plain text, at most PEEK_MAX_CHARS, with an ellipsis when cut. */
export function peekText(value) {
  const text = String(value == null ? '' : value).replace(/\s+/g, ' ').trim()
  return text.length > PEEK_MAX_CHARS ? text.slice(0, PEEK_MAX_CHARS - 1).trimEnd() + '…' : text
}

export function createPeek(doc, { id, onOpen }) {
  let el = null
  let fromEl = null
  let textEl = null
  let leaveTimer = null

  function build() {
    el = doc.createElement('div')
    el.id = id
    // wp-exclude-emoji: WordPress's emoji script would swap the text's emoji for
    // <img> pictures, which the host page's own image styles then blow up.
    el.className = 'cm-v2 wp-exclude-emoji'
    const body = doc.createElement('button')
    body.type = 'button'
    body.className = 'cm-peek-body'
    fromEl = doc.createElement('span')
    fromEl.className = 'cm-peek-from'
    textEl = doc.createElement('span')
    textEl.className = 'cm-peek-text'
    body.appendChild(fromEl)
    body.appendChild(textEl)
    body.addEventListener('click', function () {
      hide()
      onOpen()
    })
    const close = doc.createElement('button')
    close.type = 'button'
    close.className = 'cm-peek-close'
    close.setAttribute('aria-label', 'Dismiss')
    close.textContent = '×'
    close.addEventListener('click', function (event) {
      event.stopPropagation()
      hide()
    })
    el.appendChild(body)
    el.appendChild(close)
  }

  /** Show (or replace) the nudge's text. Nothing for empty text. */
  function show({ from, text }) {
    const line = peekText(text)
    if (!line) return
    if (!el) build()
    clearTimeout(leaveTimer)
    fromEl.textContent = peekText(from)
    fromEl.style.display = from ? '' : 'none'
    textEl.textContent = line
    if (!el.parentNode) doc.body.appendChild(el)
    // Next frame, so the entrance transitions from the hidden state.
    requestAnimationFrame(function () { if (el) el.classList.add('show') })
  }

  /** Fade it out (the panel is opening, or the visitor dismissed it). */
  function hide() {
    if (!el || !el.parentNode) return
    el.classList.remove('show')
    const leaving = el
    clearTimeout(leaveTimer)
    leaveTimer = setTimeout(function () {
      if (leaving.parentNode && !leaving.classList.contains('show')) leaving.parentNode.removeChild(leaving)
    }, LEAVE_MS)
  }

  function isShown() {
    return !!(el && el.parentNode && el.classList.contains('show'))
  }

  function destroy() {
    clearTimeout(leaveTimer)
    if (el && el.parentNode) el.parentNode.removeChild(el)
    el = null
  }

  return { show, hide, isShown, destroy }
}
