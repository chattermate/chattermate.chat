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
import { CLASSIC_FRAME, pickPanelLook, safeGlow } from '@/webclient/panel-style'
import { panelCss, panelOrigin, panelShadow, PANEL_DEFAULT_HEIGHT, PANEL_DEFAULT_WIDTH } from '@/webclient/loader/panelMotion.js'
import { panelLookFor } from '@/webclient/widget-theme'

/**
 * The loader's allowlist for the panel framing the frame asks for, and the v2
 * stylesheet it builds from it. These values reach CSS on customer pages.
 */

const V2 = { ui: 2, radius: 22, elevation: 'dark', glow: 'rgba(157,140,255,.26)', glass: true }

describe('pickPanelLook', () => {
    it('takes the frame\'s framing for the redesign as it is when it is well formed', () => {
        expect(pickPanelLook(V2)).toEqual(V2)
        expect(pickPanelLook({ ui: 2, radius: 24, elevation: 'light', glow: null, glass: false }))
            .toEqual({ ui: 2, radius: 24, elevation: 'light', glow: null, glass: false })
    })

    it('accepts what panelLookFor produces for every chat style', () => {
        for (const style of ['SUNRISE', 'PLAYFUL', 'GLASS', 'AURORA', 'CALM_MINT', 'TERMINAL', 'CHATBOT', 'ASK_ANYTHING']) {
            const look = { ui: 2, ...panelLookFor(style) }
            expect(pickPanelLook(look)).toEqual(look)
        }
    })

    it('is the classic framing unless the frame asked for version 2 exactly', () => {
        for (const input of [undefined, null, 'x', 42, [], {}, { ui: 1 }, { ui: '2' }, { ui: 2.5 }, { ui: true }]) {
            expect(pickPanelLook(input)).toEqual(CLASSIC_FRAME)
        }
    })

    it('clamps the radius and falls back for anything that is not a number', () => {
        expect(pickPanelLook({ ui: 2, radius: 1e9 }).radius).toBe(40)
        expect(pickPanelLook({ ui: 2, radius: -5 }).radius).toBe(0)
        expect(pickPanelLook({ ui: 2, radius: 12.6 }).radius).toBe(13)
        for (const radius of ['12px', NaN, Infinity, null, {}]) {
            expect(pickPanelLook({ ui: 2, radius }).radius).toBe(24)
        }
    })

    it('knows two elevations and treats glass as true only when it is', () => {
        expect(pickPanelLook({ ui: 2, elevation: 'neon' }).elevation).toBe('light')
        expect(pickPanelLook({ ui: 2, glass: 'true' }).glass).toBe(false)
        expect(pickPanelLook({ ui: 2, glass: 1 }).glass).toBe(false)
    })

    it.each([
        'red',
        'transparent',
        'red;}body{display:none',
        'rgba(1,2,3,1);background:url(https://evil.test/x)',
        'rgba(1,2,3,1)} #x{color:red',
        'var(--x)',
        'url(https://evil.test/x)',
        'rgba(300,0,0,.5)',
        'rgba(0,0,0,2)',
        'rgb(0,0,0)',
        'expression(alert(1))',
        '#fff',
        '#12345g',
        '#123456;',
    ])('refuses a glow of any other shape: %s', (glow) => {
        expect(safeGlow(glow)).toBeNull()
        expect(pickPanelLook({ ui: 2, glow }).glow).toBeNull()
    })

    it('keeps a glow of the two known shapes, spaces dropped', () => {
        expect(safeGlow('#9D8CFF')).toBe('#9D8CFF')
        expect(safeGlow('rgba( 1, 2, 3, .5 )')).toBe('rgba(1,2,3,.5)')
        expect(safeGlow('rgba(255,255,255,1)')).toBe('rgba(255,255,255,1)')
    })
})

