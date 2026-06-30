/**
 * Single source of truth for the widget's per-`chat_style` STRUCTURAL design
 * tokens — radius, ambient glow, border, agent-bubble surface, light/dark flag,
 * and whether the theme is monospace-forward.
 *
 * Colours (panel background, accent, text) continue to come from
 * `AgentCustomization` via `useWidgetStyles`, so user overrides always win. These
 * tokens own only the structural finish, matching the design comp without
 * scattering magic numbers across components/CSS.
 */

export interface ThemeTokens {
    /** Light surface (affects overlay/contrast choices). */
    light: boolean
    /** Panel corner radius, px. */
    radius: number
    /** Ambient glow colour used in the panel shadow. */
    glow: string
    /** Panel border colour. */
    border: string
    /** Agent message-bubble background. */
    agentBg: string
    /** Monospace-forward theme (Terminal). */
    mono: boolean
}

// Token sets straight from the design comp (Aurora Glass / Calm Mint / Sunrise),
// plus a dark Terminal variant. Re-used across multiple chat styles below.
const AURORA_GLASS: ThemeTokens = {
    light: false, radius: 22,
    glow: 'rgba(157,140,255,.28)', border: 'rgba(157,140,255,.35)',
    agentBg: 'rgba(255,255,255,.07)', mono: false,
}
const CALM_MINT: ThemeTokens = {
    light: false, radius: 18,
    glow: 'rgba(95,227,214,.24)', border: 'rgba(95,227,214,.32)',
    agentBg: 'rgba(255,255,255,.05)', mono: false,
}
const SUNRISE: ThemeTokens = {
    light: true, radius: 24,
    glow: 'rgba(0,0,0,.18)', border: 'rgba(0,0,0,.08)',
    agentBg: '#F3F3F6', mono: false,
}
const TERMINAL: ThemeTokens = {
    light: false, radius: 8,
    glow: 'rgba(201,242,78,.20)', border: 'rgba(201,242,78,.25)',
    agentBg: 'rgba(255,255,255,.05)', mono: true,
}

// chat_style → token-set mapping (redesign-all): every preset re-skins to one of
// the comp's token sets.
const THEME_TOKENS: Record<string, ThemeTokens> = {
    AURORA: AURORA_GLASS,
    GLASS: AURORA_GLASS,
    CALM_MINT,
    TERMINAL,
    SUNRISE,
    PLAYFUL: SUNRISE,
    CHATBOT: SUNRISE,
    ASK_ANYTHING: SUNRISE,
}

/** Resolve structural tokens for a chat style (defaults to the light Sunrise set). */
export function getThemeTokens(chatStyle?: string | null): ThemeTokens {
    return THEME_TOKENS[chatStyle || ''] || SUNRISE
}

/**
 * Flatten tokens into CSS custom properties for the chat container. The widget
 * CSS references these vars so structural values live in exactly one place.
 */
export function themeCssVars(chatStyle?: string | null): Record<string, string> {
    const t = getThemeTokens(chatStyle)
    return {
        '--cm-radius': `${t.radius}px`,
        '--cm-glow': t.glow,
        '--cm-border': t.border,
        '--cm-agent-bg': t.agentBg,
    }
}
