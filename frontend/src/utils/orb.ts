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
