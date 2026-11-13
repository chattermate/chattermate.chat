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

export interface Rgb {
  r: number
  g: number
  b: number
}

export function hexToRgb(hex: string): Rgb | null {
  let value = hex.trim().replace(/^#/, '')
  if (value.length === 3) {
    value = value
      .split('')
      .map((ch) => ch + ch)
      .join('')
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

/** A 3- or 6-digit hex colour as lowercase #rrggbb, or null for anything else. */
export function toHex6(value: string | null | undefined): string | null {
  const rgb = hexToRgb(value || '')
  if (!rgb) return null
  return `#${[rgb.r, rgb.g, rgb.b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const linear = (channel: number) => {
    const c = channel / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

/** Dark or light ink over an arbitrary brand color (mirrors the backend's
 * contrast_ink so admin preview and public page always agree). */
export function contrastInk(hex: string): '#12131A' | '#FFFFFF' {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#FFFFFF'
  return relativeLuminance(rgb) > 0.45 ? '#12131A' : '#FFFFFF'
}

const DARK_INK = '#0B0C10'
const LIGHT_INK = '#FFFFFF'

const luminanceOf = (hex: string): number | null => {
  const rgb = hexToRgb(hex || '')
  return rgb ? relativeLuminance(rgb) : null
}

/** WCAG contrast ratio between two hex colours (1 to 21); 1 when either is not a hex. */
export function contrastRatio(a: string, b: string): number {
  const la = luminanceOf(a)
  const lb = luminanceOf(b)
  if (la === null || lb === null) return 1
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/**
 * Whichever of two inks reads better on this fill, by real WCAG contrast. Used for
 * text and icons on the accent (launcher, send button, user bubble).
 */
export function readableInkOn(fill: string, dark = DARK_INK, light = LIGHT_INK): string {
  if (luminanceOf(fill) === null) return dark
  return contrastRatio(fill, light) >= contrastRatio(fill, dark) ? light : dark
}

const toHex = (channel: number) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, '0')

/** `from` moved `amount` (0 to 1) of the way toward `to`, as #rrggbb; `from` when either is not a hex. */
export function mixHex(from: string, to: string, amount: number): string {
  const a = hexToRgb(from || '')
  const b = hexToRgb(to || '')
  if (!a || !b) return from
  const mix = (x: number, y: number) => x + (y - x) * amount
  return `#${toHex(mix(a.r, b.r))}${toHex(mix(a.g, b.g))}${toHex(mix(a.b, b.b))}`
}

/** A hex colour at an opacity, as rgba(); `hex` unchanged when it is not a hex. */
export function hexWithAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex || '')
  if (!rgb) return hex
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
}

/**
 * The least mix of `ink` into `surface` that reaches `ratio` against the surface
 * (muted text, control borders), or `ink` itself when nothing weaker does.
 */
export function mixToContrast(surface: string, ink: string, ratio: number): string {
  for (let step = 1; step <= 50; step++) {
    const candidate = mixHex(surface, ink, step / 50)
    if (contrastRatio(candidate, surface) >= ratio) return candidate
  }
  return ink
}

/**
 * `colour` itself when it reaches `ratio` against `surface`, else the least mix of
 * it toward `ink` that does (a lime accent drawn on white becomes a darker olive),
 * so a brand colour used for icons and links stays its hue and stays readable.
 * `colour` unchanged when any of the three is not a hex.
 */
export function readableOn(surface: string, colour: string, ink: string, ratio: number): string {
  if (!hexToRgb(surface || '') || !hexToRgb(colour || '') || !hexToRgb(ink || '')) return colour
  if (contrastRatio(colour, surface) >= ratio) return colour
  for (let step = 1; step <= 50; step++) {
    const candidate = mixHex(colour, ink, step / 50)
    if (contrastRatio(candidate, surface) >= ratio) return candidate
  }
  return ink
}
