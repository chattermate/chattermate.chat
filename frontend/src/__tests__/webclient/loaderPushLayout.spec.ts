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

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createPushLayout, PHONE_MAX_WIDTH, sheetCss } from '@/webclient/loader/pushLayout.js'
import { api, bringUp, cleanupPage, loadLoader, resetPage } from './loaderHarness'

function page(width = 1280) {
  document.body.innerHTML = '<main id="app" style="padding-right: 8px"></main>'
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true })
  return document.getElementById('app') as HTMLElement
}

describe('push layout', () => {
  it('makes room while open and gives it back on close', () => {
    const app = page()
    const push = createPushLayout(window)
    push.apply(true, { pushTarget: '#app', side: 'right', width: 420 })
    expect(app.style.paddingRight).toBe('420px')
    push.apply(false, { pushTarget: '#app', side: 'right', width: 420 })
    expect(app.style.paddingRight).toBe('8px')
  })

  it('pushes the left side for a left drawer', () => {
    const app = page()
    createPushLayout(window).apply(true, { pushTarget: '#app', side: 'left', width: 300 })
    expect(app.style.paddingLeft).toBe('300px')
  })

  it('never pushes on a phone', () => {
    const app = page(PHONE_MAX_WIDTH)
    createPushLayout(window).apply(true, { pushTarget: '#app', side: 'right', width: 420 })
    expect(app.style.paddingRight).toBe('8px')
  })

  it('ignores a missing or invalid selector', () => {
    page()
    const push = createPushLayout(window)
    expect(() => push.apply(true, { pushTarget: '#nope', side: 'right', width: 420 })).not.toThrow()
    expect(() => push.apply(true, { pushTarget: '[[', side: 'right', width: 420 })).not.toThrow()
  })

  it('sheet css limits the phone height', () => {
    expect(sheetCss('cm')).toContain('70dvh')
    expect(sheetCss('cm')).toContain('#cm')
  })
})

describe('push layout through the loader', () => {
  beforeEach(resetPage)
  afterEach(cleanupPage)

  it('pushes pushTarget while the drawer is open', async () => {
    const app = page()
    ;(window as any).chattermateConfig = { displayMode: 'sidebar-right', layout: 'push', pushTarget: '#app', sidebarWidth: 380 }
    await loadLoader()
    bringUp()
    api().open()
    expect(app.style.paddingRight).toBe('380px')
    api().close()
    expect(app.style.paddingRight).toBe('8px')
  })

  it('adds the sheet css on request', async () => {
    ;(window as any).chattermateConfig = { mobileMode: 'sheet' }
    await loadLoader()
    expect(document.getElementById('chattermate-styles')?.textContent).toContain('70dvh')
  })
})
