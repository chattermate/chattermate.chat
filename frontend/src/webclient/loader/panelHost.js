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

// What the loader does for the redesigned panel (widget_ui 2) besides its stylesheet
// (panelMotion.js): the classes its rules are scoped to, what it tells the frame it
// can do, the messages only the redesign sends, and the peek nudge. Everything here
// is a no-op unless `isV2()`, so the classic widget never sees any of it.
//
// `host` = { doc, config, button, container, isV2, isOpen, open, post, canAnnounce,
// canExpand, isPhone? }: the loader's own elements and state, read at call time.
export function createPanelHost(host) {
  const { doc, config, button, container } = host
  let gone = false
  // The last capabilities the frame was told, so a resize only re-announces a change.
  let announced = null
  const peek = createPeek(doc, { id: config.peekId, onOpen: function () { if (!host.isOpen()) host.open() } })

  /** The classes the redesign's rules are scoped to; off again for the classic widget. */
  function sync() {
    const v2 = host.isV2()
    button.classList.toggle('cm-v2', v2)
    if (v2) button.setAttribute('aria-controls', container.id)
    else button.removeAttribute('aria-controls')
    container.classList.toggle('cm-v2', v2)
    container.classList.toggle('cm-expanded', v2 && config.panelExpanded)
    // No peek over a hidden launcher, or for a page that is no longer the redesign.
    if (!v2 || !config.launcher) peek.hide()
    if (!v2) button.classList.remove('cm-busy')
  }

  function capabilities() {
    const css = doc.defaultView && doc.defaultView.CSS
    const supports = !!css && typeof css.supports === 'function'
    const backdrop = supports && (css.supports('backdrop-filter', 'blur(1px)') || css.supports('-webkit-backdrop-filter', 'blur(1px)'))
    return { type: 'HOST_CAPABILITIES', v: 1, expand: !!host.canExpand(), backdrop: !!backdrop, navigate: true }
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
   * window off phones only) and a frosted backdrop behind Glass. `onlyIfChanged`
   * for a resize or surface switch; a mounting frame is always told.
   */
  function announce(onlyIfChanged) {
    if (gone || !host.isV2() || !host.canAnnounce()) return
    const next = capabilities()
    const key = next.expand + ':' + next.backdrop + ':' + next.navigate
    if (onlyIfChanged && key === announced) return
    announced = key
    host.post(next)
  }

  /** Show `text` in the peek, if there is somewhere for it to point. True if shown. */
  function show(from, text) {
    if (gone || !host.isV2() || host.isOpen() || !config.launcher || typeof text !== 'string' || !text) return false
    peek.show({ from: typeof from === 'string' ? from : '', text: text })
    return true
  }

  /**
   * What only the redesigned panel says: its bigger size, an unread reply for the
   * peek, and that it is working while hidden. True when handled. `closingUp`: the
   * outgoing visitor's frame, whose replies must not reach the next visitor's peek.
   */
  function handleMessage(data, closingUp) {
    if (!host.isV2()) return false
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
    if (open) peek.hide()
    if (open && host.isV2()) lockPage()
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
    sync()
  }

  function destroy() {
    unlockPage()
    gone = true
    peek.destroy()
  }

  return { sync, announce, show, handleMessage, toggled, ownsEscape, reset, destroy, navigate }
}
