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
import { themeCssVars, getThemeTokens, panelLookFor } from '@/webclient/widget-theme'
import { contrastRatio, mixHex, readableInkOn } from '@/utils/color'

/** The redesign's theme properties: contrast that holds for any colours an agent picks. */

const STYLES = ['CHATBOT', 'ASK_ANYTHING', 'GLASS', 'AURORA', 'TERMINAL', 'CALM_MINT', 'PLAYFUL', 'SUNRISE']

// Deterministic "random" colours, so a failure is reproducible.
function* colours(seed: number, count: number) {
    let state = seed
    for (let i = 0; i < count; i++) {
        state = (state * 1103515245 + 12345) % 2 ** 31
        yield `#${(state % 0xffffff).toString(16).padStart(6, '0')}`
    }
}

const bestInkRatio = (fill: string) => Math.max(contrastRatio(fill, '#FFFFFF'), contrastRatio(fill, '#0B0C10'))

describe('the classic widget', () => {
    it.each(STYLES)('%s gets none of the redesign properties', (style) => {
        const vars = themeCssVars(style, { accent_color: '#FF8A73' })
        expect(vars['--cm-tint']).toBeUndefined()
        expect(vars['--cm-ease-enter']).toBeUndefined()
        expect(themeCssVars(style, { accent_color: '#FF8A73' }, { ui: 1 })).toEqual(vars)
    })
})

describe('text on the accent', () => {
    it.each(STYLES)('reads on the %s default accent', (style) => {
        const vars = themeCssVars(style, {}, { ui: 2 })
        const accent = vars['--cm-accent']
        expect(contrastRatio(vars['--cm-on-accent'], accent)).toBeGreaterThanOrEqual(Math.min(4.5, bestInkRatio(accent)))
    })

    it('reads on any accent an agent picks, or as well as either ink can', () => {
        for (const accent of colours(7, 400)) {
            const ink = themeCssVars('SUNRISE', { accent_color: accent }, { ui: 2 })['--cm-on-accent']
            const ratio = contrastRatio(ink, accent)
            expect(ratio, accent).toBeCloseTo(bestInkRatio(accent), 5)
        }
    })

    it.each(['#fff', '#FF8A73', '#0a0'])('handles a short or uppercase accent (%s)', (accent) => {
        const ink = themeCssVars('SUNRISE', { accent_color: accent }, { ui: 2 })['--cm-on-accent']
        expect(contrastRatio(ink, accent)).toBeCloseTo(bestInkRatio(accent), 5)
    })

    it('fixes the accents the classic rule gets wrong', () => {
        // Mid green: the classic luminance rule picks white at about 2.3:1.
        const accent = '#22C55E'
        expect(themeCssVars('SUNRISE', { accent_color: accent })['--cm-on-accent']).toBe('#FFFFFF')
        expect(themeCssVars('SUNRISE', { accent_color: accent }, { ui: 2 })['--cm-on-accent']).toBe('#0B0C10')
    })
})

