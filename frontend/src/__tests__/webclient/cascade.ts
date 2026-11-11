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
 * The value a browser would give `property` on `el` from the page's stylesheets.
 * jsdom's getComputedStyle takes the last matching declaration whatever its
 * specificity and applies no media queries, which is no use for checking which of
 * the loader's rules wins. This resolves it properly: !important first, then
 * specificity, then source order, with only the `media` listed applying.
 */

type Specificity = [number, number, number]

/** Selector specificity (ids, classes/attributes/pseudo-classes, elements). */
export function specificity(selector: string): Specificity {
    let rest = selector.replace(/::?(before|after|placeholder|selection)\b/g, ' ')
    // :not(x) counts as x.
    rest = rest.replace(/:not\(([^)]*)\)/g, ' $1 ')
    const ids = (rest.match(/#[\w-]+/g) || []).length
    rest = rest.replace(/#[\w-]+/g, ' ')
    const classes = (rest.match(/\.[\w-]+|\[[^\]]*\]|:[\w-]+(\([^)]*\))?/g) || []).length
    rest = rest.replace(/\.[\w-]+|\[[^\]]*\]|:[\w-]+(\([^)]*\))?/g, ' ')
    const elements = (rest.match(/[a-zA-Z][\w-]*/g) || []).length
    return [ids, classes, elements]
}

function outranks(a: { important: boolean, spec: Specificity, order: number }, b: typeof a) {
    if (a.important !== b.important) return a.important
    for (let i = 0; i < 3; i++) if (a.spec[i] !== b.spec[i]) return a.spec[i] > b.spec[i]
    return a.order > b.order
}

export function resolvedStyle(el: Element, property: string, media: string[] = []): string {
    let best: { important: boolean, spec: Specificity, order: number, value: string } | null = null
    let order = 0
    const walk = (rules: CSSRuleList) => {
        for (const rule of Array.from(rules)) {
            if (rule instanceof CSSMediaRule) {
                const text = rule.media.mediaText.replace(/^\(|\)$/g, '').trim()
                if (media.some(m => m.replace(/^\(|\)$/g, '').trim() === text)) walk(rule.cssRules)
                continue
            }
            if (!(rule instanceof CSSStyleRule)) continue
            order++
            const value = rule.style.getPropertyValue(property)
            if (!value) continue
            const important = rule.style.getPropertyPriority(property) === 'important'
            for (const selector of rule.selectorText.split(',').map(s => s.trim())) {
                let matches = false
                try { matches = el.matches(selector) } catch { matches = false }
                if (!matches) continue
                const candidate = { important, spec: specificity(selector), order, value }
                if (!best || outranks(candidate, best)) best = candidate
            }
        }
    }
    for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules)
    return best ? (best as { value: string }).value : ''
}
