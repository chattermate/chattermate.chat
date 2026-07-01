/**
 * Single source of truth for the widget's per-`chat_style` design tokens — colours
 * (panel / text / muted / agent-bubble / accent) AND structure (radius, glow,
 * border, bubble radius, mono flag). Every visual value the comp defines lives here.
 *
 * `themeCssVars()` flattens these into `--cm-*` custom properties that BOTH the real
 * widget (`WidgetBuilder.vue`) and the admin preview (`AgentChatPreviewPanel.vue`)
 * apply on `.chat-container`, and the shared `widget-surface.css` consumes. A user's
 * explicit `accent_color` / `chat_background_color` / `font_family` overrides the
 * theme default; otherwise the comp values win.
 */

import { isColorDark, adjustColorBrightness } from '../types/widget'

export interface ThemeTokens {
    /** Light surface (affects overlay/contrast + hairline choices). */
    light: boolean
    /** Monospace-forward theme (Terminal). */
    mono: boolean
    /** Panel corner radius, px. */
    radius: number
    /** Message-bubble corner radius, px (the speech "tail" corner is derived from this). */
    bubble: number
    /** Ambient glow colour used in the panel shadow. */
    glow: string
    /** Panel border colour. */
    border: string
    /** Panel/card background (solid or gradient). */
    card: string
    /** Primary text colour. */
    text: string
    /** Muted/secondary text colour. */
    muted: string
    /** Agent message-bubble background. */
    agentBg: string
    /** Default accent (user `accent_color` overrides). */
    accent: string
}

// Token sets copied verbatim from the design comp (Glass / Aurora / Terminal /
// Calm Mint / Playful / Sunrise). Each chat_style maps 1:1 to a comp theme.
const GLASS: ThemeTokens = {
    light: false, mono: false, radius: 22, bubble: 16,
    glow: 'rgba(157,140,255,.26)', border: 'rgba(157,140,255,.32)',
    card: 'linear-gradient(180deg,rgba(28,26,40,.94),rgba(15,14,22,.97))',
    text: '#ECEAFA', muted: '#9C97BE', agentBg: 'rgba(255,255,255,.06)', accent: '#9D8CFF',
}
const AURORA: ThemeTokens = {
    light: false, mono: false, radius: 26, bubble: 18,
    glow: 'rgba(157,140,255,.32)', border: 'rgba(157,140,255,.40)',
    card: 'linear-gradient(180deg,#16131F,#0A0910)',
    text: '#F2F3F8', muted: '#A7A0CC', agentBg: 'rgba(255,255,255,.05)', accent: '#9D8CFF',
}
const TERMINAL: ThemeTokens = {
    light: false, mono: true, radius: 8, bubble: 4,
    glow: 'rgba(201,242,78,.20)', border: 'rgba(201,242,78,.30)',
    card: '#070907',
    text: '#D7F7C8', muted: '#7F9B57', agentBg: 'rgba(201,242,78,.045)', accent: '#C9F24E',
}
const CALM_MINT: ThemeTokens = {
    light: false, mono: false, radius: 18, bubble: 14,
    glow: 'rgba(95,227,214,.22)', border: 'rgba(95,227,214,.30)',
    card: 'linear-gradient(180deg,#0E1A1A,#0A1414)',
    text: '#DDF7F3', muted: '#6FAFA8', agentBg: 'rgba(255,255,255,.05)', accent: '#5FE3D6',
}
const PLAYFUL: ThemeTokens = {
    light: true, mono: false, radius: 28, bubble: 20,
    glow: 'rgba(255,138,115,.30)', border: 'rgba(0,0,0,.07)',
    card: '#FFFFFF',
    text: '#2A2730', muted: '#9A93A3', agentBg: '#F4F1F6', accent: '#FF8A73',
}
const SUNRISE: ThemeTokens = {
    light: true, mono: false, radius: 24, bubble: 16,
    glow: 'rgba(255,138,115,.22)', border: 'rgba(0,0,0,.08)',
    card: '#FFFFFF',
    text: '#2A2A33', muted: '#8A8A99', agentBg: '#F3F3F6', accent: '#FF8A73',
}