describe('the v2 stylesheet', () => {
    const ids = { button: 'chattermate-button', container: 'chattermate-container', peek: 'chattermate-peek' }
    const layout = (overrides: Record<string, unknown> = {}) => ({
        mode: 'floating', side: 'right', floating: true, sizeIsExplicit: { width: false, height: false },
        dotsScale: 1, peekBottom: 96, sideOffset: 20, zIndex: 999999, ...overrides,
    })
    const css = (overrides: Record<string, unknown> = {}, frame: any = pickPanelLook(V2)) => panelCss(ids, layout(overrides), frame)

    /** Every selector of every rule (outside @keyframes). */
    const selectors = (text: string) => text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/@keyframes[^{]+\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, '')
        .replace(/@media[^{]*\{/g, '')
        .match(/[^{}]+(?=\{)/g)!
        .flatMap(group => group.split(','))
        .map(selector => selector.trim())
        .filter(Boolean)

    it('scopes every rule to the redesign (.cm-v2), so the classic widget never sees one', () => {
        const all = selectors(css())
        expect(all.length).toBeGreaterThan(10)
        for (const selector of all) expect(selector).toMatch(/^#chattermate-(button|container|peek)\.cm-v2\b/)
    })

    it('opens to 400×672 unless a size was set, clamped to the window', () => {
        expect(css()).toContain(`width: ${PANEL_DEFAULT_WIDTH}px;`)
        expect(css()).toContain(`height: ${PANEL_DEFAULT_HEIGHT}px;`)
        expect(css()).toContain('max-height: calc(100vh - 132px);')
        const sized = css({ sizeIsExplicit: { width: true, height: true } })
        expect(sized).not.toContain(`width: ${PANEL_DEFAULT_WIDTH}px;`)
        expect(sized).not.toContain(`height: ${PANEL_DEFAULT_HEIGHT}px;`)
    })

    it('takes the panel\'s radius and casts one long shadow, with the glow ring on dark themes', () => {
        expect(css()).toContain('border-radius: 22px;')
        expect(panelShadow(pickPanelLook(V2))).toContain('0 0 0 1px rgba(157,140,255,.26)')
        expect(panelShadow(pickPanelLook({ ui: 2, elevation: 'light' }))).toContain('0 24px 64px -12px')
    })

    it('frosts the page behind Glass only, and keeps the frame see-through (R6)', () => {
        expect(css()).toContain('backdrop-filter: blur(20px) saturate(1.4)')
        expect(css({}, pickPanelLook({ ...V2, glass: false }))).not.toContain('backdrop-filter')
        expect(css()).toContain('color-scheme: normal;')
    })

    it('grows out of the launcher\'s corner, or the drawer\'s edge', () => {
        expect(panelOrigin('floating', 'right')).toBe('bottom right')
        expect(panelOrigin('floating', 'left')).toBe('bottom left')
        expect(panelOrigin('sidebar-left', 'left')).toBe('left center')
        expect(panelOrigin('sidebar-right', 'right')).toBe('right center')
        expect(css({ side: 'left' })).toContain('transform-origin: bottom left;')
    })

    it('opens in 460ms and closes in 200ms with transitions only, interruptible', () => {
        const text = css()
        expect(text).toContain('transform: translateY(16px) scale(.94);')
        expect(text).toContain('transform 460ms')
        expect(text).toContain('transform 200ms')
        // The only keyframes are the working dot's loop: nothing that opens or closes.
        expect([...text.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1])).toEqual(['chattermate-busy'])
    })

    it('keeps the drawer square and flush, and the Ask AI palette\'s own geometry', () => {
        for (const mode of ['sidebar-right', 'floating']) {
            const text = css({ mode, floating: false })
            expect(text).not.toContain('scale(.94)')
            expect(text).not.toContain(`width: ${PANEL_DEFAULT_WIDTH}px;`)
            expect(text).not.toContain('border-radius: 22px;')
            expect(text).not.toMatch(/#chattermate-container\.cm-v2[^{]*\{[^}]*(transform|box-shadow|border-radius)/)
            expect(text).not.toContain('cm-expanded')
            // Still see-through, and still frosted for Glass.
            expect(text).toContain('color-scheme: normal;')
            expect(text).toContain('backdrop-filter: blur(20px)')
        }
    })

    it('leaves the search-bar trigger\'s dots and chevron to its own rules', () => {
        const bar = css({ mode: 'search-bar' })
        expect(bar).not.toContain('.cm-dots')
        expect(bar).not.toContain('.cm-chevron')
        expect(css()).toContain('#chattermate-button.cm-v2 .cm-dots')
    })

    it('fades the floating window for reduced motion, outranking the classic sheet\'s transition: none !important', () => {
        const reduced = css().split('@media (prefers-reduced-motion: reduce)').slice(1).join('')
        expect(reduced).toContain('#chattermate-container.cm-v2 { transition: opacity 150ms linear, visibility 0s linear 150ms !important; }')
        expect(reduced).toContain('#chattermate-container.cm-v2.active { transition: opacity 150ms linear !important; }')
        expect(reduced).toContain('animation: none')
        // The palette and drawers keep the classic sheet's own reduced motion.
        const palette = css({ floating: false }).split('@media (prefers-reduced-motion: reduce)').slice(1).join('')
        expect(palette).not.toContain('#chattermate-container')
    })

    it('never carries a refused glow into the page', () => {
        const text = css({}, pickPanelLook({ ...V2, glow: 'red;}body{display:none' }))
        expect(text).not.toContain('display:none')
        expect(text).not.toContain('red;')
    })
})
