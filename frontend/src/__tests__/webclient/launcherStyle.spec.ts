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

import { describe, expect, it } from 'vitest'
import { BRAND_COLORS } from '@/config/brand'
import { readableInkOn as inkOn } from '@/utils/color'
import {
  launcherMotionCss,
  LAUNCHER_DEFAULTS,
  DEFAULT_LAUNCHER_COLOR,
  isPaleColor,
  launcherDotColors,
  launcherAccent,
  launcherFill,
  launcherLook,
  launcherRadius,
  logoFile,
  pickDeveloperStyle,
  pickLauncherStyle,
  usableLogoUrl,
} from '@/webclient/launcher-style'

const luminance = (hex: string) => {
  const c = (i: number) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * c(1) + 0.7152 * c(3) + 0.0722 * c(5)
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('launcher-style', () => {
  it('reproduces the original corners at Large', () => {
    expect(launcherRadius('bubble', 64)).toBe('20px 20px 20px 6px')
    expect(launcherRadius('circle', 48)).toBe('50%')
  })

  it.each(['#22C55E', '#06B6D4', '#F97316', '#F59E0B', '#2F5BEA', '#C9F24E', '#111827', '#FFFFFF', '#000000'])(
    'picks the more readable ink on %s', (brand) => {
      const ink = inkOn(brand)
      const other = ink === '#FFFFFF' ? '#0B0C10' : '#FFFFFF'
      expect(ratio(ink, brand)).toBeGreaterThanOrEqual(ratio(other, brand))
      expect(ratio(ink, brand)).toBeGreaterThanOrEqual(4.5)
    })

  it('survives a bad colour', () => {
    expect(inkOn('nope')).toBe('#0B0C10')
    expect(inkOn('')).toBe('#0B0C10')
  })

  it('keeps only known values', () => {
    expect(pickLauncherStyle({ icon: 'chat', size: 'huge', extra: 1 })).toEqual({ icon: 'chat' })
    expect(pickLauncherStyle(null)).toEqual({})
    expect(pickLauncherStyle('x')).toEqual({})
  })

  it('keeps paid options away from page options', () => {
    expect(pickDeveloperStyle({ icon: 'logo', animation: 'glow', background: 'none', size: 'sm', shape: 'circle' }))
      .toEqual({ size: 'sm', shape: 'circle' })
    expect(pickDeveloperStyle({ icon: 'chat', animation: 'bounce' })).toEqual({ icon: 'chat', animation: 'bounce' })
  })

  it('compares logos without their signature', () => {
    expect(logoFile('https://a/b.webp?sig=1')).toBe('https://a/b.webp')
    expect(logoFile(null)).toBeNull()
  })

  it.each([
    ['https://a/b.webp', 'https://x/api', true],
    ['http://a/b.webp', 'https://x/api', false],
    ['http://a/b.webp', 'http://x/api', true],
    ['data:image/png;base64,x', 'http://x/api', false],
    ['not a url', 'https://x/api', false],
    ['', 'https://x/api', false],
    [null, 'https://x/api', false],
  ])('logo url %s on %s', (url, base, ok) => {
    expect(usableLogoUrl(url, base)).toBe(ok ? url : null)
  })

  describe('launcherLook', () => {
    const logo = { ...LAUNCHER_DEFAULTS, icon: 'logo' as const, background: 'none' as const }

    it('without a file: dots on the brand colour', () => {
      const look = launcherLook(logo, null)
      expect(look.icon).toBe('dots')
      expect(look.background).toBe('brand')
      expect(look.bare).toBe(false)
      expect(look.animation).toBe('classic')
    })

    it('background only applies to a logo', () => {
      expect(launcherLook({ ...LAUNCHER_DEFAULTS, background: 'none' }, null).bare).toBe(false)
    })

    it('with no background, drops animations that need a button', () => {
      expect(launcherLook({ ...logo, animation: 'glow' }, 'u').animation).toBe('none')
      expect(launcherLook({ ...logo, animation: 'bounce' }, 'u').animation).toBe('bounce')
    })

    it('fills', () => {
      expect(launcherFill(launcherLook(logo, 'u'), '#2F5BEA').fill).toBe('transparent')
      expect(launcherFill(launcherLook({ ...logo, background: 'white' }, 'u'), '#2F5BEA').fill).toBe('#FFFFFF')
      expect(launcherFill(launcherLook(LAUNCHER_DEFAULTS, null), '#2F5BEA').fill).toBe('#2F5BEA')
    })
  })

  describe('pale launcher colours', () => {
    it.each(['#E9ECEF', '#FFFFFF', '#F8F9FA'])('%s counts as pale', (hex) => expect(isPaleColor(hex)).toBe(true))
    it.each(['#2F5BEA', '#C9F24E', '#111827', '#FF8A73', 'nope'])('%s does not', (hex) => expect(isPaleColor(hex)).toBe(false))

    it('draws rings and motion in a dark accent so they show', () => {
      expect(launcherAccent('#E9ECEF')).toBe('#1F2937')
      expect(launcherAccent('#2F5BEA')).toBe('#2F5BEA')
    })

    it('gets an outline instead of a pale glow', () => {
      const pale = launcherFill(launcherLook(LAUNCHER_DEFAULTS, null), '#E9ECEF')
      expect(pale.fill).toBe('#E9ECEF')
      expect(pale.shadow).toContain('inset 0 0 0 1px rgba(15,23,42,.12)')
      expect(launcherFill(launcherLook(LAUNCHER_DEFAULTS, null), '#2F5BEA').shadow).toContain('#2F5BEAcc')
    })
  })

  describe('the default launcher is the ChatterMate mark', () => {
    it('defaults to the logo ink', () => expect(DEFAULT_LAUNCHER_COLOR).toBe(BRAND_COLORS.ink))

    it('colours its dots lime and coral, whatever the case of the hex', () => {
      expect(launcherDotColors(BRAND_COLORS.ink)).toEqual([BRAND_COLORS.lime, BRAND_COLORS.coral])
      expect(launcherDotColors(BRAND_COLORS.ink.toLowerCase())).toEqual([BRAND_COLORS.lime, BRAND_COLORS.coral])
    })

    it('any other colour keeps one ink for both dots', () => {
      expect(launcherDotColors('#2F5BEA')).toBeNull()
      expect(launcherDotColors('')).toBeNull()
    })
  })

  describe('glow', () => {
    it("keeps the launcher's own shadow under the pulse", () => {
      const look = launcherLook({ ...LAUNCHER_DEFAULTS, animation: 'glow' }, null)
      const css = launcherMotionCss('#b', look, '#123456', 'right', '0 1px 2px red')
      const frames = css.match(/box-shadow: [^;]+;/g) ?? []
      expect(frames).toHaveLength(3)
      frames.forEach((frame) => expect(frame).toContain('0 1px 2px red, 0 0 0 '))
    })

    it('adds nothing when the launcher has no shadow', () => {
      const look = launcherLook({ ...LAUNCHER_DEFAULTS, animation: 'glow' }, null)
      expect(launcherMotionCss('#b', look, '#123456', 'right')).toContain('box-shadow: 0 0 0 0 #12345699;')
    })
  })
})
