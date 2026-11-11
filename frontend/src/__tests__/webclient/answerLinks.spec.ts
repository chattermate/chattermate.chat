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
import { decorateAnswerLinks, sameSiteTarget, shortUrl, SAME_SITE_LINK } from '@/webclient/answer-links'
import { renderMarkdown } from '@/webclient/markdown'

/**
 * Links in an answer for the redesigned panel: chips for bare URLs, inline links
 * as text, citation numbers, same-site links and the link card.
 */

const SOURCES = [
    { name: 'https://shop.example', type: 'website', url: 'https://shop.example/returns', title: 'Returns policy', description: 'Free for 30 days.' },
    { name: 'faq.pdf', type: 'file' },
]
const external = { hostOrigin: 'https://shop.example', sameTab: false }
const sameTab = { hostOrigin: 'https://shop.example', sameTab: true }

const parse = (html: string) => {
    const template = document.createElement('template')
    template.innerHTML = html
    return template.content
}

describe('decorateAnswerLinks', () => {
    it('turns a bare URL into a chip titled from its source, numbered as the source', () => {
        const { html } = decorateAnswerLinks(renderMarkdown('See https://shop.example/returns/'), SOURCES, external)
        const chip = parse(html).querySelector('a')!
        expect(chip.classList.contains('cm-link-chip')).toBe(true)
        expect(chip.querySelector('.cm-link-chip__text')!.textContent).toBe('Returns policy')
        expect(chip.querySelector('.cm-link-chip__tile')!.textContent).toBe('S')
        expect(chip.querySelector('.cm-cite')!.textContent).toBe('1')
        expect(chip.querySelector('.cm-cite')!.getAttribute('aria-label')).toBe('source 1')
    })

    it('shows the domain and a short path for a bare URL that is not a source', () => {
        const { html } = decorateAnswerLinks(renderMarkdown('Go to https://www.other.example/a/very/long/path/to/some/page'), SOURCES, external)
        expect(parse(html).querySelector('.cm-link-chip__text')!.textContent).toBe('other.example/a/very/long/path/to/so…')
    })

    it('keeps a written link inline, as text', () => {
        const { html } = decorateAnswerLinks(renderMarkdown('Read [our policy](https://other.example/p)'), SOURCES, external)
        const link = parse(html).querySelector('a')!
        expect(link.classList.contains('cm-link')).toBe(true)
        expect(link.textContent).toContain('our policy')
        expect(link.querySelector('.cm-cite')).toBeNull()
    })

    it('says an external link opens a new tab', () => {
        const { html } = decorateAnswerLinks(renderMarkdown('[x](https://other.example/p)'), SOURCES, sameTab)
        const link = parse(html).querySelector('a')!
        expect(link.getAttribute('target')).toBe('_blank')
        expect(link.querySelector('.cm-sr-only')!.textContent).toContain('(opens in a new tab)')
    })

    it('opens a same-site link in the page when the loader can', () => {
        const { html } = decorateAnswerLinks(renderMarkdown('[Cart](https://shop.example/cart)'), SOURCES, sameTab)
        const link = parse(html).querySelector('a')!
        expect(link.classList.contains(SAME_SITE_LINK)).toBe(true)
        expect(link.hasAttribute('target')).toBe(false)
        expect(link.querySelector('.cm-sr-only')).toBeNull()
    })

    it('keeps a same-site link in a new tab when the loader cannot navigate', () => {
        const { html } = decorateAnswerLinks(renderMarkdown('[Cart](https://shop.example/cart)'), SOURCES, external)
        expect(parse(html).querySelector('a')!.getAttribute('target')).toBe('_blank')
    })

    it('never lets a script link through (the sanitizer runs first)', () => {
        const { html } = decorateAnswerLinks(renderMarkdown('[x](javascript:alert(1)) and <a href="javascript:alert(2)">y</a>'), SOURCES, sameTab)
        expect(html).not.toContain('javascript:')
    })

    it('leaves mailto links alone', () => {
        const { html } = decorateAnswerLinks(renderMarkdown('[mail](mailto:help@shop.example)'), SOURCES, sameTab)
        const link = parse(html).querySelector('a')!
        expect(link.className).toBe('')
    })

    it('gives a card for the one page an answer links, when it is a titled source', () => {
        expect(decorateAnswerLinks(renderMarkdown('[Returns](https://shop.example/returns)'), SOURCES, external).card)
            .toEqual(SOURCES[0])
        expect(decorateAnswerLinks(renderMarkdown('[a](https://shop.example/returns) [b](https://x.example)'), SOURCES, external).card)
            .toBeNull()
        expect(decorateAnswerLinks(renderMarkdown('[a](https://x.example)'), SOURCES, external).card).toBeNull()
    })

    it('returns text without links as it was', () => {
        const html = renderMarkdown('No links here')
        expect(decorateAnswerLinks(html, SOURCES, sameTab)).toEqual({ html, card: null })
    })
})

describe('shortUrl', () => {
    it('drops www and a trailing slash', () => {
        expect(shortUrl(new URL('https://www.shop.example/help/'))).toBe('shop.example/help')
    })
})

describe('sameSiteTarget', () => {
    const click = (anchor: HTMLAnchorElement, init: MouseEventInit = {}) => {
        const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init })
        Object.defineProperty(event, 'target', { value: anchor.firstChild || anchor })
        return event
    }
    const link = (className: string) => {
        const a = document.createElement('a')
        a.href = 'https://shop.example/cart'
        a.className = className
        a.innerHTML = '<span>Cart</span>'
        return a
    }

    it('is the URL of a same-site link clicked plainly', () => {
        expect(sameSiteTarget(click(link(SAME_SITE_LINK)))).toBe('https://shop.example/cart')
    })

    it('leaves a modified click, and every other link, to the browser', () => {
        expect(sameSiteTarget(click(link(SAME_SITE_LINK), { metaKey: true }))).toBeNull()
        expect(sameSiteTarget(click(link('cm-link')))).toBeNull()
    })
})
