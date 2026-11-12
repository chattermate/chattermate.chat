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
 * The extra --cm-* properties the redesigned widget (ui 2) reads, derived from a
 * theme's tokens and the agent's own colours. Kept apart from the classic vars so
 * the classic widget renders exactly as before.
 */

import { contrastRatio, hexWithAlpha, mixHex, mixToContrast, readableInkOn, readableOn } from '../../utils/color'
import type { ThemeTokens } from '../widget-theme'
import { motionCssVars } from './motion-tokens'

/** Text on a custom panel background: whichever of these reads better. */
export const LIGHT_TEXT = '#FFFFFF'
export const DARK_TEXT = '#111111'
// Near mid grey neither of the two above reaches 4.5:1; black always does with white.
const DARKEST_TEXT = '#000000'

// WCAG AA for body text, and for the borders that identify a control (1.4.11).
const TEXT_CONTRAST = 4.5
const CONTROL_CONTRAST = 3

/** How far the tint surface (suggestions, cards, the composer) moves toward the text colour, at most. */
const TINT_SHIFT = 0.04
const TINT_STEP = 0.005
/** Hairlines between sections: the text colour at this opacity. */
const LINE_ALPHA = 0.08

export interface PanelColours {
    /** The agent's custom panel background (#rrggbb), when set. */
    customBackground: string | null
    /** The agent's custom text colour (#rrggbb), when set. */
    customText: string | null
    accent: string
}

/**
 * How the loader frames the panel (1.5 sends it in CUSTOMIZATION_UPDATE and the
 * loader allowlists it): shadow from `elevation` and `glow`, backdrop from `glass`.
 */
export interface PanelLook {
    radius: number
    elevation: 'light' | 'dark'
    /** The ambient glow colour, or null for none. */
    glow: string | null
    glass: boolean
}

/** Whichever ink reads better on a custom background, reaching 4.5:1 wherever any ink can. */
function inkFor(background: string): string {
    const ink = readableInkOn(background, DARK_TEXT, LIGHT_TEXT)
    if (contrastRatio(ink, background) >= TEXT_CONTRAST) return ink
    return readableInkOn(background, DARKEST_TEXT, LIGHT_TEXT)
}

/**
 * Text on the panel: the agent's own colour while it reads on the panel, otherwise
 * the best ink for a custom background, otherwise the theme's text.
 */
function panelText(tokens: ThemeTokens, colours: PanelColours): string {
    const surface = colours.customBackground || tokens.surface
    if (colours.customText && contrastRatio(colours.customText, surface) >= TEXT_CONTRAST) return colours.customText
    if (colours.customBackground) return inkFor(colours.customBackground)
    return tokens.text
}

/**
 * The tint surface: up to TINT_SHIFT toward the text, but never so far that text
 * on it reads worse than AA (or than on the panel itself, when that is lower).
 */
function tintFor(surface: string, text: string): string {
    const floor = Math.min(TEXT_CONTRAST, contrastRatio(text, surface))
    for (let shift = TINT_SHIFT; shift > 0; shift -= TINT_STEP) {
        const tint = mixHex(surface, text, shift)
        if (contrastRatio(text, tint) >= floor) return tint
    }
    return surface
}

/** Whether the panel's surface is light, by the same rule that picks its text. */
function surfaceIsLight(tokens: ThemeTokens, colours: PanelColours): boolean {
    if (!colours.customBackground) return tokens.light
    return inkFor(colours.customBackground) !== LIGHT_TEXT
}

/**
 * The panel fill. Glass's translucent card only works over the loader's frosted
 * backdrop; until the loader confirms it frosts the page behind the panel
 * (HOST_CAPABILITIES.backdrop), a see-through panel would show the host page
 * behind the messages, so the redesign paints Glass with its solid surface colour.
 */
function panelCard(tokens: ThemeTokens, hostBackdrop: boolean): string {
    return tokens.glass && !hostBackdrop ? tokens.surface : tokens.card
}

/** The loader's view of the panel for one theme and one agent's colours. */
export function panelLook(tokens: ThemeTokens, colours: PanelColours): PanelLook {
    const elevation = surfaceIsLight(tokens, colours) ? 'light' : 'dark'
    // A light custom background on a dark theme would wear the dark theme's glow.
    const lightOnDarkTheme = !tokens.light && elevation === 'light'
    return { radius: tokens.radius, elevation, glow: lightOnDarkTheme ? null : tokens.glow, glass: tokens.glass }
}

/** The ui-2 --cm-* properties for one theme and one agent's colours. */
export function panelCssVars(
    tokens: ThemeTokens,
    colours: PanelColours,
    { hostBackdrop = false }: { hostBackdrop?: boolean } = {},
): Record<string, string> {
    const surface = colours.customBackground || tokens.surface
    const text = panelText(tokens, colours)
    // Suggestions, cards and the composer sit on the tint, which is a little closer
    // to the text than the panel is: anything that must read on both is measured
    // against the tint, the weaker of the two.
    const tint = tintFor(surface, text)
    const look = panelLook(tokens, colours)

    const vars: Record<string, string> = {
        '--cm-radius-card': `${tokens.radiusCard}px`,
        '--cm-radius-control': `${tokens.radiusControl}px`,
        '--cm-tint': tint,
        '--cm-line': hexWithAlpha(text, LINE_ALPHA),
        '--cm-control-line': mixToContrast(tint, text, CONTROL_CONTRAST),
        '--cm-on-accent': readableInkOn(colours.accent),
        // The accent drawn as an icon, link or caret on the panel: a light accent on a
        // light panel (lime on white) darkens just enough to read; fills keep --cm-accent.
        '--cm-accent-ink': readableOn(tint, colours.accent, text, TEXT_CONTRAST),
        ...motionCssVars(tokens.motion),
    }
    // The classic vars take any background string and any custom text; the
    // redesign overrides them with the checked colours.
    vars['--cm-card'] = colours.customBackground || panelCard(tokens, hostBackdrop)
    vars['--cm-text'] = text
    if (colours.customBackground || text !== tokens.text) {
        // The muted line only as faint as still reads (theme defaults are already AA).
        vars['--cm-muted'] = contrastRatio(text, tint) >= TEXT_CONTRAST
            ? mixToContrast(tint, text, TEXT_CONTRAST)
            : text
    } else {
        vars['--cm-muted'] = tokens.muted
    }
    if (colours.customBackground) vars['--cm-agent-bg'] = tint
    if (!look.glow) vars['--cm-glow'] = 'transparent'
    return vars
}
