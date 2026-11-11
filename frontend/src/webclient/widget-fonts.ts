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

// The widget's fonts, from Google Fonts, without a font-loading library: the
// frame page already links the design fonts (FONT_LINKS in widget_common.py),
// so all that is ever left is an agent's own font, one stylesheet link.

const GOOGLE_FONTS_CSS = 'https://fonts.googleapis.com/css2'

/** The design fonts, as the frame page links them; linked here only when it didn't. */
export const DESIGN_FONTS_HREF = `${GOOGLE_FONTS_CSS}?family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap`

const DESIGN_FAMILIES = ['space grotesk', 'instrument sans', 'jetbrains mono']

/** The first family in a CSS font-family value, unquoted. */
export function primaryFamily(fontFamily?: string): string {
  return fontFamily?.split(',')[0].trim().replace(/['"]/g, '') || ''
}

/** The Google Fonts stylesheet for one family, regular weight (what the widget used before). */
export function familyHref(family: string): string {
  return `${GOOGLE_FONTS_CSS}?family=${encodeURIComponent(family).replace(/%20/g, '+')}&display=swap`
}

function linkStylesheet(doc: Document, href: string) {
  const linked = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
    .some((link) => link.getAttribute('href') === href)
  if (linked) return
  const link = doc.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  doc.head.appendChild(link)
}

/** The value to set as the chat's font-family for an agent's chosen font. */
export function chatFontStack(fontFamily: string): string {
  return fontFamily.includes(',') ? fontFamily : `"${fontFamily}", system-ui, sans-serif`
}

/**
 * Link the design fonts (unless the page did) and the agent's own font, then
 * call `onCustomFontReady` once that font can draw. With no custom font, or one
 * that is a design font already, it is called straight away.
 */
export function loadWidgetFonts(customFontFamily: string | undefined, onCustomFontReady: () => void,
                                doc: Document = document) {
  const designLinked = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
    .some((link) => (link.getAttribute('href') || '').startsWith(`${GOOGLE_FONTS_CSS}?family=Space+Grotesk`))
  if (!designLinked) linkStylesheet(doc, DESIGN_FONTS_HREF)

  const family = primaryFamily(customFontFamily)
  if (!family || DESIGN_FAMILIES.includes(family.toLowerCase())) {
    onCustomFontReady()
    return
  }
  linkStylesheet(doc, familyHref(family))
  // display=swap draws in a fallback first; apply the font once it can draw,
  // or anyway if the browser can't say (it then swaps in when it arrives).
  const fonts = (doc as Document & { fonts?: FontFaceSet }).fonts
  if (!fonts?.load) {
    onCustomFontReady()
    return
  }
  fonts.load(`1em "${family}"`).then(onCustomFontReady, onCustomFontReady)
}
