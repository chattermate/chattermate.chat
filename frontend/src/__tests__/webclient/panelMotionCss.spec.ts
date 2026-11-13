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

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guards the redesign's shared stylesheets: motion only on transform and opacity
 * (nothing that triggers layout), and no colour literals (every colour is a theme
 * token, so both themes and every chat style stay right).
 */

// Read from disk: vitest stubs CSS imports, ?raw included. Every widget-panel*.css
// (the redesign's look, split by area) and the motion sheet.
const SHEET_DIR = resolve(__dirname, '../../webclient')
const PANEL_SHEET = /^widget-panel(?:-[a-z]+)?\.css$/
const sheetNames = [
    ...readdirSync(SHEET_DIR).filter(name => PANEL_SHEET.test(name)).sort(),
    'widget-motion.css',
].filter(name => existsSync(resolve(SHEET_DIR, name)))
const sheets = Object.fromEntries(
    sheetNames.map(name => [name, readFileSync(resolve(SHEET_DIR, name), 'utf8')]),
) as Record<string, string>
const allCss = Object.values(sheets).join('\n')

const MOVABLE = new Set(['transform', 'opacity', 'none'])

const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Splits at commas that are not inside parentheses (cubic-bezier(.16,1,.3,1) stays whole). */
const topLevelItems = (value: string): string[] => {
    const items: string[] = []
    let depth = 0
    let current = ''
    for (const ch of value) {
        if (ch === '(') depth++
        if (ch === ')') depth--
        if (ch === ',' && depth === 0) {
            items.push(current)
            current = ''
        } else {
            current += ch
        }
    }
    return [...items, current]
}

/** The property each item of a transition shorthand (or transition-property list) animates. */
const transitionProperties = (css: string): string[] =>
    [...css.matchAll(/transition(?:-property)?\s*:\s*([^;}]+)/gi)]
        .flatMap(([, value]) => topLevelItems(value))
        .map(item => item.trim().split(/\s+/)[0].toLowerCase())

/** Every property set inside an @keyframes block. */
const keyframeProperties = (css: string): string[] =>
    [...css.matchAll(/@keyframes[^{]+\{((?:[^{}]*\{[^}]*\})*)[^{}]*\}/g)]
        .flatMap(([, body]) => [...body.matchAll(/([a-z-]+)\s*:/g)].map(([, prop]) => prop))

/** The value with every var(--x, fallback) removed, so fallbacks may hold colours. */
// Colour functions and the named colours a stylesheet is likely to reach for.
const COLOUR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix|color)\(/gi
const COLOUR_NAME = /(?<![\w-])(?:white|black|transparent|red|green|blue|gray|grey|silver|currentcolor)(?![\w-])/gi

/** Selectors of rules that set an animation or transition, outside any @media block. */
const animatedSelectors = (css: string): string[] =>
    [...css.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, '').matchAll(/([^{}]+)\{([^}]*)\}/g)]
        .filter(([, , body]) => /\b(?:animation|transition)\s*:/.test(body) && !/:\s*none\b/.test(body))
        .flatMap(([, selector]) => selector.split(',').map(part => part.trim()))
        .filter(selector => selector.startsWith('.'))

/** Every selector inside the prefers-reduced-motion block. */
const reducedMotionSelectors = (css: string): Set<string> => {
    const block = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{((?:[^{}]*\{[^}]*\})*)[^{}]*\}/)
    if (!block) return new Set()
    return new Set([...block[1].matchAll(/([^{}]+)\{/g)]
        .flatMap(([, selector]) => selector.split(',').map(part => part.trim())))
}

const withoutVarFallbacks = (css: string) => css.replace(/var\([^()]*(?:\([^()]*\))?[^()]*\)/g, 'var()')

describe('the redesign stylesheets', () => {
    it('include the motion sheet and the panel sheets', () => {
        expect(Object.keys(sheets)).toContain('widget-motion.css')
        expect(Object.keys(sheets)).toContain('widget-panel.css')
    })

    it('are all imported by the panel view', () => {
        const view = readFileSync(resolve(SHEET_DIR, 'panel/PanelWidget.vue'), 'utf8')
        for (const name of Object.keys(sheets)) expect(view).toContain(`import '../${name}'`)
    })

    // The per-sheet checks below pass trivially for a sheet with no keyframes or no
    // animation; these prove the parsers still find them where they exist.
    it('have keyframes and animated rules the checks can see', () => {
        expect(keyframeProperties(withoutComments(allCss)).length).toBeGreaterThan(0)
        expect(animatedSelectors(withoutComments(allCss)).length).toBeGreaterThan(0)
    })

    describe.each(Object.entries(sheets))('%s', (_path, raw) => {
        const css = withoutComments(raw)

        it('only transitions transform and opacity', () => {
            const animated = transitionProperties(css)
            expect(animated.filter(prop => !MOVABLE.has(prop))).toEqual([])
        })

        it('only animates transform and opacity in keyframes', () => {
            // A sheet without keyframes passes trivially.
            const animated = keyframeProperties(css)
            expect(animated.filter(prop => !MOVABLE.has(prop))).toEqual([])
        })

        it('has no colour literals outside var() fallbacks', () => {
            const bare = withoutVarFallbacks(css)
            expect(bare.match(/#[0-9a-fA-F]{3,8}\b/g) || []).toEqual([])
            expect(bare.match(COLOUR_FUNCTION) || []).toEqual([])
            expect(bare.match(COLOUR_NAME) || []).toEqual([])
        })

        it('stills every animation and transition for reduced motion', () => {
            // A sheet that animates nothing passes trivially.
            const reduced = reducedMotionSelectors(css)
            const animated = animatedSelectors(css)
            expect(animated.filter(selector => !reduced.has(selector))).toEqual([])
        })

        it('is scoped to the redesigned panel', () => {
            const rules = css
                .replace(/@keyframes[^{]+\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, '')
                .replace(/@media[^{]*\{/g, '')
            const selectors = [...rules
                .matchAll(/([^{}@]+)\{/g)]
                .map(([, selector]) => selector.trim())
                .map(selector => selector.replace(/^\}+\s*/, ''))
                .filter(Boolean)
            expect(selectors.length).toBeGreaterThan(0)
            for (const group of selectors) {
                for (const selector of group.split(',')) {
                    expect(selector.trim()).toMatch(/^\.chat-container\.cm-surface\.cm-ui-2\b/)
                }
            }
        })
    })
})
