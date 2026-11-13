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

/**
 * How the embed loader frames the widget's panel, as the frame reports it in
 * CUSTOMIZATION_UPDATE.panel (panelLookFor() in widget-theme.ts). These values end
 * up in CSS on the customer's page, so the loader only ever uses what passes
 * here: a known design version, clamped numbers, a colour of one strict shape and
 * booleans. Anything else falls back to the classic widget's framing.
 */

export interface PanelFrame {
    /** 1: the classic widget, framed as it always was. 2: the redesigned panel. */
    ui: 1 | 2
    /** Corner radius, px. */
    radius: number
    /** Which long shadow the panel casts. */
    elevation: 'light' | 'dark'
    /** The dark themes' glow ring, or null for none. */
    glow: string | null
    /** Frost the page behind the panel (Glass). */
    glass: boolean
}

export const CLASSIC_FRAME: PanelFrame = { ui: 1, radius: 24, elevation: 'light', glow: null, glass: false }

const RADIUS_MIN = 0
const RADIUS_MAX = 40
const DEFAULT_RADIUS = 24

// rgba(r,g,b,a) with byte channels and an alpha in [0, 1], or #rrggbb: nothing else
// (no var(), url(), expressions, semicolons or braces) can reach a stylesheet.
const RGBA = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d{1,3}|1\.0{1,3})\s*\)$/
const HEX6 = /^#[0-9a-fA-F]{6}$/

/** A glow colour of one strict shape, else null. */
export function safeGlow(value: unknown): string | null {
    if (typeof value !== 'string') return null
    if (HEX6.test(value)) return value
    const rgba = RGBA.exec(value)
    if (!rgba) return null
    const bytes = rgba.slice(1, 4).map(Number)
    return bytes.every(byte => byte <= 255) ? value.replace(/\s+/g, '') : null
}

const clampRadius = (value: unknown): number =>
    typeof value === 'number' && Number.isFinite(value)
        ? Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, Math.round(value)))
        : DEFAULT_RADIUS

/** The panel framing the loader may use, from whatever the frame sent. */
export function pickPanelLook(input: unknown): PanelFrame {
    if (!input || typeof input !== 'object') return { ...CLASSIC_FRAME }
    const look = input as Record<string, unknown>
    if (look.ui !== 2) return { ...CLASSIC_FRAME }
    return {
        ui: 2,
        radius: clampRadius(look.radius),
        elevation: look.elevation === 'dark' ? 'dark' : 'light',
        glow: safeGlow(look.glow),
        glass: look.glass === true,
    }
}