describe('custom panel colours', () => {
    it('keep text and muted text at 4.5:1 on every background', () => {
        // 16 levels per channel: 4096 backgrounds, mid greys included.
        const levels = Array.from({ length: 16 }, (_, i) => (i * 17).toString(16).padStart(2, '0'))
        for (const r of levels) for (const g of levels) for (const b of levels) {
            const background = `#${r}${g}${b}`
            const vars = themeCssVars('GLASS', { chat_background_color: background }, { ui: 2 })
            expect(contrastRatio(vars['--cm-text'], background), background).toBeGreaterThanOrEqual(4.5)
            expect(contrastRatio(vars['--cm-text'], vars['--cm-tint']), background).toBeGreaterThanOrEqual(4.5)
            expect(contrastRatio(vars['--cm-muted'], vars['--cm-tint']), background).toBeGreaterThanOrEqual(4.5)
        }
    })

    it('prefer near-black text, and use black only where near-black falls short', () => {
        expect(themeCssVars('SUNRISE', { chat_background_color: '#ffffff' }, { ui: 2 })['--cm-text']).toBe('#111111')
        expect(themeCssVars('SUNRISE', { chat_background_color: '#777777' }, { ui: 2 })['--cm-text']).toBe('#000000')
    })

    it.each(['#FFF', '#fff', '#FFFFFF'])('accept a short or uppercase background (%s)', (background) => {
        const vars = themeCssVars('GLASS', { chat_background_color: background }, { ui: 2 })
        expect(vars['--cm-card']).toBe('#ffffff')
        expect(vars['--cm-text']).toBe('#111111')
        expect(vars['--cm-glow']).toBe('transparent')
    })

    it.each(['rgb(255,255,255)', 'white', '#ffff'])('ignore a background that is not a hex colour (%s)', (background) => {
        expect(themeCssVars('GLASS', { chat_background_color: background }, { ui: 2 }))
            .toEqual(themeCssVars('GLASS', {}, { ui: 2 }))
    })

    it('leave the classic widget parsing custom colours as before', () => {
        // Pinned, odd: the classic widget paints a short hex but derives nothing from it.
        const vars = themeCssVars('GLASS', { chat_background_color: '#FFF' })
        expect(vars['--cm-card']).toBe('#FFF')
        expect(vars['--cm-text']).toBe(getThemeTokens('GLASS').text)
    })

    it('fall back to the theme text when a custom text colour would not read', () => {
        // Text picked for a light theme, then the agent switched to a dark one.
        const vars = themeCssVars('GLASS', { chat_text_color: '#333333' }, { ui: 2 })
        const tokens = getThemeTokens('GLASS')
        expect(vars['--cm-text']).toBe(tokens.text)
        expect(vars['--cm-muted']).toBe(tokens.muted)
        expect(themeCssVars('SUNRISE', { chat_text_color: '#333333' }, { ui: 2 })['--cm-text']).toBe('#333333')
    })

    it('keep text, muted text and control borders readable on the tint surface', () => {
        // Suggestions, cards and the composer sit on the tint, not the panel.
        for (const background of colours(13, 400)) {
            const vars = themeCssVars('SUNRISE', { chat_background_color: background }, { ui: 2 })
            const tint = vars['--cm-tint']
            const best = contrastRatio(vars['--cm-text'], tint)
            expect(contrastRatio(vars['--cm-muted'], tint), background).toBeGreaterThanOrEqual(Math.min(4.5, best) - 1e-9)
            expect(contrastRatio(vars['--cm-control-line'], tint), background).toBeGreaterThanOrEqual(Math.min(3, best) - 1e-9)
            expect(best, background).toBeGreaterThanOrEqual(4.5)
        }
    })

    it.each(STYLES)('give %s control borders that reach 3:1 on its tint', (style) => {
        const vars = themeCssVars(style, {}, { ui: 2 })
        expect(contrastRatio(vars['--cm-control-line'], vars['--cm-tint'])).toBeGreaterThanOrEqual(3)
    })

    it('tint moves 4% toward the text colour', () => {
        const vars = themeCssVars('SUNRISE', { chat_background_color: '#ffffff' }, { ui: 2 })
        expect(vars['--cm-tint']).toBe(mixHex('#ffffff', vars['--cm-text'], 0.04))
    })

    it('keep an explicit text colour', () => {
        const vars = themeCssVars('SUNRISE', { chat_background_color: '#ffffff', chat_text_color: '#7a1f1f' }, { ui: 2 })
        expect(vars['--cm-text']).toBe('#7a1f1f')
    })

    it('drop the dark theme glow on a light background', () => {
        expect(themeCssVars('GLASS', { chat_background_color: '#f7f7f7' }, { ui: 2 })['--cm-glow']).toBe('transparent')
        expect(themeCssVars('GLASS', { chat_background_color: '#121212' }, { ui: 2 })['--cm-glow']).not.toBe('transparent')
        expect(themeCssVars('PLAYFUL', { chat_background_color: '#ffffff' }, { ui: 2 })['--cm-glow']).not.toBe('transparent')
    })

    it('judge a background light by the same rule that picks its text', () => {
        for (const background of colours(19, 600)) {
            const vars = themeCssVars('GLASS', { chat_background_color: background }, { ui: 2 })
            const look = panelLookFor('GLASS', { chat_background_color: background })
            const darkText = vars['--cm-text'] !== '#FFFFFF'
            expect(look.elevation, background).toBe(darkText ? 'light' : 'dark')
            expect(look.glow === null, background).toBe(darkText)
            expect(vars['--cm-glow'] === 'transparent', background).toBe(darkText)
        }
    })

    it('leave the theme text and muted colours alone without a custom background', () => {
        const tokens = getThemeTokens('AURORA')
        const vars = themeCssVars('AURORA', {}, { ui: 2 })
        expect(vars['--cm-text']).toBe(tokens.text)
        expect(vars['--cm-muted']).toBe(tokens.muted)
    })
})

