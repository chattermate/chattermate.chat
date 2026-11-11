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

// The launcher's looks, shared by the embed loader (customer pages) and the
// dashboard preview so the two can't drift. No framework imports: this ships in
// chattermate.min.js.

// Relative, not '@/': the loader's esbuild build has no path aliases.
import { hexToRgb, readableInkOn, relativeLuminance } from '../utils/color'
import { BRAND_COLORS } from '../config/brand'

export type LauncherIcon = 'dots' | 'chat' | 'headset' | 'help' | 'sparkle' | 'logo'
export type LauncherSize = 'sm' | 'md' | 'lg'
export type LauncherShape = 'bubble' | 'circle'
export type LauncherAnimation = 'none' | 'classic' | 'bounce' | 'swoosh' | 'glow'
export type LauncherBackground = 'white' | 'brand' | 'none'

export interface LauncherStyle {
  icon: LauncherIcon
  size: LauncherSize
  shape: LauncherShape
  animation: LauncherAnimation
  background: LauncherBackground
}

// What a launcher with nothing saved looks like: the original one.
export const LAUNCHER_DEFAULTS: LauncherStyle = {
  icon: 'dots',
  size: 'lg',
  shape: 'bubble',
  animation: 'classic',
  background: 'brand',
}

// An agent that never picked a colour gets the ChatterMate mark: the ink tile with
// the lime (AI) and coral (human) dots.
export const DEFAULT_LAUNCHER_COLOR = BRAND_COLORS.ink

/** The dots' own colours when the launcher is the ChatterMate mark, else null (ink). */
export function launcherDotColors(brand: string): [string, string] | null {
  return (brand || '').toUpperCase() === BRAND_COLORS.ink.toUpperCase()
    ? [BRAND_COLORS.lime, BRAND_COLORS.coral]
    : null
}

export const LAUNCHER_SIZE_PX: Record<LauncherSize, number> = { sm: 48, md: 56, lg: 64 }
export const LAUNCHER_BADGE_PX: Record<LauncherSize, number> = { sm: 16, md: 19, lg: 22 }
// The badge's padding and text at Large; smaller sizes scale down from these.
const BADGE_PADDING_RATIO = 6 / 22
const BADGE_FONT_RATIO = 11.5 / 22
export const LAUNCHER_BADGE_COLORS = { fill: '#FF8A73', ink: '#0B0C10', ring: '#F5F3EE' }
export const LAUNCHER_MOBILE_MAX_PX = 56
export const LAUNCHER_ICON_SCALE = 0.42
export const LAUNCHER_LOGO_SCALE = 0.62

const ALLOWED: { [K in keyof LauncherStyle]: readonly LauncherStyle[K][] } = {
  icon: ['dots', 'chat', 'headset', 'help', 'sparkle', 'logo'],
  size: ['sm', 'md', 'lg'],
  shape: ['bubble', 'circle'],
  animation: ['none', 'classic', 'bounce', 'swoosh', 'glow'],
  background: ['white', 'brand', 'none'],
}

export const PAID_ANIMATIONS: readonly LauncherAnimation[] = ['swoosh', 'glow']
// These draw on the button itself, so they mean nothing with no button behind the logo.
export const BUTTON_ANIMATIONS: readonly LauncherAnimation[] = ['classic', 'glow']
const ATTENTION_ANIMATIONS: readonly LauncherAnimation[] = ['bounce', 'swoosh', 'glow']

const STROKE = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
const svg = (attrs: string, body: string) =>
  `<svg viewBox="0 0 24 24" width="100%" height="100%" ${attrs} aria-hidden="true">${body}</svg>`

export const LAUNCHER_ICON_SVG: Record<Exclude<LauncherIcon, 'logo'>, string> = {
  // The ChatterMate mark's two dots.
  dots: svg('fill="currentColor"', '<circle cx="7" cy="12" r="4.5"/><circle cx="17" cy="12" r="4.5"/>'),
  chat: svg(STROKE, '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.6A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/>'),
  headset: svg(STROKE, '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><path d="M4 14h3v5H5a1 1 0 0 1-1-1z"/><path d="M20 14h-3v5h2a1 1 0 0 0 1-1z"/><path d="M17 19c0 1.4-2 2-4.5 2"/>'),
  help: svg(STROKE, '<circle cx="12" cy="12" r="9"/><path d="M9.2 9a3 3 0 0 1 5.8 1c0 2-3 2.4-3 4.4"/><path d="M12 17.6h.01"/>'),
  sparkle: svg(STROKE, '<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 15v5M16.5 17.5h5"/>'),
}

