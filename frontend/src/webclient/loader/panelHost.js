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

import { createPeek } from './peekNudge.js'

// What the loader does for the panel besides its stylesheet (panelMotion.js): the
// classes its rules are scoped to, what it tells the frame it can do, the panel's
// own messages, and the peek nudge.
//
// `host` = { doc, config, button, container, isOpen, open, close, post, canAnnounce,
// canExpand, isPhone? }: the loader's own elements and state, read at call time.
// A swipe down past this closes the panel (as does a flick); less springs it back.
export const DRAG_CLOSE_PX = 120
const DRAG_CLOSE_MS = 240
const DRAG_SPRING_MS = 280

export function createPanelHost(host) {
  const { doc, config, button, container } = host
  let gone = false
  // The last capabilities the frame was told, so a resize only re-announces a change.
  let announced = null
  const peek = createPeek(doc, { id: config.peekId, onOpen: function () { if (!host.isOpen()) host.open() } })

  /** The classes the panel's rules are scoped to. */
  function sync() {
    button.classList.add('cm-v2')
    button.setAttribute('aria-controls', container.id)
    container.classList.add('cm-v2')
    container.classList.toggle('cm-expanded', config.panelExpanded)
    // No peek over a hidden launcher.
    if (!config.launcher) peek.hide()
  }

  function capabilities() {
    const css = doc.defaultView && doc.defaultView.CSS
    const supports = !!css && typeof css.supports === 'function'
    const backdrop = supports && (css.supports('backdrop-filter', 'blur(1px)') || css.supports('-webkit-backdrop-filter', 'blur(1px)'))
    const swipe = !!(host.isPhone && host.isPhone())
    return { type: 'HOST_CAPABILITIES', v: 1, expand: !!host.canExpand(), backdrop: !!backdrop, navigate: true, swipe: swipe }
  }

  /**
   * Open a link to this site in the page itself (an answer's same-site link): an
   * http(s) URL on the page's own origin only, checked here again whatever the
   * frame says. True when it navigated.
   */
  function navigate(url) {
    const win = doc.defaultView
    if (!win || typeof url !== 'string') return false
    let target
    try {
      target = new URL(url, win.location.href)
    } catch (e) {
      return false
    }
    if ((target.protocol !== 'http:' && target.protocol !== 'https:') || target.origin !== win.location.origin) return false
    win.location.assign(target.href)
    return true
  }

  /**
   * Tell the frame what this loader can do for it: the expand size (a floating
   * window off phones only), a frosted backdrop behind Glass, and on a phone a
   * swipe down to close. `onlyIfChanged`
   * for a resize or surface switch; a mounting frame is always told.
   */
  function announce(onlyIfChanged) {
    if (gone || !host.canAnnounce()) return
    const next = capabilities()
    const key = next.expand + ':' + next.backdrop + ':' + next.navigate + ':' + next.swipe
    if (onlyIfChanged && key === announced) return
    announced = key
    host.post(next)
  }

  /** Show `text` in the peek, if there is somewhere for it to point. True if shown. */
  function show(from, text) {
    if (gone || host.isOpen() || !config.launcher || typeof text !== 'string' || !text) return false
    peek.show({ from: typeof from === 'string' ? from : '', text: text })
    return true
  }

  // Swipe down to close on a phone: the frame's header reports the drag
  // (WIDGET_DRAG {dy}, then {dy, end, flick}) and the whole panel follows it here.
  let settleTimer = null

  function clearDrag() {
    clearTimeout(settleTimer)
    settleTimer = null
    container.style.transform = ''
    container.style.transition = ''
  }

  function drag(data) {
    // A touch during the swipe's own close animation: let it finish
    if (!host.isOpen() && settleTimer) return
    if (!host.isOpen() || !host.isPhone || !host.isPhone()) return clearDrag()
    const dy = typeof data.dy === 'number' && isFinite(data.dy) ? Math.max(0, data.dy) : 0
    clearTimeout(settleTimer)
    if (data.end !== true) {
      container.style.transition = 'none'
      container.style.transform = 'translateY(' + Math.round(dy) + 'px)'
      return
    }
    if (dy >= DRAG_CLOSE_PX || (data.flick === true && dy > 0)) {
      // Down and out from where the finger let go, then the loader's close
      container.style.transition = 'transform ' + DRAG_CLOSE_MS + 'ms cubic-bezier(.4,0,1,1), opacity ' +
        DRAG_CLOSE_MS + 'ms linear, visibility 0s linear ' + DRAG_CLOSE_MS + 'ms'
      container.style.transform = 'translateY(100%)'
      host.close()
      settleTimer = setTimeout(clearDrag, DRAG_CLOSE_MS + 40)
      return
    }
    container.style.transition = 'transform ' + DRAG_SPRING_MS + 'ms cubic-bezier(.16,1,.3,1)'
    container.style.transform = ''
    settleTimer = setTimeout(clearDrag, DRAG_SPRING_MS + 40)
  }

  /**
   * What only the panel says: its bigger size, an unread reply for the peek, that
   * it is working while hidden, and a swipe down to close. True when handled. `closingUp`: the
   * outgoing visitor's frame, whose replies must not reach the next visitor's peek.
   */
  function handleMessage(data, closingUp) {
    if (data.type === 'WIDGET_EXPAND') {
      config.panelExpanded = data.expanded === true
      sync()
      return true
    }
    if (data.type === 'UNREAD_PREVIEW') {
      if (!closingUp) show(data.agentName, data.text)
      return true
    }
    if (data.type === 'NAVIGATE') {
      navigate(data.url)
      return true
    }
    if (data.type === 'WIDGET_DRAG') {
      drag(data)
      return true
    }
    if (data.type === 'WIDGET_ACTIVITY') {
      button.classList.toggle('cm-busy', data.busy === true && !host.isOpen())
      return true
    }
    return false
  }

  // The page's own scroll styles while the panel covers a phone screen (lockPage).
  let lockedStyles = null

  /** Hold the page still under the full-screen panel: the visitor's swipes scroll the chat. */
  function lockPage() {
    if (lockedStyles || !host.isPhone || !host.isPhone()) return
    const html = doc.documentElement
    const body = doc.body
    lockedStyles = { html: html.style.overflow, body: body ? body.style.overflow : '' }
    html.style.overflow = 'hidden'
    if (body) body.style.overflow = 'hidden'
  }

  /** Give the page its own scroll styles back. */
  function unlockPage() {
    if (!lockedStyles) return
    doc.documentElement.style.overflow = lockedStyles.html
    if (doc.body) doc.body.style.overflow = lockedStyles.body
    lockedStyles = null
  }

  /** The panel opened or closed. */
  function toggled(open) {
    if (open) clearDrag()
    if (open) peek.hide()
    if (open) lockPage()
    else unlockPage()
  }

  /** Esc on the page closes the panel only while focus is the widget's, or nobody's. */
  function ownsEscape() {
    const active = doc.activeElement
    if (!active || active === doc.body || active === doc.documentElement) return true
    const peekEl = doc.getElementById(config.peekId)
    return button.contains(active) || container.contains(active) || !!(peekEl && peekEl.contains(active))
  }

  /** The frame is being replaced (reload, identify, logout): nothing of it carries over. */
  function reset() {
    // A frame swapped under an open panel keeps the page held still
    if (!host.isOpen()) unlockPage()
    peek.hide()
    button.classList.remove('cm-busy')
    config.panelExpanded = false
    announced = null
    clearDrag()
    sync()
  }

  function destroy() {
    clearDrag()
    unlockPage()
    gone = true
    peek.destroy()
  }

  return { sync, announce, show, handleMessage, toggled, ownsEscape, reset, destroy, navigate }
}
