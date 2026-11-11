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
 * Quick actions: a plain string is shown on every page; a rule {label, match?, icon?}
 * only on pages whose path matches (app/services/page_suggestions.py decides which).
 */

export type SuggestionIcon = 'order' | 'shipping' | 'returns' | 'product' | 'billing' | 'account' | 'person' | 'article' | 'question'

export const SUGGESTION_ICONS: SuggestionIcon[] = ['order', 'shipping', 'returns', 'product', 'billing', 'account', 'person', 'article', 'question']

export interface QuickActionRule {
    label: string
    /** A URL path pattern, e.g. "/products/*". */
    match?: string
    icon?: SuggestionIcon
}

export type QuickAction = string | QuickActionRule

export const actionLabel = (action: QuickAction | null | undefined): string =>
    (typeof action === 'string' ? action : action?.label || '').trim()

export const actionMatch = (action: QuickAction | null | undefined): string =>
    (typeof action === 'string' ? '' : action?.match || '').trim()

/** The labels shown on every page (rules for some pages are left to the server). */
export const everyPageLabels = (actions: unknown): string[] =>
    (Array.isArray(actions) ? actions as QuickAction[] : [])
        .filter(a => !actionMatch(a))
        .map(actionLabel)
        .filter(Boolean)

/**
 * What "Show on pages" means as a path pattern: a pasted full URL keeps only its
 * path, spaces go, and it always starts with "/". '' for every page.
 */
export function pagePattern(input: string): string {
    let value = input.trim()
    if (!value) return ''
    if (/^https?:\/\//i.test(value)) {
        try {
            value = new URL(value).pathname
        } catch {
            /* keep what was typed */
        }
    }
    value = value.split(/[?#]/)[0].replace(/\s+/g, '')
    return value.startsWith('/') ? value : `/${value}`
}

/** A plain string when it is for every page, else a rule. */
export function toQuickAction(label: string, match: string, previous?: QuickAction): QuickAction {
    const text = label.trim()
    const path = pagePattern(match)
    const icon = typeof previous === 'object' ? previous.icon : undefined
    if (!path && !icon) return text
    return { label: text, ...(path ? { match: path } : {}), ...(icon ? { icon } : {}) }
}

/** The keyword map the server also uses (page_suggestions.keyword_icon), for the preview. */
export function keywordIcon(label: string): SuggestionIcon {
    if (/\b(order|track|tracking|deliver(y|ed)?|parcel)\b/i.test(label)) return 'order'
    if (/\b(ship|shipping|postage)\b/i.test(label)) return 'shipping'
    if (/\b(return|refund|exchange)s?\b/i.test(label)) return 'returns'
    if (/\b(price|pricing|plan|billing|invoice|payment)s?\b/i.test(label)) return 'billing'
    if (/\b(login|log in|password|account|sign in)\b/i.test(label)) return 'account'
    if (/\b(human|person|agent|someone|talk to)\b/i.test(label)) return 'person'
    return 'question'
}