/**
 * Keep only known values. These reach CSS and markup on customer pages, so
 * nothing else gets through, whatever a frame message or page script sent.
 */
export function pickLauncherStyle(input: unknown): Partial<LauncherStyle> {
  const picked: Record<string, string> = {}
  if (!input || typeof input !== 'object') return picked as Partial<LauncherStyle>
  for (const key of Object.keys(ALLOWED) as (keyof LauncherStyle)[]) {
    const value = (input as Record<string, unknown>)[key]
    if ((ALLOWED[key] as readonly unknown[]).includes(value)) picked[key] = value as string
  }
  return picked as Partial<LauncherStyle>
}

/** A page's own options: no logo and no paid animations, those come from the plan. */
export function pickDeveloperStyle(input: unknown): Partial<LauncherStyle> {
  const picked = pickLauncherStyle(input)
  delete picked.background
  if (picked.icon === 'logo') delete picked.icon
  if (picked.animation && PAID_ANIMATIONS.includes(picked.animation)) delete picked.animation
  return picked
}

/** A logo address we'll put on a customer page: https, or http on an http install. */
export function usableLogoUrl(url: unknown, baseUrl: string): string | null {
  if (typeof url !== 'string' || !url) return null
  try {
    const { protocol } = new URL(url)
    if (protocol === 'https:') return url
    return protocol === 'http:' && baseUrl.startsWith('http:') ? url : null
  } catch {
    return null
  }
}

/** Signatures change between loads; the file is the same without them. */
export const logoFile = (url: string | null) => (url ? url.split('?')[0] : null)

export function launcherRadius(shape: LauncherShape, px: number): string {
  if (shape === 'circle') return '50%'
  const round = Math.round(px * 0.31)
  return `${round}px ${round}px ${round}px ${Math.round(px * 0.094)}px`
}

export interface LauncherLook extends LauncherStyle {
  px: number
  badgePx: number
  badgePaddingPx: number
  badgeFontPx: number
  radius: string
  isLogo: boolean
  bare: boolean
}

/** What actually shows, once options that don't apply have fallen away. */
export function launcherLook(style: LauncherStyle, logoUrl: string | null): LauncherLook {
  const isLogo = style.icon === 'logo' && !!logoUrl
  const background = isLogo ? style.background : 'brand'
  const bare = background === 'none'
  return {
    ...style,
    icon: style.icon === 'logo' && !logoUrl ? 'dots' : style.icon,
    background,
    animation: bare && BUTTON_ANIMATIONS.includes(style.animation) ? 'none' : style.animation,
    px: LAUNCHER_SIZE_PX[style.size],
    badgePx: LAUNCHER_BADGE_PX[style.size],
    badgePaddingPx: Math.round(LAUNCHER_BADGE_PX[style.size] * BADGE_PADDING_RATIO),
    badgeFontPx: Math.round(LAUNCHER_BADGE_PX[style.size] * BADGE_FONT_RATIO * 2) / 2,
    radius: launcherRadius(style.shape, LAUNCHER_SIZE_PX[style.size]),
    isLogo,
    bare,
  }
}

// Above this a colour all but disappears on a white or light-grey page (pale greys
// like #E9ECEF, 0.83); saturated brights such as lime (0.77) still read.
const PALE_LUMINANCE = 0.8
const NEUTRAL_INK = '#1F2937'
// A light button's edge and shadow, so it still stands off a light page.
const OUTLINED_SHADOW = '0 12px 28px -8px rgba(15,23,42,.35), inset 0 0 0 1px rgba(15,23,42,.12)'

export function isPaleColor(hex: string): boolean {
  const rgb = hexToRgb(hex || '')
  return !!rgb && relativeLuminance(rgb) > PALE_LUMINANCE
}

/** What rings, glow and speed lines are drawn in: the brand, unless too pale to see. */
export function launcherAccent(brand: string): string {
  return isPaleColor(brand) ? NEUTRAL_INK : brand
}

