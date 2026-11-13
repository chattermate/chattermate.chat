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
 * Links in an answer, for the redesigned panel. Runs on HTML renderMarkdown has
 * already sanitized: it only adds classes and text, never markup from the answer.
 *
 * - A link written as a bare URL (an autolink) becomes a link chip: a letter tile,
 *   then the page's title when it is one of the answer's sources, else its domain
 *   and a short path.
 * - Any other link stays inline, styled as text.
 * - A link to one of the answer's sources gets that source's number, as its chip
 *   in the sources row has, so the two read as one system.
 * - A link to the host page's own site opens in the page itself when the loader
 *   can do that (NAVIGATE); every other link opens a new tab and says so.
 * - When the answer links exactly one page and that page is a source with a
 *   title, the page is returned as the answer's link card.
 */

import { PANEL_COPY } from './copy'

export interface AnswerSource {
    name: string
    type: string
    url?: string
    title?: string
    description?: string
}

export interface LinkOptions {
    /** The host page's origin, or null when unknown. */
    hostOrigin: string | null
    /** The loader opens same-site links in the page (HOST_CAPABILITIES.navigate). */
    sameTab: boolean
}

export interface DecoratedAnswer {
    html: string
    card: AnswerSource | null
}

/** The class on links the panel opens in the host page instead of a new tab. */
export const SAME_SITE_LINK = 'cm-link--same-site'
const PATH_MAX = 24

const webUrl = (href: string | null): URL | null => {
    if (!href) return null
    try {
        const url = new URL(href)
        return url.protocol === 'http:' || url.protocol === 'https:' ? url : null
    } catch {
        return null
    }
}

/** A URL without its fragment or trailing slash, to match a link to a source. */
const comparable = (url: URL): string =>
    `${url.origin}${url.pathname.replace(/\/+$/, '')}${url.search}`.toLowerCase()

const domainOf = (url: URL): string => url.hostname.replace(/^www\./, '')

/** "example.com/help/returns", the path cut short. */
export function shortUrl(url: URL): string {
    const path = url.pathname.replace(/\/+$/, '')
    const shown = path.length > PATH_MAX ? `${path.slice(0, PATH_MAX - 1)}…` : path
    return `${domainOf(url)}${shown}`
}

const isAutolink = (anchor: HTMLAnchorElement, url: URL): boolean => {
    const text = (anchor.textContent || '').trim().replace(/\/+$/, '')
    const href = (anchor.getAttribute('href') || '').trim().replace(/\/+$/, '')
    return !!text && (text === href || text === url.href.replace(/\/+$/, ''))
}

const span = (doc: Document, className: string, text: string): HTMLSpanElement => {
    const el = doc.createElement('span')
    el.className = className
    el.textContent = text
    return el
}

function decorateChip(anchor: HTMLAnchorElement, url: URL, source: AnswerSource | undefined) {
    const doc = anchor.ownerDocument
    anchor.textContent = ''
    anchor.classList.add('cm-link-chip')
    const tile = span(doc, 'cm-link-chip__tile', domainOf(url).charAt(0).toUpperCase())
    tile.setAttribute('aria-hidden', 'true')
    anchor.append(tile, span(doc, 'cm-link-chip__text', source?.title || shortUrl(url)))
}

/** The answer's links decorated for the panel, and its link card if it has one. */
export function decorateAnswerLinks(html: string, sources: AnswerSource[], options: LinkOptions): DecoratedAnswer {
    if (!html || !html.includes('<a')) return { html, card: null }
    const template = document.createElement('template')
    template.innerHTML = html
    const bySourceUrl = new Map<string, number>()
    sources.forEach((source, i) => {
        const url = webUrl(source.url || null)
        if (url && !bySourceUrl.has(comparable(url))) bySourceUrl.set(comparable(url), i)
    })
    const pages = new Set<string>()

    for (const anchor of Array.from(template.content.querySelectorAll('a'))) {
        const url = webUrl(anchor.getAttribute('href'))
        if (!url) continue
        pages.add(comparable(url))
        const index = bySourceUrl.get(comparable(url))
        const source = index === undefined ? undefined : sources[index]
        if (isAutolink(anchor, url)) decorateChip(anchor, url, source)
        else anchor.classList.add('cm-link')
        if (index !== undefined) {
            const cite = span(anchor.ownerDocument, 'cm-cite', String(index + 1))
            cite.setAttribute('aria-label', PANEL_COPY.sourceNumber(index + 1))
            anchor.append(cite)
        }
        if (options.sameTab && options.hostOrigin && url.origin === options.hostOrigin) {
            anchor.classList.add(SAME_SITE_LINK)
            anchor.removeAttribute('target')
        } else {
            anchor.append(span(anchor.ownerDocument, 'cm-sr-only', ` ${PANEL_COPY.opensInNewTab}`))
        }
    }

    const [only] = [...pages]
    const cardIndex = pages.size === 1 ? bySourceUrl.get(only) : undefined
    const card = cardIndex === undefined || !sources[cardIndex].title ? null : sources[cardIndex]
    return { html: template.innerHTML, card }
}

/** The page URL a same-site link click should open, or null to let the browser handle it. */
export function sameSiteTarget(event: MouseEvent): string | null {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return null
    }
    const anchor = (event.target as Element | null)?.closest?.('a')
    if (!anchor || !anchor.classList.contains(SAME_SITE_LINK)) return null
    return webUrl(anchor.getAttribute('href'))?.href ?? null
}