describe('shape and motion per style', () => {
    it.each([
        ['SUNRISE', '24px', '16px', '12px', '16px'],
        ['PLAYFUL', '28px', '20px', '16px', '20px'],
        ['GLASS', '22px', '16px', '12px', '16px'],
        ['CALM_MINT', '18px', '14px', '12px', '14px'],
        ['TERMINAL', '8px', '6px', '6px', '4px'],
        ['AURORA', '26px', '18px', '12px', '18px'],
        ['CHATBOT', '24px', '16px', '12px', '16px'],
        ['ASK_ANYTHING', '24px', '16px', '12px', '16px'],
    ])('%s radii are panel %s, card %s, control %s, bubble %s', (style, panel, card, control, bubble) => {
        const vars = themeCssVars(style, {}, { ui: 2 })
        expect([vars['--cm-radius'], vars['--cm-radius-card'], vars['--cm-radius-control'], vars['--cm-bubble']])
            .toEqual([panel, card, control, bubble])
    })

    it.each([
        ['PLAYFUL', 'var(--cm-ease-spring)', '1', '10px', '0.96'],
        ['CALM_MINT', 'var(--cm-ease-out)', '1.25', '4px', '1'],
        ['TERMINAL', 'steps(4, end)', '1', '0px', '1'],
        ['GLASS', 'var(--cm-ease-out)', '1', '8px', '0.98'],
        ['SUNRISE', 'var(--cm-ease-out)', '1', '8px', '1'],
        ['AURORA', 'var(--cm-ease-out)', '1', '8px', '1'],
        ['CHATBOT', 'var(--cm-ease-out)', '1', '8px', '1'],
        ['ASK_ANYTHING', 'var(--cm-ease-out)', '1', '8px', '1'],
    ])('%s moves with %s', (style, ease, scale, y, enterScale) => {
        const vars = themeCssVars(style, {}, { ui: 2 })
        expect([vars['--cm-ease-enter'], vars['--cm-dur-scale'], vars['--cm-enter-y'], vars['--cm-enter-scale']])
            .toEqual([ease, scale, y, enterScale])
        expect(vars['--cm-dur-3']).toBe('320ms')
    })

})

describe('the panel look the loader gets', () => {
    it('marks only Glass as frosted', () => {
        expect(STYLES.filter(style => panelLookFor(style).glass)).toEqual(['GLASS'])
    })

    it.each([['SUNRISE', 24, 'light'], ['PLAYFUL', 28, 'light'], ['GLASS', 22, 'dark'], ['TERMINAL', 8, 'dark']])(
        '%s has radius %i and %s elevation, with its glow', (style, radius, elevation) => {
            expect(panelLookFor(style as string)).toEqual({
                radius, elevation, glow: getThemeTokens(style as string).glow, glass: style === 'GLASS',
            })
        })

    it('ignores a malformed custom background', () => {
        expect(panelLookFor('GLASS', { chat_background_color: 'white' })).toEqual(panelLookFor('GLASS'))
    })
})

describe('readableInkOn', () => {
    it('survives a bad colour', () => {
        expect(readableInkOn('nope')).toBe('#0B0C10')
    })
})
