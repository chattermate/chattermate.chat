/**
 * Single source of truth for the widget's per-`chat_style` STRUCTURAL design
 * tokens — panel/bubble radius, ambient glow, border, agent-bubble surface,
 * light/dark flag, and whether the theme is monospace-forward.
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
    /** Message-bubble corner radius, px (the speech "tail" corner is derived from this). */
    bubble: number
}

// Token sets straight from the design comp (Glass / Terminal / Playful / Calm Mint /
// Aurora / Sunrise). Each `chat_style` maps 1:1 to a comp theme below so the widget
// matches the comp pixel-for-pixel.
const GLASS: ThemeTokens = {
    light: false, radius: 22,
    glow: 'rgba(157,140,255,.26)', border: 'rgba(157,140,255,.32)',
    agentBg: 'rgba(255,255,255,.06)', mono: false, bubble: 16,
}
const AURORA: ThemeTokens = {
    light: false, radius: 26,
    glow: 'rgba(157,140,255,.32)', border: 'rgba(157,140,255,.40)',
    agentBg: 'rgba(255,255,255,.05)', mono: false, bubble: 18,
}
const CALM_MINT: ThemeTokens = {
    light: false, radius: 18,
    glow: 'rgba(95,227,214,.22)', border: 'rgba(95,227,214,.30)',
    agentBg: 'rgba(255,255,255,.05)', mono: false, bubble: 14,
}
const SUNRISE: ThemeTokens = {
    light: true, radius: 24,
    glow: 'rgba(255,138,115,.22)', border: 'rgba(0,0,0,.08)',
    agentBg: '#F3F3F6', mono: false, bubble: 16,
}
const PLAYFUL: ThemeTokens = {
    light: true, radius: 28,
    glow: 'rgba(255,138,115,.30)', border: 'rgba(0,0,0,.07)',
    agentBg: '#F4F1F6', mono: false, bubble: 20,
}
const TERMINAL: ThemeTokens = {
    light: false, radius: 8,
    glow: 'rgba(201,242,78,.20)', border: 'rgba(201,242,78,.30)',
    agentBg: 'rgba(201,242,78,.045)', mono: true, bubble: 4,
}

// chat_style → token-set mapping. CHATBOT (legacy) and ASK_ANYTHING reuse the light
// Sunrise set; every other style maps to its matching comp theme.
const THEME_TOKENS: Record<string, ThemeTokens> = {
    AURORA,
    GLASS,
    CALM_MINT,
    TERMINAL,
    SUNRISE,
    PLAYFUL,
    CHATBOT: SUNRISE,
    ASK_ANYTHING: SUNRISE,
}

/** Speech-bubble "tail" corner radius, derived from the bubble radius (comp formula). */
function bubbleTail(bubble: number): number {
    return Math.max(4, Math.round(bubble * 0.3))
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
        '--cm-bubble': `${t.bubble}px`,
        '--cm-bubble-tail': `${bubbleTail(t.bubble)}px`,
        // Inputs + send button share one field radius (square-ish on Terminal, rounded elsewhere).
        '--cm-field-radius': t.mono ? '7px' : '12px',
    }
}