// chat_style → token-set mapping. CHATBOT (legacy) and ASK_ANYTHING reuse Sunrise.
const THEME_TOKENS: Record<string, ThemeTokens> = {
    GLASS,
    AURORA,
    TERMINAL,
    CALM_MINT,
    PLAYFUL,
    SUNRISE,
    CHATBOT: SUNRISE,
    ASK_ANYTHING: SUNRISE,
}

const MONO_FONT = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
const BODY_FONT = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"

/** Speech-bubble "tail" corner radius, derived from the bubble radius (comp formula). */
function bubbleTail(bubble: number): number {
    return Math.max(4, Math.round(bubble * 0.3))
}

/**
 * Contrast colour for text/icons sitting ON the accent (user bubble, send button).
 * Matches the comp `on()`: relative luminance > 0.62 → near-black, else white.
 */
export function onAccent(hex: string): string {
    const c = (hex || '').replace('#', '')
    if (c.length < 6) return '#0B0C10'
    const r = parseInt(c.slice(0, 2), 16)
    const g = parseInt(c.slice(2, 4), 16)
    const b = parseInt(c.slice(4, 6), 16)
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum > 0.62 ? '#0B0C10' : '#FFFFFF'
}

/** Resolve structural + colour tokens for a chat style (defaults to the light Sunrise set). */
export function getThemeTokens(chatStyle?: string | null): ThemeTokens {
    return THEME_TOKENS[chatStyle || ''] || SUNRISE
}

/** Minimal shape of the customization fields that can override theme defaults. */
export interface ThemeOverrides {
    chat_background_color?: string | null
    chat_text_color?: string | null
    accent_color?: string | null
    font_family?: string | null
}

// Legacy DB default for chat_text_color (dark). Treated as "unset" so existing
// agents fall back to the per-theme text colour instead of near-black on dark themes.
const LEGACY_TEXT_DEFAULT = '#212529'

/**
 * Flatten tokens (merged with any user overrides) into the `--cm-*` custom
 * properties consumed by `widget-surface.css`. This is the ONLY place per-theme
 * values are turned into CSS — both widget and preview call it.
 */
export function themeCssVars(chatStyle?: string | null, overrides?: ThemeOverrides): Record<string, string> {
    const t = getThemeTokens(chatStyle)

    // A user-set background is a hex colour from the picker; when present we derive
    // text/muted/agent-bubble from it (so custom colours stay legible), otherwise we
    // use the comp's exact per-theme colours.
    const customBg = overrides?.chat_background_color || ''
    const hasCustomBg = /^#[0-9a-fA-F]{6}$/.test(customBg)
    const card = customBg || t.card

    // Text colour precedence: explicit user text colour > derived from a custom
    // background > the theme's design default.
    const customText = overrides?.chat_text_color || ''
    const hasCustomText = /^#[0-9a-fA-F]{6}$/.test(customText) && customText.toLowerCase() !== LEGACY_TEXT_DEFAULT
    const text = hasCustomText
        ? customText
        : (hasCustomBg ? (isColorDark(customBg) ? '#FFFFFF' : '#111111') : t.text)
    const muted = hasCustomBg ? (isColorDark(customBg) ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)') : t.muted
    const agentBg = hasCustomBg ? adjustColorBrightness(customBg, 20) : t.agentBg

    const accent = overrides?.accent_color || t.accent
    // font_family may be a bare name ("Space Grotesk") or a full stack
    // ("Instrument Sans, sans-serif"); append it raw so the comma-separated stack
    // stays valid (quoting the whole stack would make the first token invalid).
    const bodyFont = t.mono
        ? MONO_FONT
        : (overrides?.font_family ? `${overrides.font_family}, ${BODY_FONT}` : BODY_FONT)

    return {
        '--cm-card': card,
        '--cm-text': text,
        '--cm-muted': muted,
        '--cm-agent-bg': agentBg,
        '--cm-accent': accent,
        '--cm-on-accent': onAccent(accent),
        '--cm-border': t.border,
        '--cm-glow': t.glow,
        '--cm-radius': `${t.radius}px`,
        '--cm-bubble': `${t.bubble}px`,
        '--cm-bubble-tail': `${bubbleTail(t.bubble)}px`,
        '--cm-field-radius': t.mono ? '7px' : '12px',
        '--cm-avatar-radius': t.mono ? '28%' : '50%',
        '--cm-hairline': t.light ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)',
        '--cm-body-font': bodyFont,
    }
}
