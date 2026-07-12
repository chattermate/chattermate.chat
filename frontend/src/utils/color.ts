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
