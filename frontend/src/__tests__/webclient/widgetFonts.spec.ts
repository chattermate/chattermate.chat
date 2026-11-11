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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DESIGN_FONTS_HREF, chatFontStack, familyHref, loadWidgetFonts, primaryFamily } from '@/webclient/widget-fonts'

const sheets = () => Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map((l) => l.getAttribute('href'))
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

function stubFonts(load: () => Promise<unknown>) {
  Object.defineProperty(document, 'fonts', { value: { load: vi.fn(load) }, configurable: true })
  return (document as any).fonts.load as ReturnType<typeof vi.fn>
}

describe('widget fonts', () => {
  beforeEach(() => { document.head.innerHTML = '' })
  afterEach(() => { delete (document as any).fonts })

  it('links the design fonts when the page has not', () => {
    const ready = vi.fn()
    loadWidgetFonts(undefined, ready)
    expect(sheets()).toEqual([DESIGN_FONTS_HREF])
    expect(ready).toHaveBeenCalledOnce()
  })

  it('does not link the design fonts again inside the frame page', () => {
    // As FONT_LINKS writes it
    document.head.innerHTML = '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">'
    loadWidgetFonts(undefined, vi.fn())
    expect(sheets()).toHaveLength(1)
  })

  it('links an agent font once, and applies it when it can draw', async () => {
    const load = stubFonts(() => Promise.resolve([]))
    const ready = vi.fn()
    loadWidgetFonts('"Open Sans", sans-serif', ready)
    loadWidgetFonts('Open Sans', vi.fn())
    expect(sheets().filter((h) => h === familyHref('Open Sans'))).toHaveLength(1)
    expect(familyHref('Open Sans')).toBe('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap')
    expect(load).toHaveBeenCalledWith('1em "Open Sans"')
    await flush()
    expect(ready).toHaveBeenCalledOnce()
  })

  it('applies the font anyway when it fails to load', async () => {
    stubFonts(() => Promise.reject(new Error('blocked')))
    const ready = vi.fn()
    loadWidgetFonts('Lobster', ready)
    await flush()
    expect(ready).toHaveBeenCalledOnce()
  })

  it('needs nothing more for a design font', () => {
    const ready = vi.fn()
    loadWidgetFonts('Space Grotesk', ready)
    expect(sheets()).toEqual([DESIGN_FONTS_HREF])
    expect(ready).toHaveBeenCalledOnce()
  })

  it('cannot be steered to another stylesheet by the font name', () => {
    loadWidgetFonts('x&family=Evil"><script>', vi.fn())
    const href = sheets().find((h) => h !== DESIGN_FONTS_HREF)!
    expect(href.startsWith('https://fonts.googleapis.com/css2?family=x%26family%3DEvil')).toBe(true)
  })

  it('reads the first family and builds a stack', () => {
    expect(primaryFamily('"Open Sans", Arial')).toBe('Open Sans')
    expect(primaryFamily(undefined)).toBe('')
    expect(chatFontStack('Lobster')).toBe('"Lobster", system-ui, sans-serif')
    expect(chatFontStack('Lobster, serif')).toBe('Lobster, serif')
  })
})
