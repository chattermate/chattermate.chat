// Procedural "aurora" gradient orbs used as an avatar alternative to an uploaded photo.
// Colors are hardcoded hex (not CSS vars) so the orb renders identically in the dashboard,
// the preview panel, and the isolated widget bundle (which has no access to app design tokens).

interface OrbPalette {
    stops: string
    glow: string
}

// Each entry is a visibly distinct colored orb the user can choose from.
const ORB_PALETTES: OrbPalette[] = [
    { stops: '#9D8CFF, #5FE3D6, #C9F24E', glow: 'rgba(157,140,255,0.45)' }, // aurora (default)
    { stops: '#FF8A73, #9D8CFF, #5FE3D6', glow: 'rgba(255,138,115,0.40)' }, // coral
    { stops: '#5FE3D6, #C9F24E, #9D8CFF', glow: 'rgba(95,227,214,0.40)' },  // teal
    { stops: '#C9F24E, #5FE3D6, #FF8A73', glow: 'rgba(201,242,78,0.35)' },  // lime
    { stops: '#6EA8FF, #9D8CFF, #5FE3D6', glow: 'rgba(110,168,255,0.42)' }, // blue
    { stops: '#FF7AC6, #9D8CFF, #6EA8FF', glow: 'rgba(255,122,198,0.42)' }, // pink
    { stops: '#FF8A73, #FFC857, #FF7AC6', glow: 'rgba(255,200,87,0.40)' },  // sunset
    { stops: '#7C5CFF, #B388FF, #5FE3D6', glow: 'rgba(124,92,255,0.45)' },  // violet
    { stops: '#0EA5A5, #5FE3D6, #C9F24E', glow: 'rgba(14,165,165,0.40)' },  // emerald
    { stops: '#F34611, #FF8A73, #FFC857', glow: 'rgba(243,70,17,0.38)' },   // ember
]

// Number of selectable orb variants (for rendering the picker grid).
export const ORB_PALETTE_COUNT = ORB_PALETTES.length

// Stable palette index from a seed (agent name) so the same agent always gets the same orb
// when no variant has been explicitly chosen.
export const orbIndexForSeed = (seed: string): number =>
    (seed || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % ORB_PALETTES.length

// Inline style object for a specific orb variant by index.
export const getOrbStyleAt = (index: number): Record<string, string> => {
    const p = ORB_PALETTES[((index % ORB_PALETTES.length) + ORB_PALETTES.length) % ORB_PALETTES.length]
    return {
        background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${p.stops})
        `.trim(),
        boxShadow: `0 4px 28px ${p.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
        borderRadius: '50%',
    }
}

// Inline style for the orb, keyed by a seed (used as the stable default).
export const getOrbStyle = (seed: string): Record<string, string> => getOrbStyleAt(orbIndexForSeed(seed))

// Resolve the orb style for an agent: an explicitly chosen variant wins, otherwise
// fall back to the seed-derived default. `variant` is whatever is stored in
// customization_metadata.orb_variant (may be undefined / non-numeric).
export const resolveOrbStyle = (seed: string, variant: unknown): Record<string, string> => {
    const idx = typeof variant === 'number' && Number.isFinite(variant) ? variant : orbIndexForSeed(seed)
    return getOrbStyleAt(idx)
}

// Render an orb variant as a self-contained SVG data URI. Storing this in
// `photo_url` lets every existing avatar render site (agent list, widget header,
// previews) show the orb with no orb-specific logic — they just render the image.
export const orbSvgDataUri = (seed: string, variant?: unknown): string => {
    const idx = typeof variant === 'number' && Number.isFinite(variant) ? variant : orbIndexForSeed(seed)
    const p = ORB_PALETTES[((idx % ORB_PALETTES.length) + ORB_PALETTES.length) % ORB_PALETTES.length]
    const [c1, c2, c3] = p.stops.split(',').map((s) => s.trim())
    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
        '<defs>' +
        '<radialGradient id="o" cx="50%" cy="50%" r="70%">' +
        `<stop offset="0%" stop-color="${c1}"/>` +
        `<stop offset="50%" stop-color="${c2}"/>` +
        `<stop offset="100%" stop-color="${c3}"/>` +
        '</radialGradient>' +
        '<radialGradient id="h" cx="32%" cy="28%" r="45%">' +
        '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>' +
        '<stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<radialGradient id="s" cx="68%" cy="72%" r="42%">' +
        '<stop offset="0%" stop-color="#000000" stop-opacity="0.3"/>' +
        '<stop offset="100%" stop-color="#000000" stop-opacity="0"/>' +
        '</radialGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="50" fill="url(#o)"/>' +
        '<circle cx="50" cy="50" r="50" fill="url(#h)"/>' +
        '<circle cx="50" cy="50" r="50" fill="url(#s)"/>' +
        '</svg>'
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// Terminal-style avatar mark: a monospace ">" prompt on a dark, FULL-BLEED tile tinted
// with the accent (matches the Terminal chat theme). Full-bleed so it fully covers the
// avatar container at every render site — circular (header/message) or square — with no
// transparent corners. Stored in `photo_url` exactly like the orb, so every avatar
// render site shows it with no mark-specific logic.
export const TERMINAL_MARK_ACCENT = '#C9F24E'
// Only accept simple, safe colour tokens (hex / rgb[a] / hsl[a] / named) before
// embedding into the SVG, so a stray quote in a stored value can't break out of the
// attribute. Anything else falls back to the Terminal lime.
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d.,\s%]+\)|hsla?\([\d.,\s%]+\)|[a-z]+)$/i
export const terminalMarkSvgDataUri = (accent: string = TERMINAL_MARK_ACCENT): string => {
    const c = accent && SAFE_COLOR.test(accent.trim()) ? accent.trim() : TERMINAL_MARK_ACCENT
    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
        // Full-bleed dark base guarantees coverage in any avatar shape.
        '<rect width="100" height="100" fill="#0B0C10"/>' +
        `<rect width="100" height="100" fill="${c}" fill-opacity="0.16"/>` +
        // Inset accent frame for the terminal look.
        `<rect x="14" y="14" width="72" height="72" rx="14" fill="none" stroke="${c}" stroke-opacity="0.6" stroke-width="4"/>` +
        `<text x="50" y="52" font-family="'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="52" font-weight="700" fill="${c}" text-anchor="middle" dominant-baseline="central">&gt;</text>` +
        '</svg>'
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