/** Fill, ink and shadow of the closed launcher. */
export function launcherFill(look: LauncherLook, brand: string) {
  if (look.background === 'white') {
    return { fill: '#FFFFFF', ink: NEUTRAL_INK, shadow: OUTLINED_SHADOW }
  }
  if (look.background === 'none') return { fill: 'transparent', ink: NEUTRAL_INK, shadow: 'none' }
  const shadow = isPaleColor(brand)
    ? OUTLINED_SHADOW
    : `0 16px 40px -8px ${brand}cc, inset 0 0 0 1px rgba(255,255,255,0.08)`
  return { fill: brand, ink: readableInkOn(brand), shadow }
}

/**
 * Motion for the closed launcher, scoped to `root`. Classic stays exactly as it has
 * always been; the others play on load, then every 12 seconds, and stop for good
 * once the chat has been opened (.cm-opened).
 */
export function launcherMotionCss(
  root: string, look: LauncherLook, brand: string, side: string, restShadow = 'none',
): string {
  const cycle = '12s'
  // Glow animates box-shadow, which replaces the button's own for as long as it runs:
  // keep that shadow (and a pale launcher's outline) underneath the pulse.
  const under = restShadow === 'none' ? '' : `${restShadow}, `
  const rules: Record<LauncherAnimation, string> = {
    none: `${root} { animation: none; }`,
    classic: `${root} { animation: chattermate-float 4s ease-in-out infinite; }
      ${root} .cm-ring { display: block; }`,
    bounce: `${root} { animation: chattermate-launcher-bounce ${cycle} ease infinite; }`,
    swoosh: `${root} { animation: chattermate-launcher-dash ${cycle} cubic-bezier(.3,1.4,.5,1) infinite; }
      ${root} .cm-swoosh { display: block; }`,
    glow: `${root} { animation: chattermate-launcher-glow ${cycle} ease-out infinite; }`,
  }
  const entry = side === 'left' ? 12 : -12
  const stop = ATTENTION_ANIMATIONS.includes(look.animation)
    ? `${root}.cm-opened { animation: none; }
      ${root}.cm-opened .cm-swoosh { display: none; }`
    : ''
  return `
      ${root} .cm-ring, ${root} .cm-swoosh { display: none; }
      ${rules[look.animation]}
      ${stop}
      ${root}.active { animation: none; }
      ${root}.active .cm-ring, ${root}.active .cm-swoosh { display: none; }
      ${root} .cm-swoosh {
        position: absolute;
        ${side === 'left' ? 'left' : 'right'}: calc(100% + 2px);
        top: 50%;
        width: 60%;
        height: 42%;
        transform: translateY(-50%)${side === 'left' ? ' scaleX(-1)' : ''};
        pointer-events: none;
      }
      ${root} .cm-swoosh span {
        position: absolute;
        right: 0;
        height: 3px;
        border-radius: 3px;
        background: ${brand};
        opacity: 0;
        animation: chattermate-launcher-streak ${cycle} ease-out infinite;
      }
      ${root} .cm-swoosh span:nth-child(1) { top: 6%; width: 62%; }
      ${root} .cm-swoosh span:nth-child(2) { top: 46%; width: 100%; animation-delay: .08s; }
      ${root} .cm-swoosh span:nth-child(3) { top: 86%; width: 44%; animation-delay: .16s; }
      @keyframes chattermate-launcher-bounce {
        0%, 9%, 100% { transform: translateY(0); }
        2% { transform: translateY(-12px); }
        4% { transform: translateY(0); }
        6% { transform: translateY(-5px); }
        7.5% { transform: translateY(0); }
      }
      @keyframes chattermate-launcher-dash {
        0% { transform: translateX(${entry}px); }
        3.3% { transform: translateX(${-entry / 4}px); }
        5.5%, 100% { transform: translateX(0); }
      }
      @keyframes chattermate-launcher-streak {
        0% { transform: translateX(40%); opacity: 0; }
        2.2% { opacity: .95; }
        8.4%, 100% { transform: translateX(-50%); opacity: 0; }
      }
      @keyframes chattermate-launcher-glow {
        0%, 6%, 12%, 18% { box-shadow: ${under}0 0 0 0 ${brand}99; }
        5%, 11%, 17% { box-shadow: ${under}0 0 0 14px ${brand}00; }
        19%, 100% { box-shadow: ${under}0 0 0 0 ${brand}00; }
      }
      @media (prefers-reduced-motion: reduce) {
        ${root}, ${root} * { animation: none !important; }
        ${root} .cm-swoosh { display: none !important; }
      }`
}
